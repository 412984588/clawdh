#!/usr/bin/env python3
"""
Agent Health Monitor for Paperclip Runtime.

Checks:
1. Heartbeat liveness (flag agents with heartbeat age > 5min as stale)
2. Task pickup latency (time from assignment to checkout)
3. Pickup failure detection (assigned but not checked out within N heartbeats)

Usage:
    python scripts/agent_health_check.py [--json] [--threshold-seconds 300]

Environment:
    PAPERCLIP_API_URL - Paperclip API URL (default: http://127.0.0.1:3100)
    PAPERCLIP_API_KEY - API auth token
    PAPERCLIP_COMPANY_ID - Company ID
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------


@dataclass
class AgentHealth:
    """Health status for a single agent."""

    id: str
    name: str
    adapter_type: str
    status: str
    last_heartbeat: str | None
    heartbeat_age_sec: int | None
    is_stale: bool

    def to_dict(self) -> dict[str, object]:
        return {
            "id": self.id,
            "name": self.name,
            "adapter_type": self.adapter_type,
            "status": self.status,
            "last_heartbeat": self.last_heartbeat,
            "heartbeat_age_sec": self.heartbeat_age_sec,
            "is_stale": self.is_stale,
        }


# ---------------------------------------------------------------------------
# API helpers
# ---------------------------------------------------------------------------


def api_get(url: str, api_key: str) -> dict | list:
    """Make authenticated GET request to Paperclip API."""
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"API error for {url}: {e}", file=sys.stderr)
        return {} if "?" not in url else []


# ---------------------------------------------------------------------------
# Health checks
# ---------------------------------------------------------------------------


def is_agent_stale(agent: dict, now: datetime, threshold_sec: int = 300) -> bool:
    """Check if agent heartbeat is stale (older than threshold)."""
    last_hb = agent.get("lastHeartbeatAt")
    if not last_hb:
        return True
    try:
        hb_dt = datetime.fromisoformat(last_hb.replace("Z", "+00:00"))
        return (now - hb_dt).total_seconds() > threshold_sec
    except (ValueError, TypeError):
        return True


def check_agent_health(
    agents: list[dict],
    now: datetime,
    stale_threshold_sec: int = 300,
) -> list[AgentHealth]:
    """Check heartbeat liveness for all agents."""
    results: list[AgentHealth] = []

    for agent in agents:
        last_hb = agent.get("lastHeartbeatAt")
        hb_age_sec: int | None = None
        is_stale = is_agent_stale(agent, now, stale_threshold_sec)

        if last_hb:
            try:
                hb_dt = datetime.fromisoformat(last_hb.replace("Z", "+00:00"))
                hb_age_sec = int((now - hb_dt).total_seconds())
            except (ValueError, TypeError):
                pass

        results.append(
            AgentHealth(
                id=agent["id"],
                name=agent["name"],
                adapter_type=agent.get("adapterType", "unknown"),
                status=agent.get("status", "unknown"),
                last_heartbeat=last_hb,
                heartbeat_age_sec=hb_age_sec,
                is_stale=is_stale,
            )
        )

    return results


def check_task_pickup_latency(issues: list[dict], agents: list[dict]) -> list[dict]:
    """Check how long tasks have been waiting for pickup."""
    now = datetime.now(timezone.utc)
    agent_map = {a["id"]: a["name"] for a in agents}
    results: list[dict] = []

    for issue in issues:
        if issue.get("status") != "todo":
            continue

        assignee_id = issue.get("assigneeAgentId")
        if not assignee_id:
            continue

        created_at = issue.get("createdAt")
        if not created_at:
            continue

        try:
            created_dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            wait_sec = (now - created_dt).total_seconds()
        except (ValueError, TypeError):
            continue

        results.append(
            {
                "issue_id": issue["id"],
                "identifier": issue.get("identifier", "N/A"),
                "title": issue.get("title", "N/A")[:60],
                "assignee": agent_map.get(assignee_id, assignee_id),
                "assignee_id": assignee_id,
                "wait_sec": int(wait_sec),
                "wait_min": round(wait_sec / 60, 1),
                "priority": issue.get("priority", "medium"),
            }
        )

    return sorted(results, key=lambda x: x["wait_sec"], reverse=True)


def check_agent_protocol_compliance(
    agents: list[dict],
    recent_runs: list[dict],
    stale_threshold_sec: int = 300,
) -> list[dict]:
    """
    Detect agents that heartbeat but don't follow protocol.

    This detects the "alive but unconscious" pattern where agents:
    - Heartbeat regularly (show as running)
    - But never check out assigned tasks
    - Have no files_touched in their runs

    See runbook 0021 for the claude_local adapter instructions injection failure.
    """
    now = datetime.now(timezone.utc)
    non_compliant: list[dict] = []

    for agent in agents:
        agent_id = agent["id"]
        agent_name = agent["name"]
        adapter_type = agent.get("adapterType", "unknown")
        issues: list[str] = []

        # Get runs for this agent
        agent_runs = [r for r in recent_runs if r.get("agent") == agent_id]

        # Check if agent is heartbeating (has recent runs)
        running_runs = [r for r in agent_runs if r.get("status") in ("in_progress", "running")]

        if not running_runs:
            continue  # Agent isn't running, skip

        # Check for runs with no files touched
        for run in running_runs:
            files_touched = run.get("filesTouched", [])
            started_at = run.get("startedAt")

            if not files_touched and started_at:
                try:
                    started_dt = datetime.fromisoformat(started_at.replace("Z", "+00:00"))
                    run_age_sec = (now - started_dt).total_seconds()

                    # Only flag if run has been going for more than 1 heartbeat cycle
                    if run_age_sec > stale_threshold_sec:
                        issues.append(
                            f"Run {run.get('id', 'unknown')} running {round(run_age_sec / 60, 1)}min "
                            f"with no files touched"
                        )
                except (ValueError, TypeError):
                    pass

        # Check for heartbeat without task checkout pattern
        # Agent heartbeats but tasks assigned to them stay in "todo"
        if issues:
            non_compliant.append(
                {
                    "agent_id": agent_id,
                    "agent_name": agent_name,
                    "adapter_type": adapter_type,
                    "compliant": False,
                    "issues": issues,
                    "severity": "critical" if adapter_type == "claude_local" else "warning",
                }
            )

    return non_compliant


# ---------------------------------------------------------------------------
# Report printing
# ---------------------------------------------------------------------------


def _print_report(report: dict) -> None:
    """Print human-readable report."""
    print("=" * 70)
    print(f"AGENT HEALTH REPORT - {report['timestamp']}")
    print("=" * 70)

    d = report["dashboard"]
    print(f"\n📊 Dashboard:")
    print(f"   Agents: {d['agents'].get('running', 0)} running, {d['agents'].get('active', 0)} active")
    print(
        f"   Tasks:  {d['tasks'].get('open', 0)} open, "
        f"{d['tasks'].get('inProgress', 0)} in progress, "
        f"{d['tasks'].get('blocked', 0)} blocked"
    )
    print(f"   Costs:  ${d['costs_cents'] / 100:.2f} this month")

    if report["stale_agents"]:
        print(f"\n⚠️  STALE AGENTS ({len(report['stale_agents'])}):")
        for a in report["stale_agents"]:
            print(f"   - {a['name']} ({a['adapter']}): last heartbeat {a['age_minutes']}min ago")
    else:
        print(f"\n✅ All agents have fresh heartbeats")

    if report["pickup_delays"]:
        print(f"\n🐌 TASK PICKUP DELAYS ({len(report['pickup_delays'])}):")
        for t in report["pickup_delays"]:
            print(f"   - [{t['priority'].upper()}] {t['identifier']}: {t['title']}")
            print(f"     Assigned to: {t['assignee']}, Waiting: {t['wait_min']}min")
    else:
        print(f"\n✅ No task pickup delays")

    if report.get("non_compliant_agents"):
        print(f"\n🔴 PROTOCOL NON-COMPLIANCE ({len(report['non_compliant_agents'])}):")
        for nc in report["non_compliant_agents"]:
            print(f"   - {nc['agent_name']} ({nc['adapter_type']}):")
            for issue in nc["issues"]:
                print(f"     • {issue}")
            print(f"     See: docs/runbooks/0021-claude-local-adapter-instructions.md")

    if report["alerts"]:
        print(f"\n🚨 ALERTS ({len(report['alerts'])}):")
        for a in report["alerts"]:
            icon = "🔴" if a["level"] == "critical" else "🟡"
            print(f"   {icon} {a['message']}")
    else:
        print(f"\n✅ No alerts")

    print("\n" + "=" * 70)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> int:
    """Run full health check and output report."""
    parser = argparse.ArgumentParser(description="Agent Health Monitor")
    parser.add_argument("--json", action="store_true", help="Output JSON format")
    parser.add_argument(
        "--threshold",
        type=int,
        default=300,
        help="Stale threshold in seconds (default: 300)",
    )
    parser.add_argument(
        "--pickup-threshold",
        type=int,
        default=300,
        help="Pickup delay threshold in seconds (default: 300)",
    )
    parser.add_argument(
        "--protocol-check",
        action="store_true",
        help="Enable protocol compliance checking (detect heartbeating but non-functional agents)",
    )
    args = parser.parse_args()

    api_url = os.environ.get("PAPERCLIP_API_URL", "http://127.0.0.1:3100")
    api_key = os.environ.get("PAPERCLIP_API_KEY", "")
    company_id = os.environ.get("PAPERCLIP_COMPANY_ID", "")

    if not api_key or not company_id:
        print(
            "ERROR: PAPERCLIP_API_KEY and PAPERCLIP_COMPANY_ID must be set",
            file=sys.stderr,
        )
        return 1

    headers = {"Authorization": f"Bearer {api_key}"}

    def fetch(path: str) -> dict | list:
        req = urllib.request.Request(f"{api_url}{path}", headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())

    # Fetch data
    agents = fetch(f"/api/companies/{company_id}/agents")
    issues = fetch(f"/api/companies/{company_id}/issues?status=todo,in_progress,blocked")
    dashboard = fetch(f"/api/companies/{company_id}/dashboard")

    # Fetch runs data if protocol check is enabled
    runs: list[dict] = []
    if args.protocol_check:
        try:
            runs_resp = fetch(f"/api/companies/{company_id}/runs?status=in_progress,running")
            runs = runs_resp if isinstance(runs_resp, list) else []
        except Exception:
            pass  # Runs endpoint may not exist in all Paperclip versions

    now = datetime.now(timezone.utc)
    now_iso = now.strftime("%Y-%m-%dT%H:%M:%SZ")

    # Run checks using the same is_agent_stale function
    stale_agents = []
    if isinstance(agents, list):
        for agent in agents:
            if is_agent_stale(agent, now, args.threshold):
                last_hb = agent.get("lastHeartbeatAt")
                age_min: float | str = "unknown"
                if last_hb:
                    try:
                        hb_dt = datetime.fromisoformat(last_hb.replace("Z", "+00:00"))
                        age_min = round((now - hb_dt).total_seconds() / 60, 1)
                    except (ValueError, TypeError):
                        pass
                stale_agents.append(
                    {
                        "name": agent["name"],
                        "id": agent["id"],
                        "adapter": agent.get("adapterType", "?"),
                        "status": agent.get("status", "?"),
                        "last_heartbeat": last_hb or "never",
                        "age_minutes": age_min,
                    }
                )

    pickup_delays = check_task_pickup_latency(
        issues if isinstance(issues, list) else [],
        agents if isinstance(agents, list) else [],
    )
    late_pickups = [p for p in pickup_delays if p["wait_sec"] > args.pickup_threshold]

    # Build alerts
    alerts: list[dict] = []

    for agent in stale_agents:
        alerts.append(
            {
                "level": "warning",
                "type": "stale_heartbeat",
                "agent": agent["name"],
                "message": f"Heartbeat stale ({agent['age_minutes']}min ago)",
            }
        )

    for issue in late_pickups:
        level = "critical" if issue["wait_min"] > 15 else "warning"
        alerts.append(
            {
                "level": level,
                "type": "task_pickup_delay",
                "issue": issue["identifier"],
                "assignee": issue["assignee"],
                "message": f"[{issue['priority'].upper()}] {issue['title']} waiting {issue['wait_min']}min",
            }
        )

    # Protocol compliance check (detect "alive but unconscious" agents)
    non_compliant_agents: list[dict] = []
    if args.protocol_check and isinstance(agents, list):
        non_compliant_agents = check_agent_protocol_compliance(
            agents,
            runs,
            stale_threshold_sec=args.threshold,
        )
        for nc in non_compliant_agents:
            for issue in nc["issues"]:
                alerts.append(
                    {
                        "level": nc["severity"],
                        "type": "protocol_non_compliance",
                        "agent": nc["agent_name"],
                        "adapter": nc["adapter_type"],
                        "message": f"[{nc['adapter_type']}] {nc['agent_name']}: {issue}",
                    }
                )

    # Build report
    report = {
        "timestamp": now_iso,
        "company_id": company_id,
        "dashboard": {
            "agents": dashboard.get("agents", {}) if isinstance(dashboard, dict) else {},
            "tasks": dashboard.get("tasks", {}) if isinstance(dashboard, dict) else {},
            "costs_cents": (
                dashboard.get("costs", {}).get("monthSpendCents", 0)
                if isinstance(dashboard, dict)
                else 0
            ),
        },
        "stale_agents": stale_agents,
        "pickup_delays": late_pickups,
        "non_compliant_agents": non_compliant_agents if args.protocol_check else [],
        "protocol_check_enabled": args.protocol_check,
        "alerts": alerts,
    }

    if args.json:
        print(json.dumps(report, indent=2, default=str, ensure_ascii=False))
    else:
        _print_report(report)

    return 1 if alerts else 0


if __name__ == "__main__":
    exit(main())

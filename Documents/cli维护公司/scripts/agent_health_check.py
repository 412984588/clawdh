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

import argparse
import json
import os
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


@dataclass
class AgentHealth:
    id: str
    name: str
    adapter_type: str
    status: str
    last_heartbeat_at: str | None
    heartbeat_age_seconds: float | None = None
    is_stale: bool = False
    issues: list[str] = field(default_factory=list)


@dataclass
class TaskPickup:
    issue_id: str
    identifier: str
    title: str
    assignee_id: str
    assignee_name: str
    created_at: str
    assigned_at: str | None
    checkout_at: str | None
    pickup_latency_seconds: float | None = None
    is_late: bool = False
    heartbeats_since_assignment: int | None = None


@dataclass
class HealthReport:
    timestamp: str
    company_id: str
    agents: list[AgentHealth] = field(default_factory=list)
    task_pickups: list[TaskPickup] = field(default_factory=list)
    summary: dict[str, Any] = field(default_factory=dict)


def api_get(url: str, api_key: str) -> dict | list:
    """Make authenticated GET request to Paperclip API."""
    req = Request(url, headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    })
    try:
        with urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"API error for {url}: {e}")
        return {} if "?" not in url else []


def check_agent_health(
    agents: list[dict],
    now_iso: str,
    stale_threshold_sec: int = 300,
) -> list[AgentHealth]:
    """Check heartbeat liveness for all agents."""
    from datetime import datetime, timezone

    now = datetime.fromisoformat(now_iso.replace("Z", "+00:00"))
    results = []

    for agent in agents:
        last_hb = agent.get("lastHeartbeatAt")
        hb_age_sec = None
        is_stale = False

        if last_hb:
            hb_dt = datetime.fromisoformat(last_hb.replace("Z", "+00:00"))
            hb_age_sec = (now - hb_dt).total_seconds()
            is_stale = hb_age_sec > 300  # 5 minutes

        results.append(HealthAgent(
            id=agent["id"],
            name=agent["name"],
            adapter_type=agent.get("adapterType", "unknown"),
            status=agent.get("status", "unknown"),
            last_heartbeat=last_hb,
            heartbeat_age_sec=int(hb_age_sec) if hb_age_sec else None,
            is_stale=is_stale,
        ))

    return results


def check_task_pickup_latency(issues: list[dict], agents: list[dict]) -> list[dict]:
    """Check how long tasks have been waiting for pickup."""
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)
    agent_map = {a["id"]: a["name"] for a in agents}
    results = []

    for issue in issues:
        if issue.get("status") != "todo":
            continue

        assignee_id = issue.get("assigneeAgentId")
        if not assignee_id:
            continue

        created_at = issue.get("createdAt")
        if not created_at:
            continue

        created_dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        wait_sec = (now - created_dt).total_seconds()

        results.append({
            "issue_id": issue["id"],
            "identifier": issue.get("identifier", "N/A"),
            "title": issue.get("title", "N/A")[:60],
            "assignee": agent_map.get(assignee_id, assignee_id),
            "assignee_id": assignee_id,
            "wait_sec": int(wait_sec),
            "wait_min": round(wait_sec / 60, 1),
            "priority": issue.get("priority", "medium"),
        })

    return sorted(results, key=lambda x: x["wait_sec"], reverse=True)


# Dataclasses for structured output
from dataclasses import dataclass

@dataclass
class HealthAgent:
    id: str
    name: str
    adapter_type: str
    status: str
    last_heartbeat: str | None
    heartbeat_age_sec: int | None
    is_stale: bool

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "adapter_type": self.adapter_type,
            "status": self.status,
            "last_heartbeat": self.last_heartbeat,
            "heartbeat_age_sec": self.heartbeat_age_sec,
            "is_stale": self.is_stale,
        }


def main():
    """Run full health check and output report."""
    import os
    import json
    import urllib.request
    import argparse

    parser = argparse.ArgumentParser(description="Agent Health Monitor")
    parser.add_argument("--json", action="store_true", help="Output JSON format")
    parser.add_argument("--threshold", type=int, default=300, help="Stale threshold in seconds (default: 300)")
    parser.add_argument("--pickup-threshold", type=int, default=300, help="Pickup delay threshold in seconds (default: 300)")
    args = parser.parse_args()

    api_url = os.environ.get("PAPERCLIP_API_URL", "http://127.0.0.1:3100")
    api_key = os.environ.get("PAPERCLIP_API_KEY", "")
    company_id = os.environ.get("PAPERCLIP_COMPANY_ID", "")

    if not api_key or not company_id:
        print("ERROR: PAPERCLIP_API_KEY and PAPERCLIP_COMPANY_ID must be set", file=sys.stderr)
        return 1

    headers = {"Authorization": f"Bearer {api_key}"}

    def fetch(path):
        req = urllib.request.Request(f"{api_url}{path}", headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())

    # Fetch data
    agents = fetch(f"/api/companies/{company_id}/agents")
    issues = fetch(f"/api/companies/{company_id}/issues?status=todo,in_progress,blocked")
    dashboard = fetch(f"/api/companies/{company_id}/dashboard")

    now = datetime.now(timezone.utc)
    now_iso = now.strftime("%Y-%m-%dT%H:%M:%SZ")

    # Run checks
    stale_agents = []
    for agent in agents:
        if _is_stale(agent, now_iso, args.threshold):
            last_hb = agent.get("lastHeartbeatAt", "never")
            hb_dt = datetime.fromisoformat(last_hb.replace("Z", "+00:00")) if last_hb != "never" else None
            age_min = round((now - hb_dt).total_seconds() / 60, 1) if hb_dt else "unknown"
            stale_agents.append({
                "name": agent["name"],
                "id": agent["id"],
                "adapter": agent.get("adapterType", "?"),
                "status": agent.get("status", "?"),
                "last_heartbeat": last_hb,
                "age_minutes": age_min,
            })

    pickup_delays = check_task_pickup_latency(issues, agents)
    late_pickups = [p for p in pickup_delays if p["wait_sec"] > args.pickup_threshold]

    # Build report
    alerts = []

    for agent in stale_agents:
        alerts.append({
            "level": "warning",
            "type": "stale_heartbeat",
            "agent": agent["name"],
            "message": f"Heartbeat stale ({agent['age_minutes']}min ago)",
        })

    for issue in late_pickups:
        level = "critical" if issue["wait_min"] > 15 else "warning"
        alerts.append({
            "level": level,
            "type": "task_pickup_delay",
            "issue": issue["identifier"],
            "assignee": issue["assignee"],
            "message": f"[{issue['priority'].upper()}] {issue['title']} waiting {issue['wait_min']}min",
        })

    report = {
        "timestamp": now_iso,
        "company_id": company_id,
        "dashboard": {
            "agents": dashboard.get("agents", {}),
            "tasks": dashboard.get("tasks", {}),
            "costs_cents": dashboard.get("costs", {}).get("monthSpendCents", 0),
        },
        "stale_agents": stale_agents,
        "pickup_delays": late_pickups,
        "alerts": alerts,
    }

    if args.json:
        print(json.dumps(report, indent=2, default=str, ensure_ascii=False))
    else:
        _print_report(report)

    return 1 if alerts else 0


def _print_report(report: dict) -> None:
    """Print human-readable report."""
    print("=" * 70)
    print(f"AGENT HEALTH REPORT - {report['timestamp']}")
    print("=" * 70)

    d = report["dashboard"]
    print(f"\n📊 Dashboard:")
    print(f"   Agents: {d['agents'].get('running', 0)} running, {d['agents'].get('active', 0)} active")
    print(f"   Tasks:  {d['tasks'].get('open', 0)} open, {d['tasks'].get('inProgress', 0)} in progress, {d['tasks'].get('blocked', 0)} blocked")
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

    if report["alerts"]:
        print(f"\n🚨 ALERTS ({len(report['alerts'])}):")
        for a in report["alerts"]:
            icon = "🔴" if a["level"] == "critical" else "🟡"
            print(f"   {icon} {a['message']}")
    else:
        print(f"\n✅ No alerts")

    print("\n" + "=" * 70)


def _is_stale(agent: dict, now_iso: str, threshold_sec: int = 300) -> bool:
    """Check if agent heartbeat is stale (older than threshold)."""
    last_hb = agent.get("lastHeartbeatAt")
    if not last_hb:
        return True
    now = datetime.fromisoformat(now_iso.replace("Z", "+00:00"))
    hb_dt = datetime.fromisoformat(last_hb.replace("Z", "+00:00"))
    return (now - hb_dt).total_seconds() > threshold_sec


if __name__ == "__main__":
    exit(main())

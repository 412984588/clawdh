"""Socratic Hints Service for Agent Guidance.

Implements progressive hint generation for CLI agents:
- Level 1: Point to relevant documentation (doc_link)
- Level 2: Show similar solved examples (example)
- Level 3: Suggest specific approach (approach)
- Final: Direct answer (only after hints exhausted)

Triggered when error persists after 3 retry attempts.
Uses context similarity scoring to match error patterns.
"""

from __future__ import annotations

import json
import sqlite3
import time
from datetime import UTC, datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums and Models
# ---------------------------------------------------------------------------


class HintLevel(int, Enum):
    """Progressive hint levels for socratic guidance."""

    DOC_LINK = 1  # Point to relevant documentation
    EXAMPLE = 2  # Show similar solved examples
    APPROACH = 3  # Suggest specific approach
    DIRECT = 4  # Direct answer (final)


class HintType(str, Enum):
    """Type of hint content."""

    DOC_LINK = "doc_link"
    EXAMPLE = "example"
    APPROACH = "approach"
    DIRECT = "direct"


class HintRequest(BaseModel):
    """Request for a socratic hint."""

    agent_id: str
    run_id: str
    error_type: str
    error_message: str
    error_context: dict[str, Any] | None = None
    retry_count: int = Field(default=0, ge=0)
    task_description: str | None = None
    agent_role: str | None = None
    previous_hints: list[str] | None = None


class Hint(BaseModel):
    """A single hint response."""

    hint_id: str
    level: HintLevel
    type: HintType
    content: str
    relevance_score: float = Field(ge=0.0, le=1.0)
    related_docs: list[str] | None = None
    related_examples: list[str] | None = None
    created_at: str


class HintResponse(BaseModel):
    """Response containing progressive hints."""

    request_id: str
    agent_id: str
    hints: list[Hint]
    current_level: HintLevel
    can_escalate: bool  # True if more hints available
    recommended_action: str
    generated_at: str


class HintHistoryEntry(BaseModel):
    """Historical record of hint usage."""

    entry_id: str
    agent_id: str
    run_id: str
    error_type: str
    hint_level: int
    hint_type: str
    was_helpful: bool | None = None  # Feedback from agent
    resolved_issue: bool | None = None  # Did hint resolve the issue?
    created_at: str


class HintKnowledgeBase(BaseModel):
    """Knowledge base entry for hint matching."""

    entry_id: str
    error_pattern: str  # Regex pattern to match errors
    error_category: str  # e.g., "auth", "network", "config", "logic"
    doc_links: list[str]
    examples: list[dict[str, str]]  # {"description": "...", "solution": "..."}
    approaches: list[str]
    direct_answer: str | None = None
    tags: list[str] | None = None


# ---------------------------------------------------------------------------
# Database Schema
# ---------------------------------------------------------------------------


HINT_SCHEMA = """
-- Hint history for tracking usage and effectiveness
CREATE TABLE IF NOT EXISTS hint_history (
    entry_id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    run_id TEXT NOT NULL,
    error_type TEXT NOT NULL,
    error_message TEXT,
    hint_level INTEGER NOT NULL,
    hint_type TEXT NOT NULL,
    hint_content TEXT NOT NULL,
    relevance_score REAL,
    was_helpful INTEGER,  -- NULL = no feedback, 0 = no, 1 = yes
    resolved_issue INTEGER,  -- NULL = unknown, 0 = no, 1 = yes
    created_at TEXT NOT NULL
);

-- Knowledge base for hint generation
CREATE TABLE IF NOT EXISTS hint_knowledge (
    entry_id TEXT PRIMARY KEY,
    error_pattern TEXT NOT NULL,
    error_category TEXT NOT NULL,
    doc_links TEXT,  -- JSON array
    examples TEXT,  -- JSON array
    approaches TEXT,  -- JSON array
    direct_answer TEXT,
    tags TEXT,  -- JSON array
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Error tracking for retry detection
CREATE TABLE IF NOT EXISTS error_tracking (
    tracking_id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    run_id TEXT NOT NULL,
    error_type TEXT NOT NULL,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    first_seen_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    resolved_at TEXT,
    UNIQUE(agent_id, run_id, error_type)
);

CREATE INDEX IF NOT EXISTS idx_hint_history_agent ON hint_history(agent_id);
CREATE INDEX IF NOT EXISTS idx_hint_history_run ON hint_history(run_id);
CREATE INDEX IF NOT EXISTS idx_error_tracking_agent ON error_tracking(agent_id);
CREATE INDEX IF NOT EXISTS idx_error_tracking_run ON error_tracking(run_id);
CREATE INDEX IF NOT EXISTS idx_hint_knowledge_pattern ON hint_knowledge(error_pattern);
"""


# ---------------------------------------------------------------------------
# Knowledge Base Seed Data
# ---------------------------------------------------------------------------


DEFAULT_KNOWLEDGE_ENTRIES: list[dict[str, Any]] = [
    {
        "entry_id": "kb-auth-001",
        "error_pattern": "(?i)(authentication|auth|unauthorized|401|forbidden|403)",
        "error_category": "auth",
        "doc_links": [
            "https://docs.anthropic.com/en/docs/initial-setup",
            "https://docs.anthropic.com/en/api/authentication",
        ],
        "examples": [
            {
                "description": "Missing API key in environment",
                "solution": "Set ANTHROPIC_API_KEY environment variable or add to .env file",
            },
            {
                "description": "Expired token",
                "solution": "Refresh authentication token or re-login to provider",
            },
        ],
        "approaches": [
            "Check if API key is set in environment variables",
            "Verify token hasn't expired",
            "Ensure correct permissions for the operation",
        ],
        "direct_answer": "Authentication failed. Verify your API key/token is valid and has correct permissions.",
        "tags": ["auth", "api", "security"],
    },
    {
        "entry_id": "kb-network-001",
        "error_pattern": "(?i)(network|connection|timeout|econnrefused|enotfound|socket)",
        "error_category": "network",
        "doc_links": [
            "https://docs.anthropic.com/en/api/errors",
        ],
        "examples": [
            {
                "description": "Connection timeout to API",
                "solution": "Check network connectivity, increase timeout, or use retry with backoff",
            },
            {
                "description": "DNS resolution failure",
                "solution": "Verify DNS settings or use IP address directly",
            },
        ],
        "approaches": [
            "Implement exponential backoff for retries",
            "Check firewall and proxy settings",
            "Verify network connectivity with ping/curl",
        ],
        "direct_answer": "Network error. Check connectivity and retry with exponential backoff.",
        "tags": ["network", "connectivity", "timeout"],
    },
    {
        "entry_id": "kb-config-001",
        "error_pattern": "(?i)(config|configuration|env|environment|missing.*variable|invalid.*setting)",
        "error_category": "config",
        "doc_links": [
            "https://docs.anthropic.com/en/docs/initial-setup",
        ],
        "examples": [
            {
                "description": "Missing required environment variable",
                "solution": "Add the required variable to .env file or export it",
            },
            {
                "description": "Invalid configuration value",
                "solution": "Check configuration schema and correct the value",
            },
        ],
        "approaches": [
            "Check .env file for required variables",
            "Validate configuration against schema",
            "Use default values where appropriate",
        ],
        "direct_answer": "Configuration error. Verify all required settings are present and valid.",
        "tags": ["config", "env", "setup"],
    },
    {
        "entry_id": "kb-rate-limit-001",
        "error_pattern": "(?i)(rate.?limit|too.?many|429|quota|throttle)",
        "error_category": "rate_limit",
        "doc_links": [
            "https://docs.anthropic.com/en/api/rate-limits",
        ],
        "examples": [
            {
                "description": "API rate limit exceeded",
                "solution": "Implement request queuing with exponential backoff",
            },
            {
                "description": "Concurrent request limit hit",
                "solution": "Reduce parallelism or implement request pooling",
            },
        ],
        "approaches": [
            "Implement request queuing",
            "Add delay between requests",
            "Monitor rate limit headers",
        ],
        "direct_answer": "Rate limit exceeded. Reduce request frequency and implement backoff.",
        "tags": ["rate-limit", "throttle", "api"],
    },
    {
        "entry_id": "kb-type-001",
        "error_pattern": "(?i)(type.?error|typeerror|invalid.*type|expected.*got|cannot.*convert)",
        "error_category": "type_error",
        "doc_links": [
            "https://docs.python.org/3/library/typing.html",
            "https://www.typescriptlang.org/docs/handbook/2/types-from-extraction.html",
        ],
        "examples": [
            {
                "description": "Type mismatch in function argument",
                "solution": "Add type guards or validation before function call",
            },
            {
                "description": "None/null passed where value expected",
                "solution": "Add null check or use optional chaining",
            },
        ],
        "approaches": [
            "Add type validation at function boundaries",
            "Use type guards for runtime checks",
            "Enable strict type checking",
        ],
        "direct_answer": "Type error. Validate input types and add appropriate type guards.",
        "tags": ["type", "validation", "typescript", "python"],
    },
    {
        "entry_id": "kb-file-001",
        "error_pattern": "(?i)(file.*not.*found|enoent|no.*such.*file|cannot.*read|permission.*denied)",
        "error_category": "file_error",
        "doc_links": [
            "https://nodejs.org/api/fs.html",
            "https://docs.python.org/3/library/os.html",
        ],
        "examples": [
            {
                "description": "File not found",
                "solution": "Verify file path and check if file exists before reading",
            },
            {
                "description": "Permission denied",
                "solution": "Check file permissions or run with appropriate privileges",
            },
        ],
        "approaches": [
            "Check file exists before operations",
            "Use absolute paths or resolve relative paths",
            "Verify file permissions",
        ],
        "direct_answer": "File error. Verify path exists and has correct permissions.",
        "tags": ["file", "io", "filesystem"],
    },
]


# ---------------------------------------------------------------------------
# Core Functions
# ---------------------------------------------------------------------------


def init_hint_tables(conn: sqlite3.Connection) -> None:
    """Initialize hint-related tables."""
    cursor = conn.cursor()
    cursor.executescript(HINT_SCHEMA)

    # Seed default knowledge entries if empty
    cursor.execute("SELECT COUNT(*) FROM hint_knowledge")
    if cursor.fetchone()[0] == 0:
        for entry in DEFAULT_KNOWLEDGE_ENTRIES:
            cursor.execute(
                """
                INSERT INTO hint_knowledge (
                    entry_id, error_pattern, error_category,
                    doc_links, examples, approaches, direct_answer, tags,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    entry["entry_id"],
                    entry["error_pattern"],
                    entry["error_category"],
                    json.dumps(entry["doc_links"]),
                    json.dumps(entry["examples"]),
                    json.dumps(entry["approaches"]),
                    entry["direct_answer"],
                    json.dumps(entry.get("tags", [])),
                    datetime.now(UTC).isoformat(),
                    datetime.now(UTC).isoformat(),
                ),
            )
    conn.commit()


def track_error(
    conn: sqlite3.Connection,
    agent_id: str,
    run_id: str,
    error_type: str,
    error_message: str,
) -> int:
    """Track an error occurrence and return the retry count."""
    import uuid

    cursor = conn.cursor()
    now = datetime.now(UTC).isoformat()

    # Try to update existing tracking entry
    cursor.execute(
        """
        UPDATE error_tracking
        SET retry_count = retry_count + 1, last_seen_at = ?
        WHERE agent_id = ? AND run_id = ? AND error_type = ?
        """,
        (now, agent_id, run_id, error_type),
    )

    if cursor.rowcount == 0:
        # Create new tracking entry
        cursor.execute(
            """
            INSERT INTO error_tracking (
                tracking_id, agent_id, run_id, error_type, error_message,
                retry_count, first_seen_at, last_seen_at
            ) VALUES (?, ?, ?, ?, ?, 1, ?, ?)
            """,
            (
                f"et-{uuid.uuid4().hex[:12]}",
                agent_id,
                run_id,
                error_type,
                error_message,
                now,
                now,
            ),
        )
        conn.commit()
        return 1

    conn.commit()

    # Get current retry count
    cursor.execute(
        """
        SELECT retry_count FROM error_tracking
        WHERE agent_id = ? AND run_id = ? AND error_type = ?
        """,
        (agent_id, run_id, error_type),
    )
    row = cursor.fetchone()
    return row[0] if row else 0


def resolve_error(
    conn: sqlite3.Connection,
    agent_id: str,
    run_id: str,
    error_type: str,
) -> None:
    """Mark an error as resolved."""
    cursor = conn.cursor()
    now = datetime.now(UTC).isoformat()
    cursor.execute(
        """
        UPDATE error_tracking
        SET resolved_at = ?
        WHERE agent_id = ? AND run_id = ? AND error_type = ?
        """,
        (now, agent_id, run_id, error_type),
    )
    conn.commit()


def calculate_relevance_score(
    error_message: str,
    error_context: dict[str, Any] | None,
    agent_role: str | None,
    knowledge_entry: dict[str, Any],
) -> float:
    """Calculate relevance score for a knowledge base entry."""
    import re

    score = 0.0

    # Pattern match score (0.0-0.4)
    try:
        pattern = knowledge_entry["error_pattern"]
        if re.search(pattern, error_message, re.IGNORECASE):
            score += 0.4
    except re.error:
        pass

    # Context similarity (0.0-0.3)
    if error_context:
        tags = knowledge_entry.get("tags", [])
        if isinstance(tags, str):
            tags = json.loads(tags)

        context_str = json.dumps(error_context).lower()
        matching_tags = sum(1 for tag in tags if tag.lower() in context_str)
        if tags:
            score += 0.3 * (matching_tags / len(tags))

    # Agent role relevance (0.0-0.3)
    if agent_role:
        error_category = knowledge_entry.get("error_category", "")
        role_category_map = {
            "engineer": ["type_error", "config", "file_error"],
            "researcher": ["network", "rate_limit"],
            "qa": ["type_error", "config"],
        }
        relevant_categories = role_category_map.get(agent_role, [])
        if error_category in relevant_categories:
            score += 0.3

    return min(1.0, score)


def find_matching_knowledge(
    conn: sqlite3.Connection,
    error_message: str,
    error_context: dict[str, Any] | None,
    agent_role: str | None,
    min_score: float = 0.3,
) -> list[tuple[dict[str, Any], float]]:
    """Find knowledge base entries matching the error."""
    import re

    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT entry_id, error_pattern, error_category,
               doc_links, examples, approaches, direct_answer, tags
        FROM hint_knowledge
        """
    )

    matches = []
    for row in cursor.fetchall():
        entry = {
            "entry_id": row[0],
            "error_pattern": row[1],
            "error_category": row[2],
            "doc_links": json.loads(row[3]) if row[3] else [],
            "examples": json.loads(row[4]) if row[4] else [],
            "approaches": json.loads(row[5]) if row[5] else [],
            "direct_answer": row[6],
            "tags": json.loads(row[7]) if row[7] else [],
        }

        # Quick pattern check first
        try:
            if not re.search(entry["error_pattern"], error_message, re.IGNORECASE):
                continue
        except re.error:
            continue

        # Calculate full relevance score
        score = calculate_relevance_score(error_message, error_context, agent_role, entry)

        if score >= min_score:
            matches.append((entry, score))

    # Sort by relevance score descending
    matches.sort(key=lambda x: x[1], reverse=True)
    return matches


def generate_hints(
    conn: sqlite3.Connection,
    request: HintRequest,
) -> HintResponse:
    """Generate progressive hints for an error."""
    import uuid

    # Track the error
    retry_count = track_error(
        conn,
        request.agent_id,
        request.run_id,
        request.error_type,
        request.error_message,
    )

    # Determine hint level based on retry count
    # Level 1 at retry 3, Level 2 at retry 5, Level 3 at retry 7, Direct at retry 9+
    if retry_count >= 9:
        current_level = HintLevel.DIRECT
    elif retry_count >= 7:
        current_level = HintLevel.APPROACH
    elif retry_count >= 5:
        current_level = HintLevel.EXAMPLE
    else:
        current_level = HintLevel.DOC_LINK

    # Find matching knowledge
    matches = find_matching_knowledge(
        conn,
        request.error_message,
        request.error_context,
        request.agent_role,
    )

    request_id = f"hr-{uuid.uuid4().hex[:12]}"
    now = datetime.now(UTC).isoformat()
    hints: list[Hint] = []

    if not matches:
        # No matching knowledge - provide generic hints
        hints.append(
            Hint(
                hint_id=f"h-{uuid.uuid4().hex[:12]}",
                level=current_level,
                type=HintType.DOC_LINK,
                content="No specific documentation found. Check the error logs for details.",
                relevance_score=0.0,
                created_at=now,
            )
        )

        return HintResponse(
            request_id=request_id,
            agent_id=request.agent_id,
            hints=hints,
            current_level=current_level,
            can_escalate=current_level < HintLevel.DIRECT,
            recommended_action="Review error details and consult documentation",
            generated_at=now,
        )

    # Generate hints based on current level
    best_match, best_score = matches[0]

    # Always include doc_link hint (Level 1)
    if best_match["doc_links"] and current_level >= HintLevel.DOC_LINK:
        for doc_link in best_match["doc_links"][:2]:
            hints.append(
                Hint(
                    hint_id=f"h-{uuid.uuid4().hex[:12]}",
                    level=HintLevel.DOC_LINK,
                    type=HintType.DOC_LINK,
                    content=f"See documentation: {doc_link}",
                    relevance_score=best_score,
                    related_docs=best_match["doc_links"],
                    created_at=now,
                )
            )

    # Add example hint (Level 2)
    if best_match["examples"] and current_level >= HintLevel.EXAMPLE:
        for example in best_match["examples"][:1]:
            hints.append(
                Hint(
                    hint_id=f"h-{uuid.uuid4().hex[:12]}",
                    level=HintLevel.EXAMPLE,
                    type=HintType.EXAMPLE,
                    content=f"Similar case: {example['description']}\nSolution: {example['solution']}",
                    relevance_score=best_score * 0.95,
                    created_at=now,
                )
            )

    # Add approach hint (Level 3)
    if best_match["approaches"] and current_level >= HintLevel.APPROACH:
        for approach in best_match["approaches"][:1]:
            hints.append(
                Hint(
                    hint_id=f"h-{uuid.uuid4().hex[:12]}",
                    level=HintLevel.APPROACH,
                    type=HintType.APPROACH,
                    content=f"Suggested approach: {approach}",
                    relevance_score=best_score * 0.9,
                    created_at=now,
                )
            )

    # Add direct answer (Level 4)
    if best_match["direct_answer"] and current_level >= HintLevel.DIRECT:
        hints.append(
            Hint(
                hint_id=f"h-{uuid.uuid4().hex[:12]}",
                level=HintLevel.DIRECT,
                type=HintType.DIRECT,
                content=best_match["direct_answer"],
                relevance_score=best_score,
                created_at=now,
            )
        )

    # Store hint history
    cursor = conn.cursor()
    for hint in hints:
        cursor.execute(
            """
            INSERT INTO hint_history (
                entry_id, agent_id, run_id, error_type, error_message,
                hint_level, hint_type, hint_content, relevance_score, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                hint.hint_id,
                request.agent_id,
                request.run_id,
                request.error_type,
                request.error_message,
                hint.level.value,
                hint.type.value,
                hint.content,
                hint.relevance_score,
                hint.created_at,
            ),
        )
    conn.commit()

    # Determine recommended action
    if current_level == HintLevel.DIRECT:
        recommended = "Direct answer provided. Apply the solution and verify."
    elif current_level == HintLevel.APPROACH:
        recommended = "Approach suggested. Try the recommended approach."
    elif current_level == HintLevel.EXAMPLE:
        recommended = "Example provided. Study similar case and adapt solution."
    else:
        recommended = "Documentation links provided. Review and implement."

    return HintResponse(
        request_id=request_id,
        agent_id=request.agent_id,
        hints=hints,
        current_level=current_level,
        can_escalate=current_level < HintLevel.DIRECT,
        recommended_action=recommended,
        generated_at=now,
    )


def record_hint_feedback(
    conn: sqlite3.Connection,
    hint_id: str,
    was_helpful: bool,
    resolved_issue: bool | None = None,
) -> None:
    """Record feedback on a hint's effectiveness."""
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE hint_history
        SET was_helpful = ?, resolved_issue = ?
        WHERE entry_id = ?
        """,
        (
            1 if was_helpful else 0,
            1 if resolved_issue else 0 if resolved_issue is False else None,
            hint_id,
        ),
    )
    conn.commit()


def get_hint_history(
    conn: sqlite3.Connection,
    agent_id: str | None = None,
    run_id: str | None = None,
    limit: int = 50,
) -> list[HintHistoryEntry]:
    """Get hint history for analysis."""
    cursor = conn.cursor()

    if agent_id and run_id:
        cursor.execute(
            """
            SELECT entry_id, agent_id, run_id, error_type,
                   hint_level, hint_type, was_helpful, resolved_issue, created_at
            FROM hint_history
            WHERE agent_id = ? AND run_id = ?
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (agent_id, run_id, limit),
        )
    elif agent_id:
        cursor.execute(
            """
            SELECT entry_id, agent_id, run_id, error_type,
                   hint_level, hint_type, was_helpful, resolved_issue, created_at
            FROM hint_history
            WHERE agent_id = ?
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (agent_id, limit),
        )
    else:
        cursor.execute(
            """
            SELECT entry_id, agent_id, run_id, error_type,
                   hint_level, hint_type, was_helpful, resolved_issue, created_at
            FROM hint_history
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,),
        )

    entries = []
    for row in cursor.fetchall():
        entries.append(
            HintHistoryEntry(
                entry_id=row[0],
                agent_id=row[1],
                run_id=row[2],
                error_type=row[3],
                hint_level=row[4],
                hint_type=row[5],
                was_helpful=bool(row[6]) if row[6] is not None else None,
                resolved_issue=bool(row[7]) if row[7] is not None else None,
                created_at=row[8],
            )
        )

    return entries


def get_hint_effectiveness_report(conn: sqlite3.Connection) -> dict[str, Any]:
    """Generate a report on hint effectiveness."""
    cursor = conn.cursor()

    # Total hints generated
    cursor.execute("SELECT COUNT(*) FROM hint_history")
    total_hints = cursor.fetchone()[0]

    # Hints with feedback
    cursor.execute("SELECT COUNT(*) FROM hint_history WHERE was_helpful IS NOT NULL")
    hints_with_feedback = cursor.fetchone()[0]

    # Helpful hints
    cursor.execute("SELECT COUNT(*) FROM hint_history WHERE was_helpful = 1")
    helpful_hints = cursor.fetchone()[0]

    # Resolved issues
    cursor.execute("SELECT COUNT(*) FROM hint_history WHERE resolved_issue = 1")
    resolved_issues = cursor.fetchone()[0]

    # By hint level
    cursor.execute(
        """
        SELECT hint_level, COUNT(*),
               SUM(CASE WHEN was_helpful = 1 THEN 1 ELSE 0 END) as helpful
        FROM hint_history
        GROUP BY hint_level
        """
    )
    by_level = {}
    for row in cursor.fetchall():
        by_level[row[0]] = {
            "total": row[1],
            "helpful": row[2],
            "helpfulness_rate": row[2] / row[1] if row[1] > 0 else 0,
        }

    # By error type
    cursor.execute(
        """
        SELECT error_type, COUNT(*) as cnt
        FROM hint_history
        GROUP BY error_type
        ORDER BY cnt DESC
        LIMIT 10
        """
    )
    by_error_type = {row[0]: row[1] for row in cursor.fetchall()}

    return {
        "total_hints": total_hints,
        "hints_with_feedback": hints_with_feedback,
        "feedback_rate": hints_with_feedback / total_hints if total_hints > 0 else 0,
        "helpful_hints": helpful_hints,
        "helpfulness_rate": helpful_hints / hints_with_feedback if hints_with_feedback > 0 else 0,
        "resolved_issues": resolved_issues,
        "resolution_rate": resolved_issues / hints_with_feedback if hints_with_feedback > 0 else 0,
        "by_level": by_level,
        "by_error_type": by_error_type,
        "generated_at": datetime.now(UTC).isoformat(),
    }


def add_knowledge_entry(
    conn: sqlite3.Connection,
    entry: HintKnowledgeBase,
) -> None:
    """Add a new knowledge base entry."""
    import uuid

    cursor = conn.cursor()
    now = datetime.now(UTC).isoformat()

    cursor.execute(
        """
        INSERT INTO hint_knowledge (
            entry_id, error_pattern, error_category,
            doc_links, examples, approaches, direct_answer, tags,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            entry.entry_id or f"kb-{uuid.uuid4().hex[:12]}",
            entry.error_pattern,
            entry.error_category,
            json.dumps(entry.doc_links),
            json.dumps([e if isinstance(e, dict) else e.model_dump() for e in entry.examples]),
            json.dumps(entry.approaches),
            entry.direct_answer,
            json.dumps(entry.tags or []),
            now,
            now,
        ),
    )
    conn.commit()

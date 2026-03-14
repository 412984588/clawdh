"""Tests for the Socratic Hints service.

Tests cover:
- Hint generation at progressive levels
- Relevance scoring
- Error tracking and retry counting
- Feedback recording
- Knowledge base matching
"""

from __future__ import annotations

import sqlite3
from datetime import UTC, datetime

import pytest

from app.socratic_hints import (
    HintLevel,
    HintRequest,
    HintType,
    add_knowledge_entry,
    calculate_relevance_score,
    find_matching_knowledge,
    generate_hints,
    get_hint_effectiveness_report,
    get_hint_history,
    init_hint_tables,
    record_hint_feedback,
    resolve_error,
    track_error,
)


@pytest.fixture
def hint_db() -> sqlite3.Connection:
    """Create an in-memory database for hint testing."""
    conn = sqlite3.connect(":memory:")
    init_hint_tables(conn)
    return conn


class TestHintTables:
    """Tests for database initialization."""

    def test_tables_created(self, hint_db: sqlite3.Connection):
        """Verify all hint tables are created."""
        cursor = hint_db.cursor()

        # Check hint_history table
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='hint_history'")
        assert cursor.fetchone() is not None

        # Check hint_knowledge table
        cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='hint_knowledge'"
        )
        assert cursor.fetchone() is not None

        # Check error_tracking table
        cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='error_tracking'"
        )
        assert cursor.fetchone() is not None

    def test_default_knowledge_seeded(self, hint_db: sqlite3.Connection):
        """Verify default knowledge entries are seeded."""
        cursor = hint_db.cursor()
        cursor.execute("SELECT COUNT(*) FROM hint_knowledge")
        count = cursor.fetchone()[0]
        assert count > 0


class TestErrorTracking:
    """Tests for error tracking functionality."""

    def test_track_error_first_occurrence(self, hint_db: sqlite3.Connection):
        """Test tracking first error occurrence."""
        retry_count = track_error(
            hint_db,
            agent_id="agent-1",
            run_id="run-1",
            error_type="TypeError",
            error_message="Cannot read property of undefined",
        )

        assert retry_count == 1

    def test_track_error_increments_retry(self, hint_db: sqlite3.Connection):
        """Test that retry count increments on repeated errors."""
        # First occurrence
        track_error(
            hint_db,
            agent_id="agent-1",
            run_id="run-1",
            error_type="TypeError",
            error_message="Cannot read property of undefined",
        )

        # Second occurrence
        retry_count = track_error(
            hint_db,
            agent_id="agent-1",
            run_id="run-1",
            error_type="TypeError",
            error_message="Cannot read property of undefined",
        )

        assert retry_count == 2

    def test_track_different_errors_separately(self, hint_db: sqlite3.Connection):
        """Test that different error types are tracked separately."""
        track_error(
            hint_db,
            agent_id="agent-1",
            run_id="run-1",
            error_type="TypeError",
            error_message="Type error",
        )

        retry_count = track_error(
            hint_db,
            agent_id="agent-1",
            run_id="run-1",
            error_type="NetworkError",
            error_message="Network error",
        )

        assert retry_count == 1  # Different error type, starts at 1

    def test_resolve_error(self, hint_db: sqlite3.Connection):
        """Test marking an error as resolved."""
        track_error(
            hint_db,
            agent_id="agent-1",
            run_id="run-1",
            error_type="TypeError",
            error_message="Type error",
        )

        resolve_error(
            hint_db,
            agent_id="agent-1",
            run_id="run-1",
            error_type="TypeError",
        )

        cursor = hint_db.cursor()
        cursor.execute(
            """
            SELECT resolved_at FROM error_tracking
            WHERE agent_id = ? AND run_id = ? AND error_type = ?
            """,
            ("agent-1", "run-1", "TypeError"),
        )
        row = cursor.fetchone()
        assert row is not None
        assert row[0] is not None


class TestRelevanceScoring:
    """Tests for relevance score calculation."""

    def test_pattern_match_increases_score(self, hint_db: sqlite3.Connection):
        """Test that pattern matching increases relevance score."""
        entry = {
            "error_pattern": "(?i)(authentication|auth)",
            "error_category": "auth",
            "tags": [],
        }

        # Matching error message
        score_match = calculate_relevance_score(
            error_message="Authentication failed",
            error_context=None,
            agent_role=None,
            knowledge_entry=entry,
        )

        # Non-matching error message
        score_no_match = calculate_relevance_score(
            error_message="File not found",
            error_context=None,
            agent_role=None,
            knowledge_entry=entry,
        )

        assert score_match > score_no_match

    def test_context_similarity_increases_score(self, hint_db: sqlite3.Connection):
        """Test that context similarity increases relevance score."""
        entry = {
            "error_pattern": "(?i)(error)",
            "error_category": "config",
            "tags": ["env", "config"],
        }

        # With relevant context
        score_with_context = calculate_relevance_score(
            error_message="Configuration error",
            error_context={"env": "production", "config": "database"},
            agent_role=None,
            knowledge_entry=entry,
        )

        # Without context
        score_without_context = calculate_relevance_score(
            error_message="Configuration error",
            error_context=None,
            agent_role=None,
            knowledge_entry=entry,
        )

        assert score_with_context > score_without_context

    def test_agent_role_increases_score(self, hint_db: sqlite3.Connection):
        """Test that matching agent role increases relevance score."""
        entry = {
            "error_pattern": "(?i)(error)",
            "error_category": "type_error",
            "tags": [],
        }

        # Engineer role matches type_error category
        score_engineer = calculate_relevance_score(
            error_message="Type error",
            error_context=None,
            agent_role="engineer",
            knowledge_entry=entry,
        )

        # Researcher role doesn't match type_error category
        score_researcher = calculate_relevance_score(
            error_message="Type error",
            error_context=None,
            agent_role="researcher",
            knowledge_entry=entry,
        )

        assert score_engineer > score_researcher

    def test_score_capped_at_one(self, hint_db: sqlite3.Connection):
        """Test that relevance score is capped at 1.0."""
        entry = {
            "error_pattern": "(?i)(error)",
            "error_category": "type_error",
            "tags": ["type", "validation", "typescript"],
        }

        score = calculate_relevance_score(
            error_message="Type error occurred",
            error_context={"type": "string", "validation": "failed"},
            agent_role="engineer",
            knowledge_entry=entry,
        )

        assert score <= 1.0


class TestKnowledgeMatching:
    """Tests for knowledge base matching."""

    def test_find_matching_auth_knowledge(self, hint_db: sqlite3.Connection):
        """Test finding auth-related knowledge entries."""
        matches = find_matching_knowledge(
            hint_db,
            error_message="Authentication failed: invalid token",
            error_context=None,
            agent_role=None,
        )

        assert len(matches) > 0
        entry, score = matches[0]
        assert entry["error_category"] == "auth"
        assert score > 0

    def test_find_matching_network_knowledge(self, hint_db: sqlite3.Connection):
        """Test finding network-related knowledge entries."""
        matches = find_matching_knowledge(
            hint_db,
            error_message="Connection timeout: ECONNREFUSED",
            error_context=None,
            agent_role=None,
        )

        assert len(matches) > 0
        entry, score = matches[0]
        assert entry["error_category"] == "network"

    def test_no_match_returns_empty(self, hint_db: sqlite3.Connection):
        """Test that no match returns empty list."""
        matches = find_matching_knowledge(
            hint_db,
            error_message="Completely unique error xyz123",
            error_context=None,
            agent_role=None,
            min_score=0.9,  # High threshold
        )

        # Should have no matches above 0.9 threshold
        assert len(matches) == 0


class TestHintGeneration:
    """Tests for hint generation."""

    def test_generate_hint_level_1_at_retry_3(self, hint_db: sqlite3.Connection):
        """Test that Level 1 hints are generated at retry 3."""
        # Track error twice to get to retry 3
        track_error(hint_db, "agent-1", "run-1", "AuthError", "Auth failed")
        track_error(hint_db, "agent-1", "run-1", "AuthError", "Auth failed")

        request = HintRequest(
            agent_id="agent-1",
            run_id="run-1",
            error_type="AuthError",
            error_message="Authentication failed: unauthorized",
            retry_count=2,
        )

        response = generate_hints(hint_db, request)

        # After this call, retry should be 3, so Level 1
        assert response.current_level == HintLevel.DOC_LINK
        assert len(response.hints) > 0
        assert response.can_escalate is True

    def test_generate_hint_escalates_with_retries(self, hint_db: sqlite3.Connection):
        """Test that hint level escalates with more retries."""
        # Track many errors
        for _ in range(9):
            track_error(hint_db, "agent-2", "run-2", "TypeError", "Type error")

        request = HintRequest(
            agent_id="agent-2",
            run_id="run-2",
            error_type="TypeError",
            error_message="Type error: expected string got number",
            retry_count=9,
        )

        response = generate_hints(hint_db, request)

        # Should be at Level 4 (Direct) after 9+ retries
        assert response.current_level == HintLevel.DIRECT
        assert response.can_escalate is False

    def test_generate_hint_stores_history(self, hint_db: sqlite3.Connection):
        """Test that generated hints are stored in history."""
        request = HintRequest(
            agent_id="agent-3",
            run_id="run-3",
            error_type="NetworkError",
            error_message="Connection timeout",
            retry_count=5,
        )

        generate_hints(hint_db, request)

        history = get_hint_history(hint_db, agent_id="agent-3", run_id="run-3")

        assert len(history) > 0

    def test_generate_hint_with_no_matching_knowledge(self, hint_db: sqlite3.Connection):
        """Test hint generation when no knowledge matches."""
        request = HintRequest(
            agent_id="agent-4",
            run_id="run-4",
            error_type="UnknownError",
            error_message="Completely unknown error xyz789",
            retry_count=3,
        )

        response = generate_hints(hint_db, request)

        # Should still generate a generic hint
        assert len(response.hints) > 0
        assert "No specific documentation" in response.hints[0].content


class TestHintFeedback:
    """Tests for hint feedback recording."""

    def test_record_hint_feedback(self, hint_db: sqlite3.Connection):
        """Test recording feedback on a hint."""
        # Generate a hint first
        request = HintRequest(
            agent_id="agent-5",
            run_id="run-5",
            error_type="AuthError",
            error_message="Authentication failed",
            retry_count=3,
        )

        response = generate_hints(hint_db, request)
        hint_id = response.hints[0].hint_id

        # Record feedback
        record_hint_feedback(
            hint_db,
            hint_id=hint_id,
            was_helpful=True,
            resolved_issue=True,
        )

        # Verify feedback was recorded
        history = get_hint_history(hint_db, agent_id="agent-5")

        assert len(history) > 0
        entry = history[0]
        assert entry.was_helpful is True
        assert entry.resolved_issue is True


class TestHintEffectivenessReport:
    """Tests for hint effectiveness reporting."""

    def test_effectiveness_report_empty(self, hint_db: sqlite3.Connection):
        """Test effectiveness report with no hints."""
        report = get_hint_effectiveness_report(hint_db)

        assert report["total_hints"] == 0
        assert report["helpfulness_rate"] == 0

    def test_effectiveness_report_with_data(self, hint_db: sqlite3.Connection):
        """Test effectiveness report with hint data."""
        # Generate some hints
        for i in range(3):
            request = HintRequest(
                agent_id=f"agent-{i}",
                run_id=f"run-{i}",
                error_type="AuthError",
                error_message="Authentication failed",
                retry_count=3 + i * 2,
            )
            generate_hints(hint_db, request)

        report = get_hint_effectiveness_report(hint_db)

        assert report["total_hints"] > 0
        assert "by_level" in report
        assert "by_error_type" in report


class TestKnowledgeBase:
    """Tests for knowledge base management."""

    def test_add_knowledge_entry(self, hint_db: sqlite3.Connection):
        """Test adding a new knowledge base entry."""
        from app.socratic_hints import HintKnowledgeBase

        entry = HintKnowledgeBase(
            entry_id="kb-test-001",
            error_pattern="(?i)(custom.*error)",
            error_category="custom",
            doc_links=["https://example.com/docs"],
            examples=[{"description": "Test", "solution": "Test solution"}],
            approaches=["Test approach"],
            direct_answer="Test answer",
            tags=["test"],
        )

        add_knowledge_entry(hint_db, entry)

        # Verify entry was added
        matches = find_matching_knowledge(
            hint_db,
            error_message="Custom error occurred",
            error_context=None,
            agent_role=None,
        )

        # Should find our new entry
        entry_ids = [m[0]["entry_id"] for m in matches]
        assert "kb-test-001" in entry_ids

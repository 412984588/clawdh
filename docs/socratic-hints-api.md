# Socratic Hints API

## Overview

The Socratic Hints API provides progressive guidance for CLI agents when they encounter persistent errors. Instead of immediately providing solutions, the system offers increasingly specific hints based on retry count.

## Progression Model

| Retry Count | Level | Type       | Description                     |
| ----------- | ----- | ---------- | ------------------------------- |
| 3-4         | 1     | `doc_link` | Point to relevant documentation |
| 5-6         | 2     | `example`  | Show similar solved examples    |
| 7-8         | 3     | `approach` | Suggest specific approach       |
| 9+          | 4     | `direct`   | Direct answer                   |

## Endpoints

### POST /api/hints/generate

Generate progressive hints for an error.

**Request Body:**

```json
{
  "agent_id": "string",
  "run_id": "string",
  "error_type": "string",
  "error_message": "string",
  "error_context": { ... },
  "retry_count": 0,
  "task_description": "string",
  "agent_role": "string"
}
```

**Response:**

```json
{
  "request_id": "hr-abc123",
  "agent_id": "agent-1",
  "hints": [
    {
      "hint_id": "h-xyz789",
      "level": 1,
      "type": "doc_link",
      "content": "See documentation: https://...",
      "relevance_score": 0.85,
      "related_docs": ["https://..."],
      "created_at": "2026-03-14T17:00:00Z"
    }
  ],
  "current_level": 1,
  "can_escalate": true,
  "recommended_action": "Documentation links provided. Review and implement.",
  "generated_at": "2026-03-14T17:00:00Z"
}
```

### POST /api/hints/{hint_id}/feedback

Record feedback on a hint's effectiveness.

**Request Body:**

```json
{
  "was_helpful": true,
  "resolved_issue": true
}
```

### GET /api/hints/history

Get hint history for analysis.

**Query Parameters:**

- `agent_id` (optional): Filter by agent
- `run_id` (optional): Filter by run
- `limit` (default: 50): Max results

### GET /api/hints/effectiveness

Get hint effectiveness analytics.

**Response:**

```json
{
  "total_hints": 100,
  "hints_with_feedback": 45,
  "feedback_rate": 0.45,
  "helpful_hints": 38,
  "helpfulness_rate": 0.84,
  "resolved_issues": 32,
  "resolution_rate": 0.71,
  "by_level": {
    "1": { "total": 40, "helpful": 30, "helpfulness_rate": 0.75 },
    "2": { "total": 30, "helpful": 28, "helpfulness_rate": 0.93 }
  },
  "by_error_type": { "auth": 25, "network": 20 }
}
```

### POST /api/hints/resolve

Mark an error as resolved.

**Request Body:**

```json
{
  "agent_id": "string",
  "run_id": "string",
  "error_type": "string"
}
```

### POST /api/hints/knowledge

Add a new knowledge base entry.

**Request Body:**

```json
{
  "entry_id": "kb-custom-001",
  "error_pattern": "(?i)(custom.*error)",
  "error_category": "custom",
  "doc_links": ["https://..."],
  "examples": [{ "description": "...", "solution": "..." }],
  "approaches": ["..."],
  "direct_answer": "...",
  "tags": ["custom", "error"]
}
```

## Relevance Scoring

Hints are scored (0.0-1.0) based on:

1. **Pattern Match (0.0-0.4)**: Regex match against error message
2. **Context Similarity (0.0-0.3)**: Match between error context and knowledge base tags
3. **Agent Role (0.0-0.3)**: Relevance of error category to agent role

## Usage Example

```python
from app.socratic_hints import generate_hints, HintRequest

request = HintRequest(
    agent_id="evolver",
    run_id="run-123",
    error_type="AuthError",
    error_message="Authentication failed: unauthorized",
    retry_count=3,
    agent_role="researcher"
)

response = generate_hints(conn, request)

for hint in response.hints:
    print(f"Level {hint.level}: {hint.content}")
```

## Error Categories

Default knowledge base includes patterns for:

- `auth`: Authentication and authorization errors
- `network`: Connection and timeout errors
- `config`: Configuration and environment errors
- `rate_limit`: API rate limiting errors
- `type_error`: Type validation errors
- `file_error`: File system errors

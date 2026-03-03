# Hands Architecture - OpenFang-Inspired Autonomous Agents

## What Are Hands?

Hands are pre-built autonomous capability packages that run independently, on schedules, without requiring prompts. Inspired by OpenFang's Hands system.

**Key Difference from Current Agents:**
- ❌ Current agents: Need @ mention to respond
- ✅ Hands: Run autonomously on schedule, 24/7

## Hand Structure

Every Hand contains 4 files:

```
hands/
└── [hand-name].hand/
    ├── hand.toml          # Configuration
    ├── system_prompt.md   # Operational procedure
    ├── skill.md           # Domain expertise
    └── guardrails.json    # Approval gates & security
```

### 1. hand.toml - Configuration

```toml
[hand]
name = "Hand Name"
version = "1.0.0"
description = "What this Hand does"
enabled = true

[schedule]
cron = "0 9 * * *"  # Daily at 9 AM EST
timezone = "America/New_York"

[tools]
required = ["web_search", "web_fetch"]
optional = ["browser"]

[settings]
key = "value"

[metrics]
metric_name = "type"

[output]
file = "path"
channel = "discord:war-room"

[guardrails]
require_approval_for = ["action1", "action2"]
auto_approve_if = ["condition1"]
```

### 2. system_prompt.md - Procedure

Detailed operational procedure:
- Mission statement
- Operational phases (step-by-step)
- Behavioral rules
- Error handling
- Success metrics
- Self-improvement

**Length:** 500+ words (multi-phase expert procedure)

### 3. skill.md - Domain Expertise

Domain-specific knowledge:
- Industry patterns
- Scoring criteria
- Market research techniques
- Output templates
- Continuous learning

**Injected into context at runtime**

### 4. guardrails.json - Security

Approval gates and security:
- Approval gates (what needs approval)
- Auto-actions (what's automated)
- Security constraints
- Audit logging

## Current Hands

### Hunter Hand (✅ Complete)

**Mission:** Discover and validate opportunities autonomously

**Schedule:** Daily at 9:00 AM EST

**Output:**
- `opportunities.jsonl` - New opportunities
- war-room report - Human-readable summary

**Key Features:**
- CRAAP validation
- Score ≥18 filter
- Deduplication
- Approval gates for high-score opportunities

**Location:** `hands/hunter.hand/`

## Planned Hands

### Commander Hand

**Mission:** Coordinate all agents and tasks

**Schedule:** Every 10 minutes

**Output:**
- Task assignments
- Progress updates
- Blocker resolutions

### Builder Hands

**Mission:** Build projects autonomously

**Schedule:** Every 5 minutes

**Output:**
- Code commits
- Test results
- Build artifacts

### Collector Hand

**Mission:** Monitor market and competitors

**Schedule:** Every 6 hours

**Output:**
- Market changes
- Competitor updates
- Window alerts

## How Hands Work

### 1. Schedule-Based Execution

```bash
# Hands run automatically based on cron schedule
# No need to @ mention

# Example: Hunter Hand runs daily at 9 AM
0 9 * * * → Hunter Hand activates → Scans → Validates → Reports
```

### 2. Autonomous Operation

Hands don't wait for prompts:
1. Wake up on schedule
2. Execute procedure (system_prompt.md)
3. Apply domain expertise (skill.md)
4. Respect guardrails
5. Output results

### 3. Approval Gates

Sensitive actions require approval:
```
Hunter finds opportunity (score 20) 
→ Checks guardrails.json
→ "add_opportunity_above_score_19" requires approval
→ Sends approval request to Commander
→ Waits for approval
→ If approved: adds to opportunities.jsonl
→ If rejected: logs reason
```

### 4. Audit Trail

All actions logged:
```
PIPELINE/logs/[hand-name]_audit.jsonl
```

Each entry:
```json
{
  "timestamp": "2026-03-02T09:00:00Z",
  "action": "opportunity_found",
  "details": {...},
  "approved_by": "commander",
  "result": "success"
}
```

## Integration with Existing Systems

### Memory System (VCP-inspired)

Hands can read/write memories:
- Read: `agent_memories/errors.jsonl`
- Write: `add-memory.sh error "context" "problem" "tags"`

### Scoreboard

Hands earn points:
- Hunter: +15 per opportunity found
- Commander: +10 per task delegated
- Builder: +20 per project shipped

### Current WIP

Hands respect `CURRENT_WIP.md`:
- Check before starting work
- Stop if WIP conflict

## Creating New Hands

### Step 1: Create Directory

```bash
mkdir -p PIPELINE/hands/[hand-name].hand
```

### Step 2: Create Files

```bash
cd PIPELINE/hands/[hand-name].hand
touch hand.toml system_prompt.md skill.md guardrails.json
```

### Step 3: Define Configuration

Edit `hand.toml`:
- Set schedule
- List required tools
- Define settings

### Step 4: Write Procedure

Edit `system_prompt.md`:
- Define mission
- Break into phases
- Add rules

### Step 5: Add Domain Knowledge

Edit `skill.md`:
- Industry patterns
- Scoring criteria
- Templates

### Step 6: Set Guardrails

Edit `guardrails.json`:
- Approval gates
- Auto-actions
- Security

### Step 7: Activate

```bash
# Future: CLI command
openclaw hand activate [hand-name]

# Current: Add cron job
# (Manual for now, will automate)
```

## Benefits Over Current System

### Current Agents
- ❌ Need @ mention
- ❌ Wait for prompts
- ❌ No clear schedule
- ❌ Manual coordination

### Hands
- ✅ Autonomous execution
- ✅ Schedule-based
- ✅ Self-contained procedures
- ✅ Approval gates for safety
- ✅ Audit trail
- ✅ Easier to add new capabilities

## Metrics to Track

### Per-Hand Metrics
- Runs per day
- Success rate
- Average execution time
- Approval rate

### System Metrics
- Total hands active
- Opportunities found (Hunter)
- Projects shipped (Builder)
- Tasks delegated (Commander)

## Troubleshooting

### Hand Not Running
1. Check `hand.toml` → `enabled = true`
2. Check cron schedule
3. Check logs: `PIPELINE/logs/[hand-name]_audit.jsonl`

### Hand Waiting for Approval
1. Check `guardrails.json` for approval gates
2. Ask approver (Commander/boss) to approve
3. Or adjust guardrails if too restrictive

### Duplicate Outputs
1. Check deduplication logic in `system_prompt.md`
2. Check `guardrails.json` → `auto_actions.skip_duplicates`

## Future Enhancements

### Phase 2: Hand-to-Hand Communication
- Hunter → Commander (handoff opportunities)
- Commander → Builder (assign tasks)
- Builder → Reviewer (request review)

### Phase 3: Learning System
- Track success rates
- Adjust scoring criteria
- Improve procedures

### Phase 4: Dashboard
- Real-time hand status
- Approval queue
- Metrics visualization

---

## Resources

**Inspiration:**
- OpenFang: https://github.com/RightNow-AI/openfang
- VCPToolBox: https://github.com/lioensky/VCPToolBox

**Documentation:**
- OpenFang Analysis: `evolution/research/OPENFANG_ANALYSIS_20260302.md`
- VCP Analysis: `evolution/research/VCPToolBox_ANALYSIS_20260302.md`

---

**Remember**: Hands work for you, not the other way around.

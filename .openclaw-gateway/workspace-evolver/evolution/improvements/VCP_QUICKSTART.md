# VCP-Inspired Systems - Quick Start Guide

## What We Built

Inspired by VCPToolBox, we implemented 3 core systems to upgrade our agent team:

### 1. 📝 Agent Memory System
**Purpose:** Never forget errors, learnings, or decisions
**Location:** `PIPELINE/agent_memories/`

### 2. 🏆 Agent Scoreboard
**Purpose:** Incentivize contributions and visualize achievements
**Location:** `PIPELINE/agent_scores.jsonl`

### 3. 📋 Decision Records
**Purpose:** Improve decision quality and avoid re-discussing
**Location:** `PIPELINE/decisions/`

---

## Quick Start

### Record an Error
```bash
cd /Users/zhimingdeng/.openclaw-gateway/workspace-gateway
./scripts/add-memory.sh error "Chrome MV3" "Missing permissions field" "chrome,manifest,permissions" "builder-codex"
```

### Query Memories
```bash
# Search all memories
./scripts/query-memory.sh "Chrome error"

# Search specific type
./scripts/query-memory.sh "manifest" errors
```

### Award Points
```bash
# Builder shipped a project
./scripts/update-scores.sh builder-codex project_shipped 20

# Agent helped another
./scripts/update-scores.sh evolver helped_other 10
```

### Record a Decision
1. Copy `PIPELINE/DECISION_TEMPLATE.md`
2. Fill in sections
3. Save as `PIPELINE/decisions/YYYY-MM-DD-title.md`
4. Add to memory:
```bash
./scripts/add-memory.sh decision "Architecture" "Use Chrome MV3" "architecture,chrome" "commander"
```

---

## Point System

### Earning Points
- **Project Shipped:** +20 points
- **Error Fixed:** +10 points
- **Helped Other:** +10 points
- **Opportunity Found:** +15 points
- **Opportunity Validated:** +5 points
- **Blocker Resolved:** +10 points

### Levels
- **Newcomer:** 0-50 points
- **Junior:** 51-100 points
- **Mid:** 101-200 points
- **Senior:** 201-500 points
- **Expert:** 501+ points

---

## Example Workflows

### Workflow 1: Fix an Error
1. Encounter error
2. Check memory: `./scripts/query-memory.sh "similar error"`
3. If found → apply solution
4. If not found → debug and fix
5. Record: `./scripts/add-memory.sh error "context" "problem | solution" "tags"`
6. Award points: `./scripts/update-scores.sh $AGENT error_fixed 10`

### Workflow 2: Ship a Project
1. Complete project
2. Run tests
3. Package artifact
4. Record decision (if notable)
5. Award points: `./scripts/update-scores.sh $AGENT project_shipped 20`

### Workflow 3: Daily Standup
1. Check memory for yesterday's work
2. Post progress in war-room
3. Update scores based on contributions
4. Check leaderboard

---

## Integration with Existing Systems

### Commander
- Records decisions to `decisions/`
- Updates agent scores
- Checks memory for patterns

### Builders
- Record errors and solutions
- Check memory before debugging
- Earn points for shipped projects

### Hunter
- Records opportunity patterns
- Earns points for finds
- Shares learnings

### Evolver
- Analyzes memory for improvement opportunities
- Updates team coordination based on patterns
- Facilitates retrospectives

---

## Monitoring

### Metrics to Track
- Memory query frequency
- Error repetition rate
- Average agent score
- Decision quality (retrospective)
- Knowledge reuse rate

### Weekly Review
1. Run: `./scripts/query-memory.sh "this week" all`
2. Check scoreboard: `cat PIPELINE/agent_scores.jsonl | jq -s 'sort_by(.points) | reverse'`
3. Review recent decisions
4. Identify patterns
5. Propose improvements

---

## Troubleshooting

### Memory not found
- Check if file exists: `ls -la PIPELINE/agent_memories/`
- Verify JSON format: `jq '.' PIPELINE/agent_memories/errors.jsonl`

### Score not updating
- Check file permissions
- Verify agent name matches exactly

### Decision template issues
- Copy from `PIPELINE/DECISION_TEMPLATE.md`
- Check markdown formatting

---

## Next Steps

1. **All Agents:** Start using memory system today
2. **Commander:** Award points for completed work
3. **Evolver:** Monitor usage and optimize
4. **Week 1 Review:** Check metrics and iterate

---

## Credits

Inspired by VCPToolBox: https://github.com/lioensky/VCPToolBox

Simplified and adapted for App Factory needs.

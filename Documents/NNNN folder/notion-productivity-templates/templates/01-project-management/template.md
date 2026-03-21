# Project Management Kanban — Notion Template

A complete project management system for Notion: Kanban board, task database, timeline view, and team assignments.

## How to Import into Notion

1. Create a new Notion page
2. Copy sections below and paste into Notion (Markdown imports automatically)
3. For database views, use Notion's `/database` command and replicate the property schema

---

## Database Schema: Projects

> In Notion, create a **Database** with these properties:

| Property Name | Type | Options / Notes |
|--------------|------|----------------|
| Project Name | Title | — |
| Status | Select | 🔴 Not Started / 🟡 In Progress / 🟢 Completed / ⏸️ On Hold |
| Priority | Select | 🔥 Critical / ⬆️ High / ➡️ Medium / ⬇️ Low |
| Owner | Person | — |
| Start Date | Date | — |
| Due Date | Date | — |
| Progress | Number | % (0–100) |
| Category | Multi-select | Work / Personal / Learning / Health / Finance / Creative |
| Tags | Multi-select | Custom |
| Related Tasks | Relation | → Tasks database |

---

## Database Schema: Tasks

> Create a second **Database** for tasks, linked to Projects:

| Property Name | Type | Options / Notes |
|--------------|------|----------------|
| Task Name | Title | — |
| Status | Select | 📥 Backlog / 🔄 In Progress / 👀 In Review / ✅ Done / 🚫 Blocked |
| Priority | Select | 🔥 Critical / ⬆️ High / ➡️ Medium / ⬇️ Low |
| Assignee | Person | — |
| Due Date | Date | — |
| Estimated Time | Number | Hours |
| Actual Time | Number | Hours |
| Project | Relation | → Projects database |
| Blocked By | Relation | → Tasks (self-referential) |
| Notes | Text | — |

---

## Kanban Board — Views to Create

### View 1: By Status (main board)
- **Type:** Board
- **Group by:** Status
- **Properties shown:** Priority, Assignee, Due Date
- **Filter:** Status ≠ Done (archive completed tasks)

### View 2: By Priority
- **Type:** Board
- **Group by:** Priority
- **Sort:** Due Date ascending

### View 3: Timeline / Gantt
- **Type:** Timeline
- **Date property:** Due Date (or Start → End range)
- **Group by:** Project

### View 4: My Tasks
- **Type:** Table
- **Filter:** Assignee = Me, Status ≠ Done
- **Sort:** Priority desc, Due Date asc

### View 5: This Week
- **Type:** Table
- **Filter:** Due Date = This week
- **Sort:** Priority desc

---

## Project Overview Page Template

```
# [Project Name]

## 🎯 Goal
[One sentence: What does success look like?]

## 📅 Timeline
- **Start:** [Date]
- **Target completion:** [Date]
- **Current status:** [On track / At risk / Behind]

## 👥 Team
- **Owner:** [Name]
- **Contributors:** [Names]
- **Stakeholders:** [Names]

## 📊 Progress
[Progress bar — link to task completion %]

## ✅ Milestones
- [ ] [Milestone 1] — due [Date]
- [ ] [Milestone 2] — due [Date]
- [ ] [Milestone 3] — due [Date]

## 🚧 Blockers
[List current blockers and who owns resolution]

## 📝 Notes & Decisions
[Running log of important decisions made]

## 🔗 Resources
[Links to relevant docs, designs, repos]
```

---

## Weekly Standup Template

```
## Week of [Date]

### ✅ Last Week
- [What was completed]

### 🔄 This Week
- [Priority 1]
- [Priority 2]
- [Priority 3]

### 🚧 Blockers
- [Any blockers and who can help]

### 📊 Metrics
- Tasks completed: [X]
- Tasks remaining: [X]
- On track: [Yes / At risk]
```

---

## Project Prioritization Matrix

Use this to decide what to work on when you have too many projects:

| Project | Impact (1-10) | Effort (1-10) | Score (Impact/Effort) | Priority |
|---------|--------------|---------------|----------------------|----------|
| [Project A] | 8 | 3 | 2.7 | 🔥 Do first |
| [Project B] | 6 | 8 | 0.75 | ⬇️ Later |
| [Project C] | 9 | 7 | 1.3 | ➡️ Medium |

**Rule:** High impact, low effort = do first. High effort, low impact = drop or delegate.

---

## Status Definitions

| Status | Meaning | SLA |
|--------|---------|-----|
| 📥 Backlog | Not started, not scheduled | — |
| 🔄 In Progress | Actively being worked on | Update every 2 days |
| 👀 In Review | Waiting for feedback | Respond within 24 hrs |
| ✅ Done | Completed and accepted | — |
| 🚫 Blocked | Can't proceed — needs unblocking | Escalate same day |

---

*Pair with the Weekly Review template (04) for a full productivity system.*
*Use the Goal Tracker (02) to ensure projects connect to your bigger goals.*

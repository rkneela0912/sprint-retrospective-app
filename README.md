# Sprint Retrospective App

A Power Apps Code App for running structured agile sprint retrospectives. Built with React + TypeScript and backed by SharePoint Online, this app enables teams to collaboratively reflect on each sprint using a four-column retrospective board — all within the Microsoft Power Apps ecosystem.

📖 **[Read the blog article](https://rkneela0912.github.io/sprint-retrospective-app/)** — full architecture walkthrough, technical decisions, and deployment guide.

---

## Features

- **Four-column retro board** — What We Liked, What We Missed, What We Learned, Appreciations
- **Role-based access control** — Scrum Masters, Team Members, and Viewers with distinct permissions
- **Session lifecycle management** — Draft → Open → Closed workflow
- **Anonymous submissions** — Team members can submit feedback anonymously
- **Voting** — Team members can upvote retro items
- **Action items** — Attach action items to feedback cards, assign owners, and track status
- **Carry-over** — Automatically carry incomplete action items from a previous sprint to the next
- **SharePoint-backed** — All data stored in SharePoint Online lists, no extra database needed

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19, TypeScript |
| Build Tool | Vite |
| Platform SDK | `@microsoft/power-apps`, `@microsoft/power-apps-vite` |
| Data Backend | SharePoint Online (via Power Apps connector) |
| Auth | Power Apps context (Microsoft Entra / AAD) |
| Deployment | Power Apps Code Apps (`pac code push`) |

---

## Prerequisites

Before you can run or deploy this app, you need the following:

1. **Node.js** (v18 or later) — [nodejs.org](https://nodejs.org)
2. **Power Platform CLI (PAC)** — Install via:
   ```bash
   npm install -g @microsoft/pac
   ```
   Or download from [Microsoft Power Platform CLI docs](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction)
3. **A Power Apps environment** with a valid environment ID
4. **SharePoint Online** site with the four lists described below
5. **A SharePoint connector connection** in your Power Apps environment (connection ID)

---

## SharePoint Setup

Create the following four lists on your SharePoint site before deploying the app.

### 1. RetroSessions

| Column Name | Type | Notes |
|---|---|---|
| Title | Single line of text | Session name |
| Sprint | Choice | Add your sprint labels (e.g. Sprint 1, Sprint 2 …) |
| Status | Choice | **Required values:** `Draft`, `Open`, `Closed` |
| SessionDate | Date and Time | |

### 2. RetroItems

| Column Name | Type | Notes |
|---|---|---|
| Title | Single line of text | Feedback text |
| Category | Choice | **Required values:** `What We Liked`, `What We Missed`, `What We Learned`, `Appreciations` |
| SessionRef | Number | Stores the ID of the linked RetroSession |
| SubmittedBy | Person or Group | |
| Votes | Number | Default value: `0` |
| IsAnonymous | Yes/No | Default value: `No` |

### 3. ActionItems

| Column Name | Type | Notes |
|---|---|---|
| Title | Single line of text | Action description |
| Owner | Person or Group | |
| Status | Choice | **Required values:** `Open`, `In Progress`, `Completed` |
| TargetSprint | Choice | Use the same sprint labels as RetroSessions |
| CarriedOverFrom | Number | Stores the RetroItem ID this was carried over from |
| RetroItemRef | Number | Stores the ID of the linked RetroItem |

### 4. UserRoles

| Column Name | Type | Notes |
|---|---|---|
| Title | Single line of text | User's email address / UPN |
| Role | Choice | **Required values:** `Scrum Master`, `Team Member`, `Viewer` |

> **Note:** Every user who accesses the app must have an entry in the UserRoles list. Users not in the list will be treated as Viewers.

---

## Role Permissions

| Action | Scrum Master | Team Member | Viewer |
|---|:---:|:---:|:---:|
| View retro board | ✅ | ✅ | ✅ |
| Create sessions | ✅ | ❌ | ❌ |
| Change session status | ✅ | ❌ | ❌ |
| Add retro items | ✅ | ✅ | ❌ |
| Vote on items | ✅ | ✅ | ❌ |
| Add action items | ✅ | ✅ | ❌ |
| Edit action item status | ✅ | Owner only | ❌ |
| Carry over actions | ✅ | ❌ | ❌ |
| See anonymous authors | ✅ | ❌ | ❌ |

---

## Session Workflow

```
Draft  ──→  Open  ──→  Closed
 │           │
 │     Team can submit     │
 │     feedback & vote     │
 │                         │
 └─ (Scrum Master only) ───┘
```

- **Draft** — Session created, not yet open. No submissions accepted.
- **Open** — Team members can add items, vote, and create action items.
- **Closed** — Board is read-only. The Scrum Master can carry over incomplete actions to the next sprint.

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/<your-github-username>/sprint-retrospective-app.git
cd sprint-retrospective-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the dev server

```bash
npm run dev
```

The app runs at `http://localhost:3000/`. In local mode the Power Apps context (user identity, SharePoint connector) is simulated by the Power Apps Vite plugin.

### Other commands

```bash
npm run build    # TypeScript compile + Vite bundle → dist/
npm run lint     # Run ESLint checks
npm run preview  # Preview the production build locally
```

---

## Deploying to Power Apps

### 1. Authenticate with the Power Platform

```bash
pac auth create --environment <your-environment-id>
```

### 2. Initialize the app (first time only)

If you are setting up from scratch in a new environment:

```bash
pac code init -n "Sprint Retrospective App" -env <your-environment-id>
```

### 3. Connect the SharePoint data source

```bash
pac code add-data-source \
  -a "shared_sharepointonline" \
  -c <your-connection-id> \
  -t RetroSessions \
  -d https://<your-tenant>.sharepoint.com/sites/<your-site>
```

Repeat for each list: `RetroSessions`, `RetroItems`, `ActionItems`, `UserRoles`.

### 4. Update `power.config.json`

Update `power.config.json` in the project root with your own environment values:

```json
{
  "appId": "<your-app-id>",
  "appDisplayName": "Sprint Retrospective App",
  "environmentId": "<your-environment-id>",
  "connectionReferences": {
    "<your-connection-id>": {
      "id": "/providers/Microsoft.PowerApps/apis/shared_sharepointonline",
      "dataSets": {
        "https://<your-tenant>.sharepoint.com/sites/<your-site>": {
          "dataSources": {
            "retrosessions":  { "tableName": "RetroSessions" },
            "retroitems":     { "tableName": "RetroItems" },
            "actionitems":    { "tableName": "ActionItems" },
            "userroles":      { "tableName": "UserRoles" }
          }
        }
      }
    }
  }
}
```

### 5. Build and push

```bash
npm run build
pac code push
```

The app will be deployed to your Power Apps environment and available in [make.powerapps.com](https://make.powerapps.com).

---

## Project Structure

```
sprint-retro-app/
├── src/
│   ├── components/         # React UI components
│   │   ├── AuthProvider.tsx        # User identity & role resolution
│   │   ├── SprintSelectorView.tsx  # Session list / create session
│   │   ├── RetrospectiveView.tsx   # Main board page
│   │   ├── RetroBoard.tsx          # Four-column board layout
│   │   ├── RetroColumn.tsx         # Single category column
│   │   ├── RetroCard.tsx           # Feedback card with votes & actions
│   │   ├── ActionItem.tsx          # Action item within a card
│   │   ├── AddItemForm.tsx         # Form to submit new feedback
│   │   ├── AdminPanel.tsx          # Scrum Master admin slide-out
│   │   └── Header.tsx              # Session title & status badge
│   ├── services/           # Business logic wrapping generated services
│   │   ├── SharePointService.ts    # Core data operations
│   │   ├── RetroItemsService.ts
│   │   ├── RetroSessionsService.ts
│   │   ├── ActionItemsService.ts
│   │   └── UserRolesService.ts
│   ├── generated/          # Auto-generated by Power SDK CLI (do not edit)
│   │   ├── models/
│   │   └── services/
│   ├── models/             # Hand-written type definitions
│   ├── App.tsx
│   └── main.tsx
├── .power/
│   └── schemas/            # SharePoint list schemas (auto-generated)
├── .github/
│   └── copilot-instructions.md
├── power.config.json       # Power Apps deployment configuration
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Regenerating the Data Layer

If you add or modify SharePoint lists, regenerate the models and services using the Power SDK CLI:

```bash
pac code add-data-source -a "shared_sharepointonline" -c <connectionId> -t <tableName> -d <datasetUrl>
```

The generated files under `src/generated/` will be updated automatically. Do not manually edit files in that folder.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

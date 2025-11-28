# Project: Contador Amigo (Professional Refactor)

## 1. Project Philosophy & Design System
This project has shifted from a "friendly/casual" mobile app to a **Professional Accounting Intelligence Dashboard**.

### Design Principles:
- **Formal & Modern:** Use Slate/Gray scales, sharp borders, and high-contrast typography. Avoid rounded, bubbly "iOS-style" aesthetics.
- **Responsive & Adaptive:** The layout must work seamlessly on 4k monitors and small smartphones without relying on a bottom tab bar. Use a responsive Sidebar/Drawer pattern.
- **Progressive Disclosure:** Do not overwhelm the user. Show interfaces only when needed.
- **No Empty States:** Always provide context, data, or a relevant calendar event. Never show a blank screen.
- **Interaction Model:** "Silent Observer". The AI listens/reads, deduces intent, and proposes an action via a non-intrusive notification. It does not speak back unless explicitly asked.

## 2. Git Workflow & LLM Instructions
**Note to future LLMs:** When updating this project, adhere to this strict Git workflow. Do not merge directly to `main`.

### Branching Strategy:
- `main`: Production-ready code.
- `feature/[feature-name]`: New capabilities (e.g., `feature/oauth-integration`).
- `fix/[bug-name]`: Bug fixes.
- `refactor/[module-name]`: UI or Logic overhauls.

### Commit Standards:
- Use Conventional Commits (e.g., `feat: add voice intent deduction`, `fix: prevent rage-click loop`).
- **Markdown Documentation:** Update this file if architecture changes.

## 3. Core Architecture
- **Frontend:** React + Tailwind CSS.
- **State Management:** React Context (for Intent/Notification state).
- **AI Integration:** Google GenAI SDK (Gemini).
  - **Model:** `gemini-3-pro-preview` for complex intent deduction.
  - **Flow:** Audio Input -> Transcribe -> JSON Intent -> Notification -> User Confirmation -> Action.
- **Data Source:** Simulated "Official Data" (Receita Federal calendar) via `services/officialData.ts`.

## 4. Key Components
- **SmartInput:** A text input that can toggle voice listening mode.
- **IntentToast:** The mechanism to propose AI actions.
- **ContextDrawer:** A discreet side panel for the Chatbot and specific Contextual Actions.
- **RageClickDetector:** Logic to detect user frustration (rapid navigation/clicking) and offer help.

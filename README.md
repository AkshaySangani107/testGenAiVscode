# TestGenAI VS Code Extension

Autonomous AI-powered NestJS & TypeScript unit test generation, evaluation, and coverage expansion directly from within Visual Studio Code.

---

## ⚡ Features

- **Right-Click Test Generation:** Right-click any NestJS `.service.ts` file in the File Explorer or inside the active editor and select **"TestGenAI: Generate Unit Tests"**.
- **Interactive Coverage Expander:** Select **"TestGenAI: Expand Test Coverage (Close Gaps)"** to automatically generate targeted test blocks for untested methods and error throw branches without breaking existing mocks.
- **Coverage Gap Inspector:** Run **"TestGenAI: Inspect Coverage Gaps"** to view a real-time method coverage breakdown in the Output panel.
- **Visual Status & Progress:** View ongoing generation, attempt count, score (`72/80`), and coverage (`85%`) directly in the VS Code status bar and notifications.
- **Side-by-Side Review:** Opens the generated test spec beside your source code for instant review.

---

## 🛠️ Configuration Settings

Configure via **Settings (`Ctrl+,`) → Extensions → TestGenAI**:

| Setting | Default | Description |
|---|---|---|
| `testgenai.backendUrl` | `http://localhost:3000` | NestJS TestGenAI backend API endpoint |
| `testgenai.minCoverage` | `75` | Target minimum code coverage percentage |
| `testgenai.showDiffBeforeSaving` | `true` | Show side-by-side diff editor before writing spec |
| `testgenai.autoSaveAccepted` | `false` | Automatically overwrite `.spec.ts` when test suite passes |

---

## 📦 Local Development & Testing

1. Open this directory in VS Code:
   ```bash
   code /media/akshay/3ee97566-4736-4145-8ff8-e24a7d55ab831/esparkBiz/TestGenAI/testgenai-vscode
   ```
2. Press **`F5`** to launch an **Extension Development Host** window.
3. In the new window, open any NestJS project, right-click a `.service.ts` file, and test **"TestGenAI: Generate Unit Tests"**.

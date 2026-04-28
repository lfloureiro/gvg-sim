import { lazy, Suspense, useState } from "react";
import type { Language } from "./types";
import HomeScreen from "./features/home/HomeScreen";

const GvgSimulatorApp = lazy(() => import("./features/gvg/GvgSimulatorApp"));
const EnemyTribeAnalysisScreen = lazy(
  () => import("./features/enemy-analysis/EnemyTribeAnalysisScreen")
);

type AppView = "home" | "gvg" | "enemy";

function LoadingScreen() {
  return (
    <main className="app-shell">
      <div className="app-container">
        <div className="card">
          <p className="muted">A carregar...</p>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  const [view, setView] = useState<AppView>("home");
  const [language, setLanguage] = useState<Language>("en");

  if (view === "gvg") {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <GvgSimulatorApp
          language={language}
          onReturnHome={() => setView("home")}
        />
      </Suspense>
    );
  }

  if (view === "enemy") {
    return (
      <main className="app-shell">
        <div className="app-container">
          <Suspense fallback={<LoadingScreen />}>
            <EnemyTribeAnalysisScreen
              onBack={() => setView("home")}
              language={language}
            />
          </Suspense>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="app-container">
        <HomeScreen
          language={language}
          onLanguageChange={setLanguage}
          onOpenGvg={() => setView("gvg")}
          onOpenEnemyAnalysis={() => setView("enemy")}
        />
      </div>
    </main>
  );
}
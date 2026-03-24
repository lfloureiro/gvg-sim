import { useState } from "react";
import type { Language } from "./types";
import GvgSimulatorApp from "./features/gvg/GvgSimulatorApp";
import HomeScreen from "./features/home/HomeScreen";
import EnemyTribeAnalysisScreen from "./features/enemy-analysis/EnemyTribeAnalysisScreen";

type AppView = "home" | "gvg" | "enemy";

export default function App() {
  const [view, setView] = useState<AppView>("home");
  const [language, setLanguage] = useState<Language>("en");

  if (view === "gvg") {
    return (
      <GvgSimulatorApp
        language={language}
        onReturnHome={() => setView("home")}
      />
    );
  }

  return (
    <main className="app-shell">
      <div className="app-container">
        {view === "home" ? (
          <HomeScreen
            language={language}
            onLanguageChange={setLanguage}
            onOpenGvg={() => setView("gvg")}
            onOpenEnemyAnalysis={() => setView("enemy")}
          />
        ) : (
          <EnemyTribeAnalysisScreen
            onBack={() => setView("home")}
            language={language}
          />
        )}
      </div>
    </main>
  );
}
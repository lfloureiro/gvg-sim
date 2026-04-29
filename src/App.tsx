import { useState } from "react";
import type { Language } from "./types";
import GvgSimulatorApp from "./features/gvg/GvgSimulatorApp";
import HomeScreen from "./features/home/HomeScreen";
import EnemyTribeAnalysisScreen from "./features/enemy-analysis/EnemyTribeAnalysisScreen";

type AppView = "home" | "gvg" | "enemy";

export default function App() {
  const [view, setView] = useState<AppView>("home");
  const [language, setLanguage] = useState<Language>("en");
  const isRtl = language === "ar";

  if (view === "gvg") {
    return (
      <div dir={isRtl ? "rtl" : "ltr"} lang={language}>
        <GvgSimulatorApp
          language={language}
          onReturnHome={() => setView("home")}
        />
      </div>
    );
  }

  return (
    <main className="app-shell" dir={isRtl ? "rtl" : "ltr"} lang={language}>
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

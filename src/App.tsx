import React, { useState } from "react";
import { AuthProvider } from "./components/AuthProvider";
import SprintSelectorView from "./components/SprintSelectorView";
import RetrospectiveView from "./components/RetrospectiveView";

// -------------------------------------------------------------------
// View states
// -------------------------------------------------------------------

type AppView = "selector" | "board";

// -------------------------------------------------------------------
// App Component
// -------------------------------------------------------------------

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>("selector");
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );

  // -------------------------------------------------------------------
  // Navigate to the board for a selected session
  // -------------------------------------------------------------------

  const handleSessionSelect = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setCurrentView("board");
  };

  // -------------------------------------------------------------------
  // Navigate back to the session list
  // -------------------------------------------------------------------

  const handleBack = () => {
    setSelectedSessionId(null);
    setCurrentView("selector");
  };

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  return (
    <AuthProvider>
      <div style={styles.appWrapper}>

        {currentView === "selector" && (
          <SprintSelectorView onSessionSelect={handleSessionSelect} />
        )}

        {currentView === "board" && selectedSessionId !== null && (
          <RetrospectiveView
            sessionId={selectedSessionId}
            onBack={handleBack}
          />
        )}

      </div>
    </AuthProvider>
  );
};

// -------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  appWrapper: {
    minHeight: "100vh",
    background: "#f4f6f9",
    fontFamily: "Segoe UI, sans-serif",
  },
};

export default App;

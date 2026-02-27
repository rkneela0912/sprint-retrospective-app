import React, { useEffect, useState, useCallback } from "react";
import {
  getRetroBoardData
} from "../services/SharePointService";
import type {
  RetroBoardData
} from "../services/SharePointService";
import Header from "./Header";
import RetroBoard from "./RetroBoard";
import AdminPanel from "./AdminPanel";
import { useAuth } from "./AuthProvider";

// -------------------------------------------------------------------
// Props
// -------------------------------------------------------------------

interface RetrospectiveViewProps {
  sessionId: number;
  onBack: () => void;
}

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

const RetrospectiveView: React.FC<RetrospectiveViewProps> = ({
  sessionId,
  onBack,
}) => {
  const { userRole } = useAuth();

  const [boardData, setBoardData] = useState<RetroBoardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string>("");
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);

  // -------------------------------------------------------------------
  // Load board data
  // -------------------------------------------------------------------

  const loadBoardData = useCallback(
    async (silent: boolean = false) => {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);

      setLoadError("");

      try {
        const data = await getRetroBoardData(sessionId);
        if (!data) {
          setLoadError("Session not found or could not be loaded.");
        } else {
          setBoardData(data);
        }
      } catch (err) {
        console.error("RetrospectiveView: Failed to load board data.", err);
        setLoadError("Something went wrong while loading the board.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [sessionId]
  );

  // Load on mount
  useEffect(() => {
    loadBoardData(false);
  }, [loadBoardData]);

  // -------------------------------------------------------------------
  // Board refresh — called silently after any data change
  // -------------------------------------------------------------------

  const handleBoardRefresh = () => {
    loadBoardData(true);
  };

  // -------------------------------------------------------------------
  // Render — Loading state
  // -------------------------------------------------------------------

  if (isLoading) {
    return (
      <div style={styles.centeredMessage}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading retrospective board...</p>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Render — Error state
  // -------------------------------------------------------------------

  if (loadError || !boardData) {
    return (
      <div style={styles.centeredMessage}>
        <p style={styles.errorText}>{loadError || "Unknown error occurred."}</p>
        <button style={styles.retryButton} onClick={() => loadBoardData(false)}>
          Retry
        </button>
        <button style={styles.backButton} onClick={onBack}>
          ← Back to Sessions
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Render — Board
  // -------------------------------------------------------------------

  return (
    <div style={styles.viewWrapper}>

      {/* Refreshing indicator */}
      {isRefreshing && (
        <div style={styles.refreshingBanner}>
          Refreshing board...
        </div>
      )}

      {/* Header */}
      <Header
        session={boardData.session}
        onBack={onBack}
        onAdminClick={() => setShowAdminPanel(true)}
      />

      {/* Retro Board */}
      <RetroBoard
        boardData={boardData}
        onBoardRefresh={handleBoardRefresh}
      />

      {/* Admin Panel — Scrum Master only */}
      {showAdminPanel && userRole === "Scrum Master" && (
        <AdminPanel
          session={boardData.session}
          onClose={() => setShowAdminPanel(false)}
          onSessionUpdated={() => {
            setShowAdminPanel(false);
            loadBoardData(false);
          }}
        />
      )}

    </div>
  );
};

// -------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  viewWrapper: {
    minHeight: "100vh",
    background: "#f4f6f9",
    fontFamily: "Segoe UI, sans-serif",
  },
  centeredMessage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: "12px",
    fontFamily: "Segoe UI, sans-serif",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "4px solid #e0e0e0",
    borderTop: "4px solid #0078d4",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: "14px",
    color: "#888",
  },
  errorText: {
    fontSize: "14px",
    color: "#c0392b",
  },
  retryButton: {
    background: "#0078d4",
    border: "none",
    borderRadius: "6px",
    padding: "8px 20px",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  backButton: {
    background: "transparent",
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "8px 20px",
    color: "#555",
    fontSize: "13px",
    cursor: "pointer",
  },
  refreshingBanner: {
    background: "#e8f0fe",
    color: "#1a73e8",
    textAlign: "center",
    padding: "6px",
    fontSize: "12px",
    fontWeight: 500,
  },
};

// -------------------------------------------------------------------
// CSS keyframe for spinner — inject once into document head
// -------------------------------------------------------------------

const spinnerStyle = document.createElement("style");
spinnerStyle.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(spinnerStyle);

export default RetrospectiveView;

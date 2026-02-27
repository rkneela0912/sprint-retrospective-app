import React from "react";
import type { RetroSession } from "../services/SharePointService";
import { useAuth } from "./AuthProvider";

// -------------------------------------------------------------------
// Props
// -------------------------------------------------------------------

interface HeaderProps {
  session: RetroSession;
  onBack: () => void;
  onAdminClick: () => void;
}

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

const Header: React.FC<HeaderProps> = ({ session, onBack, onAdminClick }) => {
  const { userRole } = useAuth();

  // -------------------------------------------------------------------
  // Status badge style helper
  // -------------------------------------------------------------------

  const getStatusStyle = (status: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: "inline-block",
      padding: "3px 12px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: 600,
    };
    switch (status) {
      case "Open":
        return { ...base, background: "#e6f4ea", color: "#1e7e34" };
      case "Closed":
        return { ...base, background: "#fce8e8", color: "#c0392b" };
      default:
        return { ...base, background: "#fef9e7", color: "#b7950b" };
    }
  };

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  return (
    <div style={styles.headerWrapper}>
      <div style={styles.headerInner}>

        {/* Left — Back button + Session Info */}
        <div style={styles.left}>
          <button style={styles.backButton} onClick={onBack}>
            ← Back
          </button>
          <div style={styles.sessionInfo}>
            <h2 style={styles.sessionTitle}>{session.title}</h2>
            <div style={styles.metaRow}>
              <span style={styles.metaText}>{session.sprint}</span>
              <span style={styles.metaDivider}>·</span>
              <span style={styles.metaText}>
                {new Date(session.sessionDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span style={styles.metaDivider}>·</span>
              <span style={getStatusStyle(session.status)}>
                {session.status}
              </span>
            </div>
          </div>
        </div>

        {/* Right — Admin button (Scrum Master only) */}
        {userRole === "Scrum Master" && (
          <button style={styles.adminButton} onClick={onAdminClick}>
            ⚙ Manage Session
          </button>
        )}

      </div>

      {/* Closed session banner */}
      {session.status === "Closed" && (
        <div style={styles.closedBanner}>
          This retrospective session is closed. No new items can be submitted.
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  headerWrapper: {
    background: "#fff",
    borderBottom: "1px solid #e0e0e0",
    marginBottom: "1.5rem",
  },
  headerInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  backButton: {
    background: "transparent",
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "13px",
    cursor: "pointer",
    color: "#555",
    whiteSpace: "nowrap",
  },
  sessionInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  sessionTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "#1a1a2e",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  metaText: {
    fontSize: "13px",
    color: "#666",
  },
  metaDivider: {
    fontSize: "13px",
    color: "#ccc",
  },
  adminButton: {
    background: "#f3f3f3",
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    color: "#333",
  },
  closedBanner: {
    background: "#fce8e8",
    color: "#c0392b",
    textAlign: "center",
    padding: "8px",
    fontSize: "13px",
    fontWeight: 500,
  },
};

export default Header;

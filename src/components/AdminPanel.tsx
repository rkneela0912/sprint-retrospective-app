import React, { useState } from "react";
import type { RetroSession } from "../services/SharePointService";
import {
  updateSessionStatus,
  carryOverActions,
  getAllSessions,
} from "../services/SharePointService";


// -------------------------------------------------------------------
// Props
// -------------------------------------------------------------------

interface AdminPanelProps {
  session: RetroSession;
  onClose: () => void;
  onSessionUpdated: () => void; // Callback to refresh the board after changes
}

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

const AdminPanel: React.FC<AdminPanelProps> = ({
  session,
  onClose,
  onSessionUpdated,
}) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isCarryingOver, setIsCarryingOver] = useState<boolean>(false);
  const [carryOverSourceId, setCarryOverSourceId] = useState<number | null>(
    null
  );
  const [allSessions, setAllSessions] = useState<RetroSession[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // -------------------------------------------------------------------
  // Load all sessions for carry-over source selection
  // -------------------------------------------------------------------

  const loadSessionsForCarryOver = async () => {
    if (sessionsLoaded) return;
    const sessions = await getAllSessions();
    // Exclude the current session from the list
    setAllSessions(sessions.filter((s) => s.id !== session.id));
    setSessionsLoaded(true);
  };

  // -------------------------------------------------------------------
  // Handle session status change
  // -------------------------------------------------------------------

  const handleStatusChange = async (
    newStatus: "Draft" | "Open" | "Closed"
  ) => {
    setIsUpdatingStatus(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await updateSessionStatus(session.id, newStatus);
      setSuccessMessage(`Session status updated to "${newStatus}".`);
      onSessionUpdated();
    } catch (err) {
      console.error("AdminPanel: Failed to update session status.", err);
      setErrorMessage("Failed to update session status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // -------------------------------------------------------------------
  // Handle carry-over
  // -------------------------------------------------------------------

  const handleCarryOver = async () => {
    if (!carryOverSourceId) {
      setErrorMessage("Please select a source sprint to carry over from.");
      return;
    }

    setIsCarryingOver(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await carryOverActions(carryOverSourceId, session.id, session.sprint);
      setSuccessMessage(
        "Incomplete actions have been carried over successfully."
      );
      onSessionUpdated();
    } catch (err) {
      console.error("AdminPanel: Failed to carry over actions.", err);
      setErrorMessage("Failed to carry over actions. Please try again.");
    } finally {
      setIsCarryingOver(false);
    }
  };

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  return (
    <>
      {/* Backdrop */}
      <div style={styles.backdrop} onClick={onClose} />

      {/* Panel */}
      <div style={styles.panel}>

        {/* Panel header */}
        <div style={styles.panelHeader}>
          <h3 style={styles.panelTitle}>Manage Session</h3>
          <button style={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Session info */}
        <div style={styles.sessionInfo}>
          <p style={styles.sessionName}>{session.title}</p>
          <p style={styles.sessionMeta}>
            {session.sprint} &nbsp;·&nbsp; Current status:{" "}
            <strong>{session.status}</strong>
          </p>
        </div>

        <hr style={styles.divider} />

        {/* Section 1 — Change Session Status */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Session Status</p>
          <p style={styles.sectionDescription}>
            Set the session to <strong>Open</strong> to allow team members to
            submit feedback. Set to <strong>Closed</strong> when the
            retrospective is complete — this locks the board.
          </p>
          <div style={styles.statusButtonRow}>
            <button
              style={{
                ...styles.statusButton,
                ...(session.status === "Draft" ? styles.activeStatus : {}),
              }}
              onClick={() => handleStatusChange("Draft")}
              disabled={isUpdatingStatus || session.status === "Draft"}
            >
              Draft
            </button>
            <button
              style={{
                ...styles.statusButton,
                ...(session.status === "Open" ? styles.activeStatusGreen : {}),
              }}
              onClick={() => handleStatusChange("Open")}
              disabled={isUpdatingStatus || session.status === "Open"}
            >
              Open
            </button>
            <button
              style={{
                ...styles.statusButton,
                ...(session.status === "Closed" ? styles.activeStatusRed : {}),
              }}
              onClick={() => handleStatusChange("Closed")}
              disabled={isUpdatingStatus || session.status === "Closed"}
            >
              Close Session
            </button>
          </div>
        </div>

        <hr style={styles.divider} />

        {/* Section 2 — Carry Over Actions (FR-07) */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Carry Over Incomplete Actions</p>
          <p style={styles.sectionDescription}>
            Select a previous sprint to copy all <strong>Open</strong> and{" "}
            <strong>In Progress</strong> action items into this session.
          </p>

          <select
            style={styles.select}
            onClick={loadSessionsForCarryOver}
            onChange={(e) =>
              setCarryOverSourceId(
                e.target.value ? Number(e.target.value) : null
              )
            }
            defaultValue=""
          >
            <option value="" disabled>
              {sessionsLoaded
                ? allSessions.length === 0
                  ? "No other sessions available"
                  : "Select source sprint..."
                : "Click to load sessions..."}
            </option>
            {allSessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} — {s.sprint} ({s.status})
              </option>
            ))}
          </select>

          <button
            style={styles.carryOverButton}
            onClick={handleCarryOver}
            disabled={isCarryingOver || !carryOverSourceId}
          >
            {isCarryingOver ? "Carrying Over..." : "Carry Over Actions"}
          </button>
        </div>

        {/* Feedback messages */}
        {successMessage && (
          <p style={styles.successText}>✓ {successMessage}</p>
        )}
        {errorMessage && (
          <p style={styles.errorText}>✗ {errorMessage}</p>
        )}

      </div>
    </>
  );
};

// -------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    zIndex: 100,
  },
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "380px",
    height: "100vh",
    background: "#fff",
    boxShadow: "-4px 0 20px rgba(0,0,0,0.12)",
    zIndex: 101,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Segoe UI, sans-serif",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #e0e0e0",
  },
  panelTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    color: "#1a1a2e",
  },
  closeButton: {
    background: "transparent",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    color: "#888",
    padding: "4px 8px",
  },
  sessionInfo: {
    padding: "1rem 1.5rem 0 1.5rem",
  },
  sessionName: {
    margin: "0 0 4px 0",
    fontWeight: 600,
    fontSize: "15px",
    color: "#1a1a2e",
  },
  sessionMeta: {
    margin: 0,
    fontSize: "13px",
    color: "#666",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #f0f0f0",
    margin: "1rem 0",
  },
  section: {
    padding: "0 1.5rem",
    marginBottom: "0.5rem",
  },
  sectionTitle: {
    margin: "0 0 4px 0",
    fontSize: "13px",
    fontWeight: 700,
    color: "#333",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  sectionDescription: {
    margin: "0 0 12px 0",
    fontSize: "13px",
    color: "#666",
    lineHeight: "1.5",
  },
  statusButtonRow: {
    display: "flex",
    gap: "8px",
  },
  statusButton: {
    flex: 1,
    padding: "8px 0",
    border: "1px solid #ccc",
    borderRadius: "6px",
    background: "#f9f9f9",
    fontSize: "13px",
    cursor: "pointer",
    color: "#333",
    fontWeight: 500,
  },
  activeStatus: {
    background: "#fef9e7",
    borderColor: "#b7950b",
    color: "#b7950b",
    fontWeight: 700,
  },
  activeStatusGreen: {
    background: "#e6f4ea",
    borderColor: "#1e7e34",
    color: "#1e7e34",
    fontWeight: 700,
  },
  activeStatusRed: {
    background: "#fce8e8",
    borderColor: "#c0392b",
    color: "#c0392b",
    fontWeight: 700,
  },
  select: {
    width: "100%",
    padding: "8px 10px",
    fontSize: "13px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    marginBottom: "10px",
    boxSizing: "border-box",
  },
  carryOverButton: {
    width: "100%",
    padding: "9px",
    background: "#0078d4",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  successText: {
    margin: "0.5rem 1.5rem",
    fontSize: "13px",
    color: "#1e7e34",
    background: "#e6f4ea",
    padding: "8px 12px",
    borderRadius: "6px",
  },
  errorText: {
    margin: "0.5rem 1.5rem",
    fontSize: "13px",
    color: "#c0392b",
    background: "#fce8e8",
    padding: "8px 12px",
    borderRadius: "6px",
  },
};

export default AdminPanel;

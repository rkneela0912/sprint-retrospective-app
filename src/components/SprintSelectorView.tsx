import React, { useEffect, useState } from "react";
import {
  getAllSessions,
  createSession,
} from "../services/SharePointService";
import type{
  
  RetroSession,
} from "../services/SharePointService";
import { useAuth } from "./AuthProvider";

// -------------------------------------------------------------------
// Sprint choices — must match your SharePoint Choice column values
// -------------------------------------------------------------------

const SPRINT_CHOICES = [
  "Sprint 84",
  "Sprint 85",
  "Sprint 86",
  "Sprint 87",
  "Sprint 88",
  "Sprint 89",
  "Sprint 90",
];

// -------------------------------------------------------------------
// Props
// -------------------------------------------------------------------

interface SprintSelectorViewProps {
  onSessionSelect: (sessionId: number) => void;
}

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

const SprintSelectorView: React.FC<SprintSelectorViewProps> = ({
  onSessionSelect,
}) => {
  const { userRole } = useAuth();

  const [sessions, setSessions] = useState<RetroSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // New session form state
  const [newTitle, setNewTitle] = useState<string>("");
  const [newSprint, setNewSprint] = useState<string>(SPRINT_CHOICES[0]);
  const [newDate, setNewDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // -------------------------------------------------------------------
  // Load sessions on mount
  // -------------------------------------------------------------------

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    const data = await getAllSessions();
    setSessions(data);
    setIsLoading(false);
  };

  // -------------------------------------------------------------------
  // Create new session
  // -------------------------------------------------------------------

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      setError("Please enter a session title.");
      return;
    }
    setError("");
    setIsCreating(true);
    await createSession(newTitle.trim(), newSprint, newDate);
    setNewTitle("");
    setShowForm(false);
    await loadSessions();
    setIsCreating(false);
  };

  // -------------------------------------------------------------------
  // Status badge colour helper
  // -------------------------------------------------------------------

  const getStatusStyle = (status: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: "inline-block",
      padding: "2px 10px",
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
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Sprint Retrospectives</h1>
          <p style={styles.subtitle}>
            Select a session to view the board, or create a new one.
          </p>
        </div>
        {userRole === "Scrum Master" && (
          <button
            style={styles.primaryButton}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "+ New Session"}
          </button>
        )}
      </div>

      {/* New Session Form — visible to Scrum Masters only */}
      {showForm && userRole === "Scrum Master" && (
        <div style={styles.formCard}>
          <h3 style={{ marginTop: 0 }}>Create New Retrospective Session</h3>

          <label style={styles.label}>Session Title</label>
          <input
            style={styles.input}
            type="text"
            placeholder="e.g. Sprint 83 Retrospective"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <label style={styles.label}>Sprint</label>
          <select
            style={styles.input}
            value={newSprint}
            onChange={(e) => setNewSprint(e.target.value)}
          >
            {SPRINT_CHOICES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <label style={styles.label}>Session Date</label>
          <input
            style={styles.input}
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />

          {error && <p style={styles.errorText}>{error}</p>}

          <button
            style={styles.primaryButton}
            onClick={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create Session"}
          </button>
        </div>
      )}

      {/* Session List */}
      {isLoading ? (
        <p style={styles.loadingText}>Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p style={styles.loadingText}>
          No retrospective sessions found.{" "}
          {userRole === "Scrum Master" && "Create one to get started."}
        </p>
      ) : (
        <div style={styles.sessionList}>
          {sessions.map((session) => (
            <div
              key={session.id}
              style={styles.sessionCard}
              onClick={() => onSessionSelect(session.id)}
            >
              <div style={styles.sessionCardLeft}>
                <p style={styles.sessionTitle}>{session.title}</p>
                <p style={styles.sessionMeta}>
                  {session.sprint} &nbsp;·&nbsp;{" "}
                  {new Date(session.sessionDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div style={styles.sessionCardRight}>
                <span style={getStatusStyle(session.status)}>
                  {session.status}
                </span>
                <span style={styles.arrowIcon}>→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "Segoe UI, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "24px",
    fontWeight: 700,
    margin: 0,
    color: "#1a1a2e",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginTop: "4px",
  },
  primaryButton: {
    background: "#0078d4",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  formCard: {
    background: "#f9f9f9",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "4px",
    marginTop: "12px",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    fontSize: "14px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box",
  },
  errorText: {
    color: "#c0392b",
    fontSize: "13px",
    marginTop: "8px",
  },
  loadingText: {
    color: "#888",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "2rem",
  },
  sessionList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  sessionCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "1rem 1.25rem",
    cursor: "pointer",
    transition: "box-shadow 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  sessionCardLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  sessionTitle: {
    margin: 0,
    fontWeight: 600,
    fontSize: "15px",
    color: "#1a1a2e",
  },
  sessionMeta: {
    margin: 0,
    fontSize: "13px",
    color: "#888",
  },
  sessionCardRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  arrowIcon: {
    fontSize: "18px",
    color: "#0078d4",
  },
};

export default SprintSelectorView;

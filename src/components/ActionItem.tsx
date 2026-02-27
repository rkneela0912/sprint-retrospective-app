import React, { useState } from "react";
import type { ActionItem as ActionItemType } from "../services/SharePointService";
import { updateActionStatus } from "../services/SharePointService";

import { useAuth } from "./AuthProvider";

// -------------------------------------------------------------------
// Props
// -------------------------------------------------------------------

interface ActionItemProps {
  action: ActionItemType;
  onStatusUpdated: () => void; // Callback to refresh board after update
}

// -------------------------------------------------------------------
// Status options
// -------------------------------------------------------------------

const STATUS_OPTIONS: ActionItemType["status"][] = [
  "Open",
  "In Progress",
  "Closed",
  "Carried Over",
];

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

const ActionItem: React.FC<ActionItemProps> = ({ action, onStatusUpdated }) => {
  const { userRole, userEmail } = useAuth();

  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [localStatus, setLocalStatus] = useState(action.status);

  // -------------------------------------------------------------------
  // Determine if the current user can update the status
  // Only the assigned owner or a Scrum Master can change status
  // -------------------------------------------------------------------

  const canUpdateStatus =
    userRole === "Scrum Master" ||
    action.owner.toLowerCase() === userEmail.toLowerCase();

  // -------------------------------------------------------------------
  // Handle status change
  // -------------------------------------------------------------------

  const handleStatusChange = async (
    newStatus: ActionItemType["status"]
  ) => {
    if (newStatus === localStatus) return;

    setIsUpdating(true);
    setLocalStatus(newStatus);

    try {
      await updateActionStatus(action.id, newStatus);
      onStatusUpdated();
    } catch (err) {
      console.error("ActionItem: Failed to update status.", err);
      setLocalStatus(action.status); // Revert on failure
    } finally {
      setIsUpdating(false);
    }
  };

  // -------------------------------------------------------------------
  // Status badge style helper
  // -------------------------------------------------------------------

  const getStatusStyle = (status: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "10px",
      fontSize: "11px",
      fontWeight: 600,
    };
    switch (status) {
      case "Open":
        return { ...base, background: "#e8f0fe", color: "#1a73e8" };
      case "In Progress":
        return { ...base, background: "#fff3e0", color: "#e65100" };
      case "Closed":
        return { ...base, background: "#e6f4ea", color: "#1e7e34" };
      case "Carried Over":
        return { ...base, background: "#f3e5f5", color: "#7b1fa2" };
      default:
        return { ...base, background: "#f0f0f0", color: "#555" };
    }
  };

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  return (
    <div style={styles.wrapper}>

      {/* Carry-over indicator */}
      {action.carriedOverFrom && (
        <span style={styles.carriedOverBadge}>↩ Carried Over</span>
      )}

      {/* Action title */}
      <p style={styles.actionTitle}>{action.title}</p>

      {/* Meta row — owner, target sprint, status */}
      <div style={styles.metaRow}>

        {/* Owner */}
        <span style={styles.metaItem}>
          👤 {action.owner || "Unassigned"}
        </span>

        {/* Target sprint */}
        <span style={styles.metaItem}>
          🎯 {action.targetSprint || "—"}
        </span>

        {/* Status — dropdown if user can update, badge if read-only */}
        {canUpdateStatus ? (
          <select
            style={styles.statusSelect}
            value={localStatus}
            onChange={(e) =>
              handleStatusChange(e.target.value as ActionItemType["status"])
            }
            disabled={isUpdating}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : (
          <span style={getStatusStyle(localStatus)}>{localStatus}</span>
        )}

      </div>

      {/* Updating indicator */}
      {isUpdating && (
        <p style={styles.updatingText}>Updating...</p>
      )}

    </div>
  );
};

// -------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    background: "#f8f9ff",
    border: "1px solid #dde3f0",
    borderRadius: "6px",
    padding: "8px 10px",
    marginTop: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  carriedOverBadge: {
    display: "inline-block",
    fontSize: "11px",
    color: "#7b1fa2",
    background: "#f3e5f5",
    borderRadius: "4px",
    padding: "1px 6px",
    alignSelf: "flex-start",
  },
  actionTitle: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 500,
    color: "#1a1a2e",
    lineHeight: "1.4",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  metaItem: {
    fontSize: "12px",
    color: "#666",
  },
  statusSelect: {
    fontSize: "12px",
    padding: "2px 6px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
    color: "#333",
  },
  updatingText: {
    margin: 0,
    fontSize: "11px",
    color: "#888",
    fontStyle: "italic",
  },
};

export default ActionItem;

import React, { useState } from "react";
import type { RetroItem } from "../services/SharePointService";
import { addActionItem, voteOnItem } from "../services/SharePointService";
import { useAuth } from "./AuthProvider";
import ActionItem from "./ActionItem";

const SPRINT_CHOICES = ["Sprint 81", "Sprint 82", "Sprint 83", "Sprint 84", "Sprint 85"];

interface RetroCardProps {
  item: RetroItem;
  sessionId: number;
  sessionStatus: "Draft" | "Open" | "Closed";
  onBoardRefresh: () => void;
}

const RetroCard: React.FC<RetroCardProps> = ({
  item,
  sessionId,
  sessionStatus,
  onBoardRefresh,
}) => {
  const { userRole } = useAuth();

  const [showActionForm, setShowActionForm] = useState(false);
  const [actionTitle, setActionTitle] = useState("");
  const [actionOwner, setActionOwner] = useState("");
  const [actionTargetSprint, setActionTargetSprint] = useState(SPRINT_CHOICES[0]);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState("");

  const [isVoting, setIsVoting] = useState(false);
  const [localVotes, setLocalVotes] = useState(item.votes);

  const displayName =
    item.isAnonymous && userRole !== "Scrum Master" ? "Anonymous" : item.submittedBy;

  // ✅ Voting fixed (no stale state + no double increment)
  const handleVote = async () => {
    if (isVoting || sessionStatus === "Closed") return;

    setIsVoting(true);
    const nextVotes = localVotes + 1;

    setLocalVotes(nextVotes); // optimistic

    try {
      await voteOnItem(item.id, nextVotes); // service now expects nextVotes
    } catch (err) {
      console.error("RetroCard: Failed to vote.", err);
      setLocalVotes((prev) => Math.max(prev - 1, 0));
    } finally {
      setIsVoting(false);
    }
  };

  const handleAddAction = async () => {
    if (!actionTitle.trim()) {
      setActionError("Please enter an action description.");
      return;
    }
    if (!actionOwner.trim()) {
      setActionError("Please enter an owner email/UPN.");
      return;
    }

    // Optional: basic email-ish validation
    if (!actionOwner.includes("@")) {
      setActionError("Please enter a valid owner email/UPN (example: user@domain.com).");
      return;
    }

    setActionError("");
    setIsSubmittingAction(true);

    try {
      await addActionItem(
        actionTitle.trim(),
        item.id,
        sessionId,
        actionOwner.trim(),
        actionTargetSprint
      );

      setActionTitle("");
      setActionOwner("");
      setShowActionForm(false);
      onBoardRefresh();
    } catch (err) {
      console.error("RetroCard: Failed to add action item.", err);
      setActionError("Something went wrong. Please try again.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div style={styles.card}>
      {item.isAnonymous && (
        <span style={styles.anonymousBadge}>
          {userRole === "Scrum Master"
            ? `🔒 Anonymous (${item.submittedBy})`
            : "🔒 Anonymous"}
        </span>
      )}

      <p style={styles.cardContent}>{item.title}</p>

      <div style={styles.cardFooter}>
        <span style={styles.submittedBy}>{displayName}</span>
        <button
          style={styles.voteButton}
          onClick={handleVote}
          disabled={isVoting || sessionStatus === "Closed"}
          title="Upvote this item"
        >
          👍 {localVotes}
        </button>
      </div>

      {item.actionItems.length > 0 && (
        <div style={styles.actionItemsSection}>
          <p style={styles.actionItemsLabel}>Action Items</p>
          {item.actionItems.map((action) => (
            <ActionItem key={action.id} action={action} onStatusUpdated={onBoardRefresh} />
          ))}
        </div>
      )}

      {userRole === "Scrum Master" && sessionStatus !== "Closed" && (
        <div style={styles.addActionSection}>
          {!showActionForm ? (
            <button
              style={styles.addActionButton}
              onClick={() => setShowActionForm(true)}
            >
              + Add Action Item
            </button>
          ) : (
            <div style={styles.actionForm}>
              <input
                style={styles.input}
                type="text"
                placeholder="Action description"
                value={actionTitle}
                onChange={(e) => setActionTitle(e.target.value)}
                disabled={isSubmittingAction}
              />

              <input
                style={styles.input}
                type="text"
                placeholder="Owner email/UPN (user@domain.com)"
                value={actionOwner}
                onChange={(e) => setActionOwner(e.target.value)}
                disabled={isSubmittingAction}
              />

              <select
                style={styles.input}
                value={actionTargetSprint}
                onChange={(e) => setActionTargetSprint(e.target.value)}
                disabled={isSubmittingAction}
              >
                {SPRINT_CHOICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {actionError && <p style={styles.errorText}>{actionError}</p>}

              <div style={styles.actionFormButtons}>
                <button
                  style={styles.cancelButton}
                  onClick={() => {
                    setShowActionForm(false);
                    setActionTitle("");
                    setActionOwner("");
                    setActionError("");
                  }}
                  disabled={isSubmittingAction}
                >
                  Cancel
                </button>
                <button
                  style={styles.submitButton}
                  onClick={handleAddAction}
                  disabled={isSubmittingAction}
                >
                  {isSubmittingAction ? "Saving..." : "Save Action"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Styles unchanged
const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "10px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  anonymousBadge: {
    fontSize: "11px",
    color: "#7b1fa2",
    background: "#f3e5f5",
    borderRadius: "4px",
    padding: "2px 6px",
    alignSelf: "flex-start",
  },
  cardContent: {
    margin: 0,
    fontSize: "14px",
    color: "#1a1a2e",
    lineHeight: "1.5",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "4px",
  },
  submittedBy: {
    fontSize: "12px",
    color: "#888",
  },
  voteButton: {
    background: "transparent",
    border: "1px solid #ddd",
    borderRadius: "6px",
    padding: "3px 10px",
    fontSize: "12px",
    cursor: "pointer",
    color: "#555",
  },
  actionItemsSection: {
    marginTop: "8px",
    borderTop: "1px dashed #e0e0e0",
    paddingTop: "8px",
  },
  actionItemsLabel: {
    margin: "0 0 4px 0",
    fontSize: "11px",
    fontWeight: 700,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  addActionSection: {
    marginTop: "8px",
    borderTop: "1px dashed #e0e0e0",
    paddingTop: "8px",
  },
  addActionButton: {
    background: "transparent",
    border: "1px dashed #bbb",
    borderRadius: "6px",
    padding: "5px 10px",
    fontSize: "12px",
    color: "#888",
    cursor: "pointer",
    width: "100%",
    textAlign: "center",
  },
  actionForm: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  input: {
    width: "100%",
    padding: "6px 8px",
    fontSize: "13px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box",
  },
  errorText: {
    margin: 0,
    fontSize: "12px",
    color: "#c0392b",
  },
  actionFormButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },
  cancelButton: {
    background: "transparent",
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "5px 12px",
    fontSize: "12px",
    cursor: "pointer",
    color: "#555",
  },
  submitButton: {
    background: "#0078d4",
    border: "none",
    borderRadius: "6px",
    padding: "5px 12px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    color: "#fff",
  },
};

export default RetroCard;
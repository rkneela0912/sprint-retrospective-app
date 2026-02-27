import React, { useState } from "react";
import { addRetroItem } from "../services/SharePointService";
import { useAuth } from "./AuthProvider";

// -------------------------------------------------------------------
// Props
// -------------------------------------------------------------------

interface AddItemFormProps {
  sessionId: number;
  category: "What We Liked" | "What We Missed" | "What We Learned" | "Appreciations";
  sessionStatus: "Draft" | "Open" | "Closed";
  onItemAdded: () => void; // Callback to refresh the board after submission
}

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

const AddItemForm: React.FC<AddItemFormProps> = ({
  sessionId,
  category,
  sessionStatus,
  onItemAdded,
}) => {
  const { userEmail } = useAuth();

  const [content, setContent] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);

  // -------------------------------------------------------------------
  // Do not render the add button if session is closed
  // -------------------------------------------------------------------

  if (sessionStatus === "Closed") {
    return null;
  }

  // -------------------------------------------------------------------
  // Handle submission
  // -------------------------------------------------------------------

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Please enter your feedback before submitting.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await addRetroItem(
        sessionId,
        category,
        content.trim(),
        isAnonymous,
        userEmail
      );
      setContent("");
      setIsAnonymous(false);
      setShowForm(false);
      onItemAdded(); // Trigger board refresh
    } catch (err) {
      console.error("AddItemForm: Failed to submit item.", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------------
  // Handle Enter key to submit
  // -------------------------------------------------------------------

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  return (
    <div style={styles.wrapper}>
      {!showForm ? (
        // Collapsed state — show Add button
        <button style={styles.addButton} onClick={() => setShowForm(true)}>
          + Add Item
        </button>
      ) : (
        // Expanded state — show form
        <div style={styles.formContainer}>
          <textarea
            style={styles.textarea}
            placeholder="Type your feedback here... (Press Enter to submit)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            autoFocus
            disabled={isSubmitting}
          />

          {/* Anonymous toggle */}
          <label style={styles.anonymousLabel}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              disabled={isSubmitting}
              style={{ marginRight: "6px" }}
            />
            Submit anonymously
          </label>

          {/* Error message */}
          {error && <p style={styles.errorText}>{error}</p>}

          {/* Action buttons */}
          <div style={styles.buttonRow}>
            <button
              style={styles.cancelButton}
              onClick={() => {
                setShowForm(false);
                setContent("");
                setError("");
                setIsAnonymous(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              style={styles.submitButton}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    marginTop: "12px",
  },
  addButton: {
    width: "100%",
    padding: "8px",
    background: "transparent",
    border: "1px dashed #bbb",
    borderRadius: "6px",
    color: "#888",
    fontSize: "13px",
    cursor: "pointer",
    textAlign: "center",
    transition: "background 0.2s",
  },
  formContainer: {
    background: "#fff",
    border: "1px solid #d0d0d0",
    borderRadius: "8px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  textarea: {
    width: "100%",
    padding: "8px",
    fontSize: "14px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    resize: "vertical",
    fontFamily: "Segoe UI, sans-serif",
    boxSizing: "border-box",
    outline: "none",
  },
  anonymousLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: "13px",
    color: "#555",
    cursor: "pointer",
  },
  errorText: {
    color: "#c0392b",
    fontSize: "12px",
    margin: 0,
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },
  cancelButton: {
    background: "transparent",
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "6px 14px",
    fontSize: "13px",
    cursor: "pointer",
    color: "#555",
  },
  submitButton: {
    background: "#0078d4",
    border: "none",
    borderRadius: "6px",
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    color: "#fff",
  },
};

export default AddItemForm;

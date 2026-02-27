import React from "react";
import type { RetroItem } from "../services/SharePointService";
import RetroCard from "./RetroCard";
import AddItemForm from "./AddItemForm";

// -------------------------------------------------------------------
// Column colour themes
// -------------------------------------------------------------------

const COLUMN_THEMES: Record<
  string,
  { header: string; border: string; background: string; icon: string }
> = {
  "What We Liked": {
    icon: "😊",
    header: "#1e7e34",
    border: "#b7dfbf",
    background: "#f0faf2",
  },
  "What We Missed": {
    icon: "😔",
    header: "#c0392b",
    border: "#f5c6c6",
    background: "#fff8f8",
  },
  "What We Learned": {
    icon: "💡",
    header: "#0078d4",
    border: "#bdd7f5",
    background: "#f0f7ff",
  },
  "Appreciations": {
    icon: "🙏",
    header: "#b100d4",
    border: "#bdd7f5",
    background: "#eadfec",
  }
};

// -------------------------------------------------------------------
// Props
// -------------------------------------------------------------------

interface RetroColumnProps {
  category: "What We Liked" | "What We Missed" | "What We Learned"| "Appreciations";
  items: RetroItem[];
  sessionId: number;
  sessionStatus: "Draft" | "Open" | "Closed";
  onBoardRefresh: () => void;
}

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

const RetroColumn: React.FC<RetroColumnProps> = ({
  category,
  items,
  sessionId,
  sessionStatus,
  onBoardRefresh,
}) => {
  const theme = COLUMN_THEMES[category] ?? {
    icon: "📌",
    header: "#555",
    border: "#ddd",
    background: "#fafafa",
  };

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  return (
    <div
      style={{
        ...styles.column,
        border: `1px solid ${theme.border}`,
        background: theme.background,
      }}
    >
      {/* Column header */}
      <div
        style={{
          ...styles.columnHeader,
          borderBottom: `2px solid ${theme.border}`,
        }}
      >
        <span style={styles.columnIcon}>{theme.icon}</span>
        <span
          style={{
            ...styles.columnTitle,
            color: theme.header,
          }}
        >
          {category}
        </span>
        <span style={styles.itemCount}>{items.length}</span>
      </div>

      {/* Cards list */}
      <div style={styles.cardsList}>
        {items.length === 0 ? (
          <p style={styles.emptyText}>
            No items yet.{" "}
            {sessionStatus === "Open" && "Be the first to add one!"}
          </p>
        ) : (
          items.map((item) => (
            <RetroCard
              key={item.id}
              item={item}
              sessionId={sessionId}
              sessionStatus={sessionStatus}
              onBoardRefresh={onBoardRefresh}
            />
          ))
        )}
      </div>

      {/* Add item form — hidden when session is closed */}
      <AddItemForm
        sessionId={sessionId}
        category={category}
        sessionStatus={sessionStatus}
        onItemAdded={onBoardRefresh}
      />
    </div>
  );
};

// -------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  column: {
    flex: "1 1 0",
    minWidth: "280px",
    maxWidth: "420px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  columnHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 14px",
    background: "rgba(255,255,255,0.6)",
  },
  columnIcon: {
    fontSize: "18px",
  },
  columnTitle: {
    flex: 1,
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "0.3px",
  },
  itemCount: {
    background: "rgba(0,0,0,0.08)",
    borderRadius: "10px",
    padding: "1px 8px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#555",
  },
  cardsList: {
    flex: 1,
    padding: "12px",
    overflowY: "auto",
    maxHeight: "calc(100vh - 260px)",
  },
  emptyText: {
    fontSize: "13px",
    color: "#aaa",
    textAlign: "center",
    marginTop: "1.5rem",
    fontStyle: "italic",
  },
};

export default RetroColumn;

import React from "react";
import type { RetroBoardData } from "../services/SharePointService";
import RetroColumn from "./RetroColumn";

// -------------------------------------------------------------------
// Props
// -------------------------------------------------------------------

interface RetroBoardProps {
  boardData: RetroBoardData;
  onBoardRefresh: () => void;
}

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

const RetroBoard: React.FC<RetroBoardProps> = ({
  boardData,
  onBoardRefresh,
}) => {
  const { session, liked, missed, learned, appreciations } = boardData;

  return (
    <div style={styles.boardWrapper}>
      <div style={styles.boardInner}>

        {/* What We Liked */}
        <RetroColumn
          category="What We Liked"
          items={liked}
          sessionId={session.id}
          sessionStatus={session.status}
          onBoardRefresh={onBoardRefresh}
        />

        {/* What We Missed */}
        <RetroColumn
          category="What We Missed"
          items={missed}
          sessionId={session.id}
          sessionStatus={session.status}
          onBoardRefresh={onBoardRefresh}
        />

        {/* What We Learned */}
        <RetroColumn
          category="What We Learned"
          items={learned}
          sessionId={session.id}
          sessionStatus={session.status}
          onBoardRefresh={onBoardRefresh}
        />

        {/* What We Learned */}
        <RetroColumn
          category="Appreciations"
          items={appreciations}
          sessionId={session.id}
          sessionStatus={session.status}
          onBoardRefresh={onBoardRefresh}
        />

      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  boardWrapper: {
    padding: "0 2rem 2rem 2rem",
    overflowX: "auto",
  },
  boardInner: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    minWidth: "860px", // Prevents columns from collapsing on smaller screens
  },
};

export default RetroBoard;

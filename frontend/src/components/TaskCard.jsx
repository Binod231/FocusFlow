import { useState } from "react";
import styles from "./TaskCard.module.css";
import { CATEGORY_META, BLOCK_META } from "../constants";

function ScoreRing({ value, max = 10, color }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const filled = (value / max) * circ;

  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className={styles.ring} aria-hidden="true">
      <circle cx="20" cy="20" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="none"/>
      <circle
        cx="20" cy="20" r={r}
        stroke={color}
        strokeWidth="3"
        fill="none"
        strokeDasharray={`${filled} ${circ}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        className={styles.ringFill}
      />
      <text x="20" y="24" textAnchor="middle" fill={color} fontSize="9" fontWeight="700" fontFamily="monospace">
        {value}
      </text>
    </svg>
  );
}

export default function TaskCard({ task, rank, style }) {
  const [done, setDone] = useState(false);
  const catMeta = CATEGORY_META[task.category] || CATEGORY_META.routine;
  const blockMeta = BLOCK_META[task.time_block] || BLOCK_META.anytime;

  const scoreColor = task.priority_score >= 7.5
    ? "var(--rose)"
    : task.priority_score >= 5
    ? "var(--amber)"
    : "var(--green)";

  const rankLabel = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;

  return (
    <div
      className={`${styles.card} ${done ? styles.done : ""}`}
      style={style}
      role="listitem"
      aria-label={`Task ${rank}: ${task.title}`}
    >
      {/* Rank */}
      <div className={styles.rank} aria-hidden="true">
        {rank <= 3 ? (
          <span className={styles.rankEmoji}>{rankLabel}</span>
        ) : (
          <span className={styles.rankNum}>#{rank}</span>
        )}
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <span className={`${styles.title} ${done ? styles.titleDone : ""}`}>
            {task.title}
          </span>
          <button
            className={`${styles.checkbox} ${done ? styles.checked : ""}`}
            onClick={() => setDone(d => !d)}
            aria-label={done ? "Mark as incomplete" : "Mark as done"}
            type="button"
          >
            {done && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>

        <p className={styles.insight}>{task.ai_insight}</p>

        <div className={styles.tags}>
          {/* Time */}
          <span className={styles.tag}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1"/>
              <path d="M5.5 3v2.75l1.5 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
            </svg>
            {formatMins(task.estimated_minutes)}
          </span>
          {/* Block */}
          <span className={styles.tag}>
            {blockMeta.emoji} {blockMeta.label}
          </span>
          {/* Category */}
          <span
            className={styles.tag}
            style={{ color: catMeta.color, background: catMeta.bg, border: `1px solid ${catMeta.border}` }}
          >
            {catMeta.label}
          </span>
        </div>

        {/* Score bars */}
        <div className={styles.bars} aria-hidden="true">
          <div className={styles.bar}>
            <span className={styles.barLabel}>Urgency</span>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: `${task.urgency * 10}%`, background: "var(--amber)" }} />
            </div>
            <span className={styles.barVal}>{task.urgency}</span>
          </div>
          <div className={styles.bar}>
            <span className={styles.barLabel}>Impact</span>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: `${task.impact * 10}%`, background: "var(--indigo)" }} />
            </div>
            <span className={styles.barVal}>{task.impact}</span>
          </div>
        </div>
      </div>

      {/* Score */}
      <div className={styles.scoreCol} aria-label={`Score ${task.priority_score}`}>
        <ScoreRing value={task.priority_score?.toFixed(1)} color={scoreColor} />
        <span className={styles.scoreLabel}>score</span>
      </div>
    </div>
  );
}

function formatMins(m) {
  if (!m || m < 1) return "< 1m";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60), r = m % 60;
  return r === 0 ? `${h}h` : `${h}h ${r}m`;
}

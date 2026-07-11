import { useState } from "react";
import styles from "./TaskCard.module.css";
import { CATEGORY_META, BLOCK_META } from "../constants";

function ScoreRing({ value, max = 10, color }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const filled = (parseFloat(value) / max) * circ;

  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className={styles.ring} aria-hidden="true">
      {/* Background track */}
      <circle cx="22" cy="22" r={r} stroke="rgba(255,255,255,0.05)" strokeWidth="3.5" fill="none"/>
      {/* Progress */}
      <circle
        cx="22" cy="22" r={r}
        stroke={color}
        strokeWidth="3.5"
        fill="none"
        strokeDasharray={`${filled} ${circ}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        className={styles.ringFill}
        style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
      />
      {/* Value text */}
      <text x="22" y="26" textAnchor="middle" fill={color} fontSize="10" fontWeight="700" fontFamily="monospace">
        {value}
      </text>
    </svg>
  );
}

function DifficultyDots({ score }) {
  const level = score >= 8 ? 3 : score >= 5 ? 2 : 1;
  const colors = ["var(--green)", "var(--amber)", "var(--rose)"];
  const labels = ["Easy", "Medium", "Hard"];
  return (
    <span className={styles.difficulty} title={labels[level - 1]} aria-label={`Difficulty: ${labels[level - 1]}`}>
      {[1, 2, 3].map(d => (
        <span
          key={d}
          className={styles.diffDot}
          style={{ background: d <= level ? colors[level - 1] : "var(--bg-5)" }}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export default function TaskCard({ task, rank, style }) {
  const [done, setDone] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const catMeta = CATEGORY_META[task.category] || CATEGORY_META.routine;
  const blockMeta = BLOCK_META[task.time_block] || BLOCK_META.anytime;

  const scoreColor =
    task.priority_score >= 7.5 ? "var(--rose)" :
    task.priority_score >= 5   ? "var(--amber)" :
                                  "var(--green)";

  const rankEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <div
      className={`${styles.card} ${done ? styles.done : ""} ${expanded ? styles.expanded : ""}`}
      style={style}
      role="listitem"
      aria-label={`Task ${rank}: ${task.title}`}
    >
      {/* Rank accent */}
      {rank <= 3 && (
        <div className={styles.rankAccent} aria-hidden="true" />
      )}

      <div className={styles.cardInner}>
        {/* Left: rank */}
        <div className={styles.rankCol} aria-hidden="true">
          {rankEmoji ? (
            <span className={styles.rankEmoji}>{rankEmoji}</span>
          ) : (
            <span className={styles.rankNum}>#{rank}</span>
          )}
        </div>

        {/* Center: body */}
        <div className={styles.body}>
          {/* Title row */}
          <div className={styles.titleRow}>
            <span className={`${styles.title} ${done ? styles.titleDone : ""}`}>
              {task.title}
            </span>
            <div className={styles.titleActions}>
              <DifficultyDots score={task.priority_score} />
              <button
                className={styles.expandBtn}
                onClick={() => setExpanded(e => !e)}
                aria-label={expanded ? "Collapse task details" : "Expand task details"}
                aria-expanded={expanded}
                type="button"
              >
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                  aria-hidden="true"
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                className={`${styles.checkbox} ${done ? styles.checked : ""}`}
                onClick={() => setDone(d => !d)}
                aria-label={done ? "Mark as incomplete" : "Mark as done"}
                type="button"
              >
                {done && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className={styles.tags}>
            <span className={styles.tag}>
              <svg width="10" height="10" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1"/>
                <path d="M5.5 3v2.75l1.5 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
              </svg>
              {formatMins(task.estimated_minutes)}
            </span>
            <span className={styles.tag}>
              {blockMeta.emoji} {blockMeta.label}
            </span>
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
                <div
                  className={styles.barFill}
                  style={{ width: `${task.urgency * 10}%`, background: "var(--amber)" }}
                />
              </div>
              <span className={styles.barVal}>{task.urgency}</span>
            </div>
            <div className={styles.bar}>
              <span className={styles.barLabel}>Impact</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${task.impact * 10}%`, background: "var(--indigo-light)" }}
                />
              </div>
              <span className={styles.barVal}>{task.impact}</span>
            </div>
          </div>

          {/* Expanded: AI insight */}
          {expanded && (
            <div className={styles.insightExpanded} role="note" aria-label="AI insight">
              <div className={styles.insightHeader}>
                <span className={styles.insightIcon} aria-hidden="true">🧠</span>
                <span className={styles.insightLabel}>AI Insight</span>
              </div>
              <p className={styles.insightText}>{task.ai_insight}</p>
            </div>
          )}
        </div>

        {/* Right: score ring */}
        <div className={styles.scoreCol} aria-label={`Priority score: ${task.priority_score}`}>
          <ScoreRing
            value={task.priority_score?.toFixed(1)}
            color={scoreColor}
          />
          <span className={styles.scoreLabel}>score</span>
        </div>
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

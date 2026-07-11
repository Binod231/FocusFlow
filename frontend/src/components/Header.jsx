import { useState } from "react";
import styles from "./Header.module.css";
import { useStreak } from "../hooks";

export default function Header() {
  const { streak, isNewDay } = useStreak();
  const [showStreakTooltip, setShowStreakTooltip] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <a href="/" className={styles.logo} aria-label="FocusFlow home">
          <div className={styles.logoMark} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8.5" stroke="url(#logoGrad)" strokeWidth="1.5"/>
              <path d="M6.5 10.5l2.5 2.5 5-5" stroke="url(#logoGrad)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="logoGrad" x1="2" y1="2" x2="18" y2="18" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#818cf8"/>
                  <stop offset="1" stopColor="#6366f1"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className={styles.logoText}>
            <span className={styles.wordmark}>FocusFlow</span>
            <span className={styles.wordmarkSub}>AI Priority Engine</span>
          </div>
        </a>

        {/* Center — challenge badge */}
        <div className={styles.challengeBadge} aria-label="AWS Weekend Productivity Challenge">
          <span className={styles.challengeDot} aria-hidden="true" />
          <span className={styles.challengeText}>AWS Weekend Challenge</span>
          <span className={styles.challengeYear}>2026</span>
        </div>

        {/* Right group */}
        <div className={styles.rightGroup}>
          {/* Streak counter */}
          {streak > 0 && (
            <div
              className={`${styles.streak} ${isNewDay ? styles.streakNew : ""}`}
              onMouseEnter={() => setShowStreakTooltip(true)}
              onMouseLeave={() => setShowStreakTooltip(false)}
              aria-label={`${streak}-day focus streak`}
              role="status"
            >
              <span className={styles.streakFlame} aria-hidden="true">🔥</span>
              <span className={styles.streakNum}>{streak}</span>
              <span className={styles.streakLabel}>day{streak !== 1 ? "s" : ""}</span>
              {showStreakTooltip && (
                <div className={styles.tooltip} role="tooltip">
                  {streak === 1
                    ? "You started your streak today!"
                    : `${streak}-day focus streak — keep it up!`}
                </div>
              )}
            </div>
          )}

          {/* Status indicator */}
          <div className={styles.statusPill} aria-label="Service status: online">
            <span className={styles.statusDot} aria-hidden="true" />
            <span className={styles.statusText}>Online</span>
          </div>

          {/* GitHub link */}
          <a
            href="https://github.com/Binod231/FocusFlow"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconBtn}
            aria-label="View source on GitHub"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}

import { useMemo } from "react";
import styles from "./StatsBar.module.css";
import { CATEGORY_META } from "../constants";

export default function StatsBar({ tasks }) {
  const stats = useMemo(() => {
    if (!tasks || tasks.length === 0) return null;

    const totalMins = tasks.reduce((a, t) => a + (t.estimated_minutes || 0), 0);
    const avgScore = tasks.reduce((a, t) => a + (t.priority_score || 0), 0) / tasks.length;
    const topCategory = Object.entries(
      tasks.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0];

    const completedCount = 0; // would need state lifting for real tracking

    return {
      totalMins,
      avgScore: avgScore.toFixed(1),
      topCategory: topCategory?.[0],
      taskCount: tasks.length,
      highPriority: tasks.filter(t => t.priority_score >= 7.5).length,
    };
  }, [tasks]);

  if (!stats) return null;

  const catMeta = stats.topCategory
    ? (CATEGORY_META[stats.topCategory] || CATEGORY_META.routine)
    : null;

  function formatMins(m) {
    if (!m) return "0m";
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60), r = m % 60;
    return r === 0 ? `${h}h` : `${h}h ${r}m`;
  }

  return (
    <div className={styles.statsBar} aria-label="Session statistics">
      <StatItem
        value={stats.taskCount}
        label="Total tasks"
        color="var(--indigo-light)"
        icon="📋"
      />
      <div className={styles.divider} aria-hidden="true" />
      <StatItem
        value={formatMins(stats.totalMins)}
        label="Est. work time"
        color="var(--amber)"
        icon="⏱"
      />
      <div className={styles.divider} aria-hidden="true" />
      <StatItem
        value={stats.avgScore}
        label="Avg. score"
        color="var(--violet)"
        icon="📊"
      />
      <div className={styles.divider} aria-hidden="true" />
      <StatItem
        value={stats.highPriority}
        label="High priority"
        color="var(--rose)"
        icon="🔥"
      />
      {catMeta && (
        <>
          <div className={styles.divider} aria-hidden="true" />
          <div className={styles.statItem}>
            <span className={styles.statIcon} aria-hidden="true">🏷</span>
            <div className={styles.statBody}>
              <span className={styles.statValue} style={{ color: catMeta.color }}>
                {catMeta.label}
              </span>
              <span className={styles.statLabel}>Top category</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatItem({ value, label, color, icon }) {
  return (
    <div className={styles.statItem}>
      <span className={styles.statIcon} aria-hidden="true">{icon}</span>
      <div className={styles.statBody}>
        <span className={styles.statValue} style={{ color }}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import styles from "./Hero.module.css";
import { useStreak, useHistory } from "../hooks";

const STATS = [
  { value: "2s", label: "AI response" },
  { value: "10×", label: "scoring factors" },
  { value: "3", label: "time blocks" },
];

export default function Hero() {
  const { streak } = useStreak();
  const history = useHistory();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    { icon: "⚡", label: "Smart Prioritization", desc: "Urgency × Impact scoring" },
    { icon: "🗓", label: "Daily Scheduling", desc: "Morning · Afternoon · Evening" },
    { icon: "🧠", label: "AI Coaching Tips", desc: "Personalized to your tasks" },
    { icon: "📊", label: "Progress Tracking", desc: "Streak & session history" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature(f => (f + 1) % features.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [features.length]);

  return (
    <section className={styles.hero} aria-labelledby="hero-h1">
      {/* Eyebrow */}
      <div className={styles.eyebrow}>
        <span className={styles.eyebrowDot} aria-hidden="true" />
        <span>AWS Weekend Productivity Challenge</span>
        <span className={styles.eyebrowDivider} aria-hidden="true">·</span>
        <span className={styles.eyebrowHighlight}>July 2026</span>
      </div>

      {/* Headline */}
      <h1 id="hero-h1" className={styles.title}>
        Stop guessing.{" "}
        <span className={styles.titleGradient}>Start doing.</span>
      </h1>

      {/* Subtext */}
      <p className={styles.body}>
        Brain-dump your tasks and let AI handle the hard part — ranking every
        item by urgency and impact so you always know exactly what to work on next.
      </p>

      {/* Stats row */}
      <div className={styles.stats} aria-label="Key stats">
        {STATS.map(s => (
          <div key={s.label} className={styles.stat}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
        {streak > 0 && (
          <div className={styles.stat}>
            <span className={`${styles.statValue} ${styles.statFire}`}>🔥 {streak}</span>
            <span className={styles.statLabel}>day streak</span>
          </div>
        )}
        {history.length > 0 && (
          <div className={styles.stat}>
            <span className={styles.statValue}>{history.length}</span>
            <span className={styles.statLabel}>session{history.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Feature pills — animated cycling */}
      <div className={styles.features} aria-label="Features">
        {features.map((f, i) => (
          <button
            key={i}
            className={`${styles.featurePill} ${i === activeFeature ? styles.featurePillActive : ""}`}
            onClick={() => setActiveFeature(i)}
            type="button"
            aria-pressed={i === activeFeature}
          >
            <span aria-hidden="true">{f.icon}</span>
            <span className={styles.featureLabel}>{f.label}</span>
            {i === activeFeature && (
              <span className={styles.featureDesc}>{f.desc}</span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

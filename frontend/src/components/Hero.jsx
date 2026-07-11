import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-h1">
      {/* Eyebrow */}
      <div className={styles.eyebrow}>
        <span className={styles.eyebrowDot} aria-hidden="true" />
        AWS Weekend Productivity Challenge · July 2026
      </div>

      <h1 id="hero-h1" className={styles.title}>
        Stop guessing<br/>what to do next.
      </h1>

      <p className={styles.body}>
        Brain-dump your tasks. FocusFlow's AI scores each one by urgency and impact,
        then hands you a clear, ordered plan — so you can stop deciding and start doing.
      </p>

      <div className={styles.pills}>
        <Pill icon="⚡" label="2s AI response" />
        <Pill icon="📊" label="Urgency × Impact scoring" />
        <Pill icon="🗓" label="Smart daily schedule" />
        <Pill icon="✅" label="Mark tasks done" />
      </div>
    </section>
  );
}

function Pill({ icon, label }) {
  return (
    <div className={styles.pill}>
      <span aria-hidden="true">{icon}</span>
      {label}
    </div>
  );
}

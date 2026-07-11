import "./index.css";
import styles from "./App.module.css";
import Header from "./components/Header";
import Hero from "./components/Hero";
import InputPanel from "./components/InputPanel";
import Results from "./components/Results";
import { usePrioritize } from "./hooks";

export default function App() {
  const { input, setInput, result, loading, error, setError, prioritize } = usePrioritize();

  return (
    <div className={styles.app}>
      {/* Animated background orbs */}
      <div className={styles.bgCanvas} aria-hidden="true">
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
      </div>

      <Header />

      <main className={styles.main} id="main-content">
        <div className={styles.container}>
          <Hero />

          <div className={styles.layout}>
            <InputPanel
              input={input}
              setInput={setInput}
              onSubmit={prioritize}
              loading={loading}
              error={error}
              setError={setError}
            />

            {result && <Results data={result} />}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLeft}>
            <span className={styles.footerLogo}>FocusFlow</span>
            <span className={styles.footerSep}>·</span>
            <span className={styles.footerTagline}>AWS Weekend Productivity Challenge 2026</span>
          </div>

          <div className={styles.footerRight}>
            <div className={styles.footerTechStack}>
              <span className={`${styles.techBadge} ${styles.aws}`}>
                <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 2L2 7v6l8 5 8-5V7L10 2z"/>
                </svg>
                Bedrock
              </span>
              <span className={`${styles.techBadge} ${styles.lambda}`}>λ Lambda</span>
              <span className={`${styles.techBadge} ${styles.dynamo}`}>⚡ DynamoDB</span>
            </div>

            <div className={styles.footerLinks}>
              <a
                href="https://github.com/Binod231/FocusFlow"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

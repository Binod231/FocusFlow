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
      <Header />

      <main className={styles.main} id="main-content">
        <div className={styles.container}>
          <Hero />

          <div className={styles.layout}>
            {/* Input always visible */}
            <InputPanel
              input={input}
              setInput={setInput}
              onSubmit={prioritize}
              loading={loading}
              error={error}
              setError={setError}
            />

            {/* Results slide in when ready */}
            {result && <Results data={result} />}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLeft}>
            <span className={styles.footerLogo}>FocusFlow</span>
            <span className={styles.footerSep}>·</span>
            <span>AWS Weekend Productivity Challenge 2026</span>
          </div>
          <div className={styles.footerRight}>
            <span>Built with</span>
            <span className={styles.awsOrange}>Amazon Bedrock</span>
            <span className={styles.footerSep}>·</span>
            <span>Lambda</span>
            <span className={styles.footerSep}>·</span>
            <span>DynamoDB</span>
            <span className={styles.footerSep}>·</span>
            <span>Amplify</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

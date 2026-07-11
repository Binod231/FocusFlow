import { useState, useRef, useEffect } from "react";
import styles from "./InputPanel.module.css";
import { EXAMPLE_TASKS } from "../constants";

export default function InputPanel({ input, setInput, onSubmit, loading, error, setError }) {
  const textareaRef = useRef(null);
  const [focused, setFocused] = useState(false);

  const charLen = input.length;
  const taskCount = input.trim() ? input.trim().split("\n").filter(l => l.trim()).length : 0;

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(el.scrollHeight, 200) + "px";
  }, [input]);

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit(input);
    }
  }

  function loadExample() {
    setInput(EXAMPLE_TASKS);
    setError(null);
    textareaRef.current?.focus();
  }

  return (
    <section className={styles.panel}>
      <div className={styles.topRow}>
        <div className={styles.headGroup}>
          <h2 className={styles.heading}>What's on your plate today?</h2>
          <p className={styles.sub}>
            One task per line — paste a list, brain-dump, or type as you go.
          </p>
        </div>
        <button className={styles.exampleBtn} onClick={loadExample} type="button">
          Try an example
        </button>
      </div>

      <div className={`${styles.textareaWrap} ${focused ? styles.focused : ""} ${error ? styles.hasError : ""}`}>
        <textarea
          ref={textareaRef}
          id="tasks-input"
          className={styles.textarea}
          value={input}
          onChange={e => { setInput(e.target.value); if (error) setError(null); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={"• Fix the production bug\n• Reply to client email\n• Review pull requests\n• Prepare meeting notes\n• Call the dentist"}
          maxLength={5000}
          aria-label="Your task list"
          aria-describedby={error ? "input-error" : "input-hint"}
          spellCheck={false}
        />

        <div className={styles.textareaFooter}>
          <span id="input-hint" className={styles.hint}>
            {taskCount > 0 ? (
              <><strong>{taskCount}</strong> task{taskCount !== 1 ? "s" : ""} detected &middot; Ctrl+Enter to go</>
            ) : (
              "Type one task per line"
            )}
          </span>
          <span className={`${styles.charCount} ${charLen > 4500 ? styles.charWarn : ""}`}>
            {charLen.toLocaleString()} / 5,000
          </span>
        </div>
      </div>

      {error && (
        <div id="input-error" className={styles.errorMsg} role="alert">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="6.5" stroke="currentColor"/>
            <path d="M7 4.5v3M7 9.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      <button
        id="prioritize-btn"
        className={`${styles.submitBtn} ${loading ? styles.loading : ""}`}
        onClick={() => onSubmit(input)}
        disabled={loading}
        type="button"
        aria-label="Prioritize tasks with AI"
      >
        {loading ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            <span>Thinking…</span>
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 1.333L9.847 5.96l4.82.442-3.654 3.173 1.094 4.691L8 11.667l-4.107 2.599L5 9.575 1.333 6.402l4.82-.441L8 1.333z" fill="currentColor"/>
            </svg>
            <span>Prioritize with AI</span>
          </>
        )}
      </button>

      <p className={styles.poweredBy}>
        Powered by{" "}
        <span className={styles.bedrockBadge}>Amazon Bedrock Nova Lite</span>
        {" "}· AWS Lambda · DynamoDB
      </p>
    </section>
  );
}

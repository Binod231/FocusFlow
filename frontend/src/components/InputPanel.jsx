import { useState, useRef, useEffect } from "react";
import styles from "./InputPanel.module.css";
import { EXAMPLE_TASKS } from "../constants";
import { useHistory } from "../hooks";

export default function InputPanel({ input, setInput, onSubmit, loading, error, setError }) {
  const textareaRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const history = useHistory();

  const charLen = input.length;
  const lines = input.trim() ? input.trim().split("\n").filter(l => l.trim()) : [];
  const taskCount = lines.length;

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
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function clearInput() {
    setInput("");
    setError(null);
    textareaRef.current?.focus();
  }

  function loadFromHistory(entry) {
    const tasks = entry.rawTasks || entry.topTask || "";
    if (tasks) {
      setInput(tasks);
      setError(null);
      setShowHistory(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }

  // Estimated time
  const estimatedMinutes = taskCount * 30;
  const estimatedDisplay = estimatedMinutes < 60
    ? `~${estimatedMinutes}m`
    : `~${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60 > 0 ? `${estimatedMinutes % 60}m` : ""}`;

  return (
    <section className={styles.panel}>
      {/* Header row */}
      <div className={styles.topRow}>
        <div className={styles.headGroup}>
          <div className={styles.headingRow}>
            <h2 className={styles.heading}>What's on your plate today?</h2>
            {taskCount > 0 && (
              <span className={styles.taskBadge} aria-live="polite">
                {taskCount} task{taskCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className={styles.sub}>
            One task per line — paste a list, brain-dump, or type as you go.
          </p>
        </div>

        <div className={styles.actionGroup}>
          {history.length > 0 && (
            <div className={styles.historyWrap}>
              <button
                className={styles.iconActionBtn}
                onClick={() => setShowHistory(v => !v)}
                type="button"
                aria-label="View recent sessions"
                title="Recent sessions"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </button>
              {showHistory && (
                <div className={styles.historyDropdown}>
                  <div className={styles.historyHeader}>Recent Sessions</div>
                  {history.map(entry => (
                    <button
                      key={entry.id}
                      className={styles.historyItem}
                      onClick={() => loadFromHistory(entry)}
                      type="button"
                    >
                      <div className={styles.historyItemTop}>
                        <span className={styles.historyDate}>{entry.date}</span>
                        <span className={styles.historyCount}>{entry.taskCount} tasks</span>
                      </div>
                      <div className={styles.historyTopTask}>{entry.topTask}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button className={styles.exampleBtn} onClick={loadExample} type="button">
            Try example
          </button>
        </div>
      </div>

      {/* Textarea */}
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
          placeholder={"• Fix the production bug\n• Reply to client email\n• Review pull requests\n• Prepare meeting slides\n• Call the dentist"}
          maxLength={5000}
          aria-label="Your task list"
          aria-describedby={error ? "input-error" : "input-hint"}
          spellCheck={false}
        />

        {/* Task lines preview */}
        {taskCount > 0 && (
          <div className={styles.lineNumbers} aria-hidden="true">
            {lines.map((_, i) => (
              <span key={i} className={styles.lineNum}>{i + 1}</span>
            ))}
          </div>
        )}

        <div className={styles.textareaFooter}>
          <span id="input-hint" className={styles.hint}>
            {taskCount > 0 ? (
              <>
                <strong>{taskCount}</strong> task{taskCount !== 1 ? "s" : ""}
                <span className={styles.hintSep}>·</span>
                <span className={styles.hintTime}>{estimatedDisplay} estimated</span>
                <span className={styles.hintSep}>·</span>
                <span className={styles.hintShortcut}>⌘↵ to prioritize</span>
              </>
            ) : (
              <span className={styles.hintEmpty}>Type one task per line, then hit Prioritize</span>
            )}
          </span>

          <div className={styles.footerActions}>
            {input.length > 0 && (
              <button
                className={styles.clearBtn}
                onClick={clearInput}
                type="button"
                aria-label="Clear all tasks"
                title="Clear"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                Clear
              </button>
            )}
            <span className={`${styles.charCount} ${charLen > 4500 ? styles.charWarn : ""}`}>
              {charLen.toLocaleString()} / 5,000
            </span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div id="input-error" className={styles.errorMsg} role="alert" aria-live="assertive">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M7 4.5v3M7 9.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        id="prioritize-btn"
        className={`${styles.submitBtn} ${loading ? styles.loading : ""}`}
        onClick={() => onSubmit(input)}
        disabled={loading}
        type="button"
        aria-label="Prioritize tasks with AI"
        aria-busy={loading}
      >
        {loading ? (
          <div className={styles.loadingContent}>
            <span className={styles.spinner} aria-hidden="true" />
            <div className={styles.loadingText}>
              <span>Analyzing your tasks…</span>
              <span className={styles.loadingSubtext}>Amazon Bedrock Nova Lite is thinking</span>
            </div>
          </div>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 1.333L9.847 5.96l4.82.442-3.654 3.173 1.094 4.691L8 11.667l-4.107 2.599L5 9.575 1.333 6.402l4.82-.441L8 1.333z" fill="currentColor"/>
            </svg>
            <span>Prioritize with AI</span>
            {taskCount > 0 && (
              <span className={styles.btnBadge}>{taskCount}</span>
            )}
          </>
        )}
      </button>

      {/* Powered by */}
      <div className={styles.poweredByRow}>
        <span className={styles.poweredBy}>Powered by</span>
        <span className={styles.bedrockBadge}>
          <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 2L2 7v6l8 5 8-5V7L10 2z"/>
          </svg>
          Amazon Bedrock Nova Lite
        </span>
        <span className={styles.poweredBySep}>·</span>
        <span className={styles.poweredBy}>AWS Lambda</span>
        <span className={styles.poweredBySep}>·</span>
        <span className={styles.poweredBy}>DynamoDB</span>
      </div>
    </section>
  );
}

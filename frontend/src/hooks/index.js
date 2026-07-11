import { useState, useEffect, useCallback } from "react";
import { API_URL, STREAK_KEY, HISTORY_KEY } from "../constants";

/**
 * usePrioritize — handles all state for the prioritizer feature.
 * Keeps component code clean and logic testable.
 */
export function usePrioritize() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const prioritize = useCallback(async (tasks) => {
    if (!tasks.trim()) {
      setError("Please add at least one task before prioritizing.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setResult(data);
      saveToHistory(data, tasks);
    } catch (e) {
      if (e instanceof TypeError) {
        setError("Cannot reach the AI service. Please check your connection.");
      } else {
        setError(e.message || "Something went wrong — please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { input, setInput, result, loading, error, setError, prioritize };
}

/**
 * useStreak — tracks how many consecutive days the user has opened FocusFlow.
 */
export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [isNewDay, setIsNewDay] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STREAK_KEY) || "{}");
      const today = new Date().toDateString();
      const lastVisit = stored.lastVisit;
      const currentStreak = stored.streak || 0;

      if (lastVisit === today) {
        setStreak(currentStreak);
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const newStreak = lastVisit === yesterday.toDateString() ? currentStreak + 1 : 1;
        setStreak(newStreak);
        setIsNewDay(true);
        localStorage.setItem(STREAK_KEY, JSON.stringify({ streak: newStreak, lastVisit: today }));
      }
    } catch {
      setStreak(1);
    }
  }, []);

  return { streak, isNewDay };
}

/**
 * useHistory — last 5 sessions from localStorage.
 */
export function useHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      setHistory(stored);
    } catch { /* ignore */ }
  }, []);

  return history;
}

function saveToHistory(data, rawTasks) {
  try {
    const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      taskCount: data.tasks?.length || 0,
      summary: data.session_summary || "",
      topTask: data.tasks?.[0]?.title || "",
    };
    const updated = [entry, ...existing].slice(0, 7); // keep last 7
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch { /* ignore */ }
}

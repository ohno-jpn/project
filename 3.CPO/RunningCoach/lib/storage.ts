/**
 * フェーズ1：localStorageベースのデータ永続化
 * フェーズ2以降：Supabaseに切り替え予定
 */

import type { AppState, RaceGoal, PlannedWorkout, WorkoutLog, WorkoutAdvice } from "./types";

const KEY = "running_coach_v1";

function load(): AppState {
  if (typeof window === "undefined") {
    return { plannedWorkouts: [], workoutLogs: [], advices: [] };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { plannedWorkouts: [], workoutLogs: [], advices: [] };
    return JSON.parse(raw) as AppState;
  } catch {
    return { plannedWorkouts: [], workoutLogs: [], advices: [] };
  }
}

function save(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

// ── Goal ──────────────────────────────────────────────────────────────

export function getGoal(): RaceGoal | undefined {
  return load().goal;
}

export function saveGoal(goal: RaceGoal): void {
  const state = load();
  save({ ...state, goal });
}

// ── PlannedWorkouts ───────────────────────────────────────────────────

export function getPlannedWorkouts(): PlannedWorkout[] {
  return load().plannedWorkouts;
}

export function savePlannedWorkout(workout: PlannedWorkout): void {
  const state = load();
  const existing = state.plannedWorkouts.findIndex((w) => w.id === workout.id);
  if (existing >= 0) {
    state.plannedWorkouts[existing] = workout;
  } else {
    state.plannedWorkouts.push(workout);
  }
  save(state);
}

export function deletePlannedWorkout(id: string): void {
  const state = load();
  state.plannedWorkouts = state.plannedWorkouts.filter((w) => w.id !== id);
  save(state);
}

// ── WorkoutLogs ───────────────────────────────────────────────────────

export function getWorkoutLogs(): WorkoutLog[] {
  return load().workoutLogs.sort((a, b) => b.date.localeCompare(a.date));
}

export function getWorkoutLogByDate(date: string): WorkoutLog | undefined {
  return load().workoutLogs.find((l) => l.date === date);
}

export function saveWorkoutLog(log: WorkoutLog): void {
  const state = load();
  const existing = state.workoutLogs.findIndex((l) => l.id === log.id);
  if (existing >= 0) {
    state.workoutLogs[existing] = log;
  } else {
    state.workoutLogs.push(log);
  }
  save(state);
}

// ── Advices ───────────────────────────────────────────────────────────

export function getAdvices(): WorkoutAdvice[] {
  return load().advices.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
}

export function getLatestAdvice(): WorkoutAdvice | undefined {
  return getAdvices()[0];
}

export function saveAdvice(advice: WorkoutAdvice): void {
  const state = load();
  const existing = state.advices.findIndex((a) => a.id === advice.id);
  if (existing >= 0) {
    state.advices[existing] = advice;
  } else {
    state.advices.push(advice);
  }
  save(state);
}

// ── Utility ───────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

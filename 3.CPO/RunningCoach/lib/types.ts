// ─────────────────────────────────────────
// 目標・大会
// ─────────────────────────────────────────

export interface RaceGoal {
  id: string;
  raceName: string;        // 大会名
  raceDate: string;        // ISO date string
  distanceKm: number;      // 42.195 など
  targetTime: string;      // "HH:MM:SS"
  targetPacePerKm: string; // "MM:SS" (自動計算)
  createdAt: string;
}

// ─────────────────────────────────────────
// 週次練習計画
// ─────────────────────────────────────────

export type WorkoutType =
  | "easy"        // イージーラン
  | "tempo"       // テンポ走 / LT走
  | "interval"    // インターバル
  | "long"        // ロング走
  | "race_pace"   // レースペース走
  | "recovery"    // リカバリー
  | "rest"        // 休養
  | "other";

export interface PlannedWorkout {
  id: string;
  date: string;            // ISO date string
  type: WorkoutType;
  distanceKm?: number;
  durationMin?: number;
  targetPace?: string;     // "MM:SS/km"
  targetHR?: { min: number; max: number };
  notes?: string;
}

// ─────────────────────────────────────────
// GARMIN アクティビティデータ
// ─────────────────────────────────────────

export interface GarminActivity {
  // 基本
  activityType: string;
  date: string;
  title: string;
  distanceKm: number;
  calories: number;
  time: string;            // "HH:MM:SS"
  movingTime: string;
  elapsedTime: string;

  // 心拍
  avgHR?: number;
  maxHR?: number;
  aerobicTE?: number;      // Aerobic Training Effect

  // ペース
  avgPacePerKm?: string;   // "MM:SS"
  bestPacePerKm?: string;
  avgGAP?: string;         // Grade Adjusted Pace

  // ランニングダイナミクス
  avgCadence?: number;
  maxCadence?: number;
  avgStrideLength?: number;         // m
  avgVerticalRatio?: number;        // %
  avgVerticalOscillation?: number;  // cm
  avgGroundContactTime?: number;    // ms
  avgGCTBalance?: string;           // "50.2 / 49.8" など

  // パワー
  normalizedPower?: number;         // W
  avgPower?: number;
  maxPower?: number;
  trainingStressScore?: number;     // TSS

  // コース
  totalAscent?: number;    // m
  totalDescent?: number;
  minElevation?: number;
  maxElevation?: number;

  // 環境・その他
  minTemp?: number;
  maxTemp?: number;
  avgResp?: number;
  minResp?: number;
  maxResp?: number;
  bodyBatteryDrain?: number;
  steps?: number;
  numberOfLaps?: number;
  bestLapTime?: string;
}

// ─────────────────────────────────────────
// 練習テーマ
// ─────────────────────────────────────────

export type ThemeTag =
  | "pace"          // ペース制御
  | "heart_rate"    // 心拍管理
  | "cadence"       // ケイデンス
  | "form"          // フォーム全般
  | "balance"       // 左右バランス
  | "gct"           // 接地時間
  | "vertical"      // 上下動
  | "endurance"     // 持久力
  | "strength"      // 筋力・パワー
  | "other";

export interface WorkoutTheme {
  text: string;            // 自由記述テーマ
  tags: ThemeTag[];
  targetValue?: string;    // 例: "ケイデンス180以上"
}

// ─────────────────────────────────────────
// 練習ログ（1日分）
// ─────────────────────────────────────────

export type ThemeResult = "achieved" | "partial" | "not_achieved" | "unknown";

export interface WorkoutLog {
  id: string;
  date: string;            // ISO date string
  plannedWorkoutId?: string;

  // 事前設定
  theme?: WorkoutTheme;
  selfCondition?: {        // 体調自己申告（練習前）
    fatigue: 1 | 2 | 3 | 4 | 5;   // 1=疲労感強い 5=絶好調
    sleep: 1 | 2 | 3 | 4 | 5;     // 1=不眠 5=熟睡
    notes?: string;
  };

  // 実績データ
  garminActivity?: GarminActivity;

  // 事後評価
  themeResult?: ThemeResult;
  selfComment?: string;    // 自己コメント
  aiEvaluation?: string;   // AI生成評価テキスト
  aiEvaluatedAt?: string;

  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────
// 翌日練習提案
// ─────────────────────────────────────────

export type AdviceFeedback = "great" | "ok" | "not_fit" | "did_different" | "skipped";

export interface WorkoutAdvice {
  id: string;
  forDate: string;         // 提案対象日
  generatedAt: string;
  basedOnLogId?: string;   // 元となった練習ログ

  advice: string;          // AI生成テキスト（理由つき）
  suggestedType: WorkoutType;
  suggestedDistanceKm?: number;
  suggestedPace?: string;
  suggestedHR?: { min: number; max: number };
  weeklyOutlook?: string;  // 週間見通しテキスト

  // フィードバック
  feedback?: AdviceFeedback;
  feedbackComment?: string;
  feedbackAt?: string;
}

// ─────────────────────────────────────────
// アプリ全体のストア型
// ─────────────────────────────────────────

export interface AppState {
  goal?: RaceGoal;
  plannedWorkouts: PlannedWorkout[];
  workoutLogs: WorkoutLog[];
  advices: WorkoutAdvice[];
}

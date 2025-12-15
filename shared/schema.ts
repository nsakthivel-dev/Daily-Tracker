import { z } from "zod";

export const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export type DayOfWeek = typeof DAYS_OF_WEEK[number];

export const CELL_STATES = ["empty", "completed", "not_completed"] as const;
export type CellState = typeof CELL_STATES[number];

export const DEFAULT_ROUTINES = [
  "Morning Exercise",
  "Healthy Breakfast",
  "Read 30 Minutes",
  "Drink 8 Glasses Water",
  "Meditate",
  "Study/Learn",
  "Evening Walk",
  "Limit Social Media",
  "Sleep by 11 PM",
  "Journal Entry"
] as const;

export const routineCellSchema = z.object({
  state: z.enum(CELL_STATES),
});

export const routineSchema = z.object({
  name: z.string().min(1).max(50),
  cells: z.record(z.enum(DAYS_OF_WEEK), routineCellSchema),
});

export const screenTimeEntrySchema = z.object({
  hours: z.number().min(0).max(24),
});

export const weekDataSchema = z.object({
  id: z.string(),
  weekStart: z.string(),
  weekEnd: z.string(),
  routines: z.array(routineSchema),
  screenTime: z.record(z.enum(DAYS_OF_WEEK), screenTimeEntrySchema),
  isCurrentWeek: z.boolean(),
});

export type RoutineCell = z.infer<typeof routineCellSchema>;
export type Routine = z.infer<typeof routineSchema>;
export type ScreenTimeEntry = z.infer<typeof screenTimeEntrySchema>;
export type WeekData = z.infer<typeof weekDataSchema>;

export interface WeekSummary {
  weekId: string;
  weekLabel: string;
  totalCompleted: number;
  totalPossible: number;
  consistencyPercentage: number;
}

export interface PerformanceStats {
  bestWeek: {
    weekLabel: string;
    consistencyPercentage: number;
  } | null;
  bestDay: {
    dayName: string;
    weekLabel: string;
    completedCount: number;
  } | null;
  mostConsistentDay: {
    dayName: DayOfWeek;
    averageCompletion: number;
  } | null;
  averageWeeklyConsistency: number;
  trend: "improving" | "declining" | "stable" | "insufficient_data";
  totalWeeksTracked: number;
}

export interface AppState {
  weeks: WeekData[];
  currentWeekId: string;
  selectedWeekId: string;
}

export function getWeekLabel(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart);
  const end = new Date(weekEnd);
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = end.getFullYear();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

export function createEmptyWeek(weekStart: Date): WeekData {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const routines: Routine[] = DEFAULT_ROUTINES.map(name => ({
    name,
    cells: DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = { state: "empty" };
      return acc;
    }, {} as Record<DayOfWeek, RoutineCell>),
  }));
  
  const screenTime = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = { hours: 0 };
    return acc;
  }, {} as Record<DayOfWeek, ScreenTimeEntry>);
  
  return {
    id: `week-${weekStart.toISOString().split('T')[0]}`,
    weekStart: weekStart.toISOString().split('T')[0],
    weekEnd: weekEnd.toISOString().split('T')[0],
    routines,
    screenTime,
    isCurrentWeek: true,
  };
}

export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function calculateWeekConsistency(week: WeekData): number {
  let completed = 0;
  let total = 0;
  
  for (const routine of week.routines) {
    for (const day of DAYS_OF_WEEK) {
      const cell = routine.cells[day];
      if (cell.state !== "empty") {
        total++;
        if (cell.state === "completed") {
          completed++;
        }
      }
    }
  }
  
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function getDayCompletionCount(week: WeekData, day: DayOfWeek): number {
  return week.routines.filter(r => r.cells[day].state === "completed").length;
}

export function getDayTotalCount(week: WeekData, day: DayOfWeek): number {
  return week.routines.filter(r => r.cells[day].state !== "empty").length;
}

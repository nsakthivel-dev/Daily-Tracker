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
  // Parse date strings in a timezone-safe way
  // Format is YYYY-MM-DD, so we can parse it as YYYY/MM/DD to avoid timezone shifts
  const start = new Date(weekStart.replace(/-/g, '/'));
  const end = new Date(weekEnd.replace(/-/g, '/'));
  
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
  // Ensure the weekStart is at the beginning of the day to avoid timezone issues
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(start);
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
  
  // Format date as YYYY-MM-DD string in local timezone
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  return {
    id: `week-${formatDate(start)}`,
    weekStart: formatDate(start),
    weekEnd: formatDate(weekEnd),
    routines,
    screenTime,
    isCurrentWeek: true,
  };
}

export function getMonday(date: Date): Date {
  // Create a new date object to avoid modifying the original
  const d = new Date(date);
  
  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const day = d.getDay();
  
  // Calculate the date of the Monday of this week
  // For Sunday (day=0), we want to go back 6 days to get to the Monday
  // For Monday (day=1), we want to stay at the same date
  // For Tuesday (day=2), we want to go back 1 day to get to the Monday
  // etc.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  
  // Set to the Monday date and clear time to avoid timezone issues
  d.setDate(diff);
  d.setHours(0, 0, 0, 0); // Set time to beginning of day to avoid timezone issues
  
  return d;
}

export function calculateWeekConsistency(week: WeekData): number {
  let completed = 0;
  let total = 0;
  
  for (const routine of week.routines) {
    for (const day of DAYS_OF_WEEK) {
      const cell = routine.cells[day];
      if (cell && cell.state !== "empty") {
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
  return week.routines.filter(r => r.cells[day]?.state === "completed").length;
}

export function getDayTotalCount(week: WeekData, day: DayOfWeek): number {
  return week.routines.filter(r => r.cells[day]?.state !== "empty").length;
}

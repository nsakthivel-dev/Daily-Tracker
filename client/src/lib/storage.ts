import { 
  type WeekData, 
  type AppState, 
  createEmptyWeek, 
  getMonday,
  DAYS_OF_WEEK,
  type DayOfWeek,
  type CellState,
  calculateWeekConsistency,
  getDayCompletionCount,
  type PerformanceStats,
  type WeekSummary,
  getWeekLabel
} from "@shared/schema";

const STORAGE_KEY = "routineflow_data";

function getInitialState(): AppState {
  const today = new Date();
  const monday = getMonday(today);
  const currentWeek = createEmptyWeek(monday);
  
  return {
    weeks: [currentWeek],
    currentWeekId: currentWeek.id,
    selectedWeekId: currentWeek.id,
  };
}

let cachedUserData: AppState | null = null;
let lastUserId: string | null = null;

export async function loadAppState(): Promise<AppState> {
  try {
    // Check if user is authenticated
    const userResponse = await fetch("/auth/user", { credentials: "include" });
    const userData = await userResponse.json();
    
    if (userData.id) {
      // User is authenticated, check if we have cached data for this user
      if (cachedUserData && lastUserId === userData.id) {
        return cachedUserData;
      }
      
      // Fetch user data from server
      const response = await fetch(`/api/user/data`, { credentials: "include" });
      if (response.ok) {
        const serverState: AppState = await response.json();
        
        // Cache the data
        cachedUserData = serverState;
        lastUserId = userData.id;
        
        // Update week information
        const today = new Date();
        const currentMonday = getMonday(today);
        const currentWeekId = `week-${currentMonday.toISOString().split('T')[0]}`;
        
        const existingCurrentWeek = serverState.weeks.find(w => w.id === currentWeekId);
        
        if (!existingCurrentWeek) {
          serverState.weeks = serverState.weeks.map(w => ({ ...w, isCurrentWeek: false }));
          
          const newWeek = createEmptyWeek(currentMonday);
          serverState.weeks.push(newWeek);
          serverState.currentWeekId = newWeek.id;
          serverState.selectedWeekId = newWeek.id;
        } else {
          serverState.currentWeekId = currentWeekId;
          serverState.weeks = serverState.weeks.map(w => ({
            ...w,
            isCurrentWeek: w.id === currentWeekId
          }));
        }
        
        return serverState;
      }
    }
    
    // User not authenticated, use localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getInitialState();
    }
    
    const state: AppState = JSON.parse(stored);
    
    const today = new Date();
    const currentMonday = getMonday(today);
    const currentWeekId = `week-${currentMonday.toISOString().split('T')[0]}`;
    
    const existingCurrentWeek = state.weeks.find(w => w.id === currentWeekId);
    
    if (!existingCurrentWeek) {
      state.weeks = state.weeks.map(w => ({ ...w, isCurrentWeek: false }));
      
      const newWeek = createEmptyWeek(currentMonday);
      state.weeks.push(newWeek);
      state.currentWeekId = newWeek.id;
      state.selectedWeekId = newWeek.id;
      
      saveAppState(state);
    } else {
      state.currentWeekId = currentWeekId;
      state.weeks = state.weeks.map(w => ({
        ...w,
        isCurrentWeek: w.id === currentWeekId
      }));
    }
    
    return state;
  } catch {
    return getInitialState();
  }
}

export async function saveAppState(state: AppState): Promise<void> {
  // Check if user is authenticated
  const userResponse = await fetch("/auth/user", { credentials: "include" });
  const userData = await userResponse.json();
  
  if (userData.id) {
    // User is authenticated, save to server
    try {
      await fetch(`/api/user/data`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(state),
      });
      
      // Update cache
      cachedUserData = state;
      lastUserId = userData.id;
    } catch (error) {
      console.error("Failed to save data to server:", error);
      // Fallback to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } else {
    // User not authenticated, save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export async function updateRoutineCell(
  state: AppState,
  routineIndex: number,
  day: DayOfWeek,
  newState: CellState
): Promise<AppState> {
  const weekIndex = state.weeks.findIndex(w => w.id === state.selectedWeekId);
  if (weekIndex === -1) return state;
  
  const week = state.weeks[weekIndex];
  
  const updatedWeeks = [...state.weeks];
  const updatedRoutines = [...week.routines];
  updatedRoutines[routineIndex] = {
    ...updatedRoutines[routineIndex],
    cells: {
      ...updatedRoutines[routineIndex].cells,
      [day]: { state: newState },
    },
  };
  
  updatedWeeks[weekIndex] = {
    ...week,
    routines: updatedRoutines,
  };
  
  const newAppState = { ...state, weeks: updatedWeeks };
  await saveAppState(newAppState);
  return newAppState;
}

export async function updateRoutineName(
  state: AppState,
  routineIndex: number,
  newName: string
): Promise<AppState> {
  const weekIndex = state.weeks.findIndex(w => w.id === state.selectedWeekId);
  if (weekIndex === -1) return state;
  
  const week = state.weeks[weekIndex];
  
  const updatedWeeks = [...state.weeks];
  const updatedRoutines = [...week.routines];
  updatedRoutines[routineIndex] = {
    ...updatedRoutines[routineIndex],
    name: newName,
  };
  
  updatedWeeks[weekIndex] = {
    ...week,
    routines: updatedRoutines,
  };
  
  const newAppState = { ...state, weeks: updatedWeeks };
  await saveAppState(newAppState);
  return newAppState;
}

export async function updateScreenTime(
  state: AppState,
  day: DayOfWeek,
  hours: number
): Promise<AppState> {
  const weekIndex = state.weeks.findIndex(w => w.id === state.selectedWeekId);
  if (weekIndex === -1) return state;
  
  const week = state.weeks[weekIndex];
  
  const updatedWeeks = [...state.weeks];
  updatedWeeks[weekIndex] = {
    ...week,
    screenTime: {
      ...week.screenTime,
      [day]: { hours },
    },
  };
  
  const newAppState = { ...state, weeks: updatedWeeks };
  await saveAppState(newAppState);
  return newAppState;
}

export function selectWeek(state: AppState, weekId: string): AppState {
  return { ...state, selectedWeekId: weekId };
}

export function getSelectedWeek(state: AppState): WeekData | undefined {
  return state.weeks.find(w => w.id === state.selectedWeekId);
}

export function getAllWeekSummaries(state: AppState): WeekSummary[] {
  return state.weeks.map(week => {
    let totalCompleted = 0;
    let totalPossible = 0;
    
    for (const routine of week.routines) {
      for (const day of DAYS_OF_WEEK) {
        const cell = routine.cells[day];
        if (cell && cell.state !== "empty") {
          totalPossible++;
          if (cell.state === "completed") {
            totalCompleted++;
          }
        }
      }
    }
    
    return {
      weekId: week.id,
      weekLabel: getWeekLabel(week.weekStart, week.weekEnd),
      totalCompleted,
      totalPossible,
      consistencyPercentage: totalPossible > 0 
        ? Math.round((totalCompleted / totalPossible) * 100) 
        : 0,
    };
  }).sort((a, b) => b.weekId.localeCompare(a.weekId));
}

export function calculatePerformanceStats(state: AppState): PerformanceStats {
  if (state.weeks.length === 0) {
    return {
      bestWeek: null,
      bestDay: null,
      mostConsistentDay: null,
      averageWeeklyConsistency: 0,
      trend: "insufficient_data",
      totalWeeksTracked: 0,
    };
  }
  
  const weekStats = state.weeks.map(week => ({
    week,
    label: getWeekLabel(week.weekStart, week.weekEnd),
    consistency: calculateWeekConsistency(week),
  }));
  
  const bestWeekData = weekStats.reduce((best, current) => 
    current.consistency > best.consistency ? current : best
  );
  
  let bestDay: PerformanceStats["bestDay"] = null;
  let maxDayCompletion = 0;
  
  for (const week of state.weeks) {
    for (const day of DAYS_OF_WEEK) {
      const count = getDayCompletionCount(week, day);
      if (count > maxDayCompletion) {
        maxDayCompletion = count;
        bestDay = {
          dayName: day,
          weekLabel: getWeekLabel(week.weekStart, week.weekEnd),
          completedCount: count,
        };
      }
    }
  }
  
  const dayTotals: Record<DayOfWeek, { completed: number; total: number }> = {} as any;
  for (const day of DAYS_OF_WEEK) {
    dayTotals[day] = { completed: 0, total: 0 };
  }
  
  for (const week of state.weeks) {
    for (const day of DAYS_OF_WEEK) {
      for (const routine of week.routines) {
        const cell = routine.cells[day];
        if (cell && cell.state !== "empty") {
          dayTotals[day].total++;
          if (cell.state === "completed") {
            dayTotals[day].completed++;
          }
        }
      }
    }
  }
  
  let mostConsistentDay: PerformanceStats["mostConsistentDay"] = null;
  let maxAvg = 0;
  
  for (const day of DAYS_OF_WEEK) {
    const { completed, total } = dayTotals[day];
    if (total > 0) {
      const avg = (completed / total) * 100;
      if (avg > maxAvg) {
        maxAvg = avg;
        mostConsistentDay = { dayName: day, averageCompletion: Math.round(avg) };
      }
    }
  }
  
  const validWeeks = weekStats.filter(w => w.consistency > 0);
  const averageWeeklyConsistency = validWeeks.length > 0
    ? Math.round(validWeeks.reduce((sum, w) => sum + w.consistency, 0) / validWeeks.length)
    : 0;
  
  let trend: PerformanceStats["trend"] = "insufficient_data";
  if (state.weeks.length >= 3) {
    const sortedWeeks = [...state.weeks].sort((a, b) => 
      a.weekStart.localeCompare(b.weekStart)
    );
    const recentWeeks = sortedWeeks.slice(-3);
    const recentConsistencies = recentWeeks.map(calculateWeekConsistency);
    
    const increasing = recentConsistencies[2] > recentConsistencies[0];
    const decreasing = recentConsistencies[2] < recentConsistencies[0];
    const diff = Math.abs(recentConsistencies[2] - recentConsistencies[0]);
    
    if (diff < 5) {
      trend = "stable";
    } else if (increasing) {
      trend = "improving";
    } else if (decreasing) {
      trend = "declining";
    }
  }
  
  return {
    bestWeek: {
      weekLabel: bestWeekData.label,
      consistencyPercentage: bestWeekData.consistency,
    },
    bestDay,
    mostConsistentDay,
    averageWeeklyConsistency,
    trend,
    totalWeeksTracked: state.weeks.length,
  };
}

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/header";
import { WeekNavigation } from "@/components/week-navigation";
import { RoutineTable } from "@/components/routine-table";
import { ConsistencyChart } from "@/components/consistency-chart";
import { ScreenTimeTracker } from "@/components/screen-time-tracker";
import { PerformanceInsights } from "@/components/performance-insights";
import {
  type AppState,
  type DayOfWeek,
  type CellState,
  calculateWeekConsistency,
} from "@shared/schema";
import {
  loadAppState,
  getSelectedWeek,
  updateRoutineCell,
  updateRoutineName,
  updateScreenTime,
  selectWeek,
  getAllWeekSummaries,
  calculatePerformanceStats,
} from "@/lib/storage";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Skeleton className="h-16 w-full rounded-lg" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>
          <div className="lg:col-span-6">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>
        </div>
        
        <Skeleton className="h-40 w-full rounded-lg" />
      </main>
    </div>
  );
}

export default function Home() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const state = loadAppState();
    setAppState(state);
    setIsLoading(false);
  }, []);

  const handleCellClick = useCallback((
    routineIndex: number,
    day: DayOfWeek,
    newState: CellState
  ) => {
    setAppState((prev) => {
      if (!prev) return prev;
      return updateRoutineCell(prev, routineIndex, day, newState);
    });
  }, []);

  const handleRoutineNameChange = useCallback((
    routineIndex: number,
    newName: string
  ) => {
    setAppState((prev) => {
      if (!prev) return prev;
      return updateRoutineName(prev, routineIndex, newName);
    });
  }, []);

  const handleScreenTimeChange = useCallback((
    day: DayOfWeek,
    hours: number
  ) => {
    setAppState((prev) => {
      if (!prev) return prev;
      return updateScreenTime(prev, day, hours);
    });
  }, []);

  const handleSelectWeek = useCallback((weekId: string) => {
    setAppState((prev) => {
      if (!prev) return prev;
      return selectWeek(prev, weekId);
    });
  }, []);

  if (isLoading || !appState) {
    return <LoadingSkeleton />;
  }

  const selectedWeek = getSelectedWeek(appState);
  const weekSummaries = getAllWeekSummaries(appState);
  const performanceStats = calculatePerformanceStats(appState);

  if (!selectedWeek) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No week data available</p>
      </div>
    );
  }

  const selectedWeekIndex = appState.weeks.findIndex(
    (w) => w.id === appState.selectedWeekId
  );
  const previousWeek = selectedWeekIndex > 0 
    ? appState.weeks[selectedWeekIndex - 1] 
    : undefined;
  const previousWeekConsistency = previousWeek 
    ? calculateWeekConsistency(previousWeek) 
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <WeekNavigation
          weekSummaries={weekSummaries}
          selectedWeekId={appState.selectedWeekId}
          currentWeekId={appState.currentWeekId}
          onSelectWeek={handleSelectWeek}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <ConsistencyChart 
              week={selectedWeek} 
              previousWeekConsistency={previousWeekConsistency}
            />
          </div>
          
          <div className="lg:col-span-6 order-1 lg:order-2">
            <RoutineTable
              week={selectedWeek}
              onCellClick={handleCellClick}
              onRoutineNameChange={handleRoutineNameChange}
            />
          </div>
          
          <div className="lg:col-span-3 order-3">
            <ScreenTimeTracker
              week={selectedWeek}
              onScreenTimeChange={handleScreenTimeChange}
            />
          </div>
        </div>
        
        <PerformanceInsights stats={performanceStats} />
      </main>
    </div>
  );
}

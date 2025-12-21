import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/header";
import { WeekNavigation } from "@/components/week-navigation";
import { RoutineTable } from "@/components/routine-table";
import { ConsistencyChart } from "@/components/consistency-chart";
import { ScreenTimeTracker } from "@/components/screen-time-tracker";
import { PerformanceInsights } from "@/components/performance-insights";
import { AmbientEffects } from "@/components/ambient-effects";
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
    <div className="min-h-screen bg-game-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-5 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-5 animate-pulse animation-delay-2000"></div>
      </div>
      
      {/* Ambient particle effects */}
      <AmbientEffects />
      
      <div className="relative z-10">
        <div className="sticky top-0 z-50 w-full border-b border-game-border bg-game-background/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Skeleton className="h-10 w-40 rounded-xl bg-game-card/70" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-24 rounded-lg bg-game-card/70" />
                <Skeleton className="h-10 w-10 rounded-xl bg-game-card/70" />
              </div>
            </div>
          </div>
        </div>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Skeleton className="h-20 w-full rounded-xl bg-game-card/70" />
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <motion.div 
              className="lg:col-span-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Skeleton className="h-96 w-full rounded-xl bg-game-card/70" />
            </motion.div>
            <motion.div 
              className="lg:col-span-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Skeleton className="h-[500px] w-full rounded-xl bg-game-card/70" />
            </motion.div>
            <motion.div 
              className="lg:col-span-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Skeleton className="h-96 w-full rounded-xl bg-game-card/70" />
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Skeleton className="h-48 w-full rounded-xl bg-game-card/70" />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppState().then((state) => {
      setAppState(state);
      setIsLoading(false);
    });
  }, []);

  const handleCellClick = useCallback(async (
    routineIndex: number,
    day: DayOfWeek,
    newState: CellState
  ) => {
    setAppState((prev) => {
      if (!prev) return prev;
      return updateRoutineCell(prev, routineIndex, day, newState);
    });
  }, []);

  const handleRoutineNameChange = useCallback(async (
    routineIndex: number,
    newName: string
  ) => {
    setAppState((prev) => {
      if (!prev) return prev;
      return updateRoutineName(prev, routineIndex, newName);
    });
  }, []);

  const handleScreenTimeChange = useCallback(async (
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
    <div className="min-h-screen bg-game-background relative overflow-hidden">
      {/* Dynamic background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-10 animate-pulse animation-delay-3000"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-cyan-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>
      
      {/* Ambient particle effects */}
      <AmbientEffects />
      
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Header />
        </motion.div>
        
        <main className="max-w-[90%] mx-auto px-2 sm:px-4 lg:px-6 py-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <WeekNavigation
              weekSummaries={weekSummaries}
              selectedWeekId={appState.selectedWeekId}
              currentWeekId={appState.currentWeekId}
              onSelectWeek={handleSelectWeek}
            />
          </motion.div>
          
          <div className="flex flex-col gap-6 px-0 py-2 w-full max-w-[90%] mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="rounded-xl w-full overflow-visible"
            >
              <RoutineTable
                week={selectedWeek}
                onCellClick={handleCellClick}
                onRoutineNameChange={handleRoutineNameChange}
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <ConsistencyChart 
                week={selectedWeek} 
                previousWeekConsistency={previousWeekConsistency}
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <ScreenTimeTracker
                week={selectedWeek}
                onScreenTimeChange={handleScreenTimeChange}
              />
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <PerformanceInsights stats={performanceStats} />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

import { 
  type WeekData, 
  DAYS_OF_WEEK, 
  type DayOfWeek,
  getDayCompletionCount,
  calculateWeekConsistency,
  getWeekLabel
} from "@shared/schema";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ConsistencyChartProps {
  week: WeekData;
  previousWeekConsistency?: number;
}

const SHORT_DAYS: Record<DayOfWeek, string> = {
  Monday: "M",
  Tuesday: "T",
  Wednesday: "W",
  Thursday: "T",
  Friday: "F",
  Saturday: "S",
  Sunday: "S",
};

function getCompletionColor(percentage: number): string {
  if (percentage >= 80) return "bg-primary";
  if (percentage >= 60) return "bg-chart-1/70";
  if (percentage >= 40) return "bg-chart-3";
  if (percentage >= 20) return "bg-chart-3/60";
  return "bg-muted";
}

function getCompletionLabel(percentage: number): string {
  if (percentage >= 80) return "Excellent";
  if (percentage >= 60) return "Good";
  if (percentage >= 40) return "Fair";
  if (percentage >= 20) return "Low";
  return "None";
}

export function ConsistencyChart({ week, previousWeekConsistency }: ConsistencyChartProps) {
  const totalRoutines = week.routines.length;
  const weekConsistency = calculateWeekConsistency(week);
  
  const dailyData = DAYS_OF_WEEK.map(day => {
    const completed = getDayCompletionCount(week, day);
    const percentage = totalRoutines > 0 ? Math.round((completed / totalRoutines) * 100) : 0;
    return { day, completed, percentage };
  });
  
  const maxHeight = 120;
  
  let trend: "up" | "down" | "stable" = "stable";
  if (previousWeekConsistency !== undefined) {
    const diff = weekConsistency - previousWeekConsistency;
    if (diff > 5) trend = "up";
    else if (diff < -5) trend = "down";
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center justify-between gap-2 flex-wrap">
          <span>Weekly Consistency</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-2xl text-primary" data-testid="text-week-consistency">
              {weekConsistency}%
            </span>
            {trend === "up" && <TrendingUp className="w-4 h-4 text-primary" />}
            {trend === "down" && <TrendingDown className="w-4 h-4 text-destructive" />}
            {trend === "stable" && <Minus className="w-4 h-4 text-muted-foreground" />}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-end justify-between gap-2" style={{ height: maxHeight + 40 }}>
          {dailyData.map(({ day, completed, percentage }) => (
            <div 
              key={day} 
              className="flex flex-col items-center gap-2 flex-1"
              data-testid={`chart-bar-${day.toLowerCase()}`}
            >
              <div 
                className="relative w-full flex flex-col items-center justify-end"
                style={{ height: maxHeight }}
              >
                <div
                  className={cn(
                    "w-full max-w-[32px] rounded-t-md transition-all duration-300",
                    getCompletionColor(percentage),
                    percentage === 0 && "min-h-[4px]"
                  )}
                  style={{ 
                    height: percentage > 0 ? `${(percentage / 100) * maxHeight}px` : 4 
                  }}
                  title={`${day}: ${completed}/${totalRoutines} (${percentage}%)`}
                />
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs font-medium text-muted-foreground">
                  {SHORT_DAYS[day]}
                </span>
                <span className="font-mono text-xs text-foreground">
                  {completed}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-3 text-xs">
            {[80, 60, 40, 20, 0].map(threshold => (
              <div key={threshold} className="flex items-center gap-1.5">
                <div className={cn(
                  "w-3 h-3 rounded-sm",
                  getCompletionColor(threshold)
                )} />
                <span className="text-muted-foreground">
                  {getCompletionLabel(threshold)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            {getWeekLabel(week.weekStart, week.weekEnd)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

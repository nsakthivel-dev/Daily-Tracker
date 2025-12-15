import { type WeekData, DAYS_OF_WEEK, type DayOfWeek } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScreenTimeTrackerProps {
  week: WeekData;
  onScreenTimeChange: (day: DayOfWeek, hours: number) => void;
}

const SHORT_DAYS: Record<DayOfWeek, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

function getTimeColor(hours: number): string {
  if (hours <= 2) return "text-primary";
  if (hours <= 4) return "text-chart-1";
  if (hours <= 6) return "text-chart-3";
  return "text-destructive";
}

export function ScreenTimeTracker({ week, onScreenTimeChange }: ScreenTimeTrackerProps) {
  const isReadOnly = !week.isCurrentWeek;
  
  const totalHours = DAYS_OF_WEEK.reduce((sum, day) => {
    return sum + (week.screenTime[day]?.hours || 0);
  }, 0);
  
  const avgHours = totalHours / 7;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          <span>Screen Time</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-2">
          {DAYS_OF_WEEK.map(day => {
            const hours = week.screenTime[day]?.hours || 0;
            return (
              <div 
                key={day} 
                className="flex items-center justify-between gap-3 py-1.5"
              >
                <span className="text-sm text-muted-foreground w-10 flex-shrink-0">
                  {SHORT_DAYS[day]}
                </span>
                <div className="flex items-center gap-2 flex-1 justify-end">
                  {isReadOnly ? (
                    <span className={cn("font-mono text-sm", getTimeColor(hours))} data-testid={`text-screentime-${day.toLowerCase()}`}>
                      {hours.toFixed(1)}h
                    </span>
                  ) : (
                    <>
                      <Input
                        type="number"
                        min={0}
                        max={24}
                        step={0.5}
                        value={hours || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          onScreenTimeChange(day, Math.min(24, Math.max(0, val)));
                        }}
                        className="w-16 h-8 text-sm text-right font-mono"
                        placeholder="0"
                        data-testid={`input-screentime-${day.toLowerCase()}`}
                      />
                      <span className="text-xs text-muted-foreground">hrs</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Weekly Total</span>
            <span className={cn("font-mono font-semibold", getTimeColor(avgHours))} data-testid="text-screentime-total">
              {totalHours.toFixed(1)}h
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Daily Average</span>
            <span className={cn("font-mono text-sm", getTimeColor(avgHours))} data-testid="text-screentime-average">
              {avgHours.toFixed(1)}h
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">{"<2h"}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-chart-1" />
              <span className="text-muted-foreground">2-4h</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-chart-3" />
              <span className="text-muted-foreground">4-6h</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-muted-foreground">{">6h"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

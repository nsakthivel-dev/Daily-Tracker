import { type WeekData, DAYS_OF_WEEK, type DayOfWeek } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Smartphone, Monitor, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { soundManager } from "@/lib/sound-manager";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface ScreenTimeTrackerProps {
  week: WeekData;
  onScreenTimeChange: (day: DayOfWeek, hours: number) => Promise<void>;
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

const FULL_DAYS: Record<DayOfWeek, string> = {
  Monday: "Monday",
  Tuesday: "Tuesday",
  Wednesday: "Wednesday",
  Thursday: "Thursday",
  Friday: "Friday",
  Saturday: "Saturday",
  Sunday: "Sunday",
};

function getTimeColor(hours: number): string {
  if (hours <= 2) return "text-game-success";
  if (hours <= 4) return "text-game-warning";
  if (hours <= 6) return "text-game-accent";
  return "text-game-danger";
}

export function ScreenTimeTracker({ week, onScreenTimeChange }: ScreenTimeTrackerProps) {
  const isReadOnly = !week.isCurrentWeek;
  
  const totalHours = DAYS_OF_WEEK.reduce((sum, day) => {
    return sum + (week.screenTime[day]?.hours || 0);
  }, 0);
  
  const avgHours = totalHours / 7;

  // Prepare data for the bar chart
  const chartData = DAYS_OF_WEEK.map(day => {
    const hours = week.screenTime[day]?.hours || 0;
    return { 
      day: SHORT_DAYS[day], 
      fullDay: FULL_DAYS[day],
      hours: parseFloat(hours.toFixed(1))
    };
  });

  return (
    <Card className="h-full game-theme:game-card relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-game-primary/10 to-game-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"></div>
      
      <CardHeader className="pb-2 bg-gradient-to-r from-game-primary/30 to-game-secondary/30 rounded-t-lg relative overflow-hidden">
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-game-foreground">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-game-primary to-game-secondary text-white shadow-md">
              <Monitor className="w-4 h-4" />
            </div>
            <span>Digital Wellness</span>
            <div className="ml-auto flex items-center gap-1 bg-game-card/50 px-2 py-1 rounded-lg border border-game-border">
              <Smartphone className="w-3 h-3 text-game-accent" />
              <span className="text-[0.65rem] font-bold text-game-foreground">Screen Time</span>
            </div>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-2 relative z-10">
        {/* Bar chart visualization */}
        <div className="h-[200px] w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false}
                stroke="hsl(var(--game-border))"
              />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--game-foreground))', fontWeight: 500 }}
                dy={8}
              />
              <YAxis 
                domain={[0, 12]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--game-muted-foreground))' }}
                tickFormatter={(value) => `${value}h`}
                width={30}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-game-popover border border-game-popover-border rounded-lg p-3 shadow-xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1 rounded-md bg-gradient-to-br from-game-primary to-game-secondary text-white">
                            <Monitor className="w-3 h-3" />
                          </div>
                          <p className="text-sm font-bold text-game-foreground">{data.fullDay}</p>
                        </div>
                        <p className="text-xs text-game-muted-foreground">
                          Screen time: <span className="font-bold">{data.hours} hours</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="hours"
                fill="hsl(var(--game-primary))"
                radius={[4, 4, 0, 0]}
                barSize={20}
                shape={(props) => {
                  const { x, y, width, height, value } = props;
                  // Color coding based on hours
                  let fillColor = 'hsl(var(--game-success))'; // Green for low usage
                  if (value > 6) fillColor = 'hsl(var(--game-danger))'; // Red for high usage
                  else if (value > 4) fillColor = 'hsl(var(--game-warning))'; // Yellow for moderate usage
                  else if (value > 2) fillColor = 'hsl(var(--game-accent))'; // Accent for medium usage
                  
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={fillColor}
                      rx={4}
                      ry={4}
                      className="transition-all duration-300 hover:opacity-90"
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Original input fields for editable mode */}
        {!isReadOnly && (
          <div className="space-y-2 mb-4">
            {DAYS_OF_WEEK.map(day => {
              const hours = week.screenTime[day]?.hours || 0;
              return (
                <div 
                  key={day} 
                  className="flex items-center justify-between gap-3 py-2 bg-game-card/40 px-3 rounded-lg border border-game-border/50 transition-all duration-300 hover:bg-game-card/60 hover:shadow-sm group/day"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-game-primary animate-pulse group-hover/day:bg-game-secondary transition-colors duration-300"></div>
                    <span className="text-sm text-game-muted-foreground w-10 flex-shrink-0 font-bold">
                      {SHORT_DAYS[day]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        max={24}
                        step={0.5}
                        value={hours || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          soundManager.playSound("click");
                          onScreenTimeChange(day, Math.min(24, Math.max(0, val)));
                        }}
                        className="w-20 h-8 text-sm text-right font-mono bg-game-input border-game-border text-game-foreground rounded-lg focus:ring-2 focus:ring-game-primary/50 transition-all duration-300"
                        placeholder="0"
                        data-testid={`input-screentime-${day.toLowerCase()}`}
                      />
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    <span className="text-xs text-game-muted-foreground font-medium">hrs</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="mt-3 pt-3 border-t border-game-border space-y-2">
          <div className="flex items-center justify-between bg-game-card/30 px-3 py-2 rounded-lg">
            <span className="text-sm text-game-muted-foreground flex items-center gap-2 font-medium">
              <div className="p-1 rounded-md bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                <Zap className="w-3 h-3" />
              </div>
              Weekly Total
            </span>
            <span className={cn("font-mono font-bold text-sm px-2 py-1 rounded-md bg-game-card/50 border border-game-border", getTimeColor(avgHours))} data-testid="text-screentime-total">
              {totalHours.toFixed(1)}h
            </span>
          </div>
          <div className="flex items-center justify-between bg-game-card/30 px-3 py-2 rounded-lg">
            <span className="text-sm text-game-muted-foreground font-medium">Daily Average</span>
            <span className={cn("font-mono text-sm font-bold px-2 py-1 rounded-md bg-game-card/50 border border-game-border", getTimeColor(avgHours))} data-testid="text-screentime-average">
              {avgHours.toFixed(1)}h
            </span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-game-border">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-game-card/30 px-2 py-1 rounded-md border border-game-border">
              <div className="w-2 h-2 rounded-full bg-game-success" />
              <span className="text-xs text-game-muted-foreground font-medium">{"<2h"}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-game-card/30 px-2 py-1 rounded-md border border-game-border">
              <div className="w-2 h-2 rounded-full bg-game-warning" />
              <span className="text-xs text-game-muted-foreground font-medium">2-4h</span>
            </div>
            <div className="flex items-center gap-1.5 bg-game-card/30 px-2 py-1 rounded-md border border-game-border">
              <div className="w-2 h-2 rounded-full bg-game-accent" />
              <span className="text-xs text-game-muted-foreground font-medium">4-6h</span>
            </div>
            <div className="flex items-center gap-1.5 bg-game-card/30 px-2 py-1 rounded-md border border-game-border">
              <div className="w-2 h-2 rounded-full bg-game-danger" />
              <span className="text-xs text-game-muted-foreground font-medium">{">6h"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

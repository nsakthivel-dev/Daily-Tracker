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
import { TrendingUp, TrendingDown, Minus, Trophy, Zap, Target } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
} from "recharts";

interface ConsistencyChartProps {
  week: WeekData;
  previousWeekConsistency?: number;
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

export function ConsistencyChart({ week, previousWeekConsistency }: ConsistencyChartProps) {
  const totalRoutines = week.routines.length;
  const weekConsistency = calculateWeekConsistency(week);
  
  const chartData = DAYS_OF_WEEK.map(day => {
    const completed = getDayCompletionCount(week, day);
    const percentage = totalRoutines > 0 ? Math.round((completed / totalRoutines) * 100) : 0;
    return { 
      day: SHORT_DAYS[day], 
      fullDay: day,
      completed, 
      percentage,
      total: totalRoutines
    };
  });
  
  let trend: "up" | "down" | "stable" = "stable";
  if (previousWeekConsistency !== undefined) {
    const diff = weekConsistency - previousWeekConsistency;
    if (diff > 5) trend = "up";
    else if (diff < -5) trend = "down";
  }

  return (
    <Card className="h-full game-theme:game-card relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"></div>
      
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg relative overflow-hidden">
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10">
          <CardTitle className="text-base font-bold flex items-center justify-between gap-2 flex-wrap text-white">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-black/20">
                <Target className="w-4 h-4" />
              </div>
              <span>Quest Completion</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-lg shadow-md">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="font-mono text-xl" data-testid="text-week-consistency">
                  {weekConsistency}%
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-black/20">
                {trend === "up" && <TrendingUp className="w-4 h-4 text-green-400" />}
                {trend === "down" && <TrendingDown className="w-4 h-4 text-red-400" />}
                {trend === "stable" && <Minus className="w-4 h-4 text-gray-400" />}
              </div>
            </div>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-3 relative z-10">
        <div className="h-[180px] w-full" data-testid="consistency-line-chart">
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
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--game-muted-foreground))' }}
                tickFormatter={(value) => `${value}%`}
                width={40}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-game-popover border border-game-popover-border rounded-lg p-3 shadow-xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1 rounded-md bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                            <Zap className="w-3 h-3" />
                          </div>
                          <p className="text-sm font-bold text-game-foreground">{data.fullDay}</p>
                        </div>
                        <p className="text-xs text-game-muted-foreground mb-2">
                          {data.completed}/{data.total} quests completed
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-game-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-game-success to-game-warning h-2 rounded-full" 
                              style={{ width: `${data.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-game-foreground">{data.percentage}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="percentage"
                fill="hsl(var(--game-primary))"
                radius={[4, 4, 0, 0]}
                barSize={20}
                shape={(props: any) => {
                  const { x, y, width, height, value } = props;
                  const fillColor = 
                    value >= 80 ? 'hsl(var(--game-success))' :
                    value >= 60 ? 'hsl(var(--game-warning))' :
                    'hsl(var(--game-danger))';
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
        
        <div className="mt-3 pt-3 border-t border-game-border flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-game-card/30 px-3 py-1.5 rounded-lg border border-game-border">
            <div className="w-8 h-0.5 bg-gradient-to-r from-game-primary to-game-secondary rounded-full" />
            <span className="text-xs text-game-muted-foreground font-medium">Daily quest completion rate</span>
          </div>
          <div className="flex items-center gap-1.5 bg-game-card/30 px-3 py-1.5 rounded-lg border border-game-border">
            <Zap className="w-3 h-3 text-yellow-400" />
            <p className="text-xs text-game-muted-foreground font-medium">
              {getWeekLabel(week.weekStart, week.weekEnd)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
        <div className="h-[180px] w-full" data-testid="consistency-line-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                dy={10}
              />
              <YAxis 
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value}%`}
                width={45}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-popover-border rounded-md p-2 shadow-md">
                        <p className="text-sm font-medium">{data.fullDay}</p>
                        <p className="text-xs text-muted-foreground">
                          {data.completed}/{data.total} completed
                        </p>
                        <p className={cn(
                          "text-sm font-mono font-semibold",
                          data.percentage >= 70 ? "text-primary" :
                          data.percentage >= 40 ? "text-chart-3" :
                          "text-muted-foreground"
                        )}>
                          {data.percentage}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="percentage"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#colorPercentage)"
                dot={{
                  r: 4,
                  fill: 'hsl(var(--primary))',
                  strokeWidth: 2,
                  stroke: 'hsl(var(--background))'
                }}
                activeDot={{
                  r: 6,
                  fill: 'hsl(var(--primary))',
                  strokeWidth: 2,
                  stroke: 'hsl(var(--background))'
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-primary rounded-full" />
            <span className="text-xs text-muted-foreground">Daily completion rate</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {getWeekLabel(week.weekStart, week.weekEnd)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

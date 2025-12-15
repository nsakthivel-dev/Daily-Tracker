import { type PerformanceStats } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Trophy, 
  Calendar, 
  Star, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceInsightsProps {
  stats: PerformanceStats;
}

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  valueColor?: string;
}

function InsightCard({ icon, title, value, subtitle, valueColor }: InsightCardProps) {
  return (
    <Card className="overflow-visible">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate">{title}</p>
            <p className={cn("text-xl font-semibold font-mono mt-1", valueColor)}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrendCard({ trend }: { trend: PerformanceStats["trend"] }) {
  const config = {
    improving: {
      icon: <TrendingUp className="w-5 h-5" />,
      label: "Improving",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    declining: {
      icon: <TrendingDown className="w-5 h-5" />,
      label: "Declining",
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    stable: {
      icon: <Minus className="w-5 h-5" />,
      label: "Stable",
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
    insufficient_data: {
      icon: <BarChart3 className="w-5 h-5" />,
      label: "Need More Data",
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
  };
  
  const { icon, label, color, bg } = config[trend];
  
  return (
    <Card className="overflow-visible">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("flex-shrink-0 p-2 rounded-md", bg, color)}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">Consistency Trend</p>
            <p className={cn("text-xl font-semibold mt-1", color)}>
              {label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Based on last 3 weeks
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformanceInsights({ stats }: PerformanceInsightsProps) {
  if (stats.totalWeeksTracked === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Start Tracking Your Routines</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Complete your first week to see performance insights here. 
              Track your habits daily to build consistency!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Performance Insights</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <InsightCard
          icon={<Trophy className="w-5 h-5" />}
          title="Best Week"
          value={stats.bestWeek ? `${stats.bestWeek.consistencyPercentage}%` : "N/A"}
          subtitle={stats.bestWeek?.weekLabel}
          valueColor="text-primary"
        />
        
        <InsightCard
          icon={<Star className="w-5 h-5" />}
          title="Best Day Ever"
          value={stats.bestDay ? `${stats.bestDay.completedCount} done` : "N/A"}
          subtitle={stats.bestDay ? `${stats.bestDay.dayName}` : undefined}
        />
        
        <InsightCard
          icon={<Calendar className="w-5 h-5" />}
          title="Most Consistent Day"
          value={stats.mostConsistentDay?.dayName || "N/A"}
          subtitle={stats.mostConsistentDay ? `${stats.mostConsistentDay.averageCompletion}% avg` : undefined}
        />
        
        <InsightCard
          icon={<BarChart3 className="w-5 h-5" />}
          title="Average Consistency"
          value={`${stats.averageWeeklyConsistency}%`}
          subtitle={`Across ${stats.totalWeeksTracked} week${stats.totalWeeksTracked > 1 ? 's' : ''}`}
        />
        
        <TrendCard trend={stats.trend} />
      </div>
    </div>
  );
}

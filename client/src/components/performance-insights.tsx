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
  Target,
  Award,
  Zap,
  Crown,
  Medal,
  Flame
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
  isAchievement?: boolean;
}

function InsightCard({ icon, title, value, subtitle, valueColor, isAchievement = false }: InsightCardProps) {
  return (
    <Card className={cn("overflow-visible relative group", isAchievement && "game-card")}>
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-game-primary/20 to-game-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"></div>
      
      <CardContent className="p-4 relative z-10">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex-shrink-0 p-2 rounded-lg relative overflow-hidden",
            isAchievement 
              ? "bg-gradient-to-br from-game-primary to-game-secondary text-primary" 
              : "bg-primary/10 text-primary"
          )}>
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-x-full group-hover:translate-x-full"></div>
            <div className="relative z-10">
              {icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-xs truncate font-medium",
              isAchievement ? "text-game-foreground" : "text-muted-foreground"
            )}>
              {title}
            </p>
            <p className={cn(
              "text-xl font-bold font-mono mt-1",
              valueColor,
              isAchievement && "text-game-foreground"
            )}>
              {value}
            </p>
            {subtitle && (
              <p className={cn(
                "text-[0.65rem] mt-1 truncate",
                isAchievement ? "text-game-muted-foreground" : "text-muted-foreground"
              )}>
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
      color: "text-game-success",
      bg: "bg-game-success/20",
      description: "Great job! Your consistency is getting better."
    },
    declining: {
      icon: <TrendingDown className="w-5 h-5" />,
      label: "Declining",
      color: "text-game-danger",
      bg: "bg-game-danger/20",
      description: "Stay focused! You can bounce back."
    },
    stable: {
      icon: <Minus className="w-5 h-5" />,
      label: "Stable",
      color: "text-game-warning",
      bg: "bg-game-warning/20",
      description: "Maintaining consistency is a skill!"
    },
    insufficient_data: {
      icon: <BarChart3 className="w-5 h-5" />,
      label: "Need More Data",
      color: "text-game-muted-foreground",
      bg: "bg-game-muted",
      description: "Complete more weeks to see your trend."
    },
  };
  
  const { icon, label, color, bg, description } = config[trend];
  
  return (
    <Card className="overflow-visible game-card relative group hover:shadow-lg transition-all duration-300">
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-game-primary/10 to-game-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"></div>
      
      <CardContent className="p-4 relative z-10">
        <div className="flex items-start gap-3">
          <div className={cn("flex-shrink-0 p-2 rounded-lg relative overflow-hidden", bg, color)}>
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-x-full group-hover:translate-x-full"></div>
            <div className="relative z-10">
              {icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-game-foreground font-medium">Consistency Trend</p>
            <p className={cn("text-xl font-bold mt-1", color)}>
              {label}
            </p>
            <p className="text-[0.65rem] text-game-muted-foreground mt-1 leading-relaxed">
              {description}
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
      <Card className="game-card">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="p-4 rounded-full bg-game-muted mb-4">
              <Target className="w-8 h-8 text-game-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-game-foreground">Start Your Quest Journey</h3>
            <p className="text-sm text-game-muted-foreground max-w-md">
              Complete your first week to unlock achievements and performance insights. 
              Track your habits daily to level up your consistency!
            </p>
            <div className="mt-4 flex items-center gap-2 text-game-warning">
              <Flame className="w-4 h-4" />
              <span className="text-xs font-bold">Beginner Quest: Complete 1 week</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate achievements
  const achievements = [];
  
  if (stats.totalWeeksTracked >= 1) {
    achievements.push({
      id: "first_week",
      title: "First Quest",
      description: "Complete your first week",
      icon: <Medal className="w-5 h-5" />,
      earned: true
    });
  }
  
  if (stats.totalWeeksTracked >= 4) {
    achievements.push({
      id: "monthly",
      title: "Monthly Master",
      description: "Track for a month",
      icon: <Award className="w-5 h-5" />,
      earned: true
    });
  } else {
    achievements.push({
      id: "monthly",
      title: "Monthly Master",
      description: `Track for 4 weeks (${4 - stats.totalWeeksTracked} to go)` ,
      icon: <Award className="w-5 h-5" />,
      earned: false
    });
  }
  
  if (stats.averageWeeklyConsistency >= 80) {
    achievements.push({
      id: "champion",
      title: "Champion",
      description: "80%+ average consistency",
      icon: <Crown className="w-5 h-5" />,
      earned: true
    });
  } else {
    achievements.push({
      id: "champion",
      title: "Champion",
      description: `Reach 80% avg (${80 - stats.averageWeeklyConsistency}% to go)` ,
      icon: <Crown className="w-5 h-5" />,
      earned: false
    });
  }
  
  const streak = stats.bestWeek?.consistencyPercentage === 100 ? "Perfect Week" : "None";
  
  if (streak === "Perfect Week") {
    achievements.push({
      id: "perfect",
      title: "Perfectionist",
      description: "Achieve 100% in a week",
      icon: <Zap className="w-5 h-5" />,
      earned: true
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-game-foreground">Performance Insights</h2>
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-game-warning" />
          <span className="text-sm font-bold text-game-foreground">{stats.totalWeeksTracked} weeks tracked</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
        <InsightCard
          icon={<Trophy className="w-5 h-5" />}
          title="Best Week"
          value={stats.bestWeek ? `${stats.bestWeek.consistencyPercentage}%` : "N/A"}
          subtitle={stats.bestWeek?.weekLabel}
          valueColor="text-game-primary"
          isAchievement={true}
        />
        
        <InsightCard
          icon={<Star className="w-5 h-5" />}
          title="Best Day Ever"
          value={stats.bestDay ? `${stats.bestDay.completedCount} done` : "N/A"}
          subtitle={stats.bestDay ? `${stats.bestDay.dayName}` : undefined}
          isAchievement={true}
        />
        
        <InsightCard
          icon={<Calendar className="w-5 h-5" />}
          title="Most Consistent Day"
          value={stats.mostConsistentDay?.dayName || "N/A"}
          subtitle={stats.mostConsistentDay ? `${stats.mostConsistentDay.averageCompletion}% avg` : undefined}
          isAchievement={true}
        />
        
        <InsightCard
          icon={<BarChart3 className="w-5 h-5" />}
          title="Average Consistency"
          value={`${stats.averageWeeklyConsistency}%`}
          subtitle={`Across ${stats.totalWeeksTracked} week${stats.totalWeeksTracked > 1 ? 's' : ''}`}
          isAchievement={true}
        />
        
        <TrendCard trend={stats.trend} />
      </div>
      
      {/* Achievements Section */}
      <div className="space-y-4">
        <h3 className="text-md font-bold text-game-foreground flex items-center gap-2">
          <Award className="w-5 h-5 text-game-secondary" />
          Achievements
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <Card 
              key={achievement.id} 
              className={cn(
                "overflow-visible relative group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
                achievement.earned ? "game-card streak-active" : "bg-game-card/50 border-game-border"
              )}
            >
              {/* Glow effect for earned achievements */}
              {achievement.earned && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-yellow-400/30 to-orange-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"></div>
              )}
              
              <CardContent className="p-5 relative z-10">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "flex-shrink-0 p-3 rounded-xl relative overflow-hidden transition-transform duration-300 group-hover:rotate-6",
                    achievement.earned 
                      ? "bg-gradient-to-br from-game-secondary to-game-accent text-primary shadow-lg"
                      : "bg-game-muted text-game-muted-foreground"
                  )}>
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-x-full group-hover:translate-x-full"></div>
                    <div className="relative z-10">
                      {achievement.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-base font-bold",
                        achievement.earned ? "text-game-foreground" : "text-game-muted-foreground"
                      )}>
                        {achievement.title}
                      </p>
                      {achievement.earned && (
                        <div className="flex items-center gap-1 bg-gradient-to-br from-yellow-500 to-orange-500 text-white px-2 py-0.5 rounded-full text-[0.6rem] font-bold">
                          <Zap className="w-2.5 h-2.5" />
                          UNLOCKED
                        </div>
                      )}
                    </div>
                    <p className={cn(
                      "text-xs mt-2 leading-relaxed",
                      achievement.earned ? "text-game-muted-foreground" : "text-game-muted-foreground/70"
                    )}>
                      {achievement.description}
                    </p>
                    {achievement.earned && (
                      <div className="mt-3 pt-2 border-t border-game-border/50">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                          <span className="text-xs font-bold text-green-400">Achievement Earned</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

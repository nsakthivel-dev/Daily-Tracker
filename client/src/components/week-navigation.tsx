import { ChevronLeft, ChevronRight, History, CalendarDays, Map, Zap, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type WeekSummary } from "@shared/schema";
import { cn } from "@/lib/utils";
import { soundManager } from "@/lib/sound-manager";

interface WeekNavigationProps {
  weekSummaries: WeekSummary[];
  selectedWeekId: string;
  currentWeekId: string;
  onSelectWeek: (weekId: string) => void;
}

export function WeekNavigation({ 
  weekSummaries, 
  selectedWeekId, 
  currentWeekId,
  onSelectWeek 
}: WeekNavigationProps) {
  const sortedWeeks = [...weekSummaries].sort((a, b) => 
    b.weekId.localeCompare(a.weekId)
  );
  
  const currentIndex = sortedWeeks.findIndex(w => w.weekId === selectedWeekId);
  const selectedWeek = sortedWeeks.find(w => w.weekId === selectedWeekId);
  
  const canGoNewer = currentIndex > 0;
  const canGoOlder = currentIndex < sortedWeeks.length - 1;
  
  const handlePrevious = () => {
    if (canGoOlder) {
      onSelectWeek(sortedWeeks[currentIndex + 1].weekId);
    }
  };
  
  const handleNext = () => {
    if (canGoNewer) {
      onSelectWeek(sortedWeeks[currentIndex - 1].weekId);
    }
  };
  
  const isViewingCurrentWeek = selectedWeekId === currentWeekId;

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card game-theme:game-card shadow-lg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-32 h-32 bg-blue-500 rounded-full mix-blend-soft-light filter blur-2xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/3 w-32 h-32 bg-purple-500 rounded-full mix-blend-soft-light filter blur-2xl opacity-10 animate-pulse animation-delay-1000"></div>
      </div>
      
      <div className="flex items-center gap-2 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            soundManager.playSound("click");
            handlePrevious();
          }}
          disabled={!canGoOlder}
          className="text-game-foreground hover:bg-game-card/70 h-10 w-10 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-game-border/50"
          aria-label="Previous week"
          data-testid="button-previous-week"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-2 min-w-[180px] justify-center bg-gradient-to-r from-game-card/70 to-game-sidebar/70 px-4 py-2 rounded-xl border border-game-border/50 shadow-md backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
          <Map className="w-4 h-4 text-game-primary flex-shrink-0 relative z-10" />
          <span className="font-bold text-sm truncate text-game-foreground relative z-10" data-testid="text-selected-week">
            {selectedWeek?.weekLabel || "No week selected"}
          </span>
          <div className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-game-primary/50 animate-pulse"></div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            soundManager.playSound("click");
            handleNext();
          }}
          disabled={!canGoNewer}
          className="text-game-foreground hover:bg-game-card/70 h-10 w-10 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-game-border/50"
          aria-label="Next week"
          data-testid="button-next-week"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2 relative z-10">
        {!isViewingCurrentWeek && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              soundManager.playSound("click");
              onSelectWeek(currentWeekId);
            }}
            className="border-game-border text-game-foreground hover:bg-game-card/70 h-9 text-xs px-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-game-border/50"
            data-testid="button-go-to-current"
          >
            <Zap className="w-4 h-4 mr-1 text-yellow-400 animate-pulse" />
            Return to Active Quest
          </Button>
        )}
        
        {sortedWeeks.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => soundManager.playSound("click")}
                className="border-game-border text-game-foreground hover:bg-game-card/70 h-9 text-xs px-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-game-border/50 group"
                data-testid="button-view-history"
              >
                <History className="w-4 h-4 mr-1 text-game-secondary group-hover:animate-spin" />
                Quest Archives
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-64 bg-game-popover border-game-popover-border p-2 rounded-xl shadow-xl border backdrop-blur-lg"
            >
              <div className="px-2 py-1.5 text-sm font-bold text-game-foreground border-b border-game-border mb-1">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-game-primary" />
                  Quest Archives
                </div>
              </div>
              {sortedWeeks.map((week, index) => (
                <div key={week.weekId}>
                  {index > 0 && index === sortedWeeks.findIndex(w => w.weekId !== currentWeekId) && (
                    <DropdownMenuSeparator className="bg-game-border my-1" />
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      soundManager.playSound("click");
                      onSelectWeek(week.weekId);
                    }}
                    className={cn(
                      "flex items-center justify-between gap-3 cursor-pointer text-game-foreground hover:bg-game-card/70 py-2 px-3 rounded-lg transition-all duration-300",
                      week.weekId === selectedWeekId && "bg-gradient-to-r from-game-accent to-game-card/50 border border-game-border/50"
                    )}
                    data-testid={`menuitem-week-${week.weekId}`}
                  >
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{week.weekLabel}</span>
                        {week.weekId === currentWeekId && (
                          <div className="flex items-center gap-1 bg-gradient-to-br from-green-500 to-emerald-600 text-white px-1.5 py-0.5 rounded-full text-[0.6rem] font-bold">
                            <Zap className="w-2 h-2" />
                            ACTIVE
                          </div>
                        )}
                      </div>
                      <span className="text-[0.65rem] text-game-muted-foreground mt-0.5">
                        {week.weekId === currentWeekId ? "Current Quest" : "Completed Quest"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-3 h-3 text-yellow-400" />
                      <span className={cn(
                        "font-mono text-xs font-bold px-1.5 py-0.5 rounded-full",
                        week.consistencyPercentage >= 70 ? "bg-green-500/20 text-game-success" :
                        week.consistencyPercentage >= 40 ? "bg-yellow-500/20 text-game-warning" :
                        "bg-red-500/20 text-game-danger"
                      )}>
                        {week.consistencyPercentage}%
                      </span>
                    </div>
                  </DropdownMenuItem>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

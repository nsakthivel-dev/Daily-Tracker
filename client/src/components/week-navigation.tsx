import { ChevronLeft, ChevronRight, History, CalendarDays } from "lucide-react";
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
    <div className="flex items-center justify-between gap-4 p-4 bg-card rounded-lg border border-card-border">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          disabled={!canGoOlder}
          aria-label="Previous week"
          data-testid="button-previous-week"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center gap-2 min-w-[180px] justify-center">
          <CalendarDays className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="font-medium text-sm truncate" data-testid="text-selected-week">
            {selectedWeek?.weekLabel || "No week selected"}
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          disabled={!canGoNewer}
          aria-label="Next week"
          data-testid="button-next-week"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        {!isViewingCurrentWeek && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectWeek(currentWeekId)}
            data-testid="button-go-to-current"
          >
            Go to Current Week
          </Button>
        )}
        
        {sortedWeeks.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-view-history">
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {sortedWeeks.map((week, index) => (
                <div key={week.weekId}>
                  {index > 0 && index === sortedWeeks.findIndex(w => w.weekId !== currentWeekId) && (
                    <DropdownMenuSeparator />
                  )}
                  <DropdownMenuItem
                    onClick={() => onSelectWeek(week.weekId)}
                    className={cn(
                      "flex items-center justify-between gap-2 cursor-pointer",
                      week.weekId === selectedWeekId && "bg-accent"
                    )}
                    data-testid={`menuitem-week-${week.weekId}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{week.weekLabel}</span>
                      <span className="text-xs text-muted-foreground">
                        {week.weekId === currentWeekId ? "Current Week" : "Past Week"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={cn(
                        "font-mono text-sm",
                        week.consistencyPercentage >= 70 ? "text-primary" :
                        week.consistencyPercentage >= 40 ? "text-chart-3" :
                        "text-muted-foreground"
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

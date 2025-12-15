import { useState } from "react";
import { Check, X, Pencil } from "lucide-react";
import { 
  type WeekData, 
  type DayOfWeek, 
  type CellState,
  DAYS_OF_WEEK,
  getDayCompletionCount,
  getWeekLabel
} from "@shared/schema";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RoutineTableProps {
  week: WeekData;
  onCellClick: (routineIndex: number, day: DayOfWeek, newState: CellState) => void;
  onRoutineNameChange: (routineIndex: number, newName: string) => void;
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

function cycleState(current: CellState): CellState {
  switch (current) {
    case "empty": return "completed";
    case "completed": return "not_completed";
    case "not_completed": return "empty";
  }
}

function CellContent({ state }: { state: CellState }) {
  if (state === "completed") {
    return (
      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/15 text-primary">
        <Check className="w-4 h-4" strokeWidth={3} />
      </div>
    );
  }
  if (state === "not_completed") {
    return (
      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-destructive/15 text-destructive">
        <X className="w-4 h-4" strokeWidth={3} />
      </div>
    );
  }
  return <div className="w-7 h-7 rounded-md border border-dashed border-muted-foreground/30" />;
}

export function RoutineTable({ week, onCellClick, onRoutineNameChange }: RoutineTableProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const isReadOnly = !week.isCurrentWeek;
  
  const handleStartEdit = (index: number, name: string) => {
    if (isReadOnly) return;
    setEditingIndex(index);
    setEditValue(name);
  };
  
  const handleSaveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      onRoutineNameChange(editingIndex, editValue.trim());
    }
    setEditingIndex(null);
    setEditValue("");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setEditingIndex(null);
      setEditValue("");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-semibold">
          Week of {getWeekLabel(week.weekStart, week.weekEnd)}
        </h2>
        {isReadOnly && (
          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-md">
            Read-only (Past Week)
          </span>
        )}
      </div>
      
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-3 font-medium text-sm uppercase tracking-wide text-muted-foreground border-b border-border w-[180px]">
                Routine
              </th>
              {DAYS_OF_WEEK.map(day => (
                <th 
                  key={day} 
                  className="p-3 font-medium text-sm uppercase tracking-wide text-muted-foreground border-b border-border text-center w-[70px]"
                >
                  <span className="hidden sm:inline">{SHORT_DAYS[day]}</span>
                  <span className="sm:hidden">{SHORT_DAYS[day].charAt(0)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {week.routines.map((routine, routineIndex) => (
              <tr 
                key={routineIndex} 
                className={cn(
                  "transition-colors",
                  routineIndex % 2 === 0 ? "bg-background" : "bg-muted/20"
                )}
              >
                <td className="p-3 border-b border-border">
                  {editingIndex === routineIndex ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={handleKeyDown}
                      className="h-8 text-sm"
                      autoFocus
                      data-testid={`input-routine-name-${routineIndex}`}
                    />
                  ) : (
                    <button
                      onClick={() => handleStartEdit(routineIndex, routine.name)}
                      className={cn(
                        "flex items-center gap-2 group text-left w-full",
                        isReadOnly && "cursor-default"
                      )}
                      disabled={isReadOnly}
                      data-testid={`button-edit-routine-${routineIndex}`}
                    >
                      <span className="text-sm font-medium truncate flex-1">
                        {routine.name}
                      </span>
                      {!isReadOnly && (
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      )}
                    </button>
                  )}
                </td>
                {DAYS_OF_WEEK.map(day => {
                  const cell = routine.cells[day] || { state: "empty" as CellState };
                  return (
                    <td 
                      key={day} 
                      className="p-3 border-b border-border text-center"
                    >
                      <button
                        onClick={() => {
                          if (!isReadOnly) {
                            onCellClick(routineIndex, day, cycleState(cell.state));
                          }
                        }}
                        className={cn(
                          "inline-flex items-center justify-center transition-transform",
                          !isReadOnly && "hover:scale-110 active:scale-95",
                          isReadOnly && "cursor-default"
                        )}
                        disabled={isReadOnly}
                        data-testid={`cell-routine-${routineIndex}-${day.toLowerCase()}`}
                        aria-label={`${routine.name} on ${day}: ${cell.state}`}
                      >
                        <CellContent state={cell.state} />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/70 font-medium">
              <td className="p-3 text-sm text-muted-foreground">
                Daily Total
              </td>
              {DAYS_OF_WEEK.map(day => {
                const completed = getDayCompletionCount(week, day);
                const total = week.routines.length;
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                return (
                  <td 
                    key={day} 
                    className="p-3 text-center"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-mono text-sm font-semibold" data-testid={`text-daily-total-${day.toLowerCase()}`}>
                        {completed}/{total}
                      </span>
                      <span className={cn(
                        "text-xs font-mono",
                        percentage >= 70 ? "text-primary" : 
                        percentage >= 40 ? "text-chart-3" : "text-muted-foreground"
                      )}>
                        {percentage}%
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

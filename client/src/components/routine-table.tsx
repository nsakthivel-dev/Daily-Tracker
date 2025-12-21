import { useState, useEffect } from "react";
import { Check, X, Pencil, Shield, Star, Sword, ShieldX } from "lucide-react";
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
import { soundManager } from "@/lib/sound-manager";

interface RoutineTableProps {
  week: WeekData;
  onCellClick: (routineIndex: number, day: DayOfWeek, newState: CellState) => Promise<void>;
  onRoutineNameChange: (routineIndex: number, newName: string) => Promise<void>;
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

// Cycling logic:
// 1st click: empty -> completed (Sword/Knife icon, +10 XP)
// 2nd click: completed -> not_completed (Broken Shield icon, -5 XP)
// 3rd click: not_completed -> empty (Clown icon, -10 XP)
function cycleState(current: CellState): CellState {
  switch (current) {
    case "empty": return "completed"; // Knife icon, +10 XP
    case "completed": return "not_completed"; // Broken shield icon, -5 XP
    case "not_completed": return "empty"; // Clown icon, -10 XP
  }
}

function CellContent({ state }: { state: CellState }) {
  if (state === "completed") {
    return (
      <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg cell-completed transition-all duration-300 hover:scale-110 transform hover:-translate-y-1 shadow-md hover:shadow-lg relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
        <Sword className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 relative z-10 drop-shadow-lg" strokeWidth={2.5} />
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>
      </div>
    );
  }
  if (state === "not_completed") {
    return (
      <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg cell-not-completed transition-all duration-300 hover:scale-110 transform hover:-translate-y-1 shadow-md hover:shadow-lg relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-rose-500/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
        <ShieldX className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 relative z-10 drop-shadow-lg" strokeWidth={2.5} />
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg"></div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg cell-empty transition-all duration-300 hover:scale-110 transform hover:-translate-y-1 shadow-md hover:shadow-lg relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 to-gray-500/10 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
      <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 relative z-10 drop-shadow-md">
          <path d="M12 2C8.5 2 9 4.5 7.5 5.5C6 6.5 4 6 4 9C4 12 6 14 9 14C12 14 14 12 14 9C14 6 12 6.5 10.5 5.5C9 4.5 9.5 2 12 2ZM12 4C11 4 10.5 4.5 10 5C9.5 5.5 9 6 9 7C9 8 10 9 11 9C12 9 13 8 13 7C13 6 12.5 5.5 12 5C11.5 4.5 11 4 12 4ZM16.5 7C15.7 7 15 7.7 15 8.5C15 9.3 15.7 10 16.5 10C17.3 10 18 9.3 18 8.5C18 7.7 17.3 7 16.5 7ZM7.5 7C6.7 7 6 7.7 6 8.5C6 9.3 6.7 10 7.5 10C8.3 10 9 9.3 9 8.5C9 7.7 8.3 7 7.5 7ZM12 15C9 15 7 17 7 19V21H17V19C17 17 15 15 12 15Z" />
        </svg>
      </div>
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg"></div>
    </div>
  );
}

export function RoutineTable({ week, onCellClick, onRoutineNameChange }: RoutineTableProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const isReadOnly = !week.isCurrentWeek;
  
  // Resume audio context on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      soundManager.resumeAudioContext();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
    
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);
  
  const handleStartEdit = (index: number, name: string) => {
    if (isReadOnly) return;
    soundManager.playSound("click");
    setEditingIndex(index);
    setEditValue(name);
  };
  
  const handleSaveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      try {
        soundManager.playSound("complete");
        onRoutineNameChange(editingIndex, editValue.trim());
      } catch (error) {
        console.error("Error updating routine name:", error);
      }
    }
    setEditingIndex(null);
    setEditValue("");
  };
  
  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full mx-auto px-1 sm:px-2">
      <div className="flex items-center justify-between gap-2 flex-wrap bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div className="quest-marker"></div>
          <h2 className="text-sm sm:text-base font-bold text-white">
            Quest Log: {getWeekLabel(week.weekStart, week.weekEnd)}
          </h2>
        </div>
        {isReadOnly ? (
          <span className="text-xs bg-red-500 px-2 py-1 rounded-md text-white font-bold flex items-center gap-1">
            <Shield className="w-3 h-3" /> Locked Archive
          </span>
        ) : (
          <span className="text-xs bg-green-500 px-2 py-1 rounded-md text-white font-bold flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path d="M11 11V3.5C11 2.67 11.67 2 12.5 2S14 2.67 14 3.5V11H20.5C21.33 11 22 11.67 22 12.5S21.33 14 20.5 14H14V20.5C14 21.33 13.33 22 12.5 22S11 21.33 11 20.5V14H3.5C2.67 14 2 13.33 2 12.5S2.67 11 3.5 11H11Z" />
            </svg> Active Quest
          </span>
        )}
      </div>
      
      <div className="border border-border rounded-xl bg-card game-theme:game-card shadow-xl w-full mx-auto overflow-hidden">
        <table className="w-full border-collapse game-table">
          <thead>
            <tr className="bg-gradient-to-r from-game-primary/30 via-game-secondary/30 to-game-accent/30 shadow-md">
              <th className="text-left p-1.5 sm:p-2 font-bold text-xs sm:text-sm uppercase tracking-tight bg-gradient-to-r from-game-primary/40 to-game-secondary/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-center gap-1.5 sm:gap-2 relative z-10">
                  <div className="p-1 sm:p-1.5 rounded-lg bg-game-primary/80 shadow-lg transform transition-transform duration-300 hover:scale-105">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 text-white">
                      <path d="M11 11V3.5C11 2.67 11.67 2 12.5 2S14 2.67 14 3.5V11H20.5C21.33 11 22 11.67 22 12.5S21.33 14 20.5 14H14V20.5C14 21.33 13.33 22 12.5 22S11 21.33 11 20.5V14H3.5C2.67 14 2 13.33 2 12.5S2.67 11 3.5 11H11Z" />
                    </svg>
                  </div>
                  <span className="drop-shadow-lg text-xs sm:text-sm">Routine Quests</span>
                </div>
              </th>
                {DAYS_OF_WEEK.map(day => (
                  <th 
                    key={day} 
                    className="p-1 sm:p-2 font-bold text-[10px] sm:text-xs uppercase tracking-tight text-center bg-gradient-to-r from-game-primary/40 to-game-secondary/40 relative overflow-hidden group/day-header transition-all duration-300 hover:bg-game-primary/50"
                  >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/day-header:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10 flex items-center justify-center gap-1">
                    <span className="drop-shadow-md font-extrabold">{SHORT_DAYS[day]}</span>
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white/70 group-hover/day-header:animate-pulse"></div>
                  </div>
                </th>
              ))}
                <th className="p-1 sm:p-2 font-extrabold text-xs sm:text-sm uppercase tracking-tight text-center bg-gradient-to-r from-game-secondary/60 to-game-accent/60 text-yellow-100">
                  <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 drop-shadow-xl transform transition-transform duration-300 hover:rotate-12" />
                    <span className="drop-shadow-xl text-[10px] sm:text-xs">XP</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {week.routines.map((routine, routineIndex) => (
              <tr 
                key={routineIndex} 
                className={cn(
                  "transition-all duration-300 hover:bg-game-card/70 transform hover:-translate-y-0.5",
                  routineIndex % 2 === 0 ? "bg-game-card/30" : "bg-game-card/50"
                )}
              >
                  <td className="p-1.5 sm:p-2 border-b border-game-border bg-game-card/20 relative group/table-row">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-game-primary/10 to-transparent opacity-0 group-hover/table-row:opacity-100 transition-opacity duration-500 z-0"></div>
                  <div className="flex items-center gap-1 sm:gap-2 w-full">
                    {editingIndex === routineIndex ? (
                      <div className="flex items-center gap-1 w-full">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="h-7 sm:h-8 text-xs sm:text-sm bg-game-input border-game-border text-game-foreground rounded-lg px-2 sm:px-3 shadow-inner focus:ring-2 focus:ring-game-primary/50 transition-all duration-300 flex-1 relative z-10"
                          autoFocus
                          data-testid={`input-routine-name-${routineIndex}`}
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-green-500/20 hover:bg-green-500/40 border border-green-500/30 hover:border-green-500/60 transition-all duration-300 flex-shrink-0 group/save-btn hover:scale-110 active:scale-95 relative z-10"
                          title="Save changes"
                          type="button"
                        >
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500 group-hover/save-btn:text-white transition-colors duration-300" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 hover:border-red-500/60 transition-all duration-300 flex-shrink-0 group/cancel-btn hover:scale-110 active:scale-95 relative z-10"
                          title="Cancel editing"
                          type="button"
                        >
                          <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 group-hover/cancel-btn:text-white transition-colors duration-300" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-game-primary/70 flex-shrink-0 group-hover/table-row:animate-pulse"></div>
                        <span className="text-xs sm:text-sm font-medium truncate flex-1 group-hover/table-row:text-game-primary transition-colors duration-300 text-game-foreground">
                          {routine.name}
                        </span>
                        {!isReadOnly && (
                          <button
                            onClick={() => handleStartEdit(routineIndex, routine.name)}
                            className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-game-primary/20 hover:bg-game-primary/40 border border-game-primary/30 hover:border-game-primary/60 transition-all duration-300 flex-shrink-0 group/edit-btn hover:scale-110 active:scale-95 relative z-10"
                            data-testid={`button-edit-routine-${routineIndex}`}
                            title="Edit quest name"
                            type="button"
                          >
                            <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-game-primary group-hover/edit-btn:text-white transition-colors duration-300" />
                          </button>
                        )}
                        {isReadOnly && (
                          <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gray-500/20 border border-gray-500/30 flex-shrink-0" title="Cannot edit archived quests">
                            <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500" />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </td>
                {DAYS_OF_WEEK.map(day => {
                  const cell = routine.cells[day] || { state: "empty" as CellState };
                  return (
                    <td 
                      key={day} 
                      className="p-0.5 sm:p-1.5 border-b border-game-border text-center bg-game-card/20 align-middle"
                    >
                      <button
                        onClick={() => {
                          if (!isReadOnly) {
                            const newState = cycleState(cell.state);
                            // Play sound effect based on new state
                            if (newState === "completed") {
                              soundManager.playSound("complete");
                            } else if (newState === "not_completed") {
                              soundManager.playSound("error");
                            } else {
                              soundManager.playSound("click");
                            }
                            onCellClick(routineIndex, day, newState);
                          }
                        }}
                        className={cn(
                          "inline-flex items-center justify-center transition-transform relative mx-auto",
                          !isReadOnly && "hover:scale-110 active:scale-95 cursor-pointer",
                          isReadOnly && "cursor-default opacity-70"
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
              <tr className="bg-gradient-to-r from-game-sidebar to-game-card font-bold border-t-2 border-game-border shadow-lg">
                <td className="p-1.5 sm:p-2 text-xs sm:text-sm text-game-foreground">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="p-1 sm:p-1.5 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg transform transition-transform duration-300 hover:scale-105">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white drop-shadow-lg" />
                    </div>
                    <span className="font-extrabold text-xs sm:text-sm drop-shadow-xl">Totals</span>
                    <div className="ml-auto flex items-center gap-1 bg-game-card/70 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-game-border shadow-md transform transition-all duration-300 hover:shadow-lg">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse"></div>
                      <span className="text-[10px] sm:text-xs font-extrabold text-game-foreground">Live</span>
                  </div>
                </div>
              </td>
              {DAYS_OF_WEEK.map(day => {
                const completed = getDayCompletionCount(week, day);
                const total = week.routines.length;
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                // Calculate XP based on the new system:
                // - Completed state (Sword/Knife icon): +10 XP
                // - Not completed state (Broken Shield icon): -5 XP
                // - Empty state (Clown icon): -10 XP
                let dailyXp = 0;
                week.routines.forEach(routine => {
                  const cellState = routine.cells[day]?.state || "empty";
                  if (cellState === "completed") {
                    dailyXp += 10;
                  } else if (cellState === "not_completed") {
                    dailyXp -= 5;
                  } else {
                    // empty state contributes -10 XP
                    dailyXp -= 10;
                  }
                });
                
                return (
                    <td 
                      key={day} 
                      className="p-0.5 sm:p-1.5 text-center group/daily-total hover:bg-game-card/30 transition-all duration-300 align-top"
                    >
                      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                        <div className="flex items-center gap-0.5 sm:gap-1 bg-game-card/60 px-1 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-game-border group-hover/daily-total:shadow-lg transition-all duration-300 transform group-hover/daily-total:-translate-y-1">
                          <span className="font-mono text-[10px] sm:text-xs font-extrabold text-game-foreground drop-shadow" data-testid={`text-daily-total-${day.toLowerCase()}`}>
                          {completed}/{total}
                        </span>
                      </div>
                        <div className="xp-bar-container w-full max-w-[40px] sm:max-w-[50px] mx-auto h-2 sm:h-2.5 rounded-full overflow-hidden shadow-sm border border-game-border/50">
                        <div 
                          className="xp-bar-fill h-full rounded-full shadow-sm" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                        <span className="text-[10px] sm:text-xs font-extrabold flex items-center gap-0.5 sm:gap-1 group-hover/daily-total:scale-110 transition-transform duration-300">
                          {dailyXp >= 0 ? (
                            <div className="flex items-center gap-0.5 sm:gap-1 bg-gradient-to-br from-green-500 to-emerald-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-md font-extrabold text-[10px] sm:text-xs transform transition-all duration-300 hover:scale-105">
                              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 drop-shadow" />
                              <span className="drop-shadow">+{dailyXp}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-0.5 sm:gap-1 bg-gradient-to-br from-red-500 to-rose-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-md font-extrabold text-[10px] sm:text-xs transform transition-all duration-300 hover:scale-105">
                              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 drop-shadow" />
                              <span className="drop-shadow">{dailyXp}</span>
                          </div>
                        )}
                      </span>
                    </div>
                  </td>
                );
              })}
                <td className="p-0.5 sm:p-1.5 text-center align-top">
                  <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                    <div className="text-[9px] sm:text-[10px] font-bold text-game-muted-foreground bg-game-card/50 px-1 sm:px-1.5 py-0.5 rounded-lg border border-game-border">
                    TOTAL XP
                  </div>
                    <div className="text-xs sm:text-sm font-extrabold text-yellow-200 flex items-center gap-1 sm:gap-1.5 bg-gradient-to-br from-yellow-500/40 to-orange-500/40 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-yellow-400/60 shadow-lg transform transition-all duration-300 hover:scale-105">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 drop-shadow-lg" />
                    <span className="drop-shadow-lg">
                      {// Calculate total XP based on the new system:
                      // - Completed state (Sword/Knife icon): +10 XP
                      // - Not completed state (Broken Shield icon): -5 XP
                      // - Empty state (Clown icon): -10 XP
                      week.routines.reduce((totalXp, routine) => {
                        let routineXp = 0;
                        Object.values(routine.cells).forEach(cell => {
                          if (cell.state === 'completed') {
                            routineXp += 10;
                          } else if (cell.state === 'not_completed') {
                            routineXp -= 5;
                          } else {
                            // empty state contributes -10 XP
                            routineXp -= 10;
                          }
                        });
                        return totalXp + routineXp;
                      }, 0)}
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
          </table>
        </div>
      </div>
  );
}

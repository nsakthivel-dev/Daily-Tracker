import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Sword, Crown, Zap, User, LogOut, LogIn } from "lucide-react";
import { soundManager } from "@/lib/sound-manager";
import { useState, useEffect } from "react";

export function Header() {
  const { theme, toggleTheme, toggleGameTheme } = useTheme();
  const [user, setUser] = useState<{ id: string; displayName: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${apiUrl}/auth/user`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setUser(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${apiUrl}/auth/logout`, { 
      method: "POST", 
      credentials: "include" 
    })
      .then(() => {
        setUser(null);
        // Reload the page to reset the app state
        window.location.reload();
      })
      .catch((error) => {
        console.error("Logout failed:", error);
      });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 game-theme:bg-game-border game-theme:bg-game-background/95 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-primary shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-500/30 animate-pulse"></div>
              <Sword className="w-7 h-7 relative z-10 drop-shadow-lg" />
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl"></div>
            </div>
            <div className="flex flex-col transition-all duration-300 group-hover:translate-x-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-primary drop-shadow-lg">
                  QuestLog
                </h1>
                <Zap className="w-5 h-5 text-yellow-300 animate-pulse" />
              </div>
              <span className="text-xs text-game-muted-foreground -mt-1 font-medium tracking-wide">Level up your routines</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            ) : user ? (
              // User is logged in - show user info and logout button
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-game-card/50 backdrop-blur-sm border border-game-border/50">
                  <User className="w-5 h-5 text-game-foreground" />
                  <span className="text-sm font-medium text-game-foreground hidden md:inline">
                    {user.displayName || user.email}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-game-foreground hover:bg-game-card/50 backdrop-blur-sm border border-game-border/50 rounded-lg transition-all duration-300 hover:scale-105"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              // User is not logged in - show login button
              <Button
                variant="ghost"
                onClick={() => {
                  const apiUrl = import.meta.env.VITE_API_URL || '';
                  window.location.href = `${apiUrl}/auth/google`;
                }}
                className="text-game-foreground hover:bg-game-card/50 backdrop-blur-sm border border-game-border/50 rounded-lg transition-all duration-300 hover:scale-105 group flex items-center gap-2"
                aria-label="Login with Google"
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:inline font-bold">Login</span>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                soundManager.playSound("click");
                toggleGameTheme();
              }}
              className="text-game-foreground hover:bg-game-card/50 backdrop-blur-sm border border-game-border/50 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group"
              aria-label={theme === "game" ? "Turn off game mode" : "Turn on game mode"}
              data-testid="button-game-theme"
            >
              <Crown className={`w-4 h-4 mr-1 ${theme === "game" ? "text-yellow-300" : "text-yellow-400"} group-hover:animate-bounce`} />
              <span className="hidden sm:inline font-bold">{theme === "game" ? "Game Mode On" : "Game Mode"}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                soundManager.playSound("click");
                toggleTheme();
              }}
              className="text-game-foreground hover:bg-game-card/50 backdrop-blur-sm border border-game-border/50 rounded-lg transition-all duration-300 hover:scale-105"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

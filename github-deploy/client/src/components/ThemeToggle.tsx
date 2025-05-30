import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
      return savedTheme;
    }
    // Default to system
    return "system";
  });
  
  // Apply theme on component mount and theme change
  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (newTheme: Theme) => {
      if (newTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        root.classList.remove("light", "dark");
        root.classList.add(systemTheme);
      } else {
        root.classList.remove("light", "dark");
        root.classList.add(newTheme);
      }
    };
    
    applyTheme(theme);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);
  
  // Update theme and save to localStorage
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    toast({
      title: t("settings.theme") + " " + (language === "en" ? "changed" : "تم تغييره"),
      description: language === "en" 
        ? `Theme set to ${newTheme}` 
        : `تم تعيين السمة إلى ${newTheme === "light" ? "فاتح" : newTheme === "dark" ? "داكن" : "النظام"}`,
      duration: 2000,
    });
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 border-0">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          <Sun className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
          <span>{t("settings.light")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          <Moon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
          <span>{t("settings.dark")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          <span>{t("settings.system")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
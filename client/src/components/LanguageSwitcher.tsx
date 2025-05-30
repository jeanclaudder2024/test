import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageSwitcherProps {
  variant?: "icon" | "button";
  showLabel?: boolean;
}

export default function LanguageSwitcher({ variant = "button", showLabel = true }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();

  const handleLanguageChange = (newLanguage: "en" | "ar") => {
    console.log("Language change requested:", newLanguage, "Current language:", language);
    if (newLanguage !== language) {
      console.log("Language is different, updating...");
      setLanguage(newLanguage);
      toast({
        title: newLanguage === "en" ? "Language Changed" : "تم تغيير اللغة",
        description: newLanguage === "en" ? "English language is now active" : "اللغة العربية مفعلة الآن",
      });
    } else {
      console.log("Language is already set to:", newLanguage);
    }
  };

  if (variant === "icon") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20"
            aria-label={t("settings.language")}
          >
            <Languages className="h-4 w-4 text-primary" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleLanguageChange("en")}>
            <span className={language === "en" ? "font-bold" : ""}>English</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLanguageChange("ar")}>
            <span className={language === "ar" ? "font-bold" : ""}>العربية</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex gap-2">
      {showLabel && <span className="text-sm text-primary/80 font-medium">{t("settings.language")}:</span>}
      <Button
        variant={language === "en" ? "default" : "outline"}
        size="sm"
        onClick={() => handleLanguageChange("en")}
        className="px-3"
      >
        English
      </Button>
      <Button
        variant={language === "ar" ? "default" : "outline"}
        size="sm"
        onClick={() => handleLanguageChange("ar")}
        className="px-3"
      >
        العربية
      </Button>
    </div>
  );
}
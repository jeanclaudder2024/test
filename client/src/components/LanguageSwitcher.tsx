import React, { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { FlagIcon } from 'react-flag-kit';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  position?: 'navbar' | 'sidebar' | 'footer';
  showLabel?: boolean;
  variant?: 'default' | 'icon';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  position = 'navbar',
  showLabel = true,
  variant = 'default'
}) => {
  const { language, setLanguage, t, languages, getLanguageFlag } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLangDetails = languages[language] || languages.en;

  const handleChangeLanguage = (lng: string) => {
    setLanguage(lng);
    setIsOpen(false);
  };

  // Style variants based on position
  const getButtonStyle = () => {
    switch (position) {
      case 'navbar':
        return 'bg-transparent hover:bg-primary/10 text-foreground';
      case 'sidebar':
        return 'w-full justify-start bg-transparent hover:bg-primary/10 text-foreground';
      case 'footer':
        return 'bg-transparent hover:bg-primary/10 text-muted-foreground text-sm';
      default:
        return 'bg-transparent hover:bg-primary/10';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`flex items-center gap-2 ${getButtonStyle()}`}
          aria-label={t('language.selectLanguage')}
          size={variant === 'icon' ? 'icon' : 'default'}
        >
          {variant === 'default' ? (
            <div className="flex items-center gap-2">
              <FlagIcon 
                code={getLanguageFlag(currentLangDetails.flag)}
                size={18} 
                className="rounded-sm shadow-sm"
              />
              {showLabel && (
                <span className="hidden sm:inline-block">
                  {t('language.language')}
                </span>
              )}
              <Globe className="h-4 w-4" />
            </div>
          ) : (
            <FlagIcon 
              code={getLanguageFlag(currentLangDetails.flag)}
              size={18} 
              className="rounded-sm shadow-sm"
            />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[200px] p-2">
        <div className="mb-2 px-2 py-1.5 text-sm font-semibold">
          {t('language.selectLanguage')}
        </div>
        {Object.entries(languages).map(([code, { nativeName, flag, dir }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleChangeLanguage(code)}
            className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer ${
              language === code ? 'bg-muted' : ''
            }`}
          >
            <FlagIcon 
              code={getLanguageFlag(flag)} 
              size={16} 
              className="rounded-sm shadow-sm" 
            />
            <span className={dir === 'rtl' ? 'font-arabic' : ''}>
              {nativeName}
            </span>
            {language === code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
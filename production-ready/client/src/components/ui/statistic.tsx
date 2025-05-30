import React, { HTMLAttributes, useEffect, useRef, useState } from "react";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  MinusIcon
} from "lucide-react";

const statisticVariants = cva(
  "flex flex-col gap-1 p-4 rounded-lg",
  {
    variants: {
      variant: {
        default: "bg-card",
        primary: "bg-primary/10",
        secondary: "bg-secondary/10",
        success: "bg-success/10 text-success-foreground",
        accent: "bg-accent/10 text-accent-foreground",
        destructive: "bg-destructive/10 text-destructive-foreground",
        neutral: "bg-muted",
        outline: "border border-border",
        ghost: "bg-transparent",
      },
      size: {
        sm: "gap-0.5 p-3",
        default: "gap-1 p-4",
        lg: "gap-2 p-5",
      },
      align: {
        left: "items-start text-left",
        center: "items-center text-center",
        right: "items-end text-right",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      align: "left",
    },
  }
);

export interface StatisticProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statisticVariants> {
  label: React.ReactNode;
  value: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  animate?: boolean;
  animationDelay?: number;
}

export function Statistic({
  label,
  value,
  prefix,
  suffix,
  variant,
  size,
  align,
  trend,
  trendLabel,
  icon,
  className,
  isLoading = false,
  animate = false,
  animationDelay = 0,
  ...props
}: StatisticProps) {
  const [displayValue, setDisplayValue] = useState<React.ReactNode>(animate ? 0 : value);
  const [isAnimated, setIsAnimated] = useState(false);
  const prevValueRef = useRef<React.ReactNode>(0);
  const isNumber = typeof value === 'number';
  
  useEffect(() => {
    if (!animate || !isNumber || isAnimated) return;

    const numericValue = typeof value === 'number' ? value : 0;
    const prevValue = typeof prevValueRef.current === 'number' ? prevValueRef.current : 0;
    const diff = numericValue - prevValue;
    const steps = 20; // Number of steps for animation
    const stepValue = diff / steps;
    let currentStep = 0;

    if (animationDelay > 0) {
      const delayTimeout = setTimeout(() => {
        const interval = setInterval(() => {
          currentStep++;
          const newValue = prevValue + stepValue * currentStep;
          setDisplayValue(currentStep >= steps ? numericValue : Math.round(newValue * 100) / 100);
          
          if (currentStep >= steps) {
            clearInterval(interval);
            setIsAnimated(true);
          }
        }, 30);
        
        return () => clearInterval(interval);
      }, animationDelay);
      
      return () => clearTimeout(delayTimeout);
    } else {
      const interval = setInterval(() => {
        currentStep++;
        const newValue = prevValue + stepValue * currentStep;
        setDisplayValue(currentStep >= steps ? numericValue : Math.round(newValue * 100) / 100);
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setIsAnimated(true);
        }
      }, 30);
      
      return () => clearInterval(interval);
    }
  }, [value, animate, isAnimated, animationDelay]);

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value);
    }
    
    if (typeof value !== typeof prevValueRef.current) {
      setDisplayValue(value);
      setIsAnimated(true);
    }
    
    prevValueRef.current = value;
  }, [value, animate]);

  return (
    <div
      className={cn(
        statisticVariants({ variant, size, align }),
        className
      )}
      {...props}
    >
      <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
        {icon && <span className="text-foreground/80">{icon}</span>}
        {isLoading ? <Skeleton className="h-4 w-24" /> : label}
      </div>

      <div className="text-2xl font-semibold flex items-center gap-1 leading-none">
        {isLoading ? (
          <Skeleton className="h-7 w-32" />
        ) : (
          <>
            {prefix && <span className="text-muted-foreground">{prefix}</span>}
            <span>{displayValue}</span>
            {suffix && <span className="text-muted-foreground text-sm">{suffix}</span>}
          </>
        )}
      </div>

      {(trend !== undefined || trendLabel) && !isLoading && (
        <div className="flex items-center text-xs gap-1 mt-1">
          {trend !== undefined && (
            <span
              className={cn(
                "flex items-center font-medium",
                trend > 0
                  ? "text-success"
                  : trend < 0
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {trend > 0 ? (
                <ArrowUpIcon className="mr-1 h-3 w-3" />
              ) : trend < 0 ? (
                <ArrowDownIcon className="mr-1 h-3 w-3" />
              ) : (
                <MinusIcon className="mr-1 h-3 w-3" />
              )}
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          {trendLabel && (
            <span className="text-muted-foreground">
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
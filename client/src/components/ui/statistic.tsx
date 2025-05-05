import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";

const statisticVariants = cva(
  "flex flex-col space-y-1.5",
  {
    variants: {
      variant: {
        default: "",
        card: "rounded-lg border p-4 bg-card shadow-sm",
        outline: "rounded-lg border border-primary/20 p-4 bg-card/50 shadow-sm",
        ghost: "rounded-lg bg-card/50 p-4",
        inline: "flex-row items-center space-y-0 space-x-3"
      },
      size: {
        default: "",
        sm: "text-sm",
        lg: "text-lg"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

const statisticLabelVariants = cva(
  "text-sm font-medium text-muted-foreground",
  {
    variants: {
      variant: {
        default: "",
        card: "",
        outline: "",
        ghost: "",
        inline: "text-sm font-normal"
      },
      size: {
        default: "",
        sm: "text-xs",
        lg: "text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

const statisticValueVariants = cva(
  "text-2xl font-bold tracking-tight",
  {
    variants: {
      variant: {
        default: "",
        card: "",
        outline: "",
        ghost: "",
        inline: "text-lg"
      },
      size: {
        default: "",
        sm: "text-lg",
        lg: "text-3xl"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
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
  className,
  variant,
  size,
  label,
  value,
  prefix,
  suffix,
  trend,
  trendLabel,
  icon,
  isLoading = false,
  animate = true,
  animationDelay = 0,
  ...props
}: StatisticProps) {
  const getTrendIcon = () => {
    if (trend === undefined) return null;
    if (trend > 0) return <ArrowUpIcon className="h-3 w-3 text-green-500" />;
    if (trend < 0) return <ArrowDownIcon className="h-3 w-3 text-red-500" />;
    return <MinusIcon className="h-3 w-3 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (trend === undefined) return "";
    if (trend > 0) return "text-green-500";
    if (trend < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  const formatTrend = () => {
    if (trend === undefined) return "";
    const absoluteTrend = Math.abs(trend);
    return `${trend > 0 ? '+' : ''}${absoluteTrend}%`;
  };

  const valueVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay: animationDelay,
        ease: [0.34, 1.56, 0.64, 1] // Spring-like ease
      }
    }
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.4,
        delay: animationDelay + 0.1
      }
    }
  };

  return (
    <div
      className={cn(statisticVariants({ variant, size }), className)}
      {...props}
    >
      {icon && variant !== "inline" && (
        <motion.div
          initial={animate ? "hidden" : "visible"}
          animate="visible"
          variants={iconVariants}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary",
            variant === "outline" && "bg-primary/5"
          )}
        >
          {icon}
        </motion.div>
      )}
      {variant === "inline" && icon ? (
        <motion.div
          initial={animate ? "hidden" : "visible"}
          animate="visible"
          variants={iconVariants}
          className="flex-shrink-0"
        >
          {icon}
        </motion.div>
      ) : null}
      <div className={variant === "inline" ? "flex-1" : ""}>
        <div className={cn(statisticLabelVariants({ variant, size }))}>
          {label}
        </div>
        <motion.div
          initial={animate ? "hidden" : "visible"}
          animate="visible"
          variants={valueVariants}
          className="flex items-baseline gap-1"
        >
          {prefix && <span className="text-muted-foreground text-base">{prefix}</span>}
          <div className={cn(statisticValueVariants({ variant, size }))}>
            {isLoading ? (
              <div className="h-7 w-20 rounded bg-muted animate-pulse"></div>
            ) : (
              value
            )}
          </div>
          {suffix && <span className="text-muted-foreground text-base">{suffix}</span>}
        </motion.div>
        {trend !== undefined && (
          <div className="flex items-center text-xs mt-1 gap-1">
            {getTrendIcon()}
            <span className={cn("font-medium", getTrendColor())}>
              {formatTrend()}
            </span>
            {trendLabel && (
              <span className="text-muted-foreground ml-1">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
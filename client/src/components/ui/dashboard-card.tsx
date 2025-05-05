import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";

const dashboardCardVariants = cva(
  "transition-all duration-300 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-card",
        primary: "bg-primary text-primary-foreground",
        accent: "bg-accent",
        muted: "bg-muted/80",
        gradient: "bg-gradient-to-br from-primary/80 to-primary text-primary-foreground"
      },
      size: {
        default: "",
        sm: "p-2",
        lg: "p-6"
      },
      hover: {
        default: "hover:shadow-md",
        none: "",
        lift: "hover:-translate-y-1 hover:shadow-lg",
        glow: "hover:shadow-[0_0_20px_rgba(var(--primary)/0.3)]"
      },
      borderStyle: {
        default: "border",
        none: "border-0",
        accent: "border-l-4 border-l-primary"
      },
      rounded: {
        default: "rounded-lg",
        none: "rounded-none",
        full: "rounded-2xl",
        sm: "rounded-md"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      hover: "default",
      borderStyle: "default",
      rounded: "default"
    }
  }
);

export interface DashboardCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dashboardCardVariants> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
  animation?: "fade" | "slide" | "scale" | "none";
  animationDelay?: number;
}

const loadingVariants = {
  pulse: {
    opacity: [0.7, 1, 0.7],
    transition: {
      repeat: Infinity,
      duration: 2
    }
  }
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function DashboardCard({
  className,
  title,
  description,
  icon,
  footer,
  children,
  variant,
  size,
  hover,
  borderStyle,
  rounded,
  isLoading = false,
  animation = "fade",
  animationDelay = 0,
  ...props
}: DashboardCardProps) {
  // Animation variants
  const getAnimationVariants = () => {
    switch (animation) {
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        };
      case "slide":
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        };
      case "scale":
        return {
          hidden: { opacity: 0, scale: 0.9 },
          visible: { opacity: 1, scale: 1 }
        };
      default:
        return {
          hidden: { opacity: 1 },
          visible: { opacity: 1 }
        };
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={getAnimationVariants()}
      transition={{ 
        duration: 0.4,
        ease: "easeOut",
        delay: animationDelay 
      }}
    >
      <Card
        className={cn(dashboardCardVariants({ variant, size, hover, borderStyle, rounded }), className)}
        {...props}
      >
        {(title || description) && (
          <CardHeader className={cn(
            "gap-1 pb-2",
            variant === "primary" && "text-primary-foreground",
            variant === "gradient" && "text-primary-foreground",
            size === "sm" && "p-3"
          )}>
            {title && (
              <div className="flex items-center justify-between">
                <CardTitle className={cn(
                  "text-lg font-semibold tracking-tight",
                  variant === "primary" && "text-primary-foreground",
                  variant === "gradient" && "text-primary-foreground"
                )}>
                  {title}
                </CardTitle>
                {icon && (
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md bg-muted/30",
                    variant === "primary" && "bg-primary-foreground/10 text-primary-foreground",
                    variant === "gradient" && "bg-primary-foreground/10 text-primary-foreground"
                  )}>
                    {icon}
                  </div>
                )}
              </div>
            )}
            {description && (
              <CardDescription className={cn(
                "text-sm text-muted-foreground",
                variant === "primary" && "text-primary-foreground/80",
                variant === "gradient" && "text-primary-foreground/80"
              )}>
                {description}
              </CardDescription>
            )}
          </CardHeader>
        )}
        <CardContent className={cn(
          "pt-2",
          size === "sm" && "p-3",
          !title && !description && "pt-4"
        )}>
          {isLoading ? (
            <motion.div
              variants={loadingVariants}
              animate="pulse"
              className="w-full py-4 flex items-center justify-center"
            >
              <div className="h-8 w-8 rounded-full border-2 border-primary border-b-transparent animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              transition={{ 
                duration: 0.3, 
                delay: 0.1 + animationDelay,
                ease: "easeOut"
              }}
            >
              {children}
            </motion.div>
          )}
        </CardContent>
        {footer && (
          <CardFooter className={cn(
            "pt-2 flex items-center",
            size === "sm" && "p-3 pt-2",
            variant === "primary" && "text-primary-foreground/80",
            variant === "gradient" && "text-primary-foreground/80"
          )}>
            {footer}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
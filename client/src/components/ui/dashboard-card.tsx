import { HTMLAttributes, ReactNode, forwardRef } from "react";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Skeleton } from "./skeleton";

const dashboardCardVariants = cva(
  "transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground shadow-card hover:shadow-md",
        transparent: "bg-transparent border border-border/50 hover:border-border/80",
        highlight: "bg-primary/5 border border-primary/20 hover:bg-primary/10",
        destructive: "bg-destructive/10 border-destructive/20 hover:bg-destructive/20 text-destructive-foreground",
        success: "bg-success/10 border-success/20 hover:bg-success/20 text-success-foreground",
        accent: "bg-accent/10 border-accent/20 hover:bg-accent/20 text-accent-foreground",
        neutral: "bg-card text-card-foreground border border-border hover:bg-muted/50",
      },
      size: {
        sm: "p-3",
        md: "p-5",
        lg: "p-6",
      },
      hover: {
        true: "hover:translate-y-[-2px] hover:shadow-md",
        false: "",
      },
      hasAction: {
        true: "cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      hover: true,
      hasAction: false,
    },
  }
);

interface DashboardCardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof dashboardCardVariants> {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  footer?: ReactNode;
  isLoading?: boolean;
  action?: ReactNode;
  className?: string;
  noPadding?: boolean;
  titleClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  onClick?: () => void;
}

const DashboardCard = forwardRef<HTMLDivElement, DashboardCardProps>(
  (
    {
      title,
      description,
      icon,
      children,
      footer,
      className,
      isLoading = false,
      action,
      noPadding = false,
      variant,
      size,
      hover,
      hasAction,
      titleClassName,
      contentClassName,
      headerClassName,
      footerClassName,
      onClick,
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        className={cn(
          dashboardCardVariants({
            variant,
            size,
            hover,
            hasAction: !!onClick || hasAction,
            className,
          })
        )}
        onClick={onClick}
        {...props}
      >
        {(title || description || icon) && (
          <CardHeader className={cn(!noPadding && "p-6", headerClassName)}>
            <div className="flex justify-between items-start">
              <div className="space-y-1.5 flex-1">
                {isLoading ? (
                  <>
                    <Skeleton className="h-6 w-1/2 mb-2" />
                    {description && <Skeleton className="h-4 w-full" />}
                  </>
                ) : (
                  <>
                    {title && (
                      <CardTitle className={cn("flex items-center gap-2", titleClassName)}>
                        {icon && <span className="text-primary/80">{icon}</span>}
                        {title}
                      </CardTitle>
                    )}
                    {description && <CardDescription>{description}</CardDescription>}
                  </>
                )}
              </div>
              {action && <div className="flex-shrink-0">{action}</div>}
            </div>
          </CardHeader>
        )}
        
        {children && (
          <CardContent
            className={cn(
              "flex-1",
              !noPadding && "px-6 pb-6",
              (title || description) && !noPadding && "pt-0",
              isLoading && "space-y-2",
              contentClassName
            )}
          >
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-3/4" />
              </>
            ) : (
              children
            )}
          </CardContent>
        )}
        
        {footer && (
          <CardFooter
            className={cn(
              "flex-wrap gap-2",
              !noPadding && "px-6 pb-6",
              (title || description || children) && !noPadding && "pt-0",
              footerClassName
            )}
          >
            {isLoading ? <Skeleton className="h-5 w-full" /> : footer}
          </CardFooter>
        )}
      </Card>
    );
  }
);

DashboardCard.displayName = "DashboardCard";

export { DashboardCard, dashboardCardVariants, type DashboardCardProps };
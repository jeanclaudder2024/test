import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, icon, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
      {icon && <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>}
      <div className="flex-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2 mt-2 md:mt-0">{children}</div>}
    </div>
  );
}
import { ReactNode } from "react";

interface PageTitleProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageTitle({ title, description, actions }: PageTitleProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex-shrink-0 ml-auto">{actions}</div>}
    </div>
  );
}
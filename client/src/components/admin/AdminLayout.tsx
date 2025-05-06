import { ReactNode } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  backLink?: string;
  backText?: string;
  actions?: ReactNode;
}

export default function AdminLayout({
  children,
  title,
  description,
  backLink = "/admin",
  backText = "Back to Dashboard",
  actions,
}: AdminLayoutProps) {
  const [location] = useLocation();

  const tabs = [
    { label: "Dashboard", href: "/admin" },
    { label: "Users", href: "/admin/users" },
    { label: "Subscriptions", href: "/admin/subscriptions" },
    { label: "Analytics", href: "/admin/analytics" },
    { label: "Payments", href: "/admin/payments" },
    { label: "Features", href: "/admin/features" },
    { label: "Schedule", href: "/admin/schedule" },
  ];

  return (
    <div className="container py-6 max-w-7xl">
      <div className="flex items-center mb-6">
        <div className="flex flex-1 flex-col">
          <div className="flex items-center mb-2">
            <Shield className="h-8 w-8 mr-3 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              {title}
            </h1>
          </div>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center space-x-4">
          {actions && actions}
        </div>
      </div>

      <div className="flex mt-4 border-b pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <Link 
            key={tab.href} 
            href={tab.href}
          >
            <span className={cn(
              "px-4 py-2 font-medium text-sm cursor-pointer transition-colors",
              location === tab.href 
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}>
              {tab.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        {children}
      </div>

      <div className="mt-8">
        <Link href={backLink}>
          <Button variant="ghost" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backText}
          </Button>
        </Link>
      </div>
    </div>
  );
}
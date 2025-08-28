import { cn } from "@/lib/utils";
import { ReactNode, HTMLAttributes } from "react";

interface AppCardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: ReactNode;
}

// Card padrão usando o sistema liquid glass correto
export function AppCard({ className, children, ...props }: AppCardProps) {
  return (
    <div
      className={cn(
        // Liquid glass system - design correto
        "glass-component shadow-lg p-4 flex flex-col justify-between transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer border-slate-800 bg-slate-900 hover:bg-slate-800/70",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

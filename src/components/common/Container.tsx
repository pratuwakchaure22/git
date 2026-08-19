import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  narrow?: boolean;
}

export function Container({ children, className, as: Tag = "div", narrow = false }: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full px-6 md:px-10 lg:px-14", narrow ? "max-w-3xl" : "max-w-7xl", className)}>
      {children}
    </Tag>
  );
}

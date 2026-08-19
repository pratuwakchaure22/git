import type { ReactNode } from "react";
import { Container } from "@/components/common/Container";
import { Eyebrow } from "@/components/common/Eyebrow";
import { SignalMark } from "@/components/common/SignalMark";

interface PageHeroProps {
  index: string;
  label: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHero({ index, label, title, description, children }: PageHeroProps) {
  return (
    <header className="relative overflow-hidden border-b border-line pt-32 pb-16 md:pt-40 md:pb-20">
      <Container>
        <Eyebrow index={index} label={label} />
        <h1 className="mt-5 max-w-3xl text-balance font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{description}</p>
        )}
        {children}
      </Container>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 text-line-strong">
        <SignalMark className="h-6 opacity-60" />
      </div>
    </header>
  );
}

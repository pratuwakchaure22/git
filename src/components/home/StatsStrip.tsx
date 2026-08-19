import { AnimatedStagger, StaggerItem } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { heroStats } from "@/data/profile";

export function StatsStrip() {
  return (
    <section className="border-y border-line bg-surface/50">
      <Container>
        <AnimatedStagger className="grid grid-cols-2 divide-x divide-line md:grid-cols-4">
          {heroStats.map((stat) => (
            <StaggerItem key={stat.label} className="flex flex-col gap-1 px-1 py-10 text-center md:py-12">
              <span className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                {stat.value}
                {stat.suffix && <span className="text-indigo">{stat.suffix}</span>}
              </span>
              <span className="font-mono text-xs uppercase tracking-wide text-muted">{stat.label}</span>
            </StaggerItem>
          ))}
        </AnimatedStagger>
      </Container>
    </section>
  );
}

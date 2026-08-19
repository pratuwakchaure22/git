import { ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/common/Button";
import { profile, focusAreas } from "@/data/profile";

export function AboutPreview() {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <AnimatedSection>
            <SectionHeading eyebrow="About" eyebrowIndex="01" title="Engineer first, researcher by habit." />
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted">{profile.longBio[0]}</p>
            <Button to="/about" variant="ghost" className="mt-6 px-0" icon={<ArrowRight className="h-4 w-4" strokeWidth={1.75} />}>
              More about me
            </Button>
          </AnimatedSection>

          <div className="grid gap-4 sm:grid-cols-2">
            {focusAreas.map((area, i) => (
              <AnimatedSection
                key={area.title}
                delay={i * 0.08}
                className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-indigo/60"
              >
                <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink">{area.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{area.description}</p>
              </AnimatedSection>
            ))}
            <AnimatedSection
              delay={0.24}
              className="flex flex-col justify-between rounded-2xl border border-dashed border-line-strong p-6"
            >
              <div>
                <span className="font-mono text-xs text-muted">04</span>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink">And more</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                See the full breakdown of tools and technologies on the Skills page.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </Container>
    </section>
  );
}

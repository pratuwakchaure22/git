import { ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/common/Button";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { featuredProjects } from "@/data/projects";

export function FeaturedProjects() {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Selected work"
          eyebrowIndex="02"
          title="A few things I've built recently."
          description="From open-source tooling to production infrastructure — a sample of projects that mix engineering and research."
          action={
            <Button to="/projects" variant="secondary" icon={<ArrowRight className="h-4 w-4" strokeWidth={1.75} />}>
              All projects
            </Button>
          }
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project, i) => (
            <AnimatedSection key={project.id} delay={i * 0.08}>
              <ProjectCard project={project} />
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
}

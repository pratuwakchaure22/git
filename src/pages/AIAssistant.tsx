import { MessageSquareText, FileSearch, Target } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";
import { Container } from "@/components/common/Container";
import { AnimatedSection, AnimatedStagger, StaggerItem } from "@/components/common/AnimatedSection";
import { ChatPreviewMock } from "@/components/ai/ChatPreviewMock";
import { NotifyForm } from "@/components/ai/NotifyForm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const capabilities = [
  {
    icon: MessageSquareText,
    title: "Ask it anything",
    description: "Question my projects, research, or experience directly instead of scanning every page.",
  },
  {
    icon: FileSearch,
    title: "Grounded in my real work",
    description: "Answers will be based on the actual content of this site — projects, papers, and skills.",
  },
  {
    icon: Target,
    title: "Tailored to what you need",
    description: "Hiring for a specific role? It'll help surface the most relevant projects and experience.",
  },
];

export default function AIAssistant() {
  useDocumentTitle("AI Assistant", "An upcoming AI assistant for exploring my projects, research, and experience.");

  return (
    <>
      <PageHero
        index="08"
        label="AI Assistant"
        title="Ask, don't scroll."
        description="An AI assistant that knows this whole site — projects, research, skills, and experience — so you can just ask. It's in development; here's a preview of what's coming."
      />

      <section className="py-16 md:py-20">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-10">
            <AnimatedSection>
              <ChatPreviewMock />
            </AnimatedSection>

            <AnimatedSection delay={0.1} className="flex flex-col gap-10">
              <AnimatedStagger className="flex flex-col gap-6">
                {capabilities.map((cap) => (
                  <StaggerItem key={cap.title} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line text-indigo">
                      <cap.icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-semibold text-ink">{cap.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{cap.description}</p>
                    </div>
                  </StaggerItem>
                ))}
              </AnimatedStagger>

              <div className="rounded-2xl border border-line bg-surface p-6">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Get notified at launch</p>
                <p className="mt-2 mb-5 text-sm leading-relaxed text-muted">
                  Leave your email and I'll let you know the moment it's live. No spam, just the one update.
                </p>
                <NotifyForm />
              </div>
            </AnimatedSection>
          </div>
        </Container>
      </section>
    </>
  );
}

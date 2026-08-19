import { Home, ArrowRight } from "lucide-react";
import { Container } from "@/components/common/Container";
import { Eyebrow } from "@/components/common/Eyebrow";
import { SignalMark } from "@/components/common/SignalMark";
import { Button } from "@/components/common/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Page not found", "The page you're looking for doesn't exist.");

  return (
    <section className="flex min-h-[80vh] items-center py-24">
      <Container className="flex flex-col items-center text-center">
        <Eyebrow label="404 — Signal lost" tone="amber" />
        <h1 className="mt-6 font-display text-7xl font-semibold tracking-tight text-ink sm:text-8xl">404</h1>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
          This route doesn't resolve to anything. It may have moved, or never existed in the first place.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button to="/" icon={<Home className="h-4 w-4" strokeWidth={1.75} />}>
            Back to home
          </Button>
          <Button to="/contact" variant="secondary" icon={<ArrowRight className="h-4 w-4" strokeWidth={1.75} />}>
            Contact me instead
          </Button>
        </div>
        <div className="mt-16 w-full max-w-xs text-line-strong">
          <SignalMark className="h-8" />
        </div>
      </Container>
    </section>
  );
}

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Container } from "@/components/common/Container";
import { Eyebrow } from "@/components/common/Eyebrow";
import { SignalMark } from "@/components/common/SignalMark";
import { Button } from "@/components/common/Button";
import { SocialIcons } from "@/components/common/SocialIcons";
import { profile, socialLinks } from "@/data/profile";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-8 md:pt-44 md:pb-12">
      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <Eyebrow label={profile.availability} tone="amber" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-6 text-balance font-display text-6xl font-semibold leading-[0.98] tracking-tight text-ink sm:text-7xl md:text-8xl"
        >
          {profile.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mt-5 font-mono text-sm uppercase tracking-[0.14em] text-indigo sm:text-base"
        >
          {profile.role}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.26 }}
          className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted md:text-xl"
        >
          {profile.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.34 }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <Button to="/projects" size="lg" icon={<ArrowRight className="h-4 w-4" strokeWidth={1.75} />}>
            View my work
          </Button>
          <Button to="/contact" variant="secondary" size="lg">
            Get in touch
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-10 flex items-center gap-6"
        >
          <SocialIcons links={socialLinks} />
        </motion.div>
      </Container>

      <div className="mt-16 md:mt-24">
        <Container>
          <div className="text-line-strong">
            <SignalMark animate className="h-10 md:h-14" />
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-muted">
            <span>Signal — live</span>
            <span className="hidden items-center gap-1 sm:flex">
              Scroll
              <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
            </span>
          </div>
        </Container>
      </div>
    </section>
  );
}

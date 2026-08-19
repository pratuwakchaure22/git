import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { skillGroups } from "@/data/skills";

const allSkills = skillGroups.flatMap((group) => group.skills.map((skill) => skill.name));
const rowA = allSkills.slice(0, Math.ceil(allSkills.length / 2));
const rowB = allSkills.slice(Math.ceil(allSkills.length / 2));

function MarqueeRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="flex overflow-hidden">
      <div
        className="flex shrink-0 items-center gap-3 pr-3"
        style={{
          animation: `marquee ${reverse ? "36s" : "30s"} linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {doubled.map((skill, i) => (
          <span
            key={`${skill}-${i}`}
            className="whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2 font-mono text-sm text-muted"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SkillsMarquee() {
  return (
    <section className="border-y border-line py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Toolbox"
          eyebrowIndex="03"
          title="Technologies I work with."
          align="center"
          className="items-center text-center"
        />
      </Container>

      <div className="mt-12 flex flex-col gap-4 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <MarqueeRow items={rowA} />
        <MarqueeRow items={rowB} reverse />
      </div>
    </section>
  );
}

import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { useResumeData } from "@/hooks/useResumeData";
import { Badge } from "@/components/common/Badge";

export function ResumeDocument() {
  const { data, isLoading } = useResumeData();

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-8 sm:p-12 md:p-16">
        <p className="text-sm text-muted">Loading resume from Supabase…</p>
      </div>
    );
  }

  const { profile, experience, education, skills } = data;

  // Group skills by category for display
  const skillsByCategory = skills.reduce<Record<string, string[]>>((acc, s) => {
    const cat = s.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s.name);
    return acc;
  }, {});

  return (
    <div className="rounded-3xl border border-line bg-surface p-8 sm:p-12 md:p-16">
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {profile.full_name || "Your Name"}
          </h1>
          <p className="mt-2 font-mono text-sm uppercase tracking-wide text-indigo">
            {profile.role || "Your Role"}
          </p>
        </div>
        <div className="flex flex-col gap-1.5 font-mono text-xs text-muted sm:items-end">
          {profile.email && (
            <span className="flex items-center gap-2 sm:flex-row-reverse">
              <Mail className="h-3.5 w-3.5" strokeWidth={1.75} /> {profile.email}
            </span>
          )}
          {profile.phone && (
            <span className="flex items-center gap-2 sm:flex-row-reverse">
              <Phone className="h-3.5 w-3.5" strokeWidth={1.75} /> {profile.phone}
            </span>
          )}
          {profile.location && (
            <span className="flex items-center gap-2 sm:flex-row-reverse">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} /> {profile.location}
            </span>
          )}
          {profile.website_url && (
            <span className="flex items-center gap-2 sm:flex-row-reverse">
              <Globe className="h-3.5 w-3.5" strokeWidth={1.75} /> {profile.website_url}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {profile.bio && (
        <section className="border-b border-line py-8">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted">Summary</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink">{profile.bio}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="border-b border-line py-8">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted">Experience</h2>
          <div className="mt-5 flex flex-col gap-8">
            {experience.map((job) => (
              <div key={job.id} className="grid gap-2 sm:grid-cols-[1fr_auto] sm:gap-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">{job.position}</h3>
                  <p className="mt-0.5 text-sm text-muted">{job.company}</p>
                  {job.description && (
                    <p className="mt-3 text-sm leading-relaxed text-ink">{job.description}</p>
                  )}
                </div>
                <span className="font-mono text-xs text-muted sm:text-right">
                  {job.start_date} — {job.end_date}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="border-b border-line py-8">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted">Education</h2>
          <div className="mt-5 flex flex-col gap-6">
            {education.map((item) => (
              <div key={item.id} className="grid gap-1 sm:grid-cols-[1fr_auto] sm:gap-4">
                <div>
                  <h3 className="font-display text-base font-semibold text-ink">
                    {item.degree}
                    {item.field_of_study ? ` — ${item.field_of_study}` : ""}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted">{item.institution}</p>
                  {item.description && (
                    <p className="mt-1 text-sm text-muted">{item.description}</p>
                  )}
                </div>
                <span className="font-mono text-xs text-muted sm:text-right">
                  {item.start_date} — {item.end_date}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="pt-8">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted">Skills</h2>
          <div className="mt-5 flex flex-col gap-4">
            {Object.entries(skillsByCategory).map(([category, names]) => (
              <div key={category} className="grid gap-2 sm:grid-cols-[160px_1fr]">
                <span className="text-sm font-medium text-ink">{category}</span>
                <div className="flex flex-wrap gap-1.5">
                  {names.map((name) => (
                    <Badge key={name}>{name}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

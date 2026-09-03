import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageFrame, PageHeader } from "@/components/dashboard/page-frame";
import { Reveal } from "@/components/motion/reveal";
import { requireUser } from "@/lib/services/session";
import { listHistory, HISTORY_LABELS } from "@/lib/services/history";
import { formatRelative, formatShortDate } from "@/lib/utils/date";

export const metadata: Metadata = { title: "Historique" };

export default async function HistoryPage() {
  const user = await requireUser();
  const entries = await listHistory(user.id);

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Journal"
        title={<>Votre <span className="italic">historique</span></>}
        description="Chaque geste important sur vos invitations est consigné ici, du premier brouillon à la dernière publication."
      />

      {entries.length === 0 ? (
        <EmptyState
          eyebrow="Rien à raconter"
          title="Votre journal est encore vierge."
          description="Dès que vous créerez, modifierez ou publierez une invitation, tout apparaîtra ici."
          action={<ButtonLink href="/dashboard/invitations/new">Créer une invitation</ButtonLink>}
        />
      ) : (
        <ol className="relative">
          {/* Le fil du temps : un filet vertical, rien de plus. */}
          <span aria-hidden className="absolute left-[5.5rem] top-2 hidden h-[calc(100%-1rem)] w-px bg-line sm:block" />

          {entries.map((entry, index) => {
            const label = HISTORY_LABELS[entry.action] ?? {
              title: "Action enregistrée",
              note: "",
            };
            return (
              <Reveal key={entry.id} delay={Math.min(index * 0.04, 0.4)}>
                <li className="relative grid gap-2 border-b border-line py-7 sm:grid-cols-[5.5rem_1fr] sm:gap-8">
                  <time
                    dateTime={entry.created_at}
                    className="eyebrow-sm text-ink-faint sm:pt-1"
                    title={formatRelative(entry.created_at)}
                  >
                    {formatShortDate(entry.created_at)}
                  </time>

                  <div className="sm:pl-8">
                    <span
                      aria-hidden
                      className="absolute left-[5.35rem] top-[2.05rem] hidden size-[5px] rounded-full bg-gold sm:block"
                    />
                    <p className="font-display text-[1.25rem] leading-none">{label.title}</p>
                    <p className="mt-2 text-sm font-light leading-relaxed text-ink-soft">
                      {label.note}
                      {entry.invitationTitle && (
                        <>
                          {" "}
                          {entry.invitation_id ? (
                            <Link
                              href={`/dashboard/invitations/${entry.invitation_id}`}
                              className="link-draw inline-flex min-h-11 items-center text-ink"
                            >
                              {entry.invitationTitle}
                            </Link>
                          ) : (
                            <span className="text-ink">{entry.invitationTitle}</span>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ol>
      )}
    </PageFrame>
  );
}

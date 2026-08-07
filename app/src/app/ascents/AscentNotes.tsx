import { useTranslations } from "use-intl";
import type { AscentResponse } from "@/types/api";

const NoteSection = ({ heading, body }: { heading: string; body: string }) => (
  <section className="flex flex-col gap-2">
    <h2 className="text-lg leading-relaxed font-semibold text-start">
      {heading}
    </h2>
    <p
      dir="auto"
      className="max-w-prose leading-relaxed whitespace-pre-wrap text-start"
    >
      {body}
    </p>
  </section>
);

export const AscentNotes = ({ ascent }: { ascent: AscentResponse }) => {
  const t = useTranslations("ascents.notes");

  return (
    <div className="flex flex-col gap-6">
      {ascent.routeNotes ? (
        <NoteSection heading={t("routeHeading")} body={ascent.routeNotes} />
      ) : null}
      {ascent.companions ? (
        <NoteSection
          heading={t("companionsHeading")}
          body={ascent.companions}
        />
      ) : null}
    </div>
  );
};

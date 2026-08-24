import { useTranslations } from "use-intl";
import { lastUpdated, legalEntity } from "@/lib/legal/entity";
import { mapProviderName } from "@/lib/map";

export type LegalDocumentId = "notice" | "privacy" | "cookies" | "terms";

interface LegalSection {
  heading: string;
  body: string[];
}

const fillPlaceholders = (paragraph: string): string =>
  paragraph
    .replaceAll("{holder}", legalEntity.holder)
    .replaceAll("{taxId}", legalEntity.taxId)
    .replaceAll("{address}", legalEntity.address)
    .replaceAll("{email}", legalEntity.email)
    .replaceAll("{mapProvider}", mapProviderName());

export const LegalDocument = ({ id }: { id: LegalDocumentId }) => {
  const t = useTranslations(`legal.${id}`);
  const common = useTranslations("legal.common");
  const sections = t.raw("sections") as LegalSection[];

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl leading-relaxed font-semibold text-start">
          {t("title")}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground text-start">
          {common("updated", { date: lastUpdated })}
        </p>
      </header>

      {sections.map((section) => (
        <section key={section.heading} className="flex flex-col gap-3">
          <h2 className="text-xl leading-relaxed font-semibold text-start">
            {section.heading}
          </h2>
          {section.body.map((paragraph) => (
            <p
              key={paragraph}
              className="max-w-prose leading-relaxed text-muted-foreground text-start"
            >
              {fillPlaceholders(paragraph)}
            </p>
          ))}
        </section>
      ))}

      <p className="max-w-prose border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground text-start">
        {common("authoritative")}
      </p>
    </article>
  );
};

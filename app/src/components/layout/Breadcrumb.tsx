import { ChevronRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment } from "react";
import { Link } from "@/i18n/navigation";

export interface BreadcrumbStep {
  label: string;
  href?: string;
}

export const Breadcrumb = ({ steps }: { steps: readonly BreadcrumbStep[] }) => {
  const t = useTranslations("common.breadcrumb");

  return (
    <nav aria-label={t("label")}>
      <ol className="flex flex-wrap items-center gap-1 text-sm leading-relaxed text-muted-foreground">
        <li>
          <Link href="/" className="hover:underline">
            {t("home")}
          </Link>
        </li>
        {steps.map((step, index) => (
          <Fragment key={step.label}>
            <li aria-hidden>
              <ChevronRightIcon className="size-3.5 rtl:-scale-x-100" />
            </li>
            <li className="min-w-0">
              {step.href ? (
                <Link href={step.href} className="hover:underline">
                  {step.label}
                </Link>
              ) : (
                <span
                  aria-current={index === steps.length - 1 ? "page" : undefined}
                  className="wrap-break-word text-foreground"
                >
                  {step.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
};

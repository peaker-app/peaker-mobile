import { useTranslations } from "use-intl";
import { EmptyState } from "@/components/feedback/EmptyState";

export interface PlaceholderScreenProps {
  titleKey: string;
}

export const PlaceholderScreen = ({ titleKey }: PlaceholderScreenProps) => {
  const nav = useTranslations("nav");
  const states = useTranslations("common.states");

  return (
    <main className="flex-1 p-6">
      <h1 className="mb-4 text-xl font-semibold">{nav(titleKey)}</h1>
      <EmptyState
        title={states("emptyTitle")}
        description={states("emptyDescription")}
      />
    </main>
  );
};

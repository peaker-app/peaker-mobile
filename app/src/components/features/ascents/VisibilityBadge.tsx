import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import type { Visibility } from "@/types/api";

export const VisibilityBadge = ({ value }: { value: Visibility }) => {
  const t = useTranslations("visibility");

  return (
    <Badge variant={value === "Public" ? "primary" : "neutral"}>
      {t(value)}
    </Badge>
  );
};

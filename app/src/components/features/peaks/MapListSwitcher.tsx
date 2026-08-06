import { useTranslations } from "use-intl";
import { Button } from "@/components/ui/Button";

export type Pane = "list" | "map";

export interface MapListSwitcherProps {
  pane: Pane;
  onChange: (pane: Pane) => void;
}

export const MapListSwitcher = ({ pane, onChange }: MapListSwitcherProps) => {
  const t = useTranslations("peaks.nearby");

  return (
    <div role="group" className="flex gap-2">
      <Button
        size="sm"
        variant={pane === "list" ? "primary" : "outline"}
        aria-pressed={pane === "list"}
        onClick={() => onChange("list")}
      >
        {t("showList")}
      </Button>
      <Button
        size="sm"
        variant={pane === "map" ? "primary" : "outline"}
        aria-pressed={pane === "map"}
        onClick={() => onChange("map")}
      >
        {t("showMap")}
      </Button>
    </div>
  );
};

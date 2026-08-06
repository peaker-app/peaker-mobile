import { useState } from "react";
import { useTranslations } from "use-intl";
import { VisibilitySelect } from "@/components/forms/VisibilitySelect";
import { Button } from "@/components/ui/Button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import type { Visibility } from "@/types/api";

export const DevPortals = () => {
  const [visibility, setVisibility] = useState<Visibility>("Public");
  const t = useTranslations("visibility");
  const nav = useTranslations("nav");
  const states = useTranslations("common.states");

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">radix portals</h2>
      <VisibilitySelect
        id="dev-visibility"
        label={t("label")}
        help={visibility === "Public" ? t("publicHint") : t("privateHint")}
        value={visibility}
        onChange={setVisibility}
      />
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">{nav("openMenu")}</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle className="text-base font-semibold">
            {nav("label")}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {states("emptyDescription")}
          </SheetDescription>
          <SheetClose asChild>
            <Button variant="secondary">{nav("closeMenu")}</Button>
          </SheetClose>
        </SheetContent>
      </Sheet>
    </section>
  );
};

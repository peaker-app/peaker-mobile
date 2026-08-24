import { GlobeIcon } from "lucide-react";
import { useTranslations } from "use-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { locales, type Locale } from "@/i18n/config";
import { useLocaleSetting } from "@/i18n/LocaleProvider";

export const LocaleSwitcher = () => {
  const t = useTranslations("common.locale");
  const { locale, setLocale } = useLocaleSetting();

  return (
    <Select
      value={locale}
      onValueChange={(value) => setLocale(value as Locale)}
    >
      <SelectTrigger className="w-auto min-w-36 gap-2" aria-label={t("label")}>
        <GlobeIcon aria-hidden className="size-4 shrink-0 opacity-70" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((item) => (
          <SelectItem key={item} value={item} lang={item}>
            {t(item)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

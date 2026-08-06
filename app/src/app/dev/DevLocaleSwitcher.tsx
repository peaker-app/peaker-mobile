import { Button } from "@/components/ui/Button";
import { locales } from "@/i18n/config";
import { useLocaleSetting } from "@/i18n/LocaleProvider";

export const DevLocaleSwitcher = () => {
  const { locale, setLocale } = useLocaleSetting();

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold">locale · {locale}</h2>
      <div className="flex flex-wrap gap-2">
        {locales.map((option) => (
          <Button
            key={option}
            size="sm"
            variant={option === locale ? "primary" : "outline"}
            onClick={() => setLocale(option)}
          >
            {option}
          </Button>
        ))}
      </div>
    </section>
  );
};

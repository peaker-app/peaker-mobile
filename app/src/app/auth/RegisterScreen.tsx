import { useTranslations } from "use-intl";
import { RegisterForm } from "@/components/features/auth/RegisterForm";

export const RegisterScreen = () => {
  const t = useTranslations("auth.register");

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl leading-relaxed font-semibold text-start">
          {t("title")}
        </h1>
        <p className="leading-relaxed text-muted-foreground text-start">
          {t("subtitle")}
        </p>
      </header>
      <RegisterForm />
    </section>
  );
};

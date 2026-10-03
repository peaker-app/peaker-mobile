"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useFieldMessage } from "@/hooks/useFieldMessage";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { hasCode } from "@/lib/api/problem";
import {
  isValidEmail,
  isValidUsername,
  normalizeEmail,
  passwordMinLength,
} from "@/lib/auth/validation";
import { FormField } from "@/components/forms/FormField";
import { PasswordField } from "./PasswordField";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

const rateLimitStatus = 429;

const schema = z.object({
  email: z
    .string()
    .min(1, { error: "field.required" })
    .refine(isValidEmail, { error: "User.EmailInvalid" }),
  username: z
    .string()
    .min(1, { error: "field.required" })
    .refine(isValidUsername, { error: "User.UsernameInvalid" }),
  password: z
    .string()
    .min(1, { error: "field.required" })
    .min(passwordMinLength, { error: "field.passwordTooShort" }),
  acceptedTerms: z.literal(true, { error: "User.TermsNotAccepted" }),
});

type RegisterValues = z.infer<typeof schema>;

export const RegisterForm = () => {
  const t = useTranslations("auth.register");
  const fields = useTranslations("auth.fields");
  const errors = useTranslations("errors");
  const toMessage = useProblemMessage();
  const fieldError = useFieldMessage();
  const router = useRouter();
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [emailTaken, setEmailTaken] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      username: "",
      password: "",
      acceptedTerms: false as true,
    },
  });

  const applyProblem = (error: unknown) => {
    if (!(error instanceof ApiError)) {
      setFormError(errors("unknown"));
      return;
    }

    const { problem } = error;

    if (problem.status === rateLimitStatus) {
      setFormError(t("rateLimited"));
      return;
    }

    const fieldOf: [string, keyof RegisterValues][] = [
      ["User.EmailAlreadyRegistered", "email"],
      ["User.EmailEmpty", "email"],
      ["User.EmailInvalid", "email"],
      ["User.EmailTooLong", "email"],
      ["User.UsernameAlreadyRegistered", "username"],
      ["User.UsernameEmpty", "username"],
      ["User.UsernameInvalid", "username"],
      ["User.PasswordBreached", "password"],
    ];
    const match = fieldOf.find(([code]) => hasCode(problem, code));

    setEmailTaken(hasCode(problem, "User.EmailAlreadyRegistered"));

    if (match) {
      form.setError(match[1], { message: toMessage(error) });
      form.setFocus(match[1]);
      return;
    }

    setFormError(toMessage(error));
  };

  const submit = form.handleSubmit(async (values) => {
    setFormError(undefined);
    setEmailTaken(false);

    try {
      await apiFetch(endpoints.auth.register, {
        method: "POST",
        body: JSON.stringify({
          email: normalizeEmail(values.email),
          username: values.username.trim(),
          password: values.password,
          acceptedTerms: values.acceptedTerms,
        }),
      });

      router.replace("/login?registered=1");
    } catch (error) {
      applyProblem(error);
    }
  });

  const password = useWatch({ control: form.control, name: "password" });
  const termsError = fieldError(form.formState.errors.acceptedTerms?.message);

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {formError ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <FormField
        id="email"
        label={fields("email")}
        help={fields("emailHelp")}
        error={fieldError(form.formState.errors.email?.message)}
      >
        {({ describedBy, invalid }) => (
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            dir="ltr"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            {...form.register("email")}
          />
        )}
      </FormField>

      {emailTaken ? (
        <p className="text-sm leading-relaxed text-start">
          <Link href="/login" className="font-medium underline">
            {t("emailTakenAction")}
          </Link>
        </p>
      ) : null}

      <FormField
        id="username"
        label={fields("username")}
        help={`${fields("usernameHelp")} ${fields("usernameCase")}`}
        error={fieldError(form.formState.errors.username?.message)}
      >
        {({ describedBy, invalid }) => (
          <Input
            id="username"
            autoComplete="username"
            dir="ltr"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            {...form.register("username")}
          />
        )}
      </FormField>

      <FormField
        id="password"
        label={fields("password")}
        help={fields("passwordHelp", { min: passwordMinLength })}
        error={fieldError(form.formState.errors.password?.message)}
      >
        {({ describedBy, invalid }) => (
          <PasswordField
            id="password"
            autoComplete="new-password"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            {...form.register("password")}
          />
        )}
      </FormField>

      <PasswordStrengthMeter value={password} />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-3">
          <input
            id="acceptedTerms"
            type="checkbox"
            className="mt-1 size-4"
            aria-invalid={termsError ? true : undefined}
            aria-describedby={termsError ? "acceptedTerms-error" : undefined}
            {...form.register("acceptedTerms")}
          />
          <label
            htmlFor="acceptedTerms"
            className="text-sm leading-relaxed text-start"
          >
            {t.rich("acceptTerms", {
              terms: (chunks) => (
                <Link href="/legal/terms" className="font-medium underline">
                  {chunks}
                </Link>
              ),
              privacy: (chunks) => (
                <Link href="/legal/privacy" className="font-medium underline">
                  {chunks}
                </Link>
              ),
            })}
          </label>
        </div>
        {termsError ? (
          <p
            id="acceptedTerms-error"
            className="text-sm leading-relaxed text-destructive text-start"
          >
            {termsError}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting} aria-busy={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? t("submitting") : t("submit")}
      </Button>

      <p className="text-sm leading-relaxed text-muted-foreground text-start">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-medium text-foreground underline">
          {t("signIn")}
        </Link>
      </p>
    </form>
  );
};

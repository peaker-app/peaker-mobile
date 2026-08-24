import { useState } from "react";
import { useSearchParams } from "react-router";
import { ConfirmEmailView } from "@/components/features/auth/ConfirmEmailView";
import { ConfirmTokenForm } from "@/components/features/auth/ConfirmTokenForm";

export const ConfirmEmailScreen = () => {
  const [params] = useSearchParams();
  const [pasted, setPasted] = useState<string | undefined>(undefined);
  const token = params.get("token")?.trim() || pasted;

  return (
    <div className="flex flex-col gap-8">
      <ConfirmEmailView key={token} token={token} />
      {token ? null : <ConfirmTokenForm onToken={setPasted} />}
    </div>
  );
};

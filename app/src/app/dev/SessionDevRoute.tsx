import { useState, type FormEvent } from "react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { signIn, signOut, useSessionState } from "@/lib/auth/session";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { DevLocaleSwitcher } from "./DevLocaleSwitcher";
import { DevPortals } from "./DevPortals";

const describe = (error: unknown): string =>
  error instanceof ApiError
    ? `${error.problem.status} ${error.problem.title ?? ""}`
    : String(error);

export const SessionDevRoute = () => {
  const { status, session } = useSessionState();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [outcome, setOutcome] = useState("");

  const run = async (action: () => Promise<unknown>) => {
    try {
      setOutcome(JSON.stringify(await action()) ?? "ok");
    } catch (error) {
      setOutcome(describe(error));
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      await signIn({ identifier, password });

      return "signed in";
    });
  };

  return (
    <main className="flex flex-col gap-4 p-6">
      <h1 className="text-lg font-semibold">Session diagnostics</h1>
      <p data-testid="status" className="text-sm">
        {status} · {session?.email ?? "no session"}
      </p>
      <form className="flex flex-col gap-3" onSubmit={submit}>
        <Label htmlFor="identifier">identifier</Label>
        <Input
          id="identifier"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
        />
        <Label htmlFor="password">password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button type="submit">sign in</Button>
      </form>
      <Button
        variant="secondary"
        onClick={() => void run(() => apiFetch(endpoints.profiles.me))}
      >
        call profiles/me
      </Button>
      <Button variant="secondary" onClick={() => void run(signOut)}>
        sign out
      </Button>
      <pre className="overflow-x-auto rounded-md border bg-card p-3 text-xs">
        {outcome}
      </pre>
      <DevLocaleSwitcher />
      <DevPortals />
    </main>
  );
};

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  signOut as revokeSession,
  signOutEverywhere as revokeEverySession,
} from "@/lib/auth/session";

export const useSignOut = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  const revoke = async (revocation: () => Promise<void>) => {
    setPending(true);
    router.replace("/");
    await revocation();
    queryClient.clear();
  };

  return {
    pending,
    signOut: () => revoke(revokeSession),
    signOutEverywhere: () => revoke(revokeEverySession),
  };
};

"use client";

import { LocateFixedIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { isLatitude, isLongitude } from "@/lib/map";
import { locator } from "@/lib/native/geolocation";

export interface Origin {
  latitude: number;
  longitude: number;
}

export interface LocationPickerProps {
  origin?: Origin;
  onChange: (origin: Origin) => void;
}

type LocateStatus =
  | "idle"
  | "locating"
  | "denied"
  | "servicesDisabled"
  | "unsupported"
  | "located";

const messageKeys = {
  locating: "locating",
  denied: "permissionDenied",
  servicesDisabled: "servicesDisabled",
  unsupported: "unsupported",
  located: "located",
} as const;

export const LocationPicker = ({ origin, onChange }: LocationPickerProps) => {
  const t = useTranslations("peaks.nearby");
  const [status, setStatus] = useState<LocateStatus>("idle");
  const [latitude, setLatitude] = useState(origin?.latitude.toString() ?? "");
  const [longitude, setLongitude] = useState(origin?.longitude.toString() ?? "");

  const locate = async () => {
    setStatus("locating");
    const outcome = await locator.locate();

    if (outcome.status !== "located") {
      setStatus(outcome.status);

      return;
    }

    setStatus("located");
    setLatitude(outcome.latitude.toString());
    setLongitude(outcome.longitude.toString());
    onChange({ latitude: outcome.latitude, longitude: outcome.longitude });
  };

  const manualLatitude = Number(latitude);
  const manualLongitude = Number(longitude);
  const latitudeInvalid = latitude !== "" && !isLatitude(manualLatitude);
  const longitudeInvalid = longitude !== "" && !isLongitude(manualLongitude);
  const canSubmit =
    latitude !== "" && longitude !== "" && !latitudeInvalid && !longitudeInvalid;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (canSubmit) {
      onChange({ latitude: manualLatitude, longitude: manualLongitude });
    }
  };

  const statusMessage = status === "idle" ? "" : t(messageKeys[status]);

  return (
    <div className="flex flex-col gap-3">
      <Button
        onClick={() => void locate()}
        disabled={status === "locating"}
        className="gap-2"
      >
        <LocateFixedIcon aria-hidden className="size-4" />
        {t("useMyLocation")}
      </Button>

      <p aria-live="polite" className="text-sm leading-relaxed text-muted-foreground">
        {statusMessage}
      </p>

      <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-32 flex-1 flex-col gap-1">
          <Label htmlFor="latitude">{t("latitude")}</Label>
          <Input
            id="latitude"
            inputMode="decimal"
            dir="ltr"
            value={latitude}
            aria-invalid={latitudeInvalid}
            aria-describedby={latitudeInvalid ? "latitude-error" : undefined}
            onChange={(event) => setLatitude(event.target.value)}
          />
          {latitudeInvalid ? (
            <p id="latitude-error" className="text-sm text-destructive">
              {t("latitude")}
            </p>
          ) : null}
        </div>
        <div className="flex min-w-32 flex-1 flex-col gap-1">
          <Label htmlFor="longitude">{t("longitude")}</Label>
          <Input
            id="longitude"
            inputMode="decimal"
            dir="ltr"
            value={longitude}
            aria-invalid={longitudeInvalid}
            aria-describedby={longitudeInvalid ? "longitude-error" : undefined}
            onChange={(event) => setLongitude(event.target.value)}
          />
          {longitudeInvalid ? (
            <p id="longitude-error" className="text-sm text-destructive">
              {t("longitude")}
            </p>
          ) : null}
        </div>
        <Button type="submit" variant="outline" disabled={!canSubmit}>
          {t("apply")}
        </Button>
      </form>
    </div>
  );
};

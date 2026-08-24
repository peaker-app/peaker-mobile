import Image from "next/image";
import { initialsOf } from "@/lib/profile/avatar";

const avatarSize = 96;

export interface AvatarPreviewProps {
  avatarUrl: string | null;
  displayName: string;
  alt: string;
}

export const AvatarPreview = ({
  avatarUrl,
  displayName,
  alt,
}: AvatarPreviewProps) =>
  avatarUrl ? (
    <Image
      src={avatarUrl}
      alt={alt}
      width={avatarSize}
      height={avatarSize}
      className="size-24 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span
      aria-hidden
      className="flex size-24 shrink-0 items-center justify-center rounded-full bg-muted text-2xl font-semibold"
    >
      {initialsOf(displayName)}
    </span>
  );

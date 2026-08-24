import { useMemo, type ComponentProps } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router";
import { queryClient } from "@/lib/queryClient";

type LinkProps = Omit<ComponentProps<typeof RouterLink>, "to"> & { href: string };

export const Link = ({ href, ...props }: LinkProps) => (
  <RouterLink to={href} {...props} />
);

export const usePathname = (): string => useLocation().pathname;

export interface Router {
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
  refresh: () => void;
}

export const useRouter = (): Router => {
  const navigate = useNavigate();

  return useMemo(
    () => ({
      push: (href: string) => void navigate(href),
      replace: (href: string) => void navigate(href, { replace: true }),
      back: () => void navigate(-1),
      refresh: () => void queryClient.invalidateQueries(),
    }),
    [navigate],
  );
};

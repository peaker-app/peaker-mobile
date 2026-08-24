import { lazy, Suspense, type ComponentType, type ReactNode } from "react";

interface DynamicOptions {
  loading?: () => ReactNode;
  ssr?: boolean;
}

const dynamic = <P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  { loading }: DynamicOptions = {},
): ComponentType<P> => {
  const Loaded = lazy(loader);

  const Dynamic = (props: P) => (
    <Suspense fallback={loading ? loading() : null}>
      <Loaded {...props} />
    </Suspense>
  );

  return Dynamic;
};

export default dynamic;

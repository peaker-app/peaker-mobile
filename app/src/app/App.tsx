import { BrowserRouter } from "react-router";
import { ErrorBoundary } from "./ErrorBoundary";
import { Providers } from "./Providers";
import { SessionGate } from "./SessionGate";
import { AppRoutes } from "./routes";

export const App = () => (
  <Providers>
    <SessionGate>
      <BrowserRouter>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </BrowserRouter>
    </SessionGate>
  </Providers>
);

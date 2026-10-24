import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  render,
  type RenderOptions,
  type RenderResult,
} from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { Provider } from "react-redux";

import { ThemeProvider } from "../components/ThemeProvider/ThemeProvider";
import {
  createAppStore,
  type AppDispatch,
  type RootState,
} from "../store/store";

type AppStore = ReturnType<typeof createAppStore>;

type RenderWithProvidersOptions = Omit<RenderOptions, "wrapper"> & {
  preloadedState?: RootState;
  queryClient?: QueryClient;
  store?: AppStore;
};

type RenderWithProvidersResult = RenderResult & {
  queryClient: QueryClient;
  store: AppStore;
  dispatch: AppDispatch;
};

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

export const renderWithProviders = (
  ui: ReactElement,
  {
    preloadedState,
    queryClient = createTestQueryClient(),
    store = createAppStore(preloadedState),
    ...renderOptions
  }: RenderWithProvidersOptions = {},
): RenderWithProvidersResult => {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <ThemeProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Provider>
    </ThemeProvider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
    store,
    dispatch: store.dispatch,
  };
};

"use client";

import {
  QueryClient,
  QueryClientProvider as RQProvider,
} from "@tanstack/react-query";
import { queryClient } from "./query-client";

export function QueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RQProvider client={queryClient}>{children}</RQProvider>;
}

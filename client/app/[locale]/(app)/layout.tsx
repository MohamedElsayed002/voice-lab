import type { ReactNode } from "react";

import { AppFooter } from "@/components/shared/footer";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <AppFooter />
    </>
  );
}

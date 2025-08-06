'use client';

import { MiniAppProvider } from '@neynar/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MiniAppProvider analyticsEnabled={true}>
      {children}
    </MiniAppProvider>
  );
}

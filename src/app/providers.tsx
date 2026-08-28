import type { ReactNode } from 'react';

interface ProvidersProps {
  readonly children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
    </>
  );
}
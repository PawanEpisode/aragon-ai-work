import { Toaster as HotToaster } from 'react-hot-toast';

/**
 * App-wide toast viewport. Styling is aligned with the design system so
 * `react-hot-toast` notifications match the rest of the UI.
 */
export function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        className:
          'rounded-xl border border-border bg-card text-sm text-card-foreground shadow-lg',
        success: { iconTheme: { primary: 'var(--success)', secondary: '#fff' } },
        error: { iconTheme: { primary: 'var(--destructive)', secondary: '#fff' } },
      }}
    />
  );
}

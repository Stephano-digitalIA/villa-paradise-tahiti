/**
 * Admin route group layout — wraps all /admin/* routes.
 *
 * The root layout (app/layout.tsx) applies to every route; Header/Footer are
 * hidden for /admin via ChromeGate. This layout simply passes children through
 * so the admin dashboard can render its own full-screen UI.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simple - just return children, no auth checks, no redirects
  // Middleware handles auth protection, this is just a simple layout
  return <>{children}</>;
}

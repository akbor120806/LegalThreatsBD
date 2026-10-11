// NOTE: this is a nested layout (inside app/layout.js, the real root layout),
// so it must NOT render its own <html>/<body> tags — Next.js already has
// those from the true root layout. Rendering a second <html>/<body> here
// caused invalid/duplicated markup, which is what was breaking the CSS and
// interactivity on every /admin page.
export const metadata = {
  title: "Admin Panel – LEGAL THREAT's BD",
  description: "LEGAL THREAT's BD administration panel.",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return <>{children}</>;
}
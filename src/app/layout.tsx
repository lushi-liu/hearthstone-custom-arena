import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="flex gap-4 p-4 bg-gray-800 text-white">
          <Link href="/create-card">Create Card</Link>
          <Link href="/import-cards">Import Cards</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}

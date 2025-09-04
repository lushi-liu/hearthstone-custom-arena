import { ReactNode } from "react";
import Navbar from "@/components/Navbar"; // Adjust path as needed

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}

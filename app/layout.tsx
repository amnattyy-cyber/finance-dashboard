import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard Finance | True Shop",
  description:
    "ภาพรวมผลงาน SG Finance และ Samsung Finance รายวันสำหรับพื้นที่ BMA",
  icons: {
    icon: "/finance-dashboard/favicon.svg",
    shortcut: "/finance-dashboard/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}

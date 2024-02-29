import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const siteName = "M&A・事業承継仲介サービス「シェアモルM&A」";
const description = "シェアモルM&Aは、AIを利用した売り手ファーストのM&A・事業承継の仲介サービスです。";
const url = "https://ma.shpn.me/";

export const metadata: Metadata = {
  title: siteName,
  description,
  openGraph: {
    title: siteName,
    description,
    url,
    siteName,
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description,
    creator: "@cosuke2000",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {children}
        {/* HubSpot */}
        <script src="https://js.hsforms.net/forms/embed/v2.js" />
      </body>
    </html>
  );
}

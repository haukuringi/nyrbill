import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CompareBar } from "@/components/compare-bar";
import { saekjaBila } from "@/lib/gogn";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nýrbíll.is – nýir bílar á Íslandi, verðlisti og samanburður",
  description: "Verðlisti og samanburður á nýjum bílum í boði hjá íslenskum bílaumboðum.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const bilar = saekjaBila();
  const labels: Record<string, string> = {};
  for (const gerd of bilar) {
    for (const utf of gerd.utfaerslur) {
      labels[utf.id] = `${gerd.merki} ${gerd.gerd} – ${utf.heiti}`;
    }
  }

  return (
    <html lang="is" className={`${inter.variable} antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        {children}
        <CompareBar labels={labels} />
      </body>
    </html>
  );
}

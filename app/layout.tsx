import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { LegalSafetyBanner } from "@/components/LegalSafetyBanner";

export const metadata: Metadata = {
  title: "CareBridge72",
  description: "퇴원 후 72시간 통합돌봄 사례 검토 시스템"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <LegalSafetyBanner placement="top" />
        {children}
        <LegalSafetyBanner placement="bottom" />
      </body>
    </html>
  );
}

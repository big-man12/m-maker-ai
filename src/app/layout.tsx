import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Money Maker AI - 프리미엄 제품 리뷰 & 추천",
  description: "AI가 분석한 가장 신뢰도 높은 프리미엄 제품 리뷰 솔루션. 매일 업데이트되는 최신 IT/가전 트렌드를 확인하세요.",
  keywords: ["AI 리뷰", "제품 추천", "IT 가전", "쿠팡 파트너스", "노트북 추천"],
  openGraph: {
    title: "Money Maker AI",
    description: "현명한 소비를 돕는 AI 전문가의 제품 리뷰",
    url: "https://m-maker-ai.vercel.app",
    siteName: "Money Maker AI",
    locale: "ko_KR",
    type: "website",
  },
  verification: {
    google: "GOOGLE_VERIFICATION_CODE", // 사용자로부터 전달받을 예정
    other: {
      "naver-site-verification": "NAVER_VERIFICATION_CODE", // 사용자로부터 전달받을 예정
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

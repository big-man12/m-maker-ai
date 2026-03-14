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

import productData from '@/data/product.json';

const dynamicKeywords = [
  "AI 리뷰", "제품 추천", "IT 가전", "쿠팡 파트너스",
  productData.title,
  ...(productData.searchKeyword?.split(' ') || []),
  productData.title.split(':')[0].trim() // "갤럭시 S24 울트라" 같이 핵심 모델명만 추출
];

const faqSchema = productData.faqs ? {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": productData.faqs.map((faq: any) => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
} : null;

export const metadata: Metadata = {
  title: `${productData.title} | Money Maker AI`,
  description: productData.subtitle || "AI가 분석한 가장 신뢰도 높은 프리미엄 제품 리뷰 솔루션.",
  keywords: dynamicKeywords,
  openGraph: {
    title: productData.title,
    description: productData.subtitle,
    url: "https://m-maker-ai.vercel.app",
    siteName: "Money Maker AI",
    locale: "ko_KR",
    type: "website",
  },
  verification: {
    google: "google4038e323a8c00bca", 
    other: {
      "naver-site-verification": "61a60bf876678950a644a32412bfe37468868ab9", 
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Money Maker AI",
              "url": "https://m-maker-ai.vercel.app",
              "description": metadata.description,
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://m-maker-ai.vercel.app/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Social-Maker AI",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "description": "AI 기반 소셜 미디어 콘텐츠 자동 생성 솔루션",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "KRW"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

"use client";

import React, { useState } from 'react';
import { ShoppingCart, CheckCircle, XCircle, Star, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [loading, setLoading] = useState(false);

  // 샘플 데이터 (실제로는 API에서 가져오게 됨)
  const product: any = {
    title: "M3 MacBook Pro 14: 상상 그 이상의 퍼포먼스",
    subtitle: "프로를 위한 가장 완벽한 랩탑의 재정의",
    summary: "강력한 M3 칩셋을 탑재하여 영상 편집, 3D 렌더링 등 무거운 작업에서도 압도적인 속도를 자랑합니다. 120Hz Liquid Retina XDR 디스플레이는 시각적인 한계를 뛰어넘습니다.",
    pros: ["전성비 최고의 M3 칩 성능", "압도적인 배터리 타임 (최대 22시간)", "업계 표준의 디스플레이 품질"],
    cons: ["여전히 높은 가격 진입장벽", "최소 램 용량에 대한 아쉬움"],
    detailedReview: "실제로 2주간 사용해본 결과, M3 MacBook Pro는 단순한 업그레이드 이상의 가치를 제공합니다. 특히 이동 중에도 데스크탑 급의 성능을 낼 수 있다는 점이 가장 큰 장점이었습니다...",
    targetAudience: "고성능 작업이 필수적인 크리에이티브 전문가 및 개발자",
    conclusion: "가격은 비싸지만, 그 성능과 효율을 생각하면 단연코 최고의 투자입니다.",
    price: "₩2,390,000",
    image: "/macbook.png",
    searchKeyword: "MacBook Pro M3 14"
  };

  // 쿠팡 파트너스 링크 생성 (제목 대신 핵심 키워드로 검색하여 정확도 향상)
  const buyLink = product.afLink || `https://www.coupang.com/np/search?q=${encodeURIComponent(product.searchKeyword || product.title)}`;

  const handleBuyClick = (e: React.MouseEvent) => {
    if (buyLink === "#") {
      e.preventDefault();
      alert("수익 링크를 생성 중입니다. 잠시만 기다려 주세요!");
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-12 max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium"
        >
          <Sparkles size={16} />
          <span>AI가 직접 분석한 오늘의 프리미엄 리뷰</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-7xl font-black tracking-tight leading-tight gradient-text"
        >
          {product.title}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-400 max-w-2xl mx-auto"
        >
          {product.subtitle}
        </motion.p>

        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.3 }}
           className="relative group mt-12"
        >
          <div className="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full group-hover:bg-blue-600/30 transition-all"></div>
          <img 
            src={product.image} 
            alt={product.title}
            className="relative w-full aspect-video object-cover rounded-[32px] border border-white/10 shadow-2xl animate-float"
          />
        </motion.div>
      </section>

      {/* AI Summary Card */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="text-blue-400" />
            AI 핵심 요약
          </h2>
          <p className="text-gray-300 leading-relaxed text-lg">
            {product.summary}
          </p>
          <div className="pt-4 flex flex-wrap gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Star className="text-yellow-500 fill-yellow-500" size={16} />
              <span>전문가 평점: 4.9/5.0</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="text-green-500" size={16} />
              <span>신뢰도 검증 완료</span>
            </div>
          </div>
        </div>

        <div className="glass-card flex flex-col justify-between items-center text-center py-10">
          <div className="space-y-2">
            <span className="text-gray-400 text-sm uppercase tracking-widest">최저가 확인</span>
            <div className="text-4xl font-black text-white">{product.price}</div>
          </div>
          <a 
            href={buyLink} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={handleBuyClick}
            className="premium-button w-full mt-6"
          >
            <ShoppingCart size={20} />
            지금 바로 구매하기
            <ArrowRight size={18} />
          </a>
          <p className="text-[10px] text-gray-500 mt-4 leading-tight">
            * 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
          </p>
        </div>
      </section>

      {/* Pros & Cons */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-8 border-green-500/20 hover:border-green-500/40">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-green-400">
            <CheckCircle size={24} />
            이런 점이 좋았어요!
          </h3>
          <ul className="space-y-4">
            {product.pros.map((pro: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-gray-300">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                {pro}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-card p-8 border-red-500/20 hover:border-red-500/40">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-400">
            <XCircle size={24} />
            조금 아쉬운 점은...
          </h3>
          <ul className="space-y-4">
            {product.cons.map((con: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-gray-300">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {con}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Detailed Specs Section (NEW) */}
      <section className="glass-card space-y-8">
        <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-white/10 pb-4">
          <Star className="text-blue-400" />
          상세 스펙 시트
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-1">
            <p className="text-gray-500 text-xs uppercase tracking-tighter">칩셋</p>
            <p className="text-white font-medium">Apple M3 (8코어 CPU)</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500 text-xs uppercase tracking-tighter">메모리</p>
            <p className="text-white font-medium">8GB / 16GB / 24GB</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500 text-xs uppercase tracking-tighter">디스플레이</p>
            <p className="text-white font-medium">14.2인치 XDR (120Hz)</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500 text-xs uppercase tracking-tighter">배터리</p>
            <p className="text-white font-medium">최대 22시간 재생</p>
          </div>
        </div>
      </section>

      {/* Detailed Review Text */}
      <section className="space-y-6 max-w-3xl mx-auto py-12">
        <h3 className="text-2xl font-bold italic">"단순한 성능 향상을 넘어선 가치"</h3>
        <p className="text-gray-400 leading-loose">
          {product.detailedReview}
        </p>
      </section>

      {/* Footer CTA */}
      <footer className="text-center py-20 border-t border-white/5 space-y-8">
        <div className="inline-flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-[1px]">
            <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
              <Sparkles className="text-blue-400" size={24} />
            </div>
          </div>
          <p className="text-gray-300 font-medium">당신의 현명한 소비를 돕는 AI, Money-Maker AI</p>
        </div>
        <div className="flex justify-center gap-4">
          <span className="text-6xl md:text-8xl font-black opacity-5 select-none tracking-tighter">MONEY MAKER AI</span>
        </div>
        <div className="text-gray-600 text-xs pt-12">
          &copy; 2026 Money Maker AI. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

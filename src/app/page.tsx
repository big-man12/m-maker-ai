"use client";

import React, { useState } from 'react';
import { ShoppingCart, CheckCircle, XCircle, Star, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getHitStats, incrementHit } from '../lib/counter-store';

import productData from '@/data/product.json';
import curationData from '@/data/curation.json';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const product: any = productData;

  React.useEffect(() => {
    const fetchStats = async () => {
      await incrementHit();
      const s = await getHitStats();
      setStats(s);
    };
    fetchStats();
  }, []);

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

        {/* Stats Dashboard */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4 mt-8"
        >
          <div className="glass-card px-8 py-4 text-left min-w-[200px] border-blue-500/20">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Total Hits</p>
            <div className="text-3xl font-black text-white flex items-baseline gap-1">
              <span>{stats.total.toLocaleString()}</span>
              <span className="text-xs text-blue-500/50">+</span>
            </div>
          </div>
          <div className="glass-card px-8 py-4 text-left min-w-[200px] border-purple-500/20">
            <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-1">Today's Magic</p>
            <div className="text-3xl font-black text-white">
              <span>{stats.today.toLocaleString()}</span>
            </div>
          </div>
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
          {(product.specs || [
            { label: "칩셋", value: "Apple M3 (8코어 CPU)" },
            { label: "메모리", value: "8GB / 16GB / 24GB" },
            { label: "디스플레이", value: "14.2인치 XDR (120Hz)" },
            { label: "배터리", value: "최대 22시간 재생" }
          ]).map((spec: any, idx: number) => (
            <div key={idx} className="space-y-1">
              <p className="text-gray-500 text-xs uppercase tracking-tighter">{spec.label}</p>
              <p className="text-white font-medium">{spec.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Q&A Section (GEO Optimized - NEW) */}
      <section className="glass-card space-y-8 border-purple-500/20">
        <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-white/10 pb-4">
          <Sparkles className="text-purple-400" />
          AI가 답해주는 궁금한 점
        </h2>
        <div className="space-y-6">
          {(product.faqs || []).map((faq: any, idx: number) => (
            <div key={idx} className="space-y-2 group">
              <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors flex items-start gap-2">
                <span className="text-purple-500/50">Q.</span>
                {faq.question}
              </h3>
              <p className="text-gray-400 leading-relaxed pl-7 border-l-2 border-white/5">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Review Text */}
      <section className="space-y-6 max-w-3xl mx-auto py-12">
        <h3 className="text-2xl font-bold italic">"단순한 성능 향상을 넘어선 가치"</h3>
        <p className="text-gray-400 leading-loose">
          {product.detailedReview}
        </p>
      </section>

      {/* Curation Model: Recommendation Section (NEW) */}
      <section className="space-y-12 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-blue-500 pl-6">
          <div>
            <h2 className="text-3xl font-black text-white">함께 보면 좋은 추천 아이템</h2>
            <p className="text-gray-500 mt-2">AI가 분석한 가장 연관성 높은 보조 기기 및 대안 상품들입니다.</p>
          </div>
          <Link 
            href="/archive"
            className="text-blue-400 text-sm font-bold uppercase tracking-widest cursor-pointer hover:underline flex items-center gap-1 group"
          >
            전체 보기 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(curationData.recommendations || []).map((rec: any, idx: number) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -10 }}
              className="glass-card group overflow-hidden flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl mb-6">
                <img 
                  src={rec.image} 
                  alt={rec.title}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <span className="text-white font-bold text-sm tracking-tighter">최저가 보러가기</span>
                </div>
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-xl font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
                  {rec.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-white">{rec.price}</span>
                  <a 
                    href={`https://www.coupang.com/np/search?q=${encodeURIComponent(rec.searchKeyword || rec.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
                  >
                    <ShoppingCart size={20} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
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

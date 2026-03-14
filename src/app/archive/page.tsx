'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import curationData from '@/data/curation.json';

export default function ArchivePage() {
  const { theme, mainProduct, recommendations } = curationData;

  return (
    <main className="min-h-screen bg-[#050505] text-gray-100 selection:bg-blue-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12">
        {/* Navigation */}
        <nav className="mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            홈으로 돌아가기
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-blue-500 font-bold tracking-[0.2em] uppercase text-sm">Curation Archive</span>
            <h1 className="text-4xl md:text-6xl font-black mt-2 tracking-tighter">
              {theme}
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mt-4">
              AI가 엄선한 고효율 상품들을 한눈에 확인하세요. 최신 트렌드와 수익성을 분석한 최적의 조합입니다.
            </p>
          </motion.div>
        </header>

        {/* Main Product Card (Hero) */}
        <section className="mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            <div className="aspect-square overflow-hidden bg-white/5">
              <img 
                src={mainProduct.image} 
                alt={mainProduct.title}
                className="w-full h-full object-cover transition duration-700 hover:scale-110"
              />
            </div>
            <div className="p-8 lg:p-12 space-y-6">
              <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-full">
                MAIN RECOMMENDATION
              </div>
              <h2 className="text-3xl md:text-4xl font-black">{mainProduct.title}</h2>
              <div className="text-3xl font-bold text-white mb-6">{mainProduct.price}</div>
              <a 
                href={`https://www.coupang.com/np/search?q=${encodeURIComponent(mainProduct.searchKeyword)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 w-full md:w-auto px-8 py-4 bg-white text-black font-black hover:bg-blue-500 hover:text-white transition-all duration-300 rounded-2xl group"
              >
                검색하고 쇼핑하기
                <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>
        </section>

        {/* Recommendations Grid */}
        <section className="space-y-10">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">연관 추천 목록</h2>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="glass-card group overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={rec.image} 
                    alt={rec.title}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                    {rec.title}
                  </h3>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-bold">{rec.price}</span>
                    <a 
                      href={`https://www.coupang.com/np/search?q=${encodeURIComponent(rec.searchKeyword)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
                    >
                      <ShoppingCart size={18} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="mt-32 text-center text-gray-600 pb-12">
          <p>© 2026 Money-Maker AI. 모든 추천은 AI 데이터 분석을 기반으로 합니다.</p>
        </footer>
      </div>
    </main>
  );
}

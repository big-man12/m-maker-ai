"use client";

import React, { useState } from 'react';
import { Sparkles, Instagram, Youtube, Send, Loader2, Share2, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHitStats, incrementHit } from '@/lib/counter-store';

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [instagramLoading, setInstagramLoading] = useState(false);
  const [productImage, setProductImage] = useState<string | null>(null);

  // 텍스트 추출 유틸리티 (헤더 기반)
  const extractSection = (content: string, startHeader: string, endHeader?: string) => {
    if (!content) return "";
    const startIndex = content.indexOf(startHeader);
    if (startIndex === -1) return "";
    
    let subContent = content.substring(startIndex + startHeader.length).trim();
    if (endHeader) {
      const endIndex = subContent.indexOf(endHeader);
      if (endIndex !== -1) {
        subContent = subContent.substring(0, endIndex).trim();
      }
    }
    return subContent;
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(type);
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Failed to copy text: ', error);
    }
  };

  React.useEffect(() => {
    incrementHit();
    getHitStats().then(setStats);
    
    // 초기 로드 시 상품 이미지 가져오기
    fetch('/api/product')
      .then(res => res.json())
      .then(data => {
        if (data.image) setProductImage(data.image);
      })
      .catch((err: any) => console.error("Failed to fetch product image", err)); // eslint-disable-line @typescript-eslint/no-explicit-any
  }, []);

  const handleInstagramPost = async () => {
    if (!result) return;
    
    const postImage = productImage || "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1000";

    setInstagramLoading(true);
    try {
      const caption = extractSection(result, "### 인스타그램 캡션", "### 유튜브 쇼츠");
      
      const res = await fetch('/api/instagram/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageUrl: postImage,
          caption: caption || result.substring(0, 1000)
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("인스타그램에 성공적으로 포스팅되었습니다!");
      } else {
        alert(`포스팅 실패: ${data.error}`);
      }
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setInstagramLoading(false);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState("general");

  const categories = [
    { id: 'general', name: '일반 제품', icon: Sparkles },
    { id: 'saas', name: 'SaaS/소프트웨어', icon: Send },
    { id: 'hosting', name: '웹 호스팅', icon: Share2 },
    { id: 'ai_tools', name: 'AI 도구', icon: Sparkles },
    { id: 'finance', name: '금융/대출', icon: Copy }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, category: selectedCategory })
      });
      
      const data = await res.json();
      if (!res.ok) {
        setResult(data.error || "생성 실패: 서버 응답 오류");
      } else {
        setResult(data.content);
      }
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setResult("생성 실패: 네트워크 연결을 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-12 max-w-5xl mx-auto space-y-12 pb-24">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium"
        >
          <Sparkles size={16} />
          <span>Money-Maker AI: Viral Content Engine v2.0</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-8xl font-black tracking-tight leading-tight gradient-text"
        >
          콘텐츠를 마법처럼<br />자동으로 생성하세요
        </motion.h1>

        {/* Stats Dashboard (v1 style) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4 mt-8"
        >
          <div className="glass-card px-8 py-4 text-left min-w-[200px] border-blue-500/20">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Global Viral Hits</p>
            <div className="text-3xl font-black text-white flex items-baseline gap-1">
              <span>{stats.total.toLocaleString()}</span>
              <span className="text-xs text-blue-500/50">+</span>
            </div>
          </div>
          <div className="glass-card px-8 py-4 text-left min-w-[200px] border-purple-500/20">
            <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-1">Today's Content</p>
            <div className="text-3xl font-black text-white">
              <span>{stats.today.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Category Selector */}
      <section className="flex flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              selectedCategory === cat.id 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
            }`}
          >
            <cat.icon size={16} />
            <span className="text-sm font-bold">{cat.name}</span>
          </button>
        ))}
      </section>

      {/* Input Section */}
      <section className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative glass-card p-2 flex items-center gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="블로그 주소나 제품명을 입력하세요..."
              className="flex-1 bg-transparent border-none outline-none px-4 text-white placeholder-gray-500 text-lg"
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Send />}
            </button>
          </div>
        </form>
      </section>

      <AnimatePresence>
        {result && (
          <motion.section 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="glass-card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-pink-400">
                  <Instagram size={24} />
                  인스타그램 콘텐츠
                </h2>
                <div className="flex items-center gap-2">
                  {copyStatus === 'instagram' && <span className="text-xs text-pink-400 animate-pulse">복사됨!</span>}
                  <Copy 
                    size={18} 
                    className={`cursor-pointer transition ${copyStatus === 'instagram' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                    onClick={() => {
                      const text = extractSection(result, "### 인스타그램 캡션", "### 유튜브 쇼츠");
                      handleCopy(text || result, 'instagram');
                    }}
                  />
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl text-gray-300 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                {result.includes("콘텐츠 생성 오류") 
                  ? <span className="text-red-400">{result}</span>
                  : (extractSection(result, "### 인스타그램 캡션", "### 유튜브 쇼츠") || "내용을 분석 중입니다...")}
              </div>

              {!result.includes("콘텐츠 생성 오류") && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleInstagramPost}
                  disabled={instagramLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-orange-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 disabled:opacity-50"
                >
                  {instagramLoading ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
                  <span>인스타그램에 즉시 포스팅</span>
                </motion.button>
              )}
            </div>

            <div className="glass-card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-red-400">
                  <Youtube size={24} />
                  유튜브 쇼츠 대본
                </h2>
                <div className="flex items-center gap-2">
                  {copyStatus === 'youtube' && <span className="text-xs text-red-400 animate-pulse">복사됨!</span>}
                  <Copy 
                    size={18} 
                    className={`cursor-pointer transition ${copyStatus === 'youtube' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                    onClick={() => {
                      const text = extractSection(result, "### 유튜브 쇼츠", "### 카드뉴스");
                      handleCopy(text || result, 'youtube');
                    }}
                  />
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl text-gray-300 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                {result.includes("콘텐츠 생성 오류")
                  ? "데이터 생성 실패"
                  : (extractSection(result, "### 유튜브 쇼츠", "### 카드뉴스") || "생성 중...")}
              </div>
            </div>

            <div className="md:col-span-2 glass-card space-y-4 bg-gradient-to-br from-purple-900/10 to-transparent border-purple-500/10">
              <h2 className="text-xl font-bold flex items-center gap-2 text-purple-400">
                <Sparkles size={24} />
                AI 비주얼 제안 & 테마
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 uppercase font-medium">이미지 프롬프트</p>
                  <p className="text-gray-400 italic text-sm">
                    {extractSection(result, "### 이미지 생성용 프롬프트") || "..."}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 uppercase font-medium">디자인 가이드</p>
                  <p className="text-gray-400">
                   {extractSection(result, "### 카드뉴스 테마", "### 이미지 생성용 프롬프트") || "..."}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Footer (v1 style) */}
      <footer className="text-center py-20 border-t border-white/5 space-y-8">
        <div className="inline-flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-[1px]">
            <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
              <Sparkles className="text-blue-400" size={24} />
            </div>
          </div>
          <p className="text-gray-300 font-medium">당신의 현명한 수익화를 돕는 AI, Money-Maker AI</p>
        </div>
        <div className="flex justify-center gap-4">
          <span className="text-6xl md:text-8xl font-black opacity-5 select-none tracking-tighter uppercase text-white">Money Maker AI</span>
        </div>
        <div className="text-gray-600 text-xs pt-12">
          &copy; 2026 Money-Maker AI. Created for your financial freedom.
        </div>
      </footer>
    </main>
  );
}

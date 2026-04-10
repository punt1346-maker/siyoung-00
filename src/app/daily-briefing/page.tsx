"use client";

import { useState } from "react";
import Link from "next/link";

export default function DailyBriefingPage() {
  const [news, setNews] = useState("");
  const [briefing, setBriefing] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!news.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/daily-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ news }),
      });
      if (!res.ok) {
        throw new Error("Failed to generate briefing");
      }
      const data = await res.json();
      setBriefing(data.briefing || "");
    } catch (e: any) {
      setError(e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-ds-base text-ds-text p-6 md:p-12">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        <header className="mb-8 font-sans flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ds-text">데일리 카드 브리핑 생성기</h1>
            <p className="text-ds-text-secondary mt-2">오늘의 뉴스나 데이터를 입력하면 맞춤형 브리핑을 작성합니다.</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-ds-surface border border-ds-border rounded-lg text-sm font-bold hover:bg-ds-elevated transition-colors"
          >
            ← 메인으로 돌아가기
          </Link>
        </header>

        <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-[500px]">
          {/* 입력 섹션 */}
          <div className="flex-1 flex flex-col gap-4">
            <textarea
              value={news}
              onChange={(e) => setNews(e.target.value)}
              disabled={loading}
              placeholder="예: 한국은행 금리 0.25% 인상, 국민카드 혜자카드 단종 예고 등..."
              className="w-full flex-1 p-5 bg-ds-surface border border-ds-border rounded-2xl text-ds-text placeholder:text-ds-text-muted focus:outline-none focus:border-ds-accent resize-none font-sans text-lg leading-relaxed shadow-inner"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !news.trim()}
              className="w-full py-5 bg-ds-accent hover:bg-ds-accent-hover disabled:bg-ds-border-strong text-white font-bold rounded-2xl transition-all text-xl shadow-lg active:scale-[0.98]"
            >
              {loading ? "작성 중..." : "브리핑 생성하기"}
            </button>
          </div>

          {/* 결과 섹션 */}
          <div className="flex-1 bg-ds-surface border border-ds-border rounded-2xl p-6 md:p-8 overflow-y-auto shadow-xl relative">
            {error && <div className="text-status-error mb-4 font-sans">{error}</div>}
            
            {!briefing && !loading && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-ds-text-muted font-sans text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 opacity-50">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                좌측에 데이터를 입력하고<br/>생성 버튼을 눌러주세요.
              </div>
            )}
            
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-ds-border-strong border-t-ds-accent rounded-full animate-spin" />
              </div>
            )}
            
            {briefing && !loading && (
              <div className="font-sans leading-loose whitespace-pre-wrap text-ds-text text-base md:text-lg">
                {briefing}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

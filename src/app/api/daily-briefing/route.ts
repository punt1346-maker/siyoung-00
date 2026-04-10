import { NextRequest, NextResponse } from "next/server";
import { getApiKey } from "@/lib/getApiKey";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";

export async function POST(req: NextRequest) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  // 사용자로부터 뉴스 및 데이터 입력을 받거나 기본 문구 사용
  const body = await req.json().catch(() => ({}));
  const { news = "오늘의 주요 카드사 뉴스 및 금리 변동 사항을 분석해주세요." } = body;

  const prompt = `
# Role: 데이터 기반 신용카드 전략 분석가

# Task: 오늘 발표된 신용카드 업계 소식과 금융 지표를 분석하여, 구독자의 고정 지출을 줄이고 혜택을 극대화할 수 있는 '데일리 카드 브리핑'을 작성하라.

# Essential Content Sections:
1. **업계 긴급 동향 (Flash News):** 금리 변동에 따른 카드론 변화, 카드사 서비스 중단/변경, 규제 변화 등.
2. **카드 혜택 분석 (Benefit Analysis):** 
   - [신규] 새로 출시된 카드의 피킹률(실질 혜택률) 분석.
   - [단종] 단종되기 전 반드시 발급받아야 할 '혜자 카드' 경고.
3. **소비 카테고리별 추천 (Best for You):** 이번 주 트렌드(예: 고물가 시기 배달앱 할인, 해외여행 시즌 트래블 카드 등)에 맞는 최적의 카드 추천.
4. **절세 및 금융 팁 (Smart Finance):** 연말정산 대비 카드 사용 전략, 포인트 현금화, 신용도 관리 팁.

# Output Structure:
## 📢 오늘자 카드 업계 Headline
- (뉴스의 핵심 내용과 그 소식이 내 지갑에 미치는 영향 위주로 정리)

## 🔍 이달의 카드 집중 탐구
- **카드명:** 
- **선정 이유:** (예: 전월 실적 조건 대비 압도적 적립률 등)
- **활용 전략:** (최대 혜택을 뽑아낼 수 있는 사용 루틴)

## 💡 금융 비서의 한 줄 조언
- "이번 달 공과금 납부는 A카드의 캐시백 이벤트를 활용하는 게 5% 더 이득입니다."

# Tone & Manner:
- 신뢰감 있고 간결한 비즈니스 문체 (~입니다, ~하십시오).
- 숫자를 적극적으로 사용하여 혜택을 정량화할 것 (예: "3% 적립" 대신 "월 최대 3만 원 절약").
- 전문 용어는 쉽게 풀어서 설명할 것.

---
요청 데이터 및 투데이 뉴스:
${news}
`;

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7, // 창의적이면서도 신뢰감 있는 텍스트 생성을 위해 0.7 설정
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[daily-briefing] Gemini error:", res.status, errText);
      return NextResponse.json(
        { error: `Gemini API error: ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({
      briefing: rawText,
    });
  } catch (e) {
    console.error("[daily-briefing] error:", e);
    return NextResponse.json(
      { error: "Failed to generate briefing" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "API is active. Please use POST method to generate briefing." },
    { status: 200 }
  );
}

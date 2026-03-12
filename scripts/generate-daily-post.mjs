import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productFilePath = path.join(__dirname, '../src/data/product.json');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

async function generateDailyPost() {
  console.log("🚀 AI 일일 포스팅 생성 시작...");

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    당신은 대한민국 최고의 IT/가전 전문 리뷰어입니다. 
    오늘의 추천 제품 하나를 선정하여 아래 JSON 형식으로 상세 리뷰를 작성해 주세요.
    최신 트렌드(삼성, LG, 애플, 다이슨, 소니 등)를 반영해 주세요.

    [필수 포함 항목 및 형식]
    {
      "title": "제품명과 핵심 특징을 담은 강렬한 제목",
      "subtitle": "매력적인 부제목",
      "summary": "AI가 직접 분석한 3줄 요약",
      "pros": ["장점1", "장점2", "장점3"],
      "cons": ["단점1", "단점2"],
      "detailedReview": "200자 이상의 상세 사용 후기 느낌의 텍스트",
      "targetAudience": "추천 대상 고객",
      "conclusion": "최종 결론 한 문장",
      "price": "정가 또는 예상 가격(₩ 포함)",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000",
      "searchKeyword": "쿠팡 검색을 위한 정확한 제품명 키워드",
      "specs": [
        {"label": "항목1", "value": "값1"},
        {"label": "항목2", "value": "값2"},
        {"label": "항목3", "value": "값3"},
        {"label": "항목4", "value": "값4"}
      ]
    }

    JSON 형식만 출력해 주세요. 마크다운 기호 없이 순수 JSON만 필요합니다.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON 추출 (혹시 모를 마크다운 제거)
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const productData = JSON.parse(jsonStr);

    fs.writeFileSync(productFilePath, JSON.stringify(productData, null, 2));
    console.log(`✅ 새로운 포스팅 생성 완료: ${productData.title}`);
  } catch (error) {
    console.error("❌ 생성 중 오류 발생:", error);
    process.exit(1);
  }
}

generateDailyPost();

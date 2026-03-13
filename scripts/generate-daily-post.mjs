import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productFilePath = path.join(__dirname, '../src/data/product.json');
const promoFilePath = path.join(__dirname, '../src/data/promo.txt');

async function generateDailyPost() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("❌ GOOGLE_API_KEY가 설정되지 않았습니다. GitHub Secrets를 확인해 주세요.");
    process.exit(1);
  }
  
  console.log(`🔑 API Key Length: ${apiKey.length}`);
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // [강력 진단] 사용 가능한 모든 모델 리스트 출력
  try {
    console.log("🔍 가용한 모델 목록 확인 중...");
    // node-fetch나 내장 fetch를 사용하여 직접 목록 조회 시도 (SDK 버전 이슈 대비)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (data.models) {
      console.log("✅ 가용 모델 목록:", data.models.map(m => m.name).join(", "));
    } else {
      console.log("⚠️ 모델 목록을 가져올 수 없습니다. 응답:", JSON.stringify(data));
    }
  } catch (diagError) {
    console.log("⚠️ 진단 중 오류 발생:", diagError.message);
  }

  console.log("🚀 AI 일일 포스팅 및 홍보글 생성 시작...");
  
  try {
    // 100% 무료 티어가 제공되는 Flash 계열 모델만 사용합니다.
    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-latest"];
    let model;
  let success = false;

  for (const modelId of modelsToTry) {
    try {
      console.log(`📡 모델 호출 시도 중: ${modelId}...`);
      model = genAI.getGenerativeModel({ model: modelId });
      
      const prompt = `
        당신은 대한민국 최고의 IT/가전 전문 리뷰어이자 SNS 마케팅 전문가입니다. 
        오늘의 추천 제품 하나를 선정하여 아래 JSON 형식으로 상세 리뷰를 작성하고, 
        해당 제품을 홍보하기 위한 SNS 문구들을 함께 작성해 주세요.

        [작성 가이드라인 - 필독]
        1. AI가 쓴 티가 나지 않도록 자연스러운 구어체와 담백한 어조를 사용하세요.
        2. 이모지(특수 이미지), 과도한 특수 기호(★, ■ 등) 사용을 엄격히 자제하세요. 
        3. 사람이 직접 제품을 써보고 지인에게 추천하는 듯한 진정성 있는 문체로 작성하세요.

        [필수 포함 항목 및 형식]
        {
          "product": {
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
          },
          "promo": {
            "instagram": "인스타그램 캡션 (해시태그 포함, 감성적)",
            "shorts": "유튜브 쇼츠 대본 (15초 분량, 후킹 포함)",
            "blog": "블로그용 홍보 문구 (신뢰감 있는 어조)"
          }
        }

        JSON 형식만 출력해 주세요. 마크다운 기호 없이 순수 JSON만 필요합니다.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // JSON 추출
      const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const fullData = JSON.parse(jsonStr);

      // 제품 데이터 저장
      fs.writeFileSync(productFilePath, JSON.stringify(fullData.product, null, 2));
      
      // 홍보글 텍스트 파일 생성
      const promoText = `
[오늘의 AI 추천 제품 홍보글 보고서]

📌 제품명: ${fullData.product.title}
💰 가격: ${fullData.product.price}

---

📸 [인스타그램 홍보 문구]
${fullData.promo.instagram}

🎬 [유튜브 쇼츠 대본]
${fullData.promo.shorts}

📝 [네이버 블로그/커뮤니티 홍보]
${fullData.promo.blog}

---
🔗 사이트 확인하기: https://m-maker-ai.vercel.app
      `.trim();
      
      fs.writeFileSync(promoFilePath, promoText);
      console.log(`✅ 생성 완료 (${modelId}): ${fullData.product.title}`);
      success = true;
      break; // 성공 시 루프 탈출
    } catch (err) {
      console.error(`❌ ${modelId} 호출 실패:`, err.message || err);
      if (modelId === modelsToTry[modelsToTry.length - 1]) throw err; // 마지막 모델까지 실패하면 에러 던짐
    }
  }
  } catch (error) {
    console.error("❌ 생성 중 오류 발생:");
    if (error.status === 404) {
      console.error("👉 [404 Error] 이 API 키가 'gemini-1.5-flash' 모델에 접근할 권한이 없거나, 해당 프로젝트에 Generative Language API가 활성화되지 않았습니다.");
      console.error("🔗 해결책: https://aistudio.google.com/app/apikey 에서 새로운 키를 발급받아 보세요!");
    }
    console.error("상세 에러:", error.message || error);
    process.exit(1);
  }
}

generateDailyPost();

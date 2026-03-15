import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productFilePath = path.join(__dirname, '../src/data/product.json');
const curationFilePath = path.join(__dirname, '../src/data/curation.json');
const promoFilePath = path.join(__dirname, '../promo_content.txt');

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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (data.models) {
      console.log("✅ 가용 모델 목록:", data.models.map(m => m.name).join(", "));
    }
  } catch (diagError) {
    console.log("⚠️ 진단 중 오류 발생:", diagError.message);
  }

  console.log("🚀 AI 일일 포스팅 및 큐레이션 데이터 생성 시작...");
  
  try {
    const modelsToTry = ["gemini-1.5-flash-8b", "gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
    let success = false;

  for (const modelId of modelsToTry) {
    try {
      console.log(`📡 모델 호출 시도 중: ${modelId}...`);
      const model = genAI.getGenerativeModel({ model: modelId });
      
      const prompt = `
        당신은 대한민국 최고의 IT/가전 전문 리뷰어이자 SNS 마케팅 전문가입니다. 
        오늘의 메인 추천 제품 하나와 그에 어울리는 연관 상품(액세서리 또는 대안) 3개를 선정하여 아래 JSON 형식으로 작성해 주세요.

        [작성 가이드라인]
        1. AI가 쓴 티가 나지 않도록 자연스러운 구어체와 담백한 어조를 사용하세요.
        2. 이모지(🔔, 🚀, ★ 등)와 과도한 수식어 사용을 엄격히 금지합니다.
        3. '오늘의 스마트 라이프 추천' 같은 테마를 정해 큐레이션 하세요.

        [응답 JSON 형식]
        {
          "product": {
            "title": "메인 제품명",
            "subtitle": "매력적인 부제목",
            "summary": "3줄 요약",
            "pros": ["장점1", "장점2", "장점3"],
            "cons": ["단점1", "단점2"],
            "detailedReview": "200자 이상의 상세 후기",
            "targetAudience": "추천 대상",
            "conclusion": "최종 결론",
            "price": "₩ 가격",
            "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000",
            "searchKeyword": "쿠팡 키워드",
            "specs": [{"label": "항목", "value": "값"}],
            "comparison": {
              "competitor": "경쟁 모델명",
              "diffPoints": ["차별점 1", "차별점 2", "차별점 3"]
            },
            "faqs": [
              {
                "question": "AI 엔진이 선호하는 구체적인 기술적 질문 (예: 제품의 핵심 차별점이나 성능 수치)",
                "answer": "해당 질문에 대한 전문적이고 구체적인 답변 (수치나 실제 체감 위주)"
              }
            ]
          },
          "curation": {
            "theme": "큐레이션 테마 제목",
            "recommendations": [
              {
                "title": "추천 상품 1",
                "price": "₩ 가격",
                "image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1000",
                "searchKeyword": "쿠팡 키워드 1"
              },
              {
                "title": "추천 상품 2",
                "price": "₩ 가격",
                "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1000",
                "searchKeyword": "쿠팡 키워드 2"
              },
              {
                "title": "추천 상품 3",
                "price": "₩ 가격",
                "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000",
                "searchKeyword": "쿠팡 키워드 3"
              }
            ]
          },
          "promo": {
            "instagram": "캡션 (이모지 없이)",
            "shorts": "쇼츠 대본 (이모지 없이)",
            "blog": "블로그 문구"
          }
        }

        JSON만 출력하세요.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const fullData = JSON.parse(jsonStr);

      // 1. 메인 제품 데이터 저장
      fs.writeFileSync(productFilePath, JSON.stringify(fullData.product, null, 2));
      
      // 2. 큐레이션 데이터 저장 (메인 상품 정보 포함)
      const curationData = {
        theme: fullData.curation.theme,
        mainProduct: {
          title: fullData.product.title,
          price: fullData.product.price,
          image: fullData.product.image,
          searchKeyword: fullData.product.searchKeyword
        },
        recommendations: fullData.curation.recommendations
      };
      fs.writeFileSync(curationFilePath, JSON.stringify(curationData, null, 2));

      // 3. 홍보글 텍스트 저장
      const promoText = `
[Money-Maker AI 오늘의 추천 데이터]

메인 상품: ${fullData.product.title}
테마: ${fullData.curation.theme}

[SNS 홍보 문구]
인스타그램: ${fullData.promo.instagram}
유튜브 쇼츠: ${fullData.promo.shorts}
블로그/커뮤니티: ${fullData.promo.blog}

상세 정보 확인: https://m-maker-ai.vercel.app
      `.trim();
      
      fs.writeFileSync(promoFilePath, promoText);
      console.log(`✅ 생성 및 큐레이션 완료 (${modelId}): ${fullData.product.title}`);

      // [추가] 인스타그램 자동 포스팅 실행
      try {
        console.log("📸 인스타그램 자동 포스팅 시도 중...");
        const businessId = process.env.INSTAGRAM_BUSINESS_ID;
        const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

        if (businessId && accessToken) {
          const imageUrl = fullData.product.image;
          const caption = `${fullData.promo.instagram}\n\n👉 상세 정보 및 최저가 확인: https://m-maker-ai.vercel.app\n#쿠팡파트너스 #가성비템 #추천템`;
          
          const containerRes = await fetch(
            `https://graph.facebook.com/v19.0/${businessId}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${accessToken}`,
            { method: 'POST' }
          );
          const containerData = await containerRes.json();
          
          if (containerData.id) {
            const publishRes = await fetch(
              `https://graph.facebook.com/v19.0/${businessId}/media_publish?creation_id=${containerData.id}&access_token=${accessToken}`,
              { method: 'POST' }
            );
            const publishData = await publishRes.json();
            if (publishData.id) {
              console.log("✨ 인스타그램 자동 포스팅 성공! ID:", publishData.id);
            } else {
              console.error("❌ 인스타그램 게시 실패:", publishData.error?.message);
            }
          } else {
            console.error("❌ 인스타그램 미디어 컨테이너 생성 실패:", containerData.error?.message);
          }
        } else {
          console.warn("⚠️ 인스타그램 설정(ID/Token)이 없어 자동 포스팅을 건너뜁니다.");
        }
      } catch (igError) {
        console.error("❌ 인스타그램 자동화 과정 중 오류 발생:", igError.message);
      }

      success = true;
      break;
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

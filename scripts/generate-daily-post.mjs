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
    const modelsToTry = ["gemini-flash-latest", "gemini-pro-latest", "gemini-2.0-flash-exp"];
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
        4. **중요: 이미지 URL은 해당 제품의 카테고리에 맞는 고화질 Unsplash 이미지를 사용하세요.** 
           - 예: 노트북이면 https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000
           - 예: 스마트폰이면 https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000
           가이드라인의 URL을 그대로 복사하지 말고, 제품 종류(가전, 의류, IT 등)에 맞는 최적의 이미지를 선정하세요.

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
            "price": "₩ 1,234,000 (콤마 포함 정확한 가격)",
            "image": "제품 카테고리에 최적화된 실제 Unsplash 이미지 URL",
            "searchKeyword": "정확한 쿠팡 검색 키워드 (예: 맥북 에어 M3 13)",
            "specs": [{"label": "항목", "value": "값"}],
            "comparison": {
              "competitor": "경쟁 모델명",
              "diffPoints": ["차별점 1", "차별점 2", "차별점 3"]
            },
            "faqs": [
              {
                "question": "구체적인 기술적 질문",
                "answer": "전문적인 답변"
              }
            ]
          },
          "curation": {
            "theme": "큐레이션 테마 제목",
            "recommendations": [
              {
                "title": "추천 상품 1",
                "price": "₩ 가격",
                "image": "해당 상품에 맞는 Unsplash 이미지 URL",
                "searchKeyword": "정확한 쿠팡 검색 키워드"
              },
              {
                "title": "추천 상품 2",
                "price": "₩ 가격",
                "image": "해당 상품에 맞는 Unsplash 이미지 URL",
                "searchKeyword": "정확한 쿠팡 검색 키워드"
              },
              {
                "title": "추천 상품 3",
                "price": "₩ 가격",
                "image": "해당 상품에 맞는 Unsplash 이미지 URL",
                "searchKeyword": "정확한 쿠팡 검색 키워드"
              }
            ]
          },
          "promo": {
            "instagram": "캡션 (이모지 없이)",
            "shorts": "쇼츠 대본 (이모지 없이)",
            "blog": "블로그 문구"
          }
        }

        반드시 JSON만 출력하세요. 모든 필드는 한글로 작성(영어 고유명사 제외)하세요.
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

      // [추가] 디스코드 알림 발송 - 인스타그램보다 먼저/항상 실행
      try {
        const discordUrl = process.env.DISCORD_WEBHOOK_URL;
        if (discordUrl) {
          console.log("🔔 디스코드 알림 발송 중...");
          const discordContent = {
            content: `🚀 **[Money-Maker AI] 오늘의 추천 상품 업데이트**\n\n**메인 상품:** ${fullData.product.title}\n**가격:** ${fullData.product.price}\n**테마:** ${fullData.curation.theme}\n\n[홍보 문구 요약]\n${fullData.promo.instagram.substring(0, 100)}...\n\n👉 사이트 확인: https://m-maker-ai.vercel.app`
          };
          await fetch(discordUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordContent)
          });
          console.log("✨ 디스코드 알림 성공!");
        }
      } catch (dsError) {
        console.error("❌ 디스코드 알림 실패:", dsError.message);
      }

      // [기존] 인스타그램 자동 포스팅 실행
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
      if (modelId === modelsToTry[modelsToTry.length - 1]) throw err;
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

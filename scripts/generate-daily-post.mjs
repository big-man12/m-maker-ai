import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productFilePath = path.join(__dirname, '../src/data/product.json');
const curationFilePath = path.join(__dirname, '../src/data/curation.json');
const promoFilePath = path.join(__dirname, '../promo_content.txt');

// 쿠팡 파트너스 수익 링크 상품 목록 (2026-11-26 쿠팡 파트너스에서 생성)
// 가격은 생성 당시 기준이며, 바뀌면 이 목록만 고치면 됩니다.
const AFFILIATE_PRODUCTS = [
  {
    title: "Apple 맥북 에어 13 M5 (미드나이트)",
    originalPrice: "2,190,000",
    discountRate: "10%",
    price: "1,965,510",
    searchKeyword: "맥북 에어 13 M5",
    link: "https://link.coupang.com/a/iZlePygiDQ",
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1000"
  },
  {
    title: "Apple 맥북 에어 15 M5 (실버)",
    originalPrice: "2,490,000",
    discountRate: "8%",
    price: "2,290,800",
    searchKeyword: "맥북 에어 15 M5",
    link: "https://link.coupang.com/a/iZlkc7uJpc",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1000"
  },
  {
    title: "Apple 맥북 프로 14 M5 (스페이스 블랙)",
    originalPrice: "",
    discountRate: "",
    price: "3,062,990",
    searchKeyword: "맥북 프로 14 M5",
    link: "https://link.coupang.com/a/iZlmdlTeNw",
    image: "https://images.unsplash.com/photo-1515343480029-43cdfe6b6aae?q=80&w=1000"
  },
  {
    title: "Apple 맥북 네오 A18 Pro (실버)",
    originalPrice: "1,190,000",
    discountRate: "9%",
    price: "1,082,900",
    searchKeyword: "맥북 네오",
    link: "https://link.coupang.com/a/iZln5ZTiNg",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000"
  }
];

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000";
const DISCLOSURE = "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

// 날짜에 따라 매일 메인 상품을 바꿔가며 소개
function pickProducts() {
  const dayIndex = Math.floor(Date.now() / 86400000);
  const mainIdx = dayIndex % AFFILIATE_PRODUCTS.length;
  const main = AFFILIATE_PRODUCTS[mainIdx];
  const others = AFFILIATE_PRODUCTS.filter((_, i) => i !== mainIdx);
  return { main, others };
}

export async function generateDailyPost() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("❌ GOOGLE_API_KEY가 설정되지 않았습니다. GitHub Secrets를 확인해 주세요.");
    return false;
  }

  console.log(`🔑 API Key Length: ${apiKey.length}`);
  const genAI = new GoogleGenerativeAI(apiKey);

  const { main, others } = pickProducts();
  console.log(`🛒 오늘의 메인 상품: ${main.title}`);

  console.log("🚀 AI 일일 포스팅 및 큐레이션 데이터 생성 시작...");

  try {
    const modelsToTry = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-lite-latest"];

  for (const modelId of modelsToTry) {
    try {
      console.log(`📡 모델 호출 시도 중: ${modelId}...`);
      const model = genAI.getGenerativeModel({ model: modelId });

      const prompt = `
        당신은 대한민국 최고의 IT/가전 전문 리뷰어이자 SNS 마케팅 전문가입니다.
        오늘의 메인 추천 제품은 "${main.title}" 입니다. (쿠팡 판매가 ${main.price}원)
        함께 비교할 연관 상품은 다음 3개입니다:
        1. ${others[0].title} (${others[0].price}원)
        2. ${others[1].title} (${others[1].price}원)
        3. ${others[2].title} (${others[2].price}원)

        메인 제품의 리뷰와, 위 3개 상품을 묶은 큐레이션을 아래 JSON 형식으로 작성해 주세요.
        상품명과 가격은 위에 적힌 그대로 사용하고, 다른 상품으로 바꾸지 마세요.

        [작성 가이드라인]
        1. AI가 쓴 티가 나지 않도록 자연스러운 구어체와 담백한 어조를 사용하세요.
        2. 이모지(🔔, 🚀, ★ 등)와 과도한 수식어 사용을 엄격히 금지합니다.
        3. 사실이 확실하지 않은 사양은 단정하지 말고 일반적인 표현을 쓰세요.

        [응답 JSON 형식]
        {
          "product": {
            "subtitle": "매력적인 부제목",
            "summary": "3줄 요약",
            "pros": ["장점1", "장점2", "장점3"],
            "cons": ["단점1", "단점2"],
            "detailedReview": "200자 이상의 상세 후기",
            "targetAudience": "추천 대상",
            "conclusion": "최종 결론",
            "specs": [{"label": "항목", "value": "값"}],
            "comparison": {
              "competitor": "경쟁 모델명 (위 연관 상품 중 하나)",
              "diffPoints": ["차별점 1", "차별점 2", "차별점 3"]
            },
            "faqs": [
              {
                "question": "구체적인 질문",
                "answer": "전문적인 답변"
              }
            ]
          },
          "curation": {
            "theme": "큐레이션 테마 제목"
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

      // 상품명/가격/수익 링크/이미지는 고정 목록 값으로 덮어쓰기 (AI가 지어낸 이미지 주소 방지)
      const product = {
        title: main.title,
        ...fullData.product,
        originalPrice: main.originalPrice,
        discountRate: main.discountRate,
        price: main.price,
        image: main.image || DEFAULT_IMAGE,
        searchKeyword: main.searchKeyword,
        link: main.link
      };
      product.title = main.title;

      const recommendations = others.map((p) => ({
        title: p.title,
        originalPrice: p.originalPrice,
        discountRate: p.discountRate,
        price: p.price,
        image: p.image || DEFAULT_IMAGE,
        searchKeyword: p.searchKeyword,
        link: p.link
      }));

      // 1. 메인 제품 데이터 저장
      fs.writeFileSync(productFilePath, JSON.stringify(product, null, 2));

      // 2. 큐레이션 데이터 저장 (메인 상품 정보 포함)
      const curationData = {
        theme: (fullData.curation && fullData.curation.theme) || "오늘의 맥북 추천",
        mainProduct: {
          title: product.title,
          originalPrice: product.originalPrice,
          discountRate: product.discountRate,
          price: product.price,
          image: product.image,
          searchKeyword: product.searchKeyword,
          link: product.link
        },
        recommendations
      };
      fs.writeFileSync(curationFilePath, JSON.stringify(curationData, null, 2));

      // 3. 홍보글 텍스트 저장 (대가성 문구를 맨 앞에 표시)
      const promoText = `
${DISCLOSURE}

[Money-Maker AI 오늘의 추천 데이터]

메인 상품: ${product.title}
구매 링크: ${product.link}
테마: ${curationData.theme}

[SNS 홍보 문구]
인스타그램: ${fullData.promo.instagram}
유튜브 쇼츠: ${fullData.promo.shorts}
블로그/커뮤니티: ${fullData.promo.blog}

상세 정보 확인: https://m-maker-ai.vercel.app
      `.trim();

      fs.writeFileSync(promoFilePath, promoText);
      console.log(`✅ 생성 및 큐레이션 완료 (${modelId}): ${product.title}`);

      // 디스코드 알림 발송
      try {
        const discordUrl = process.env.DISCORD_WEBHOOK_URL;
        if (discordUrl) {
          console.log("🔔 디스코드 알림 발송 중...");
          const discordContent = {
            content: `🚀 **[Money-Maker AI] 오늘의 추천 상품 업데이트**\n\n**메인 상품:** ${product.title}\n**가격:** ${product.price}원\n**링크:** ${product.link}\n**테마:** ${curationData.theme}\n\n👉 사이트 확인: https://m-maker-ai.vercel.app`
          };
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          await fetch(discordUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordContent),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          console.log("✨ 디스코드 알림 성공!");
        }
      } catch (dsError) {
        console.error("❌ 디스코드 알림 실패:", dsError.message);
      }

      // 인스타그램 자동 포스팅
      try {
        console.log("📸 인스타그램 자동 포스팅 시도 중...");
        const businessId = process.env.INSTAGRAM_BUSINESS_ID;
        const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

        if (businessId && accessToken) {
          const imageUrl = product.image;
          const caption = `${DISCLOSURE}\n\n${fullData.promo.instagram}\n\n👉 상세 정보 및 최저가 확인: https://m-maker-ai.vercel.app\n#쿠팡파트너스 #맥북 #추천템`;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000);

          const containerRes = await fetch(
            `https://graph.facebook.com/v19.0/${businessId}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${accessToken}`,
            { method: 'POST', signal: controller.signal }
          );
          const containerData = await containerRes.json();

          if (containerData.id) {
            const publishRes = await fetch(
              `https://graph.facebook.com/v19.0/${businessId}/media_publish?creation_id=${containerData.id}&access_token=${accessToken}`,
              { method: 'POST', signal: controller.signal }
            );
            const publishData = await publishRes.json();
            clearTimeout(timeoutId);
            if (publishData.id) {
              console.log("✨ 인스타그램 자동 포스팅 성공! ID:", publishData.id);
            } else {
              console.error("❌ 인스타그램 게시 실패:", publishData.error?.message);
            }
          } else {
            clearTimeout(timeoutId);
            console.error("❌ 인스타그램 미디어 컨테이너 생성 실패:", containerData.error?.message);
          }
        } else {
          console.warn("⚠️ 인스타그램 설정(ID/Token)이 없어 자동 포스팅을 건너뜁니다.");
        }
      } catch (igError) {
        console.error("❌ 인스타그램 자동화 과정 중 오류 발생:", igError.message);
      }

      return true;
    } catch (err) {
      console.error(`❌ ${modelId} 호출 실패:`, err.message || err);
      if (modelId === modelsToTry[modelsToTry.length - 1]) throw err;
    }
  }
  } catch (error) {
    console.error("❌ 생성 중 오류 발생 (모든 모델 실패):");
    console.error("상세 에러:", error.message || error);
    process.exit(1);
  }
}

generateDailyPost();

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function generateProductReview(productName, productDescription) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    다음 제품에 대해 SEO에 최적화된 프리미엄 제품 리뷰 콘텐츠를 한국어로 작성해줘.
    제품명: ${productName}
    제품 설명: ${productDescription}

    응답은 반드시 아래의 JSON 형식으로만 작성해줘:
    {
      "title": "눈길을 사로잡는 강력한 제목",
      "subtitle": "제품의 핵심 가치를 담은 짧은 부제목",
      "summary": "AI가 분석한 핵심 요약 (3문장 이내)",
      "pros": ["장점 1", "장점 2", "장점 3"],
      "cons": ["단점 1", "단점 2"],
      "detailedReview": "마치 실제 전문가가 사용해본 것 같은 상세하고 신뢰감 있는 리뷰 본문 (마크다운 형식 포함)",
      "targetAudience": "이 제품이 가장 필요한 사람들에 대한 설명",
      "conclusion": "최종 구매 권장 여부 및 한 줄 평"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON 부분만 추출 (가끔 마크다운 ```json 코드 블록이 포함될 수 있음)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid AI response format");
  } catch (error) {
    console.error("AI Generation Error:", error);
    return null;
  }
}

module.exports = { generateProductReview };

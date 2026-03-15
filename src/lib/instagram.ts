/**
 * 인스타그램 포스팅 자동화 스크립트 (Meta Graph API 사용)
 * 
 * 필요 환경 변수:
 * - INSTAGRAM_BUSINESS_ID: 인스타그램 비즈니스 계정 ID
 * - INSTAGRAM_ACCESS_TOKEN: Meta 개발자 앱에서 발급받은 액세스 토큰
 */

export async function postToInstagram(imageUrl: string, caption: string) {
  const businessId = process.env.INSTAGRAM_BUSINESS_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!businessId || !accessToken) {
    console.warn("Instagram credentials missing. Skipping post.");
    return { success: false, error: "Credentials missing" };
  }

  try {
    // 1. 미디어 컨테이너 생성 (이미지 업로드 예약)
    const containerRes = await fetch(
      `https://graph.facebook.com/v19.0/${businessId}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${accessToken}`,
      { method: 'POST' }
    );
    const containerData = await containerRes.json();
    
    if (containerData.error) throw new Error(containerData.error.message);

    const creationId = containerData.id;

    // 2. 미디어 게시 확정
    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${businessId}/media_publish?creation_id=${creationId}&access_token=${accessToken}`,
      { method: 'POST' }
    );
    const publishData = await publishRes.json();

    if (publishData.error) throw new Error(publishData.error.message);

    console.log("Instagram post success:", publishData.id);
    return { success: true, id: publishData.id };
  } catch (error: any) {
    console.error("Instagram post failed:", error.message);
    return { success: false, error: error.message };
  }
}

import fs from 'fs';
import path from 'path';

export async function getLatestProduct() {
  try {
    // 1. 로컬 파일 시도 (개발 환경)
    const filePath = path.join(process.cwd(), '../src/data/product.json');
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    }
    
    // 2. 공개 URL 시도 (Vercel 배포 환경)
    // 메인 사이트의 product.json URL을 직접 호출합니다.
    const PUBLIC_DATA_URL = "https://money-maker-ai.vercel.app/src/data/product.json";
    const res = await fetch(PUBLIC_DATA_URL, { next: { revalidate: 3600 } });
    if (res.ok) {
        return await res.json();
    }
    
    return null;
  } catch (error) {
    console.error("Failed to fetch product data from any source:", error);
    return null;
  }
}

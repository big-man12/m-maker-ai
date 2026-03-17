import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateDailyPost } from './generate-daily-post.mjs';

import { generateDailyPost } from './generate-daily-post.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productFilePath = path.join(__dirname, '../src/data/product.json');
const curationFilePath = path.join(__dirname, '../src/data/curation.json');

async function checkProductAvailability(keyword) {
  try {
    const searchUrl = `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`;
    console.log(`🔍 검사 중: ${keyword} ...`);
    
    // 단순 fetch는 쿠팡에서 차단될 가능성이 높으나, 
    // GitHub Actions의 IP가 차단되지 않았다면 "검색 결과가 없습니다" 문구 체크 가능
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15초 타임아웃

    const response = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.google.com/'
      }
    });
    
    clearTimeout(timeoutId);

    if (response.status === 403 || response.status === 429) {
      console.warn(`⚠️ [차단] 쿠팡 접속이 차단되었습니다 (Status: ${response.status}). 유효성 검사를 건너뜁니다.`);
      return true; // 차단 시에는 일단 안전하게 true 반환
    }

    const html = await response.text();
    
    // 1. 검색 결과 없음 판단
    if (html.includes('검색결과가 없습니다') || html.includes('검색 결과가 없어서') || response.status === 404) {
      console.warn(`⚠️ [실종] ${keyword} 상품이 검색 결과에 없습니다.`);
      return false;
    }
    
    // 2. 가격 정보 및 품절 상태 상세 판단
    // 쿠팡의 가격 클래스(price-value)가 존재하는지 확인
    const hasPrice = html.includes('class="price-value"') || html.includes("class='price-value'");
    const isOutOfStock = html.includes('일시품절') || html.includes('품절된 상품') || html.includes('out-of-stock');

    if (!hasPrice || isOutOfStock) {
      console.warn(`⚠️ [품절/가격미비] ${keyword} 상품의 가격 정보가 없거나 품절 상태입니다.`);
      return false;
    }
    
    console.log(`✅ [정상] ${keyword} 상품 판매 중.`);
    return true;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`❌ 타임아웃 (${keyword}): 쿠팡 응답 지연으로 검사 중단.`);
    } else {
      console.error(`❌ 검사 실패 (${keyword}):`, error.message);
    }
    // 에러 발생 시 재생성하지 않도록 보호
    return true; 
  }
}

async function verifyAndRefresh() {
  console.log("🛠️ 상품 실시간 유효성 상시 검사 시작...");
  
  if (!fs.existsSync(productFilePath)) return;
  
  const product = JSON.parse(fs.readFileSync(productFilePath, 'utf8'));
  const curation = JSON.parse(fs.readFileSync(curationFilePath, 'utf8'));
  
  const keywordsToCheck = [
    product.searchKeyword || product.title,
    ...(curation.recommendations.map(r => r.searchKeyword || r.title))
  ];
  
  let needsRefresh = false;
  
  for (const keyword of keywordsToCheck) {
    const isAvailable = await checkProductAvailability(keyword);
    if (!isAvailable) {
      needsRefresh = true;
      break;
    }
  }
  
  if (needsRefresh) {
    console.log("♻️ 상품 부재 감지됨. 즉시 AI 상품 갱신을 실행합니다...");
    const success = await generateDailyPost();
    if (success) {
      console.log("✅ 신규 상품군으로 갱신 완료!");
    } else {
      console.error("❌ 신규 상품 갱신 실패");
    }
  } else {
    console.log("✅ 모든 상품이 정상적으로 노출 중입니다.");
  }
}

verifyAndRefresh();

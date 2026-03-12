const axios = require('axios');
const crypto = require('crypto');

class CoupangAPI {
  constructor() {
    this.accessKey = process.env.COUPANG_ACCESS_KEY;
    this.secretKey = process.env.COUPANG_SECRET_KEY;
    this.afid = process.env.COUPANG_AFID;
    this.host = 'https://api-gateway.coupang.com';
  }

  generateHmac(method, url, secretKey, accessKey) {
    const parts = url.split('?');
    const path = parts[0];
    const query = parts[1] || '';
    
    const datetime = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '').substring(0, 15) + 'Z';
    const message = datetime + method + path + query;
    const signature = crypto.createHmac('sha256', secretKey).update(message).digest('hex');
    
    return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`;
  }

  async searchProducts(keyword) {
    if (!this.accessKey || !this.secretKey || this.accessKey === '' || this.secretKey === '') {
      console.warn("Coupang API keys are missing. Please set them in .env after approval.");
      return [{ name: "승인 대기 중인 샘플 제품", price: 0, link: "#" }];
    }

    const path = `/v2/providers/openapi/apis/api/v4/products/search`;
    const query = `keyword=${encodeURIComponent(keyword)}&limit=10`;
    const url = `${path}?${query}`;
    
    const authorization = this.generateHmac('GET', url, this.secretKey, this.accessKey);

    try {
      const response = await axios.get(`${this.host}${url}`, {
        headers: { 'Authorization': authorization }
      });
      return response.data.data.productData;
    } catch (error) {
      console.error("Coupang API Search Error:", error);
      return [];
    }
  }
}

module.exports = new CoupangAPI();

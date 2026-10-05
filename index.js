// 05/10/2026: yêu cầu từ VN có lúc rơi vào Cloudflare Hồng Kông (colo=HKG) → Anthropic trả 403 "Request not allowed" (vùng không được phục vụ).
// Worker này chạy ở Singapore ([placement] trong wrangler.toml) và chỉ chuyển tiếp nguyên yêu cầu sang api.anthropic.com —
// khoá x-api-key do app gửi kèm (secret ANTHROPIC_API_KEY của từng project Pages), Worker không giữ khoá nào.
// Header x-claude-colo = máy chủ Cloudflare đã gọi Anthropic, lấy từ đuôi cf-ray (req.cf.colo chỉ là chỗ iPad vào) — soát: phải là SIN, không phải HKG.
export default {
  async fetch(req) {
    const u = new URL(req.url);
    const r = await fetch('https://api.anthropic.com' + u.pathname + u.search, req);
    const h = new Headers(r.headers);
    h.set('x-claude-colo', r.headers.get('cf-ray')?.split('-')[1] || '?');   // đuôi cf-ray = máy chủ Cloudflare nơi Worker này gọi Anthropic
    return new Response(r.body, { status: r.status, headers: h });
  },
};

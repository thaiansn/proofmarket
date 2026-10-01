/*
 * ProofMarket site configuration — the ONE place to change runtime settings.
 * 站点配置 —— 运行时设置只需改这一个文件。
 *
 * Easiest: run ./set-domain.sh from the site root; it updates this file AND the
 * copies of these values baked into the HTML (canonical / Open Graph / sitemap / contact links).
 * 推荐：在站点根目录运行 ./set-domain.sh，它会同时更新本文件和 HTML 中的对应值。
 */
window.PROOFMARKET_CONFIG = {
  // TODO: your final public URL, no trailing slash. e.g. "https://proofmarket.io"
  //       or a GitHub project site "https://<user>.github.io/<repo>".
  // TODO：网站最终网址，结尾不要加 /。
  SITE_URL: "https://thaiansn.github.io/proofmarket",

  // Public contact address, shown on the site and used as the mailto: fallback recipient.
  // 公开联系邮箱：显示在网站上，也是“表单未配置/发送失败”时邮件备用方案的收件人。
  CONTACT_EMAIL: "thaigore@gmail.com",

  // TODO: Formspree-compatible endpoint, e.g. "https://formspree.io/f/abcdwxyz".
  // Leave empty ("") to use the mailto: fallback (form opens the visitor's email app, prefilled).
  // TODO：Formspree 兼容的表单地址；留空则使用邮件备用方案（打开访客的邮件客户端并预填内容）。
  FORM_ENDPOINT: ""
};

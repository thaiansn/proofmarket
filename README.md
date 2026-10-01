# ProofMarket 静态站（上线版）

小型软件项目（SaaS / AI 工具 / App / 数字产品 / Newsletter）交易试点市场的静态网站。
纯 HTML/CSS/JS，**无需构建、无需服务器、无需登录**，可直接部署到 GitHub Pages 或 Cloudflare Pages。中英双语（右上角切换，或在网址后加 `?lang=zh` / `?lang=en`）。

---

## 一、上线前需要填写的 3 个值

全部集中在 `assets/config.js`，用 `set-domain.sh` 一条命令即可同步到所有页面（canonical、Open Graph、sitemap、robots、联系邮箱链接）。

| 值 | 当前值 | 作用 | 什么时候填 |
|---|---|---|---|
| `SITE_URL` | `https://example.com`（**占位，待填**） | 网站正式网址，用于 canonical / 分享卡片 / sitemap / robots / 404 页 | 买好域名、或拿到 `*.github.io` / `*.pages.dev` 网址之后 |
| `CONTACT_EMAIL` | `thaigore@gmail.com`（已设置） | 网站上公开显示的联系邮箱；表单未配置或发送失败时，作为“邮件备用方案”的收件人 | 已填好；如需更换（例如换成域名邮箱）再运行脚本 |
| `FORM_ENDPOINT` | `""`（空，**待填**） | 表单提交地址（Formspree 兼容）。为空时，表单会打开访客的邮件客户端并预填全部内容，发送到 `CONTACT_EMAIL` | 注册 Formspree 并拿到表单地址后 |

```bash
# 在站点根目录运行（macOS / Linux / Windows 的 Git Bash 均可，需要 perl —— 系统一般自带）
./set-domain.sh --site https://你的域名.com
./set-domain.sh --endpoint https://formspree.io/f/你的表单ID
./set-domain.sh --email 新邮箱@你的域名.com     # 可选
./set-domain.sh --show                           # 查看当前值
./set-domain.sh --endpoint ""                    # 恢复为邮件备用方案
```

脚本可重复运行（每次读取 `assets/config.js` 里的当前值再替换）。如果 `--site` 是根域名（不是 github.io / pages.dev），脚本会自动生成 `CNAME` 文件（GitHub Pages 自定义域名需要）。

### 另外需要手动填写：运营主体信息
`terms.html`、`privacy.html`、`contact.html`、`about.html` 中有**黄色高亮的 `[TODO: …]`** 字段：运营主体名称、注册地址、城市/国家、邮箱服务商、适用法律/管辖地。用编辑器搜索 `TODO:` 逐个替换即可（每个字段中英文各一份，替换整个 `<span class="todo-fill">…</span>`）。
`terms.html` / `privacy.html` 顶部各有一条“网站所有者：请填写 TODO”的提示框（`<div class="notice">`），填完后删除。
> 条款与隐私政策是试点版草稿，**在收取任何费用前请找专业人士审阅**。

---

## 二、表单如何工作（无需自己的服务器）

- **卖家申请**：`apply.html`（姓名、邮箱、微信选填、项目名称、网址、类别、月均收入、月均利润、期望售价、收入证明类型、补充说明、同意条款）。
- **买家意向**：`buy.html`（姓名、邮箱、预算范围、感兴趣类别、补充说明、同意隐私政策）。
- 配置了 `FORM_ENDPOINT` 时：用 `fetch` 以 JSON 方式 POST（Formspree AJAX 格式），根据返回结果显示**真实的**成功或失败提示；失败时自动提供“改用邮件发送”按钮 + 可复制的全文。
- 未配置时：打开访客的邮件客户端，预填收件人（`CONTACT_EMAIL`）、主题和全部字段；同时页面上显示全文和“复制”按钮，以防邮件客户端没有弹出。
- 含隐藏的防垃圾字段 `_gotcha`（Formspree 原生支持）。
- 邮件主题示例：`ProofMarket seller application: 项目名` / `ProofMarket buyer interest: 姓名 (预算)`；提交内容带 `form_type`（seller / buyer）字段，方便在 Formspree 后台区分。

### 配置 Formspree（约 5 分钟，需你本人注册）
1. 打开 https://formspree.io 注册（免费版每月有提交数量上限，以官网为准）。
2. 新建一个表单（New Form），通知邮箱填 `thaigore@gmail.com`（或你想收件的邮箱），并按提示验证邮箱。
3. 复制表单地址，形如 `https://formspree.io/f/abcdwxyz`。
4. 运行 `./set-domain.sh --endpoint https://formspree.io/f/abcdwxyz`，重新部署。
5. 在 Formspree 表单设置里，可把网站域名加入允许的来源（Allowed domains / restrict to domain），减少滥用。
6. 上线后用两个表单各提交一次测试，确认邮箱能收到。

> 任何兼容“POST JSON → 返回 2xx 且 `{ "ok": true }`”的服务都可以替代 Formspree（如 Getform、Basin 等），只需改 `FORM_ENDPOINT`。

---

## 三、部署

### 方案 A：GitHub Pages
1. 在 GitHub 新建仓库（例如 `proofmarket`），把本文件夹**里面的所有文件**（包括 `.nojekyll`）上传到仓库根目录。
2. 仓库 Settings → Pages → Source 选 “Deploy from a branch”，Branch 选 `main`、目录 `/ (root)`，保存。
3. 几分钟后得到网址：`https://<用户名>.github.io/proofmarket/`。
   - 没有自定义域名时：运行 `./set-domain.sh --site https://<用户名>.github.io/proofmarket`，提交并推送。
4. 绑定自定义域名：
   - 运行 `./set-domain.sh --site https://你的域名.com`（会生成 `CNAME` 文件），提交推送；
   - 在域名 DNS 处添加记录：根域名添加 4 条 A 记录：`185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153`（以 GitHub 官方文档 “Managing a custom domain for your GitHub Pages site” 为准），`www` 用 CNAME 指向 `<用户名>.github.io`；
   - 回到 Settings → Pages 填写自定义域名并勾选 “Enforce HTTPS”。

### 方案 B：Cloudflare Pages
1. Cloudflare 控制台 → Workers & Pages → Create → Pages。
2. 两种方式任选：
   - **直接上传**：选 “Upload assets”，把本文件夹拖进去；
   - **连接 Git**：选择上面的 GitHub 仓库；Framework preset 选 “None”，Build command **留空**，Build output directory 填 `/`。
3. 部署后得到 `https://<项目名>.pages.dev`，运行 `./set-domain.sh --site https://<项目名>.pages.dev` 后重新部署。
4. 自定义域名：项目 → Custom domains → Set up a custom domain，按提示添加 DNS 记录；然后运行 `./set-domain.sh --site https://你的域名.com` 并重新部署（Cloudflare 会忽略 `CNAME` 文件，无影响）。
5. `404.html` 会被 Cloudflare Pages 和 GitHub Pages 自动用作“页面不存在”页面。

### 上线后
- 在 Google Search Console（以及 Bing Webmaster）提交 `https://你的域名.com/sitemap.xml`。
- 用 https://www.opengraph.xyz 之类的工具检查分享卡片（图片：`assets/og-image.png`）。

---

## 四、中国大陆访问说明
- 字体已改为**本地托管**（`assets/fonts/`），不再请求 Google Fonts，大陆访问更快；中文使用系统字体。
- `*.github.io` 和 `*.pages.dev` 在大陆的访问稳定性无法保证，建议绑定自有域名。服务器在境外、不收款的静态站一般不涉及 ICP 备案，但具体请自行确认。
- Formspree 在大陆的可用性未经验证；若提交失败，访客会看到“改用邮件发送”的备用方案，内容不会丢失。
- 网站公开了 `thaigore@gmail.com`，可能收到垃圾邮件；之后可换成域名邮箱，用 `--email` 一键替换。

---

## 五、本地预览
```bash
cd proofmarket-launch
python3 -m http.server 8765
# 浏览器打开 http://localhost:8765/
```

## 六、文件结构
```
index.html          首页：试点横幅、流程、6 个示例挂牌（已标注“示例 · 非在售”）、买卖双方入口、联系
review.html         流程（人工核验、核验说明、90 天挂牌、人工牵线、不托管）
pricing.html        价格（试点免费；未来标准价 $99 一次性，目前不收费；买家免费；不收佣金）
apply.html          卖家申请表
buy.html            买家意向表
contact.html        联系页（邮箱 + 运营主体 TODO）
about.html / privacy.html / terms.html
businesses/*.html   6 个虚构示例挂牌详情页
404.html            页面不存在
sitemap.xml / robots.txt / favicon.svg / favicon.ico / apple-touch-icon.png
assets/config.js    ★ 唯一配置文件（SITE_URL / CONTACT_EMAIL / FORM_ENDPOINT）
assets/app.js       语言切换、筛选、表单提交逻辑
assets/data.js      示例挂牌数据
assets/styles.css / fonts.css / fonts/ / og-image.png
set-domain.sh       一键替换脚本
.nojekyll           让 GitHub Pages 原样发布文件
```

## 七、修改内容
- 示例挂牌卡片数据：`assets/data.js`；详情页：`businesses/*.html`。
- 第一个真实挂牌上线时：首页“已核验的真实挂牌：0 个”的提示需要同步修改。
- 所有可见文字都是中英成对出现：`<span class="i18n-en">English</span><span class="i18n-zh">中文</span>`，修改时两边都改。

# EchoHex

KeepHope2901 的黑白极客个人网站。零依赖、无构建，拆成 5 个独立页面，所有可见文案、链接、颜色和开关都集中在 `assets/js/site.config.js`。

这次从原来的单页长页面改成了精简结构：

- **5 个页面**：`index.html` / `about.html` / `work.html` / `links.html` / `contact.html`
- **去掉**：肖像、统计、终端 profile、Now、工具跑马灯、视觉档案、GitHub 矩阵、项目封面、筛选器、案例弹窗、时钟、返回顶部
- **保留**：大标题排版、行列表、每日一言、About 时间线、页面切换动画
- **配置化**：`site.config.js` 按 12 个分区组织，页面本身只保留空壳

## 快速预览

```bash
python -m http.server 4173
```

打开 `http://127.0.0.1:4173/`。

不要直接双击 HTML。这个站点是配置驱动、客户端渲染的，需要 HTTP 服务和 JavaScript。

## 文件结构

```text
EchoHex/
├─ index.html              HOME
├─ about.html              ABOUT
├─ work.html               WORK
├─ links.html              LINKS
├─ contact.html            CONTACT
├─ README.md
├─ LICENSE
├─ robots.txt
├─ sitemap.xml
├─ preview.png / preview-mobile.png
├─ assets/
│  ├─ css/style.css        排版、颜色变量、响应式、页面转场
│  ├─ js/site.config.js    所有个性化内容（12 个分区）
│  ├─ js/site.js           布局、页面渲染、一言、菜单、转场
│  ├─ data/github-projects.js  GitHub 仓库数据（脚本生成）
│  ├─ fonts/               Geist / Geist Mono
│  ├─ favicon.svg
│  ├─ og.png
│  └─ og-source.html       OG 图源文件，noindex
└─ scripts/
   └─ fetch-github.py      抓取全部 GitHub 仓库（Windows / Linux）
```

## 配置分区

打开 [assets/js/site.config.js](assets/js/site.config.js)，按注释编号改：

| 分区 | 内容 |
|---|---|
| `01 meta` | 站点名、站长、标题、描述、关键词、域名、OG 图 |
| `02 theme` | 背景、文字、灰色、分割线、正文字体、等宽字体 |
| `03 person` | 姓名、角色、邮箱、地点、时区 |
| `04 nav` | 5 个页面的标签、中文名、文件名、序号 |
| `05 socials` | GitHub、Bilibili、QQ、邮箱、Steam |
| `06 home` | 首页 prompt、标题、简介、状态、精选区标题/链接、每日一言 |
| `07 about` | About 标题、正文、Facts、时间线、签名、链接 |
| `08 work` | Work 页标题、说明、GitHub 账号、数据文件、首页精选仓库名 |
| `09 links` | OWNED / FRIENDS 两组链接、交换友链入口 |
| `10 contact` | 联系页标题、说明、邮箱标签、社交标题、状态 |
| `11 footer` | 版权、构建说明、灵感来源 |
| `12 ui` | 页面转场、一言、精选、时间线、Facts、社交、状态开关；界面文案 |

### 常见修改

- **改名字/邮箱/地点**：只改 `03 person`。导航、About、Contact、页脚和 JSON-LD 会自动跟着变。
- **改颜色**：改 `02 theme` 的 `bg` / `fg` / `dim` / `muted` / `line` / `lineStrong`。值会写入 CSS 变量。
- **改字体**：改 `02 theme` 的 `sans` / `mono`。站内仍预加载 Geist；换字体时记得同步替换 `assets/fonts/` 和 `style.css` 的 `@font-face`。
- **改首页精选**：改 `08 work.github.featured`，填 GitHub 仓库名，最多建议 3 个。
- **改 Work 项目**：Work 页不再维护手写项目列表，直接读 `assets/data/github-projects.js`；改 `08 work.github.username` 后运行抓取脚本即可。
- **改友链/网站**：改 `09 links.groups`。自建站点按标题显示，点击整行跳转；Friends 目前只保留星月 Fox。
- **改 Steam 等社交**：改 `05 socials`，Contact 页和首页会同步。
- **关掉某个模块**：改 `12 ui` 里的 `showQuote` / `showFeatured` / `showTimeline` / `showFacts` / `showExchange` / `showSocials` / `showStatus` / `pageTransition`。
- **改导航文案**：改 `04 nav` 的 `label` / `cn`。页面文件名也在这里，改文件名时同步重命名 HTML。
- **中文词组不拆行**：在配置文字里用 `{{词组}}` 包住词组，例如 `做{{小工具}}`、`{{终端}}`。渲染时会变成 `white-space: nowrap` 的 span；不加也能正常显示，只是在某些宽度可能被拆开。
- **界面字号**：`assets/css/style.css` 末尾的 `Type scale` 区块统一放大了英文标签、导航、页脚和元信息；要整体再调，改那里即可。

## GitHub 项目抓取

Work 页展示 **GitHub 全部公开仓库**，不再使用手写项目描述，也没有展开详情。每个仓库显示：

- 仓库名（整行可点击，跳转 GitHub）
- GitHub 上该仓库的原始 description
- 语言和 star 数（来自 GitHub API）

配置和更新：

1. 打开 `assets/js/site.config.js`，在 `08 work.github` 里填 `username`。
2. 运行脚本：

   ```bash
   # Windows
   python scripts/fetch-github.py

   # Linux / macOS
   python3 scripts/fetch-github.py
   ```

3. 脚本会读取 `site.config.js` 的 `work.github.username` 和 `work.github.data`，抓取全部公开仓库，按最近推送排序，写入 `assets/data/github-projects.js`。
4. 刷新页面。数据是静态的，页面运行时不请求 GitHub API，所以打开速度快，也不会遇到客户端限流。

可选：GitHub 未登录 API 每小时 60 次请求，通常够用。如果仓库很多或频繁抓取，设置 `GITHUB_TOKEN`：

```bash
# Windows PowerShell
$env:GITHUB_TOKEN="ghp_xxx"; python scripts/fetch-github.py

# Linux / macOS
GITHUB_TOKEN=ghp_xxx python3 scripts/fetch-github.py
```

脚本只依赖 Python 标准库，兼容 Windows 和 Linux；不需要 npm、Node 或任何第三方包。`assets/data/github-projects.js` 是生成文件，不要手改。

## 页面转场

`site.js` 拦截同源的 `.html` 链接：

1. 点击后先显示全屏过场，写入目标页面的序号、英文名、中文名。
2. 480ms 后跳转。
3. 新页面的主内容用 0.55s 淡入上移。
4. `prefers-reduced-motion: reduce` 下不显示过场，直接跳转。

外链、`mailto:`、`#` 锚点不会被拦截。

## 每日一言

首页底部保留一个小型每日一言：

- API：`https://v1.hitokoto.cn/`，地址在 `06 home.quote.endpoint`
- 首屏先显示 `fallback`，不会出现空白或骨架屏
- 当天缓存到 `localStorage` 的 `echohex:quote:v1`
- 请求 2 秒超时，失败保留 fallback，状态显示 `LOCAL`
- “换一句”会重新请求并覆盖当天缓存
- 状态只显示 `LIVE` / `CACHED` / `LOCAL` / `SYNCING`，没有大块加载动画

## 主题与字体

- 颜色和字体栈全部从 `02 theme` 写入 CSS 变量。
- 页面默认仍使用自托管的 **Geist** / **Geist Mono**。
- 字体许可见 [assets/fonts/OFL.txt](assets/fonts/OFL.txt)。

## SEO 与渲染方式

页面正文由 `site.js` 在浏览器里渲染，配置集中在 `site.config.js`。运行时 `site.js` 会更新：

- `<title>`（例如 `ABOUT / EchoHex`）
- `meta description` / `keywords` / `author` / `theme-color`
- `canonical`
- Open Graph / Twitter 卡片
- Person JSON-LD

五个 HTML 的 `<head>` 里保留了站点级的静态 title/meta 作为无 JS 抓取的回退，运行时会被 `site.js` 用配置覆盖；它们不包含各页正文。**如果 SEO 是硬要求**，建议在部署前加一个简单的预渲染步骤，或把 `site.js` 的渲染逻辑迁移到构建时。当前版本优先保证配置简单和页面切换体验。

## 部署

纯静态，无构建命令。

- **GitHub Pages**：把全部文件推到 `yujianxi666.github.io` 仓库根目录。这个仓库目前是一个跳转页，部署前先备份或替换。
- **Vercel / Netlify**：Framework 选 Other，Build command 留空，Output directory 设为 `.`。
- **自有服务器**：放到任意静态 Web 根目录。

发布前检查：

- [ ] `site.config.js` 的 `meta.url`、canonical、`sitemap.xml`、`robots.txt` 是否指向最终域名
- [ ] 5 个 HTML 的静态 title/meta 是否还保留着旧域名（运行时会被覆盖，但抓取回退会用到）
- [ ] 重新生成 `assets/og.png`（如果用 `assets/og-source.html` 截图）
- [ ] 确认 QQ / Bilibili / Steam 链接仍然有效
- [ ] 如果 GitHub 项目有更新，重新运行 `scripts/fetch-github.py`
- [ ] 如果部署在需要备案的域名上，再补 ICP 信息

## 内容来源与说明

站长资料、社交链接、站点列表和项目来自 KeepHope2901 的公开主页与 GitHub：

- 旧主页：https://yujianxi666.github.io/（跳转到 `blog.u2504830.nyat.app:35698`）
- GitHub：https://github.com/yujianxi666

几点说明：

- 旧主页里有一处 `QuantumCat` 欢迎文案，和站点标题、GitHub 的 `KeepHope2901` 不一致；本版统一使用 **KeepHope2901**。
- Work 页的项目名和 description 直接来自 GitHub API；BRIEF / BUILD / OUTCOME 手写案例已经去掉。
- 旧主页的 ICP 备案号没有默认写进页脚，因为备案与具体域名绑定。
- Friends 只保留 `星月 Fox`；Steam 已放到 Contact 的 SOCIALS 区。
- 参考站 Hakadao 的 AI 助手和照片墙没有迁移；侧重点仍是黑白排版、项目列表和页面转场。

## 许可

- 站点代码：MIT，见 [LICENSE](LICENSE)
- Geist / Geist Mono：SIL Open Font License 1.1，见 [assets/fonts/OFL.txt](assets/fonts/OFL.txt)
- 个人资料和项目内容版权归 KeepHope2901

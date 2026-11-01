/* ==========================================================================
   EchoHex / site.config.js
   --------------------------------------------------------------------------
   所有个性化内容都在这里。按编号找分区，改完刷新即可。
   不需要构建，不需要改 HTML。

   中文排版小技巧：用 {{词组}} 包住不想被拆行的词，
   例如 {{小工具}}、{{终端}}；渲染时会变成不可断行的 span。

   01 META      站点信息
   02 THEME     颜色与字体
   03 PERSON    个人信息
   04 NAV       导航
   05 SOCIALS   社交链接
   06 HOME      首页
   07 ABOUT     关于
   08 WORK      项目
   09 LINKS     网站 / 友链
   10 CONTACT   联系
   11 FOOTER    页脚
   12 UI        开关和界面文案
   ========================================================================== */

window.SITE = {
  /* 01 META / 站点信息 ---------------------------------------------------- */
  meta: {
    lang: "zh-CN",
    name: "EchoHex",
    title: "EchoHex / KeepHope2901",
    description: "KeepHope2901 的个人网站：一些有意思的小玩意。",
    keywords: "KeepHope2901, yujianxi666, EchoHex, 个人网站, 武汉, Web, Android",
    url: "https://yujianxi666.github.io/",
    ogImage: "https://yujianxi666.github.io/assets/og.png"
  },

  /* 02 THEME / 颜色与字体 ------------------------------------------------- */
  theme: {
    bg: "#050505",
    fg: "#f2f2ee",
    dim: "#a7a7a1",
    muted: "#6f6f69",
    line: "#1f1f1f",
    lineStrong: "#30302d",
    sans: '"Geist", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
    mono: '"Geist Mono", "SFMono-Regular", "Cascadia Code", "Microsoft YaHei", monospace'
  },

  /* 03 PERSON / 个人信息 -------------------------------------------------- */
  person: {
    name: "KeepHope2901",
    role: "Developer / Tinkerer",
    email: "3557665817@qq.com",
    location: "Wuhan, CN",
    timezone: "Asia/Shanghai",
  },

  /* 04 NAV / 导航 --------------------------------------------------------- */
  nav: [
    { id: "home", index: "00", label: "HOME", cn: "首页", href: "index.html" },
    { id: "about", index: "01", label: "ABOUT", cn: "关于", href: "about.html" },
    { id: "work", index: "02", label: "WORK", cn: "项目", href: "work.html" },
    { id: "links", index: "03", label: "LINKS", cn: "链接", href: "links.html" },
    { id: "contact", index: "04", label: "CONTACT", cn: "联系", href: "contact.html" }
  ],

  /* 05 SOCIALS / 社交链接 ------------------------------------------------- */
  socials: [
    {
      label: "GITHUB",
      handle: "@yujianxi666",
      href: "https://github.com/yujianxi666"
    },
    {
      label: "BILIBILI",
      handle: "UID 3546566348507776",
      href: "https://space.bilibili.com/3546566348507776"
    },
    {
      label: "QQ",
      handle: "找我问好",
      href: "https://qm.qq.com/q/1fBTqibXD2"
    },
    {
      label: "EMAIL",
      handle: "3557665817@qq.com",
      href: "mailto:3557665817@qq.com"
    },
    {
      label: "STEAM",
      handle: "KeepHope2901",
      href: "https://steamcommunity.com/id/KeepHope2901/"
    }
  ],

  /* 06 HOME / 首页 -------------------------------------------------------- */
  home: {
    eyebrow: "KEEP HOPE 2901 / WUHAN, CN",
    prompt: "keep@hope:~$ whoami",
    title: ["I'm ", "2901"],
    lead: "写一些有意思的小玩意...",
    intro:
      "我是 KeepHope2901,喜欢折腾一些小玩意。",
    status: "BUILDING SMALL THINGS",
    featuredTitle: "SELECTED WORK",
    featuredLink: { label: "VIEW ALL", href: "work.html" },
    quote: {
      label: "DAILY SIGNAL / 每日一言",
      endpoint: "https://v1.hitokoto.cn/?encode=json&charset=utf-8&c=d&c=i&c=k",
      fallback: {
        text: "凡是过往，皆为序章。",
        from: "暴风雨",
        who: "莎士比亚"
      }
    },
    socialsLabel: "ELSEWHERE / 别处"
  },

  /* 07 ABOUT / 关于 ------------------------------------------------------- */
  about: {
    kicker: "01 / ABOUT / 关于",
    title: "ABOUT",
    lead: "我是 KeepHope2901,个人开发者",
    paragraphs: [
      "喜欢折腾电脑，系统和一切科技相关的事物。",
      "目标是做有意思的东西。",
      "本站建立于 21 世纪，存活于互联网的{{边缘}}。"
    ],
    factsTitle: "FACTS / 信息",
    facts: [
      { k: "BASE", v: "Wuhan, CN" },
      { k: "FOCUS", v: "Web / Android / Tools" },
      { k: "STATUS", v: "Building small things" },
      { k: "EMAIL", v: "3557665817@qq.com", href: "mailto:3557665817@qq.com" }
    ],
    timelineTitle: "TIMELINE / 时间线",
    timeline: [
      {
        year: "2026.10",
        role: "FLOTUNE / 车机音乐",
        place: "ANDROID / KOTLIN",
        description: "给横屏 Android 车机做的悬浮窗音乐控制，作为自用工具维护。",
        current: true
      },
      {
        year: "2026.09",
        role: "MIKU-REMOVE / 10 STARS",
        place: "DEBIAN / PYTHON",
        description: "卸载时播放《初音ミクの消失》的 Debian 包。",
        current: false
      },
      {
        year: "2025.08",
        role: "PERSONAL SITE / 个人主页上线",
        place: "BLOG / 2901",
        description: "把散落的链接和折腾的东西收进一个主页。",
        current: false
      },
      {
        year: "2024.02",
        role: "GITHUB / 开始公开折腾",
        place: "WUHAN, CN",
        description: "注册 GitHub，把自用工具和实验陆续放到公开的地方。",
        current: false
      }
    ],
    signature: "KEEP HOPE 2901 / WUHAN / 2026",
    links: [
      { label: "GITHUB", href: "https://github.com/yujianxi666" },
      { label: "SELECTED WORK", href: "work.html" }
    ]
  },

  /* 08 WORK / 项目 -------------------------------------------------------- */
  work: {
    kicker: "02 / WORK / 项目",
    title: "SELECTED WORK",
    lead: "我的github项目",
    empty: "还没有抓取 GitHub 项目。运行 python scripts/fetch-github.py 后刷新。",
    github: {
      username: "yujianxi666",
      data: "assets/data/github-projects.js",
      featured: ["miku-remove", "FloTune", "LitestartCE"],
      label: "OPEN GITHUB"
    }
  },

  /* 09 LINKS / 网站与友链 ------------------------------------------------ */
  links: {
    kicker: "03 / LINKS / 链接",
    title: "LINKS",
    lead: "自己做的站点。",
    groups: [
      {
        label: "OWNED / 自建",
        items: [
          {
            name: "HomePage",
            href: "index.html",
            domain: "yujianxi666.github.io"
          },
          {
            name: "起始页",
            href: "https://yujianxi666.github.io/LitestartCE/",
            domain: "yujianxi666.github.io/LitestartCE"
          },
          {
            name: "Music！",
            href: "https://blog.u2504830.nyat.app:35698/PlaylistBoard/index.html",
            domain: "blog.u2504830.nyat.app/PlaylistBoard"
          },
          {
            name: "Game~",
            href: "https://blog.u2504830.nyat.app:35698/GameBoard/",
            domain: "blog.u2504830.nyat.app/GameBoard"
          },
          {
            name: "写点什么~",
            href: "https://blog.u2504830.nyat.app:35698/MarkdownEditer/",
            domain: "blog.u2504830.nyat.app/MarkdownEditer"
          },
          {
            name: "webOS",
            href: "https://blog.u2504830.nyat.app:35698/htmIOS/",
            domain: "blog.u2504830.nyat.app/htmIOS"
          },
          {
            name: "webMC",
            href: "https://blog.u2504830.nyat.app:35698/webmc/",
            domain: "blog.u2504830.nyat.app/webmc"
          }
        ]
      },
      {
        label: "FRIENDS / 朋友",
        items: [
          {
            name: "星月 Fox",
            href: "https://xingyuefox.pages.dev/",
            domain: "xingyuefox.pages.dev"
          }
        ]
      }
    ],
    exchange: {
      kicker: "Contact! / 联系我！",
      text: "写封邮件！",
      label: "SEND A LINK",
      href: "mailto:3557665817@qq.com?subject=HI"
    }
  },

  /* 10 CONTACT / 联系 ----------------------------------------------------- */
  contact: {
    kicker: "04 / CONTACT / 联系",
    title: "CONTACT",
    lead: "有项目、合作，或者只是想说声嗨，都可以{{写信}}。",
    emailLabel: "EMAIL / 邮箱",
    socialsTitle: "SOCIALS / 社交",
    note: "NO FORM. NO NEWSLETTER. JUST A REAL INBOX.",
    status: "BUILDING SMALL THINGS / 2026"
  },

  /* 11 FOOTER / 页脚 ------------------------------------------------------ */
  footer: {
    copyright: "© 2025 - 2026 KEEP HOPE 2901",
    note: "BUILT WITH HTML / CSS / JS",
    credit: {
      label: "無限进步！",
      href: ""
    }
  },

  /* 12 UI / 开关与界面文案 ------------------------------------------------ */
  ui: {
    pageTransition: true,
    showQuote: true,
    showFeatured: true,
    showTimeline: true,
    showFacts: true,
    showExchange: true,
    showSocials: true,
    showStatus: true,
    labels: {
      menu: "MENU",
      close: "CLOSE",
      copyEmail: "COPY EMAIL",
      copied: "COPIED",
      refresh: "换一句",
      routing: "ECHOHEX / ROUTING",
      local: "LOCAL",
      cached: "CACHED",
      live: "LIVE",
      syncing: "SYNCING",
      repos: "REPOS"
    }
  }
};

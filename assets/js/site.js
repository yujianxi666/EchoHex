(function () {
  "use strict";

  var S = window.SITE;
  var doc = document;
  var html = doc.documentElement;

  if (!S || !S.meta) {
    doc.body.innerHTML =
      '<p style="padding:32px;font-family:monospace;color:#f2f2ee">site.config.js 未加载。</p>';
    return;
  }

  var pageId = html.getAttribute("data-page") || "home";
  var page = S.nav.filter(function (item) {
    return item.id === pageId;
  })[0] || S.nav[0];
  var isHome = page.id === "home";
  var labels = S.ui.labels || {};
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var route = null;
  var routeBusy = false;

  function $(selector, root) {
    return (root || doc).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || doc).querySelectorAll(selector));
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function rich(value) {
    var text = String(value == null ? "" : value);
    return text
      .split(/(\{\{[^{}]+\}\})/g)
      .map(function (part) {
        if (/^\{\{[^{}]+\}\}$/.test(part)) {
          return '<span class="nowrap">' + esc(part.slice(2, -2)) + "</span>";
        }
        return esc(part);
      })
      .join("");
  }

  function pad(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function external(href) {
    return /^https?:/i.test(href);
  }

  function linkAttrs(href) {
    return external(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
  }

  function pageUrl(id) {
    var base = String(S.meta.url || "").replace(/\/+$/, "") + "/";
    if (id === "home") return base;
    var item = S.nav.filter(function (nav) {
      return nav.id === id;
    })[0];
    return base + (item ? item.href : "");
  }

  function sourceText(item) {
    return [item.from, item.who].filter(Boolean).join(" / ");
  }

  /* ----------------------------------------------------------------------
     Meta
     ---------------------------------------------------------------------- */

  function setMeta(attrName, attrValue, content) {
    var node = doc.head.querySelector("meta[" + attrName + '="' + attrValue + '"]');
    if (!node) {
      node = doc.createElement("meta");
      node.setAttribute(attrName, attrValue);
      doc.head.appendChild(node);
    }
    node.setAttribute("content", content);
  }

  function initTheme() {
    var theme = S.theme || {};
    var map = {
      bg: "--bg",
      fg: "--fg",
      dim: "--dim",
      muted: "--muted",
      line: "--line",
      lineStrong: "--line-2",
      sans: "--sans",
      mono: "--mono"
    };
    Object.keys(map).forEach(function (key) {
      if (theme[key]) html.style.setProperty(map[key], theme[key]);
    });
  }

  function initMeta() {
    var title = isHome ? S.meta.title : page.label + " / " + S.meta.name;
    var url = pageUrl(page.id);

    html.setAttribute("lang", S.meta.lang || "zh-CN");
    doc.title = title;

    var description = doc.head.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", S.meta.description);

    var canonical = doc.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = doc.createElement("link");
      canonical.setAttribute("rel", "canonical");
      doc.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    setMeta("property", "og:title", title);
    setMeta("property", "og:description", S.meta.description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", S.meta.ogImage);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", S.meta.description);
    setMeta("name", "twitter:image", S.meta.ogImage);
    setMeta("name", "theme-color", (S.theme && S.theme.bg) || "#050505");
    setMeta("name", "author", S.person.name);
    setMeta("name", "keywords", S.meta.keywords || "");

    var personLd = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: S.person.name,
      alternateName: S.meta.name,
      url: S.meta.url,
      image: S.meta.ogImage,
      jobTitle: S.person.role || "",
      description: S.meta.description,
      email: S.person.email,
      address: S.person.location,
      sameAs: (S.socials || [])
        .filter(function (social) {
          return /^https?:/i.test(social.href);
        })
        .map(function (social) {
          return social.href;
        })
    };
    var ld = doc.createElement("script");
    ld.type = "application/ld+json";
    ld.textContent = JSON.stringify(personLd);
    doc.head.appendChild(ld);
  }

  /* ----------------------------------------------------------------------
     Shared markup
     ---------------------------------------------------------------------- */

  function socialLinks(withHandle) {
    return (S.socials || [])
      .map(function (social) {
        return (
          '<a class="social-link" href="' +
          esc(social.href) +
          '"' +
          linkAttrs(social.href) +
          '><span>' +
          esc(social.label) +
          "</span>" +
          (withHandle && social.handle
            ? '<span class="social-link__handle">' + esc(social.handle) + "</span>"
            : "") +
          '<span aria-hidden="true">↗</span></a>'
        );
      })
      .join("");
  }

  function pageHead(content) {
    return (
      '<header class="page-head">' +
      '<p class="kicker mono">' +
      esc(content.kicker) +
      "</p>" +
      '<h1 class="page-title">' +
      esc(content.title) +
      "</h1>" +
      (content.lead ? '<p class="page-lead">' + rich(content.lead) + "</p>" : "") +
      "</header>"
    );
  }

  function sectionLine(title, count) {
    return (
      '<div class="section-line"><h2 class="mono">' +
      esc(title) +
      "</h2>" +
      (count ? '<span class="count mono">' + esc(count) + "</span>" : "") +
      "</div>"
    );
  }

  function renderHeader() {
    var header = $("[data-header]");
    if (!header) return;

    var nav = S.nav
      .filter(function (item) {
        return item.id !== "home";
      })
      .map(function (item) {
        var active = item.id === page.id;
        return (
          '<a class="nav__link' +
          (active ? " is-active" : "") +
          '" href="' +
          esc(item.href) +
          '"' +
          (active ? ' aria-current="page"' : "") +
          '><span class="nav__idx">' +
          esc(item.index) +
          "</span>" +
          esc(item.label) +
          "</a>"
        );
      })
      .join("");

    header.innerHTML =
      '<div class="shell header__inner">' +
      '<a class="brand" href="index.html">' +
      '<span class="brand__mark" aria-hidden="true">+</span>' +
      '<span class="brand__name">' +
      esc(S.meta.name) +
      "</span></a>" +
      '<nav class="nav" aria-label="主导航">' +
      nav +
      "</nav>" +
      '<button class="menu-btn" type="button" data-menu-open aria-expanded="false" aria-controls="site-menu">' +
      "<span>" +
      esc(labels.menu || "MENU") +
      "</span>" +
      '<span class="menu-btn__icon" aria-hidden="true"><i></i><i></i></span>' +
      "</button>" +
      "</div>";
  }

  function renderFooter() {
    var footer = $("[data-footer]");
    if (!footer) return;

    var nav = S.nav
      .map(function (item) {
        return (
          '<a href="' +
          esc(item.href) +
          '"' +
          (item.id === page.id ? ' aria-current="page"' : "") +
          ">" +
          esc(item.label) +
          "</a>"
        );
      })
      .join("");

    footer.innerHTML =
      '<div class="shell footer__inner">' +
      '<div class="footer__top">' +
      '<a class="footer__brand" href="index.html">' +
      esc(S.meta.name) +
      "</a>" +
      '<nav class="footer__nav" aria-label="页脚导航">' +
      nav +
      "</nav>" +
      "</div>" +
      '<div class="footer__bottom">' +
      "<span>" +
      esc(S.footer.copyright) +
      "</span>" +
      "<span>" +
      esc(S.footer.note) +
      "</span>" +
      '<a href="' +
      esc(S.footer.credit.href) +
      '" target="_blank" rel="noopener noreferrer">' +
      esc(S.footer.credit.label) +
      "</a>" +
      "</div>" +
      "</div>";
  }

  function renderMenu() {
    var dialog = doc.createElement("dialog");
    dialog.className = "menu-dialog";
    dialog.id = "site-menu";
    dialog.setAttribute("aria-label", "站内导航");

    var items = S.nav
      .map(function (item) {
        var active = item.id === page.id;
        return (
          '<a href="' +
          esc(item.href) +
          '"' +
          (active ? ' class="is-active" aria-current="page"' : "") +
          '><span class="menu__idx mono">' +
          esc(item.index) +
          '</span><span class="menu__label">' +
          esc(item.label) +
          '</span><span class="menu__cn mono">' +
          esc(item.cn) +
          "</span></a>"
        );
      })
      .join("");

    dialog.innerHTML =
      '<div class="menu__top">' +
      '<span class="menu__brand">' +
      esc(S.meta.name) +
      "</span>" +
      '<button class="menu__close" type="button" data-menu-close>' +
      esc(labels.close || "CLOSE") +
      "</button>" +
      "</div>" +
      '<nav class="menu__nav" aria-label="移动端导航">' +
      items +
      "</nav>" +
      '<p class="menu__foot mono">' +
      esc(S.person.name) +
      " / " +
      esc(S.person.location) +
      "</p>";

    doc.body.appendChild(dialog);
    return dialog;
  }

  function initMenu(dialog) {
    var open = $("[data-menu-open]");
    var close = $("[data-menu-close]", dialog);
    if (!open || !dialog || !close) return;

    if (typeof dialog.showModal !== "function") {
      open.hidden = true;
      return;
    }

    open.addEventListener("click", function () {
      dialog.showModal();
      html.classList.add("is-menu-open");
      open.setAttribute("aria-expanded", "true");
      close.focus();
    });

    close.addEventListener("click", function () {
      dialog.close();
    });

    dialog.addEventListener("close", function () {
      html.classList.remove("is-menu-open");
      open.setAttribute("aria-expanded", "false");
      open.focus();
    });
  }

  /* ----------------------------------------------------------------------
     Home
     ---------------------------------------------------------------------- */

  function homePage() {
    var home = S.home;
    var repos = githubRepos();
    var names = (S.work.github && S.work.github.featured) || [];
    var featured = names
      .map(function (name) {
        return repos.filter(function (repo) {
          return repo.name === name;
        })[0];
      })
      .filter(Boolean);

    if (!featured.length) {
      featured = repos.slice(0, 3);
    }

    var featuredRows = featured
      .map(function (repo, index) {
        return (
          '<a class="featured-row" href="work.html">' +
          '<span class="featured-row__idx mono">' +
          pad(index + 1) +
          "</span>" +
          '<span class="featured-row__title">' +
          esc(repo.name) +
          "</span>" +
          '<span class="featured-row__meta mono">' +
          esc(repo.language || "GITHUB") +
          "</span>" +
          '<span class="featured-row__arrow" aria-hidden="true">↗</span>' +
          "</a>"
        );
      })
      .join("");

    var socials =
      S.ui.showSocials !== false
        ? '<div class="home__socials">' +
          '<p class="section-label mono">' +
          esc(home.socialsLabel) +
          "</p>" +
          '<div class="social-links">' +
          socialLinks(false) +
          "</div></div>"
        : "";

    var featuredBlock =
      S.ui.showFeatured !== false && featured.length
        ? '<section class="home__featured">' +
          '<div class="section-line"><h2 class="mono">' +
          esc(home.featuredTitle) +
          '</h2><a class="text-link" href="' +
          esc(home.featuredLink.href) +
          '">' +
          esc(home.featuredLink.label) +
          ' <span aria-hidden="true">↗</span></a></div>' +
          '<div class="featured-list">' +
          featuredRows +
          "</div></section>"
        : "";

    return (
      '<div class="home">' +
      '<p class="home__prompt mono"><span>' +
      esc(home.prompt) +
      '</span><span class="caret" aria-hidden="true"></span></p>' +
      '<p class="home__eyebrow mono">' +
      esc(home.eyebrow) +
      "</p>" +
      '<h1 class="home__title"><span>' +
      esc(home.title[0]) +
      '</span><span class="dim">' +
      esc(home.title[1]) +
      "</span></h1>" +
      '<p class="home__lead">' +
      rich(home.lead) +
      "</p>" +
      '<div class="home__body">' +
      '<div class="home__intro-wrap"><p class="home__intro">' +
      rich(home.intro) +
      "</p>" +
      (S.ui.showStatus !== false
        ? '<p class="home__status mono"><span class="dot"></span>' + esc(home.status) + "</p>"
        : "") +
      socials +
      "</div>" +
      featuredBlock +
      "</div>" +
      (S.ui.showQuote !== false && home.quote ? quoteBlock(home.quote) : "") +
      "</div>"
    );
  }

  function quoteBlock(quote) {
    return (
      '<section class="quote" data-quote aria-labelledby="quote-label">' +
      '<div class="quote__head"><p class="mono" id="quote-label">' +
      esc(quote.label) +
      '</p><span class="quote__status mono" data-quote-status>' +
      esc(labels.local || "LOCAL") +
      "</span></div>" +
      '<blockquote class="quote__body" aria-live="polite">' +
      '<p data-quote-text>' +
      rich(quote.fallback.text) +
      "</p>" +
      "<footer><cite data-quote-source>" +
      esc(sourceText(quote.fallback) || "HITOKOTO") +
      "</cite></footer>" +
      "</blockquote>" +
      '<button class="quote__refresh" type="button" data-quote-refresh>' +
      esc(labels.refresh || "换一句") +
      ' <span aria-hidden="true">↗</span></button>' +
      "</section>"
    );
  }

  /* ----------------------------------------------------------------------
     About
     ---------------------------------------------------------------------- */

  function aboutPage() {
    var about = S.about;
    var facts =
      S.ui.showFacts !== false
        ? '<aside class="facts">' +
          '<h2 class="section-label mono">' +
          esc(about.factsTitle) +
          "</h2><dl>" +
          about.facts
            .map(function (fact) {
              return (
                "<div><dt class=\"mono\">" +
                esc(fact.k) +
                "</dt><dd>" +
                (fact.href
                  ? '<a class="text-link" href="' + esc(fact.href) + '">' + rich(fact.v) + "</a>"
                  : rich(fact.v)) +
                "</dd></div>"
              );
            })
            .join("") +
          "</dl></aside>"
        : "";

    var timeline =
      S.ui.showTimeline !== false
        ? '<section class="timeline">' +
          '<h2 class="section-label mono">' +
          esc(about.timelineTitle) +
          "</h2><ol>" +
          about.timeline
            .map(function (item) {
              return (
                '<li class="timeline__item' +
                (item.current ? " is-current" : "") +
                '"><span class="timeline__year mono">' +
                esc(item.year) +
                '</span><div><p class="timeline__role">' +
                esc(item.role) +
                '</p><span class="timeline__place mono">' +
                esc(item.place) +
                '</span><p class="timeline__desc">' +
                rich(item.description) +
                "</p></div></li>"
              );
            })
            .join("") +
          "</ol></section>"
        : "";

    var links = about.links
      .map(function (item) {
        return (
          '<a class="text-link" href="' +
          esc(item.href) +
          '"' +
          linkAttrs(item.href) +
          ">" +
          esc(item.label) +
          ' <span aria-hidden="true">↗</span></a>'
        );
      })
      .join("");

    return (
      '<div class="page">' +
      pageHead(about) +
      '<div class="about__grid">' +
      '<div class="about__text">' +
      about.paragraphs
        .map(function (paragraph) {
          return "<p>" + rich(paragraph) + "</p>";
        })
        .join("") +
      '<p class="signature mono">' +
      esc(about.signature) +
      "</p>" +
      '<div class="page-links">' +
      links +
      "</div></div>" +
      facts +
      "</div>" +
      timeline +
      "</div>"
    );
  }

  /* ----------------------------------------------------------------------
     Work
     ---------------------------------------------------------------------- */

  function repoRow(repo, index) {
    var description = repo.description
      ? '<span class="repo-row__desc">' + rich(repo.description) + "</span>"
      : "";
    var meta = [
      repo.language || "",
      repo.stargazers_count ? repo.stargazers_count + " ★" : ""
    ]
      .filter(Boolean)
      .join(" / ");

    return (
      '<a class="repo-row" href="' +
      esc(repo.html_url) +
      '" target="_blank" rel="noopener noreferrer">' +
      '<span class="repo-row__idx mono">' +
      pad(index + 1) +
      "</span>" +
      '<span class="repo-row__body"><span class="repo-row__name">' +
      esc(repo.name) +
      "</span>" +
      description +
      "</span>" +
      '<span class="repo-row__meta mono">' +
      esc(meta) +
      "</span>" +
      '<span class="repo-row__arrow" aria-hidden="true">↗</span></a>'
    );
  }

  function workPage() {
    var work = S.work;
    var github = work.github || {};
    var repos = githubRepos();
    var rows = repos.map(repoRow).join("");
    var count = repos.length ? pad(repos.length) + " " + esc(labels.repos || "REPOS") : "";
    var head = repos.length
      ? '<div class="repo-head"><span class="mono">GITHUB / @' +
        esc(github.username || "") +
        '</span><span class="mono">' +
        count +
        "</span></div>"
      : "";
    var list = repos.length
      ? '<div class="repo-list">' + rows + "</div>"
      : '<p class="empty">' + esc(work.empty || "No repositories. Run the fetch script.") + "</p>";

    return (
      '<div class="page">' +
      pageHead(work) +
      head +
      list +
      '<p class="work__more"><a class="text-link" href="https://github.com/' +
      esc(github.username || "") +
      '" target="_blank" rel="noopener noreferrer">' +
      esc(github.label || "OPEN GITHUB") +
      ' <span aria-hidden="true">↗</span></a></p>' +
      "</div>"
    );
  }

  /* ----------------------------------------------------------------------
     Links
     ---------------------------------------------------------------------- */

  function linksPage() {
    var links = S.links;
    var groups = links.groups
      .map(function (group) {
        var rows = group.items
          .map(function (item, index) {
            return (
              '<a class="link-row" href="' +
              esc(item.href) +
              '"' +
              linkAttrs(item.href) +
              '><span class="link-row__idx mono">' +
              pad(index + 1) +
              '</span><span class="link-row__name">' +
              esc(item.name) +
              '</span><span class="link-row__domain mono">' +
              esc(item.domain) +
              ' <span aria-hidden="true">↗</span></span></a>'
            );
          })
          .join("");
        return (
          '<section class="link-group">' +
          sectionLine(group.label, pad(group.items.length)) +
          '<div class="link-list">' +
          rows +
          "</div></section>"
        );
      })
      .join("");

    var exchange =
      S.ui.showExchange !== false
        ? '<div class="exchange"><div><p class="mono">' +
          esc(links.exchange.kicker) +
          "</p><p>" +
          rich(links.exchange.text) +
          '</p></div><a class="button" href="' +
          esc(links.exchange.href) +
          '">' +
          esc(links.exchange.label) +
          ' <span aria-hidden="true">↗</span></a></div>'
        : "";

    return '<div class="page">' + pageHead(links) + groups + exchange + "</div>";
  }

  /* ----------------------------------------------------------------------
     Contact
     ---------------------------------------------------------------------- */

  function contactPage() {
    var contact = S.contact;
    var socials =
      S.ui.showSocials !== false
        ? '<div class="contact__socials"><h2 class="section-label mono">' +
          esc(contact.socialsTitle || "SOCIALS / 社交") +
          '</h2><div class="social-list">' +
          (S.socials || [])
            .map(function (social) {
              return (
                '<a class="social-row" href="' +
                esc(social.href) +
                '"' +
                linkAttrs(social.href) +
                '><span class="social-row__label mono">' +
                esc(social.label) +
                '</span><span class="social-row__handle">' +
                esc(social.handle || "") +
                '</span><span class="social-row__arrow" aria-hidden="true">↗</span></a>'
              );
            })
            .join("") +
          "</div></div>"
        : "";

    return (
      '<div class="page">' +
      pageHead(contact) +
      '<div class="contact__grid">' +
      '<div class="contact__email"><p class="mono">' +
      esc(contact.emailLabel) +
      '</p><a class="contact__mail" href="mailto:' +
      esc(S.person.email) +
      '">' +
      esc(S.person.email) +
      "</a>" +
      '<button class="copy-btn" type="button" data-copy="' +
      esc(S.person.email) +
      '">' +
      esc(labels.copyEmail || "COPY EMAIL") +
      "</button>" +
      '<p class="contact__note mono">' +
      rich(contact.note) +
      "</p></div>" +
      socials +
      "</div>" +
      (S.ui.showStatus !== false
        ? '<p class="contact__status mono"><span class="dot"></span>' + esc(contact.status) + "</p>"
        : "") +
      "</div>"
    );
  }

  /* ----------------------------------------------------------------------
     Render
     ---------------------------------------------------------------------- */

  function githubRepos() {
    return Array.isArray(window.GITHUB_PROJECTS) ? window.GITHUB_PROJECTS : [];
  }

  function renderMain() {
    var main = $("[data-main]");
    if (!main) return;

    var views = {
      home: homePage,
      about: aboutPage,
      work: workPage,
      links: linksPage,
      contact: contactPage
    };

    main.innerHTML = (views[page.id] || homePage)();
    main.classList.add("is-ready");
  }

  /* ----------------------------------------------------------------------
     Quote
     ---------------------------------------------------------------------- */

  function initQuote() {
    var root = $("[data-quote]");
    if (!root) return;

    var quote = S.home.quote;
    var textEl = $("[data-quote-text]", root);
    var sourceEl = $("[data-quote-source]", root);
    var statusEl = $("[data-quote-status]", root);
    var button = $("[data-quote-refresh]", root);
    var cacheKey = "echohex:quote:v1";

    function today() {
      try {
        return new Intl.DateTimeFormat("en-CA", {
          timeZone: S.person.timezone || "Asia/Shanghai",
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }).format(new Date());
      } catch (error) {
        var date = new Date();
        return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
      }
    }

    function apply(item, status) {
      if (!item || !item.text) return;
      textEl.textContent = item.text;
      sourceEl.textContent = sourceText(item) || "HITOKOTO";
      statusEl.textContent = status;
    }

    function readCache() {
      try {
        var item = JSON.parse(window.localStorage.getItem(cacheKey) || "null");
        if (item && item.date === today() && item.text) return item;
      } catch (error) {
        /* ignore */
      }
      return null;
    }

    function writeCache(item) {
      try {
        window.localStorage.setItem(cacheKey, JSON.stringify(item));
      } catch (error) {
        /* ignore */
      }
    }

    function fetchQuote(manual) {
      if (button.disabled) return;
      button.disabled = true;
      if (manual) statusEl.textContent = labels.syncing || "SYNCING";

      var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      var timer = window.setTimeout(function () {
        if (controller) controller.abort();
      }, 2000);

      fetch(quote.endpoint, controller ? { signal: controller.signal, cache: "no-store" } : { cache: "no-store" })
        .then(function (response) {
          if (!response.ok) throw new Error("HTTP " + response.status);
          return response.json();
        })
        .then(function (data) {
          window.clearTimeout(timer);
          var text = String(data.hitokoto || "").trim();
          if (!text) throw new Error("empty quote");
          var item = {
            text: text,
            from: data.from ? String(data.from) : "",
            who: data.from_who ? String(data.from_who) : "",
            date: today(),
            source: "hitokoto"
          };
          apply(item, labels.live || "LIVE");
          writeCache(item);
        })
        .catch(function () {
          window.clearTimeout(timer);
          statusEl.textContent = labels.local || "LOCAL";
        })
        .then(function () {
          button.disabled = false;
        });
    }

    apply(quote.fallback, labels.local || "LOCAL");
    var cached = readCache();
    if (cached) {
      apply(cached, labels.cached || "CACHED");
    } else {
      statusEl.textContent = labels.syncing || "SYNCING";
      fetchQuote(false);
    }

    button.addEventListener("click", function () {
      fetchQuote(true);
    });
  }

  /* ----------------------------------------------------------------------
     Copy email
     ---------------------------------------------------------------------- */

  function initCopy() {
    var button = $("[data-copy]");
    if (!button) return;

    var value = button.getAttribute("data-copy");
    var label = labels.copyEmail || "COPY EMAIL";
    var copied = labels.copied || "COPIED";

    function feedback() {
      button.textContent = copied;
      window.setTimeout(function () {
        button.textContent = label;
      }, 1600);
    }

    function fallback() {
      var textarea = doc.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      doc.body.appendChild(textarea);
      textarea.select();
      try {
        if (doc.execCommand("copy")) feedback();
      } catch (error) {
        /* ignore */
      }
      doc.body.removeChild(textarea);
    }

    button.addEventListener("click", function () {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(feedback).catch(fallback);
      } else {
        fallback();
      }
    });
  }

  /* ----------------------------------------------------------------------
     Page transition
     ---------------------------------------------------------------------- */

  function initRoute() {
    if (S.ui.pageTransition === false) return;

    route = doc.createElement("div");
    route.className = "route";
    route.setAttribute("aria-hidden", "true");
    route.innerHTML =
      '<span class="route__idx mono"></span>' +
      '<strong class="route__label"></strong>' +
      '<span class="route__cn mono"></span>' +
      '<span class="route__line" aria-hidden="true"></span>' +
      '<span class="route__foot mono">' +
      esc(labels.routing || "ECHOHEX / ROUTING") +
      "</span>";
    doc.body.appendChild(route);

    var total = S.nav.filter(function (item) {
      return item.id !== "home";
    }).length;

    function show(item) {
      $(".route__idx", route).textContent = item.index + " / " + pad(total);
      $(".route__label", route).textContent = item.label;
      $(".route__cn", route).textContent = item.cn;
      route.classList.add("is-active");
      html.classList.add("is-routing");
    }

    doc.addEventListener("click", function (event) {
      if (reduced.matches || routeBusy) return;
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      var anchor = event.target.closest ? event.target.closest("a") : null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;

      var href = anchor.getAttribute("href");
      if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|javascript:)/i.test(href)) return;

      var url;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch (error) {
        return;
      }
      if (url.origin !== window.location.origin) return;

      var file = url.pathname.split("/").pop() || "index.html";
      if (!/\.html$/.test(file)) return;

      var target = S.nav.filter(function (item) {
        return item.href === file;
      })[0];
      if (!target) return;

      event.preventDefault();
      routeBusy = true;
      show(target);

      window.setTimeout(function () {
        window.location.href = url.href;
      }, reduced.matches ? 0 : 480);
    });

    window.addEventListener("pageshow", function () {
      routeBusy = false;
      if (route) route.classList.remove("is-active");
      html.classList.remove("is-routing");
    });
  }

  /* ----------------------------------------------------------------------
     Init
     ---------------------------------------------------------------------- */

  function init() {
    initTheme();
    initMeta();
    renderHeader();
    renderFooter();

    var dialog = renderMenu();
    renderMain();
    initMenu(dialog);
    initQuote();
    initCopy();
    initRoute();
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

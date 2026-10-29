/* Oltinko'l charm-poyabzal zonasi — sahifa ishlashi */
(() => {
  const S = window.SITE, T = S.t;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = n => Math.round(n).toLocaleString("ru-RU").replace(/\s/g, " ");
  const som = n => fmt(n) + " " + T.sum;
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let cyr = false;

  /* ---------- paydo bo'lish va raqamlar ---------- */
  function countUp(el) {
    const target = parseFloat(el.dataset.count), txt = el.textContent, dec = (String(target).split(".")[1] || "").length;
    if (RM || !target) return;
    const sep = S.lang === "en" ? "," : " ", dot = S.lang === "en" ? "." : ",";
    const t0 = performance.now(), dur = 1400;
    const step = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3), v = target * e;
      el.textContent = p < 1 ? (dec ? v.toFixed(dec).replace(".", dot) : Math.round(v).toLocaleString("en-US").replace(/,/g, sep)) : txt;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => {
      let i = 0;
      es.forEach(e => {
        if (!e.isIntersecting) return;
        if (!RM) e.target.style.transitionDelay = Math.min(i++, 6) * 70 + "ms";   // qatordagi elementlar ketma-ket (stagger)
        e.target.classList.add("in"); io.unobserve(e.target);
        e.target.querySelectorAll("[data-count]").forEach(countUp);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    $$(".rv").forEach(el => io.observe(el));
  } else $$(".rv").forEach(el => el.classList.add("in"));

  /* ---------- menyu ---------- */
  const lock = () => { document.body.style.overflow = (!$("#drawer").hidden || ($("#search") && $("#search").open)) ? "hidden" : ""; };
  const bgEls = () => [$("header.top"), $("main"), $("footer"), $(".mbar")].filter(Boolean);
  const inertBg = on => bgEls().forEach(el => on ? el.setAttribute("inert", "") : el.removeAttribute("inert"));   // fokus faqat ochiq oynada qoladi
  const closeDrawer = () => { if ($("#drawer").hidden) return; $("#drawer").hidden = true; $("#burger").setAttribute("aria-expanded", "false"); inertBg(false); lock(); };
  function toast(t, err) { const el = $("#toast"); el.textContent = cyr ? toCyr(t) : t; el.classList.toggle("err", !!err); el.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => el.hidden = true, 2400); }
  function copy(text) { navigator.clipboard.writeText(text).then(() => toast(T.copied), () => toast(T.copy_fail, true)); }

  /* ---------- kredit: 20% / 18% / 5 yil, 1-yil faqat foiz, keyin 48 oy teng to'lov ---------- */
  function credit(v) {
    const first = v * .2, loan = v - first, r = .18 / 12, n = 48;
    const grace = Math.round(loan * r), month = Math.round(loan * r / (1 - Math.pow(1 + r, -n)));
    return { first, loan, grace, month, interest: grace * 12 + month * n - loan };
  }
  function setV(v, from) {
    if (!$("#cv")) return;
    v = Math.max(0, Math.min(v, 50e9));
    if (from !== "in") $("#cv").value = fmt(v);
    if (from !== "range") $("#cr").value = Math.min(2e9, Math.max(1e8, v));
    const c = credit(v);
    $("#o-first").textContent = som(c.first); $("#o-loan").textContent = som(c.loan);
    $("#o-grace").textContent = som(c.grace); $("#o-month").textContent = som(c.month);
    $("#o-int").textContent = som(c.interest); $("#o-all").textContent = som(v + c.interest);
    document.dispatchEvent(new CustomEvent("kredit", { detail: c }));
  }
  if ($("#cv")) {
    $("#cv").addEventListener("input", e => setV(+e.target.value.replace(/\D/g, "") || 0, "in"));
    $("#cv").addEventListener("blur", e => setV(+e.target.value.replace(/\D/g, "") || 0));
    $("#cr").addEventListener("input", e => setV(+e.target.value, "range"));
    setV(500000000);
  }

  /* ---------- do'konlar sxemasi (do'konlar sahifasida — panel bilan) ---------- */
  const SHOPS = Object.fromEntries(S.shops.map(s => [s.id, s]));
  const panel = $("#shopPanel");
  function pickShop(id, scroll) {
    const s = SHOPS[id]; if (!s || !panel) return;
    $$(".cell").forEach(g => g.classList.toggle("sel", g.dataset.shop === id));
    const c = credit(s.price);
    panel.innerHTML = `<span class="st ${s.free ? "free" : "sold"}">${s.free ? T.sh_free : T.sh_sold}</span>
      <h3 class="num">${esc(s.id)}</h3>
      <dl class="kv"><dt>${T.sh_area}</dt><dd class="num">${s.area} m²</dd><dt>${T.sh_price}</dt><dd class="num">${som(s.price)}</dd>
      ${s.free ? `<dt>${T.sh_first}</dt><dd class="num">${som(c.first)}</dd><dt>${T.sh_month}</dt><dd class="num">${som(c.month)}</dd>` : ""}</dl>
      ${s.free ? `<div class="acts"><a class="btn" href="#ariza" data-shopapply="${esc(s.id)}">${T.sh_apply}</a><a class="btn ghost" href="${s.url}">${T.sh_page}</a></div>` : `<p style="color:var(--ink-3)">${T.sh_soldnote}</p>`}`;
    after(panel);
    if (scroll && innerWidth < 1080) panel.scrollIntoView({ block: "nearest", behavior: RM ? "auto" : "smooth" });
  }
  if (panel) {
    $$(".plan .cell").forEach(a => a.addEventListener("click", e => { e.preventDefault(); pickShop(a.dataset.shop, true); }));
    const first = S.shops.find(s => s.free); if (first && innerWidth >= 1080) pickShop(first.id, false);
  }

  /* ---------- lotin -> kirill (faqat o'zbekcha sahifalarda) ---------- */
  const ORIG = new WeakMap();
  const MAP = { a: "а", b: "б", d: "д", e: "е", f: "ф", g: "г", h: "ҳ", i: "и", j: "ж", k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", q: "қ", r: "р", s: "с", t: "т", u: "у", v: "в", x: "х", y: "й", z: "з", c: "с", w: "в" };
  function toCyr(s) {
    if (S.lang !== "uz") return s;
    const A = "[‘'ʻ`]";
    s = s.replace(/([Pp])oyabzal/g, (m, p) => (p === "P" ? "П" : "п") + "ойабзал").replace(/POYABZAL/g, "ПОЙАБЗАЛ");
    s = s.replace(/(^|[^A-Za-z‘'ʻ`’])e/g, "$1э").replace(/(^|[^A-Za-z‘'ʻ`’])E/g, "$1Э");
    s = s.replace(/([A-Za-z])[’ʼ](?=[A-Za-z])/g, "$1ъ");
    s = s.replace(/ksi(?=y)/g, "кци").replace(/tsi(?=y)/g, "ци");
    s = s.replace(new RegExp("O" + A, "g"), "Ў").replace(new RegExp("o" + A, "g"), "ў").replace(new RegExp("G" + A, "g"), "Ғ").replace(new RegExp("g" + A, "g"), "ғ");
    [["SH", "Ш"], ["Sh", "Ш"], ["sh", "ш"], ["CH", "Ч"], ["Ch", "Ч"], ["ch", "ч"], ["YO", "Ё"], ["Yo", "Ё"], ["yo", "ё"], ["YU", "Ю"], ["Yu", "Ю"], ["yu", "ю"], ["YA", "Я"], ["Ya", "Я"], ["ya", "я"], ["YE", "Е"], ["Ye", "Е"], ["ye", "е"]].forEach(([a, b]) => { s = s.split(a).join(b); });
    return s.replace(/[A-Za-z]/g, ch => { const lo = ch.toLowerCase(), m = MAP[lo] || ch; return ch === lo ? m : m.toUpperCase(); });
  }
  function translit(root, on) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest("script,style,[data-notr],.plan .id,.plan .ar,.sid,.press b") || !n.nodeValue.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(n => { if (on) { if (!ORIG.has(n)) ORIG.set(n, n.nodeValue); n.nodeValue = toCyr(ORIG.get(n)); } else if (ORIG.has(n)) n.nodeValue = ORIG.get(n); });
    root.querySelectorAll("[placeholder]").forEach(el => { if (on) { if (!el.dataset.ph) el.dataset.ph = el.placeholder; el.placeholder = toCyr(el.dataset.ph); } else if (el.dataset.ph) el.placeholder = el.dataset.ph; });
  }
  function after(el) { if (cyr) translit(el, true); }
  function setCyr(on) {
    if (S.lang !== "uz") return;
    cyr = on; translit(document.body, on);
    document.documentElement.lang = on ? "uz-Cyrl" : "uz-Latn";
    $$("#latBtn, .drawer .langs a:first-child").forEach(a => on ? a.removeAttribute("aria-current") : a.setAttribute("aria-current", "true"));
    $$("#cyrBtn, [data-cyr]").forEach(b => on ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current"));
  }

  /* ---------- do'konlar ro'yxati: filtr, saralash, «Yana yuklash». Holat URL'da — do'kon sahifasidan Orqaga qaytilganda tanlov saqlanadi ---------- */
  const sf = $("#sfilt");
  if (sf) {
    const tb = $(".stable tbody"), rows = [...tb.rows], more = $("#sfMore"), out = sf.querySelector(".sf-n"), empty = $(".sf-empty"), PAGE = 15, KEYS = ["b", "m", "p"];
    let shown = PAGE;
    const inBand = (v, band) => { const [a, b] = band.split("-"); return v >= a * 1e6 && (b === "" || v < b * 1e6); };
    const apply = () => {
      const fd = new FormData(sf), sel = Object.fromEntries(KEYS.map(k => [k, fd.getAll(k)])), s = fd.get("s") || "";
      const ok = rows.filter(r => (!sel.b.length || sel.b.includes(r.dataset.b)) && (!sel.m.length || sel.m.includes(r.dataset.m)) && (!sel.p.length || sel.p.some(b => inBand(+r.dataset.p, b))));
      const key = s.replace("-", ""), dir = s[0] === "-" ? -1 : 1;
      const list = s ? [...ok].sort((x, y) => dir * (x.dataset[key] - y.dataset[key])) : ok;
      rows.forEach(r => { r.hidden = true; });
      list.forEach((r, i) => { tb.appendChild(r); r.hidden = i >= shown; });
      more.hidden = list.length <= shown; empty.hidden = list.length > 0;
      out.textContent = out.dataset.t.replace("{n}", list.length); after(out);
      const q = new URLSearchParams();
      KEYS.forEach(k => { if (sel[k].length) q.set(k, sel[k].join(",")); }); if (s) q.set("s", s); if (shown > PAGE) q.set("n", shown);
      history.replaceState(history.state, "", location.pathname + (q.toString() ? "?" + q : "") + location.hash);
    };
    // URL'dan tiklash: faqat sahifadagi mavjud qiymatlar belgilanadi (boshqasi e'tiborsiz)
    const q0 = new URLSearchParams(location.search);
    KEYS.concat("s").forEach(k => { const v = (q0.get(k) || "").split(","); sf.querySelectorAll(`input[name="${k}"]`).forEach(i => { if (v.includes(i.value) && (k !== "s" || q0.has("s"))) i.checked = true; }); });
    shown = Math.min(rows.length, Math.max(PAGE, parseInt(q0.get("n"), 10) || PAGE));
    sf.hidden = false;
    sf.addEventListener("change", () => { shown = PAGE; apply(); });
    sf.addEventListener("submit", e => e.preventDefault());
    sf.addEventListener("reset", () => setTimeout(() => { shown = PAGE; apply(); }));
    more.addEventListener("click", () => { const first = shown; shown += PAGE; apply(); const r = [...tb.rows].filter(x => !x.hidden)[first]; if (r) r.querySelector("a").focus(); });
    apply();
  }

  /* ---------- 3D model (model-viewer): avval poster, model faqat ekranga yaqinlashganda; kuchsiz telefonda yengil fayl ---------- */
  const m3ds = $$(".m3d");
  if (m3ds.length && "IntersectionObserver" in window) {
    const lite = (navigator.connection && navigator.connection.saveData) || (navigator.deviceMemory || 8) <= 4 || matchMedia("(max-width: 700px)").matches;
    const mio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      mio.unobserve(e.target);
      const f = e.target, st = f.querySelector(".m3d-st"), img = st.querySelector("img");
      import(f.dataset.mv).then(() => {
        const MV = customElements.get("model-viewer");   // meshopt dekoderi o'zimizdan (standartda yo'q)
        if (!MV.meshoptDecoderLocation) MV.meshoptDecoderLocation = f.dataset.mv.replace("model-viewer.min.js", "meshopt_decoder.js");
        const mv = document.createElement("model-viewer");
        const a = { src: lite ? f.dataset.lite : f.dataset.glb, alt: f.dataset.alt, poster: img.currentSrc || img.src, "camera-orbit": f.dataset.orbit,
                    "camera-controls": "", "disable-zoom": "", "touch-action": "pan-y", "interaction-prompt": "none", "shadow-intensity": "1", "environment-image": "neutral" };
        if (!RM) Object.assign(a, { "auto-rotate": "", "auto-rotate-delay": "0", "rotation-per-second": "14deg" });
        for (const k in a) mv.setAttribute(k, a[k]);
        mv.addEventListener("load", () => st.classList.add("live"), { once: true });
        mv.addEventListener("pointerdown", () => st.classList.add("touched"), { once: true });
        st.append(mv);
      }).catch(() => {});   // yuklanmasa poster qoladi
    }), { rootMargin: "250px" });
    m3ds.forEach(f => mio.observe(f));
  }

  /* ---------- bosh sahifa: bosiladigan bosh reja ---------- */
  const zx = $("[data-zx]");
  if (zx) {
    const tabs = [...zx.querySelectorAll('[role="tab"]')], panels = [...zx.querySelectorAll(".zx-panel")];
    const pick = (k, focus) => {
      tabs.forEach(b => { const on = b.dataset.zxT === k; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
      panels.forEach(p => p.classList.toggle("on", p.dataset.zxT === k));
      zx.dataset.on = k;
    };
    tabs.forEach((b, i) => {
      b.addEventListener("click", () => pick(b.dataset.zxT));
      b.addEventListener("keydown", e => {
        const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return;
        e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length].dataset.zxT, true);
      });
    });
    zx.querySelectorAll(".zx-g").forEach(g => g.addEventListener("click", () => { pick(g.dataset.zxT); zx.classList.add("used"); }));
    pick("savdo");
  }

  /* ---------- ariza ---------- */
  const form = $("#form"), opened = Date.now();
  /* ---------- ariza: server bo'lmasa — Telegram / WhatsApp orqali to'g'ridan-to'g'ri direksiyaga ---------- */
  const SVG = p => '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + p + '</svg>';
  const IC_TG = SVG('<path d="M21 4 3 11l6 2 2 6 3-4 5 4z"/><path d="m9 13 8-6"/>');
  const IC_WA = SVG('<path d="M4 20l1.2-3.6A8 8 0 1 1 8 18.9z"/><path d="M9.2 8.6c.3 2.7 2.4 5 5.3 5.6l1.1-1.2 1.9.8-.3 1.7c-4 .4-8.4-3.7-8-7.9l1.7-.3.8 1.9z"/>');
  function formText() {
    const lines = [T.f_head + " — " + document.title];
    form.querySelectorAll("input[name], select[name], textarea[name]").forEach(el => {
      if (el.name === "website") return;
      const v = el.tagName === "SELECT" ? (el.value === "" ? "" : el.selectedOptions[0].text) : el.value.trim();
      if (!v || v === "+998") return;
      const lab = el.closest("label"), f = lab && lab.firstChild;
      lines.push((f && f.nodeType === 3 ? f.textContent.replace("*", "").trim() : el.name) + ": " + v);
    });
    lines.push(location.href);
    return lines.join("\n");
  }
  function via(r) {
    const txt = formText();
    r.className = "res via";
    r.innerHTML = "<p>" + esc(T.f_via) + '</p><div class="via-b"><a class="btn wa" href="https://wa.me/' + S.wa + "?text=" + encodeURIComponent(txt) + '" target="_blank" rel="noopener">' + IC_WA + esc(T.f_wa) + '</a><a class="btn tgb" href="' + S.tg + '" target="_blank" rel="noopener" data-tgcopy>' + IC_TG + esc(T.f_tg) + '</a></div><p class="via-h" hidden>' + esc(T.f_tg_hint) + "</p>";
    r.querySelector("[data-tgcopy]").addEventListener("click", () => { try { navigator.clipboard.writeText(txt); } catch (e) {} r.querySelector(".via-h").hidden = false; });
  }
  function prefill(need, type, text) {
    if (!form) return;
    if (need != null && need !== "") form.need.value = String(need);
    if (type) form.type.value = type;
    if (text) form.text.value = text;
    syncFancy();
  }
  // maydondan chiqqanda tekshiruv: yozilgan, lekin noto'g'ri bo'lsa darhol belgilanadi; tuzatilganda belgi o'chadi
  const okField = { name: v => !!v.trim(), tel: v => v.replace(/\D/g, "").length >= 12 };
  const mark = (el, bad) => {
    const desc = [el.name === "tel" && "f-tel-s", bad && "res"].filter(Boolean).join(" ");
    bad ? el.setAttribute("aria-invalid", "true") : el.removeAttribute("aria-invalid");
    desc ? el.setAttribute("aria-describedby", desc) : el.removeAttribute("aria-describedby");
  };
  if (form) Object.keys(okField).forEach(n => {
    const el = form.elements[n];
    el.addEventListener("blur", () => { if (n === "tel" ? el.value.replace(/\D/g, "").length > 3 : el.value !== "") mark(el, !okField[n](el.value)); });
    el.addEventListener("input", () => { if (el.hasAttribute("aria-invalid") && okField[n](el.value)) mark(el, false); });
  });
  if (form) form.addEventListener("submit", async e => {
    e.preventDefault();
    const r = $("#res"), data = Object.fromEntries(new FormData(form));
    r.hidden = false;
    if (data.website || Date.now() - opened < 2500) { r.className = "res"; r.textContent = T.f_ok; return; }   // bot
    // xato maydonlar belgilanadi, xabar ularga bog'lanadi, fokus birinchi xatoga (WCAG 3.3.1)
    const bad = Object.keys(okField).map(n => form.elements[n]).filter(el => !okField[el.name](el.value));
    Object.keys(okField).forEach(n => mark(form.elements[n], bad.includes(form.elements[n])));
    if (bad.length) { r.className = "res err"; r.textContent = T.f_err; after(r); bad[0].focus(); return; }
    delete data.website;
    data.need = form.need.selectedOptions[0].text; data.type = form.type.value ? form.type.selectedOptions[0].text : ""; data.page = location.href; data.lang = S.lang; data.ms = Date.now() - opened;
    if (S.endpoint) {
      try {
        const res = await fetch(S.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        if (!res.ok) throw 0;
        r.className = "res"; r.textContent = T.f_ok;
      } catch (err) { r.className = "res err"; r.textContent = T.f_fail + " " + S.phone; }
    } else via(r);
    if (r.className === "res") { form.reset(); form.tel.value = "+998 "; }
    after(r);
  });

  /* ---------- bosishlar ---------- */
  document.addEventListener("click", e => {
    const t = e.target;
    const act = t.closest("[data-act]");
    if (act) { if (act.dataset.act === "dclose") closeDrawer(); return; }
    const sf = t.closest("[data-sf]");
    if (sf) {
      const f = sf.dataset.sf;
      $$("[data-sf]").forEach(b => b.setAttribute("aria-pressed", b === sf));
      $$(".plan .cell").forEach(g => { const s = SHOPS[g.dataset.shop]; g.classList.toggle("dim", (f === "free" && !s.free) || (f === "sold" && s.free)); });
      return;
    }
    const sa = t.closest("[data-shopapply]");
    if (sa) { prefill(0, null, (S.lang === "uz" ? "Do‘kon " : S.lang === "ru" ? "Магазин " : "Unit ") + sa.dataset.shopapply); return; }
    const vac = t.closest("[data-vac]");
    if (vac) { prefill(3, "job", vac.dataset.vac); return; }
    const pv = t.closest("[data-v]"); if (pv) { setV(+pv.dataset.v); return; }
    const nd = t.closest("a[data-need], button[data-need]"); if (nd) prefill(nd.dataset.need, nd.dataset.type, nd.dataset.text);
    const cp = t.closest("[data-copy]"); if (cp) { copy(cp.dataset.copy); return; }
    if (t.closest("#copyReq")) { copy($$("#req dt").map((dt, i) => dt.textContent + ": " + $$("#req dd")[i].textContent).join("\n")); return; }
    if (t.closest("#cyrBtn, [data-cyr]")) { setCyr(!cyr); closeDrawer(); return; }
    if (t.closest("#latBtn") && cyr) { e.preventDefault(); setCyr(false); return; }
    if (t.closest("#burger")) { $("#drawer").hidden = false; $("#burger").setAttribute("aria-expanded", "true"); inertBg(true); lock(); $("#drawer .x").focus(); return; }
    if (t === $("#drawer") || t.closest(".drawer a")) closeDrawer();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#drawer").hidden) { e.preventDefault(); closeDrawer(); $("#burger").focus(); } });


  /* ---------- maxsus imkoniyatlar: harf o'lchami va oq-qora ---------- */
  (() => {
    const btn = $("#a11yBtn"), pan = $("#a11y"), root = document.documentElement;
    let fs = 0;
    try { fs = +(localStorage.getItem("oz_fs") || 0); if (localStorage.getItem("oz_gray") === "1") { root.classList.add("gray"); $("#grayBtn") && $("#grayBtn").setAttribute("aria-pressed", "true"); } } catch (e) {}
    const apply = () => { root.style.fontSize = fs ? (100 + fs * 12.5) + "%" : ""; document.body.style.fontSize = fs ? (17 * (1 + fs * .125)) + "px" : ""; };
    apply();
    // tugma footerda: panel yuqoridagi (yopishgan) headerda ochiladi va fokus unga o'tadi
    if (btn) btn.addEventListener("click", () => { const on = pan.hidden; pan.hidden = !on; btn.setAttribute("aria-expanded", on); if (on) pan.querySelector("button").focus(); });
    document.addEventListener("click", e => {
      const f = e.target.closest("[data-fs]");
      if (f) { const v = +f.dataset.fs; fs = v === 0 ? 0 : Math.max(-1, Math.min(2, fs + v)); apply(); try { localStorage.setItem("oz_fs", fs); } catch (err) {} }
      if (e.target.closest("#grayBtn")) { const on = root.classList.toggle("gray"); $("#grayBtn").setAttribute("aria-pressed", on); try { localStorage.setItem("oz_gray", on ? "1" : "0"); } catch (err) {} }
    });
  })();

  /* ---------- raqamlar yozilayotganda o'zi tartiblanadi: 1 000 000, +998 99 107 55 08 ---------- */
  function liveFmt(el, format) {
    el.addEventListener("input", () => {
      const old = el.value, pos = el.selectionStart, before = old.slice(0, pos).replace(/\D/g, "").length, atEnd = pos === old.length;
      el.value = format(old);
      if (atEnd || document.activeElement !== el) return;
      let i = 0, n = 0; const shift = el.value.replace(/\D/g, "").length - old.replace(/\D/g, "").length;
      while (i < el.value.length && n < before + Math.max(0, shift)) { if (/\d/.test(el.value[i])) n++; i++; }
      el.setSelectionRange(i, i);
    });
  }
  const telFmt = v => {
    let d = v.replace(/\D/g, "");
    if (!d.startsWith("998")) d = "998" + d;
    d = d.slice(0, 12);
    return "+998 " + [d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)].filter(Boolean).join(" ");
  };
  $$('input[type="tel"]').forEach(el => liveFmt(el, telFmt));
  $$("#cv, [data-money]").forEach(el => liveFmt(el, v => { const d = v.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 12); return d ? fmt(+d) : ""; }));

  /* ---------- tanlash ro'yxati: sayt uslubida (kompyuterda); telefonda — telefonning o'z oynasi ---------- */
  const fancy = [];
  function fancySelect(sel) {
    const wrap = document.createElement("div"); wrap.className = "fs";
    const btn = document.createElement("button"); btn.type = "button"; btn.className = "fs-btn"; btn.id = sel.id + "-btn";
    btn.setAttribute("aria-haspopup", "listbox"); btn.setAttribute("aria-expanded", "false");
    const lab = document.createElement("span"); lab.className = "fs-lab"; btn.appendChild(lab);
    btn.insertAdjacentHTML("beforeend", '<svg class="fs-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>');
    const list = document.createElement("ul"); list.className = "fs-list"; list.id = sel.id + "-list"; list.setAttribute("role", "listbox"); list.hidden = true; list.tabIndex = -1;
    btn.setAttribute("aria-controls", list.id);
    [...sel.options].forEach((o, i) => {
      const li = document.createElement("li"); li.setAttribute("role", "option"); li.id = sel.id + "-o" + i; li.dataset.i = i;
      li.textContent = o.textContent; if (o.value === "" && i === 0) li.classList.add("ph"); list.appendChild(li);
    });
    sel.parentNode.insertBefore(wrap, sel); wrap.append(sel, btn, list);
    sel.classList.add("fs-native"); sel.tabIndex = -1; sel.setAttribute("aria-hidden", "true");
    const label = sel.closest("label"); if (label) { label.htmlFor = btn.id; btn.setAttribute("aria-label", label.firstChild.textContent.trim()); }
    let act = 0;
    const items = () => [...list.children];
    const sync = () => {
      const o = sel.options[sel.selectedIndex]; lab.textContent = o ? o.textContent : "";
      btn.classList.toggle("ph", !o || (o.value === "" && sel.selectedIndex === 0));
      items().forEach((li, i) => li.setAttribute("aria-selected", i === sel.selectedIndex));
    };
    const mark = i => {
      act = Math.max(0, Math.min(i, items().length - 1)); items().forEach((li, k) => li.classList.toggle("act", k === act));
      list.setAttribute("aria-activedescendant", items()[act].id); items()[act].scrollIntoView({ block: "nearest" });
    };
    const open = () => {
      fancy.forEach(f => f !== api && f.close());
      list.hidden = false; btn.setAttribute("aria-expanded", "true"); wrap.classList.add("open");
      const r = btn.getBoundingClientRect(), below = innerHeight - r.bottom;
      wrap.classList.toggle("up", below < Math.min(340, list.scrollHeight + 16) && r.top > below);
      mark(sel.selectedIndex); list.focus({ preventScroll: true });
    };
    const close = focus => { if (list.hidden) return; list.hidden = true; btn.setAttribute("aria-expanded", "false"); wrap.classList.remove("open", "up"); if (focus) btn.focus(); };
    const pick = i => { if (sel.selectedIndex !== i) { sel.selectedIndex = i; sel.dispatchEvent(new Event("change", { bubbles: true })); } sync(); close(true); };
    btn.addEventListener("click", () => list.hidden ? open() : close());
    btn.addEventListener("keydown", e => { if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); open(); } });
    list.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); const li = e.target.closest("li"); if (li) pick(+li.dataset.i); });   // label ichida: bosish tugmaga qaytib, ro’yxatni qayta ochmasin
    list.addEventListener("mousedown", e => e.preventDefault());   // matn belgilanmasin, fokus ro’yxatda qolsin
    list.addEventListener("mousemove", e => { const li = e.target.closest("li"); if (li && +li.dataset.i !== act) mark(+li.dataset.i); });
    let typed = "", tt;
    list.addEventListener("keydown", e => {
      const k = e.key;
      if (k === "ArrowDown") mark(act + 1); else if (k === "ArrowUp") mark(act - 1);
      else if (k === "Home") mark(0); else if (k === "End") mark(items().length - 1);
      else if (k === "Enter" || k === " ") pick(act);
      else if (k === "Escape") { e.stopPropagation(); close(true); }
      else if (k === "Tab") { close(); return; }
      else if (k.length === 1) {
        typed += k.toLowerCase(); clearTimeout(tt); tt = setTimeout(() => typed = "", 600);
        const f = items().findIndex(li => li.textContent.toLowerCase().startsWith(typed)); if (f >= 0) mark(f); return;
      } else return;
      e.preventDefault();
    });
    document.addEventListener("mousedown", e => { if (!wrap.contains(e.target)) close(); });
    sel.addEventListener("change", sync);
    const api = { sel, sync, close }; fancy.push(api); sync();
    return api;
  }
  if (matchMedia("(pointer: fine)").matches) $$(".f select").forEach(fancySelect);
  function syncFancy() { fancy.forEach(f => f.sync()); }
  if (form) form.addEventListener("reset", () => setTimeout(syncFancy));

  /* ---------- soha yangiliklari: uzcharm.uz dan jonli ---------- */
  const soha = $("#soha-list");
  if (soha && S.soha) fetch(S.soha + "?t=" + Math.floor(Date.now() / 6e5), { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(j => {
    if (!j || !j.items || !j.items.length) return;
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    const ext = soha.querySelector(".ico") ? soha.querySelector(".ico").outerHTML : "";
    soha.innerHTML = j.items.map(n => `<li><a href="${esc(n.url[S.lang] || n.url.uz)}" target="_blank" rel="noopener"><time class="num" datetime="${esc(n.d)}">${n.d.slice(8, 10)}.${n.d.slice(5, 7)}</time><span>${esc(n.t[S.lang] || n.t.uz)}</span>${ext}</a></li>`).join("");
    after(soha);
  }).catch(() => {});


  /* ---------- hero emblema: nozik parallaks (sichqoncha) ---------- */
  (() => {
    if (RM || !matchMedia("(pointer: fine)").matches) return;
    const hero = $(".hero"), orbit = hero && hero.querySelector(".stage .orbit");
    if (!orbit) return;
    let raf = 0;
    hero.addEventListener("mousemove", e => {
      const r = hero.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { orbit.style.transform = "translate3d(" + (dx * 16).toFixed(1) + "px," + (dy * 16).toFixed(1) + "px,0)"; });
    });
    hero.addEventListener("mouseleave", () => { cancelAnimationFrame(raf); orbit.style.transform = ""; });
  })();

  /* ---------- sayt qidiruvi (do'konlar, yangiliklar, sahifalar) ---------- */
  (() => {
    const dlg = $("#search");
    if (!dlg || !dlg.showModal) return;
    const SE = S.search || {};
    const input = $("#seInput"), box = $("#seResults"), note = $("#seEmpty"), live = $("#seLive");
    const openBtn = $("#searchBtn");
    let data = null, loading = null, items = [], active = -1, opener = null;

    const strip = s => String(s).toLowerCase().replace(/[‘’ʻʼ`']/g, "").replace(/\s+/g, " ").trim();
    const CY = { а: "a", б: "b", в: "v", г: "g", ғ: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y", к: "k", қ: "q", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ў: "o", ф: "f", х: "x", ҳ: "h", ц: "s", ч: "ch", ш: "sh", ъ: "", ь: "", э: "e", ю: "yu", я: "ya" };
    const cy2la = s => s.replace(/[а-яёўғқҳ]/gi, c => { const lo = c.toLowerCase(), m = CY[lo] != null ? CY[lo] : c; return c === lo ? m : m.toUpperCase(); });
    // uz sahifalarda kirillcha yozilgan so'rov ham lotin indeksga mos keladi
    const queries = q => { const out = [strip(q)]; if (S.lang === "uz" && /[а-яёўғқҳ]/i.test(q)) out.push(strip(cy2la(q))); return out.filter(Boolean); };

    function loadData() {
      if (data) return Promise.resolve();
      if (loading) return loading;
      if (!SE.url) { data = []; return Promise.resolve(); }
      loading = fetch(SE.url).then(r => r.ok ? r.json() : { items: [] })
        .then(j => { data = (j.items || []).map(it => Object.assign({}, it, { _n: strip(it.title + " " + (it.text || "")) })); })
        .catch(() => { data = []; });
      return loading;
    }

    function search(q) {
      const qs = queries(q);
      const toks = qs.map(x => x.split(" ").filter(Boolean)).filter(a => a.length);
      if (!toks.length) return [];
      const out = [];
      for (const it of (data || [])) {
        let best = 0;
        for (let i = 0; i < qs.length; i++) {
          const t = toks[i]; if (!t) continue;
          if (t.every(tk => it._n.includes(tk))) {
            const title = strip(it.title);
            best = Math.max(best, 1 + (title.includes(qs[i]) ? 2 : 0) + (title.startsWith(t[0]) ? 2 : 0) + (it.type === "page" ? 0.5 : 0));
          }
        }
        if (best) out.push([best, it]);
      }
      return out.sort((a, b) => b[0] - a[0]).slice(0, 12).map(x => x[1]);
    }

    const suggestions = () => (data || []).filter(it => it.type === "page").slice(0, 6);

    function optionHTML(it, i) {
      const label = (SE.types && SE.types[it.type]) || "";
      return '<a class="se-opt se-' + it.type + '" role="option" id="se-o' + i + '" tabindex="-1" aria-selected="false" href="' + esc(it.url) + '">' +
        '<span class="se-tag">' + esc(label) + '</span><span class="se-ot">' + esc(it.title) + '</span></a>';
    }

    function say(msg) { if (live) live.textContent = msg || ""; }

    function paint(q) {
      const isQ = !!q;
      items = isQ ? search(q) : suggestions();
      active = -1;
      input.removeAttribute("aria-activedescendant");
      if (isQ && !items.length) {
        box.innerHTML = "";
        note.hidden = false;
        note.innerHTML = "<b>" + esc(SE.none) + "</b><span>" + esc(SE.none_p) + "</span>";
        input.setAttribute("aria-expanded", "false");
        say(SE.none);
        return;
      }
      box.innerHTML = items.map(optionHTML).join("");
      note.hidden = isQ;
      if (!isQ) { note.hidden = false; note.textContent = SE.hint || ""; }
      input.setAttribute("aria-expanded", items.length ? "true" : "false");
      if (cyr) after(box);                                  // kirill rejimida natijalar ham kirillcha
      if (isQ) say(items.length + " " + (SE.found || ""));
    }

    function applyActive() {
      const opts = [...box.children];
      opts.forEach((o, i) => { const on = i === active; o.setAttribute("aria-selected", on); o.classList.toggle("act", on); });
      const cur = opts[active];
      if (cur) { input.setAttribute("aria-activedescendant", cur.id); cur.scrollIntoView({ block: "nearest" }); }
      else input.removeAttribute("aria-activedescendant");
    }
    function move(d) {
      if (!items.length) return;
      active = active < 0 ? (d > 0 ? 0 : items.length - 1) : (active + d + items.length) % items.length;
      applyActive();
    }

    function openSearch(from) {
      opener = from || openBtn;
      loadData().then(() => paint(input.value.trim()));
      if (!dlg.open) dlg.showModal();
      openBtn && openBtn.setAttribute("aria-expanded", "true");
      lock();
      input.focus(); input.select();
    }
    dlg.addEventListener("close", () => {
      openBtn && openBtn.setAttribute("aria-expanded", "false");
      lock();
      if (opener && document.contains(opener) && opener.offsetParent !== null) opener.focus();
      else if (openBtn) openBtn.focus();
    });

    let tt;
    input.addEventListener("input", () => { clearTimeout(tt); tt = setTimeout(() => paint(input.value.trim()), 110); });
    input.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Home") { if (items.length) { e.preventDefault(); active = 0; applyActive(); } }
      else if (e.key === "End") { if (items.length) { e.preventDefault(); active = items.length - 1; applyActive(); } }
    });
    dlg.querySelector("form").addEventListener("submit", e => { e.preventDefault(); if (items[active < 0 ? 0 : active]) location.href = items[active < 0 ? 0 : active].url; });
    box.addEventListener("mousemove", e => { const o = e.target.closest(".se-opt"); if (o) { const i = [...box.children].indexOf(o); if (i !== active) { active = i; applyActive(); } } });
    dlg.addEventListener("click", e => { if (e.target.closest("[data-act='seclose']")) dlg.close(); else if (e.target === dlg) dlg.close(); });
    input.addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); dlg.close(); } });   // matn bo'lsa ham bitta Escape yopadi   // tashqariga bosish yopadi

    openBtn && openBtn.addEventListener("click", () => openSearch(openBtn));
    const mBtn = $("#searchBtnM");
    mBtn && mBtn.addEventListener("click", () => { closeDrawer(); openSearch($("#burger")); });
    document.addEventListener("keydown", e => {
      if (e.key !== "/" || dlg.open) return;
      const a = document.activeElement, tag = a && a.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (a && a.isContentEditable)) return;
      e.preventDefault(); openSearch(openBtn);
    });
  })();

  /* ---------- galereya: to'liq rasm + karusel (swipe / strelka) ---------- */
  (() => {
    if (!$(".gallery .gx, .bl-track .gx")) return;
    const L = { prev: S.lang === "ru" ? "Предыдущее" : S.lang === "en" ? "Previous" : "Oldingi",
                next: S.lang === "ru" ? "Следующее" : S.lang === "en" ? "Next" : "Keyingi",
                thumbs: S.lang === "ru" ? "Все фото" : S.lang === "en" ? "All photos" : "Barcha suratlar" };
    let box, items = [], idx = 0, lastFocus;
    function build() {
      box = document.createElement("div");
      box.className = "lightbox"; box.hidden = true;
      box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
      box.innerHTML = '<button type="button" class="lb-x" aria-label="' + esc(T.close || "yopish") + '">×</button>'
        + '<button type="button" class="lb-nav lb-prev" aria-label="' + esc(L.prev) + '">‹</button>'
        + '<figure class="lb-fig"><img alt=""><figcaption class="lb-cap"></figcaption></figure><span class="lb-count num" aria-live="polite"></span><div class="lb-thumbs" role="group" aria-label="' + esc(L.thumbs) + '"></div>'
        + '<button type="button" class="lb-nav lb-next" aria-label="' + esc(L.next) + '">›</button>';
      document.body.appendChild(box);
      box.addEventListener("click", e => { if (e.target === box || e.target.closest(".lb-x") || e.target.closest(".lb-fig")) { if (!e.target.closest(".lb-nav")) close(); } });
      box.querySelector(".lb-prev").addEventListener("click", e => { e.stopPropagation(); go(-1); });
      box.querySelector(".lb-next").addEventListener("click", e => { e.stopPropagation(); go(1); });
      let x0 = null, y0 = null;
      box.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
      box.addEventListener("touchend", e => {
        if (x0 == null) return;
        const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
        x0 = y0 = null;
      }, { passive: true });
    }
    function show() {
      const it = items[idx], im = box.querySelector("img");
      im.src = it[0]; im.alt = it[1] || "";
      box.querySelector(".lb-cap").textContent = it[1] || "";
      const one = items.length <= 1;
      box.querySelector(".lb-prev").hidden = one; box.querySelector(".lb-next").hidden = one;
      box.querySelector(".lb-count").textContent = one ? "" : `${idx + 1} / ${items.length}`;
      box.querySelectorAll(".lb-t").forEach((t, i) => { i === idx ? t.setAttribute("aria-current", "true") : t.removeAttribute("aria-current"); if (i === idx) t.scrollIntoView({ block: "nearest", inline: "nearest" }); });
    }
    function go(d) {
      if (items.length < 2) return; idx = (idx + d + items.length) % items.length; show();
      // keyingi rasm bosilgan tomondan suriladi
      if (!RM) box.querySelector("img").animate([{ translate: `${d * 56}px 0`, opacity: .35 }, { translate: "0 0", opacity: 1 }], { duration: 320, easing: "cubic-bezier(.22,1,.36,1)" });
    }
    function open(gallery, start) {
      if (!box) build();
      items = [...gallery.querySelectorAll("figure:not([hidden]) .gx")].map(b => {
        const im = b.querySelector("img"), fc = b.closest("figure").querySelector("figcaption");
        return [im.src, fc ? fc.textContent : b.getAttribute("aria-label")];
      });
      idx = start; lastFocus = document.activeElement;
      const th = box.querySelector(".lb-thumbs");
      th.innerHTML = items.length < 2 ? "" : items.map((it, i) => '<button type="button" class="lb-t" aria-label="' + (i + 1) + " / " + items.length + '"><img src="' + esc(it[0]) + '" alt="" loading="lazy" decoding="async"></button>').join("");
      box.classList.toggle("has-t", items.length > 1);
      th.querySelectorAll(".lb-t").forEach((t, i) => t.addEventListener("click", e => { e.stopPropagation(); const d = i - idx; if (d) { idx = i; show(); } }));
      show(); box.hidden = false; document.body.style.overflow = "hidden";
      box.querySelector(".lb-x").focus();
    }
    function close() { if (!box || box.hidden) return; box.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
    document.addEventListener("click", e => {
      const b = e.target.closest(".gallery .gx, .bl-track .gx"); if (!b) return;
      const g = b.closest(".gallery, .bl-track");
      open(g, [...g.querySelectorAll("figure:not([hidden]) .gx")].indexOf(b));
    });
    document.addEventListener("keydown", e => {
      if (!box || box.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      else if (e.key === "Tab") {
        const f = [...box.querySelectorAll("button:not([hidden])")];
        const i = f.indexOf(document.activeElement), ni = (i + (e.shiftKey ? -1 : 1) + f.length) % f.length;
        e.preventDefault(); f[ni].focus();
      }
    });
  })();

  /* ---------- 3D zona xaritasi: raqamli nuqtalar ---------- */
  (() => {
    const map = $(".zmap"); if (!map) return;
    const hs = [...map.querySelectorAll(".hs")], li = $$(".zmap-list li");
    const show = i => hs.forEach((h, k) => {
      const on = k === i;
      h.classList.toggle("open", on); h.querySelector(".hs-dot").setAttribute("aria-expanded", String(on));
      if (li[k]) li[k].classList.toggle("on", on);
    });
    hs.forEach((h, i) => h.querySelector(".hs-dot").addEventListener("click", e => { e.stopPropagation(); show(h.classList.contains("open") ? -1 : i); }));
    li.forEach((l, i) => l.addEventListener("click", () => show(i)));
    document.addEventListener("click", e => { if (!e.target.closest(".zmap, .zmap-list")) show(-1); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") show(-1); });
  })();

  /* ---------- rasmlar: xira oldindan ko'rinish ustida, yuklanganda silliq paydo bo'ladi ---------- */
  $$("img.lz").forEach(im => {
    const ok = () => im.classList.add("ok");
    if (im.complete && im.naturalWidth) ok(); else { im.addEventListener("load", ok, { once: true }); im.addEventListener("error", ok, { once: true }); }
  });

  /* ---------- aylantirishga bog'langan bo'limlar: umumiy yordamchilar ---------- */
  const still = matchMedia("(prefers-reduced-motion: reduce)"), low = matchMedia("(max-height: 519px)");   // past ekran (yotqizilgan telefon) — oddiy ko'rinish
  const motionOff = () => still.matches || low.matches;
  const pinned = [];   // har biri: { el, pin, tick }
  let pRaf = 0;
  const pinTick = () => { pRaf = 0; pinned.forEach(x => x.el.vis !== false && x.el.classList.contains("live") && x.tick()); };
  // ekrandan uzoq bo'limlar har skrollda hisoblanmaydi; chiqib-kirishda bir marta yangilanadi (oxirgi holat to'g'ri qoladi)
  const visIO = "IntersectionObserver" in window && new IntersectionObserver(es => { es.forEach(e => { e.target.vis = e.isIntersecting; }); pinOn(); }, { rootMargin: "300px 0px" });
  const pinOn = () => { if (!pRaf) pRaf = requestAnimationFrame(pinTick); };
  const stick = pin => parseFloat(getComputedStyle(pin).top) || 0;   // yopishgan qismning yuqori chegarasi (header balandligi)
  const prog = (el, pin) => { const r = el.getBoundingClientRect(); return Math.min(1, Math.max(0, (stick(pin) - r.top) / Math.max(1, r.height - pin.offsetHeight))); };
  addEventListener("scroll", pinOn, { passive: true }); addEventListener("resize", pinOn);

  /* ---------- zanjir: aylantirgan sari model buriladi (oldindan olingan kadrlar), bosqichlar ochiladi ---------- */
  const idle = window.requestIdleCallback ? f => requestIdleCallback(f, { timeout: 2000 }) : f => setTimeout(f, 300);
  $$(".zchain").forEach(ch => {
    const seq = ch.querySelector(".seq"), cv = seq.querySelector("canvas"), cx = cv.getContext("2d");
    const pinEl = ch.querySelector(".chain-pin"), steps = $$(".ch", ch), n = steps.length;
    const N = +seq.dataset.n, dir = seq.dataset.seq, frames = new Array(N);
    let cur = -1, want = 0, drawn = -1, off = 0, got = false;
    const near = i => { for (let d = 0; d < N; d++) { if (frames[i - d]) return i - d; if (frames[i + d]) return i + d; } return -1; };
    const draw = () => {
      const i = near(Math.max(0, Math.min(N - 1, Math.round(want + off))));
      if (i < 0 || i === drawn) return;
      drawn = i; cx.clearRect(0, 0, cv.width, cv.height); cx.drawImage(frames[i], 0, 0, cv.width, cv.height);
    };
    // avval har 8-kadr (animatsiya darhol ishlaydi), keyin oraliqlar to'ldiriladi
    const load = () => {
      if (got) return; got = true;
      const order = [], seen = new Set();
      // zaif telefon yoki "Trafikni tejash" rejimi: har 4-kadr (18 ta) yetadi, oraliqni near() yopadi
      const lite = (navigator.connection && navigator.connection.saveData) || (navigator.deviceMemory || 8) <= 2;
      (lite ? [8, 4] : [8, 4, 2, 1]).forEach(st => { for (let i = 0; i < N; i += st) if (!seen.has(i)) { seen.add(i); order.push(i); } });
      if (!seen.has(N - 1)) order.splice(9, 0, N - 1);
      let k = 0, left = order.length, more = false;
      const first = 10;   // 9 ta asosiy kadr + oxirgisi; qolganlari foydalanuvchi sahifa bilan ishlay boshlagach
      const go = () => { if (more) return; more = true; for (let c = 0; c < 4; c++) next(); };
      ["scroll", "pointerdown", "touchstart", "keydown", "wheel"].forEach(t => addEventListener(t, go, { passive: true, once: true }));
      const next = () => {
        if (k >= order.length || (k >= first && !more)) return;
        const i = order[k++], im = new Image();
        im.decoding = "async"; im.src = dir + String(i).padStart(2, "0") + ".webp";
        im.decode().then(() => { frames[i] = im; }, () => {}).finally(() => {
          left--; if (left === order.length - 10 || !left) { seq.classList.add("on"); ch.classList.add("ready"); }
          draw(); next();
        });
      };
      for (let c = 0; c < 4; c++) next();   // bir vaqtda 4 tadan
    };
    new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { o.disconnect(); idle(load); } }, { rootMargin: "700px 0px" }).observe(ch);
    // barmoq yoki sichqoncha bilan aylantirish: gorizontal surish kadrlarni suradi
    let sx = null, off0 = 0, back = 0;
    seq.addEventListener("pointerdown", e => { sx = e.clientX; off0 = off; cancelAnimationFrame(back); ch.classList.add("touched"); seq.setPointerCapture(e.pointerId); });
    seq.addEventListener("pointermove", e => { if (sx == null) return; off = off0 + (e.clientX - sx) / seq.clientWidth * N * .6; draw(); });
    const release = () => {
      if (sx == null) return; sx = null;
      if (!ch.classList.contains("live")) return;   // harakatsiz rejimda tanlangan burchak qoladi
      const o0 = off, t0 = performance.now();
      const ease = now => { const t = Math.min(1, (now - t0) / 700); off = o0 * (1 - (1 - Math.pow(1 - t, 3))); draw(); if (t < 1) back = requestAnimationFrame(ease); };
      back = requestAnimationFrame(ease);
    };
    seq.addEventListener("pointerup", release); seq.addEventListener("pointercancel", release);
    const tick = () => {
      const p = prog(ch, pinEl);
      ch.style.setProperty("--p", p.toFixed(4));
      const i = Math.min(n - 1, Math.floor(p * n));
      if (i !== cur) { cur = i; steps.forEach((s, k) => { s.classList.toggle("on", k === i); s.classList.toggle("done", k < i); }); }
      want = p * (N - 1); draw();
    };
    const mode = () => {
      const off2 = motionOff();
      cur = -1; ch.classList.toggle("live", !off2);
      steps.forEach(s => { s.classList.toggle("on", off2); s.classList.remove("done"); });
      if (off2) { want = 0; draw(); }
      pinOn();
    };
    still.addEventListener("change", mode); low.addEventListener("change", mode); mode();
    pinned.push({ el: ch, tick }); if (visIO) visIO.observe(ch);
    // bosqich nomini bossa — o'sha bosqichga aylantiradi
    $$(".ch-b", ch).forEach(b => b.addEventListener("click", () => {
      if (!ch.classList.contains("live")) return;
      const top = ch.getBoundingClientRect().top + scrollY - stick(pinEl), span = ch.offsetHeight - pinEl.offsetHeight;
      scrollTo({ top: top + span * (+b.dataset.i + 0.5) / n, behavior: "smooth" });
    }));
  });

  /* ---------- qurilish lentasi: pastga aylantirish suratlarni chapga suradi ---------- */
  $$(".bline").forEach(bl => {
    const pin = bl.querySelector(".bl-pin"), track = bl.querySelector(".bl-track"), bar = bl.querySelector(".bl-prog i");
    let dist = 0;
    const size = () => {
      if (!bl.classList.contains("live")) { bl.style.height = ""; track.style.translate = ""; return; }
      dist = Math.max(0, track.scrollWidth - track.clientWidth);
      bl.style.height = (pin.offsetHeight + dist) + "px";   // gorizontal masofa = vertikal aylantirish
    };
    const tick = () => {
      const p = prog(bl, pin);
      track.style.translate = `${(-p * dist).toFixed(1)}px 0`;
      bar.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    const mode = () => { bl.classList.toggle("live", !motionOff()); size(); pinOn(); };
    still.addEventListener("change", mode); low.addEventListener("change", mode);
    addEventListener("resize", size); addEventListener("load", size);
    mode();
    pinned.push({ el: bl, tick }); if (visIO) visIO.observe(bl);
  });

  /* ---------- to'lov yo'li: kalkulyator bilan birga yangilanadi ---------- */
  document.addEventListener("kredit", e => {
    const c = e.detail;
    if ($("#pp-first")) { $("#pp-first").textContent = som(c.first); $("#pp-grace").textContent = som(c.grace); $("#pp-month").textContent = som(c.month); }
  });

  /* ---------- aloqa: xarita faqat bosilganda yuklanadi (begona cookie va og'ir skript sahifa ochilishida yo'q) ---------- */
  $$(".map-facade").forEach(f => f.querySelector(".mf-load").addEventListener("click", () => {
    const fr = document.createElement("iframe");
    fr.title = f.dataset.title; fr.src = f.dataset.src; fr.allowFullscreen = true;
    f.replaceWith(fr); fr.focus();
  }));

  /* ---------- fotogalereya: toifa bo'yicha filtr ---------- */
  $$("[data-gf]").forEach(b => b.addEventListener("click", () => {
    const c = b.dataset.gf;
    $$("[data-gf]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    $$(".gallery.all figure").forEach(f => { f.hidden = c !== "all" && f.dataset.cat !== c; });
  }));

  // kirillcha sahifalar endi alohida (/kr/): matni serverda o'girilgan, faqat keyin chiqadigan matn (oyna, xabar) o'giriladi
  try { localStorage.removeItem("oz_cyr"); } catch (e) {}
  if (S.lang === "uz" && document.documentElement.lang === "uz-Cyrl") cyr = true;
  else if (S.lang === "uz" && location.hash === "#cyr") location.replace(S.soha.split("assets/")[0] + "kr/" + location.pathname.slice(S.soha.split("assets/")[0].length));
})();

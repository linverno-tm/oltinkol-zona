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
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in"); io.unobserve(e.target);
      e.target.querySelectorAll("[data-count]").forEach(countUp);
    }), { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    $$(".rv").forEach(el => io.observe(el));
  } else $$(".rv").forEach(el => el.classList.add("in"));

  /* ---------- menyu ---------- */
  const lock = () => { document.body.style.overflow = !$("#drawer").hidden ? "hidden" : ""; };
  const closeDrawer = () => { $("#drawer").hidden = true; $("#burger").setAttribute("aria-expanded", "false"); lock(); };
  function toast(t) { const el = $("#toast"); el.textContent = cyr ? toCyr(t) : t; el.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => el.hidden = true, 2400); }
  function copy(text) { navigator.clipboard.writeText(text).then(() => toast(T.copied), () => toast(T.copy_fail)); }

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
    try { on ? localStorage.setItem("oz_cyr", "1") : localStorage.removeItem("oz_cyr"); } catch (e) {}
  }

  /* ---------- ariza ---------- */
  const form = $("#form"), opened = Date.now();
  function prefill(need, type, text) {
    if (!form) return;
    if (need != null && need !== "") form.need.value = String(need);
    if (type) form.type.value = type;
    if (text) form.text.value = text;
  }
  if (form) form.addEventListener("submit", async e => {
    e.preventDefault();
    const r = $("#res"), data = Object.fromEntries(new FormData(form));
    r.hidden = false;
    if (data.website || Date.now() - opened < 2500) { r.className = "res"; r.textContent = T.f_ok; return; }   // bot
    if (!data.name.trim() || data.tel.replace(/\D/g, "").length < 12) { r.className = "res err"; r.textContent = T.f_err; after(r); return; }
    delete data.website;
    data.need = form.need.selectedOptions[0].text; data.type = form.type.value ? form.type.selectedOptions[0].text : ""; data.page = location.href; data.lang = S.lang; data.ms = Date.now() - opened;
    if (S.endpoint) {
      try {
        const res = await fetch(S.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        if (!res.ok) throw 0;
        r.className = "res"; r.textContent = T.f_ok;
      } catch (err) { r.className = "res err"; r.textContent = T.f_fail + " " + S.phone; }
    } else { r.className = "res"; r.textContent = T.f_ok + " " + T.f_demo; }
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
    if (t.closest("#burger")) { $("#drawer").hidden = false; $("#burger").setAttribute("aria-expanded", "true"); lock(); $("#drawer .x").focus(); return; }
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
    if (btn) btn.addEventListener("click", () => { const on = pan.hidden; pan.hidden = !on; btn.setAttribute("aria-expanded", on); });
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

  /* ---------- soha yangiliklari: uzcharm.uz dan jonli ---------- */
  const soha = $("#soha-list");
  if (soha && S.soha) fetch(S.soha + "?t=" + Math.floor(Date.now() / 6e5), { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(j => {
    if (!j || !j.items || !j.items.length) return;
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    const ext = soha.querySelector(".ico") ? soha.querySelector(".ico").outerHTML : "";
    soha.innerHTML = j.items.map(n => `<li><a href="${esc(n.url[S.lang] || n.url.uz)}" target="_blank" rel="noopener"><time class="num" datetime="${esc(n.d)}">${n.d.slice(8, 10)}.${n.d.slice(5, 7)}</time><span>${esc(n.t[S.lang] || n.t.uz)}</span>${ext}</a></li>`).join("");
    after(soha);
  }).catch(() => {});

  let wantCyr = location.hash === "#cyr";
  try { wantCyr = wantCyr || localStorage.getItem("oz_cyr") === "1"; } catch (e) {}
  if (S.lang === "uz" && wantCyr) setCyr(true);
})();

/* Oltinko'l charm-poyabzal zonasi — sahifa ishlashi */
(() => {
  const S = window.SITE, T = S.t;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = n => Math.round(n).toLocaleString("ru-RU").replace(/\s/g, " ");
  const som = n => fmt(n) + " " + S.sum;
  let cyr = false;

  /* ---------- oyna va menyu ---------- */
  const lock = () => { document.body.style.overflow = (!$("#modal").hidden || !$("#drawer").hidden) ? "hidden" : ""; };
  let last = null;
  function modal(html) {
    last = document.activeElement;
    $("#modal").innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
    $("#modal").hidden = false; lock(); after($("#modal"));
    const x = $("#modal .x"); if (x) x.focus();
  }
  function closeModal() { $("#modal").hidden = true; $("#modal").innerHTML = ""; lock(); if (last) last.focus(); }
  const closeDrawer = () => { $("#drawer").hidden = true; lock(); };
  function toast(t) { const el = $("#toast"); el.textContent = cyr ? toCyr(t) : t; el.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => el.hidden = true, 2400); }
  function copy(text) { navigator.clipboard.writeText(text).then(() => toast(T.toast_copy), () => toast(T.toast_fail)); }

  /* ---------- kredit kalkulyatori: 20% / 18% / 5 yil / 1 yil faqat foiz, keyin 48 oy teng to'lov ---------- */
  function credit(v) {
    const first = v * .2, loan = v - first, r = .18 / 12, n = 48;
    const grace = Math.round(loan * r), month = Math.round(loan * r / (1 - Math.pow(1 + r, -n)));
    return { first, loan, grace, month, interest: grace * 12 + month * n - loan };
  }
  function calc(v) {
    v = Math.max(0, Math.min(v, 50e9));
    const c = credit(v);
    $("#o-first").textContent = som(c.first); $("#o-loan").textContent = som(c.loan);
    $("#o-grace").textContent = som(c.grace); $("#o-month").textContent = som(c.month);
    $("#o-int").textContent = som(c.interest); $("#o-all").textContent = som(v + c.interest);
  }
  function setV(v, from) {
    if (from !== "in") $("#cv").value = fmt(v);
    if (from !== "range") $("#cr").value = Math.min(2e9, Math.max(1e8, v));
    calc(v);
  }
  $("#cv").addEventListener("input", e => setV(+e.target.value.replace(/\D/g, "") || 0, "in"));
  $("#cv").addEventListener("blur", e => setV(+e.target.value.replace(/\D/g, "") || 0));
  $("#cr").addEventListener("input", e => setV(+e.target.value, "range"));

  /* ---------- do'konlar sxemasi ---------- */
  const SHOPS = Object.fromEntries(S.shops.map(s => [s.id, s]));
  let shopFilter = "all", selected = null;
  function applyFilter() {
    $$(".cell").forEach(g => {
      const s = SHOPS[g.dataset.shop];
      g.classList.toggle("dim", (shopFilter === "free" && !s.free) || (shopFilter === "sold" && s.free));
    });
  }
  function pickShop(id, scroll) {
    const s = SHOPS[id]; if (!s) return;
    selected = id;
    $$(".cell").forEach(g => g.classList.toggle("sel", g.dataset.shop === id));
    const c = credit(s.price);
    const p = $("#shopPanel");
    p.innerHTML = `<span class="st ${s.free ? "free" : "sold"}">${s.free ? T.sh_free : T.sh_sold}</span>
      <h3 class="num">${esc(s.id)}</h3>
      <dl class="kv"><dt>${T.sh_area}</dt><dd class="num">${s.area} m²</dd><dt>${T.sh_price}</dt><dd class="num">${som(s.price)}</dd>
      ${s.free ? `<dt>${T.sh_first}</dt><dd class="num">${som(c.first)}</dd><dt>${T.sh_month}</dt><dd class="num">${som(c.month)}</dd>` : ""}</dl>
      ${s.free ? `<div class="acts"><a class="btn" href="#ariza" data-shopapply="${esc(s.id)}">${T.sh_apply}</a><a class="btn ghost" href="#calc" data-shopcalc="${s.price}">${T.sh_calc}</a></div>` : `<p style="color:var(--ink-3)">${T.sh_soldnote}</p>`}`;
    after(p);
    if (scroll && innerWidth < 1080) p.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  $$(".cell.free").forEach(g => g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickShop(g.dataset.shop, true); } }));

  /* ---------- lotin -> kirill (faqat o'zbekcha sahifada) ---------- */
  const ORIG = new WeakMap();
  const MAP = { a: "а", b: "б", d: "д", e: "е", f: "ф", g: "г", h: "ҳ", i: "и", j: "ж", k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", q: "қ", r: "р", s: "с", t: "т", u: "у", v: "в", x: "х", y: "й", z: "з", c: "с", w: "в" };
  function toCyr(s) {
    if (S.lang !== "uz") return s;
    const A = "[‘'ʻ`]";
    s = s.replace(/(^|[^A-Za-z‘'ʻ`’])e/g, "$1э").replace(/(^|[^A-Za-z‘'ʻ`’])E/g, "$1Э");
    s = s.replace(/([A-Za-z])[’ʼ](?=[A-Za-z])/g, "$1ъ");
    s = s.replace(new RegExp("O" + A, "g"), "Ў").replace(new RegExp("o" + A, "g"), "ў").replace(new RegExp("G" + A, "g"), "Ғ").replace(new RegExp("g" + A, "g"), "ғ");
    [["SH", "Ш"], ["Sh", "Ш"], ["sh", "ш"], ["CH", "Ч"], ["Ch", "Ч"], ["ch", "ч"], ["YO", "Ё"], ["Yo", "Ё"], ["yo", "ё"], ["YU", "Ю"], ["Yu", "Ю"], ["yu", "ю"], ["YA", "Я"], ["Ya", "Я"], ["ya", "я"], ["YE", "Е"], ["Ye", "Е"], ["ye", "е"]].forEach(([a, b]) => { s = s.split(a).join(b); });
    return s.replace(/[A-Za-z]/g, ch => { const lo = ch.toLowerCase(), m = MAP[lo] || ch; return ch === lo ? m : m.toUpperCase(); });
  }
  function translit(root, on) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest("script,style,[data-notr],.mapscroll .id,.ar") || !n.nodeValue.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
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
  function prefill(need, type) {
    if (need != null) $("#f-need").value = String(need);
    if (type) $("#f-type").value = type;
  }
  $("#form").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target, r = $("#res");
    const data = Object.fromEntries(new FormData(f));
    const ok = data.name.trim() && data.tel.replace(/\D/g, "").length >= 12;
    r.hidden = false;
    if (!ok) { r.className = "res err"; r.textContent = T.f_err; after(r); return; }
    data.need = f["need"].selectedOptions[0].text; data.type = f["type"].selectedOptions[0].text; data.page = location.href;
    if (S.endpoint) {
      try {
        const res = await fetch(S.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        if (!res.ok) throw 0;
        r.className = "res"; r.textContent = T.f_ok;
      } catch (err) { r.className = "res err"; r.textContent = T.f_fail + " " + S.phone; }
    } else { r.className = "res"; r.textContent = T.f_ok + " " + T.f_demo; }
    if (r.className === "res") { f.reset(); f["tel"].value = "+998 "; }
    after(r);
  });

  /* ---------- bosishlar ---------- */
  document.addEventListener("click", e => {
    const t = e.target;
    const act = t.closest("[data-act]");
    if (act) { if (act.dataset.act === "close") closeModal(); else if (act.dataset.act === "dclose") closeDrawer(); return; }
    const sf = t.closest("[data-sf]");
    if (sf) { shopFilter = sf.dataset.sf; $$("[data-sf]").forEach(b => b.setAttribute("aria-pressed", b === sf)); applyFilter(); return; }
    const sa = t.closest("[data-shopapply]");
    if (sa) { prefill(0); $("#f-text").value = (S.lang === "uz" ? "Do‘kon " : "Магазин ") + sa.dataset.shopapply; return; }
    const sc = t.closest("[data-shopcalc]");
    if (sc) { setV(+sc.dataset.shopcalc); return; }
    const cell = t.closest("[data-shop]");
    if (cell && (cell.classList.contains("free") || cell.closest("#freeList") || cell.classList.contains("sold"))) { pickShop(cell.dataset.shop, true); return; }
    const pv = t.closest("[data-v]"); if (pv) { setV(+pv.dataset.v); return; }
    const nd = t.closest("[data-need]"); if (nd) prefill(nd.dataset.need, nd.dataset.type);
    const cp = t.closest("[data-copy]"); if (cp) { copy(cp.dataset.copy); return; }
    const nw = t.closest("[data-news]");
    if (nw) {
      const n = S.news[+nw.dataset.news];
      modal(`<div class="modal-h"><div><span style="color:var(--ink-3);font-size:14.5px" class="num">${n.d} · ${esc(n.tag)}</span><h2 style="margin-top:6px">${esc(n.t)}</h2></div><button class="x" data-act="close" aria-label="${T.close}"><svg class="ico" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><div class="ph">${T.photo}</div><div class="txt"><p><b>${esc(n.l)}</b></p><p>${T.nw_more}</p></div>`);
      return;
    }
    if (t.closest("#copyReq")) { copy($$("#req dt").map((dt, i) => dt.textContent + ": " + $$("#req dd")[i].textContent).join("\n")); return; }
    if (t.closest("#cyrBtn, [data-cyr]")) { setCyr(!cyr); closeDrawer(); return; }
    if (t.closest("#latBtn") && cyr) { e.preventDefault(); setCyr(false); return; }
    if (t.closest("#burger")) { $("#drawer").hidden = false; lock(); return; }
    if (t === $("#drawer") || t.closest(".drawer a")) closeDrawer();
    if (t === $("#modal")) closeModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (!$("#modal").hidden) { e.preventDefault(); closeModal(); }
    else if (!$("#drawer").hidden) { e.preventDefault(); closeDrawer(); }
  });

  setV(500000000);
  const firstFree = S.shops.find(s => s.free); if (firstFree && innerWidth >= 1080) pickShop(firstFree.id, false);
  let wantCyr = location.hash === "#cyr";
  try { wantCyr = wantCyr || localStorage.getItem("oz_cyr") === "1"; } catch (e) {}
  if (S.lang === "uz" && wantCyr) setCyr(true);
})();

(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];

  // menyu (telefonda)
  const side = $("#side"), burger = $("#burger");
  if (burger) burger.addEventListener("click", () => { const o = side.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });

  // til yorliqlari
  $$("[data-tab]").forEach(b => b.addEventListener("click", () => {
    $$("[data-tab]").forEach(x => x.setAttribute("aria-selected", x === b));
    $$("[data-pane]").forEach(p => p.hidden = p.dataset.pane !== b.dataset.tab);
  }));

  // tasdiqlash
  document.addEventListener("submit", e => { const f = e.target.closest("[data-confirm]"); if (f && !confirm(f.dataset.confirm)) e.preventDefault(); });
  document.addEventListener("click", e => { const b = e.target.closest("button[data-confirm]"); if (b && !confirm(b.dataset.confirm)) e.preventDefault(); });

  // jonli qidiruv — birinchi harfdan
  $$("[data-filter]").forEach(inp => inp.addEventListener("input", () => {
    const q = inp.value.trim().toLowerCase();
    $$(inp.dataset.filter).forEach(r => r.hidden = q && !r.textContent.toLowerCase().includes(q));
  }));

  // pul yozilayotganda o'zi tartiblanadi: 1 000 000
  const grp = v => { const d = v.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 13); return d ? (+d).toLocaleString("ru-RU").replace(/\s/g, " ") : ""; };
  $$("[data-money]").forEach(el => el.addEventListener("input", () => { const end = el.selectionStart === el.value.length; el.value = grp(el.value); if (end) el.setSelectionRange(el.value.length, el.value.length); }));
  // telefon: +998 99 107 55 08
  $$('input[type="tel"]').forEach(el => el.addEventListener("input", () => {
    let d = el.value.replace(/\D/g, ""); if (!d) return; if (!d.startsWith("998")) d = "998" + d; d = d.slice(0, 12);
    el.value = "+998 " + [d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)].filter(Boolean).join(" ");
  }));

  // do'konlar: 1 m² narxini belgilanganlarga qo'llash
  const all = $("#all");
  if (all) all.addEventListener("change", () => $$(".pick").forEach(c => { if (!c.closest("tr").hidden) c.checked = all.checked; }));
  const go = $("#m2go");
  if (go) go.addEventListener("click", () => {
    const m2 = +($("#m2").value.replace(/\D/g, "")); if (!m2) return alert("1 m² narxini yozing");
    const rows = $$(".pick:checked").map(c => c.closest("tr")); if (!rows.length) return alert("Avval do‘konlarni belgilang");
    rows.forEach(tr => { const a = +tr.querySelector(".area").value.replace(/\D/g, ""); tr.querySelector(".price").value = grp(String(a * m2)); });
  });

  // sayt holati (yangilanmoqda -> yangi)
  const pub = $("#pub");
  if (pub && pub.dataset.h === "yangilanmoqda") {
    const t = setInterval(() => fetch("/admin/holat").then(r => r.json()).then(h => {
      pub.dataset.h = h.holat;
      if (h.holat !== "yangilanmoqda") { clearInterval(t); pub.textContent = h.holat === "xato" ? "Yangilashda xato" : "Sayt yangi · " + h.vaqt; if (h.holat === "xato") location.reload(); }
    }).catch(() => {}), 1500);
  }

  // lotin <-> kirill
  const MAP = { a: "а", b: "б", d: "д", e: "е", f: "ф", g: "г", h: "ҳ", i: "и", j: "ж", k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", q: "қ", r: "р", s: "с", t: "т", u: "у", v: "в", x: "х", y: "й", z: "з", c: "с", w: "в" };
  function toCyr(s) {
    const A = "[‘'ʻ`]";
    s = s.replace(/([Pp])oyabzal/g, (m, p) => (p === "P" ? "П" : "п") + "ойабзал");
    s = s.replace(/(^|[^A-Za-z‘'ʻ`’])e/g, "$1э").replace(/(^|[^A-Za-z‘'ʻ`’])E/g, "$1Э");
    s = s.replace(/([A-Za-z])[’ʼ](?=[A-Za-z])/g, "$1ъ");
    s = s.replace(new RegExp("O" + A, "g"), "Ў").replace(new RegExp("o" + A, "g"), "ў").replace(new RegExp("G" + A, "g"), "Ғ").replace(new RegExp("g" + A, "g"), "ғ");
    [["SH", "Ш"], ["Sh", "Ш"], ["sh", "ш"], ["CH", "Ч"], ["Ch", "Ч"], ["ch", "ч"], ["YO", "Ё"], ["Yo", "Ё"], ["yo", "ё"], ["YU", "Ю"], ["Yu", "Ю"], ["yu", "ю"], ["YA", "Я"], ["Ya", "Я"], ["ya", "я"], ["YE", "Е"], ["Ye", "Е"], ["ye", "е"]].forEach(([a, b]) => { s = s.split(a).join(b); });
    return s.replace(/[A-Za-z]/g, ch => { const lo = ch.toLowerCase(), m = MAP[lo] || ch; return ch === lo ? m : m.toUpperCase(); });
  }
  const ORIG = new WeakMap();
  function translit(on) {
    // faqat panel yozuvlari; kiritilgan qiymatlar (input, textarea) o'zgarmaydi
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest("script,style,textarea,option,pre,.num,[data-notr]") || !n.nodeValue.trim() ? 2 : 1 });
    const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(n => { if (on) { if (!ORIG.has(n)) ORIG.set(n, n.nodeValue); n.nodeValue = toCyr(ORIG.get(n)); } else if (ORIG.has(n)) n.nodeValue = ORIG.get(n); });
  }
  const cy = $("#cyr");
  let on = false; try { on = localStorage.getItem("panel_cyr") === "1"; } catch (e) {}
  const set = v => { on = v; translit(v); if (cy) cy.textContent = v ? "Lotin" : "Кирилл"; try { v ? localStorage.setItem("panel_cyr", "1") : localStorage.removeItem("panel_cyr"); } catch (e) {} };
  if (on) set(true);
  if (cy) cy.addEventListener("click", () => set(!on));
})();

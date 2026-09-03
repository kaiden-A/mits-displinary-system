const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const REPORTS_DIR = path.join(__dirname, "reports");

global.window = {};
global.SPSM = global.window.SPSM = {};

const memStore = {};
global.localStorage = {
  getItem: (k) => (k in memStore ? memStore[k] : null),
  setItem: (k, v) => { memStore[k] = String(v); },
  removeItem: (k) => { delete memStore[k]; }
};
global.confirm = () => true;

function load(rel) {
  const code = fs.readFileSync(path.join(ROOT, rel), "utf8");
  eval(code);
}

[
  "assets/js/offences.js",
  "assets/js/spsm.js",
  "assets/js/workflow.js",
  "assets/js/students.js",
  "assets/js/student-api.js",
  "assets/js/store.js",
  "assets/print/templates.js"
].forEach(load);

SPSM.canAccessRoute = SPSM.Workflow.canAccessRoute;
SPSM.homeFor = SPSM.Workflow.homeFor;

const suites = [];
function suite(name, fn) {
  const results = [];
  const ctx = {
    check: (name, pass, detail) => {
      results.push({ name, pass: !!pass, detail: detail || {} });
    },
    reset: () => SPSM.Store.reset()
  };
  fn(ctx);
  suites.push({ name, results });
}

function freshCase(cfg) {
  return SPSM.Store.addCase(Object.assign({
    source: "COMPLAINT",
    studentId: "1",
    reporter: "Ujian",
    reporterRole: "guru",
    offences: [{ code: "K01", name: "Lewat ke sekolah", points: 2 }],
    points: 2,
    details: "butiran ujian",
    firstEvent: "kes dicipta"
  }, cfg));
}

/* ============ SUITE 01: WORKFLOWS ============ */
suite("01-workflows", (t) => {
  t.reset();

  /* --- Complaint <=5: auto B04, light path --- */
  {
    const c = freshCase({ source: "COMPLAINT", points: 2, offences: [{ code: "K01", name: "Lewat ke sekolah", points: 2 }] });
    t.check("COMPLAINT <=5 auto status RECORDED", c.status === "RECORDED", { got: c.status, want: "RECORDED" });
    t.check("COMPLAINT <=5 event mentions B04", /B04/.test(c.events[0].text), { got: c.events[0].text });
    let s = SPSM.Store.caseById(c.id).status;
    SPSM.Store.advance(c.id, "execute", "Guru Disiplin");
    s = SPSM.Store.caseById(c.id).status;
    t.check("COMPLAINT <=5 execute -> EXECUTED", s === "EXECUTED", { got: s });
    SPSM.Store.advance(c.id, "close", "Guru Disiplin");
    s = SPSM.Store.caseById(c.id).status;
    t.check("COMPLAINT <=5 close -> CLOSED", s === "CLOSED", { got: s });
    t.check("COMPLAINT <=5 events appended", SPSM.Store.caseById(c.id).events.length === 3, { got: SPSM.Store.caseById(c.id).events.length, want: 3 });
  }

  /* --- Complaint >5: B02 -> confirm -> heavy full walk with meeting --- */
  {
    t.reset();
    const c = freshCase({ source: "COMPLAINT", points: 30, offences: [{ code: "C02", name: "Buli fizikal", points: 20 }, { code: "G08", name: "Ingkar arahan guru", points: 10 }] });
    t.check("COMPLAINT >5 starts REPORTED", c.status === "REPORTED", { got: c.status });
    t.check("COMPLAINT >5 needsB02 true", SPSM.Workflow.needsB02(c) === true, {});
    SPSM.Store.addB02(c.id, { isu: "Ujian", punca: "Ujian", penambahbaikan: "Ujian" }, "Guru Ujian", "Guru");
    t.check("B02 simpan oleh guru (docs wujud)", SPSM.Store.b02s(c.id).length > 0, { got: SPSM.Store.b02s(c.id).length });
    const walk = [
      ["startInvestigation", "INVESTIGATING", "disiplin"],
      ["confirm", "CONFIRMED", "disiplin"],
      ["record", "RECORDED", "disiplin"],
      ["ack", "STUDENT_ACK", "disiplin"],
      ["prepare", "ACTION_PREPARED", "disiplin"],
      ["approve", "PRINCIPAL_APPROVAL", "disiplin"],
      ["sign", "EXECUTED", "pengetua"],
      ["notify", "PARENT_NOTIFIED", "disiplin"],
      ["meeting", "MEETING", "disiplin"],
      ["close", "CLOSED", "disiplin"]
    ];
    walk.forEach(([action, want, by]) => {
      const cc = SPSM.Store.advance(c.id, action, by);
      t.check(`COMPLAINT heavy: ${action} -> ${want}`, cc && cc.status === want, { got: cc && cc.status, want });
    });
    t.check("COMPLAINT heavy full path events (incl B02)", SPSM.Store.caseById(c.id).events.length === 12, { got: SPSM.Store.caseById(c.id).events.length, want: 12 });
  }

  /* --- Complaint >5: no-meeting branch --- */
  {
    t.reset();
    const c = freshCase({ source: "COMPLAINT", points: 10, offences: [{ code: "G08", name: "Ingkar arahan guru", points: 10 }] });
    SPSM.Store.advance(c.id, "startInvestigation", "Guru Disiplin");
    SPSM.Store.advance(c.id, "confirm", "Guru Disiplin");
    SPSM.Store.advance(c.id, "record", "Guru Disiplin");
    SPSM.Store.advance(c.id, "ack", "Guru Disiplin");
    SPSM.Store.advance(c.id, "prepare", "Guru Disiplin");
    SPSM.Store.advance(c.id, "approve", "Guru Disiplin");
    SPSM.Store.advance(c.id, "sign", "Pengetua");
    SPSM.Store.advance(c.id, "execute", "Guru Disiplin");
    SPSM.Store.advance(c.id, "notify", "Guru Disiplin");
    SPSM.Store.advance(c.id, "close", "Guru Disiplin");
    t.check("COMPLAINT no-meeting -> CLOSED directly", SPSM.Store.caseById(c.id).status === "CLOSED", { got: SPSM.Store.caseById(c.id).status });
  }

  /* --- Complaint >5: dismiss branch --- */
  {
    t.reset();
    const c = freshCase({ source: "COMPLAINT", points: 30, offences: [{ code: "C02", name: "Buli fizikal", points: 20 }, { code: "G08", name: "Ingkar arahan guru", points: 10 }] });
    SPSM.Store.advance(c.id, "startInvestigation", "Guru Disiplin");
    SPSM.Store.advance(c.id, "dismiss", "Guru Disiplin");
    t.check("COMPLAINT dismiss -> DISMISSED", SPSM.Store.caseById(c.id).status === "DISMISSED", { got: SPSM.Store.caseById(c.id).status });
    t.check("DISMISSED is terminal", SPSM.Workflow.isTerminal(SPSM.Store.caseById(c.id)), {});
  }

  /* --- Prefect: cap, approve, reject --- */
  {
    t.reset();
    const c = freshCase({ source: "PREFECT_WARNING", reporterRole: "pengawas", points: 2, offences: [{ code: "K01", name: "Lewat ke sekolah", points: 2 }] });
    t.check("PREFECT starts REPORTED", c.status === "REPORTED", { got: c.status });
    SPSM.Store.advance(c.id, "approveWarning", "Guru Disiplin");
    t.check("PREFECT approveWarning -> RECORDED (B04)", SPSM.Store.caseById(c.id).status === "RECORDED", { got: SPSM.Store.caseById(c.id).status });
    SPSM.Store.advance(c.id, "execute", "Guru Disiplin");
    SPSM.Store.advance(c.id, "close", "Guru Disiplin");
    t.check("PREFECT approved -> CLOSED", SPSM.Store.caseById(c.id).status === "CLOSED", { got: SPSM.Store.caseById(c.id).status });

    t.reset();
    const c2 = freshCase({ source: "PREFECT_WARNING", reporterRole: "pengawas", points: 3, offences: [{ code: "G10", name: "Meludah", points: 3 }] });
    SPSM.Store.advance(c2.id, "rejectWarning", "Guru Disiplin");
    t.check("PREFECT rejectWarning -> DISMISSED", SPSM.Store.caseById(c2.id).status === "DISMISSED", { got: SPSM.Store.caseById(c2.id).status });
    t.check("PREFECT rejected case NOT in B04 register", !SPSM.Store.recordedCases().some((x) => x.id === c2.id), {});
  }

  /* --- Spot check: B02 by disiplin --- */
  {
    t.reset();
    const c = freshCase({ source: "SPOT_CHECK", reporterRole: "disiplin", points: 45, offences: [{ code: "D04", name: "Menghisap rokok / vape", points: 45 }] });
    t.check("SPOT_CHECK starts REPORTED", c.status === "REPORTED", { got: c.status });
    SPSM.Store.advance(c.id, "startInvestigation", "Guru Disiplin");
    t.check("SPOT_CHECK startInvestigation -> INVESTIGATING", SPSM.Store.caseById(c.id).status === "INVESTIGATING", { got: SPSM.Store.caseById(c.id).status });
    SPSM.Store.advance(c.id, "confirm", "Guru Disiplin");
    SPSM.Store.advance(c.id, "record", "Guru Disiplin");
    t.check("SPOT_CHECK confirm+record -> RECORDED", SPSM.Store.caseById(c.id).status === "RECORDED", { got: SPSM.Store.caseById(c.id).status });
  }

  /* --- Illegal transitions rejected --- */
  {
    t.reset();
    const c = freshCase({ source: "COMPLAINT", points: 10, offences: [{ code: "G08", name: "Ingkar arahan guru", points: 10 }] });
    SPSM.Store.advance(c.id, "sign", "Pengetua");
    t.check("sign from REPORTED rejected (status unchanged)", SPSM.Store.caseById(c.id).status === "REPORTED", { got: SPSM.Store.caseById(c.id).status });
    t.check("illegal transition adds no event", SPSM.Store.caseById(c.id).events.length === 1, { got: SPSM.Store.caseById(c.id).events.length, want: 1 });
    t.check("ack by guru not permitted", !SPSM.Workflow.canAct("guru", "ack"), {});
    t.check("rejectWarning on non-prefect case blocked (advance returns null)", SPSM.Store.advance(c.id, "rejectWarning", "Guru Disiplin") === null && SPSM.Store.caseById(c.id).status === "REPORTED", { got: SPSM.Store.caseById(c.id).status });
  }

  /* --- Path for archetypes --- */
  {
    t.reset();
    const light = freshCase({ source: "COMPLAINT", points: 2, offences: [{ code: "K01", name: "Lewat", points: 2 }] });
    const heavy = freshCase({ source: "COMPLAINT", points: 30, offences: [{ code: "C02", name: "Buli", points: 20 }, { code: "G08", name: "Ingkar", points: 10 }] });
    const pref = freshCase({ source: "PREFECT_WARNING", points: 2, offences: [{ code: "K01", name: "Lewat", points: 2 }] });
    const spot = freshCase({ source: "SPOT_CHECK", points: 45, offences: [{ code: "D04", name: "Vape", points: 45 }] });
    t.check("path COMPLAINT <=5", JSON.stringify(SPSM.Workflow.pathFor(light)) === JSON.stringify(["REPORTED", "RECORDED", "EXECUTED", "CLOSED"]), { got: SPSM.Workflow.pathFor(light) });
    t.check("path COMPLAINT >5 includes siasatan", JSON.stringify(SPSM.Workflow.pathFor(heavy).slice(0, 4)) === JSON.stringify(["REPORTED", "INVESTIGATING", "CONFIRMED", "RECORDED"]), { got: SPSM.Workflow.pathFor(heavy) });
    t.check("path PREFECT light", JSON.stringify(SPSM.Workflow.pathFor(pref)) === JSON.stringify(["REPORTED", "RECORDED", "EXECUTED", "CLOSED"]), { got: SPSM.Workflow.pathFor(pref) });
    t.check("path SPOT_CHECK heavy includes siasatan", SPSM.Workflow.pathFor(spot).indexOf("INVESTIGATING") !== -1, { got: SPSM.Workflow.pathFor(spot) });
    t.check("path SPOT_CHECK >5 has B05", SPSM.Workflow.pathFor(spot).indexOf("STUDENT_ACK") !== -1, {});
  }
});

/* ============ SUITE 02: MERIT RULES ============ */
suite("02-merit-rules", (t) => {
  t.reset();
  const TIERS = { 5: 1, 6: 2, 10: 2, 11: 3, 20: 3, 21: 4, 30: 4, 31: 5, 40: 5, 41: 6, 50: 6 };
  Object.keys(TIERS).forEach((pts) => {
    const got = SPSM.Spsm.tierFor(Number(pts)).tier;
    t.check(`tierFor(${pts}) = tier ${TIERS[pts]}`, got === TIERS[pts], { got, want: TIERS[pts] });
  });
  for (let p = 1; p <= 50; p++) {
    const tier = SPSM.Spsm.tierFor(p);
    t.check(`tierFor(${p}) within 1-6`, tier.tier >= 1 && tier.tier <= 6, { got: tier.tier });
  }
  const FORMS_AT = { 0: [], 5: [], 9: [], 10: ["B05", "B06"], 19: ["B05", "B06"], 20: ["B05", "B06"], 29: ["B05", "B06"], 30: ["B05", "B06", "B08"], 39: ["B05", "B06", "B08"], 40: ["B05", "B06", "B08"], 49: ["B05", "B06", "B08"], 50: ["B05", "B06", "B08"] };
  Object.keys(FORMS_AT).forEach((pts) => {
    const got = SPSM.Spsm.requiredForms(Number(pts)).map((f) => f.code).sort();
    const want = FORMS_AT[pts].slice().sort();
    t.check(`requiredForms(${pts}) codes`, JSON.stringify(got) === JSON.stringify(want), { got, want });
  });
  const allowed = SPSM.Spsm.prefectAllowed();
  t.check("prefectAllowed count 53", allowed.length === 53, { got: allowed.length, want: 53 });
  t.check("prefectAllowed all <=5", allowed.every((o) => o.max <= 5), {});
  t.check("prefectAllowed includes K01", allowed.some((o) => o.code === "K01"), {});
  t.check("prefectAllowed excludes G08(10)", !allowed.some((o) => o.code === "G08"), {});
  t.check("needsB02 boundary: 5 pts no", SPSM.Workflow.needsB02(freshCase({ source: "COMPLAINT", points: 5, offences: [{ code: "K01", name: "L", points: 5 }] })) === false, {});
  t.check("needsB02 boundary: 6 pts yes", SPSM.Workflow.needsB02(freshCase({ source: "COMPLAINT", points: 6, offences: [{ code: "G10", name: "L", points: 3 }, { code: "G10b", name: "L2", points: 3 }] })) === true, {});
  const c5 = freshCase({ source: "COMPLAINT", points: 5, offences: [{ code: "C01", name: "Buli bahasa", points: 5 }] });
  const c6 = freshCase({ source: "COMPLAINT", points: 6, offences: [{ code: "J04", name: "Ganggu PdPc", points: 5 }, { code: "K01", name: "Lewat", points: 1 }] });
  t.check("auto-record boundary: 5 -> RECORDED", c5.status === "RECORDED", { got: c5.status });
  t.check("auto-record boundary: 6 -> REPORTED", c6.status === "REPORTED", { got: c6.status });
  t.check("involvesConfiscation J01 (Disita)", SPSM.Offences.involvesConfiscation("J01"), {});
  t.check("involvesConfiscation D03 (Dirampas)", SPSM.Offences.involvesConfiscation("D03"), {});
  t.check("involvesConfiscation L15 (Tukar/dirampas)", SPSM.Offences.involvesConfiscation("L15"), {});
  t.check("involvesConfiscation G08 no", !SPSM.Offences.involvesConfiscation("G08"), {});
  t.check("involvesConfiscation H03 (ganti rugi) no", !SPSM.Offences.involvesConfiscation("H03"), {});
  t.check("offence count", SPSM.Offences.list.length === 145, { got: SPSM.Offences.list.length, want: 145 });
  ["A13", "A14", "B03", "D01", "N10"].forEach((code) => {
    t.check(`offence ${code} max 50`, SPSM.Offences.byCode(code).max === 50, {});
  });
});

/* ============ SUITE 03: ROLES & ACCESS ============ */
suite("03-roles-access", (t) => {
  t.reset();
  const actions = ["startInvestigation", "confirm", "dismiss", "approveWarning", "rejectWarning", "record", "ack", "prepare", "approve", "sign", "execute", "notify", "meeting", "close"];
  const allow = {
    guru: [],
    pengawas: [],
    disiplin: ["startInvestigation", "confirm", "dismiss", "approveWarning", "rejectWarning", "record", "ack", "prepare", "approve", "execute", "notify", "meeting", "close"],
    pengetua: ["sign"]
  };
  actions.forEach((a) => {
    ["guru", "pengawas", "disiplin", "pengetua"].forEach((role) => {
      const want = allow[role].includes(a);
      const got = SPSM.Workflow.canAct(role, a);
      t.check(`canAct(${role}, ${a})`, got === want, { got, want });
    });
  });
  const routeRules = {
    guru: { dashboard: false, report: true, warning: false, catalogue: true, students: false, case: true, student: true },
    pengawas: { dashboard: false, report: false, warning: true, catalogue: false, students: false, case: false, student: false },
    disiplin: { dashboard: true, report: false, warning: false, catalogue: true, students: true, case: true, student: true },
    pengetua: { dashboard: true, report: false, warning: false, catalogue: true, students: true, case: true, student: true }
  };
  Object.keys(routeRules).forEach((role) => {
    Object.keys(routeRules[role]).forEach((view) => {
      const want = routeRules[role][view];
      const got = SPSM.canAccessRoute(role, view);
      t.check(`route ${role}/${view}`, got === want, { got, want });
    });
  });
  t.check("homeFor guru", SPSM.homeFor("guru") === "#/report", { got: SPSM.homeFor("guru") });
  t.check("homeFor pengawas", SPSM.homeFor("pengawas") === "#/warning", { got: SPSM.homeFor("pengawas") });
  t.check("homeFor disiplin", SPSM.homeFor("disiplin") === "#/dashboard", { got: SPSM.homeFor("disiplin") });
  t.check("homeFor pengetua", SPSM.homeFor("pengetua") === "#/dashboard", { got: SPSM.homeFor("pengetua") });
  const over5 = freshCase({ source: "COMPLAINT", points: 30, offences: [{ code: "C02", name: "Buli", points: 20 }, { code: "G08", name: "Ingkar", points: 10 }] });
  t.check("guru CAN fill B02 for own complaint (docs editable)", SPSM.Workflow.flowPanels(SPSM.Store.caseById(over5.id)).b02 === true, { got: SPSM.Workflow.flowPanels(SPSM.Store.caseById(over5.id)).b02 });
});

/* ============ SUITE 04: DOCUMENTS & PANELS ============ */
suite("04-documents", (t) => {
  t.reset();
  function forms(c) { return SPSM.Workflow.visibleDocs(c).map((d) => d.form).sort(); }
  const light = freshCase({ source: "COMPLAINT", points: 2, offences: [{ code: "K01", name: "Lewat", points: 2 }] });
  t.check("light complaint docs", JSON.stringify(forms(light)) === JSON.stringify(["b01", "b04", "kad"]), { got: forms(light) });
  const heavy = freshCase({ source: "COMPLAINT", points: 30, offences: [{ code: "C02", name: "Buli", points: 20 }, { code: "G08", name: "Ingkar", points: 10 }] });
  t.check("heavy complaint docs (needsB02, >=10, >=30)", JSON.stringify(forms(heavy)) === JSON.stringify(["b01", "b02", "b04", "b05", "b06", "b08", "kad"]), { got: forms(heavy) });
  const pref = freshCase({ source: "PREFECT_WARNING", points: 2, offences: [{ code: "K01", name: "Lewat", points: 2 }] });
  t.check("prefect docs include b03", JSON.stringify(forms(pref)) === JSON.stringify(["b01", "b03", "b04", "kad"]), { got: forms(pref) });
  const conf = freshCase({ source: "COMPLAINT", points: 45, offences: [{ code: "B03", name: "Menjual / mengedar dadah", points: 45 }] });
  t.check("confiscation case includes b07", forms(conf).includes("b07"), { got: forms(conf) });
  t.check("confiscation case >=40 still b05/b06/b08", ["b05", "b06", "b08"].every((f) => forms(conf).includes(f)), { got: forms(conf) });
  const spot = freshCase({ source: "SPOT_CHECK", points: 45, offences: [{ code: "D04", name: "Vape", points: 45 }] });
  t.check("spot check docs include b02", forms(spot).includes("b02"), { got: forms(spot) });
  const c05 = freshCase({ source: "COMPLAINT", points: 5, offences: [{ code: "C01", name: "Buli bahasa", points: 5 }] });
  t.check("5 pts no b05", !forms(c05).includes("b05"), { got: forms(c05) });
  const c10 = freshCase({ source: "COMPLAINT", points: 10, offences: [{ code: "G08", name: "Ingkar", points: 10 }] });
  t.check("10 pts has b05+b06", forms(c10).includes("b05") && forms(c10).includes("b06"), { got: forms(c10) });

  const panels = SPSM.Workflow.flowPanels(heavy);
  t.check("heavy complaint b02 panel at REPORTED", panels.b02 === true, { got: panels.b02 });
  t.check("heavy complaint b06 panel", panels.b06 === true, { got: panels.b06 });
  t.check("heavy complaint b07 panel hidden", panels.b07 === false, { got: panels.b07 });
  const p2 = SPSM.Workflow.flowPanels(light);
  t.check("light complaint b02 panel hidden", p2.b02 === false, {});
  t.check("light complaint b06 panel hidden", p2.b06 === false, {});
  SPSM.Store.updateCase(light.id, { docs: { b07: { barang: "Telefon" } } });
  const p3 = SPSM.Workflow.flowPanels(SPSM.Store.caseById(light.id));
  t.check("b07 panel appears once barang recorded", p3.b07 === true, { got: p3.b07 });

  const docsGuru = SPSM.Workflow.visibleDocs(heavy, "guru").map((d) => d.form).sort();
  t.check("guru sees only b01+b02 on heavy case", JSON.stringify(docsGuru) === JSON.stringify(["b01", "b02"]), { got: docsGuru });
  const docsGuruLight = SPSM.Workflow.visibleDocs(light, "guru").map((d) => d.form).sort();
  t.check("guru sees only b01 on light case", JSON.stringify(docsGuruLight) === JSON.stringify(["b01"]), { got: docsGuruLight });
  const docsDisiplin = SPSM.Workflow.visibleDocs(heavy, "disiplin").map((d) => d.form).sort();
  t.check("disiplin sees all docs on heavy case", JSON.stringify(docsDisiplin) === JSON.stringify(["b01", "b02", "b04", "b05", "b06", "b08", "kad"]), { got: docsDisiplin });
  const docsPengetua = SPSM.Workflow.visibleDocs(heavy, "pengetua").map((d) => d.form).sort();
  t.check("pengetua sees all docs on heavy case", JSON.stringify(docsPengetua) === JSON.stringify(["b01", "b02", "b04", "b05", "b06", "b08", "kad"]), { got: docsPengetua });
  const docsPengawas = SPSM.Workflow.visibleDocs(heavy, "pengawas").map((d) => d.form).sort();
  t.check("pengawas blocked from docs (no case access anyway)", docsPengawas.length === 0, { got: docsPengawas.length });

  const b02a = SPSM.Store.addB02(heavy.id, { isu: "Isu A", punca: "Punca A" }, "Cikgu Nurul Aisyah", "Guru");
  const b02b = SPSM.Store.addB02(heavy.id, { isu: "Isu B", punca: "Punca B" }, "Tuan Hj. Syed Omar", "Guru Disiplin");
  t.check("addB02 returns entry with id", b02a.id === "B02-1" && b02b.id === "B02-2", { got: [b02a.id, b02b.id] });
  t.check("multiple B02 tracked per case", SPSM.Store.b02s(heavy.id).length === 2, { got: SPSM.Store.b02s(heavy.id).length });
  t.check("B02 entries carry filler + role + time", SPSM.Store.b02s(heavy.id).every((e) => e.fillBy && e.fillRole && e.filledAt), {});
  t.check("B02 fillers differ per user", b02a.fillBy !== b02b.fillBy, {});
  t.check("addB02 logs timeline event", heavy.events.some((e) => e.text.includes("Borang Siasatan (B02) diisi oleh Cikgu Nurul Aisyah")), {});
  const h1 = SPSM.Workflow.hasB02(heavy);
  t.check("hasB02 true after entries", h1 === true, { got: h1 });

  const dfs = SPSM.Workflow.docFillStatus(heavy);
  const dfsB02 = dfs.find((d) => d.code === "B02");
  t.check("docFillStatus B02 filled with both names", dfsB02.filled === true && dfsB02.by.includes("Cikgu Nurul Aisyah") && dfsB02.by.includes("Tuan Hj. Syed Omar"), { got: dfsB02.by });
  t.check("docFillStatus B01 filled by reporter", dfs.find((d) => d.code === "B01").filled === true, {});
  t.check("docFillStatus B04 not yet recorded (REPORTED)", dfs.find((d) => d.code === "B04").filled === false, { got: heavy.status });

  const heavyDone = freshCase({ source: "COMPLAINT", points: 30, offences: [{ code: "C02", name: "Buli", points: 20 }, { code: "G08", name: "Ingkar", points: 10 }] });
  SPSM.Store.advance(heavyDone.id, "startInvestigation", "Guru Disiplin");
  SPSM.Store.advance(heavyDone.id, "confirm", "Guru Disiplin");
  SPSM.Store.advance(heavyDone.id, "record", "Guru Disiplin");
  SPSM.Store.advance(heavyDone.id, "ack", "Guru Disiplin");
  const hd = SPSM.Store.caseById(heavyDone.id);
  const hdSteps = SPSM.Workflow.nextSteps(hd);
  t.check("step states: current step is prepare", hdSteps.some((s) => s.action === "prepare" && s.state === "current"), { got: hd.status });
  t.check("step states: no action step pending before its turn", hdSteps.every((s) => !s.action || s.state === "current" || s.state === "done"), { got: hdSteps.map((s) => s.action + ":" + s.state) });
  SPSM.Store.advance(heavyDone.id, "prepare", "Guru Disiplin");
  const hd2 = SPSM.Store.caseById(heavyDone.id);
  t.check("step states: approve becomes current at ACTION_PREPARED", SPSM.Workflow.nextSteps(hd2).some((s) => s.action === "approve" && s.state === "current"), { got: hd2.status });
  SPSM.Store.advance(heavyDone.id, "approve", "Guru Disiplin");
  const hd3 = SPSM.Store.caseById(heavyDone.id);
  t.check("step states: sign becomes current at PRINCIPAL_APPROVAL", SPSM.Workflow.nextSteps(hd3).some((s) => s.action === "sign" && s.state === "current"), { got: hd3.status });
  const hdDfs = SPSM.Workflow.docFillStatus(hd);
  t.check("docFillStatus B05 filled after STUDENT_ACK", hdDfs.find((d) => d.code === "B05").filled === true, { got: hd.status });
  t.check("docFillStatus B04 filled after RECORDED", hdDfs.find((d) => d.code === "B04").filled === true, {});
});

/* ============ SUITE 05: PRINT TEMPLATES ============ */
suite("05-print-templates", (t) => {
  t.reset();
  const heavy = freshCase({ source: "COMPLAINT", points: 30, offences: [{ code: "C02", name: "Buli fizikal", points: 20 }, { code: "G08", name: "Ingkar arahan guru", points: 10 }] });
  const pref = freshCase({ source: "PREFECT_WARNING", points: 2, offences: [{ code: "K01", name: "Lewat ke sekolah", points: 2 }] });
  const conf = freshCase({ source: "COMPLAINT", points: 45, offences: [{ code: "D04", name: "Menghisap vape", points: 45 }] });
  SPSM.Store.updateCase(conf.id, { docs: { b07: { barang: "Vape" } } });
  const spot = freshCase({ source: "SPOT_CHECK", points: 45, offences: [{ code: "D04", name: "Menghisap vape", points: 45 }] });
  SPSM.Store.addB02(spot.id, { isu: "X", punca: "Y", penambahbaikan: "Z" }, "Tuan Hj. Syed Omar", "Guru Disiplin");

  const t1 = SPSM.Tpl.b01(heavy);
  t.check("b01 title", t1.includes("BORANG ADUAN SALAH LAKU MURID"), {});
  t.check("b01 has offences", t1.includes("C02") && t1.includes("G08"), {});
  const t2 = SPSM.Tpl.b02(spot);
  t.check("b02 title", t2.includes("LAPORAN SIASATAN / ADUAN"), {});
  t.check("b02 print shows filler", t2.includes("Tuan Hj. Syed Omar"), {});
  SPSM.Store.addB02(spot.id, { isu: "Isu kedua", punca: "Punca kedua" }, "Pentadbir Ujian", "Pentadbir");
  const t2b = SPSM.Tpl.b02(spot);
  t.check("b02 print renders all entries", (t2b.match(/LAPORAN SIASATAN \/ ADUAN/g) || []).length === 2, { got: (t2b.match(/LAPORAN SIASATAN \/ ADUAN/g) || []).length });
  t.check("b02 print shows second filler", t2b.includes("Pentadbir Ujian"), {});
  const t3 = SPSM.Tpl.b03(pref);
  t.check("b03 title", t3.includes("KAD PERINGATAN"), {});
  t.check("b03 lists only <=5 codes", !t3.includes("A15") && !t3.includes("G01") && !t3.includes("G08"), {});
  t.check("b03 lists K01", t3.includes("K01"), {});
  SPSM.Store.advance(spot.id, "startInvestigation", "Guru Disiplin");
  SPSM.Store.advance(spot.id, "confirm", "Guru Disiplin");
  SPSM.Store.advance(spot.id, "record", "Guru Disiplin");
  const reg = SPSM.Store.recordedCases();
  const t4 = SPSM.Tpl.b04(heavy);
  t.check("b04 register title", t4.includes("REKOD DISIPLIN"), {});
  t.check("b04 register includes recorded cases", reg.length >= 2 && reg.some((x) => x.id === spot.id), { got: reg.length });
  t.check("b04 register excludes REPORTED", !reg.some((c) => c.status === "REPORTED"), {});
  t.check("b04 register excludes DISMISSED", !reg.some((c) => c.status === "DISMISSED"), {});
  t.check("b04 register rows rendered", (t4.match(/<tr>/g) || []).length >= reg.length + 1, { got: (t4.match(/<tr>/g) || []).length });
  const t5 = SPSM.Tpl.b05(heavy);
  t.check("b05 title", t5.includes("BORANG PENGAKUAN MURID"), {});
  const t6 = SPSM.Tpl.b06(heavy);
  t.check("b06 title", t6.includes("SURAT PEMBERITAHUAN / AMARAN"), {});
  t.check("b06 warning level", t6.includes("PERTAMA"), {});
  const t7 = SPSM.Tpl.b07(conf);
  t.check("b07 title", t7.includes("BARANG RAMPASAN"), {});
  t.check("b07 barang value", t7.includes("Vape"), {});
  const t8 = SPSM.Tpl.b08(heavy);
  t.check("b08 title", t8.includes("SURAT AKUJANJI"), {});
  const tk = SPSM.Tpl.kad(heavy);
  t.check("kad title", tk.includes("KAD SPSM"), {});
  t.check("kad code", tk.includes("LAM/DIS/002-1"), {});
  t.check("kad has student info", tk.includes(SPSM.Store.studentById("1").nama), {});
});

/* ============ SUITE 06: STORE PERSISTENCE ============ */
suite("06-store-persistence", (t) => {
  t.reset();
  t.check("seed has 4 cases", SPSM.Store.cases().length === 4, { got: SPSM.Store.cases().length });
  t.check("seed students 287", SPSM.Store.students().length === 287, { got: SPSM.Store.students().length });
  t.check("seq after seed is 104", SPSM.Store.load().seq === 104, { got: SPSM.Store.load().seq });
  const a = freshCase({});
  const b = freshCase({});
  t.check("seq increments", a.id !== b.id && Number(b.id.split("-")[1]) === Number(a.id.split("-")[1]) + 1, { got: [a.id, b.id] });
  t.check("persisted to localStorage", !!localStorage.getItem("spsm.foundation.v2"), {});
  t.check("reload keeps data", SPSM.Store.cases().length === 6, { got: SPSM.Store.cases().length });
  SPSM.Store.updateCase(a.id, { points: 99 });
  t.check("updateCase persists", SPSM.Store.caseById(a.id).points === 99, { got: SPSM.Store.caseById(a.id).points });
  SPSM.Store.addEvent(a.id, "peristiwa ujian", "Ujian");
  t.check("addEvent appends", SPSM.Store.caseById(a.id).events.some((e) => e.text === "peristiwa ujian"), {});
  t.check("casesOfStudent works", SPSM.Store.casesOfStudent("251").length >= 1, { got: SPSM.Store.casesOfStudent("251").length });
  t.check("studentById missing -> null", SPSM.Store.studentById("NOPE") === null, {});
  t.check("caseById missing -> null", SPSM.Store.caseById("NOPE") === null, {});
  SPSM.Store.reset();
  t.check("reset restores seeds", SPSM.Store.cases().length === 4, { got: SPSM.Store.cases().length });
  t.check("reset restores seq", SPSM.Store.load().seq === 104, { got: SPSM.Store.load().seq });
  t.check("reset clears new cases", SPSM.Store.caseById(a.id) === null, {});
});

/* ============ SUITE 07: STUDENT API ============ */
suite("07-student-api", (t) => {
  t.reset();
  t.check("catalog has 287 students", SPSM.StudentApi.count() === 287, { got: SPSM.StudentApi.count() });
  t.check("mock backend active by default", SPSM.StudentApi.isLive() === false, {});
  const first = SPSM.StudentApi.getById(1);
  t.check("getById(1) returns student", !!first, {});
  t.check("ic_number masked format", /^\d{6}-\d{2}-\d{4}$/.test(first.ic_number), { got: first.ic_number });
  t.check("ic_number masked != raw", first.ic_number !== "130419-10-2707", { got: first.ic_number });
  t.check("name preserved from API", first.nama === "ABDUL HAKIM AL AQHARI BIN ABDUL HALIM", { got: first.nama });
  t.check("kelas combined label", first.kelas === "1 IMAM NAFI'", { got: first.kelas });
  t.check("kelasStream raw", first.kelasStream === "IMAM NAFI'", { got: first.kelasStream });
  t.check("noDikenal derived", first.noDikenal === "MIT001", { got: first.noDikenal });
  t.check("gender derived", first.jantina === "Lelaki", { got: first.jantina });
  t.check("umur derived", first.umur === first.year - first.birth_year, { got: first.umur });
  t.check("bapa derived from name after BIN", first.bapa === "ABDUL HALIM", { got: first.bapa });
  t.check("placeholder guardian fields present", !!first.ibu && !!first.alamat && !!first.telBimbit && !!first.waris, {});

  const s1 = SPSM.StudentApi.search({ q: "abdul" });
  t.check("search q 'abdul' works", s1.total > 0 && s1.items.every((s) => s.nama.toLowerCase().includes("abdul")), { got: s1.total });
  const s2 = SPSM.StudentApi.search({ tingkatan: 5 });
  t.check("filter tingkatan=5", s2.items.every((s) => s.tingkatan === 5) && s2.total > 0, { got: s2.total });
  const s3 = SPSM.StudentApi.search({ kelas: "IBNU KATHIR" });
  t.check("filter kelas stream", s3.items.every((s) => s.kelasStream === "IBNU KATHIR") && s3.total > 0, { got: s3.total });
  const s4 = SPSM.StudentApi.search({ gender: "female" });
  t.check("filter gender female", s4.items.every((s) => s.gender === "female") && s4.total > 0, { got: s4.total });
  const s5 = SPSM.StudentApi.search({ tingkatan: 1, kelas: "IMAM NAFI'" });
  t.check("combined tingkatan+kelas filter", s5.total > 0 && s5.items.every((s) => s.tingkatan === 1 && s.kelasStream === "IMAM NAFI'"), { got: s5.total });
  const s6 = SPSM.StudentApi.search({ limit: 10, offset: 0 });
  t.check("pagination limit", s6.items.length === 10, { got: s6.items.length });
  const s7 = SPSM.StudentApi.search({ sort_by: "tingkatan", order: "desc" });
  t.check("sort tingkatan desc", s7.items[0].tingkatan >= s7.items[s7.items.length - 1].tingkatan, { got: s7.items[0].tingkatan });
  t.check("total consistent (empty query = 287)", SPSM.StudentApi.search({ q: "" }).total === 287, { got: SPSM.StudentApi.search({ q: "" }).total });
  t.check("getById missing -> null", SPSM.StudentApi.getById(99999) === null, {});
  t.check("tingkatanList 1-5", JSON.stringify(SPSM.StudentApi.tingkatanList()) === JSON.stringify([1, 2, 3, 4, 5]), { got: SPSM.StudentApi.tingkatanList() });
  t.check("kelasList both streams", SPSM.StudentApi.kelasList().length === 2, { got: SPSM.StudentApi.kelasList() });

  const snapshotCase = freshCase({ source: "COMPLAINT", studentId: "1", points: 2, offences: [{ code: "K01", name: "Lewat", points: 2 }] });
  t.check("case stores studentSnapshot", !!snapshotCase.studentSnapshot && snapshotCase.studentSnapshot.nama === "ABDUL HAKIM AL AQHARI BIN ABDUL HALIM", { got: snapshotCase.studentSnapshot && snapshotCase.studentSnapshot.nama });
  t.check("studentById works via catalog", SPSM.Store.studentById("1").nama === "ABDUL HAKIM AL AQHARI BIN ABDUL HALIM", {});
  t.check("studentById falls back to snapshot", SPSM.Store.studentById(snapshotCase.studentSnapshot.id) !== null, {});
  const before = SPSM.StudentApi.count();
  t.check("catalog not persisted (no students key)", !JSON.parse(memStore["spsm.foundation.v2"]).students, {});
  t.check("catalog count stable after reset", before === SPSM.StudentApi.count(), {});
});

/* ============ REPORT WRITER ============ */
function esc(s) {
  return String(s == null ? "" : s).replace(/\|/g, "\\|");
}

function mdRow(cells) {
  return "| " + cells.map(esc).join(" | ") + " |";
}

function writeReport(filename, title, results, intro) {
  const pass = results.filter((r) => r.pass).length;
  const fail = results.length - pass;
  const lines = [];
  lines.push(`# ${title}`);
  lines.push("");
  lines.push(`> Dijana pada: ${new Date().toISOString()} · Total: ${results.length} · ✅ Lulus: ${pass} · ❌ Gagal: ${fail}`);
  lines.push("");
  if (intro) lines.push(intro, "");
  lines.push("## Ringkasan");
  lines.push("");
  lines.push(mdRow(["Keputusan", "Bilangan"]));
  lines.push(mdRow(["---", "---"]));
  lines.push(mdRow(["✅ Lulus", pass]));
  lines.push(mdRow(["❌ Gagal", fail]));
  lines.push(mdRow(["Total", results.length]));
  lines.push("");
  lines.push("## Keputusan Terperinci");
  lines.push("");
  lines.push(mdRow(["#", "Ujian", "Status", "Jangkaan / Sebenar"]));
  lines.push(mdRow(["---", "---", "---", "---"]));
  results.forEach((r, i) => {
    const d = r.detail || {};
    let info = "";
    if ("got" in d && "want" in d) info = `expect=${JSON.stringify(d.want)} got=${JSON.stringify(d.got)}`;
    else if ("got" in d) info = `got=${JSON.stringify(d.got)}`;
    lines.push(mdRow([i + 1, r.name, r.pass ? "✅ PASS" : "❌ FAIL", info]));
  });
  if (fail) lines.push("", "> ⚠️ Terdapat kegagalan — semak jadual di atas.");
  lines.push("");
  fs.writeFileSync(path.join(REPORTS_DIR, filename), lines.join("\n"), "utf8");
}

if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

const ALL_TITLES = {
  "01-workflows": "Behavior Report — Aliran Kerja (Workflows)",
  "02-merit-rules": "Behavior Report — Peraturan Mata SPSM (Merit Rules)",
  "03-roles-access": "Behavior Report — Peranan & Kebenaran Akses (Roles & Access)",
  "04-documents": "Behavior Report — Dokumen & Panel Mengikut Kes (Documents)",
  "05-print-templates": "Behavior Report — Templat Cetakan B01-B08 & Kad SPSM (Print Templates)",
  "06-store-persistence": "Behavior Report — Penyimpanan Data (Store & Persistence)",
  "07-student-api": "Behavior Report — API Pelajar (Student API & Snapshot)"
};

suites.forEach((s) => {
  writeReport(s.name + ".md", ALL_TITLES[s.name], s.results);
});

const all = suites.flatMap((s) => s.results);
const pass = all.filter((r) => r.pass).length;
const fail = all.length - pass;

const summary = [];
summary.push("# Behavior Report — Ringkasan Keseluruhan (SPSM MITS)");
summary.push("");
summary.push(`> Dijana pada: ${new Date().toISOString()} · Total ujian: ${all.length} · ✅ Lulus: ${pass} · ❌ Gagal: ${fail}`);
summary.push("");
summary.push("## Senarai Laporan");
summary.push("");
summary.push(mdRow(["Laporan", "Ujian", "Lulus", "Gagal"]));
summary.push(mdRow(["---", "---", "---", "---"]));
suites.forEach((s) => {
  const p = s.results.filter((r) => r.pass).length;
  summary.push(mdRow([`[${s.name}.md](./${s.name}.md)`, s.results.length, p, s.results.length - p]));
});
summary.push(mdRow(["**Total**", all.length, pass, fail]));
summary.push("");
summary.push("## Senario Dilindungi");
summary.push("");
summary.push("- **Aliran (Workflows):** aduan guru ≤5 mata (auto B04), aduan guru >5 mata (B02 → berasas → B04 → B05 → B06/B08 → pengetua → hukuman → maklum ibu bapa → pertemuan / tanpa pertemuan), cabang tolak (dismiss), kad peringatan pengawas (terima → B04 / tolak), spot check (B02 → B04), peralihan haram ditolak, laluan stepper mengikut sumber & mata.");
summary.push("- **Peraturan mata:** sempadan tier 1–50, borang wajib pada 10/20/30/40, sempadan B02 & auto-B04 pada 5/6 mata, senarai pengawas (53 kesalahan ≤5 mata), rampasan (rampas/sita).");
summary.push("- **Peranan & akses:** matriks 14 tindakan × 4 peranan, kawalan laluan (guru/pengawas/disiplin/pengetua), cap 5 mata pengawas, B02 boleh diisi guru & disiplin.");
summary.push("- **Dokumen:** keterlihatan B01–B08 + Kad SPSM mengikut jenis kes (b02 hanya perlu siasatan, b07 hanya rampasan, b05/b06 ≥10 mata, b08 ≥30 mata).");
summary.push("- **Templat cetakan:** semua 9 dokumen dijana, B04 daftar penuh hanya kes direkod (kecuali REPORTED/DISMISSED), B03 senarai kod ≤5 mata sahaja.");
summary.push("- **Penyimpanan:** kitaran save/load localStorage, kenaikan seq, reset kembali kepada data seed.");
if (fail) summary.push("", "> ⚠️ Terdapat kegagalan ujian. Sila lihat laporan berkaitan untuk butiran.");
summary.push("");
fs.writeFileSync(path.join(REPORTS_DIR, "00-summary.md"), summary.join("\n"), "utf8");

console.log(`\n================ REPORT ================`);
suites.forEach((s) => {
  const p = s.results.filter((r) => r.pass).length;
  console.log(`${s.name}: ${p}/${s.results.length} passed`);
});
console.log(`TOTAL: ${pass}/${all.length} passed, ${fail} failed`);
console.log(`Reports written to: ${REPORTS_DIR}`);

process.exit(fail ? 1 : 0);
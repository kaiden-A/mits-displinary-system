(function () {
  SPSM.esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  };

  SPSM.fmtDate = function (iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    var dd = String(d.getDate()).padStart(2, "0");
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    return dd + "-" + mm + "-" + d.getFullYear();
  };

  SPSM.fmtDateTime = function (iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return SPSM.fmtDate(iso) + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  };

  SPSM.studentPicker = function (container) {
    var tingkatanList = SPSM.StudentApi.tingkatanList();
    container.innerHTML =
      '<select class="sp-tingkatan w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" required>' +
      '<option value="">— Pilih Tingkatan —</option>' +
      tingkatanList.map(function (t) { return '<option value="' + t + '">Tingkatan ' + t + "</option>"; }).join("") +
      "</select>" +
      '<select class="sp-kelas w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" required>' +
      '<option value="">— Pilih Kelas —</option>' +
      "</select>" +
      '<select class="sp-murid w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" name="studentId" required>' +
      '<option value="">— Pilih Murid —</option>' +
      "</select>";
    var tingkatanEl = container.querySelector(".sp-tingkatan");
    var kelasEl = container.querySelector(".sp-kelas");
    var muridEl = container.querySelector(".sp-murid");
    tingkatanEl.addEventListener("change", function () {
      var t = tingkatanEl.value;
      var streams = t ? SPSM.StudentApi.kelasList(t) : [];
      kelasEl.innerHTML = '<option value="">— Pilih Kelas —</option>' +
        streams.map(function (k) { return '<option value="' + SPSM.esc(k) + '">' + SPSM.esc(k) + "</option>"; }).join("");
      muridEl.innerHTML = '<option value="">— Pilih Murid —</option>';
    });
    kelasEl.addEventListener("change", function () {
      var t = tingkatanEl.value;
      var k = kelasEl.value;
      muridEl.innerHTML = '<option value="">— Pilih Murid —</option>' +
        SPSM.StudentApi.list()
          .filter(function (s) { return s.tingkatan === Number(t) && s.kelasStream === k; })
          .sort(function (a, b) { return a.nama.localeCompare(b.nama); })
          .map(function (s) { return '<option value="' + s.id + '">' + SPSM.esc(s.nama) + "</option>"; })
          .join("");
    });
  };

  SPSM.offencePicker = function (container, opts) {
    var o = opts || {};
    var allow = o.allow || function () { return true; };
    var cap = o.cap || null;
    var accent = o.accent === "amber"
      ? { ring: "focus:ring-amber-500", hover: "hover:bg-amber-50", chip: "bg-amber-50 border-amber-200 text-amber-800", total: "text-amber-700", code: "text-amber-700" }
      : { ring: "focus:ring-emerald-500", hover: "hover:bg-emerald-50", chip: "bg-emerald-50 border-emerald-200 text-emerald-800", total: "text-emerald-700", code: "text-emerald-700" };
    var state = { selected: [], total: 0 };

    var cats = Object.keys(SPSM.Offences.CATEGORIES).filter(function (k) {
      return SPSM.Offences.all().some(function (x) { return x.cat === k && allow(x); });
    });

    container.innerHTML =
      '<div>' +
      '<div class="grid md:grid-cols-2 gap-2 mb-2">' +
      '<select class="op-cat w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ' + accent.ring + '">' +
      '<option value="ALL">Semua Kategori (A–N)</option>' +
      cats.map(function (k) { return '<option value="' + k + '">' + k + " · " + SPSM.esc(SPSM.Offences.CATEGORIES[k]) + "</option>"; }).join("") +
      "</select>" +
      '<input type="text" class="op-search w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ' + accent.ring + '" placeholder="Cari kesalahan (kod / nama)…">' +
      "</div>" +
      '<div class="relative">' +
      '<div class="op-results absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-64 overflow-auto hidden"></div>' +
      "</div>" +
      '<div class="op-chips flex flex-wrap gap-2 mt-2"></div>' +
      '<div class="op-total text-sm mt-2 font-semibold ' + accent.total + '"></div>' +
      "</div>";

    var catEl = container.querySelector(".op-cat");
    var searchEl = container.querySelector(".op-search");
    var resEl = container.querySelector(".op-results");
    var chipsEl = container.querySelector(".op-chips");
    var totalEl = container.querySelector(".op-total");

    function pointsOptions(off) {
      var out = "";
      for (var p = off.min; p <= off.max; p += 5) {
        if (p > off.max) break;
        out += '<option value="' + p + '">' + p + " mata</option>";
      }
      return out;
    }

    function update() {
      state.total = state.selected.reduce(function (s, i) { return s + i.points; }, 0);
      totalEl.textContent = "Jumlah mata SPSM: " + state.total + (cap ? " / " + cap : "");
      totalEl.classList.toggle("text-red-600", !!cap && state.total > cap);
      chipsEl.innerHTML = state.selected.map(function (i, idx) {
        return '<span class="inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs ' + accent.chip + '">' +
          '<span class="font-mono font-bold">' + i.code + "</span>" + SPSM.esc(i.name) +
          (i.min !== i.max
            ? '<select class="op-pts text-xs rounded border border-slate-200 bg-white px-1" data-idx="' + idx + '">' + pointsOptions(i) + "</select>"
            : '<span class="font-bold">' + i.points + " mata</span>") +
          '<button class="op-del text-red-400 hover:text-red-600 font-bold" data-idx="' + idx + '" title="Buang">&times;</button></span>';
      }).join("");
    }

    function renderResults() {
      var q = searchEl.value.toLowerCase();
      var cat = catEl.value;
      var list = SPSM.Offences.all().filter(function (x) {
        if (!allow(x)) return false;
        if (cat !== "ALL" && x.cat !== cat) return false;
        return !q || x.code.toLowerCase().indexOf(q) !== -1 || x.name.toLowerCase().indexOf(q) !== -1;
      });
      resEl.innerHTML = list.map(function (x) {
        return '<button type="button" data-code="' + x.code + '" class="block w-full text-left px-3 py-1.5 text-sm ' + accent.hover + '">' +
          '<span class="font-mono font-semibold ' + accent.code + '">' + x.code + "</span> — " + SPSM.esc(x.name) +
          ' <span class="text-slate-400 text-xs">(' + SPSM.Offences.range(x) + " mata" + (x.action ? " · " + SPSM.esc(x.action) : "") + ")</span></button>";
      }).join("") || '<div class="px-3 py-2 text-sm text-slate-400">Tiada padanan.</div>';
      resEl.classList.remove("hidden");
    }

    searchEl.addEventListener("input", renderResults);
    searchEl.addEventListener("focus", renderResults);
    catEl.addEventListener("change", renderResults);
    resEl.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-code]");
      if (!btn) return;
      var off = SPSM.Offences.byCode(btn.dataset.code);
      if (!off || state.selected.some(function (i) { return i.code === off.code; })) return;
      if (cap !== null && state.total + off.max > cap) {
        SPSM.toast("Jumlah mata tidak boleh melebihi " + cap + ".", "error");
        return;
      }
      state.selected.push({ code: off.code, name: off.name, min: off.min, max: off.max, points: off.max });
      searchEl.value = "";
      resEl.classList.add("hidden");
      update();
    });
    chipsEl.addEventListener("click", function (e) {
      var del = e.target.closest(".op-del");
      if (del) {
        state.selected.splice(Number(del.dataset.idx), 1);
        update();
      }
    });
    chipsEl.addEventListener("change", function (e) {
      var sel = e.target.closest(".op-pts");
      if (sel) {
        state.selected[Number(sel.dataset.idx)].points = Number(sel.value);
        update();
      }
    });
    document.addEventListener("click", function (e) {
      if (!container.contains(e.target)) resEl.classList.add("hidden");
    });

    return {
      get selected() { return state.selected; },
      get total() { return state.total; }
    };
  };

  var ROLES = {
    guru: { label: "Guru", home: "#/report" },
    pengawas: { label: "Pengawas", home: "#/warning" },
    disiplin: { label: "Guru Disiplin", home: "#/dashboard" },
    pengetua: { label: "Pengetua", home: "#/dashboard" }
  };

  var NAV = {
    guru: [
      { href: "#/report", icon: "fa-pen-to-square", label: "Buat Aduan" },
      { href: "#/catalogue", icon: "fa-book", label: "Katalog Kesalahan" }
    ],
    pengawas: [
      { href: "#/warning", icon: "fa-triangle-exclamation", label: "Kad Peringatan" }
    ],
    disiplin: [
      { href: "#/dashboard", icon: "fa-gauge-high", label: "Papan Pemuka" },
      { href: "#/students", icon: "fa-users", label: "Senarai Murid" },
      { href: "#/catalogue", icon: "fa-book", label: "Katalog Kesalahan" }
    ],
    pengetua: [
      { href: "#/dashboard", icon: "fa-gauge-high", label: "Papan Pemuka" },
      { href: "#/students", icon: "fa-users", label: "Senarai Murid" },
      { href: "#/catalogue", icon: "fa-book", label: "Katalog Kesalahan" }
    ]
  };

  SPSM.state = {
    role: "disiplin",
    get roleLabel() { return (ROLES[this.role] || {}).label || this.role; }
  };

  var MOCK_USERS = {
    guru: "Cikgu Nurul Aisyah binti Mohd Zain",
    pengawas: "Pengawas Amirul Hakim bin Azman",
    disiplin: "Tuan Hj. Syed Omar bin Syed Ahmad",
    pengetua: "Dato' Hj. Abu Bakar bin Jamal"
  };

  SPSM.currentUser = function () {
    return MOCK_USERS[SPSM.state.role] || "Pengguna Sistem";
  };

  SPSM.canAccessRoute = SPSM.Workflow.canAccessRoute;

  SPSM.homeFor = SPSM.Workflow.homeFor;

  function pendingCount() {
    var cases = SPSM.Store.cases();
    if (SPSM.state.role === "pengetua") {
      return cases.filter(function (c) { return c.status === "PRINCIPAL_APPROVAL"; }).length;
    }
    if (SPSM.state.role === "disiplin") {
      return cases.filter(function (c) { return c.status === "REPORTED" || c.status === "INVESTIGATING"; }).length;
    }
    return 0;
  }

  function renderSidebar() {
    var sidebar = document.getElementById("sidebar");
    var nav = NAV[SPSM.state.role] || [];
    var roleOpts = Object.keys(ROLES).map(function (k) {
      return '<option value="' + k + '"' + (k === SPSM.state.role ? " selected" : "") + ">" + ROLES[k].label + "</option>";
    }).join("");
    var n = pendingCount();
    var isManager = SPSM.state.role === "disiplin" || SPSM.state.role === "pengetua";
    var bell = isManager && n > 0
      ? '<a href="#/dashboard" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 relative">' +
        '<i class="fa-solid fa-bell w-5 text-center"></i>Notifikasi' +
        '<span class="badge-pop ml-auto min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">' + n + "</span></a>"
      : "";
    sidebar.innerHTML =
      '<div class="flex items-center gap-3 px-4 py-5 border-b border-slate-800">' +
      '<div class="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center font-extrabold text-white text-sm shrink-0"><i class="fa-solid fa-shield-halved text-lg"></i></div>' +
      '<div class="min-w-0"><div class="font-bold leading-tight text-sm">MAAHAD INTEGRASI TAHFIZ SELANGOR</div>' +
      '<div class="text-[11px] text-slate-400">Sistem Pembangunan Sahsiah Murid</div></div>' +
      "</div>" +
      '<div class="px-4 py-4 border-b border-slate-800">' +
      '<label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Log masuk sebagai</label>' +
      '<select id="role-switch" class="mt-1.5 w-full bg-slate-800 border border-slate-600 text-white text-xs font-semibold rounded-lg px-2.5 py-2 focus:outline-none">' + roleOpts + "</select>" +
      "</div>" +
      '<nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">' +
      '<div class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-3 pb-2">Menu</div>' +
      nav.map(function (item) {
        var active = window.location.hash.split("?")[0] === item.href;
        return '<a href="' + item.href + '" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ' + (active ? "bg-emerald-600 text-white shadow" : "text-slate-300 hover:bg-slate-800 hover:text-white") + '">' +
          '<i class="fa-solid ' + item.icon + ' w-5 text-center"></i>' + item.label + "</a>";
      }).join("") +
      bell +
      "</nav>" +
      '<div class="px-4 py-4 border-t border-slate-800 flex items-center gap-3">' +
      '<div class="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center"><i class="fa-solid fa-user text-slate-300 text-sm"></i></div>' +
      '<div class="min-w-0"><div class="text-xs font-semibold truncate">' + ROLES[SPSM.state.role].label + '</div>' +
      '<div class="text-[10px] text-slate-500 truncate">' + SPSM.currentUser() + "</div></div>" +
      "</div>";
    var sel = document.getElementById("role-switch");
    if (sel) {
      sel.addEventListener("change", function () {
        switchRole(sel.value);
      });
    }
  }

  function switchRole(role) {
    SPSM.state.role = role;
    SPSM.Store.setRole(role);
    renderSidebar();
    var home = ROLES[role].home;
    window.location.hash = home;
    var n = pendingCount();
    if (n > 0 && (role === "disiplin" || role === "pengetua")) {
      SPSM.toast("Anda ada " + n + " kes menunggu tindakan.", "info");
    }
  }

  function render() {
    var app = document.getElementById("app");
    var hash = window.location.hash.replace(/^#/, "") || "/dashboard";
    var parts = hash.split("/");
    var view = parts[1] || "dashboard";
    var id = parts[2] || null;

    if (!SPSM.canAccessRoute(SPSM.state.role, view)) {
      window.location.hash = SPSM.homeFor(SPSM.state.role);
      return;
    }

    var v = null;
    var args = [];

    if (view === "case" && id) {
      v = SPSM.Views.caseDetail;
      args = [id];
    } else if (view === "student" && id) {
      v = SPSM.Views.student;
      args = [id];
    } else if (view === "report") {
      v = SPSM.Views.report;
    } else if (view === "warning") {
      v = SPSM.Views.warning;
    } else if (view === "catalogue") {
      v = SPSM.Views.catalogue;
    } else if (view === "students") {
      v = SPSM.Views.students;
    } else {
      v = SPSM.Views.dashboard;
      args = [SPSM.state.role];
    }

    app.innerHTML = v.render.apply(null, args);
    if (v.afterRender) v.afterRender.apply(null, args);
    window.scrollTo(0, 0);
    renderSidebar();
  }

  SPSM.toast = function (msg, type) {
    var root = document.getElementById("toast-root");
    var colors = {
      success: "bg-emerald-600",
      error: "bg-red-600",
      info: "bg-slate-800"
    };
    var el = document.createElement("div");
    el.className = "toast " + (colors[type] || colors.info) + " text-white text-sm font-medium rounded-lg px-4 py-3 shadow-lg max-w-sm";
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(function () {
      el.style.opacity = "0";
      el.style.transition = "opacity .3s";
      setTimeout(function () { el.remove(); }, 300);
    }, 4000);
  };

  SPSM.Bus.on("case-created", function () {
    if (SPSM.state.role === "disiplin" || SPSM.state.role === "pengetua") renderSidebar();
  });
  SPSM.Bus.on("case-updated", function () {
    renderSidebar();
  });

  window.addEventListener("hashchange", render);

  function init() {
    SPSM.Store.load();
    var saved = SPSM.Store.settings().role;
    if (ROLES[saved]) SPSM.state.role = saved;
    renderSidebar();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
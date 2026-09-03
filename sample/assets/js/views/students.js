(function () {
  var TIER_COLORS = {
    1: "bg-slate-100 text-slate-600 border-slate-200",
    2: "bg-amber-100 text-amber-700 border-amber-200",
    3: "bg-orange-100 text-orange-700 border-orange-200",
    4: "bg-red-100 text-red-700 border-red-200",
    5: "bg-red-200 text-red-800 border-red-300",
    6: "bg-red-300 text-red-900 border-red-400"
  };

  function studentStats() {
    var students = SPSM.Store.students();
    var cases = SPSM.Store.cases();
    return students.map(function (st) {
      var sc = cases.filter(function (c) { return c.studentId === st.id; });
      var total = sc.reduce(function (s, c) { return s + c.points; }, 0);
      var latest = sc.slice().sort(function (a, b) { return new Date(b.created) - new Date(a.created); })[0] || null;
      return { st: st, cases: sc, total: total, latest: latest };
    });
  }

  function tierBadge(points, count) {
    if (!count) return '<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-slate-50 text-slate-400 border-slate-200">Tiada Rekod</span>';
    var tier = SPSM.Spsm.tierFor(points);
    return '<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ' + (TIER_COLORS[tier.tier] || TIER_COLORS[1]) + '">' + tier.label.replace("Peringkat ", "T") + "</span>";
  }

  function buildRows(rows) {
    return rows.map(function (r, i) {
      var st = r.st;
      var latest = r.latest;
      var latestCell = latest
        ? '<div class="text-sm text-slate-800">' + SPSM.esc(latest.offences[0].code) + ' <span class="text-xs text-slate-400">·</span> <span class="text-xs text-slate-500">' + SPSM.fmtDate(latest.created) + "</span></div>" +
          '<div class="mt-1">' + SPSM.Workflow.statusBadge(latest.status) + "</div>"
        : '<span class="text-xs text-slate-300">—</span>';
      return "<tr class='hover:bg-slate-50 border-t border-slate-100'>" +
        '<td class="px-3 py-2.5 text-xs text-slate-400">' + (i + 1) + "</td>" +
        '<td class="px-3 py-2.5"><a href="#/student/' + st.id + '" class="font-medium text-slate-800 hover:text-emerald-700">' + SPSM.esc(st.nama) + "</a>" +
        '<div class="text-xs text-slate-400">' + SPSM.esc(st.noDikenal) + "</div></td>" +
        '<td class="px-3 py-2.5 text-sm text-slate-600">' + SPSM.esc(st.kelas) + "</td>" +
        '<td class="px-3 py-2.5 text-xs text-slate-500">' + SPSM.esc(st.jantina) + "</td>" +
        '<td class="px-3 py-2.5 text-center font-semibold text-slate-800">' + r.cases.length + "</td>" +
        '<td class="px-3 py-2.5 text-center"><span class="font-bold text-slate-800">' + r.total + "</span></td>" +
        '<td class="px-3 py-2.5">' + tierBadge(r.total, r.cases.length) + "</td>" +
        '<td class="px-3 py-2.5">' + latestCell + "</td>" +
        '<td class="px-3 py-2.5 text-right whitespace-nowrap">' +
        '<a href="#/student/' + st.id + '" class="text-xs font-semibold text-emerald-700 hover:underline">Profil</a>' +
        '<button type="button" data-print-kad="' + st.id + '" class="ml-2 text-xs font-semibold text-slate-500 hover:text-emerald-700 hover:underline">Cetak Kad</button>' +
        "</td></tr>";
    }).join("");
  }

  function render() {
    var students = SPSM.Store.students();
    var all = studentStats();
    var tingkatanList = SPSM.StudentApi.tingkatanList();
    var kelasList = SPSM.StudentApi.kelasList();

    var stats = all.reduce(function (acc, r) {
      acc.withRecords += r.cases.length ? 1 : 0;
      acc.totalCases += r.cases.length;
      acc.totalPoints += r.total;
      return acc;
    }, { withRecords: 0, totalCases: 0, totalPoints: 0 });

    function statBox(label, value, color, icon) {
      return '<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">' +
        '<div class="w-11 h-11 rounded-lg flex items-center justify-center text-lg ' + color + '"><i class="fa-solid ' + icon + '"></i></div>' +
        '<div><div class="text-2xl font-bold leading-none">' + value + '</div><div class="text-xs text-slate-500 mt-1">' + label + "</div></div></div>";
    }

    return '<div class="mb-6 flex flex-wrap items-center justify-between gap-3">' +
      '<div><h1 class="text-xl font-bold text-slate-800"><i class="fa-solid fa-users text-emerald-600 mr-2"></i>Senarai Murid &amp; Rekod Kesalahan</h1>' +
      '<p class="text-sm text-slate-500">Semua murid dengan jumlah mata SPSM dan rekod kesalahan mereka. Klik nama murid untuk profil penuh.</p></div>' +
      '<button id="print-b04" class="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg px-4 py-2 shadow-sm"><i class="fa-solid fa-print mr-1.5"></i>Cetak B04</button></div>' +
      '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">' +
      statBox("Jumlah Murid", students.length, "bg-slate-100 text-slate-600", "fa-users") +
      statBox("Murid Ada Rekod", stats.withRecords, "bg-amber-100 text-amber-700", "fa-folder-open") +
      statBox("Jumlah Kes", stats.totalCases, "bg-violet-100 text-violet-700", "fa-scale-balanced") +
      statBox("Jumlah Mata SPSM", stats.totalPoints, "bg-emerald-100 text-emerald-700", "fa-star") +
      "</div>" +
      '<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">' +
      '<div class="grid md:grid-cols-2 lg:grid-cols-5 gap-3">' +
      '<div class="lg:col-span-2"><label class="block text-xs font-semibold text-slate-600 mb-1">Cari murid</label>' +
      '<input id="st-search" type="text" placeholder="Nama / No. Dikenal / No. K/P…" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"></div>' +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Tingkatan</label>' +
      '<select id="st-tingkatan" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">' +
      '<option value="ALL">Semua</option>' +
      tingkatanList.map(function (t) { return '<option value="' + t + '">Tingkatan ' + t + "</option>"; }).join("") +
      "</select></div>" +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Kelas</label>' +
      '<select id="st-kelas" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">' +
      '<option value="ALL">Semua Kelas</option>' +
      kelasList.map(function (k) { return '<option value="' + SPSM.esc(k) + '">' + SPSM.esc(k) + "</option>"; }).join("") +
      "</select></div>" +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Susunan</label>' +
      '<select id="st-sort" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">' +
      '<option value="points">Mata Tertinggi</option>' +
      '<option value="cases">Kes Terbanyak</option>' +
      '<option value="name">Nama A–Z</option>' +
      '<option value="kelas">Tingkatan</option>' +
      "</select></div>" +
      "</div>" +
      '<label class="inline-flex items-center gap-2 mt-3 text-sm text-slate-600 cursor-pointer">' +
      '<input id="st-hasrec" type="checkbox" class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500">' +
      "Tunjukkan murid yang ada rekod sahaja" +
      "</label>" +
      "</div>" +
      '<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">' +
      '<div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">' +
      '<h2 class="font-semibold text-slate-800">Rekod Kesalahan Murid</h2>' +
      '<div class="text-xs text-slate-400" id="st-count">' + students.length + " murid</div></div>" +
      '<div class="overflow-x-auto"><table class="w-full text-sm">' +
      "<thead><tr class='text-left text-xs uppercase tracking-wide text-slate-400'>" +
      "<th class='px-3 py-2'>Bil</th><th class='px-3 py-2'>Murid</th><th class='px-3 py-2'>Kelas</th><th class='px-3 py-2'>Jantina</th><th class='px-3 py-2 text-center'>Kes</th><th class='px-3 py-2 text-center'>Mata</th><th class='px-3 py-2'>Peringkat</th><th class='px-3 py-2'>Kesalahan Terkini</th><th class='px-3 py-2'></th>" +
      "</tr></thead>" +
      '<tbody id="st-rows">' + buildRows(all) + "</tbody></table></div></div>";
  }

  function afterRender() {
    var printB04 = document.getElementById("print-b04");
    if (printB04) {
      printB04.addEventListener("click", function () {
        SPSM.Print.b04(null);
      });
    }
    var search = document.getElementById("st-search");
    var tingkatan = document.getElementById("st-tingkatan");
    var kelas = document.getElementById("st-kelas");
    var sort = document.getElementById("st-sort");
    var hasRec = document.getElementById("st-hasrec");
    var rowsEl = document.getElementById("st-rows");
    var countEl = document.getElementById("st-count");

    function apply() {
      var q = (search.value || "").toLowerCase();
      var t = tingkatan.value;
      var k = kelas.value;
      var s = sort.value;
      var onlyRec = hasRec.checked;
      var all = studentStats().filter(function (r) {
        if (onlyRec && !r.cases.length) return false;
        if (t !== "ALL" && r.st.tingkatan !== Number(t)) return false;
        if (k !== "ALL" && r.st.kelasStream !== k) return false;
        if (!q) return true;
        return r.st.nama.toLowerCase().indexOf(q) !== -1 ||
          (r.st.noDikenal || "").toLowerCase().indexOf(q) !== -1 ||
          (r.st.ic_number || "").toLowerCase().indexOf(q) !== -1 ||
          r.st.kelas.toLowerCase().indexOf(q) !== -1;
      });
      all.sort(function (a, b) {
        if (s === "points") return b.total - a.total;
        if (s === "cases") return b.cases.length - a.cases.length;
        if (s === "name") return a.st.nama.localeCompare(b.st.nama);
        return a.st.tingkatan - b.st.tingkatan || a.st.kelasStream.localeCompare(b.st.kelasStream) || a.st.nama.localeCompare(b.st.nama);
      });
      rowsEl.innerHTML = all.length ? buildRows(all) : '<tr><td colspan="9" class="px-3 py-8 text-center text-slate-400 text-sm">Tiada murid sepadan.</td></tr>';
      countEl.textContent = all.length + " murid";
    }

    search.addEventListener("input", apply);
    tingkatan.addEventListener("change", apply);
    kelas.addEventListener("change", apply);
    sort.addEventListener("change", apply);
    hasRec.addEventListener("change", apply);
    rowsEl.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-print-kad]");
      if (!btn) return;
      var id = btn.dataset.printKad;
      var cases = SPSM.Store.casesOfStudent(id);
      var probe = cases[0] || {
        id: "—",
        studentId: id,
        status: "REPORTED",
        offences: [],
        points: 0,
        created: new Date().toISOString(),
        meeting: null,
        events: []
      };
      SPSM.Print.kad(probe);
    });
  }

  SPSM.Views = SPSM.Views || {};
  SPSM.Views.students = { render: render, afterRender: afterRender };
})();
(function () {
  function statCard(label, value, color, icon) {
    return '<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">' +
      '<div class="w-11 h-11 rounded-lg flex items-center justify-center text-lg ' + color + '"><i class="fa-solid ' + icon + '"></i></div>' +
      '<div><div class="text-2xl font-bold leading-none">' + value + '</div><div class="text-xs text-slate-500 mt-1">' + label + "</div></div>" +
      "</div>";
  }

  function caseRow(c) {
    var st = SPSM.Store.studentById(c.studentId) || {};
    var src = SPSM.Workflow.sourceInfo(c.source);
    var off = c.offences[0] || {};
    return '<tr class="hover:bg-slate-50 border-t border-slate-100">' +
      '<td class="px-3 py-2.5 font-mono text-xs font-semibold text-emerald-700">' + c.id + "</td>" +
      '<td class="px-3 py-2.5 text-xs text-slate-500">' + SPSM.fmtDate(c.created) + "</td>" +
      '<td class="px-3 py-2.5"><a href="#/student/' + c.studentId + '" class="font-medium text-slate-800 hover:text-emerald-700">' + SPSM.esc(st.nama) + "</a>" +
      '<div class="text-xs text-slate-400">' + SPSM.esc(st.kelas) + "</div></td>" +
      '<td class="px-3 py-2.5 text-sm">' + SPSM.esc(off.code || "-") + ' <span class="text-slate-400 text-xs">·</span> <span class="text-xs text-slate-500">' + SPSM.esc(off.name || "") + "</span></td>" +
      '<td class="px-3 py-2.5 text-center"><span class="font-bold text-slate-800">' + c.points + '</span></td>' +
      '<td class="px-3 py-2.5 text-xs text-slate-500"><i class="fa-solid ' + src.icon + ' mr-1"></i>' + src.label + "</td>" +
      '<td class="px-3 py-2.5">' + SPSM.Workflow.statusBadge(c.status) + "</td>" +
      '<td class="px-3 py-2.5 text-right"><a href="#/case/' + c.id + '" class="text-xs font-semibold text-emerald-700 hover:underline">Buka &rarr;</a></td>' +
      "</tr>";
  }

  function reviewQueue() {
    var queue = SPSM.Store.cases().filter(function (c) {
      return c.source === "PREFECT_WARNING" && c.status === "REPORTED";
    });
    if (!queue.length) return "";
    return '<div class="bg-white rounded-xl border border-amber-200 shadow-sm p-4 mb-6">' +
      '<h2 class="font-semibold text-amber-800 mb-3"><i class="fa-solid fa-clipboard-check mr-1.5"></i>Semakan Kad Peringatan (B03)</h2>' +
      '<div class="space-y-2">' + queue.map(function (c) {
        var st = SPSM.Store.studentById(c.studentId) || {};
        var off = c.offences[0] || {};
        return '<div class="flex items-center justify-between gap-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">' +
          '<div class="text-sm min-w-0"><span class="font-mono text-xs text-amber-700 font-semibold">' + c.id + "</span> — " + SPSM.esc(st.nama) + ' <span class="text-slate-400 text-xs">(' + SPSM.esc(st.kelas) + ")</span>" +
          '<div class="text-xs text-slate-500 mt-0.5 truncate">' + SPSM.esc(off.code) + " · " + SPSM.esc(off.name) + " · " + c.points + " mata · oleh " + SPSM.esc(c.reporter) + "</div></div>" +
          '<div class="flex gap-2 shrink-0">' +
          '<button type="button" data-review="approveWarning" data-case="' + c.id + '" class="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold">Terima &amp; Rekod B04</button>' +
          '<button type="button" data-review="rejectWarning" data-case="' + c.id + '" class="bg-slate-500 hover:bg-slate-600 text-white rounded-lg px-3 py-1.5 text-xs font-semibold">Tolak</button>' +
          "</div></div>";
      }).join("") + "</div></div>";
  }

  function complaintQueue() {
    var queue = SPSM.Store.cases().filter(function (c) {
      return c.source === "COMPLAINT" && c.points > 5 && c.status === "REPORTED";
    });
    if (!queue.length) return "";
    return '<div class="bg-white rounded-xl border border-sky-200 shadow-sm p-4 mb-6">' +
      '<h2 class="font-semibold text-sky-800 mb-3"><i class="fa-solid fa-magnifying-glass mr-1.5"></i>Aduan Guru Menunggu Siasatan (B02)</h2>' +
      '<div class="space-y-2">' + queue.map(function (c) {
        var st = SPSM.Store.studentById(c.studentId) || {};
        var off = c.offences[0] || {};
        return '<div class="flex items-center justify-between gap-3 bg-sky-50 border border-sky-100 rounded-lg px-3 py-2">' +
          '<div class="text-sm min-w-0"><span class="font-mono text-xs text-sky-700 font-semibold">' + c.id + "</span> — " + SPSM.esc(st.nama) + ' <span class="text-slate-400 text-xs">(' + SPSM.esc(st.kelas) + ")</span>" +
          '<div class="text-xs text-slate-500 mt-0.5 truncate">' + SPSM.esc(off.code) + " · " + SPSM.esc(off.name) + " · " + c.points + " mata · oleh " + SPSM.esc(c.reporter) + "</div></div>" +
          '<a href="#/case/' + c.id + '" class="shrink-0 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg px-3 py-1.5">Siasat</a></div>';
      }).join("") + "</div></div>";
  }

  function render(role) {
    var cases = SPSM.Store.cases();
    var review = cases.filter(function (c) { return c.source === "PREFECT_WARNING" && c.status === "REPORTED"; });
    var investigating = cases.filter(function (c) { return c.status === "INVESTIGATING"; });
    var approval = cases.filter(function (c) { return c.status === "PRINCIPAL_APPROVAL"; });
    var closed = cases.filter(function (c) { return c.status === "CLOSED" || c.status === "DISMISSED"; });
    var recorded = cases.filter(function (c) { return c.status === "RECORDED"; });
    var totalPoints = cases.reduce(function (s, c) { return s + c.points; }, 0);

    var html = "";

    if (role === "pengetua") {
      html += '<div class="mb-6"><h1 class="text-xl font-bold text-slate-800"><i class="fa-solid fa-pen text-amber-600 mr-2"></i>Papan Pemuka Pengetua</h1>' +
        '<p class="text-sm text-slate-500">Kelulusan Surat Pemberitahuan / Amaran dan pemantauan kes disiplin.</p></div>';
      html += '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">' +
        statCard("Menunggu Tandatangan", approval.length, "bg-amber-100 text-amber-700", "fa-pen") +
        statCard("Jumlah Kes", cases.length, "bg-slate-100 text-slate-600", "fa-folder-open") +
        statCard("Kes Disahkan", cases.filter(function (c) { return c.status !== "REPORTED" && c.status !== "INVESTIGATING"; }).length, "bg-emerald-100 text-emerald-700", "fa-check") +
        statCard("Jumlah Mata SPSM", totalPoints, "bg-violet-100 text-violet-700", "fa-star") +
        "</div>";
      if (approval.length) {
        html += '<div class="bg-white rounded-xl border border-amber-200 shadow-sm p-4 mb-6">' +
          '<h2 class="font-semibold text-amber-800 mb-3"><i class="fa-solid fa-pen mr-1.5"></i>Menunggu Tandatangan Anda</h2>' +
          '<div class="space-y-2">' + approval.map(function (c) {
            var st = SPSM.Store.studentById(c.studentId) || {};
            return '<div class="flex items-center justify-between gap-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">' +
              '<div class="text-sm"><span class="font-mono text-xs text-amber-700 font-semibold">' + c.id + "</span> — " + SPSM.esc(st.nama) + ' <span class="text-slate-400 text-xs">(' + SPSM.esc(st.kelas) + ")</span></div>" +
              '<a href="#/case/' + c.id + '" class="text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg px-3 py-1.5">Semak &amp; Tandatangan</a></div>';
          }).join("") + "</div></div>";
      }
    } else {
      html += '<div class="mb-6"><h1 class="text-xl font-bold text-slate-800"><i class="fa-solid fa-gauge-high text-emerald-600 mr-2"></i>Papan Pemuka Guru Disiplin</h1>' +
        '<p class="text-sm text-slate-500">Pengurusan kes disiplin murid &mdash; Sistem Pembangunan Sahsiah Murid (SPSM).</p></div>';
      html += '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">' +
        statCard("Menunggu Semakan", review.length, "bg-amber-100 text-amber-700", "fa-clipboard-check") +
        statCard("Dalam Siasatan", investigating.length, "bg-amber-100 text-amber-700", "fa-magnifying-glass") +
        statCard("Direkod B04", recorded.length, "bg-violet-100 text-violet-700", "fa-book") +
        statCard("Jumlah Kes", cases.length, "bg-slate-100 text-slate-600", "fa-folder-open") +
        "</div>";
    }

    if (role === "disiplin") {
      html += reviewQueue();
      html += complaintQueue();
    }

    html += '<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">' +
      '<div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">' +
      '<h2 class="font-semibold text-slate-800">Senarai Kes Disiplin</h2>' +
      '<div class="flex items-center gap-3">' +
      '<button id="print-b04" class="text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg px-3 py-1.5"><i class="fa-solid fa-print mr-1"></i>Cetak B04</button>' +
      '<div class="text-xs text-slate-400">' + cases.length + " kes</div></div></div>" +
      '<div class="overflow-x-auto"><table class="w-full text-sm">' +
      "<thead><tr class='text-left text-xs uppercase tracking-wide text-slate-400'>" +
      "<th class='px-3 py-2'>Kes</th><th class='px-3 py-2'>Tarikh</th><th class='px-3 py-2'>Murid</th><th class='px-3 py-2'>Kesalahan</th><th class='px-3 py-2 text-center'>Mata</th><th class='px-3 py-2'>Sumber</th><th class='px-3 py-2'>Status</th><th class='px-3 py-2'></th>" +
      "</tr></thead><tbody>" + cases.map(caseRow).join("") + "</tbody></table></div>" +
      "</div>";
    return html;
  }

  function afterRender() {
    document.querySelectorAll("[data-review]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.dataset.review;
        var cid = btn.dataset.case;
        if (action === "rejectWarning" && !confirm("Tolak Kad Peringatan ini?")) return;
        var c = SPSM.Store.advance(cid, action, SPSM.state.roleLabel);
        if (c) {
          SPSM.toast("Kad " + c.id + ": " + SPSM.Workflow.statusInfo(c.status).label, "success");
          renderInto();
        }
      });
    });
    var printB04 = document.getElementById("print-b04");
    if (printB04) {
      printB04.addEventListener("click", function () {
        SPSM.Print.b04(null);
      });
    }
  }

  function renderInto() {
    var app = document.getElementById("app");
    app.innerHTML = render(SPSM.state.role);
    afterRender();
    window.scrollTo(0, 0);
  }

  SPSM.Views = SPSM.Views || {};
  SPSM.Views.dashboard = { render: render, afterRender: afterRender };
})();
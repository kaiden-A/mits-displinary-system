(function () {
  function render(id) {
    var st = SPSM.Store.studentById(id);
    if (!st) return '<div class="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">Murid tidak dijumpai.</div>';
    var cases = SPSM.Store.casesOfStudent(id);
    var total = cases.reduce(function (s, c) { return s + c.points; }, 0);
    var tier = SPSM.Spsm.tierFor(total);

    var info = [
      ["No. Dikenal", st.noDikenal],
      ["Tingkatan", st.tingkatan],
      ["Aliran", st.kelasStream],
      ["Jantina", st.jantina],
      ["Bangsa", st.bangsa],
      ["Agama", st.agama],
      ["No. K/P", st.noKp],
      ["Umur", st.umur],
      ["Tarikh Masuk Sekolah", st.tarikhMasuk],
      ["Sekolah Terdahulu", st.sekolahTerdahulu],
      ["Bapa / Penjaga", st.bapa],
      ["Ibu", st.ibu],
      ["Alamat Rumah", st.alamat],
      ["No. Telefon", "( R ) " + (st.telRumah || "") + " &nbsp;( P ) " + (st.telPejabat || "")],
      ["No. Telefon Bimbit", st.telBimbit],
      ["Waris Terdekat", st.waris],
      ["No. Telefon Waris", "( R ) " + (st.telWarisRumah || "") + " &nbsp;( P ) " + (st.telWarisPejabat || "")],
      ["No. Telefon Bimbit Waris", st.telWarisBimbit]
    ].map(function (r) {
      return '<div class="flex gap-2 py-1 border-b border-slate-50 text-sm"><span class="w-40 shrink-0 text-xs font-semibold text-slate-400">' + r[0] + "</span><span class='text-slate-800'>" + SPSM.esc(r[1] || "-") + "</span></div>";
    }).join("");

    var rows = cases.map(function (c, i) {
      var offs = c.offences.map(function (o) { return o.code; }).join(", ");
      return "<tr class='border-t border-slate-100 hover:bg-slate-50'>" +
        "<td class='px-3 py-2 text-xs text-slate-500'>" + SPSM.fmtDate(c.created) + "</td>" +
        '<td class="px-3 py-2"><a href="#/case/' + c.id + '" class="font-mono text-xs font-semibold text-emerald-700 hover:underline">' + c.id + "</a></td>" +
        '<td class="px-3 py-2 text-sm text-slate-600">' + SPSM.esc(offs) + "</td>" +
        '<td class="px-3 py-2 text-center font-bold">' + c.points + "</td>" +
        '<td class="px-3 py-2">' + SPSM.Workflow.statusBadge(c.status) + "</td></tr>";
    }).join("") || '<tr><td colspan="5" class="px-3 py-6 text-center text-slate-400 text-sm">Tiada rekod kes disiplin.</td></tr>';

    var html =
      '<div class="mb-4 flex flex-wrap items-center justify-between gap-3">' +
      '<div><h1 class="text-xl font-bold text-slate-800">' + SPSM.esc(st.nama) + "</h1>" +
      '<p class="text-sm text-slate-500">' + SPSM.esc(st.kelas) + " · " + SPSM.esc(st.jantina) + " · " + SPSM.esc(st.noDikenal) + "</p></div>" +
      '<button id="print-kad" class="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg px-4 py-2 shadow-sm"><i class="fa-solid fa-print mr-1.5"></i>Cetak Kad SPSM</button>' +
      "</div>" +
      '<div class="grid lg:grid-cols-3 gap-4 mb-4">' +
      '<div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4"><h2 class="font-semibold text-slate-800 mb-2">Maklumat Murid</h2>' + info + "</div>" +
      '<div class="space-y-4">' +
      '<div class="bg-white rounded-xl border border-emerald-200 shadow-sm p-4 text-center">' +
      '<div class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Jumlah Mata SPSM</div>' +
      '<div class="text-4xl font-extrabold text-emerald-700 my-1">' + total + "</div>" +
      '<div class="text-xs bg-emerald-50 text-emerald-700 rounded-full px-3 py-1 inline-block font-medium">' + SPSM.esc(tier.label) + "</div>" +
      "</div>" +
      '<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">' +
      "<h2 class='font-semibold text-slate-800 mb-2'>Rujukan Cepat</h2>" +
      '<a href="#/catalogue" class="block text-sm text-emerald-700 hover:underline mb-1"><i class="fa-solid fa-book mr-1.5"></i>Katalog Kesalahan</a>' +
      '<a href="#/report" class="block text-sm text-emerald-700 hover:underline"><i class="fa-solid fa-pen-to-square mr-1.5"></i>Buat Aduan (B01)</a>' +
      "</div></div></div>" +
      '<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">' +
      '<div class="px-4 py-3 border-b border-slate-100 font-semibold text-slate-800">Rekod Disiplin</div>' +
      '<div class="overflow-x-auto"><table class="w-full text-sm">' +
      "<thead><tr class='text-left text-xs uppercase tracking-wide text-slate-400'>" +
      "<th class='px-3 py-2'>Tarikh</th><th class='px-3 py-2'>Kes</th><th class='px-3 py-2'>Kesalahan</th><th class='px-3 py-2 text-center'>Mata</th><th class='px-3 py-2'>Status</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table></div></div>";

    return html;
  }

  function afterRender() {
    var btn = document.getElementById("print-kad");
    if (btn) {
      btn.addEventListener("click", function () {
        var id = window.location.hash.split("/")[2];
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
  }

  SPSM.Views = SPSM.Views || {};
  SPSM.Views.student = { render: render, afterRender: afterRender };
})();
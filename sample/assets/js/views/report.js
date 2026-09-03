(function () {
  var picker = null;

  function myReports() {
    var mine = SPSM.Store.cases().filter(function (c) { return c.reporterRole === "guru"; });
    if (!mine.length) return "";
    return '<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">' +
      '<div class="px-4 py-3 border-b border-slate-100 font-semibold text-slate-800">Aduan yang telah dihantar</div>' +
      '<div class="divide-y divide-slate-100">' + mine.map(function (c) {
        var st = SPSM.Store.studentById(c.studentId) || {};
        var off = c.offences[0] || {};
        return '<a href="#/case/' + c.id + '" class="flex items-center justify-between px-4 py-3 hover:bg-slate-50">' +
          '<div class="text-sm"><span class="font-mono text-xs text-emerald-700 font-semibold">' + c.id + "</span> — " + SPSM.esc(st.nama) + " · " + SPSM.esc(off.code) + " · " + c.points + " mata</div>" +
          '<div>' + SPSM.Workflow.statusBadge(c.status) + "</div></a>";
      }).join("") + "</div></div>";
  }

  function render() {
    var html =
      '<div class="mb-6"><h1 class="text-xl font-bold text-slate-800"><i class="fa-solid fa-pen-to-square text-emerald-600 mr-2"></i>Buat Aduan Salahlaku (B01)</h1>' +
      '<p class="text-sm text-slate-500">Lapor kesalahan murid kepada Guru Disiplin. Aduan 5 mata ke bawah direkod terus dalam B04; melebihi 5 mata melalui siasatan (B02).</p></div>' +
      myReports() +
      '<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 max-w-3xl">' +
      '<form id="report-form" class="space-y-4">' +
      '<div class="grid md:grid-cols-2 gap-4">' +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Nama Murid yang diadu *</label>' +
      '<div id="student-picker"></div></div>' +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Nama Pengadu</label>' +
      '<div class="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">' +
      '<i class="fa-solid fa-user-check text-emerald-600"></i>' + SPSM.esc(SPSM.currentUser()) +
      '<span class="ml-auto text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Automatik</span></div></div>' +
      "</div>" +
      '<div class="grid md:grid-cols-2 gap-4">' +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Tarikh Kejadian *</label>' +
      '<input type="date" name="tarikh" required class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"></div>' +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Masa Kejadian</label>' +
      '<input type="time" name="masa" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"></div>' +
      "</div>" +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Kesalahan * (pilih kategori dahulu, kemudian kesalahan)</label><div id="picker"></div></div>' +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Butiran Aduan *</label>' +
      '<textarea name="details" required rows="3" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" placeholder="Huraikan apa yang berlaku…"></textarea></div>' +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Cadangan Tindakan (pilihan)</label>' +
      '<textarea name="cadangan" rows="2" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" placeholder="Contoh: beri amaran bertulis, khidmat sosial…"></textarea></div>' +
      '<div class="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500">' +
      "Rujukan: Aduan 5 mata ke bawah direkod terus dalam B04 (Buku Rekod Disiplin). Aduan melebihi 5 mata perlu Borang Siasatan (B02) dahulu — boleh diisi oleh guru pengadu atau Guru Disiplin." +
      "</div>" +
      '<div class="flex items-center gap-3">' +
      '<button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg px-5 py-2.5 shadow-sm">Hantar Aduan</button>' +
      '<button type="reset" class="text-sm text-slate-500 hover:text-slate-800 px-3">Batal</button>' +
      "</div>" +
      "</form></div>";

    return html;
  }

  function afterRender() {
    picker = SPSM.offencePicker(document.getElementById("picker"), { accent: "emerald" });
    SPSM.studentPicker(document.getElementById("student-picker"));
    var form = document.getElementById("report-form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!picker.selected.length) {
        SPSM.toast("Sila pilih sekurang-kurangnya satu kesalahan.", "error");
        return;
      }
      var fd = new FormData(form);
      var reporter = SPSM.currentUser();
      var c = SPSM.Store.addCase({
        source: "COMPLAINT",
        studentId: fd.get("studentId"),
        reporter: reporter,
        reporterRole: "guru",
        offences: picker.selected.map(function (i) {
          return { code: i.code, name: i.name, points: i.points };
        }),
        points: picker.total,
        details: fd.get("details"),
        firstEvent: "Aduan (B01) diterima daripada " + reporter + ".",
        docs: {
          b01: {
            tarikhKejadian: fd.get("tarikh"),
            masaKejadian: fd.get("masa"),
            aduan: fd.get("details"),
            cadangan: fd.get("cadangan")
          }
        }
      });
      SPSM.toast("Aduan " + c.id + " dihantar — Guru Disiplin akan dimaklumkan.", "success");
      window.location.hash = "#/case/" + c.id;
    });
  }

  SPSM.Views = SPSM.Views || {};
  SPSM.Views.report = { render: render, afterRender: afterRender };
})();
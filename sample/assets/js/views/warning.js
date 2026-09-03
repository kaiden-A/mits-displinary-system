(function () {
  var picker = null;
  var MAX_POINTS = 5;

  function myCards() {
    var mine = SPSM.Store.cases().filter(function (c) { return c.reporterRole === "pengawas"; });
    if (!mine.length) return "";
    return '<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">' +
      '<div class="px-4 py-3 border-b border-slate-100 font-semibold text-slate-800">Kad Peringatan yang telah dihantar</div>' +
      '<div class="divide-y divide-slate-100">' + mine.map(function (c) {
        var st = SPSM.Store.studentById(c.studentId) || {};
        var off = c.offences[0] || {};
        return '<div class="flex items-center justify-between gap-3 px-4 py-3">' +
          '<div class="text-sm min-w-0"><span class="font-mono text-xs text-amber-700 font-semibold">' + c.id + "</span> — " + SPSM.esc(st.nama) + " · " + SPSM.esc(off.code) + " · " + c.points + " mata" +
          '<div class="text-xs text-slate-400 mt-0.5 truncate">' + SPSM.esc(off.name) + "</div></div>" +
          '<div class="shrink-0">' + SPSM.Workflow.statusBadge(c.status) + "</div></div>";
      }).join("") + "</div></div>";
  }

  function render() {
    var count = SPSM.Spsm.prefectAllowed().length;

    return '<div class="mb-6"><h1 class="text-xl font-bold text-slate-800"><i class="fa-solid fa-triangle-exclamation text-amber-500 mr-2"></i>Kad Peringatan (B03)</h1>' +
      '<p class="text-sm text-slate-500">Lapor kesalahan ringan murid (maksimum 5 mata SPSM). Kad akan disemak dan disahkan oleh Guru Disiplin sebelum direkod dalam B04.</p></div>' +
      myCards() +
      '<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 max-w-3xl">' +
      '<form id="warning-form" class="space-y-4">' +
      '<div class="grid md:grid-cols-2 gap-4">' +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Nama Murid *</label>' +
      '<div id="student-picker"></div></div>' +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Nama Pengawas yang Melapor *</label>' +
      '<input type="text" name="reporter" required class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" placeholder="Nama pengawas yang membuat laporan"></div>' +
      "</div>" +
      '<div class="grid md:grid-cols-2 gap-4">' +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Tarikh *</label>' +
      '<input type="date" name="tarikh" required class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"></div>' +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Masa</label>' +
      '<input type="time" name="masa" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"></div>' +
      "</div>" +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Kesalahan * (pilih kategori dahulu, maksimum 5 mata)</label>' +
      '<div id="picker"></div></div>' +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Butiran Kesalahan *</label>' +
      '<textarea name="tindakan" required rows="2" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" placeholder="Huraian ringkas apa yang berlaku…"></textarea></div>' +
      '<div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">' +
      "Nota: Pengawas hanya boleh melaporkan kesalahan ringan (" + count + " jenis kesalahan, maksimum 5 mata). Isikan nama pengawas yang membuat laporan — laporan boleh dimasukkan bagi pihak pengawas lain. Kad akan disemak oleh Guru Disiplin — jika disahkan, kesalahan akan direkod dalam B04 (Buku Rekod Disiplin)." +
      "</div>" +
      '<div class="flex items-center gap-3">' +
      '<button type="submit" class="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg px-5 py-2.5 shadow-sm">Hantar untuk Semakan</button>' +
      '<button type="reset" class="text-sm text-slate-500 hover:text-slate-800 px-3">Batal</button>' +
      "</div>" +
      "</form></div>";
  }

  function afterRender() {
    picker = SPSM.offencePicker(document.getElementById("picker"), {
      accent: "amber",
      allow: function (o) { return o.max <= MAX_POINTS; },
      cap: MAX_POINTS
    });
    SPSM.studentPicker(document.getElementById("student-picker"));
    var form = document.getElementById("warning-form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!picker.selected.length) {
        SPSM.toast("Sila pilih sekurang-kurangnya satu kesalahan.", "error");
        return;
      }
      if (picker.total > MAX_POINTS) {
        SPSM.toast("Kad Peringatan tidak boleh melebihi " + MAX_POINTS + " mata.", "error");
        return;
      }
      var fd = new FormData(form);
      var reporter = fd.get("reporter") || SPSM.currentUser();
      var c = SPSM.Store.addCase({
        source: "PREFECT_WARNING",
        studentId: fd.get("studentId"),
        reporter: reporter,
        reporterRole: "pengawas",
        offences: picker.selected.map(function (i) {
          return { code: i.code, name: i.name, points: i.points };
        }),
        points: picker.total,
        details: fd.get("tindakan"),
        firstEvent: "Kad Peringatan (B03) dikeluarkan oleh " + reporter + " — menunggu semakan Guru Disiplin.",
        docs: {
          b03: {
            tarikhKejadian: fd.get("tarikh"),
            masaKejadian: fd.get("masa"),
            tindakan: fd.get("tindakan")
          }
        }
      });
      SPSM.toast("Kad Peringatan " + c.id + " dihantar — menunggu semakan Guru Disiplin.", "success");
      var app = document.getElementById("app");
      app.innerHTML = render();
      afterRender();
    });
  }

  SPSM.Views = SPSM.Views || {};
  SPSM.Views.warning = { render: render, afterRender: afterRender };
})();
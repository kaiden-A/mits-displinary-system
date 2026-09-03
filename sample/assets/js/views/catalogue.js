(function () {
  function render() {
    var cats = Object.keys(SPSM.Offences.CATEGORIES);
    var all = SPSM.Offences.all();
    var rows = all.map(function (o) {
      return "<tr class='border-t border-slate-100 hover:bg-slate-50'>" +
        "<td class='px-3 py-2 font-mono text-xs font-semibold text-emerald-700 whitespace-nowrap'>" + o.code + "</td>" +
        "<td class='px-3 py-2 text-sm text-slate-800'>" + SPSM.esc(o.name) + "</td>" +
        '<td class="px-3 py-2 text-center"><span class="font-bold text-slate-800">' + SPSM.Offences.range(o) + "</span></td>" +
        "<td class='px-3 py-2 text-xs text-slate-500'>" + SPSM.esc(o.action || "—") + "</td></tr>";
    }).join("");

    var catChips = cats.map(function (k) {
      return '<button data-cat="' + k + '" class="cat-chip rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-700">' + k + " · " + SPSM.esc(SPSM.Offences.CATEGORIES[k].split(" / ")[0]) + "</button>";
    }).join("");

    var ladder = SPSM.Spsm.LADDER.map(function (t) {
      return '<div class="rounded-lg border border-slate-200 p-3">' +
        '<div class="text-xs font-bold text-emerald-700 uppercase">' + SPSM.esc(t.label) + "</div>" +
        "<ul class='mt-1.5 space-y-1'>" + t.steps.map(function (s) {
          return '<li class="text-xs text-slate-600 flex gap-1.5"><span class="text-emerald-400">•</span>' + SPSM.esc(s) + "</li>";
        }).join("") + "</ul></div>";
    }).join("");

    return '<div class="mb-6"><h1 class="text-xl font-bold text-slate-800"><i class="fa-solid fa-book text-emerald-600 mr-2"></i>Katalog Kesalahan &amp; Tindakan SPSM</h1>' +
      '<p class="text-sm text-slate-500">Jenis-jenis kesalahan yang boleh dikenakan mata SPSM dan tindakan disiplin (Buku Peraturan Murid Sekolah Agama Negeri Selangor).</p></div>' +
      '<div class="grid lg:grid-cols-3 gap-4 mb-4">' +
      '<div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4">' +
      '<input id="cat-search" type="text" placeholder="Cari kesalahan (kod / nama)…" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-500">' +
      '<div class="flex flex-wrap gap-1.5 mb-3" id="cat-chips">' +
      '<button data-cat="ALL" class="cat-chip rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Semua</button>' +
      catChips + "</div>" +
      '<div class="overflow-x-auto max-h-[560px] overflow-y-auto"><table class="w-full text-sm">' +
      "<thead class='sticky top-0 bg-white'><tr class='text-left text-xs uppercase tracking-wide text-slate-400'>" +
      "<th class='px-3 py-2'>Kod</th><th class='px-3 py-2'>Kesalahan</th><th class='px-3 py-2 text-center'>Mata SPSM</th><th class='px-3 py-2'>Tindakan Disiplin Termasuk</th>" +
      "</tr></thead><tbody id=" + '"cat-rows"' + ">" + rows + "</tbody></table></div>" +
      "</div>" +
      '<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-fit">' +
      "<h2 class='font-semibold text-slate-800 mb-3'>Langkah / Hukuman Mengikut Mata SPSM</h2>" +
      '<div class="space-y-3">' + ladder + "</div>" +
      '<div class="mt-4 text-[11px] text-slate-400 leading-relaxed">Nota: Tertakluk kepada perubahan pekeliling semasa Jabatan / Kementerian Pendidikan Malaysia. Hukuman rotan berdasarkan Surat Pekeliling Ikhtisas Bil 7/2003 (Kuasa Guru Merotan Murid). Hukuman diberhentikan sekolah berdasarkan Peraturan (Disiplin) Sekolah 1959.</div>' +
      "</div></div>";
  }

  function afterRender() {
    var search = document.getElementById("cat-search");
    var rowsEl = document.getElementById("cat-rows");
    var activeCat = "ALL";

    function apply() {
      var q = search.value.toLowerCase();
      var rows = SPSM.Offences.all().filter(function (o) {
        if (activeCat !== "ALL" && o.cat !== activeCat) return false;
        return !q || o.code.toLowerCase().indexOf(q) !== -1 || o.name.toLowerCase().indexOf(q) !== -1;
      }).map(function (o) {
        return "<tr class='border-t border-slate-100 hover:bg-slate-50'>" +
          "<td class='px-3 py-2 font-mono text-xs font-semibold text-emerald-700 whitespace-nowrap'>" + o.code + "</td>" +
          "<td class='px-3 py-2 text-sm text-slate-800'>" + SPSM.esc(o.name) + "</td>" +
          '<td class="px-3 py-2 text-center"><span class="font-bold text-slate-800">' + SPSM.Offences.range(o) + "</span></td>" +
          "<td class='px-3 py-2 text-xs text-slate-500'>" + SPSM.esc(o.action || "—") + "</td></tr>";
      }).join("");
      rowsEl.innerHTML = rows || '<tr><td colspan="4" class="px-3 py-6 text-center text-slate-400">Tiada padanan.</td></tr>';
    }

    search.addEventListener("input", apply);
    document.querySelectorAll(".cat-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeCat = chip.dataset.cat;
        document.querySelectorAll(".cat-chip").forEach(function (c) {
          var on = c.dataset.cat === activeCat;
          c.className = "cat-chip rounded-lg border px-2.5 py-1 text-xs font-semibold " + (on ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700");
        });
        apply();
      });
    });
  }

  SPSM.Views = SPSM.Views || {};
  SPSM.Views.catalogue = { render: render, afterRender: afterRender };
})();
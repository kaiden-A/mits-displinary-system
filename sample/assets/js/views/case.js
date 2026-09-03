(function () {
  var currentId = null;

  function stepper(c) {
    var path = SPSM.Workflow.pathFor(c);
    var idx = path.indexOf(c.status);
    var html = '<div class="flex items-start">';
    path.forEach(function (sid, i) {
      var done = c.status === sid || (idx !== -1 && i < idx) || (c.status === "DISMISSED" && i <= 2);
      var active = c.status === sid;
      var badge;
      if (active) badge = '<div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm ring-4 ring-emerald-100">' + (i + 1) + "</div>";
      else if (done) badge = '<div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">✓</div>';
      else badge = '<div class="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm">' + (i + 1) + "</div>";
      html += '<div class="flex flex-col items-center flex-1 min-w-0">' +
        '<div class="flex items-center w-full">' +
        (i > 0 ? '<div class="stepper-connector h-0.5 flex-1 ' + (done ? "bg-emerald-300" : "bg-slate-200") + '"></div>' : '<div class="flex-1"></div>') +
        badge +
        (i < path.length - 1 ? '<div class="stepper-connector h-0.5 flex-1 ' + (done ? "bg-emerald-300" : "bg-slate-200") + '"></div>' : '<div class="flex-1"></div>') +
        "</div>" +
        '<div class="text-[10px] mt-1 text-center leading-tight ' + (active ? "text-emerald-700 font-semibold" : done ? "text-slate-500" : "text-slate-300") + '">' + SPSM.Workflow.statusInfo(sid).label + "</div>" +
        "</div>";
    });
    return html + "</div>";
  }

  function actionBtn(action, label, color) {
    return '<button type="button" data-action="' + action + '" class="' + color + ' rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm">' + label + "</button>";
  }

  function docStrip(c) {
    var docs = SPSM.Workflow.docFillStatus(c);
    return '<div class="mb-3 flex flex-wrap gap-1.5">' + docs.map(function (d) {
      var cls = d.filled ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-200 text-slate-400";
      return '<span class="inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-semibold ' + cls + '" title="' + SPSM.esc(d.by) + '">' +
        (d.filled ? '<i class="fa-solid fa-circle-check text-emerald-500"></i>' : '<i class="fa-solid fa-circle-xmark"></i>') +
        d.code + "</span>";
    }).join("") + "</div>";
  }

  function stepsPanel(c) {
    var steps = SPSM.Workflow.nextSteps(c);
    var html = '<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">' +
      '<h2 class="font-semibold text-slate-800 mb-3"><i class="fa-solid fa-list-check text-slate-500 mr-1.5"></i>Langkah Seterusnya</h2>' +
      '<div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Status Dokumen</div>' +
      docStrip(c) +
      '<ol class="space-y-2.5">';
    steps.forEach(function (s, i) {
      var btn = "";
      var stateChip;
      if (s.state === "done") {
        stateChip = '<span class="shrink-0 text-emerald-600"><i class="fa-solid fa-circle-check"></i></span>';
      } else if (s.state === "current") {
        stateChip = '<span class="shrink-0 text-amber-500"><i class="fa-solid fa-circle-half-stroke"></i></span>';
        if (s.action) {
          var can = SPSM.Workflow.canAct(SPSM.state.role, s.action);
          if (can) {
            var colors = {
              startInvestigation: "bg-red-600 hover:bg-red-700 text-white",
              confirm: "bg-emerald-600 hover:bg-emerald-700 text-white",
              dismiss: "bg-slate-500 hover:bg-slate-600 text-white",
              approveWarning: "bg-emerald-600 hover:bg-emerald-700 text-white",
              rejectWarning: "bg-red-600 hover:bg-red-700 text-white",
              record: "bg-violet-600 hover:bg-violet-700 text-white",
              ack: "bg-fuchsia-600 hover:bg-fuchsia-700 text-white",
              prepare: "bg-indigo-600 hover:bg-indigo-700 text-white",
              approve: "bg-amber-500 hover:bg-amber-600 text-white",
              sign: "bg-amber-600 hover:bg-amber-700 text-white",
              execute: "bg-teal-600 hover:bg-teal-700 text-white",
              notify: "bg-cyan-600 hover:bg-cyan-700 text-white",
              meeting: "bg-rose-600 hover:bg-rose-700 text-white",
              close: "bg-emerald-700 hover:bg-emerald-800 text-white"
            };
            btn = actionBtn(s.action, "Tandakan ✓", colors[s.action] || "bg-slate-600 hover:bg-slate-800 text-white");
          }
        }
      } else if (s.state === "pending") {
        stateChip = '<span class="shrink-0 text-slate-300"><i class="fa-solid fa-circle"></i></span>';
      } else {
        stateChip = '<span class="shrink-0 text-slate-300"><i class="fa-regular fa-circle"></i></span>';
      }
      html += '<li class="flex items-start gap-3 rounded-lg px-3 py-2.5 border ' +
        (s.state === "current" ? "bg-amber-50 border-amber-200" : s.state === "done" ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-50 border-slate-100") + '">' +
        stateChip +
        '<div class="flex-1 min-w-0"><div class="text-sm ' + (s.state === "done" ? "text-slate-400 line-through" : s.state === "current" ? "text-slate-800 font-medium" : "text-slate-600") + '">' + SPSM.esc(s.text) + "</div>" +
        (s.actor ? '<div class="text-xs text-slate-400 mt-0.5">Pelaksana: ' + SPSM.esc(s.actor) + "</div>" : "") +
        (s.evidence ? '<div class="text-xs mt-0.5 ' + (s.state === "done" ? "text-emerald-600" : "text-slate-500") + '">' + SPSM.esc(s.evidence) + "</div>" : "") +
        "</div>" +
        (btn ? "<div>" + btn + "</div>" : "") +
        "</li>";
    });
    return html + "</ol></div>";
  }

  function ladderPanel(c) {
    var tier = SPSM.Spsm.tierFor(c.points);
    var forms = SPSM.Spsm.requiredForms(c.points);
    var html = '<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">' +
      '<h2 class="font-semibold text-slate-800 mb-3"><i class="fa-solid fa-scale-balanced text-slate-500 mr-1.5"></i>Tindakan SPSM Mengikut Mata (' + c.points + " mata)</h2>" +
      '<div class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 mb-3 text-sm text-emerald-800 font-medium">' + SPSM.esc(tier.label) + "</div>" +
      '<ul class="space-y-1.5">' + tier.steps.map(function (s) {
        return '<li class="flex gap-2 text-sm text-slate-600"><span class="text-emerald-500">•</span>' + SPSM.esc(s) + "</li>";
      }).join("") + "</ul>";
    if (forms.length) {
      html += '<div class="mt-3 pt-3 border-t border-slate-100"><div class="text-xs font-semibold text-slate-500 mb-2">DOKUMEN DIPERLUKAN</div>' +
        '<div class="flex flex-wrap gap-2">' + forms.map(function (f) {
          return '<span class="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800">' + f.code + " · " + SPSM.esc(f.name) + "</span>";
        }).join("") + "</div></div>";
    }
    return html + "</div>";
  }

  function b02Editor(c) {
    var entries = SPSM.Store.b02s(c.id);
    var notice = '<div class="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs text-sky-800 mb-3">Borang ini boleh diisi oleh <span class="font-semibold">sesiapa</span> (guru pengadu, Guru Disiplin atau pentadbir). Setiap borang disimpan dengan <span class="font-semibold">nama pengisi</span> — satu kes boleh mempunyai banyak Borang Siasatan.</div>';
    var fields = [
      ["aduan", "Aduan"],
      ["tarikhAduan", "Tarikh Aduan"],
      ["diterimaOleh", "Diterima oleh"],
      ["isu", "Isu"],
      ["laporan", "Laporan Siasatan"],
      ["punca", "Punca Masalah"],
      ["penambahbaikan", "Penambahbaikan"]
    ];
    var listHtml = entries.length
      ? '<div class="space-y-2 mb-3">' + entries.map(function (e) {
        return '<div class="flex items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2">' +
          '<div class="min-w-0 text-sm"><span class="font-mono text-xs font-bold text-amber-700">' + e.id + "</span>" +
          '<div class="text-xs text-slate-600 mt-0.5">Diisi oleh <span class="font-semibold">' + SPSM.esc(e.fillBy) + "</span> (" + SPSM.esc(e.fillRole) + ") · " + SPSM.fmtDateTime(e.filledAt) + "</div>" +
          (e.isu ? '<div class="text-xs text-slate-500 mt-0.5 truncate">Isu: ' + SPSM.esc(e.isu) + "</div>" : "") +
          "</div>" +
          '<span class="shrink-0 text-[10px] font-semibold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">✓ Disimpan</span></div>';
      }).join("") + "</div>"
      : '<div class="mb-3 rounded-lg border border-dashed border-slate-300 px-3 py-4 text-center text-xs text-slate-400">Belum ada Borang Siasatan untuk kes ini.</div>';
    var rows = fields.map(function (f) {
      return '<div><label class="block text-xs font-semibold text-slate-600 mb-1">' + SPSM.esc(f[1]) + "</label>" +
        (f[0] === "laporan" || f[0] === "punca" || f[0] === "penambahbaikan" || f[0] === "isu"
          ? '<textarea data-b2="' + f[0] + '" rows="2" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"></textarea>'
          : '<input type="text" data-b2="' + f[0] + '" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">') +
        "</div>";
    }).join("");
    return '<div class="bg-white rounded-xl border border-amber-200 shadow-sm p-4">' +
      '<div class="flex items-center justify-between mb-3"><h2 class="font-semibold text-slate-800"><i class="fa-solid fa-magnifying-glass text-amber-500 mr-1.5"></i>Borang Siasatan (B02)</h2>' +
      '<button id="toggle-b02" class="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm"><i class="fa-solid fa-plus mr-1"></i>Tambah Borang Siasatan</button></div>' +
      notice +
      listHtml +
      '<div id="b02-form" class="hidden border-t border-slate-100 pt-3">' +
      '<div class="text-xs font-semibold text-slate-600 mb-2">Borang baharu — akan disimpan atas nama <span class="text-amber-700">' + SPSM.esc(SPSM.currentUser()) + "</span> (" + SPSM.esc(SPSM.state.roleLabel) + ")</div>" +
      '<div class="grid md:grid-cols-2 gap-3">' + rows + "</div>" +
      '<div class="mt-3"><button id="save-b02" class="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-4 py-1.5 text-xs font-semibold shadow-sm">Simpan Borang Siasatan</button></div>' +
      "</div></div>";
  }

  function b06Panel(c) {
    var doc = c.docs.b06 || {};
    var levels = ["Pertama", "Kedua", "Ketiga"];
    var opts = levels.map(function (l) {
      return '<option value="' + l + '"' + (c.warningLevel === l ? " selected" : "") + ">" + l + "</option>";
    }).join("");
    return '<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">' +
      '<h2 class="font-semibold text-slate-800 mb-3"><i class="fa-solid fa-envelope text-slate-500 mr-1.5"></i>Surat Pemberitahuan / Amaran (B06)</h2>' +
      '<div class="grid md:grid-cols-2 gap-3">' +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Amaran</label><select id="b06-level" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">' + opts + "</select></div>" +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Tarikh surat</label><input type="date" id="b06-tarikh" value="' + SPSM.esc(doc.tarikhSurat || "") + '" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"></div>' +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Tarikh jumpa ibu bapa</label><input type="date" id="b06-tarikhJumpa" value="' + SPSM.esc(doc.tarikhJumpa || "") + '" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"></div>' +
      '<div><label class="block text-xs font-semibold text-slate-600 mb-1">Masa jumpa</label><input type="time" id="b06-masaJumpa" value="' + SPSM.esc(doc.masaJumpa || "") + '" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"></div>' +
      "</div>" +
      '<button id="save-b06" class="mt-3 bg-slate-800 hover:bg-slate-800 text-white rounded-lg px-3 py-1.5 text-xs font-semibold">Simpan Maklumat Surat</button></div>';
  }

  function b07Panel(c) {
    var doc = c.docs.b07 || {};
    var hasConfiscation = c.offences.some(function (o) {
      return SPSM.Offences.involvesConfiscation(o.code);
    });
    var html = '<div class="bg-white rounded-xl border border-red-200 shadow-sm p-4">' +
      '<h2 class="font-semibold text-slate-800 mb-3"><i class="fa-solid fa-ban text-slate-500 mr-1.5"></i>Barang Rampasan (B07)' + (hasConfiscation ? '<span class="ml-2 text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5">Kes melibatkan rampasan</span>' : "") + "</h2>" +
      '<label class="block text-xs font-semibold text-slate-600 mb-1">Barang yang dirampas</label>' +
      '<input type="text" id="b07-barang" value="' + SPSM.esc(doc.barang || "") + '" placeholder="Contoh: vape, telefon bimbit, mercun…" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">' +
      '<button id="save-b07" class="mt-3 bg-slate-800 hover:bg-slate-800 text-white rounded-lg px-3 py-1.5 text-xs font-semibold">Simpan</button></div>';
    return html;
  }

  function docsPanel(c) {
    var docBtns = SPSM.Workflow.visibleDocs(c, SPSM.state.role);
    return '<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">' +
      '<h2 class="font-semibold text-slate-800 mb-3"><i class="fa-solid fa-print text-slate-500 mr-1.5"></i>Dokumen &amp; Cetakan</h2>' +
      '<div class="grid grid-cols-2 md:grid-cols-3 gap-2">' +
      docBtns.map(function (d) {
        return '<button type="button" data-print="' + d.form + '" class="text-left bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg px-3 py-2.5">' +
          '<div class="text-xs font-semibold text-slate-800">' + d.form.toUpperCase().replace("KAD", "KAD SPSM") + "</div>" +
          '<div class="text-[11px] text-slate-400 mt-0.5">' + SPSM.esc(d.label) + '<br><span class="text-emerald-600 font-medium">Cetak / PDF →</span></div></button>';
      }).join("") + "</div></div>";
  }

  function timeline(c) {
    var evts = c.events.slice().reverse();
    return '<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">' +
      '<h2 class="font-semibold text-slate-800 mb-3"><i class="fa-solid fa-clock-rotate-left text-slate-500 mr-1.5"></i>Kronologi Kes</h2>' +
      '<div class="space-y-3">' + evts.map(function (e, i) {
        return '<div class="flex gap-3">' +
          '<div class="flex flex-col items-center"><div class="w-2.5 h-2.5 rounded-full ' + (i === 0 ? "bg-emerald-500" : "bg-slate-300") + ' mt-1.5"></div>' + (i < evts.length - 1 ? '<div class="w-px flex-1 bg-slate-200"></div>' : "") + "</div>" +
          '<div class="pb-1"><div class="text-sm text-slate-800">' + SPSM.esc(e.text) + "</div>" +
          '<div class="text-xs text-slate-400 mt-0.5">' + SPSM.fmtDateTime(e.ts) + (e.by ? " · " + SPSM.esc(e.by) : "") + "</div></div></div>";
      }).join("") + "</div></div>";
  }

  function render(id) {
    currentId = id;
    var c = SPSM.Store.caseById(id);
    if (!c) return '<div class="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">Kes tidak dijumpai.<br><a href="#/dashboard" class="text-emerald-600 mt-2 inline-block">Kembali ke papan pemuka</a></div>';
    var st = SPSM.Store.studentById(c.studentId) || {};
    var src = SPSM.Workflow.sourceInfo(c.source);
    var offs = c.offences.map(function (o) {
      return '<span class="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs"><span class="font-mono font-semibold text-emerald-700">' + o.code + "</span>" + SPSM.esc(o.name) + " <span class='font-bold'>(" + o.points + ")</span></span>";
    }).join(" ");

    var html =
      '<div class="mb-4 flex flex-wrap items-start justify-between gap-3">' +
      '<div>' +
      '<div class="flex items-center gap-2"><h1 class="text-xl font-bold text-slate-800">Kes ' + c.id + "</h1>" + SPSM.Workflow.statusBadge(c.status) + "</div>" +
      '<p class="text-sm text-slate-500 mt-1"><i class="fa-solid ' + src.icon + ' mr-1"></i>' + src.label + ' · Dilaporkan oleh <span class="font-medium text-slate-800">' + SPSM.esc(c.reporter) + "</span> · " + SPSM.fmtDate(c.created) + "</p>" +
      "</div>" +
      '<div class="text-right"><div class="text-3xl font-extrabold text-emerald-700">' + c.points + '</div><div class="text-xs text-slate-400 font-semibold uppercase tracking-wide">Mata SPSM</div></div>' +
      "</div>" +
      '<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">' +
      '<div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm mb-4">' +
      '<a href="#/student/' + c.studentId + '" class="hover:text-emerald-700"><span class="text-slate-400 text-xs">MURID</span><br><span class="font-semibold">' + SPSM.esc(st.nama) + '</span> <span class="text-slate-400 text-xs">(' + SPSM.esc(st.kelas) + ")</span></a>" +
      '<div><span class="text-slate-400 text-xs">KESALAHAN</span><br><div class="flex flex-wrap gap-1.5 mt-0.5">' + offs + "</div></div>" +
      "</div>" +
      stepper(c) +
      "</div>" +
      '<div class="grid lg:grid-cols-2 gap-4 mb-4">' + stepsPanel(c) + ladderPanel(c) + "</div>";

    var panels = SPSM.Workflow.flowPanels(c);
    var role = SPSM.state.role;
    if (panels.b02) {
      html += '<div class="mb-4">' + b02Editor(c) + "</div>";
    }
    if (panels.b06 && role === "disiplin") {
      html += '<div class="mb-4">' + b06Panel(c) + "</div>";
    } else if (panels.b06 && role === "pengetua") {
      html += '<div class="mb-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-sm text-slate-500">' +
        '<i class="fa-solid fa-envelope text-slate-400 mr-1.5"></i>Surat Pemberitahuan / Amaran (B06) disediakan oleh Guru Disiplin — tandatangan boleh dibuat melalui "Langkah Seterusnya".</div>';
    }
    if (panels.b07 && role === "disiplin") {
      html += '<div class="mb-4">' + b07Panel(c) + "</div>";
    }
    html += '<div class="mb-4">' + docsPanel(c) + "</div>";
    html += '<div class="mb-4">' + timeline(c) + "</div>";

    if (c.status === "CLOSED" && c.meeting) {
      html += '<div class="bg-white rounded-xl border border-emerald-200 shadow-sm p-4 mb-4">' +
        '<h2 class="font-semibold text-emerald-800 mb-2"><i class="fa-solid fa-handshake text-emerald-600 mr-1.5"></i>Rekod Pertemuan Ibu Bapa</h2>' +
        '<div class="text-sm text-slate-800">' + SPSM.esc(c.meeting.tarikh) + " · " + SPSM.esc(c.meeting.masa) + " · " + SPSM.esc(c.meeting.nama) + "</div>" +
        '<div class="text-sm text-slate-600 mt-1">' + SPSM.esc(c.meeting.catatan || "") + "</div></div>";
    }

    return html;
  }

  function afterRender() {
    document.querySelectorAll("[data-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.dataset.action;
        if ((action === "dismiss" || action === "rejectWarning") && !confirm("Tutup kes ini?")) return;
        var c = SPSM.Store.advance(currentId, action, SPSM.state.roleLabel);
        if (c) {
          SPSM.toast("Kes " + c.id + " dikemas kini: " + SPSM.Workflow.statusInfo(c.status).label, "success");
          renderInto();
        }
      });
    });

    document.querySelectorAll("[data-print]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var c = SPSM.Store.caseById(currentId);
        if (!c) return;
        SPSM.Print[btn.dataset.print](c);
      });
    });

    var toggleB02 = document.getElementById("toggle-b02");
    var saveB02 = document.getElementById("save-b02");
    if (toggleB02) {
      toggleB02.addEventListener("click", function () {
        document.getElementById("b02-form").classList.toggle("hidden");
      });
    }
    if (saveB02) {
      saveB02.addEventListener("click", function () {
        var patch = {};
        document.querySelectorAll("[data-b2]").forEach(function (el) {
          patch[el.dataset.b2] = el.value;
        });
        var entry = SPSM.Store.addB02(currentId, patch, SPSM.currentUser(), SPSM.state.roleLabel);
        if (entry) {
          SPSM.toast("Borang Siasatan " + entry.id + " disimpan oleh " + entry.fillBy + ".", "success");
          renderInto();
        }
      });
    }

    var saveB06 = document.getElementById("save-b06");
    if (saveB06) {
      saveB06.addEventListener("click", function () {
        var c = SPSM.Store.caseById(currentId);
        var level = document.getElementById("b06-level").value;
        c.docs.b06 = Object.assign({}, c.docs.b06, {
          tarikhSurat: document.getElementById("b06-tarikh").value,
          tarikhJumpa: document.getElementById("b06-tarikhJumpa").value,
          masaJumpa: document.getElementById("b06-masaJumpa").value
        });
        SPSM.Store.updateCase(currentId, { docs: c.docs, warningLevel: level });
        SPSM.toast("Maklumat Surat B06 disimpan (" + level + ").", "success");
        renderInto();
      });
    }

    var saveB07 = document.getElementById("save-b07");
    if (saveB07) {
      saveB07.addEventListener("click", function () {
        var c = SPSM.Store.caseById(currentId);
        c.docs.b07 = Object.assign({}, c.docs.b07, { barang: document.getElementById("b07-barang").value });
        SPSM.Store.updateCase(currentId, { docs: c.docs });
        SPSM.toast("Maklumat barang rampasan disimpan.", "success");
      });
    }
  }

  function renderInto() {
    var app = document.getElementById("app");
    app.innerHTML = render(currentId);
    afterRender();
  }

  SPSM.Views = SPSM.Views || {};
  SPSM.Views.caseDetail = { render: render, afterRender: afterRender };
})();
(function () {
  var STATUSES = [
    { id: "REPORTED", label: "Dilaporkan / Menunggu Semakan", color: "bg-red-100 text-red-700 border-red-200" },
    { id: "INVESTIGATING", label: "Dalam Siasatan", color: "bg-amber-100 text-amber-700 border-amber-200" },
    { id: "CONFIRMED", label: "Disahkan Berasas", color: "bg-sky-100 text-sky-700 border-sky-200" },
    { id: "DISMISSED", label: "Tidak Berasas / Ditolak", color: "bg-slate-100 text-slate-600 border-slate-200" },
    { id: "RECORDED", label: "Direkod dalam B04", color: "bg-violet-100 text-violet-700 border-violet-200" },
    { id: "STUDENT_ACK", label: "Pengakuan Murid", color: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200" },
    { id: "ACTION_PREPARED", label: "Tindakan Disediakan", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    { id: "PRINCIPAL_APPROVAL", label: "Menunggu Tandatangan Pengetua", color: "bg-amber-100 text-amber-800 border-amber-300" },
    { id: "EXECUTED", label: "Hukuman Dilaksanakan", color: "bg-teal-100 text-teal-700 border-teal-200" },
    { id: "PARENT_NOTIFIED", label: "Ibu Bapa Dimaklumkan", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
    { id: "MEETING", label: "Pertemuan Ibu Bapa", color: "bg-rose-100 text-rose-700 border-rose-200" },
    { id: "CLOSED", label: "Tamat", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
  ];

  var SOURCES = {
    COMPLAINT: { label: "Aduan (B01)", icon: "fa-pen-to-square" },
    PREFECT_WARNING: { label: "Kad Peringatan (B03)", icon: "fa-triangle-exclamation" },
    SPOT_CHECK: { label: "Spot Check", icon: "fa-magnifying-glass" }
  };

  var HEAVY_PATH = ["STUDENT_ACK", "ACTION_PREPARED", "PRINCIPAL_APPROVAL", "EXECUTED", "PARENT_NOTIFIED", "MEETING", "CLOSED"];
  var LIGHT_PATH = ["EXECUTED", "CLOSED"];

  function needsB02(c) {
    return c.source === "SPOT_CHECK" || (c.source === "COMPLAINT" && c.points > 5);
  }

  function hasB02(c) {
    if (!c.docs) return false;
    return !!((c.docs.b02s && c.docs.b02s.length) || c.docs.b02);
  }

  function atLeast(c, statusId) {
    var path = pathFor(c);
    var cur = path.indexOf(c.status);
    var target = path.indexOf(statusId);
    if (cur === -1 || target === -1) return false;
    return cur >= target;
  }

  function docFillStatus(c) {
    var out = [];
    var b02s = (c.docs && c.docs.b02s) || (c.docs && c.docs.b02 ? [c.docs.b02] : []);
    function push(code, name, filled, by) {
      out.push({ code: code, name: name, filled: !!filled, by: by || "" });
    }
    push("B01", "Aduan Salahlaku", true, c.reporter);
    push("B02", "Borang Siasatan", b02s.length > 0, b02s.map(function (e) { return e.fillBy + " (" + e.fillRole + ")"; }).join(", "));
    push("B04", "Rekod Disiplin", atLeast(c, "RECORDED"), "Status: " + c.status);
    if (c.points >= 10) {
      push("B05", "Pengakuan Murid", atLeast(c, "STUDENT_ACK") || !!(c.docs && c.docs.b05), "");
      push("B06", "Surat Amaran", atLeast(c, "ACTION_PREPARED") || !!(c.docs && c.docs.b06), "");
    }
    if (c.points >= 30) {
      push("B08", "Surat Akujanji", atLeast(c, "ACTION_PREPARED") || !!(c.docs && c.docs.b08), "");
    }
    push("KAD", "Kad SPSM", atLeast(c, "RECORDED"), "");
    return out;
  }

  function pathFor(c) {
    var p;
    if (needsB02(c)) {
      p = ["REPORTED", "INVESTIGATING", "CONFIRMED", "RECORDED"];
    } else {
      p = ["REPORTED", "RECORDED"];
    }
    if (c.points >= 10) {
      p = p.concat(HEAVY_PATH);
    } else {
      p = p.concat(LIGHT_PATH);
    }
    return p;
  }

  var TRANSITIONS = {
    startInvestigation: { from: ["REPORTED"], to: "INVESTIGATING", text: "Siasatan dimulakan — Borang Siasatan (B02) disediakan.", by: "Guru Disiplin" },
    confirm: { from: ["INVESTIGATING"], to: "CONFIRMED", text: "Aduan disahkan berasas.", by: "Guru Disiplin" },
    dismiss: { from: ["REPORTED", "INVESTIGATING"], to: "DISMISSED", text: "Kes ditolak / didapati tidak berasas.", by: "Guru Disiplin" },
    approveWarning: { from: ["REPORTED"], src: ["PREFECT_WARNING"], to: "RECORDED", text: "Kad Peringatan disemak dan disahkan oleh Guru Disiplin — kesalahan direkod dalam B04 (Buku Rekod Disiplin).", by: "Guru Disiplin" },
    rejectWarning: { from: ["REPORTED"], src: ["PREFECT_WARNING"], to: "DISMISSED", text: "Kad Peringatan ditolak oleh Guru Disiplin.", by: "Guru Disiplin" },
    record: { from: ["REPORTED", "CONFIRMED"], to: "RECORDED", text: "Kesalahan direkod dalam Buku Rekod Disiplin (B04).", by: "Guru Disiplin" },
    ack: { from: ["RECORDED"], to: "STUDENT_ACK", text: "Murid mengisi Borang Pengakuan Murid (B05).", by: "Guru Disiplin" },
    prepare: { from: ["STUDENT_ACK"], to: "ACTION_PREPARED", text: "Kad SPSM dan surat-surat (B06 / B08) disediakan.", by: "Guru Disiplin" },
    approve: { from: ["ACTION_PREPARED"], to: "PRINCIPAL_APPROVAL", text: "Dihantar untuk tandatangan Pengetua.", by: "Guru Disiplin" },
    sign: { from: ["PRINCIPAL_APPROVAL"], to: "EXECUTED", text: "Pengetua menandatangani Surat Pemberitahuan / Amaran (B06).", by: "Pengetua" },
    execute: { from: ["RECORDED"], to: "EXECUTED", text: "Badan Disiplin melaksanakan hukuman / tindakan merujuk Modul SPSM.", by: "Badan Disiplin" },
    notify: { from: ["EXECUTED"], to: "PARENT_NOTIFIED", text: "Surat dihantar kepada ibu bapa / penjaga (serahan tangan / pos; telefon jika perlu tindakan segera).", by: "Guru Disiplin" },
    meeting: { from: ["PARENT_NOTIFIED"], to: "MEETING", text: "Ibu bapa / penjaga dipanggil — pertemuan diadakan.", by: "Guru Disiplin" },
    close: { from: ["PARENT_NOTIFIED", "EXECUTED", "MEETING"], to: "CLOSED", text: "Hasil pertemuan direkod dalam Kad SPSM (LAM/DIS/002-1). Kes ditutup.", by: "Guru Disiplin" }
  };

  var ACTION_ROLES = {
    startInvestigation: ["disiplin"],
    confirm: ["disiplin"],
    dismiss: ["disiplin"],
    approveWarning: ["disiplin"],
    rejectWarning: ["disiplin"],
    record: ["disiplin"],
    ack: ["disiplin"],
    prepare: ["disiplin"],
    approve: ["disiplin"],
    sign: ["pengetua"],
    execute: ["disiplin"],
    notify: ["disiplin"],
    meeting: ["disiplin"],
    close: ["disiplin"]
  };

  function statusInfo(id) {
    for (var i = 0; i < STATUSES.length; i++) if (STATUSES[i].id === id) return STATUSES[i];
    return { id: id, label: id, color: "bg-slate-100 text-slate-600 border-slate-200" };
  }

  function statusBadge(id) {
    var s = statusInfo(id);
    return '<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ' + s.color + '">' + s.label + "</span>";
  }

  function sourceInfo(src) {
    return SOURCES[src] || { label: src, icon: "fa-circle" };
  }

  function isTerminal(c) {
    return c.status === "CLOSED" || c.status === "DISMISSED";
  }

  function nextSteps(c) {
    var steps = [];
    function add(text, actor, action, role, detail) {
      steps.push({ text: text, actor: actor || null, action: action || null, role: role || null, detail: detail || "" });
    }
    switch (c.status) {
      case "REPORTED":
        if (c.source === "PREFECT_WARNING") {
          add("Semak butiran Kad Peringatan dan kesalahan murid.", "Guru Disiplin");
          add("Sahkan — kesalahan direkod dalam B04 (Buku Rekod Disiplin).", "Guru Disiplin", "approveWarning", "disiplin");
          add("Tolak — kad tidak diterima.", "Guru Disiplin", "rejectWarning", "disiplin");
        } else if (c.source === "COMPLAINT") {
          if (c.points > 5) {
            add("Isi Borang Siasatan (B02) — boleh diisi oleh guru pengadu atau Guru Disiplin.", "Guru / Guru Disiplin");
            add("Buka siasatan untuk kesalahan melebihi 5 mata.", "Guru Disiplin", "startInvestigation", "disiplin");
          } else {
            add("Aduan guru (5 mata ke bawah) direkod terus dalam B04 tanpa siasatan.", "Guru Disiplin", "record", "disiplin");
          }
        } else {
          add("Buka siasatan dan lengkapkan Borang Siasatan (B02).", "Guru Disiplin", "startInvestigation", "disiplin");
          add("Kumpul maklumat daripada pengadu, saksi dan murid yang diadu.");
        }
        break;
      case "INVESTIGATING":
        add("Tentukan sama ada aduan berasas.", "Guru Disiplin");
        add("Jika berasas — sahkan aduan dan teruskan proses.", "Guru Disiplin", "confirm", "disiplin");
        add("Jika tidak berasas — tutup kes.", "Guru Disiplin", "dismiss", "disiplin");
        break;
      case "CONFIRMED":
        add("Rekod kesalahan dalam Buku Rekod Disiplin (B04).", "Guru Disiplin", "record", "disiplin");
        break;
      case "RECORDED":
        if (c.points >= 10) {
          add("Murid mengisi Borang Pengakuan Murid (B05) — wajib bagi kesalahan 10 mata dan ke atas.", "Guru Disiplin", "ack", "disiplin");
        } else {
          add("Laksanakan tindakan mengikut Modul SPSM: amaran bertulis + tarbiah / khidmat sosial.", "Badan Disiplin", "execute", "disiplin");
        }
        break;
      case "STUDENT_ACK":
        add("Isi Kad SPSM (LAM/DIS/002-1).", "Guru Disiplin");
        add("Sediakan Surat Pemberitahuan / Amaran (B06) dan Surat Akujanji (B08) jika berkaitan.", "Guru Disiplin", "prepare", "disiplin");
        break;
      case "ACTION_PREPARED":
        add("Hantar surat untuk tandatangan Guru Besar / Pengetua.", "Guru Disiplin", "approve", "disiplin");
        break;
      case "PRINCIPAL_APPROVAL":
        add("Tandatangani Surat Pemberitahuan / Amaran (B06) kepada ibu bapa / penjaga.", "Pengetua", "sign", "pengetua");
        break;
      case "EXECUTED":
        if (c.points >= 10) {
          add("Hantar surat secara serahan tangan / pos (makluman melalui telefon jika perlu tindakan segera).", "Guru Disiplin", "notify", "disiplin");
        } else {
          add("Kes ringan selesai — tamatkan kes.", "Guru Disiplin", "close", "disiplin");
        }
        break;
      case "PARENT_NOTIFIED":
        add("Ibu bapa / penjaga dipanggil?", "Guru Disiplin");
        add("Ya — buat pertemuan dengan ibu bapa / penjaga.", "Guru Disiplin", "meeting", "disiplin");
        add("Tidak — tamatkan kes.", "Guru Disiplin", "close", "disiplin");
        break;
      case "MEETING":
        add("Tandatangan Surat Akujanji (B08) jika berkaitan semasa pertemuan.", "Guru Disiplin");
        add("Rekod butiran / hasil pertemuan dalam Kad SPSM (LAM/DIS/002-1) dan tutup kes.", "Guru Disiplin", "close", "disiplin");
        break;
      case "CLOSED":
      case "DISMISSED":
        add("Kes telah tamat.");
        break;
    }
    var path = pathFor(c);
    var idx = path.indexOf(c.status);
    var b02s = (c.docs && c.docs.b02s) || [];
    steps.forEach(function (s) {
      if (s.action) {
        var t = TRANSITIONS[s.action];
        var targetIdx = t ? path.indexOf(t.to) : -1;
        if (idx !== -1 && targetIdx !== -1) {
          s.state = idx >= targetIdx ? "done" : (idx === targetIdx - 1 ? "current" : "pending");
        } else {
          s.state = "pending";
        }
      } else {
        s.state = "info";
      }
      if (s.action === "startInvestigation") {
        s.evidence = b02s.length
          ? "B02 telah diisi oleh: " + b02s.map(function (e) { return e.fillBy + " (" + e.fillRole + ")"; }).join(", ")
          : "B02 belum diisi — klik 'Tambah Borang Siasatan'.";
      }
      if (s.action === "ack") {
        s.evidence = c.docs && c.docs.b05 ? "B05 telah diisi." : "B05 belum diisi.";
      }
      if (s.action === "prepare") {
        var p = [];
        if (c.docs && c.docs.b06) p.push("B06 diisi");
        else p.push("B06 belum diisi");
        if (c.points >= 30) {
          if (c.docs && c.docs.b08) p.push("B08 diisi");
          else p.push("B08 belum diisi");
        }
        s.evidence = p.join(" · ");
      }
      if (s.action === "sign") {
        s.evidence = c.warningLevel ? "Amaran " + c.warningLevel : "";
      }
    });
    return steps;
  }

  function canAct(role, action) {
    var roles = ACTION_ROLES[action];
    return roles ? roles.indexOf(role) !== -1 : false;
  }

  function canAccessRoute(role, view) {
    if (role === "pengawas") return view === "warning";
    if (view === "warning") return false;
    if (view === "report") return role === "guru";
    if (view === "students") return role === "disiplin" || role === "pengetua";
    if (view === "dashboard") return role !== "guru";
    return true;
  }

  var HOME_FOR = {
    guru: "#/report",
    pengawas: "#/warning",
    disiplin: "#/dashboard",
    pengetua: "#/dashboard"
  };

  function homeFor(role) {
    return HOME_FOR[role] || "#/dashboard";
  }

  function visibleDocs(c, role) {
    var docs = [];
    function add(form, label) { docs.push({ form: form, label: label }); }
    if (role === "pengawas") return docs;
    if (role === "guru") {
      add("b01", "Aduan Salahlaku");
      if (needsB02(c) || hasB02(c)) add("b02", "Laporan Siasatan");
      return docs;
    }
    add("b01", "Aduan Salahlaku");
    if (needsB02(c) || hasB02(c)) add("b02", "Laporan Siasatan");
    if (c.source === "PREFECT_WARNING") add("b03", "Kad Peringatan");
    add("b04", "Buku Rekod Disiplin (semua murid)");
    if (c.points >= 10) add("b05", "Pengakuan Murid");
    if (c.points >= 10) add("b06", "Surat Amaran");
    if (c.offences.some(function (o) { return SPSM.Offences.involvesConfiscation(o.code); }) || (c.docs && c.docs.b07)) add("b07", "Barang Rampasan");
    if (c.points >= 30) add("b08", "Surat Akujanji");
    add("kad", "LAM/DIS/002-1 · Kad SPSM");
    return docs;
  }

  function flowPanels(c) {
    return {
      b02: needsB02(c) && (c.status === "INVESTIGATING" || (c.source === "COMPLAINT" && c.points > 5 && c.status === "REPORTED")),
      b06: c.points >= 10,
      b07: c.offences.some(function (o) { return SPSM.Offences.involvesConfiscation(o.code); }) || !!(c.docs && c.docs.b07)
    };
  }

  SPSM.Workflow = {
    STATUSES: STATUSES,
    HEAVY_PATH: HEAVY_PATH,
    LIGHT_PATH: LIGHT_PATH,
    pathFor: pathFor,
    needsB02: needsB02,
    hasB02: hasB02,
    atLeast: atLeast,
    docFillStatus: docFillStatus,
    TRANSITIONS: TRANSITIONS,
    statusInfo: statusInfo,
    statusBadge: statusBadge,
    sourceInfo: sourceInfo,
    isTerminal: isTerminal,
    nextSteps: nextSteps,
    canAct: canAct,
    canAccessRoute: canAccessRoute,
    homeFor: homeFor,
    visibleDocs: visibleDocs,
    flowPanels: flowPanels
  };
})();
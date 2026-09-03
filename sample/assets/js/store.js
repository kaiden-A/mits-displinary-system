(function () {
  var KEY = "spsm.foundation.v2";
  var data = null;
  var listeners = {};

  var Bus = {
    on: function (evt, cb) {
      (listeners[evt] = listeners[evt] || []).push(cb);
    },
    emit: function (evt, payload) {
      (listeners[evt] || []).forEach(function (cb) { cb(payload); });
    }
  };

  function daysAgoISO(n) {
    var d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  }

  function snapshotOf(studentId) {
    var stu = SPSM.StudentApi.getById(studentId);
    if (!stu) return null;
    return {
      id: stu.id,
      nama: stu.nama,
      ic_number: stu.ic_number,
      noKp: stu.noKp,
      gender: stu.gender,
      jantina: stu.jantina,
      tingkatan: stu.tingkatan,
      kelasStream: stu.kelasStream,
      kelas: stu.kelas,
      birth_year: stu.birth_year,
      year: stu.year,
      noDikenal: stu.noDikenal
    };
  }

  function seedCase(seq, cfg) {
    var c = {
      id: "K-" + seq,
      seq: seq,
      source: cfg.source,
      status: cfg.status,
      studentId: cfg.studentId,
      studentSnapshot: snapshotOf(cfg.studentId),
      reporter: cfg.reporter,
      reporterRole: cfg.reporterRole || "guru",
      offences: cfg.offences.map(function (o) {
        return { code: o.code, name: o.name, points: o.points };
      }),
      points: cfg.points,
      details: cfg.details || "",
      created: cfg.created || daysAgoISO(1),
      warningLevel: cfg.warningLevel || "Pertama",
      meeting: cfg.meeting || null,
      docs: cfg.docs || {},
      events: cfg.events || []
    };
    return c;
  }

  function defaultData() {
    var seq = 100;
    function n() { return seq++; }

    var cases = [];

    cases.push(seedCase(n(), {
      source: "COMPLAINT",
      status: "REPORTED",
      studentId: "1",
      reporter: "Pn. Nor Azlina binti Md Yusof",
      reporterRole: "guru",
      offences: [{ code: "G08", name: "Ingkar arahan guru / tidak menghormati guru", points: 10 }],
      points: 10,
      details: "Murid enggan mengikut arahan guru semasa kelas dan menjawab dengan nada kasar apabila ditegur.",
      created: daysAgoISO(1),
      docs: {
        b01: {
          tarikhKejadian: "2026-08-31",
          masaKejadian: "10:15",
          aduan: "Ingkar arahan guru semasa PdPc dan bercakap kasar kepada guru.",
          cadangan: "Beri amaran dan nasihat."
        }
      },
      events: [
        { ts: daysAgoISO(1), text: "Aduan (B01) diterima daripada Pn. Nor Azlina — menunggu siasatan (B02) kerana melebihi 5 mata.", by: "Pn. Nor Azlina" }
      ]
    }));

    cases.push(seedCase(n(), {
      source: "PREFECT_WARNING",
      status: "REPORTED",
      studentId: "5",
      reporter: "Pengawas Amirul (Ketua Pengawas)",
      reporterRole: "pengawas",
      offences: [{ code: "K01", name: "Lewat ke sekolah", points: 2 }],
      points: 2,
      details: "Saspek tiba di perhimpunan pagi selepas loceng berbunyi tanpa kebenaran.",
      created: daysAgoISO(2),
      docs: {
        b03: {
          tarikhKejadian: "2026-08-30",
          masaKejadian: "07:20",
          tindakan: "Diberi Kad Peringatan dan diminta berjumpa Guru Disiplin dalam tempoh 3 hari."
        }
      },
      events: [
        { ts: daysAgoISO(2), text: "Kad Peringatan (B03) dikeluarkan oleh Pengawas Amirul — menunggu semakan Guru Disiplin.", by: "Pengawas Amirul" }
      ]
    }));

    cases.push(seedCase(n(), {
      source: "SPOT_CHECK",
      status: "INVESTIGATING",
      studentId: "127",
      reporter: "Guru Disiplin (Tuan Hj. Syed Omar)",
      reporterRole: "disiplin",
      offences: [{ code: "D04", name: "Menghisap rokok / vape", points: 45 }],
      points: 45,
      details: "Didapati menyimpan dan menghisap vape semasa pemeriksaan mengejut di asrama.",
      created: daysAgoISO(5),
      docs: {
        b02s: [{
          id: "B02-1",
          fillBy: "Tuan Hj. Syed Omar bin Syed Ahmad",
          fillRole: "Guru Disiplin",
          filledAt: daysAgoISO(4),
          aduan: "Pemeriksaan mengejut (spot check) di asrama pada waktu rehat.",
          tarikhAduan: "2026-08-28",
          diterimaOleh: "Tuan Hj. Syed Omar",
          isu: "Murid didapati menghisap vape di dalam bilik dorm.",
          punca: "Pengaruh rakan dan kecuaian dalam mematuhi peraturan larangan merokok / vape.",
          penambahbaikan: "Kempen kesedaran bahaya vape dan pemeriksaan mengejut berkala."
        }]
      },
      events: [
        { ts: daysAgoISO(5), text: "Kesalahan dikesan melalui spot check oleh Guru Disiplin.", by: "Tuan Hj. Syed Omar" },
        { ts: daysAgoISO(4), text: "Siasatan dimulakan — Borang Siasatan (B02) disediakan.", by: "Tuan Hj. Syed Omar" }
      ]
    }));

    cases.push(seedCase(n(), {
      source: "COMPLAINT",
      status: "CLOSED",
      studentId: "251",
      reporter: "Cik Siti Hajar binti Razak",
      reporterRole: "guru",
      offences: [{ code: "J18", name: "Mengotorkan kawasan sekolah / asrama", points: 10 }],
      points: 10,
      details: "Murid meninggalkan sampah berselerak di kawasan kantin selepas waktu rehat.",
      created: daysAgoISO(20),
      meeting: { tarikh: "2026-08-20", masa: "14:00", nama: "Iskandar bin Rahman", catatan: "Ibu bapa dimaklumkan dan bersetuju memberi kerjasama. Murid mengaku kesalahan dan berjanji menjaga kebersihan." },
      docs: {
        b01: { tarikhKejadian: "2026-08-14", masaKejadian: "12:45", aduan: "Meninggalkan sampah berselerak di kantin.", cadangan: "Beri khidmat sosial membersihkan kantin." },
        b02s: [{
          id: "B02-1",
          fillBy: "Tuan Hj. Syed Omar bin Syed Ahmad",
          fillRole: "Guru Disiplin",
          filledAt: daysAgoISO(19),
          aduan: "Aduan daripada guru bertugas kantin.",
          tarikhAduan: "2026-08-14",
          diterimaOleh: "Tuan Hj. Syed Omar",
          isu: "Sampah berselerak selepas waktu rehat.",
          punca: "Kurang kesedaran menjaga kebersihan.",
          penambahbaikan: "Peringatan berkala mengenai kebersihan."
        }],
        b05: { tarikhPengakuan: "2026-08-15", masaPengakuan: "11:00", tempat: "Bilik Disiplin", perbuatan: "Mengotorkan kawasan kantin." }
      },
      events: [
        { ts: daysAgoISO(20), text: "Aduan (B01) diterima daripada Cik Siti Hajar — menunggu siasatan (B02) kerana melebihi 5 mata.", by: "Cik Siti Hajar" },
        { ts: daysAgoISO(19), text: "Siasatan dimulakan — Borang Siasatan (B02) disediakan.", by: "Tuan Hj. Syed Omar" },
        { ts: daysAgoISO(18), text: "Aduan disahkan berasas — kesalahan direkod dalam B04 (Buku Rekod Disiplin).", by: "Tuan Hj. Syed Omar" },
        { ts: daysAgoISO(17), text: "Murid mengisi Borang Pengakuan Murid (B05).", by: "Tuan Hj. Syed Omar" },
        { ts: daysAgoISO(16), text: "Kad SPSM dan surat-surat (B06 / B08) disediakan.", by: "Tuan Hj. Syed Omar" },
        { ts: daysAgoISO(15), text: "Pengetua menandatangani Surat Pemberitahuan / Amaran (B06).", by: "Pengetua" },
        { ts: daysAgoISO(14), text: "Hukuman khidmat sosial dilaksanakan.", by: "Badan Disiplin" },
        { ts: daysAgoISO(13), text: "Surat dihantar kepada ibu bapa / penjaga.", by: "Tuan Hj. Syed Omar" },
        { ts: daysAgoISO(10), text: "Ibu bapa / penjaga dipanggil — pertemuan diadakan.", by: "Tuan Hj. Syed Omar" },
        { ts: daysAgoISO(9), text: "Hasil pertemuan direkod dalam Kad SPSM (LAM/DIS/002-1). Kes ditutup.", by: "Tuan Hj. Syed Omar" }
      ]
    }));

    return {
      version: 2,
      seq: seq,
      cases: cases,
      settings: { role: "disiplin" }
    };
  }

  var Store = {
    load: function () {
      if (data) return data;
      try {
        var raw = localStorage.getItem(KEY);
        if (raw) {
          data = JSON.parse(raw);
          return data;
        }
      } catch (e) {}
      data = defaultData();
      this.save();
      return data;
    },
    save: function () {
      try {
        localStorage.setItem(KEY, JSON.stringify(data));
      } catch (e) {}
    },
    reset: function () {
      data = defaultData();
      this.save();
    },
    students: function () { return SPSM.StudentApi.list(); },
    studentById: function (id) {
      var found = SPSM.StudentApi.getById(id);
      if (found) return found;
      var cs = this.cases();
      for (var i = 0; i < cs.length; i++) {
        if (cs[i].studentSnapshot && String(cs[i].studentSnapshot.id) === String(id)) return cs[i].studentSnapshot;
      }
      return null;
    },
    cases: function () { return this.load().cases; },
    caseById: function (id) {
      var list = this.cases();
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
      return null;
    },
    casesOfStudent: function (studentId) {
      return this.cases().filter(function (c) { return c.studentId === studentId; });
    },
    recordedCases: function () {
      var recorded = ["RECORDED", "STUDENT_ACK", "ACTION_PREPARED", "PRINCIPAL_APPROVAL", "EXECUTED", "PARENT_NOTIFIED", "MEETING", "CLOSED"];
      return this.cases()
        .filter(function (c) { return recorded.indexOf(c.status) !== -1; })
        .sort(function (a, b) { return new Date(a.created) - new Date(b.created); });
    },
    settings: function () { return this.load().settings; },
    addCase: function (cfg) {
      var d = this.load();
      var autoRecord = cfg.source === "COMPLAINT" && cfg.points <= 5;
      var status = autoRecord ? "RECORDED" : "REPORTED";
      var firstEvent;
      if (autoRecord) {
        firstEvent = "Aduan (B01) diterima daripada " + cfg.reporter + " dan direkod terus dalam B04 (Buku Rekod Disiplin).";
      } else if (cfg.source === "COMPLAINT") {
        firstEvent = "Aduan (B01) diterima daripada " + cfg.reporter + " — menunggu siasatan (B02) kerana melebihi 5 mata.";
      } else {
        firstEvent = cfg.firstEvent;
      }
      var c = {
        id: "K-" + d.seq,
        seq: d.seq,
        source: cfg.source,
        status: status,
        studentId: cfg.studentId,
        studentSnapshot: snapshotOf(cfg.studentId),
        reporter: cfg.reporter,
        reporterRole: cfg.reporterRole || "guru",
        offences: cfg.offences,
        points: cfg.points,
        details: cfg.details || "",
        created: new Date().toISOString(),
        warningLevel: "Pertama",
        meeting: null,
        docs: cfg.docs || {},
        events: [{ ts: new Date().toISOString(), text: firstEvent, by: cfg.reporter }]
      };
      d.seq += 1;
      d.cases.unshift(c);
      this.save();
      Bus.emit("case-created", c);
      return c;
    },
    updateCase: function (id, patch) {
      var c = this.caseById(id);
      if (!c) return null;
      Object.keys(patch).forEach(function (k) { c[k] = patch[k]; });
      this.save();
      Bus.emit("case-updated", c);
      return c;
    },
    addEvent: function (id, text, by) {
      var c = this.caseById(id);
      if (!c) return null;
      c.events.push({ ts: new Date().toISOString(), text: text, by: by || "" });
      this.save();
      Bus.emit("case-updated", c);
      return c;
    },
    addB02: function (id, fields, by, roleLabel) {
      var c = this.caseById(id);
      if (!c) return null;
      c.docs = c.docs || {};
      c.docs.b02s = c.docs.b02s || [];
      var entry = {
        id: "B02-" + (c.docs.b02s.length + 1),
        fillBy: by,
        fillRole: roleLabel,
        filledAt: new Date().toISOString()
      };
      Object.keys(fields || {}).forEach(function (k) { entry[k] = fields[k]; });
      c.docs.b02s.push(entry);
      c.events.push({ ts: new Date().toISOString(), text: "Borang Siasatan (B02) diisi oleh " + by + " (" + (roleLabel || "") + ").", by: by });
      this.save();
      Bus.emit("case-updated", c);
      return entry;
    },
    b02s: function (id) {
      var c = this.caseById(id);
      return (c && c.docs && c.docs.b02s) || [];
    },
    advance: function (id, action, by) {
      var t = SPSM.Workflow.TRANSITIONS[action];
      if (!t) return null;
      var c = this.caseById(id);
      if (!c) return null;
      if (t.from && t.from.indexOf(c.status) === -1) return null;
      if (t.src && t.src.indexOf(c.source) === -1) return null;
      c.status = t.to;
      c.events.push({ ts: new Date().toISOString(), text: t.text, by: by || t.by });
      this.save();
      Bus.emit("case-updated", c);
      return c;
    },
    setRole: function (role) {
      this.load().settings.role = role;
      this.save();
    }
  };

  SPSM.Store = Store;
  SPSM.Bus = Bus;
})();
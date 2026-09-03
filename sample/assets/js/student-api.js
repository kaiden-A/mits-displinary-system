(function () {
  var API_BASE = "https://mits-student-server-1088310577603.asia-southeast1.run.app";
  var useLive = false;

  function pad(n, w) {
    return String(n).padStart(w, "0");
  }

  function enrich(raw) {
    var id = raw.id;
    var nameParts = raw.name.split(/\s+BIN\s+|\s+BINTI\s+/i);
    var bapa = nameParts[1] || "Bapa / Penjaga (placeholder)";
    var telR = "03-" + pad((id * 11) % 9000 + 1000, 4) + " " + pad((id * 53) % 9000 + 1000, 4);
    var telB = "01" + pad((id * 7) % 90 + 10, 2) + "-" + pad((id * 137) % 10000000, 7);
    return {
      id: id,
      ic_number: raw.ic_number,
      noKp: raw.ic_number,
      nama: raw.name,
      gender: raw.gender,
      jantina: raw.gender === "female" ? "Perempuan" : "Lelaki",
      tingkatan: raw.tingkatan,
      kelasStream: raw.kelas,
      kelas: raw.tingkatan + " " + raw.kelas,
      birth_year: raw.birth_year,
      year: raw.year,
      umur: raw.year - raw.birth_year,
      noDikenal: "MIT" + pad(id, 3),
      bangsa: "Melayu",
      agama: "Islam",
      tarikhMasuk: "02-01-" + raw.year,
      sekolahTerdahulu: "Sekolah terdahulu (placeholder)",
      bapa: bapa,
      ibu: "Ibu (placeholder)",
      alamat: "Alamat placeholder — MITS, Bandar Seri Putra, 43000 Kajang, Selangor",
      telRumah: telR,
      telPejabat: "",
      telBimbit: telB,
      waris: bapa + " (Bapa)",
      telWarisRumah: telR,
      telWarisPejabat: "",
      telWarisBimbit: telB
    };
  }

  var catalog = (SPSM.SeedStudents || []).map(enrich);

  function matches(item, opts) {
    var o = opts || {};
    if (o.tingkatan != null && String(item.tingkatan) !== String(o.tingkatan)) return false;
    if (o.kelas != null && item.kelasStream !== o.kelas) return false;
    if (o.gender != null && item.gender !== o.gender) return false;
    if (o.birth_year != null && item.birth_year !== Number(o.birth_year)) return false;
    if (o.q) {
      var q = String(o.q).toLowerCase();
      if (item.nama.toLowerCase().indexOf(q) === -1 &&
          item.ic_number.toLowerCase().indexOf(q) === -1 &&
          item.noDikenal.toLowerCase().indexOf(q) === -1) return false;
    }
    return true;
  }

  function sortItems(items, sortBy, order) {
    var key = sortBy || "name";
    var dir = order === "desc" ? -1 : 1;
    return items.slice().sort(function (a, b) {
      var av, bv;
      if (key === "tingkatan") { av = a.tingkatan; bv = b.tingkatan; }
      else if (key === "birth_year") { av = a.birth_year; bv = b.birth_year; }
      else { av = a.nama; bv = b.nama; }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }

  function mockSearch(opts) {
    var o = opts || {};
    var limit = Math.min(o.limit || 50, 200);
    var offset = o.offset || 0;
    var filtered = catalog.filter(function (item) { return matches(item, o); });
    var sorted = sortItems(filtered, o.sort_by, o.order);
    return {
      total: sorted.length,
      limit: limit,
      offset: offset,
      items: sorted.slice(offset, offset + limit)
    };
  }

  function mockGetById(id) {
    var target = String(id);
    for (var i = 0; i < catalog.length; i++) {
      if (String(catalog[i].id) === target) return catalog[i];
    }
    return null;
  }

  async function liveSearch(opts) {
    var qs = [];
    Object.keys(opts || {}).forEach(function (k) {
      if (opts[k] != null && opts[k] !== "") qs.push(encodeURIComponent(k) + "=" + encodeURIComponent(opts[k]));
    });
    var res = await fetch(API_BASE + "/api/v1/students/?" + qs.join("&"));
    var json = await res.json();
    return {
      total: json.total,
      limit: json.limit,
      offset: json.offset,
      items: (json.items || []).map(enrich)
    };
  }

  async function liveGetById(identifier) {
    var res = await fetch(API_BASE + "/api/v1/students/" + encodeURIComponent(identifier));
    if (!res.ok) return null;
    return enrich(await res.json());
  }

  SPSM.StudentApi = {
    API_BASE: API_BASE,
    useLive: function (flag) { useLive = !!flag; return this; },
    isLive: function () { return useLive; },
    list: function () { return catalog.slice(); },
    count: function () { return catalog.length; },
    search: function (opts) {
      if (useLive) return liveSearch(opts);
      return mockSearch(opts);
    },
    getById: function (id) {
      if (useLive) return liveGetById(id);
      return mockGetById(id);
    },
    tingkatanList: function () {
      var seen = {};
      catalog.forEach(function (s) { seen[s.tingkatan] = true; });
      return Object.keys(seen).map(Number).sort(function (a, b) { return a - b; });
    },
    kelasList: function (tingkatan) {
      var seen = {};
      catalog.forEach(function (s) {
        if (tingkatan == null || s.tingkatan === Number(tingkatan)) seen[s.kelasStream] = true;
      });
      return Object.keys(seen).sort();
    }
  };
})();
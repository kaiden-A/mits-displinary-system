(function () {
  var LADDER = [
    {
      tier: 1,
      upTo: 5,
      label: "Peringkat 1 (2-5 mata)",
      steps: [
        "Diberi amaran bertulis.",
        "Diberi tarbiah / membuat khidmat sosial."
      ]
    },
    {
      tier: 2,
      upTo: 10,
      label: "Peringkat 2 (6-10 mata)",
      steps: [
        "Murid mengisi Borang Pengakuan Murid (B05).",
        "Hubungi ibu bapa / penjaga.",
        "Mengeluarkan surat pemberitahuan / surat amaran (B06).",
        "Diberi tarbiah / membuat khidmat sosial."
      ]
    },
    {
      tier: 3,
      upTo: 20,
      label: "Peringkat 3 (11-20 mata)",
      steps: [
        "Murid mengisi Borang Pengakuan Murid (B05).",
        "Hubungi ibu bapa / penjaga.",
        "Mengeluarkan surat pemberitahuan / surat amaran (B06).",
        "Diberi tarbiah / membuat khidmat sosial.",
        "Menghadiri sesi kaunseling."
      ]
    },
    {
      tier: 4,
      upTo: 30,
      label: "Peringkat 4 (21-30 mata)",
      steps: [
        "Murid mengisi Borang Pengakuan Murid (B05).",
        "Hubungi ibu bapa / penjaga.",
        "Mengeluarkan surat pemberitahuan / surat amaran (B06).",
        "Diberi tarbiah / membuat khidmat sosial.",
        "Menandatangani surat perjanjian (B08).",
        "Menghadiri sesi kaunseling."
      ]
    },
    {
      tier: 5,
      upTo: 40,
      label: "Peringkat 5 (31-40 mata)",
      steps: [
        "Murid mengisi Borang Pengakuan Murid (B05).",
        "Hubungi ibu bapa / penjaga.",
        "Mengeluarkan Surat Pemberitahuan / Surat Amaran terakhir dan tarbiah (B06).",
        "Gantung Asrama / Gantung Sekolah / Rotan.",
        "Menandatangani Surat Akujanji (B08).",
        "Menghadiri sesi kaunseling."
      ]
    },
    {
      tier: 6,
      upTo: 50,
      label: "Peringkat 6 (41-50 mata)",
      steps: [
        "Dinasihatkan berpindah sekolah."
      ]
    }
  ];

  function tierFor(points) {
    for (var i = 0; i < LADDER.length; i++) {
      if (points <= LADDER[i].upTo) return LADDER[i];
    }
    return LADDER[LADDER.length - 1];
  }

  function requiredForms(points) {
    var forms = [];
    if (points >= 10) forms.push({ code: "B05", name: "Borang Pengakuan Murid" });
    if (points >= 10) forms.push({ code: "B06", name: points >= 40 ? "Surat Amaran Terakhir" : "Surat Pemberitahuan / Amaran" });
    if (points >= 30) forms.push({ code: "B08", name: points >= 40 ? "Surat Akujanji (akhir)" : "Surat Akujanji" });
    return forms;
  }

  function prefectAllowed() {
    return SPSM.Offences.all().filter(function (o) { return o.max <= 5; });
  }

  var FORMS = {
    B01: { code: "B 01", name: "Borang Aduan Salahlaku Murid", color: "Merah Jambu" },
    B02: { code: "B 02", name: "Borang Laporan Siasatan Aduan", color: "Merah Jambu" },
    B03: { code: "B 03", name: "Kad Peringatan", color: "Putih" },
    B04: { code: "B 04", name: "Buku Rekod Disiplin", color: "Putih" },
    B05: { code: "B 05", name: "Borang Pengakuan Murid", color: "Putih" },
    B06: { code: "B 06", name: "Surat Pemberitahuan / Amaran", color: "Putih" },
    B07: { code: "B 07", name: "Surat Barang Rampasan", color: "Putih" },
    B08: { code: "B 08", name: "Surat Akujanji", color: "Putih" },
    SPSM: { code: "LAM/DIS/002-1", name: "Kad SPSM", color: "Kuning Air" }
  };

  SPSM.Spsm = {
    LADDER: LADDER,
    tierFor: tierFor,
    requiredForms: requiredForms,
    prefectAllowed: prefectAllowed,
    FORMS: FORMS
  };
})();
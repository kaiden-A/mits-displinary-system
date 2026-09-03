(function () {
  var CATEGORIES = {
    A: "Tingkah Laku Jenayah",
    B: "Penyalahgunaan Dadah / Inhalan / Racun / Gam / Ubat Batuk",
    C: "Buli",
    D: "Rokok & Vape",
    E: "Ponteng",
    F: "Tingkah Laku Lucah",
    G: "Tingkah Laku Kurang Sopan / Biadap",
    H: "Kesalahan Vandalisme",
    I: "Tingkah Laku Tidak Amanah",
    J: "Kenakalan",
    K: "Tingkah Laku Tidak Mementingkan Masa",
    L: "Kekemasan Diri",
    M: "Penglibatan Politik",
    N: "Kes Khas"
  };

  var list = [];
  function add(code, cat, name, min, max, action) {
    list.push({ code: code, cat: cat, name: name, min: min, max: max || min, action: action || "" });
  }

  add("A01", "A", "Berjudi / bertaruh (secara besar-besaran)", 40, 50);
  add("A02", "A", "Mencuri", 40, 50);
  add("A03", "A", "Mengancam / memukul / mencederakan guru", 40, 50);
  add("A04", "A", "Mengancam / memukul / mencederakan kakitangan", 40, 50);
  add("A05", "A", "Mengancam / memukul / mencederakan murid", 40, 50);
  add("A06", "A", "Peras ugut", 40, 50);
  add("A07", "A", "Gengsterisme / menganggotai kumpulan haram / kongsi gelap", 40, 50);
  add("A08", "A", "Bawa senjata merbahaya", 40, 50);
  add("A09", "A", "Mencabul kehormatan", 40, 50);
  add("A10", "A", "Menceroboh Bilik Khas / kedai koperasi / pejabat / kantin / kawasan larangan", 40, 50);
  add("A11", "A", "Tunjuk perasaan", 30, 40);
  add("A12", "A", "Merusuh", 40, 50);
  add("A13", "A", "Membunuh", 50);
  add("A14", "A", "Merogol / berzina / meliwat / perlakuan luar tabii", 50);
  add("A15", "A", "Bergaduh / berkelahi", 30, 40);
  add("A16", "A", "Meninggalkan solat / puasa", 40, 50);
  add("A17", "A", "Membawa masuk orang luar ke kawasan sekolah atau orang awam", 40, 50);

  add("B01", "B", "Memiliki / menyimpan dadah, inhalan, racun, gam atau ubat batuk", 40, 50);
  add("B02", "B", "Membekal / menawarkan dadah, inhalan, racun, gam atau ubat batuk", 40, 50);
  add("B03", "B", "Menjual / mengedar dadah, inhalan, racun, gam atau ubat batuk", 40, 50, "Dirampas");
  add("B04", "B", "Menghisap / menyuntik / menyedut / meminum / menghidu dadah, inhalan, racun, gam atau ubat batuk", 40, 50);
  add("B05", "B", "Menghidu bahan-bahan inhalan", 40, 50);

  add("C01", "C", "Buli bahasa", 5);
  add("C02", "C", "Buli fizikal", 20);
  add("C03", "C", "Buli isyarat", 10);
  add("C04", "C", "Buli perhubungan", 10);

  add("D01", "D", "Memiliki / menyimpan rokok / vape", 40, 50);
  add("D02", "D", "Membekal / menawarkan rokok / vape", 40, 50, "Dirampas");
  add("D03", "D", "Menjual dan mengedar rokok / vape", 40, 50, "Dirampas");
  add("D04", "D", "Menghisap rokok / vape", 40, 50);

  add("E01a", "E", "Ponteng 3 hari berturut-turut atau 10 hari tidak berturut-turut", 10);
  add("E01b", "E", "Ponteng 10 hari berturut-turut atau 20 hari tidak berturut-turut", 20);
  add("E01c", "E", "Ponteng 17 hari berturut-turut atau 40 hari tidak berturut-turut", 40);
  add("E01d", "E", "Ponteng 31 hari berturut-turut atau 60 hari tidak berturut-turut", 50);
  add("E02", "E", "Ponteng kelas", 5);
  add("E03", "E", "Ponteng aktiviti kokurikulum", 10);
  add("E04", "E", "Ponteng ujian / peperiksaan", 10);
  add("E05", "E", "Ponteng PREP / kelas intensif", 5);
  add("E06", "E", "Ponteng asrama", 5);
  add("E07", "E", "Ponteng acara rasmi sekolah", 10);
  add("E08", "E", "Ponteng perhimpunan / waktu keagamaan / solat", 10);

  add("F01", "F", "Bercumbuan", 40, 50);
  add("F02", "F", "Berkhalwat", 40, 50);
  add("F03", "F", "Bawa bahan lucah", 20, null, "Dirampas");
  add("F04", "F", "Mengedar bahan lucah", 20, null, "Dirampas");
  add("F05", "F", "Mengintai", 20);
  add("F06", "F", "Menggunakan kata / perbuatan lucah", 20);
  add("F07", "F", "Melukis & menulis kata-kata dan gambar lucah", 20, null, "Padam / Cat");
  add("F08", "F", "Menonton VCD / filem lucah", 20, null, "Dirampas");
  add("F09", "F", "Memeluk murid berlainan jantina", 40, 50);
  add("F10", "F", "Berdua-duaan yang menimbulkan syak", 40, 50);
  add("F11", "F", "Tidur berdua-duaan atau lebih di katil yang sama", 20);
  add("F12", "F", "Bersentuhan antara lelaki dan perempuan bukan mahram", 30);

  add("G01", "G", "Biadap kepada guru", 20);
  add("G02", "G", "Biadap kepada kakitangan", 20);
  add("G03", "G", "Biadap kepada tetamu", 20);
  add("G04", "G", "Berkelakuan kasar kepada murid / pengawas", 5);
  add("G05", "G", "Berbahasa kesat / kasar kepada murid / pengawas", 5);
  add("G06", "G", "Meminum / membeli / menyimpan / mengedar minuman yang memabukkan", 40, 50);
  add("G07", "G", "Membuang sampah merata-rata", 5, null, "Bersihkan");
  add("G08", "G", "Ingkar arahan guru / tidak menghormati guru", 10);
  add("G09", "G", "Ingkar arahan pengawas / tidak menghormati pengawas", 5);
  add("G10", "G", "Meludah di tempat tidak sepatutnya", 3);
  add("G11", "G", "Membuang air kecil / besar di merata tempat", 5);
  add("G12", "G", "Meninggalkan barang peribadi di merata tempat", 2, null, "Dirampas");

  add("H01", "H", "Merosakkan / menconteng harta benda sekolah", 10);
  add("H02", "H", "Merosakkan / menconteng harta benda asrama", 10);
  add("H03", "H", "Merosakkan / menconteng harta benda kantin", 10, null, "Ganti rugi");
  add("H04", "H", "Merosakkan peralatan Bilik-bilik Khas / kesalahan siber (di sekolah)", 10);
  add("H05", "H", "Merosakkan tanaman tumbuhan / tanaman hiasan", 10);
  add("H06", "H", "Menconteng dinding bangunan sekolah", 10, null, "Padam / Cat");
  add("H07", "H", "Menconteng dinding bangunan asrama", 10);
  add("H08", "H", "Merosak / mengoyak buku SPBT / Pusat Sumber", 10);
  add("H09", "H", "Merosakkan peralatan sukan", 10, null, "Ganti rugi");
  add("H10", "H", "Merosakkan kenderaan Pengetua / guru / kakitangan", 10, null, "Ganti rugi");
  add("H11", "H", "Merosakkan harta guru / kakitangan / murid", 10);

  add("I01", "I", "Pecah amanah", 20);
  add("I02", "I", "Berbohong", 10);
  add("I03", "I", "Tidak bertanggungjawab / mencemarkan nama sekolah / nama warga sekolah", 10);
  add("I04", "I", "Tidak jujur / menipu / meniru dalam ujian / peperiksaan", 20, null, "Markah / keputusan peperiksaan dibatalkan");
  add("I05", "I", "Menipu melibatkan kepercayaan", 10);

  add("J01", "J", "Membawa / menunggang motosikal / basikal dalam kawasan sekolah", 5, null, "Disita");
  add("J02", "J", "Masuk tandas berlainan jantina", 5);
  add("J03", "J", "Sengaja membunyikan loceng kecemasan", 10);
  add("J04", "J", "Mengganggu semasa Pengajaran & Pemudahcaraan (PdPc)", 5);
  add("J05", "J", "Tidak ikut giliran / berebut-rebut / bertolak-tolak / hooliganisme", 3);
  add("J06", "J", "Membawa / bermain mercun / pemetik api / telefon bimbit / alat elektronik", 5, null, "Dirampas");
  add("J07", "J", "Mengubahsuai pendawaian elektrik / menyalahguna peralatan elektrik", 10);
  add("J08", "J", "Keluar kawasan sekolah / kelas tanpa kebenaran / berkeliaran di luar kawasan pada waktu persekolahan", 5);
  add("J09", "J", "Lari asrama", 40, 50);
  add("J10", "J", "Balik kampung tanpa kebenaran", 10);
  add("J11", "J", "Bermain dalam kelas / makmal / kantin / kaki lima / tangga / tandas", 5);
  add("J12", "J", "Melanggar peraturan asrama / kelas / makmal / bilik-bilik khas / kantin", 3);
  add("J13", "J", "Menulis dan menyampaikan surat cinta", 5);
  add("J14", "J", "Tidak menghormati bendera, Lagu Kebangsaan dan Lagu Negeri", 5);
  add("J15", "J", "Memasuki ruang makan guru tanpa kebenaran", 3);
  add("J16", "J", "Melakukan aksi keterlaluan atau bahaya (contoh: aksi ekstrim, memanjat bangunan, melompat dari tempat tinggi dan lain-lain)", 10);
  add("J17", "J", "Masuk / tidur di bilik orang lain", 5);
  add("J18", "J", "Mengotorkan kawasan sekolah / asrama", 10, null, "Bersihkan");
  add("J19", "J", "Mengotorkan kawasan kelas / dorm", 5, null, "Bersihkan");
  add("J20", "J", "Membuat bising sehingga mengganggu ketenteraman penghuni lain", 2);
  add("J21", "J", "Membawa makanan bermasak dari dewan makan atau dari luar ke dorm / bilik", 2);
  add("J22", "J", "Menggunakan sinki sebagai tempat merendam pakaian", 2);
  add("J23", "J", "Menggunting rambut di dalam dorm / bilik mandi / bilik basuh / tandas", 2);
  add("J24", "J", "Tidak menjaga kebersihan meja makan", 2);
  add("J25", "J", "Tidak membuang sisa makanan ke tong sampah yang disediakan", 2);
  add("J26", "J", "Membawa peralatan dewan makan ke dorm", 2, null, "Pulangkan");
  add("J27", "J", "Meninggalkan tray / bekas makanan di atas meja dewan makan", 2);
  add("J28", "J", "Meninggalkan sebarang pakaian / alatan mandi / alatan basuh di dalam bilik mandi", 2, null, "Kemaskan");

  add("K01", "K", "Lewat ke sekolah", 2);
  add("K02", "K", "Lewat ke perhimpunan", 2);
  add("K03", "K", "Lewat masuk kelas / solat", 2);
  add("K04", "K", "Lewat datang aktiviti luar kelas / Kokurikulum", 2);
  add("K05", "K", "Lewat masuk / balik ke asrama", 2, null, "Tahan daripada outing");
  add("K06", "K", "Kerap keluar masuk tandas", 2);
  add("K07", "K", "Makan di kantin di luar waktu rehat", 2);
  add("K08", "K", "Lepak", 2);

  add("L01", "L", "Berkuku panjang", 2, null, "Potong");
  add("L02", "L", "Berinai", 2);
  add("L03", "L", "Mengilat / mewarna kuku", 10, null, "Bersihkan");
  add("L04", "L", "Mewarna rambut / qaza'", 10);
  add("L05", "L", "Berambut panjang", 2, null, "Potong");
  add("L06", "L", "Rambut berfesyen", 2, null, "Potong");
  add("L07", "L", "Bermisai / berjanggut", 2);
  add("L08", "L", "Memakai pakaian tidak mengikut peraturan (Perkara 2 : Peraturan Pakaian Rasmi Sekolah; Perkara 3 : Kekemasan dan Kebersihan Diri)", 2);
  add("L09", "L", "Memakai barang kemas / perhiasan", 2, null, "Dirampas");
  add("L10", "L", "Mencukur / membentuk bulu kening", 10);
  add("L11", "L", "Memakai alat solek", 2, null, "Bersihkan");
  add("L12", "L", "Memakai T-shirt bergambar / berwarna dalam pakaian sekolah", 2);
  add("L13", "L", "Membawa / memiliki / memakai pakaian jeans / topi / baju T-bergambar atau apa sahaja pakaian yang bertentangan syarak", 2, null, "Dirampas");
  add("L14", "L", "Tidak memakai pakaian rasmi asrama semasa keluar bandar / balik kampung", 2, null, "Tahan daripada outing");
  add("L15", "L", "Tidak berpakaian kemas / kotor / berbaju tanpa lengan / berseluar pendek / three quarter pants", 2, null, "Tukar / dirampas");

  add("M01", "M", "Penglibatan dalam perhimpunan / perarakan politik", 10);
  add("M02", "M", "Merayu undi dalam pilihanraya", 10);
  add("M03", "M", "Menyebar penulisan / dokumen / propaganda politik", 10);

  add("N01", "N", "Bertatu", 40, 50);
  add("N02", "N", "Mencederakan diri sendiri dan orang lain", 40, 50);
  add("N03", "N", "Cubaan membunuh diri", 40, 50);
  add("N04", "N", "Terjun bangunan", 40, 50);
  add("N05", "N", "Penyalahgunaan racun", 40, 50);
  add("N06", "N", "Hamil luar nikah", 40, 50);
  add("N07", "N", "Lumba haram / basikal lajak", 40, 50);
  add("N08", "N", "Keluar dari sekolah tanpa kebenaran", 40, 50);
  add("N09", "N", "Lari dari sekolah", 40, 50);
  add("N10", "N", "Ajaran sesat dan militan", 40, 50);

  SPSM.Offences = {
    CATEGORIES: CATEGORIES,
    list: list,
    all: function () { return list.slice(); },
    byCode: function (code) {
      for (var i = 0; i < list.length; i++) if (list[i].code === code) return list[i];
      return null;
    },
    range: function (o) {
      return o.min === o.max ? String(o.min) : o.min + "-" + o.max;
    },
    involvesConfiscation: function (code) {
      var o = this.byCode(code);
      if (!o || !o.action) return false;
      return /rampas|sita/i.test(o.action);
    }
  };
})();
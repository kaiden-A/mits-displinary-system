CATEGORIES = {
    "A": "Tingkah Laku Jenayah",
    "B": "Penyalahgunaan Dadah / Inhalan / Racun / Gam / Ubat Batuk",
    "C": "Buli",
    "D": "Rokok & Vape",
    "E": "Ponteng",
    "F": "Tingkah Laku Lucah",
    "G": "Tingkah Laku Kurang Sopan / Biadap",
    "H": "Kesalahan Vandalisme",
    "I": "Tingkah Laku Tidak Amanah",
    "J": "Kenakalan",
    "K": "Tingkah Laku Tidak Mementingkan Masa",
    "L": "Kekemasan Diri",
    "M": "Penglibatan Politik",
    "N": "Kes Khas",
}

# (code, cat, name, min, max, action)
OFFENCES = [
    ("A01", "A", "Berjudi / bertaruh (secara besar-besaran)", 40, 50, ""),
    ("A02", "A", "Mencuri", 40, 50, ""),
    ("A03", "A", "Mengancam / memukul / mencederakan guru", 40, 50, ""),
    ("A04", "A", "Mengancam / memukul / mencederakan kakitangan", 40, 50, ""),
    ("A05", "A", "Mengancam / memukul / mencederakan murid", 40, 50, ""),
    ("A06", "A", "Peras ugut", 40, 50, ""),
    ("A07", "A", "Gengsterisme / menganggotai kumpulan haram / kongsi gelap", 40, 50, ""),
    ("A08", "A", "Bawa senjata merbahaya", 40, 50, ""),
    ("A09", "A", "Mencabul kehormatan", 40, 50, ""),
    ("A10", "A", "Menceroboh Bilik Khas / kedai koperasi / pejabat / kantin / kawasan larangan", 40, 50, ""),
    ("A11", "A", "Tunjuk perasaan", 30, 40, ""),
    ("A12", "A", "Merusuh", 40, 50, ""),
    ("A13", "A", "Membunuh", 50, 50, ""),
    ("A14", "A", "Merogol / berzina / meliwat / perlakuan luar tabii", 50, 50, ""),
    ("A15", "A", "Bergaduh / berkelahi", 30, 40, ""),
    ("A16", "A", "Meninggalkan solat / puasa", 40, 50, ""),
    ("A17", "A", "Membawa masuk orang luar ke kawasan sekolah atau orang awam", 40, 50, ""),
    ("B01", "B", "Memiliki / menyimpan dadah, inhalan, racun, gam atau ubat batuk", 40, 50, ""),
    ("B02", "B", "Membekal / menawarkan dadah, inhalan, racun, gam atau ubat batuk", 40, 50, ""),
    ("B03", "B", "Menjual / mengedar dadah, inhalan, racun, gam atau ubat batuk", 40, 50, "Dirampas"),
    ("B04", "B", "Menghisap / menyuntik / menyedut / meminum / menghidu dadah, inhalan, racun, gam atau ubat batuk", 40, 50, ""),
    ("B05", "B", "Menghidu bahan-bahan inhalan", 40, 50, ""),
    ("C01", "C", "Buli bahasa", 5, 5, ""),
    ("C02", "C", "Buli fizikal", 20, 20, ""),
    ("C03", "C", "Buli isyarat", 10, 10, ""),
    ("C04", "C", "Buli perhubungan", 10, 10, ""),
    ("D01", "D", "Memiliki / menyimpan rokok / vape", 40, 50, ""),
    ("D02", "D", "Membekal / menawarkan rokok / vape", 40, 50, "Dirampas"),
    ("D03", "D", "Menjual dan mengedar rokok / vape", 40, 50, "Dirampas"),
    ("D04", "D", "Menghisap rokok / vape", 40, 50, ""),
    ("E01a", "E", "Ponteng 3 hari berturut-turut atau 10 hari tidak berturut-turut", 10, 10, ""),
    ("E01b", "E", "Ponteng 10 hari berturut-turut atau 20 hari tidak berturut-turut", 20, 20, ""),
    ("E01c", "E", "Ponteng 17 hari berturut-turut atau 40 hari tidak berturut-turut", 40, 40, ""),
    ("E01d", "E", "Ponteng 31 hari berturut-turut atau 60 hari tidak berturut-turut", 50, 50, ""),
    ("E02", "E", "Ponteng kelas", 5, 5, ""),
    ("E03", "E", "Ponteng aktiviti kokurikulum", 10, 10, ""),
    ("E04", "E", "Ponteng ujian / peperiksaan", 10, 10, ""),
    ("E05", "E", "Ponteng PREP / kelas intensif", 5, 5, ""),
    ("E06", "E", "Ponteng asrama", 5, 5, ""),
    ("E07", "E", "Ponteng acara rasmi sekolah", 10, 10, ""),
    ("E08", "E", "Ponteng perhimpunan / waktu keagamaan / solat", 10, 10, ""),
    ("F01", "F", "Bercumbuan", 40, 50, ""),
    ("F02", "F", "Berkhalwat", 40, 50, ""),
    ("F03", "F", "Bawa bahan lucah", 20, 20, "Dirampas"),
    ("F04", "F", "Mengedar bahan lucah", 20, 20, "Dirampas"),
    ("F05", "F", "Mengintai", 20, 20, ""),
    ("F06", "F", "Menggunakan kata / perbuatan lucah", 20, 20, ""),
    ("F07", "F", "Melukis & menulis kata-kata dan gambar lucah", 20, 20, "Padam / Cat"),
    ("F08", "F", "Menonton VCD / filem lucah", 20, 20, "Dirampas"),
    ("F09", "F", "Memeluk murid berlainan jantina", 40, 50, ""),
    ("F10", "F", "Berdua-duaan yang menimbulkan syak", 40, 50, ""),
    ("F11", "F", "Tidur berdua-duaan atau lebih di katil yang sama", 20, 20, ""),
    ("F12", "F", "Bersentuhan antara lelaki dan perempuan bukan mahram", 30, 30, ""),
    ("G01", "G", "Biadap kepada guru", 20, 20, ""),
    ("G02", "G", "Biadap kepada kakitangan", 20, 20, ""),
    ("G03", "G", "Biadap kepada tetamu", 20, 20, ""),
    ("G04", "G", "Berkelakuan kasar kepada murid / pengawas", 5, 5, ""),
    ("G05", "G", "Berbahasa kesat / kasar kepada murid / pengawas", 5, 5, ""),
    ("G06", "G", "Meminum / membeli / menyimpan / mengedar minuman yang memabukkan", 40, 50, ""),
    ("G07", "G", "Membuang sampah merata-rata", 5, 5, "Bersihkan"),
    ("G08", "G", "Ingkar arahan guru / tidak menghormati guru", 10, 10, ""),
    ("G09", "G", "Ingkar arahan pengawas / tidak menghormati pengawas", 5, 5, ""),
    ("G10", "G", "Meludah di tempat tidak sepatutnya", 3, 3, ""),
    ("G11", "G", "Membuang air kecil / besar di merata tempat", 5, 5, ""),
    ("G12", "G", "Meninggalkan barang peribadi di merata tempat", 2, 2, "Dirampas"),
    ("H01", "H", "Merosakkan / menconteng harta benda sekolah", 10, 10, ""),
    ("H02", "H", "Merosakkan / menconteng harta benda asrama", 10, 10, ""),
    ("H03", "H", "Merosakkan / menconteng harta benda kantin", 10, 10, "Ganti rugi"),
    ("H04", "H", "Merosakkan peralatan Bilik-bilik Khas / kesalahan siber (di sekolah)", 10, 10, ""),
    ("H05", "H", "Merosakkan tanaman tumbuhan / tanaman hiasan", 10, 10, ""),
    ("H06", "H", "Menconteng dinding bangunan sekolah", 10, 10, "Padam / Cat"),
    ("H07", "H", "Menconteng dinding bangunan asrama", 10, 10, ""),
    ("H08", "H", "Merosak / mengoyak buku SPBT / Pusat Sumber", 10, 10, ""),
    ("H09", "H", "Merosakkan peralatan sukan", 10, 10, "Ganti rugi"),
    ("H10", "H", "Merosakkan kenderaan Pengetua / guru / kakitangan", 10, 10, "Ganti rugi"),
    ("H11", "H", "Merosakkan harta guru / kakitangan / murid", 10, 10, ""),
    ("I01", "I", "Pecah amanah", 20, 20, ""),
    ("I02", "I", "Berbohong", 10, 10, ""),
    ("I03", "I", "Tidak bertanggungjawab / mencemarkan nama sekolah / nama warga sekolah", 10, 10, ""),
    ("I04", "I", "Tidak jujur / menipu / meniru dalam ujian / peperiksaan", 20, 20, "Markah / keputusan peperiksaan dibatalkan"),
    ("I05", "I", "Menipu melibatkan kepercayaan", 10, 10, ""),
    ("J01", "J", "Membawa / menunggang motosikal / basikal dalam kawasan sekolah", 5, 5, "Disita"),
    ("J02", "J", "Masuk tandas berlainan jantina", 5, 5, ""),
    ("J03", "J", "Sengaja membunyikan loceng kecemasan", 10, 10, ""),
    ("J04", "J", "Mengganggu semasa Pengajaran & Pemudahcaraan (PdPc)", 5, 5, ""),
    ("J05", "J", "Tidak ikut giliran / berebut-rebut / bertolak-tolak / hooliganisme", 3, 3, ""),
    ("J06", "J", "Membawa / bermain mercun / pemetik api / telefon bimbit / alat elektronik", 5, 5, "Dirampas"),
    ("J07", "J", "Mengubahsuai pendawaian elektrik / menyalahguna peralatan elektrik", 10, 10, ""),
    ("J08", "J", "Keluar kawasan sekolah / kelas tanpa kebenaran / berkeliaran di luar kawasan pada waktu persekolahan", 5, 5, ""),
    ("J09", "J", "Lari asrama", 40, 50, ""),
    ("J10", "J", "Balik kampung tanpa kebenaran", 10, 10, ""),
    ("J11", "J", "Bermain dalam kelas / makmal / kantin / kaki lima / tangga / tandas", 5, 5, ""),
    ("J12", "J", "Melanggar peraturan asrama / kelas / makmal / bilik-bilik khas / kantin", 3, 3, ""),
    ("J13", "J", "Menulis dan menyampaikan surat cinta", 5, 5, ""),
    ("J14", "J", "Tidak menghormati bendera, Lagu Kebangsaan dan Lagu Negeri", 5, 5, ""),
    ("J15", "J", "Memasuki ruang makan guru tanpa kebenaran", 3, 3, ""),
    ("J16", "J", "Melakukan aksi keterlaluan atau bahaya (contoh: aksi ekstrim, memanjat bangunan, melompat dari tempat tinggi dan lain-lain)", 10, 10, ""),
    ("J17", "J", "Masuk / tidur di bilik orang lain", 5, 5, ""),
    ("J18", "J", "Mengotorkan kawasan sekolah / asrama", 10, 10, "Bersihkan"),
    ("J19", "J", "Mengotorkan kawasan kelas / dorm", 5, 5, "Bersihkan"),
    ("J20", "J", "Membuat bising sehingga mengganggu ketenteraman penghuni lain", 2, 2, ""),
    ("J21", "J", "Membawa makanan bermasak dari dewan makan atau dari luar ke dorm / bilik", 2, 2, ""),
    ("J22", "J", "Menggunakan sinki sebagai tempat merendam pakaian", 2, 2, ""),
    ("J23", "J", "Menggunting rambut di dalam dorm / bilik mandi / bilik basuh / tandas", 2, 2, ""),
    ("J24", "J", "Tidak menjaga kebersihan meja makan", 2, 2, ""),
    ("J25", "J", "Tidak membuang sisa makanan ke tong sampah yang disediakan", 2, 2, ""),
    ("J26", "J", "Membawa peralatan dewan makan ke dorm", 2, 2, "Pulangkan"),
    ("J27", "J", "Meninggalkan tray / bekas makanan di atas meja dewan makan", 2, 2, ""),
    ("J28", "J", "Meninggalkan sebarang pakaian / alatan mandi / alatan basuh di dalam bilik mandi", 2, 2, "Kemaskan"),
    ("K01", "K", "Lewat ke sekolah", 2, 2, ""),
    ("K02", "K", "Lewat ke perhimpunan", 2, 2, ""),
    ("K03", "K", "Lewat masuk kelas / solat", 2, 2, ""),
    ("K04", "K", "Lewat datang aktiviti luar kelas / Kokurikulum", 2, 2, ""),
    ("K05", "K", "Lewat masuk / balik ke asrama", 2, 2, "Tahan daripada outing"),
    ("K06", "K", "Kerap keluar masuk tandas", 2, 2, ""),
    ("K07", "K", "Makan di kantin di luar waktu rehat", 2, 2, ""),
    ("K08", "K", "Lepak", 2, 2, ""),
    ("L01", "L", "Berkuku panjang", 2, 2, "Potong"),
    ("L02", "L", "Berinai", 2, 2, ""),
    ("L03", "L", "Mengilat / mewarna kuku", 10, 10, "Bersihkan"),
    ("L04", "L", "Mewarna rambut / qaza'", 10, 10, ""),
    ("L05", "L", "Berambut panjang", 2, 2, "Potong"),
    ("L06", "L", "Rambut berfesyen", 2, 2, "Potong"),
    ("L07", "L", "Bermisai / berjanggut", 2, 2, ""),
    ("L08", "L", "Memakai pakaian tidak mengikut peraturan", 2, 2, ""),
    ("L09", "L", "Memakai barang kemas / perhiasan", 2, 2, "Dirampas"),
    ("L10", "L", "Mencukur / membentuk bulu kening", 10, 10, ""),
    ("L11", "L", "Memakai alat solek", 2, 2, "Bersihkan"),
    ("L12", "L", "Memakai T-shirt bergambar / berwarna dalam pakaian sekolah", 2, 2, ""),
    ("L13", "L", "Membawa / memiliki / memakai pakaian jeans / topi / baju T-bergambar atau apa sahaja pakaian yang bertentangan syarak", 2, 2, "Dirampas"),
    ("L14", "L", "Tidak memakai pakaian rasmi asrama semasa keluar bandar / balik kampung", 2, 2, "Tahan daripada outing"),
    ("L15", "L", "Tidak berpakaian kemas / kotor / berbaju tanpa lengan / berseluar pendek / three quarter pants", 2, 2, "Tukar / dirampas"),
    ("M01", "M", "Penglibatan dalam perhimpunan / perarakan politik", 10, 10, ""),
    ("M02", "M", "Merayu undi dalam pilihanraya", 10, 10, ""),
    ("M03", "M", "Menyebar penulisan / dokumen / propaganda politik", 10, 10, ""),
    ("N01", "N", "Bertatu", 40, 50, ""),
    ("N02", "N", "Mencederakan diri sendiri dan orang lain", 40, 50, ""),
    ("N03", "N", "Cubaan membunuh diri", 40, 50, ""),
    ("N04", "N", "Terjun bangunan", 40, 50, ""),
    ("N05", "N", "Penyalahgunaan racun", 40, 50, ""),
    ("N06", "N", "Hamil luar nikah", 40, 50, ""),
    ("N07", "N", "Lumba haram / basikal lajak", 40, 50, ""),
    ("N08", "N", "Keluar dari sekolah tanpa kebenaran", 40, 50, ""),
    ("N09", "N", "Lari dari sekolah", 40, 50, ""),
    ("N10", "N", "Ajaran sesat dan militan", 40, 50, ""),
]

LADDER = [
    {"tier": 1, "up_to": 5, "label": "Peringkat 1 (2-5 mata)", "steps": ["Diberi amaran bertulis.", "Diberi tarbiah / membuat khidmat sosial."]},
    {"tier": 2, "up_to": 10, "label": "Peringkat 2 (6-10 mata)", "steps": ["Murid mengisi Borang Pengakuan Murid (B05).", "Hubungi ibu bapa / penjaga.", "Mengeluarkan surat pemberitahuan / surat amaran (B06).", "Diberi tarbiah / membuat khidmat sosial."]},
    {"tier": 3, "up_to": 20, "label": "Peringkat 3 (11-20 mata)", "steps": ["Murid mengisi Borang Pengakuan Murid (B05).", "Hubungi ibu bapa / penjaga.", "Mengeluarkan surat pemberitahuan / surat amaran (B06).", "Diberi tarbiah / membuat khidmat sosial.", "Menghadiri sesi kaunseling."]},
    {"tier": 4, "up_to": 30, "label": "Peringkat 4 (21-30 mata)", "steps": ["Murid mengisi Borang Pengakuan Murid (B05).", "Hubungi ibu bapa / penjaga.", "Mengeluarkan surat pemberitahuan / surat amaran (B06).", "Diberi tarbiah / membuat khidmat sosial.", "Menandatangani surat perjanjian (B08).", "Menghadiri sesi kaunseling."]},
    {"tier": 5, "up_to": 40, "label": "Peringkat 5 (31-40 mata)", "steps": ["Murid mengisi Borang Pengakuan Murid (B05).", "Hubungi ibu bapa / penjaga.", "Mengeluarkan Surat Pemberitahuan / Surat Amaran terakhir dan tarbiah (B06).", "Gantung Asrama / Gantung Sekolah / Rotan.", "Menandatangani Surat Akujanji (B08).", "Menghadiri sesi kaunseling."]},
    {"tier": 6, "up_to": 50, "label": "Peringkat 6 (41-50 mata)", "steps": ["Dinasihatkan berpindah sekolah."]},
]


def offence_by_code(code: str):
    for row in OFFENCES:
        if row[0] == code:
            return row
    return None


def prefect_allowed():
    return [row for row in OFFENCES if row[4] <= 5]


def involves_confiscation(code: str) -> bool:
    row = offence_by_code(code)
    if not row:
        return False
    action = (row[5] or "").lower()
    return "rampas" in action or "sita" in action


def tier_for(points: int) -> dict:
    for tier in LADDER:
        if points <= tier["up_to"]:
            return tier
    return LADDER[-1]


def required_forms(points: int) -> list[dict]:
    forms = []
    if points >= 10:
        forms.append({"code": "B05", "name": "Borang Pengakuan Murid"})
        forms.append(
            {
                "code": "B06",
                "name": "Surat Amaran Terakhir" if points >= 40 else "Surat Pemberitahuan / Amaran",
            }
        )
    if points >= 30:
        forms.append({"code": "B08", "name": "Surat Akujanji (akhir)" if points >= 40 else "Surat Akujanji"})
    return forms
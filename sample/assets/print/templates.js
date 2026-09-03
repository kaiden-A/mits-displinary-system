(function () {
  var CSS = [
    "@page { size: A4; margin: 14mm 16mm; }",
    "* { box-sizing: border-box; }",
    "body { font-family: 'Times New Roman', Times, serif; color: #000; font-size: 12pt; line-height: 1.5; }",
    ".letterhead { text-align: center; margin-bottom: 4px; }",
    ".letterhead .school { font-size: 14pt; font-weight: bold; }",
    ".letterhead .addr { font-size: 11pt; }",
    ".letterhead .tel { font-size: 11pt; }",
    ".doc-title { text-align: center; font-weight: bold; font-size: 13pt; margin: 6px 0 14px; text-decoration: underline; }",
    ".doc-code { text-align: center; font-weight: bold; margin-top: 10px; }",
    "table { width: 100%; border-collapse: collapse; margin: 10px 0; }",
    "td, th { border: 1px solid #000; padding: 6px 8px; font-size: 11pt; vertical-align: top; }",
    "th { background: #fff; text-align: center; }",
    ".field { margin: 8px 0; }",
    ".fill { display: inline-block; min-width: 180px; border-bottom: 1px solid #000; }",
    ".fill-sm { display: inline-block; min-width: 90px; border-bottom: 1px solid #000; }",
    ".fill-lg { display: inline-block; min-width: 320px; border-bottom: 1px solid #000; }",
    ".sig { margin-top: 44px; }",
    ".sig .name { margin-top: 56px; }",
    ".slogan { text-align: center; font-weight: bold; margin: 18px 0 8px; font-size: 11.5pt; }",
    ".page-break { page-break-before: always; }",
    ".center { text-align: center; }",
    ".right { text-align: right; }",
    ".bold { font-weight: bold; }",
    ".note { font-size: 10.5pt; }",
    ".photo { border: 1px solid #000; width: 130px; height: 150px; text-align: center; padding-top: 56px; font-size: 10pt; }",
    ".no-print { display: none; }"
  ].join("\n");

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function d(iso) {
    if (!iso) return "";
    var dt = new Date(iso);
    if (isNaN(dt.getTime())) return iso;
    var dd = String(dt.getDate()).padStart(2, "0");
    var mm = String(dt.getMonth() + 1).padStart(2, "0");
    return dd + "-" + mm + "-" + dt.getFullYear();
  }

  function head(code, title, sub) {
    return '<div class="doc-code">(' + code + ")</div>" +
      '<div class="doc-title">' + title + "</div>" +
      (sub ? '<div class="center note">' + sub + "</div>" : "");
  }

  function letterhead() {
    return '<div class="letterhead">' +
      '<div class="school">MAAHAD INTEGRASI TAHFIZ SELANGOR (MITS)</div>' +
      '<div class="addr">Bandar Seri Putra, 43000 Kajang, Selangor Darul Ehsan</div>' +
      '<div class="tel">No. Tel : 03-8925 1234 &nbsp;|&nbsp; No. Faks : 03-8925 5678</div>' +
      "</div>";
  }

  function slogan() {
    return '<div class="slogan">"MEMBANGUN BANGSA, MEMAKMUR NEGERI"<br>"BERKHIDMAT KERANA ALLAH UNTUK NEGARA"</div>';
  }

  function studentLine(st) {
    return esc(st.nama) + " (" + esc(st.noDikenal) + ")";
  }

  function b01(c) {
    var st = SPSM.Store.studentById(c.studentId) || {};
    var doc = c.docs.b01 || {};
    var lines = c.offences.map(function (o) { return o.code + " — " + esc(o.name) + " (" + o.points + " mata)"; }).join("; ");
    return head("B 01", "BORANG ADUAN SALAH LAKU MURID", "(Untuk Murid / Guru / Ibu bapa / Penjaga)") +
      '<div class="field">Nama murid yang diadu : <span class="fill-lg">' + studentLine(st) + "</span></div>" +
      '<div class="field">Tingkatan : <span class="fill">' + esc(st.kelas) + "</span></div>" +
      '<div class="field">Tarikh dan masa kejadian : <span class="fill">' + esc(doc.tarikhKejadian || d(c.created)) + '</span> jam <span class="fill-sm">' + esc(doc.masaKejadian || "") + "</span></div>" +
      '<div class="field">Aduan kesalahan : <span class="fill-lg" style="min-width:420px;">' + esc(lines) + "</span></div>" +
      '<div class="field">Butiran aduan :</div>' +
      '<div style="min-height:64px;border-bottom:1px solid #000;padding:4px;">' + esc(doc.aduan || c.details) + "</div>" +
      '<div class="field" style="margin-top:18px;">Cadangan :</div>' +
      '<div style="min-height:56px;border-bottom:1px solid #000;padding:4px;">' + esc(doc.cadangan || "") + "</div>" +
      '<div class="field" style="margin-top:22px;">Tandatangan pengadu : <span class="fill-lg"></span> &nbsp;&nbsp; Tarikh : <span class="fill"></span></div>' +
      '<div class="field">Nama Murid / Guru / Ibu bapa / Penjaga : <span class="fill-lg">' + esc(c.reporter) + "</span></div>" +
      '<div class="field">Alamat : <span class="fill-lg">' + esc(doc.alamatPengadu || "") + "</span></div>" +
      '<div class="field">No. Telefon bimbit : <span class="fill"></span> &nbsp;&nbsp; Rumah / Pejabat : <span class="fill"></span></div>' +
      '<div class="note" style="margin-top:10px;">(Segala maklumat pengadu dirahsiakan)</div>';
  }

  function b02(c) {
    var st = SPSM.Store.studentById(c.studentId) || {};
    var entries = (c.docs && c.docs.b02s) || (c.docs && c.docs.b02 ? [c.docs.b02] : []);
    if (!entries.length) entries = [{}];
    return entries.map(function (e) {
      return head("B 02", "LAPORAN SIASATAN / ADUAN") +
        '<div class="center note">Diisi oleh : ' + esc(e.fillBy || "") + (e.fillRole ? " (" + esc(e.fillRole) + ")" : "") + " &nbsp;|&nbsp; Tarikh : " + esc(d(e.filledAt) || "") + "</div>" +
        "<table>" +
        "<tr><td style='width:50%;'>Aduan : <span class='fill'>" + esc(e.aduan || c.details) + "</span></td>" +
        "<td>Tarikh Aduan : <span class='fill'>" + esc(e.tarikhAduan || "") + "</span></td></tr>" +
        "<tr><td>Butiran Pengadu : <span class='fill'>" + esc(c.reporter) + "</span></td>" +
        "<td>Diterima oleh : <span class='fill'>" + esc(e.diterimaOleh || "") + "</span></td></tr>" +
        "<tr><td>Tarikh / Masa : <span class='fill'>" + esc(e.tarikhMasa || "") + "</span></td>" +
        "<td>Nama murid yang diadu : <span class='fill'>" + studentLine(st) + "</span></td></tr>" +
        "</table>" +
        '<div class="field bold">Isu :</div>' +
        '<div style="min-height:56px;border-bottom:1px solid #000;padding:4px;">' + esc(e.isu || "") + "</div>" +
        '<div class="field bold">Laporan Siasatan</div>' +
        '<div style="min-height:120px;border-bottom:1px solid #000;padding:4px;">' + esc(e.laporan || "") + "</div>" +
        '<div class="field bold">Punca Masalah :</div>' +
        '<div style="min-height:56px;border-bottom:1px solid #000;padding:4px;">' + esc(e.punca || "") + "</div>" +
        '<div class="field bold">Penambahbaikan :</div>' +
        '<div style="min-height:56px;border-bottom:1px solid #000;padding:4px;">' + esc(e.penambahbaikan || "") + "</div>" +
        '<div class="sig">' +
        '<div style="float:left;width:48%;">Disediakan oleh<br><span class="name">Nama : ' + esc(e.disediakanOleh || e.fillBy || "") + '</span><br>Jawatan : <span class="fill">' + esc(e.disediakanJawatan || "") + '</span><br>Tarikh : <span class="fill">' + esc(e.disediakanTarikh || d(e.filledAt)) + "</span></div>" +
        '<div style="float:right;width:48%;">Disemak / Disahkan oleh<br><span class="name">Nama : ' + esc(e.disemakOleh || "") + '</span><br>Jawatan : <span class="fill">' + esc(e.disemakJawatan || "") + '</span><br>Tarikh : <span class="fill">' + esc(e.disemakTarikh || "") + "</span></div>" +
        '<div style="clear:both;"></div></div>';
    }).join('<div style="page-break-before:always;"></div>');
  }

  function b03(c) {
    var st = SPSM.Store.studentById(c.studentId) || {};
    var doc = c.docs.b03 || {};
    var codes = SPSM.Spsm.prefectAllowed().map(function (o) {
      return "<li>" + o.code + " - " + esc(o.name) + "</li>";
    }).join("");
    return '<div class="letterhead"><div class="school">MAAHAD INTEGRASI TAHFIZ SELANGOR (MITS)</div></div>' +
      head("B 03", "KAD PERINGATAN") +
      "<table>" +
      "<tr>" +
      "<td style='width:55%;'>" +
      '<div class="field">Nama Murid : <span class="fill">' + studentLine(st) + "</span></div>" +
      '<div class="field">Tingkatan : <span class="fill">' + esc(st.kelas) + "</span></div>" +
      '<div class="field">Tarikh / Masa : <span class="fill">' + esc(doc.tarikhKejadian || d(c.created)) + "</span></div>" +
      '<div class="field">Kod Kesalahan : <span class="fill">' + esc(c.offences.map(function (o) { return o.code; }).join(", ")) + "</span></div>" +
      '<div class="field">Tindakan : <span class="fill">' + esc(doc.tindakan || "") + "</span></div>" +
      '<div class="field" style="margin-top:22px;">Sila berjumpa dengan <span class="bold">GURU DISIPLIN</span></div>' +
      '<div class="field">(Dalam tempoh 3 hari dari tarikh peringatan)</div>' +
      '<div class="field" style="margin-top:26px;">T.T. Pengawas : <span class="fill"></span> &nbsp;&nbsp; T.T. Murid : <span class="fill"></span></div>' +
      '<div class="field">Nama Pengawas : <span class="fill">' + esc(c.reporter) + "</span></div>" +
      "</td>" +
      "<td>" +
      '<div class="bold" style="text-align:center;">KOD KESALAHAN YANG DIKENAKAN<br>PERINGATAN</div>' +
      "<ul style='margin:8px 0 0 22px;'>" + codes + "</ul>" +
      "</td>" +
      "</tr>" +
      "</table>";
  }

  function b04(c) {
    var cases = SPSM.Store.recordedCases();
    var rows = cases.map(function (cs, i) {
      var st = SPSM.Store.studentById(cs.studentId) || {};
      var offs = cs.offences.map(function (o) { return esc(o.code) + " - " + esc(o.name); }).join("<br>");
      return "<tr><td class='center'>" + (i + 1) + "</td><td>" + d(cs.created) + "</td><td>" + studentLine(st) + "<br><span class='note'>" + esc(st.kelas || "") + "</span></td><td>" + offs + "</td><td></td></tr>";
    }).join("") || '<tr><td colspan="5" class="center note">Tiada rekod disiplin.</td></tr>';
    return head("B 04", "REKOD DISIPLIN MAAHAD INTEGRASI TAHFIZ SELANGOR (MITS)") +
      '<div class="center note">Buku Rekod Disiplin — senarai semua kesalahan murid yang telah direkod</div>' +
      "<table>" +
      "<tr><th style='width:8%;'>BIL</th><th style='width:16%;'>TARIKH</th><th style='width:26%;'>NAMA MURID</th><th style='width:36%;'>KESALAHAN / KOD</th><th style='width:14%;'>CATATAN*</th></tr>" +
      rows +
      "</table>" +
      '<div class="note">* Tandakan &radic; setelah tindakan diambil.</div>';
  }

  function kad(c) {
    var st = SPSM.Store.studentById(c.studentId) || {};
    var all = SPSM.Store.casesOfStudent(c.studentId);
    var rows = all.map(function (cs, i) {
      var offs = cs.offences.map(function (o) { return esc(o.code) + " - " + esc(o.name); }).join("<br>");
      return "<tr><td class='center'>" + (i + 1) + "</td><td>" + d(cs.created) + "</td><td>" + offs + "</td><td></td><td class='center'>" + cs.points + "</td><td></td></tr>";
    }).join("");
    var met = c.meeting;
    var metRows = met
      ? "<tr><td>" + esc(met.tarikh) + "</td><td>" + esc(met.masa) + "</td><td>" + esc(met.nama) + "</td><td>" + esc(met.catatan || "") + "</td><td></td></tr>"
      : '<tr><td colspan="5"></td></tr>';
    var info = [
      ["Nama Murid", st.nama],
      ["Kelas", st.kelas + " &nbsp;&nbsp; No. Dikenal : " + (st.noDikenal || "")],
      ["Jantina", st.jantina + " &nbsp;&nbsp; Bangsa : " + st.bangsa + " &nbsp;&nbsp; Agama : " + st.agama],
      ["No. K/P", st.noKp + " &nbsp;&nbsp; Umur : " + (st.umur || "")],
      ["Tarikh Masuk Sekolah", st.tarikhMasuk],
      ["Nama Sekolah Terdahulu", st.sekolahTerdahulu],
      ["Nama Bapa / Penjaga", st.bapa],
      ["Nama Ibu", st.ibu],
      ["Alamat Rumah", st.alamat],
      ["No. Telefon", "( R ) " + (st.telRumah || "") + " &nbsp;&nbsp; ( P ) " + (st.telPejabat || "")],
      ["No. Telefon Bimbit", st.telBimbit],
      ["Nama Waris Terdekat", st.waris],
      ["No. Telefon", "( R ) " + (st.telWarisRumah || "") + " &nbsp;&nbsp; ( P ) " + (st.telWarisPejabat || "")],
      ["No. Telefon Bimbit", st.telWarisBimbit]
    ].map(function (r) {
      return "<tr><td style='width:38%;' class='bold'>" + r[0] + " :</td><td>" + esc(r[1] || "") + "</td></tr>";
    }).join("");
    return '<div class="doc-code">LAM/DIS/002-1</div>' +
      '<div class="doc-title">KAD SPSM</div>' +
      "<table>" +
      "<tr><td style='width:62%;'>" + info + "</td>" +
      "<td style='width:38%;'><div class='photo'>Gambar<br>Ukuran<br>Pasport</div></td></tr>" +
      "</table>" +
      '<div class="page-break"></div>' +
      '<div class="doc-title">REKOD MATA SPSM</div>' +
      "<table>" +
      "<tr><th style='width:8%;'>BIL</th><th style='width:16%;'>TARIKH</th><th style='width:34%;'>KESALAHAN</th><th style='width:22%;'>TINDAKAN</th><th style='width:10%;'>MATA SPSM</th><th style='width:10%;'>CATATAN</th></tr>" +
      rows +
      "</table>" +
      '<div class="doc-title" style="margin-top:24px;">SESI TEMUBUAL DENGAN IBU BAPA / PENJAGA</div>' +
      "<table>" +
      "<tr><th>Tarikh</th><th>Masa</th><th>Nama</th><th>Catatan / Laporan</th><th>T/Tangan</th></tr>" +
      metRows +
      "</table>" +
      '<div class="field" style="margin-top:18px;">Gred Kelakuan Untuk Sijil Berhenti Sekolah : <span class="fill"></span></div>' +
      '<div class="field">Catatan :</div><div style="min-height:44px;border-bottom:1px solid #000;"></div>';
  }

  function b05(c) {
    var st = SPSM.Store.studentById(c.studentId) || {};
    var doc = c.docs.b05 || {};
    var offs = c.offences.map(function (o) { return esc(o.code) + " - " + esc(o.name); }).join("; ");
    return head("B 05", "BORANG PENGAKUAN MURID") +
      '<div style="text-align:justify;margin:10px 0;">Adalah saya : <span class="fill">' + studentLine(st) + '</span> (Nama) berada di dalam tingkatan : <span class="fill">' + esc(st.kelas) + '</span> dengan ini mengaku tanpa dipaksa oleh guru dan rakan-rakan saya bahawa saya telah melanggar peraturan sekolah iaitu :</div>' +
      '<div style="min-height:80px;border-bottom:1px solid #000;padding:4px;margin:8px 0;">' + esc(offs) + "</div>" +
      '<div style="margin:10px 0;">2. Saya mengaku melakukan perbuatan tersebut : <span class="fill">' + esc(doc.perbuatan || "") + '</span> pada : <span class="fill">' + esc(doc.tarikhPengakuan || "") + '</span> (tarikh) pada pukul : <span class="fill">' + esc(doc.masaPengakuan || "") + '</span> (masa) di <span class="fill-lg">' + esc(doc.tempat || "") + "</span> (tempat)</div>" +
      '<div style="margin:26px 0;">Yang benar,</div>' +
      '<div style="margin-top:52px;">............................ (Tandatangan &amp; Nama Murid)</div>' +
      '<div style="margin:12px 0;">Tarikh : <span class="fill"></span> &nbsp;&nbsp; Masa : <span class="fill"></span></div>' +
      '<div style="margin:16px 0;" class="bold">Pengakuan dibuat di hadapan :</div>' +
      "<table>" +
      "<tr><th>Saksi 1</th><th>Saksi 2</th></tr>" +
      '<tr><td style="height:110px;"><div style="margin-top:84px;">............................</div><div>( Guru Disiplin )</div><div>Tarikh : ............................</div><div>Masa : ............................</div></td>' +
      '<td style="height:110px;"><div style="margin-top:84px;">............................</div><div>( Penolong Kanan HEM )</div><div>Tarikh : ............................</div><div>Masa : ............................</div></td></tr>' +
      "</table>";
  }

  function b06(c) {
    var st = SPSM.Store.studentById(c.studentId) || {};
    var doc = c.docs.b06 || {};
    var level = c.warningLevel || "Pertama";
    var rows = c.offences.map(function (o, i) {
      return "<tr><td class='center'>" + (i + 1) + "</td><td>" + esc(doc.tarikh || d(c.created)) + "</td><td class='center'>" + esc(o.code) + "</td><td>" + esc(o.name) + " (" + o.points + " mata SPSM)</td></tr>";
    }).join("");
    return letterhead() +
      '<div style="margin-top:18px;">Kepada,</div>' +
      '<div>' + esc(st.bapa || "") + ",<br>" + esc(st.alamat || "") + "</div>" +
      '<div style="text-align:right;margin:8px 0;">Tarikh : ' + esc(doc.tarikhSurat || d(c.created)) + "</div>" +
      '<div class="center bold" style="margin:12px 0;">Tuan / Puan</div>' +
      '<div class="doc-title">SURAT PEMBERITAHUAN / AMARAN ' + esc(level.toUpperCase()) + "</div>" +
      '<div style="text-align:justify;margin:10px 0;">Berhubung dengan perkara di atas, dimaklumkan bahawa anak jagaan tuan / puan yang bernama : <span class="fill">' + studentLine(st) + '</span> &nbsp; Tingkatan : <span class="fill">' + esc(st.kelas) + '</span> telah melakukan kesalahan seperti berikut :</div>' +
      "<table>" +
      "<tr><th style='width:8%;'>BIL</th><th style='width:16%;'>TARIKH</th><th style='width:14%;'>KOD SALAHLAKU</th><th>BUTIRAN SALAHLAKU</th></tr>" +
      rows +
      "</table>" +
      '<div style="text-align:justify;margin:12px 0;">2. Oleh itu, anak / jagaan tuan / puan telah dikenakan tindakan :</div>' +
      '<div style="margin:6px 26px;">[&nbsp;&nbsp;] Diberi amaran &nbsp;&nbsp; [&nbsp;&nbsp;] Khidmat Kaunseling &nbsp;&nbsp; [&nbsp;&nbsp;] Hukuman Tarbiah</div>' +
      '<div style="margin:6px 26px;">[&nbsp;&nbsp;] Tukar Sekolah &nbsp;&nbsp; [&nbsp;&nbsp;] Khidmat Sosial &nbsp;&nbsp; [&nbsp;&nbsp;] Lain-lain : <span class="fill"></span></div>' +
      '<div style="text-align:justify;margin:12px 0;">3. Sekiranya anak / jagaan tuan melanggar mana-mana peraturan sekolah, pihak sekolah boleh mengambil tindakan tatatertib mengikut Peraturan (Disiplin) Sekolah 1959 dan Pekeliling Ikhtisas Kementerian Pendidikan Bil (8) 68 KP 8543/02 (12).</div>' +
      '<div style="text-align:justify;margin:12px 0;">4. Sehubungan itu, tuan / puan diminta datang berjumpa dengan Pengetua / PK Pentadbiran / PK HEM pada <span class="fill">' + esc(doc.tarikhJumpa || "") + '</span> jam <span class="fill">' + esc(doc.masaJumpa || "") + "</span> untuk berbincang demi kebaikan sekolah dan anak jagaan tuan.</div>" +
      '<div style="margin:12px 0;">Sekian dimaklumkan, terima kasih.</div>' +
      slogan() +
      '<div style="margin-top:12px;">Saya yang menjalankan amanah,</div>' +
      '<div style="margin-top:56px;">............................</div>' +
      '<div>( Pengetua )</div>' +
      '<div class="note">s.k Fail Disiplin</div>';
  }

  function b07(c) {
    var st = SPSM.Store.studentById(c.studentId) || {};
    var doc = c.docs.b07 || {};
    return letterhead() +
      '<div style="margin-top:18px;">Kepada,</div>' +
      '<div>' + esc(st.bapa || "") + ",<br>" + esc(st.alamat || "") + "</div>" +
      '<div style="text-align:right;margin:8px 0;">Tarikh : ' + esc(doc.tarikhSurat || d(c.created)) + "</div>" +
      '<div class="center bold" style="margin:12px 0;">Tuan / Puan</div>' +
      '<div class="doc-title">SURAT PEMBERITAHUAN TENTANG BARANG RAMPASAN / DISIMPAN OLEH PIHAK SEKOLAH</div>' +
      '<div style="margin:10px 0;">Barang : <span class="fill-lg">' + esc(doc.barang || "") + "</span></div>" +
      '<div style="margin:8px 0;">Nama Murid : <span class="fill">' + studentLine(st) + '</span> &nbsp; Tingkatan : <span class="fill">' + esc(st.kelas) + "</span></div>" +
      '<div style="text-align:justify;margin:12px 0;">Pihak disiplin telah memberi amaran kepada semua murid bahawa barang-barang berkenaan tidak boleh dibawa ke sekolah. Demi mengawal disiplin, pihak sekolah terpaksa merampas barang tersebut.</div>' +
      '<div style="text-align:justify;margin:12px 0;">2. Barang ini hanya akan dipulangkan sekiranya tuan / puan datang mengambil dan menuntut di pejabat sekolah. Diharapkan pihak tuan dapat menunjukkan surat ini semasa menuntut barang tersebut dari pihak sekolah.</div>' +
      '<div style="text-align:justify;margin:12px 0;">3. Pihak sekolah tidak akan memulangkan barang tersebut sekiranya berlaku rampasan kali kedua.</div>' +
      '<div style="margin:12px 0;">Sekian dimaklumkan, terima kasih.</div>' +
      slogan() +
      '<div style="margin-top:12px;">Saya yang menjalankan amanah,</div>' +
      '<div style="margin-top:56px;">............................</div>' +
      '<div>( Pengetua )</div>' +
      '<div class="note">s.k Fail Disiplin</div>' +
      '<div class="page-break"></div>' +
      '<div class="doc-title">MAKLUMAT SEMASA MENUNTUT BARANG</div>' +
      "<table>" +
      "<tr><td style='width:5%;' class='center'>1.</td><td style='width:35%;'>Barang</td><td>" + esc(doc.barang || "") + "</td></tr>" +
      "<tr><td class='center'>2.</td><td>Nama ibu / bapa / penjaga</td><td>" + esc(doc.penuntutNama || "") + "</td></tr>" +
      "<tr><td class='center'>3.</td><td>No. kad pengenalan</td><td>" + esc(doc.penuntutKp || "") + "</td></tr>" +
      "<tr><td class='center'>4.</td><td>Nama penyerah barang</td><td>" + esc(doc.penyerahNama || "") + "</td></tr>" +
      "<tr><td class='center'>5.</td><td>Tarikh serahan barang</td><td>" + esc(doc.tarikhSerahan || "") + "</td></tr>" +
      "</table>" +
      '<div style="margin-top:30px;"><span style="float:left;width:50%;">T. Tangan : ............................<br><br>No. Telefon : ............................</span>' +
      '<span style="float:right;width:50%;text-align:right;">T. Tangan : ............................</span><div style="clear:both;"></div></div>';
  }

  function b08(c) {
    var st = SPSM.Store.studentById(c.studentId) || {};
    var doc = c.docs.b08 || {};
    return letterhead() +
      '<div class="doc-title">SURAT AKUJANJI</div>' +
      '<div class="doc-title" style="margin-top:0;">PERJANJIAN JAMINAN BERKELAKUAN BAIK</div>' +
      '<div style="margin:10px 0;">Alamat sekolah : <span class="fill-lg">Bandar Seri Putra, 43000 Kajang, Selangor</span> &nbsp; Tarikh : <span class="fill">' + esc(doc.tarikh || d(c.created)) + "</span></div>" +
      '<div style="margin:12px 0;">Bahawa saya <span class="fill-lg">' + studentLine(st) + '</span> &nbsp; Tingkatan : <span class="fill">' + esc(st.kelas) + "</span></div>" +
      '<div style="text-align:justify;margin:12px 0;">mengaku untuk berkelakuan baik dan mematuhi segala peraturan yang ditetapkan oleh sekolah, Jabatan Agama Islam Selangor (JAIS) dan Kementerian Pendidikan Malaysia.</div>' +
      '<div style="text-align:justify;margin:12px 0;">Jika saya didapati mengulangi kesalahan saya, pihak sekolah boleh mengambil tindakan tatatertib membuang sekolah mengikut Peraturan-peraturan Pelajaran (Disiplin Sekolah) 1959 dan Pekeliling Ikhtisas Kementerian Pendidikan Bil (6) 68 KP 8543 (10) dan Bil (8) 68 KP 8543/02 (12).</div>' +
      '<div style="margin-top:30px;"><span style="float:left;width:50%;">Yang benar,<br><br><br><br>............................<br>(Nama Murid)</span>' +
      '<span style="float:right;width:50%;text-align:right;">Disaksikan oleh,<br><br><br><br>............................<br>(Nama PK HEM / Guru Disiplin)</span><div style="clear:both;"></div></div>' +
      '<div class="doc-title" style="margin-top:34px;">JAMINAN IBU BAPA / PENJAGA</div>' +
      '<div style="text-align:justify;margin:12px 0;">Bahawa saya <span class="fill">' + esc(st.bapa || "") + '</span> &nbsp; K/P : <span class="fill">' + esc(doc.kpIbuBapa || "") + '</span> &nbsp; Beralamat di : <span class="fill-lg">' + esc(st.alamat || "") + "</span></div>" +
      '<div style="text-align:justify;margin:12px 0;">Ibu bapa / penjaga kepada murid yang tersebut di atas menjamin akan menjaga tingkah laku anak saya / anak jagaan saya sebagaimana yang telah ditetapkan dalam Peraturan-peraturan Pelajaran (Disiplin Sekolah) 1959 dan Pekeliling Ikhtisas Kementerian Pendidikan Bil (6) 68 KP 8543 (10) dan Bil (8) 68 KP 8543/02 (12).</div>' +
      '<div style="margin-top:30px;"><span style="float:left;width:50%;">Yang benar,<br><br><br><br>............................<br>(Nama Ibu bapa / Penjaga)</span>' +
      '<span style="float:right;width:50%;text-align:right;">Disaksikan oleh,<br><br><br><br>............................<br>(Nama Pengetua)</span><div style="clear:both;"></div></div>';
  }

  SPSM.PrintCSS = CSS;
  SPSM.Tpl = {
    b01: b01,
    b02: b02,
    b03: b03,
    b04: b04,
    kad: kad,
    b05: b05,
    b06: b06,
    b07: b07,
    b08: b08
  };
})();
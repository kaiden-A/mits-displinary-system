(function () {
  function open(title, bodyHtml, opts) {
    var o = opts || {};
    var w = window.open("", "_blank", "width=920,height=760");
    if (!w) return;
    var full = "<!DOCTYPE html><html lang='ms'><head><meta charset='utf-8'>" +
      "<title>" + title + "</title>" +
      "<style>" + SPSM.PrintCSS + "</style></head><body>" +
      "<div style='position:fixed;top:0;left:0;right:0;background:#0f766e;color:#fff;padding:8px 16px;z-index:99;font-family:sans-serif;font-size:14px;' class='no-print'>" +
      "<strong>SPSM &bull; MITS</strong> &mdash; " + title +
      " &nbsp;<button onclick='window.print()' style='margin-left:12px;padding:4px 14px;border:none;border-radius:4px;background:#fff;color:#0f766e;font-weight:bold;cursor:pointer;'>Cetak / Simpan PDF</button>" +
      " <button onclick='window.close()' style='padding:4px 10px;border:none;border-radius:4px;background:rgba(255,255,255,.25);color:#fff;cursor:pointer;'>Tutup</button>" +
      "</div>" +
      "<div style='padding-top:44px;'>" + bodyHtml + "</div>" +
      "<script>setTimeout(function(){window.print();},600);<\/script>" +
      "</body></html>";
    w.document.write(full);
    w.document.close();
  }

  SPSM.Print = {
    b01: function (c) { open("B 01 - Borang Aduan Salahlaku Murid", SPSM.Tpl.b01(c)); },
    b02: function (c) { open("B 02 - Laporan Siasatan / Aduan", SPSM.Tpl.b02(c)); },
    b03: function (c) { open("B 03 - Kad Peringatan", SPSM.Tpl.b03(c)); },
    b04: function (c) { open("B 04 - Rekod Disiplin", SPSM.Tpl.b04(c)); },
    kad: function (c) { open("LAM/DIS/002-1 - Kad SPSM", SPSM.Tpl.kad(c)); },
    b05: function (c) { open("B 05 - Borang Pengakuan Murid", SPSM.Tpl.b05(c)); },
    b06: function (c) { open("B 06 - Surat Pemberitahuan / Amaran", SPSM.Tpl.b06(c)); },
    b07: function (c) { open("B 07 - Surat Barang Rampasan", SPSM.Tpl.b07(c)); },
    b08: function (c) { open("B 08 - Surat Akujanji", SPSM.Tpl.b08(c)); }
  };
})();
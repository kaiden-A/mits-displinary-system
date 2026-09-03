# Behavior Report — Ringkasan Keseluruhan (SPSM MITS)

> Dijana pada: 2026-09-03T04:46:12.756Z · Total ujian: 320 · ✅ Lulus: 320 · ❌ Gagal: 0

## Senarai Laporan

| Laporan | Ujian | Lulus | Gagal |
| --- | --- | --- | --- |
| [01-workflows.md](./01-workflows.md) | 39 | 39 | 0 |
| [02-merit-rules.md](./02-merit-rules.md) | 92 | 92 | 0 |
| [03-roles-access.md](./03-roles-access.md) | 89 | 89 | 0 |
| [04-documents.md](./04-documents.md) | 34 | 34 | 0 |
| [05-print-templates.md](./05-print-templates.md) | 23 | 23 | 0 |
| [06-store-persistence.md](./06-store-persistence.md) | 14 | 14 | 0 |
| [07-student-api.md](./07-student-api.md) | 29 | 29 | 0 |
| **Total** | 320 | 320 | 0 |

## Senario Dilindungi

- **Aliran (Workflows):** aduan guru ≤5 mata (auto B04), aduan guru >5 mata (B02 → berasas → B04 → B05 → B06/B08 → pengetua → hukuman → maklum ibu bapa → pertemuan / tanpa pertemuan), cabang tolak (dismiss), kad peringatan pengawas (terima → B04 / tolak), spot check (B02 → B04), peralihan haram ditolak, laluan stepper mengikut sumber & mata.
- **Peraturan mata:** sempadan tier 1–50, borang wajib pada 10/20/30/40, sempadan B02 & auto-B04 pada 5/6 mata, senarai pengawas (53 kesalahan ≤5 mata), rampasan (rampas/sita).
- **Peranan & akses:** matriks 14 tindakan × 4 peranan, kawalan laluan (guru/pengawas/disiplin/pengetua), cap 5 mata pengawas, B02 boleh diisi guru & disiplin.
- **Dokumen:** keterlihatan B01–B08 + Kad SPSM mengikut jenis kes (b02 hanya perlu siasatan, b07 hanya rampasan, b05/b06 ≥10 mata, b08 ≥30 mata).
- **Templat cetakan:** semua 9 dokumen dijana, B04 daftar penuh hanya kes direkod (kecuali REPORTED/DISMISSED), B03 senarai kod ≤5 mata sahaja.
- **Penyimpanan:** kitaran save/load localStorage, kenaikan seq, reset kembali kepada data seed.

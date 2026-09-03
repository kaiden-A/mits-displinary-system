# Behavior Report — Penyimpanan Data (Store & Persistence)

> Dijana pada: 2026-09-03T04:13:13.784Z · Total: 14 · ✅ Lulus: 14 · ❌ Gagal: 0

## Ringkasan

| Keputusan | Bilangan |
| --- | --- |
| ✅ Lulus | 14 |
| ❌ Gagal | 0 |
| Total | 14 |

## Keputusan Terperinci

| # | Ujian | Status | Jangkaan / Sebenar |
| --- | --- | --- | --- |
| 1 | seed has 4 cases | ✅ PASS | got=4 |
| 2 | seed students 287 | ✅ PASS | got=287 |
| 3 | seq after seed is 104 | ✅ PASS | got=104 |
| 4 | seq increments | ✅ PASS | got=["K-104","K-105"] |
| 5 | persisted to localStorage | ✅ PASS |  |
| 6 | reload keeps data | ✅ PASS | got=6 |
| 7 | updateCase persists | ✅ PASS | got=99 |
| 8 | addEvent appends | ✅ PASS |  |
| 9 | casesOfStudent works | ✅ PASS | got=1 |
| 10 | studentById missing -> null | ✅ PASS |  |
| 11 | caseById missing -> null | ✅ PASS |  |
| 12 | reset restores seeds | ✅ PASS | got=4 |
| 13 | reset restores seq | ✅ PASS | got=104 |
| 14 | reset clears new cases | ✅ PASS |  |

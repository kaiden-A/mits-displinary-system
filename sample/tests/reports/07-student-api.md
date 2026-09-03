# Behavior Report — API Pelajar (Student API & Snapshot)

> Dijana pada: 2026-09-03T04:46:12.755Z · Total: 29 · ✅ Lulus: 29 · ❌ Gagal: 0

## Ringkasan

| Keputusan | Bilangan |
| --- | --- |
| ✅ Lulus | 29 |
| ❌ Gagal | 0 |
| Total | 29 |

## Keputusan Terperinci

| # | Ujian | Status | Jangkaan / Sebenar |
| --- | --- | --- | --- |
| 1 | catalog has 287 students | ✅ PASS | got=287 |
| 2 | mock backend active by default | ✅ PASS |  |
| 3 | getById(1) returns student | ✅ PASS |  |
| 4 | ic_number masked format | ✅ PASS | got="130419-10-1307" |
| 5 | ic_number masked != raw | ✅ PASS | got="130419-10-1307" |
| 6 | name preserved from API | ✅ PASS | got="ABDUL HAKIM AL AQHARI BIN ABDUL HALIM" |
| 7 | kelas combined label | ✅ PASS | got="1 IMAM NAFI'" |
| 8 | kelasStream raw | ✅ PASS | got="IMAM NAFI'" |
| 9 | noDikenal derived | ✅ PASS | got="MIT001" |
| 10 | gender derived | ✅ PASS | got="Lelaki" |
| 11 | umur derived | ✅ PASS | got=13 |
| 12 | bapa derived from name after BIN | ✅ PASS | got="ABDUL HALIM" |
| 13 | placeholder guardian fields present | ✅ PASS |  |
| 14 | search q 'abdul' works | ✅ PASS | got=9 |
| 15 | filter tingkatan=5 | ✅ PASS | got=50 |
| 16 | filter kelas stream | ✅ PASS | got=143 |
| 17 | filter gender female | ✅ PASS | got=138 |
| 18 | combined tingkatan+kelas filter | ✅ PASS | got=35 |
| 19 | pagination limit | ✅ PASS | got=10 |
| 20 | sort tingkatan desc | ✅ PASS | got=5 |
| 21 | total consistent (empty query = 287) | ✅ PASS | got=287 |
| 22 | getById missing -> null | ✅ PASS |  |
| 23 | tingkatanList 1-5 | ✅ PASS | got=[1,2,3,4,5] |
| 24 | kelasList both streams | ✅ PASS | got=["IBNU KATHIR","IMAM NAFI'"] |
| 25 | case stores studentSnapshot | ✅ PASS | got="ABDUL HAKIM AL AQHARI BIN ABDUL HALIM" |
| 26 | studentById works via catalog | ✅ PASS |  |
| 27 | studentById falls back to snapshot | ✅ PASS |  |
| 28 | catalog not persisted (no students key) | ✅ PASS |  |
| 29 | catalog count stable after reset | ✅ PASS |  |

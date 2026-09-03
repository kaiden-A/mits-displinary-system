# Behavior Report — Dokumen & Panel Mengikut Kes (Documents)

> Dijana pada: 2026-09-03T04:46:12.755Z · Total: 34 · ✅ Lulus: 34 · ❌ Gagal: 0

## Ringkasan

| Keputusan | Bilangan |
| --- | --- |
| ✅ Lulus | 34 |
| ❌ Gagal | 0 |
| Total | 34 |

## Keputusan Terperinci

| # | Ujian | Status | Jangkaan / Sebenar |
| --- | --- | --- | --- |
| 1 | light complaint docs | ✅ PASS | got=["b01","b04","kad"] |
| 2 | heavy complaint docs (needsB02, >=10, >=30) | ✅ PASS | got=["b01","b02","b04","b05","b06","b08","kad"] |
| 3 | prefect docs include b03 | ✅ PASS | got=["b01","b03","b04","kad"] |
| 4 | confiscation case includes b07 | ✅ PASS | got=["b01","b02","b04","b05","b06","b07","b08","kad"] |
| 5 | confiscation case >=40 still b05/b06/b08 | ✅ PASS | got=["b01","b02","b04","b05","b06","b07","b08","kad"] |
| 6 | spot check docs include b02 | ✅ PASS | got=["b01","b02","b04","b05","b06","b08","kad"] |
| 7 | 5 pts no b05 | ✅ PASS | got=["b01","b04","kad"] |
| 8 | 10 pts has b05+b06 | ✅ PASS | got=["b01","b02","b04","b05","b06","kad"] |
| 9 | heavy complaint b02 panel at REPORTED | ✅ PASS | got=true |
| 10 | heavy complaint b06 panel | ✅ PASS | got=true |
| 11 | heavy complaint b07 panel hidden | ✅ PASS | got=false |
| 12 | light complaint b02 panel hidden | ✅ PASS |  |
| 13 | light complaint b06 panel hidden | ✅ PASS |  |
| 14 | b07 panel appears once barang recorded | ✅ PASS | got=true |
| 15 | guru sees only b01+b02 on heavy case | ✅ PASS | got=["b01","b02"] |
| 16 | guru sees only b01 on light case | ✅ PASS | got=["b01"] |
| 17 | disiplin sees all docs on heavy case | ✅ PASS | got=["b01","b02","b04","b05","b06","b08","kad"] |
| 18 | pengetua sees all docs on heavy case | ✅ PASS | got=["b01","b02","b04","b05","b06","b08","kad"] |
| 19 | pengawas blocked from docs (no case access anyway) | ✅ PASS | got=0 |
| 20 | addB02 returns entry with id | ✅ PASS | got=["B02-1","B02-2"] |
| 21 | multiple B02 tracked per case | ✅ PASS | got=2 |
| 22 | B02 entries carry filler + role + time | ✅ PASS |  |
| 23 | B02 fillers differ per user | ✅ PASS |  |
| 24 | addB02 logs timeline event | ✅ PASS |  |
| 25 | hasB02 true after entries | ✅ PASS | got=true |
| 26 | docFillStatus B02 filled with both names | ✅ PASS | got="Cikgu Nurul Aisyah (Guru), Tuan Hj. Syed Omar (Guru Disiplin)" |
| 27 | docFillStatus B01 filled by reporter | ✅ PASS |  |
| 28 | docFillStatus B04 not yet recorded (REPORTED) | ✅ PASS | got="REPORTED" |
| 29 | step states: current step is prepare | ✅ PASS | got="STUDENT_ACK" |
| 30 | step states: no action step pending before its turn | ✅ PASS | got=["null:info","prepare:current"] |
| 31 | step states: approve becomes current at ACTION_PREPARED | ✅ PASS | got="ACTION_PREPARED" |
| 32 | step states: sign becomes current at PRINCIPAL_APPROVAL | ✅ PASS | got="PRINCIPAL_APPROVAL" |
| 33 | docFillStatus B05 filled after STUDENT_ACK | ✅ PASS | got="PRINCIPAL_APPROVAL" |
| 34 | docFillStatus B04 filled after RECORDED | ✅ PASS |  |

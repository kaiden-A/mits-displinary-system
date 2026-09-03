# Behavior Report — Peranan & Kebenaran Akses (Roles & Access)

> Dijana pada: 2026-09-03T04:46:12.753Z · Total: 89 · ✅ Lulus: 89 · ❌ Gagal: 0

## Ringkasan

| Keputusan | Bilangan |
| --- | --- |
| ✅ Lulus | 89 |
| ❌ Gagal | 0 |
| Total | 89 |

## Keputusan Terperinci

| # | Ujian | Status | Jangkaan / Sebenar |
| --- | --- | --- | --- |
| 1 | canAct(guru, startInvestigation) | ✅ PASS | expect=false got=false |
| 2 | canAct(pengawas, startInvestigation) | ✅ PASS | expect=false got=false |
| 3 | canAct(disiplin, startInvestigation) | ✅ PASS | expect=true got=true |
| 4 | canAct(pengetua, startInvestigation) | ✅ PASS | expect=false got=false |
| 5 | canAct(guru, confirm) | ✅ PASS | expect=false got=false |
| 6 | canAct(pengawas, confirm) | ✅ PASS | expect=false got=false |
| 7 | canAct(disiplin, confirm) | ✅ PASS | expect=true got=true |
| 8 | canAct(pengetua, confirm) | ✅ PASS | expect=false got=false |
| 9 | canAct(guru, dismiss) | ✅ PASS | expect=false got=false |
| 10 | canAct(pengawas, dismiss) | ✅ PASS | expect=false got=false |
| 11 | canAct(disiplin, dismiss) | ✅ PASS | expect=true got=true |
| 12 | canAct(pengetua, dismiss) | ✅ PASS | expect=false got=false |
| 13 | canAct(guru, approveWarning) | ✅ PASS | expect=false got=false |
| 14 | canAct(pengawas, approveWarning) | ✅ PASS | expect=false got=false |
| 15 | canAct(disiplin, approveWarning) | ✅ PASS | expect=true got=true |
| 16 | canAct(pengetua, approveWarning) | ✅ PASS | expect=false got=false |
| 17 | canAct(guru, rejectWarning) | ✅ PASS | expect=false got=false |
| 18 | canAct(pengawas, rejectWarning) | ✅ PASS | expect=false got=false |
| 19 | canAct(disiplin, rejectWarning) | ✅ PASS | expect=true got=true |
| 20 | canAct(pengetua, rejectWarning) | ✅ PASS | expect=false got=false |
| 21 | canAct(guru, record) | ✅ PASS | expect=false got=false |
| 22 | canAct(pengawas, record) | ✅ PASS | expect=false got=false |
| 23 | canAct(disiplin, record) | ✅ PASS | expect=true got=true |
| 24 | canAct(pengetua, record) | ✅ PASS | expect=false got=false |
| 25 | canAct(guru, ack) | ✅ PASS | expect=false got=false |
| 26 | canAct(pengawas, ack) | ✅ PASS | expect=false got=false |
| 27 | canAct(disiplin, ack) | ✅ PASS | expect=true got=true |
| 28 | canAct(pengetua, ack) | ✅ PASS | expect=false got=false |
| 29 | canAct(guru, prepare) | ✅ PASS | expect=false got=false |
| 30 | canAct(pengawas, prepare) | ✅ PASS | expect=false got=false |
| 31 | canAct(disiplin, prepare) | ✅ PASS | expect=true got=true |
| 32 | canAct(pengetua, prepare) | ✅ PASS | expect=false got=false |
| 33 | canAct(guru, approve) | ✅ PASS | expect=false got=false |
| 34 | canAct(pengawas, approve) | ✅ PASS | expect=false got=false |
| 35 | canAct(disiplin, approve) | ✅ PASS | expect=true got=true |
| 36 | canAct(pengetua, approve) | ✅ PASS | expect=false got=false |
| 37 | canAct(guru, sign) | ✅ PASS | expect=false got=false |
| 38 | canAct(pengawas, sign) | ✅ PASS | expect=false got=false |
| 39 | canAct(disiplin, sign) | ✅ PASS | expect=false got=false |
| 40 | canAct(pengetua, sign) | ✅ PASS | expect=true got=true |
| 41 | canAct(guru, execute) | ✅ PASS | expect=false got=false |
| 42 | canAct(pengawas, execute) | ✅ PASS | expect=false got=false |
| 43 | canAct(disiplin, execute) | ✅ PASS | expect=true got=true |
| 44 | canAct(pengetua, execute) | ✅ PASS | expect=false got=false |
| 45 | canAct(guru, notify) | ✅ PASS | expect=false got=false |
| 46 | canAct(pengawas, notify) | ✅ PASS | expect=false got=false |
| 47 | canAct(disiplin, notify) | ✅ PASS | expect=true got=true |
| 48 | canAct(pengetua, notify) | ✅ PASS | expect=false got=false |
| 49 | canAct(guru, meeting) | ✅ PASS | expect=false got=false |
| 50 | canAct(pengawas, meeting) | ✅ PASS | expect=false got=false |
| 51 | canAct(disiplin, meeting) | ✅ PASS | expect=true got=true |
| 52 | canAct(pengetua, meeting) | ✅ PASS | expect=false got=false |
| 53 | canAct(guru, close) | ✅ PASS | expect=false got=false |
| 54 | canAct(pengawas, close) | ✅ PASS | expect=false got=false |
| 55 | canAct(disiplin, close) | ✅ PASS | expect=true got=true |
| 56 | canAct(pengetua, close) | ✅ PASS | expect=false got=false |
| 57 | route guru/dashboard | ✅ PASS | expect=false got=false |
| 58 | route guru/report | ✅ PASS | expect=true got=true |
| 59 | route guru/warning | ✅ PASS | expect=false got=false |
| 60 | route guru/catalogue | ✅ PASS | expect=true got=true |
| 61 | route guru/students | ✅ PASS | expect=false got=false |
| 62 | route guru/case | ✅ PASS | expect=true got=true |
| 63 | route guru/student | ✅ PASS | expect=true got=true |
| 64 | route pengawas/dashboard | ✅ PASS | expect=false got=false |
| 65 | route pengawas/report | ✅ PASS | expect=false got=false |
| 66 | route pengawas/warning | ✅ PASS | expect=true got=true |
| 67 | route pengawas/catalogue | ✅ PASS | expect=false got=false |
| 68 | route pengawas/students | ✅ PASS | expect=false got=false |
| 69 | route pengawas/case | ✅ PASS | expect=false got=false |
| 70 | route pengawas/student | ✅ PASS | expect=false got=false |
| 71 | route disiplin/dashboard | ✅ PASS | expect=true got=true |
| 72 | route disiplin/report | ✅ PASS | expect=false got=false |
| 73 | route disiplin/warning | ✅ PASS | expect=false got=false |
| 74 | route disiplin/catalogue | ✅ PASS | expect=true got=true |
| 75 | route disiplin/students | ✅ PASS | expect=true got=true |
| 76 | route disiplin/case | ✅ PASS | expect=true got=true |
| 77 | route disiplin/student | ✅ PASS | expect=true got=true |
| 78 | route pengetua/dashboard | ✅ PASS | expect=true got=true |
| 79 | route pengetua/report | ✅ PASS | expect=false got=false |
| 80 | route pengetua/warning | ✅ PASS | expect=false got=false |
| 81 | route pengetua/catalogue | ✅ PASS | expect=true got=true |
| 82 | route pengetua/students | ✅ PASS | expect=true got=true |
| 83 | route pengetua/case | ✅ PASS | expect=true got=true |
| 84 | route pengetua/student | ✅ PASS | expect=true got=true |
| 85 | homeFor guru | ✅ PASS | got="#/report" |
| 86 | homeFor pengawas | ✅ PASS | got="#/warning" |
| 87 | homeFor disiplin | ✅ PASS | got="#/dashboard" |
| 88 | homeFor pengetua | ✅ PASS | got="#/dashboard" |
| 89 | guru CAN fill B02 for own complaint (docs editable) | ✅ PASS | got=true |

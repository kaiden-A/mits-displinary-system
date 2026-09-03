# Behavior Report — Aliran Kerja (Workflows)

> Dijana pada: 2026-09-03T04:46:12.752Z · Total: 39 · ✅ Lulus: 39 · ❌ Gagal: 0

## Ringkasan

| Keputusan | Bilangan |
| --- | --- |
| ✅ Lulus | 39 |
| ❌ Gagal | 0 |
| Total | 39 |

## Keputusan Terperinci

| # | Ujian | Status | Jangkaan / Sebenar |
| --- | --- | --- | --- |
| 1 | COMPLAINT <=5 auto status RECORDED | ✅ PASS | expect="RECORDED" got="RECORDED" |
| 2 | COMPLAINT <=5 event mentions B04 | ✅ PASS | got="Aduan (B01) diterima daripada Ujian dan direkod terus dalam B04 (Buku Rekod Disiplin)." |
| 3 | COMPLAINT <=5 execute -> EXECUTED | ✅ PASS | got="EXECUTED" |
| 4 | COMPLAINT <=5 close -> CLOSED | ✅ PASS | got="CLOSED" |
| 5 | COMPLAINT <=5 events appended | ✅ PASS | expect=3 got=3 |
| 6 | COMPLAINT >5 starts REPORTED | ✅ PASS | got="REPORTED" |
| 7 | COMPLAINT >5 needsB02 true | ✅ PASS |  |
| 8 | B02 simpan oleh guru (docs wujud) | ✅ PASS | got=1 |
| 9 | COMPLAINT heavy: startInvestigation -> INVESTIGATING | ✅ PASS | expect="INVESTIGATING" got="INVESTIGATING" |
| 10 | COMPLAINT heavy: confirm -> CONFIRMED | ✅ PASS | expect="CONFIRMED" got="CONFIRMED" |
| 11 | COMPLAINT heavy: record -> RECORDED | ✅ PASS | expect="RECORDED" got="RECORDED" |
| 12 | COMPLAINT heavy: ack -> STUDENT_ACK | ✅ PASS | expect="STUDENT_ACK" got="STUDENT_ACK" |
| 13 | COMPLAINT heavy: prepare -> ACTION_PREPARED | ✅ PASS | expect="ACTION_PREPARED" got="ACTION_PREPARED" |
| 14 | COMPLAINT heavy: approve -> PRINCIPAL_APPROVAL | ✅ PASS | expect="PRINCIPAL_APPROVAL" got="PRINCIPAL_APPROVAL" |
| 15 | COMPLAINT heavy: sign -> EXECUTED | ✅ PASS | expect="EXECUTED" got="EXECUTED" |
| 16 | COMPLAINT heavy: notify -> PARENT_NOTIFIED | ✅ PASS | expect="PARENT_NOTIFIED" got="PARENT_NOTIFIED" |
| 17 | COMPLAINT heavy: meeting -> MEETING | ✅ PASS | expect="MEETING" got="MEETING" |
| 18 | COMPLAINT heavy: close -> CLOSED | ✅ PASS | expect="CLOSED" got="CLOSED" |
| 19 | COMPLAINT heavy full path events (incl B02) | ✅ PASS | expect=12 got=12 |
| 20 | COMPLAINT no-meeting -> CLOSED directly | ✅ PASS | got="CLOSED" |
| 21 | COMPLAINT dismiss -> DISMISSED | ✅ PASS | got="DISMISSED" |
| 22 | DISMISSED is terminal | ✅ PASS |  |
| 23 | PREFECT starts REPORTED | ✅ PASS | got="REPORTED" |
| 24 | PREFECT approveWarning -> RECORDED (B04) | ✅ PASS | got="RECORDED" |
| 25 | PREFECT approved -> CLOSED | ✅ PASS | got="CLOSED" |
| 26 | PREFECT rejectWarning -> DISMISSED | ✅ PASS | got="DISMISSED" |
| 27 | PREFECT rejected case NOT in B04 register | ✅ PASS |  |
| 28 | SPOT_CHECK starts REPORTED | ✅ PASS | got="REPORTED" |
| 29 | SPOT_CHECK startInvestigation -> INVESTIGATING | ✅ PASS | got="INVESTIGATING" |
| 30 | SPOT_CHECK confirm+record -> RECORDED | ✅ PASS | got="RECORDED" |
| 31 | sign from REPORTED rejected (status unchanged) | ✅ PASS | got="REPORTED" |
| 32 | illegal transition adds no event | ✅ PASS | expect=1 got=1 |
| 33 | ack by guru not permitted | ✅ PASS |  |
| 34 | rejectWarning on non-prefect case blocked (advance returns null) | ✅ PASS | got="REPORTED" |
| 35 | path COMPLAINT <=5 | ✅ PASS | got=["REPORTED","RECORDED","EXECUTED","CLOSED"] |
| 36 | path COMPLAINT >5 includes siasatan | ✅ PASS | got=["REPORTED","INVESTIGATING","CONFIRMED","RECORDED","STUDENT_ACK","ACTION_PREPARED","PRINCIPAL_APPROVAL","EXECUTED","PARENT_NOTIFIED","MEETING","CLOSED"] |
| 37 | path PREFECT light | ✅ PASS | got=["REPORTED","RECORDED","EXECUTED","CLOSED"] |
| 38 | path SPOT_CHECK heavy includes siasatan | ✅ PASS | got=["REPORTED","INVESTIGATING","CONFIRMED","RECORDED","STUDENT_ACK","ACTION_PREPARED","PRINCIPAL_APPROVAL","EXECUTED","PARENT_NOTIFIED","MEETING","CLOSED"] |
| 39 | path SPOT_CHECK >5 has B05 | ✅ PASS |  |

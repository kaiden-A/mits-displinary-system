STATUSES = [
    {"id": "REPORTED", "label": "Dilaporkan / Menunggu Semakan"},
    {"id": "INVESTIGATING", "label": "Dalam Siasatan"},
    {"id": "CONFIRMED", "label": "Disahkan Berasas"},
    {"id": "DISMISSED", "label": "Tidak Berasas / Ditolak"},
    {"id": "RECORDED", "label": "Direkod dalam B04"},
    {"id": "STUDENT_ACK", "label": "Pengakuan Murid"},
    {"id": "ACTION_PREPARED", "label": "Tindakan Disediakan"},
    {"id": "PRINCIPAL_APPROVAL", "label": "Menunggu Tandatangan Pentadbir"},
    {"id": "EXECUTED", "label": "Hukuman Dilaksanakan"},
    {"id": "PARENT_NOTIFIED", "label": "Ibu Bapa Dimaklumkan"},
    {"id": "MEETING", "label": "Pertemuan Ibu Bapa"},
    {"id": "CLOSED", "label": "Tamat"},
]

# action -> {from: [...], src: [...], to, text, by, roles: [...]}
TRANSITIONS = {
    "startInvestigation": {
        "from": ["REPORTED"], "to": "INVESTIGATING",
        "text": "Siasatan dimulakan — Borang Siasatan (B02) disediakan.",
        "roles": ["guru_disiplin", "pentadbir", "super_admin"],
    },
    "confirm": {
        "from": ["INVESTIGATING"], "to": "CONFIRMED",
        "text": "Aduan disahkan berasas.",
        "roles": ["guru_disiplin", "pentadbir", "super_admin"],
    },
    "dismiss": {
        "from": ["REPORTED", "INVESTIGATING"], "to": "DISMISSED",
        "text": "Kes ditolak / didapati tidak berasas.",
        "roles": ["guru_disiplin", "pentadbir", "super_admin"],
    },
    "approveWarning": {
        "from": ["REPORTED"], "src": ["PREFECT_WARNING"], "to": "RECORDED",
        "text": "Kad Peringatan disemak dan disahkan — kesalahan direkod dalam B04 (Buku Rekod Disiplin).",
        "roles": ["guru_disiplin", "pentadbir", "super_admin"],
    },
    "rejectWarning": {
        "from": ["REPORTED"], "src": ["PREFECT_WARNING"], "to": "DISMISSED",
        "text": "Kad Peringatan ditolak.",
        "roles": ["guru_disiplin", "pentadbir", "super_admin"],
    },
    "record": {
        "from": ["REPORTED", "CONFIRMED"], "to": "RECORDED",
        "text": "Kesalahan direkod dalam Buku Rekod Disiplin (B04).",
        "roles": ["guru_disiplin", "pentadbir", "super_admin"],
    },
    "ack": {
        "from": ["RECORDED"], "to": "STUDENT_ACK",
        "text": "Murid mengisi Borang Pengakuan Murid (B05).",
        "roles": ["guru_disiplin", "pentadbir", "super_admin"],
    },
    "prepare": {
        "from": ["STUDENT_ACK"], "to": "ACTION_PREPARED",
        "text": "Kad SPSM dan surat-surat (B06 / B08) disediakan.",
        "roles": ["guru_disiplin", "pentadbir", "super_admin"],
    },
    "approve": {
        "from": ["ACTION_PREPARED"], "to": "PRINCIPAL_APPROVAL",
        "text": "Dihantar untuk tandatangan Pentadbir.",
        "roles": ["guru_disiplin", "pentadbir", "super_admin"],
    },
    "sign": {
        "from": ["PRINCIPAL_APPROVAL"], "to": "EXECUTED",
        "text": "Pentadbir menandatangani Surat Pemberitahuan / Amaran (B06).",
        "roles": ["pentadbir", "super_admin"],
    },
    "execute": {
        "from": ["RECORDED"], "to": "EXECUTED",
        "text": "Badan Disiplin melaksanakan hukuman / tindakan merujuk Modul SPSM.",
        "roles": ["guru_disiplin", "pentadbir", "super_admin"],
    },
    "notify": {
        "from": ["EXECUTED"], "to": "PARENT_NOTIFIED",
        "text": "Surat dihantar kepada ibu bapa / penjaga (serahan tangan / pos; telefon jika perlu tindakan segera).",
        "roles": ["guru_disiplin", "pentadbir", "super_admin"],
    },
    "meeting": {
        "from": ["PARENT_NOTIFIED"], "to": "MEETING",
        "text": "Ibu bapa / penjaga dipanggil — pertemuan diadakan.",
        "roles": ["guru_disiplin", "pentadbir", "super_admin"],
    },
    "close": {
        "from": ["PARENT_NOTIFIED", "EXECUTED", "MEETING"], "to": "CLOSED",
        "text": "Hasil pertemuan direkod dalam Kad SPSM (LAM/DIS/002-1). Kes ditutup.",
        "roles": ["guru_disiplin", "pentadbir", "super_admin"],
    },
}

HEAVY_PATH = [
    "STUDENT_ACK", "ACTION_PREPARED", "PRINCIPAL_APPROVAL",
    "EXECUTED", "PARENT_NOTIFIED", "MEETING", "CLOSED",
]
LIGHT_PATH = ["EXECUTED", "CLOSED"]


def needs_b02(source: str, points: int) -> bool:
    return source == "SPOT_CHECK" or (source == "COMPLAINT" and points > 5)


def path_for(source: str, points: int) -> list[str]:
    if needs_b02(source, points):
        path = ["REPORTED", "INVESTIGATING", "CONFIRMED", "RECORDED"]
    else:
        path = ["REPORTED", "RECORDED"]
    # Peringkat 2 (6+ mata): B05, B06, hubungi ibu bapa — full path. Peringkat 1: light.
    path.extend(HEAVY_PATH if points >= 6 else LIGHT_PATH)
    return path


def can_act(roles: list[str], action: str) -> bool:
    transition = TRANSITIONS.get(action)
    if not transition:
        return False
    return bool(set(roles).intersection(transition["roles"]))


def validate_transition(case, action: str, roles: list[str]):
    """Returns the transition if allowed for this case + principal, else raises KeyError/ValueError."""
    transition = TRANSITIONS.get(action)
    if not transition:
        raise KeyError(f"unknown action: {action}")
    if not can_act(roles, action):
        raise PermissionError(f"role lacks permission for {action}")
    if transition.get("from") and case.status not in transition["from"]:
        raise ValueError(f"action {action} not allowed from status {case.status}")
    if transition.get("src") and case.source not in transition["src"]:
        raise ValueError(f"action {action} not allowed for source {case.source}")
    return transition


def status_label(status: str) -> str:
    for s in STATUSES:
        if s["id"] == status:
            return s["label"]
    return status


def next_steps(source: str, points: int, status: str, has_b02: bool, needs_b07: bool = False) -> list[dict]:
    """Port of the sample's nextSteps guidance."""
    steps: list[dict] = []

    def add(text: str, actor: str = "", action: str = "") -> None:
        steps.append({"text": text, "actor": actor, "action": action})

    if status == "REPORTED":
        if source == "PREFECT_WARNING":
            add("Semak butiran Kad Peringatan dan kesalahan murid.", "Guru Disiplin")
            add("Sahkan — kesalahan direkod dalam B04.", "Guru Disiplin", "approveWarning")
            add("Tolak — kad tidak diterima.", "Guru Disiplin", "rejectWarning")
        elif source == "COMPLAINT" and points > 5:
            add("Isi Borang Siasatan (B02) — boleh diisi oleh guru pengadu atau Guru Disiplin.", "Guru / Guru Disiplin")
            add("Buka siasatan untuk kesalahan melebihi 5 mata.", "Guru Disiplin", "startInvestigation")
        elif source == "COMPLAINT":
            add("Aduan guru (5 mata ke bawah) direkod terus dalam B04 tanpa siasatan.", "Guru Disiplin", "record")
        else:
            add("Buka siasatan dan lengkapkan Borang Siasatan (B02).", "Guru Disiplin", "startInvestigation")
    elif status == "INVESTIGATING":
        add("Tentukan sama ada aduan berasas.", "Guru Disiplin")
        add("Jika berasas — sahkan aduan dan teruskan proses.", "Guru Disiplin", "confirm")
        add("Jika tidak berasas — tutup kes.", "Guru Disiplin", "dismiss")
    elif status == "CONFIRMED":
        add("Rekod kesalahan dalam Buku Rekod Disiplin (B04).", "Guru Disiplin", "record")
    elif status == "RECORDED":
        if points >= 6:
            add("Murid mengisi Borang Pengakuan Murid (B05) — wajib bagi 6 mata dan ke atas.", "Guru Disiplin", "ack")
        else:
            add("Laksanakan tindakan mengikut Modul SPSM: amaran bertulis + tarbiah / khidmat sosial.", "Badan Disiplin", "execute")
        if 11 <= points <= 40:
            add("Murid menghadiri sesi kaunseling — rekod setiap sesi dalam dokumen kes (wajib sebelum tutup kes).", "Guru Disiplin")
    elif status == "STUDENT_ACK":
        add("Isi Kad SPSM (LAM/DIS/002-1).", "Guru Disiplin")
        add("Sediakan Surat Pemberitahuan / Amaran (B06).", "Guru Disiplin", "prepare")
        if points >= 21:
            add("Sediakan Surat Akujanji (B08).", "Guru Disiplin")
        if needs_b07:
            add("Sediakan Borang Barang Rampasan (B07).", "Guru Disiplin")
    elif status == "ACTION_PREPARED":
        if 31 <= points <= 40:
            add("Rekod hukuman Peringkat 5 (gantung asrama / gantung sekolah / rotan) dalam dokumen kes.", "Guru Disiplin")
        add("Hantar surat untuk tandatangan Pentadbir.", "Guru Disiplin", "approve")
    elif status == "PRINCIPAL_APPROVAL":
        add("Tandatangani Surat Pemberitahuan / Amaran (B06) kepada ibu bapa / penjaga.", "Pentadbir", "sign")
    elif status == "EXECUTED":
        if points >= 6:
            add("Hantar surat secara serahan tangan / pos (makluman melalui telefon jika perlu tindakan segera).", "Guru Disiplin", "notify")
        else:
            add("Kes ringan selesai — tamatkan kes.", "Guru Disiplin", "close")
    elif status == "PARENT_NOTIFIED":
        add("Ibu bapa / penjaga dipanggil?", "Guru Disiplin")
        add("Ya — buat pertemuan dengan ibu bapa / penjaga.", "Guru Disiplin", "meeting")
        if points >= 41:
            add("Peringkat 6: murid dinasihatkan berpindah sekolah.", "Guru Disiplin")
        add("Tidak — tamatkan kes.", "Guru Disiplin", "close")
    elif status == "MEETING":
        if points >= 21:
            add("Tandatangan Surat Akujanji (B08) semasa pertemuan.", "Guru Disiplin")
        if points >= 41:
            add("Peringkat 6: murid dinasihatkan berpindah sekolah.", "Guru Disiplin")
        add("Rekod butiran / hasil pertemuan dalam Kad SPSM (LAM/DIS/002-1) dan tutup kes.", "Guru Disiplin", "close")
    else:
        add("Kes telah tamat.")

    return steps
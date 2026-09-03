import type { ReactNode } from "react";
import type { CaseDetail, CaseSummary, B02Form } from "@/lib/types";

export interface PrefectOffence {
  code: string;
  name: string;
  min_points: number;
  max_points: number;
  action?: string;
}

const CSS = [
  "@page { size: A4; margin: 14mm 16mm; }",
  "* { box-sizing: border-box; }",
  ".print-page { font-family: 'Times New Roman', Times, serif; color: #000; font-size: 12pt; line-height: 1.5; }",
  ".letterhead { text-align: center; margin-bottom: 4px; }",
  ".letterhead .school { font-size: 14pt; font-weight: bold; }",
  ".letterhead .addr { font-size: 11pt; }",
  ".letterhead .tel { font-size: 11pt; }",
  ".doc-title { text-align: center; font-weight: bold; font-size: 13pt; margin: 6px 0 14px; text-decoration: underline; }",
  ".doc-code { text-align: center; font-weight: bold; margin-top: 10px; }",
  ".print-page table { width: 100%; border-collapse: collapse; margin: 10px 0; }",
  ".print-page td, .print-page th { border: 1px solid #000; padding: 6px 8px; font-size: 11pt; vertical-align: top; }",
  ".print-page th { background: #fff; text-align: center; }",
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
].join("\n");

export function PrintStyle() {
  return <style>{CSS}</style>;
}

function d(iso: string | null | undefined): string {
  if (!iso) return "";
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${dt.getFullYear()}`;
}

export function DocHeader({ code, title, sub }: { code: string; title: string; sub?: string }) {
  return (
    <>
      <div className="doc-code">({code})</div>
      <div className="doc-title">{title}</div>
      {sub ? <div className="center note">{sub}</div> : null}
    </>
  );
}

export function Letterhead() {
  return (
    <div className="letterhead">
      <div className="school">MAAHAD INTEGRASI TAHFIZ SELANGOR (MITS)</div>
      <div className="addr">Bandar Seri Putra, 43000 Kajang, Selangor Darul Ehsan</div>
      <div className="tel">No. Tel : 03-8925 1234 &nbsp;|&nbsp; No. Faks : 03-8925 5678</div>
    </div>
  );
}

export function Slogan() {
  return (
    <div className="slogan">
      &ldquo;MEMBANGUN BANGSA, MEMAKMUR NEGERI&rdquo;
      <br />
      &ldquo;BERKHIDMAT KERANA ALLAH UNTUK NEGARA&rdquo;
    </div>
  );
}

/* ---------- data helpers ---------- */

type DocMap = Record<string, unknown>;

function docData(c: CaseDetail, code: string): DocMap {
  return (
    c.docs.find((item) => item.doc_code === code)?.data ||
    ((c as unknown as Record<string, DocMap | null>)[code] ?? {})
  );
}

function val(doc: DocMap, key: string, fallback = ""): string {
  const v = doc[key];
  return v === null || v === undefined ? fallback : String(v);
}

function studentLine(c: CaseDetail): string {
  const st = c.student_snapshot;
  return `${st.name || ""}${st.ic_number ? ` (${st.ic_number})` : ""}`;
}

function offenceLines(c: CaseDetail | CaseSummary): string {
  const offs = "offences" in c && c.offences ? c.offences : [];
  return offs.map((o) => `${o.code} — ${o.name} (${o.points} mata)`).join("; ");
}

function offenceCodes(c: CaseDetail | CaseSummary): string {
  const offs = "offences" in c && c.offences ? c.offences : [];
  return offs.map((o) => o.code).join(", ");
}

function offenceTable(c: CaseDetail | CaseSummary): ReactNode {
  const offs = "offences" in c && c.offences ? c.offences : [];
  return (
    <table>
      <thead>
        <tr>
          <th style={{ width: "8%" }}>BIL</th>
          <th style={{ width: "16%" }}>TARIKH</th>
          <th style={{ width: "14%" }}>KOD SALAHLAKU</th>
          <th>BUTIRAN SALAHLAKU</th>
        </tr>
      </thead>
      <tbody>
        {offs.map((o, i) => (
          <tr key={o.code}>
            <td className="center">{i + 1}</td>
            <td>{d(c.created_at)}</td>
            <td className="center">{o.code}</td>
            <td>
              {o.name} ({o.points} mata SPSM)
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ---------- B 01 — Borang Aduan Salah Laku Murid ---------- */

export function B01Doc({ c }: { c: CaseDetail }) {
  const doc = docData(c, "b01");
  return (
    <>
      <DocHeader code="B 01" title="BORANG ADUAN SALAH LAKU MURID" sub="(Untuk Murid / Guru / Ibu bapa / Penjaga)" />
      <div className="field">
        Nama murid yang diadu : <span className="fill-lg">{studentLine(c)}</span>
      </div>
      <div className="field">
        Tingkatan : <span className="fill">{c.student_snapshot.kelas_label || ""}</span>
      </div>
      <div className="field">
        Tarikh dan masa kejadian : <span className="fill">{val(doc, "tarikhKejadian") || d(c.created_at)}</span> jam{" "}
        <span className="fill-sm">{val(doc, "masaKejadian")}</span>
      </div>
      <div className="field">
        Aduan kesalahan : <span className="fill-lg" style={{ minWidth: 420 }}>{offenceLines(c)}</span>
      </div>
      <div className="field">Butiran aduan :</div>
      <div style={{ minHeight: 64, borderBottom: "1px solid #000", padding: 4 }}>{val(doc, "aduan") || c.details}</div>
      <div className="field" style={{ marginTop: 18 }}>
        Cadangan :
      </div>
      <div style={{ minHeight: 56, borderBottom: "1px solid #000", padding: 4 }}>{val(doc, "cadangan")}</div>
      <div className="field" style={{ marginTop: 22 }}>
        Tandatangan pengadu : <span className="fill-lg"></span> &nbsp;&nbsp; Tarikh : <span className="fill"></span>
      </div>
      <div className="field">
        Nama Murid / Guru / Ibu bapa / Penjaga : <span className="fill-lg">{c.reporter_name}</span>
      </div>
      <div className="field">
        Alamat : <span className="fill-lg">{val(doc, "alamatPengadu")}</span>
      </div>
      <div className="field">
        No. Telefon bimbit : <span className="fill"></span> &nbsp;&nbsp; Rumah / Pejabat : <span className="fill"></span>
      </div>
      <div className="note" style={{ marginTop: 10 }}>
        (Segala maklumat pengadu dirahsiakan)
      </div>
    </>
  );
}

/* ---------- B 02 — Laporan Siasatan / Aduan ---------- */

function b02Form(c: CaseDetail, form: B02Form): ReactNode {
  const f = form.fields;
  const st = c.student_snapshot;
  return (
    <section>
      <DocHeader code="B 02" title="LAPORAN SIASATAN / ADUAN" />
      <div className="center note">
        Diisi oleh : {form.fill_by}
        {form.fill_role ? ` (${form.fill_role})` : ""} &nbsp;|&nbsp; Tarikh : {d(form.filled_at)}
      </div>
      <table>
        <tbody>
          <tr>
            <td style={{ width: "50%" }}>
              Aduan : <span className="fill">{val(f, "aduan") || c.details}</span>
            </td>
            <td>
              Tarikh Aduan : <span className="fill">{val(f, "tarikhAduan")}</span>
            </td>
          </tr>
          <tr>
            <td>
              Butiran Pengadu : <span className="fill">{c.reporter_name}</span>
            </td>
            <td>
              Diterima oleh : <span className="fill">{val(f, "diterimaOleh")}</span>
            </td>
          </tr>
          <tr>
            <td>
              Tarikh / Masa : <span className="fill">{val(f, "tarikhMasa")}</span>
            </td>
            <td>
              Nama murid yang diadu : <span className="fill">{studentLine(c)}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="field bold">Isu :</div>
      <div style={{ minHeight: 56, borderBottom: "1px solid #000", padding: 4 }}>{val(f, "isu")}</div>
      <div className="field bold">Laporan Siasatan</div>
      <div style={{ minHeight: 120, borderBottom: "1px solid #000", padding: 4 }}>{val(f, "laporan")}</div>
      <div className="field bold">Punca Masalah :</div>
      <div style={{ minHeight: 56, borderBottom: "1px solid #000", padding: 4 }}>{val(f, "punca")}</div>
      <div className="field bold">Penambahbaikan :</div>
      <div style={{ minHeight: 56, borderBottom: "1px solid #000", padding: 4 }}>{val(f, "penambahbaikan")}</div>
      <div className="sig">
        <div style={{ float: "left", width: "48%" }}>
          Disediakan oleh
          <br />
          <span className="name">
            Nama : {val(f, "disediakanOleh") || form.fill_by}
          </span>
          <br />
          Jawatan : <span className="fill">{val(f, "disediakanJawatan")}</span>
          <br />
          Tarikh : <span className="fill">{val(f, "disediakanTarikh") || d(form.filled_at)}</span>
        </div>
        <div style={{ float: "right", width: "48%" }}>
          Disemak / Disahkan oleh
          <br />
          <span className="name">Nama : {val(f, "disemakOleh")}</span>
          <br />
          Jawatan : <span className="fill">{val(f, "disemakJawatan")}</span>
          <br />
          Tarikh : <span className="fill">{val(f, "disemakTarikh")}</span>
        </div>
        <div style={{ clear: "both" }}></div>
      </div>
    </section>
  );
}

export function B02Doc({ c }: { c: CaseDetail }) {
  const forms = c.b02_forms.length ? c.b02_forms : [];
  if (!forms.length) {
    const blank: B02Form = { id: 0, fill_by: "", fill_role: "", filled_at: "", fields: {} };
    return b02Form(c, blank);
  }
  return forms.map((form, i) => (
    <div key={form.id} className={i > 0 ? "page-break" : ""}>
      {b02Form(c, form)}
    </div>
  ));
}

/* ---------- B 03 — Kad Peringatan ---------- */

export function B03Doc({ c, codes }: { c: CaseDetail; codes: PrefectOffence[] }) {
  const doc = docData(c, "b03");
  const st = c.student_snapshot;
  return (
    <>
      <div className="letterhead">
        <div className="school">MAAHAD INTEGRASI TAHFIZ SELANGOR (MITS)</div>
      </div>
      <DocHeader code="B 03" title="KAD PERINGATAN" />
      <table>
        <tbody>
          <tr>
            <td style={{ width: "55%" }}>
              <div className="field">
                Nama Murid : <span className="fill">{studentLine(c)}</span>
              </div>
              <div className="field">
                Tingkatan : <span className="fill">{st.kelas_label || ""}</span>
              </div>
              <div className="field">
                Tarikh / Masa : <span className="fill">{val(doc, "tarikhKejadian") || d(c.created_at)}</span>
              </div>
              <div className="field">
                Kod Kesalahan : <span className="fill">{offenceCodes(c)}</span>
              </div>
              <div className="field">
                Tindakan : <span className="fill">{val(doc, "tindakan")}</span>
              </div>
              <div className="field" style={{ marginTop: 22 }}>
                Sila berjumpa dengan <span className="bold">GURU DISIPLIN</span>
              </div>
              <div className="field">(Dalam tempoh 3 hari dari tarikh peringatan)</div>
              <div className="field" style={{ marginTop: 26 }}>
                T.T. Pengawas : <span className="fill"></span> &nbsp;&nbsp; T.T. Murid : <span className="fill"></span>
              </div>
              <div className="field">
                Nama Pengawas : <span className="fill">{c.reporter_name}</span>
              </div>
            </td>
            <td>
              <div className="bold" style={{ textAlign: "center" }}>
                KOD KESALAHAN YANG DIKENAKAN
                <br />
                PERINGATAN
              </div>
              <ul style={{ margin: "8px 0 0 22px" }}>
                {codes.map((o) => (
                  <li key={o.code}>
                    {o.code} - {o.name}
                  </li>
                ))}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

/* ---------- B 04 — Rekod Disiplin (Buku Rekod) ---------- */

export function B04Doc({ register }: { register: CaseSummary[] }) {
  return (
    <>
      <DocHeader code="B 04" title="REKOD DISIPLIN MAAHAD INTEGRASI TAHFIZ SELANGOR (MITS)" />
      <div className="center note">Buku Rekod Disiplin — senarai semua kesalahan murid yang telah direkod</div>
      <table>
        <thead>
          <tr>
            <th style={{ width: "8%" }}>BIL</th>
            <th style={{ width: "16%" }}>TARIKH</th>
            <th style={{ width: "26%" }}>NAMA MURID</th>
            <th style={{ width: "36%" }}>KESALAHAN / KOD</th>
            <th style={{ width: "14%" }}>CATATAN*</th>
          </tr>
        </thead>
        <tbody>
          {register.length ? (
            register.map((cs, i) => (
              <tr key={cs.id}>
                <td className="center">{i + 1}</td>
                <td>{d(cs.created_at)}</td>
                <td>
                  {cs.student_snapshot?.name}
                  <br />
                  <span className="note">{cs.student_snapshot?.kelas_label || ""}</span>
                </td>
                <td>
                  {("offences" in cs && cs.offences ? cs.offences : []).map((o) => (
                    <span key={o.code}>
                      {o.code} - {o.name}
                      <br />
                    </span>
                  ))}
                </td>
                <td></td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="center note">
                Tiada rekod disiplin.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="note">* Tandakan &radic; setelah tindakan diambil.</div>
    </>
  );
}

/* ---------- B 05 — Borang Pengakuan Murid ---------- */

export function B05Doc({ c }: { c: CaseDetail }) {
  const doc = docData(c, "b05");
  const st = c.student_snapshot;
  return (
    <>
      <DocHeader code="B 05" title="BORANG PENGAKUAN MURID" />
      <div style={{ textAlign: "justify", margin: "10px 0" }}>
        Adalah saya : <span className="fill">{studentLine(c)}</span> (Nama) berada di dalam tingkatan :{" "}
        <span className="fill">{st.kelas_label || ""}</span> dengan ini mengaku tanpa dipaksa oleh guru dan rakan-rakan
        saya bahawa saya telah melanggar peraturan sekolah iaitu :
      </div>
      <div style={{ minHeight: 80, borderBottom: "1px solid #000", padding: 4, margin: "8px 0" }}>{offenceLines(c)}</div>
      <div style={{ margin: "10px 0" }}>
        2. Saya mengaku melakukan perbuatan tersebut : <span className="fill">{val(doc, "perbuatan")}</span> pada :{" "}
        <span className="fill">{val(doc, "tarikhPengakuan")}</span> (tarikh) pada pukul :{" "}
        <span className="fill">{val(doc, "masaPengakuan")}</span> (masa) di{" "}
        <span className="fill-lg">{val(doc, "tempat")}</span> (tempat)
      </div>
      <div style={{ margin: "26px 0" }}>Yang benar,</div>
      <div style={{ marginTop: 52 }}>............................ (Tandatangan &amp; Nama Murid)</div>
      <div style={{ margin: "12px 0" }}>
        Tarikh : <span className="fill"></span> &nbsp;&nbsp; Masa : <span className="fill"></span>
      </div>
      <div style={{ margin: "16px 0" }} className="bold">
        Pengakuan dibuat di hadapan :
      </div>
      <table>
        <thead>
          <tr>
            <th>Saksi 1</th>
            <th>Saksi 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ height: 110 }}>
              <div style={{ marginTop: 84 }}>............................</div>
              <div>( Guru Disiplin )</div>
              <div>Tarikh : ............................</div>
              <div>Masa : ............................</div>
            </td>
            <td style={{ height: 110 }}>
              <div style={{ marginTop: 84 }}>............................</div>
              <div>( Penolong Kanan HEM )</div>
              <div>Tarikh : ............................</div>
              <div>Masa : ............................</div>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

/* ---------- B 06 — Surat Pemberitahuan / Amaran ---------- */

export function B06Doc({ c }: { c: CaseDetail }) {
  const doc = docData(c, "b06");
  const st = c.student_snapshot;
  const level = c.points >= 31 ? "Terakhir" : val(doc, "warningLevel") || c.warning_level || "Pertama";
  return (
    <>
      <Letterhead />
      <div style={{ marginTop: 18 }}>Kepada,</div>
      <div>Ibu bapa / penjaga murid,</div>
      <div style={{ textAlign: "right", margin: "8px 0" }}>Tarikh : {val(doc, "tarikhSurat") || d(c.created_at)}</div>
      <div className="center bold" style={{ margin: "12px 0" }}>
        Tuan / Puan
      </div>
      <div className="doc-title">SURAT PEMBERITAHUAN / AMARAN {level.toUpperCase()}</div>
      <div style={{ textAlign: "justify", margin: "10px 0" }}>
        Berhubung dengan perkara di atas, dimaklumkan bahawa anak jagaan tuan / puan yang bernama :{" "}
        <span className="fill">{studentLine(c)}</span> &nbsp; Tingkatan : <span className="fill">{st.kelas_label || ""}</span>{" "}
        telah melakukan kesalahan seperti berikut :
      </div>
      {offenceTable(c)}
      <div style={{ textAlign: "justify", margin: "12px 0" }}>
        2. Oleh itu, anak / jagaan tuan / puan telah dikenakan tindakan :
      </div>
      <div style={{ margin: "6px 26px" }}>
        [&nbsp;&nbsp;] Diberi amaran &nbsp;&nbsp; [&nbsp;&nbsp;] Khidmat Kaunseling &nbsp;&nbsp; [&nbsp;&nbsp;] Hukuman
        Tarbiah
      </div>
      <div style={{ margin: "6px 26px" }}>
        [&nbsp;&nbsp;] Tukar Sekolah &nbsp;&nbsp; [&nbsp;&nbsp;] Khidmat Sosial &nbsp;&nbsp; [&nbsp;&nbsp;] Lain-lain :{" "}
        <span className="fill"></span>
      </div>
      <div style={{ textAlign: "justify", margin: "12px 0" }}>
        3. Sekiranya anak / jagaan tuan melanggar mana-mana peraturan sekolah, pihak sekolah boleh mengambil tindakan
        tatatertib mengikut Peraturan (Disiplin) Sekolah 1959 dan Pekeliling Ikhtisas Kementerian Pendidikan Bil (8) 68
        KP 8543/02 (12).
      </div>
      <div style={{ textAlign: "justify", margin: "12px 0" }}>
        4. Sehubungan itu, tuan / puan diminta datang berjumpa dengan Pengetua / PK Pentadbiran / PK HEM pada{" "}
        <span className="fill">{val(doc, "tarikhJumpa")}</span> jam <span className="fill">{val(doc, "masaJumpa")}</span>{" "}
        untuk berbincang demi kebaikan sekolah dan anak jagaan tuan.
      </div>
      <div style={{ margin: "12px 0" }}>Sekian dimaklumkan, terima kasih.</div>
      <Slogan />
      <div style={{ marginTop: 12 }}>Saya yang menjalankan amanah,</div>
      <div style={{ marginTop: 56 }}>............................</div>
      <div>( Pengetua )</div>
      <div className="note">s.k Fail Disiplin</div>
    </>
  );
}

/* ---------- B 07 — Surat Barang Rampasan ---------- */

export function B07Doc({ c }: { c: CaseDetail }) {
  const doc = docData(c, "b07");
  const st = c.student_snapshot;
  return (
    <>
      <Letterhead />
      <div style={{ marginTop: 18 }}>Kepada,</div>
      <div>Ibu bapa / penjaga murid,</div>
      <div style={{ textAlign: "right", margin: "8px 0" }}>Tarikh : {val(doc, "tarikhSurat") || d(c.created_at)}</div>
      <div className="center bold" style={{ margin: "12px 0" }}>
        Tuan / Puan
      </div>
      <div className="doc-title">SURAT PEMBERITAHUAN TENTANG BARANG RAMPASAN / DISIMPAN OLEH PIHAK SEKOLAH</div>
      <div style={{ margin: "10px 0" }}>
        Barang : <span className="fill-lg">{val(doc, "barang")}</span>
      </div>
      <div style={{ margin: "8px 0" }}>
        Nama Murid : <span className="fill">{studentLine(c)}</span> &nbsp; Tingkatan :{" "}
        <span className="fill">{st.kelas_label || ""}</span>
      </div>
      <div style={{ textAlign: "justify", margin: "12px 0" }}>
        Pihak disiplin telah memberi amaran kepada semua murid bahawa barang-barang berkenaan tidak boleh dibawa ke
        sekolah. Demi mengawal disiplin, pihak sekolah terpaksa merampas barang tersebut.
      </div>
      <div style={{ textAlign: "justify", margin: "12px 0" }}>
        2. Barang ini hanya akan dipulangkan sekiranya tuan / puan datang mengambil dan menuntut di pejabat sekolah.
        Diharapkan pihak tuan dapat menunjukkan surat ini semasa menuntut barang tersebut dari pihak sekolah.
      </div>
      <div style={{ textAlign: "justify", margin: "12px 0" }}>
        3. Pihak sekolah tidak akan memulangkan barang tersebut sekiranya berlaku rampasan kali kedua.
      </div>
      <div style={{ margin: "12px 0" }}>Sekian dimaklumkan, terima kasih.</div>
      <Slogan />
      <div style={{ marginTop: 12 }}>Saya yang menjalankan amanah,</div>
      <div style={{ marginTop: 56 }}>............................</div>
      <div>( Pengetua )</div>
      <div className="note">s.k Fail Disiplin</div>
      <div className="page-break"></div>
      <div className="doc-title">MAKLUMAT SEMASA MENUNTUT BARANG</div>
      <table>
        <tbody>
          <tr>
            <td style={{ width: "5%" }} className="center">
              1.
            </td>
            <td style={{ width: "35%" }}>Barang</td>
            <td>{val(doc, "barang")}</td>
          </tr>
          <tr>
            <td className="center">2.</td>
            <td>Nama ibu / bapa / penjaga</td>
            <td>{val(doc, "penuntutNama")}</td>
          </tr>
          <tr>
            <td className="center">3.</td>
            <td>No. kad pengenalan</td>
            <td>{val(doc, "penuntutKp")}</td>
          </tr>
          <tr>
            <td className="center">4.</td>
            <td>Nama penyerah barang</td>
            <td>{val(doc, "penyerahNama")}</td>
          </tr>
          <tr>
            <td className="center">5.</td>
            <td>Tarikh serahan barang</td>
            <td>{val(doc, "tarikhSerahan")}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 30 }}>
        <span style={{ float: "left", width: "50%" }}>
          T. Tangan : ............................
          <br />
          <br />
          No. Telefon : ............................
        </span>
        <span style={{ float: "right", width: "50%", textAlign: "right" }}>
          T. Tangan : ............................
        </span>
        <div style={{ clear: "both" }}></div>
      </div>
    </>
  );
}

/* ---------- B 08 — Surat Akujanji ---------- */

export function B08Doc({ c }: { c: CaseDetail }) {
  const doc = docData(c, "b08");
  const st = c.student_snapshot;
  return (
    <>
      <Letterhead />
      <div className="doc-title">SURAT AKUJANJI</div>
      <div className="doc-title" style={{ marginTop: 0 }}>
        PERJANJIAN JAMINAN BERKELAKUAN BAIK
      </div>
      <div style={{ margin: "10px 0" }}>
        Alamat sekolah : <span className="fill-lg">Bandar Seri Putra, 43000 Kajang, Selangor</span> &nbsp; Tarikh :{" "}
        <span className="fill">{val(doc, "tarikh") || d(c.created_at)}</span>
      </div>
      <div style={{ margin: "12px 0" }}>
        Bahawa saya <span className="fill-lg">{studentLine(c)}</span> &nbsp; Tingkatan :{" "}
        <span className="fill">{st.kelas_label || ""}</span>
      </div>
      <div style={{ textAlign: "justify", margin: "12px 0" }}>
        mengaku untuk berkelakuan baik dan mematuhi segala peraturan yang ditetapkan oleh sekolah, Jabatan Agama Islam
        Selangor (JAIS) dan Kementerian Pendidikan Malaysia.
      </div>
      <div style={{ textAlign: "justify", margin: "12px 0" }}>
        Jika saya didapati mengulangi kesalahan saya, pihak sekolah boleh mengambil tindakan tatatertib membuang sekolah
        mengikut Peraturan-peraturan Pelajaran (Disiplin Sekolah) 1959 dan Pekeliling Ikhtisas Kementerian Pendidikan
        Bil (6) 68 KP 8543 (10) dan Bil (8) 68 KP 8543/02 (12).
      </div>
      <div style={{ marginTop: 30 }}>
        <span style={{ float: "left", width: "50%" }}>
          Yang benar,
          <br />
          <br />
          <br />
          <br />
          ............................
          <br />
          (Nama Murid)
        </span>
        <span style={{ float: "right", width: "50%", textAlign: "right" }}>
          Disaksikan oleh,
          <br />
          <br />
          <br />
          <br />
          ............................
          <br />
          (Nama PK HEM / Guru Disiplin)
        </span>
        <div style={{ clear: "both" }}></div>
      </div>
      <div className="doc-title" style={{ marginTop: 34 }}>
        JAMINAN IBU BAPA / PENJAGA
      </div>
      <div style={{ textAlign: "justify", margin: "12px 0" }}>
        Bahawa saya <span className="fill">Ibu bapa / penjaga</span> &nbsp; K/P : <span className="fill">{val(doc, "kpIbuBapa")}</span>{" "}
        &nbsp; Beralamat di : <span className="fill-lg"></span>
      </div>
      <div style={{ textAlign: "justify", margin: "12px 0" }}>
        Ibu bapa / penjaga kepada murid yang tersebut di atas menjamin akan menjaga tingkah laku anak saya / anak jagaan
        saya sebagaimana yang telah ditetapkan dalam Peraturan-peraturan Pelajaran (Disiplin Sekolah) 1959 dan
        Pekeliling Ikhtisas Kementerian Pendidikan Bil (6) 68 KP 8543 (10) dan Bil (8) 68 KP 8543/02 (12).
      </div>
      <div style={{ marginTop: 30 }}>
        <span style={{ float: "left", width: "50%" }}>
          Yang benar,
          <br />
          <br />
          <br />
          <br />
          ............................
          <br />
          (Nama Ibu bapa / Penjaga)
        </span>
        <span style={{ float: "right", width: "50%", textAlign: "right" }}>
          Disaksikan oleh,
          <br />
          <br />
          <br />
          <br />
          ............................
          <br />
          (Nama Pengetua)
        </span>
        <div style={{ clear: "both" }}></div>
      </div>
    </>
  );
}

/* ---------- Kad SPSM (LAM/DIS/002-1) ---------- */

export function KadDoc({ c, cases }: { c: CaseDetail; cases: CaseSummary[] }) {
  const st = c.student_snapshot;
  const met = c.meeting || {};
  const metRows = (
    <tr>
      <td>{val(met, "tarikh")}</td>
      <td>{val(met, "masa")}</td>
      <td>{val(met, "nama")}</td>
      <td>{val(met, "catatan")}</td>
      <td></td>
    </tr>
  );
  const info: [string, ReactNode][] = [
    ["Nama Murid", st.name || ""],
    ["Kelas", `${st.kelas_label || ""} &nbsp;&nbsp; No. Dikenal : ${c.student_source_id}`],
    ["Jantina", st.gender || ""],
    ["No. K/P", st.ic_number || ""],
    ["Tarikh Masuk Sekolah", ""],
    ["Nama Sekolah Terdahulu", ""],
    ["Nama Bapa / Penjaga", ""],
    ["Nama Ibu", ""],
    ["Alamat Rumah", ""],
    ["No. Telefon", "( R ) &nbsp;&nbsp; ( P )"],
    ["No. Telefon Bimbit", ""],
    ["Nama Waris Terdekat", ""],
    ["No. Telefon", "( R ) &nbsp;&nbsp; ( P )"],
    ["No. Telefon Bimbit", ""],
  ];
  return (
    <>
      <div className="doc-code">LAM/DIS/002-1</div>
      <div className="doc-title">KAD SPSM</div>
      <table>
        <tbody>
          <tr>
            <td style={{ width: "62%" }}>
              {info.map(([label, value]) => (
                <div key={label} style={{ display: "flex", margin: "4px 0" }}>
                  <div style={{ width: "38%", fontWeight: "bold" }}>{label} :</div>
                  <div style={{ flex: 1 }}>{value}</div>
                </div>
              ))}
            </td>
            <td style={{ width: "38%" }}>
              <div className="photo">
                Gambar
                <br />
                Ukuran
                <br />
                Pasport
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="page-break"></div>
      <div className="doc-title">REKOD MATA SPSM</div>
      <table>
        <thead>
          <tr>
            <th style={{ width: "8%" }}>BIL</th>
            <th style={{ width: "16%" }}>TARIKH</th>
            <th style={{ width: "34%" }}>KESALAHAN</th>
            <th style={{ width: "22%" }}>TINDAKAN</th>
            <th style={{ width: "10%" }}>MATA SPSM</th>
            <th style={{ width: "10%" }}>CATATAN</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((cs, i) => (
            <tr key={cs.id}>
              <td className="center">{i + 1}</td>
              <td>{d(cs.created_at)}</td>
              <td>
                {("offences" in cs && cs.offences ? cs.offences : []).map((o) => (
                  <span key={o.code}>
                    {o.code} - {o.name}
                    <br />
                  </span>
                ))}
              </td>
              <td>{cs.punishment?.jenis || ""}</td>
              <td className="center">{cs.points}</td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="doc-title" style={{ marginTop: 24 }}>
        SESI TEMUBUAL DENGAN IBU BAPA / PENJAGA
      </div>
      <table>
        <thead>
          <tr>
            <th>Tarikh</th>
            <th>Masa</th>
            <th>Nama</th>
            <th>Catatan / Laporan</th>
            <th>T/Tangan</th>
          </tr>
        </thead>
        <tbody>{metRows}</tbody>
      </table>
      <div className="doc-title" style={{ marginTop: 24 }}>
        SESI KAUNSELING
      </div>
      <table>
        <thead>
          <tr>
            <th>Tarikh</th>
            <th>Kaunselor</th>
            <th>Catatan</th>
            <th>T/Tangan</th>
          </tr>
        </thead>
        <tbody>
          {(c.counselling || []).length ? (
            (c.counselling || []).map((session, i) => (
              <tr key={i}>
                <td>{val(session, "tarikh")}</td>
                <td>{val(session, "kaunselor")}</td>
                <td>{val(session, "catatan")}</td>
                <td></td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}></td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="field" style={{ marginTop: 18 }}>
        Gred Kelakuan Untuk Sijil Berhenti Sekolah : <span className="fill"></span>
      </div>
      <div className="field">Catatan :</div>
      <div style={{ minHeight: 44, borderBottom: "1px solid #000" }}></div>
    </>
  );
}

/* ---------- fallback ---------- */

export function GenericDoc({ c }: { c: CaseDetail }) {
  const rows: [string, string][] = [
    ["Nama murid", c.student_snapshot?.name || ""],
    ["Tingkatan / kelas", c.student_snapshot?.kelas_label || ""],
    ["Kesalahan", offenceLines(c)],
    ["Mata", String(c.points)],
    ["Butiran", c.details],
    ["Tarikh", d(c.created_at)],
  ];
  return (
    <table>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <td className="bold" style={{ width: "38%" }}>
              {label}
            </td>
            <td>{value || " "}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function printTitle(document: string) {
  const titles: Record<string, { code: string; name: string }> = {
    b01: { code: "B 01", name: "Borang Aduan Salah Laku Murid" },
    b02: { code: "B 02", name: "Laporan Siasatan / Aduan" },
    b03: { code: "B 03", name: "Kad Peringatan" },
    b04: { code: "B 04", name: "Rekod Disiplin" },
    b05: { code: "B 05", name: "Borang Pengakuan Murid" },
    b06: { code: "B 06", name: "Surat Pemberitahuan / Amaran" },
    b07: { code: "B 07", name: "Surat Barang Rampasan" },
    b08: { code: "B 08", name: "Surat Akujanji" },
    kad: { code: "LAM/DIS/002-1", name: "Kad SPSM" },
  };
  return titles[document] || { code: document.toUpperCase(), name: "Dokumen SPSM" };
}
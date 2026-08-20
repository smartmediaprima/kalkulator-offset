/* =====================================================================
   DATA & KONSTANTA
   ===================================================================== */

const offsetPrice = {
  "65x100 cm": {
    hvs70: 1000,
    hvs80: 1100,
    hvs100: 1300,
    ap120: 1700,
    ap150: 2000,
    ac210: 3000,
    ac230: 3200,
    ac260: 3300,
    ac310: 4200,
  },
  "79x109 cm": {
    hvs70: 1200,
    hvs80: 1300,
    hvs100: 1400,
    ap120: 2200,
    ap150: 2500,
    ac210: 3100,
    ac230: 3400,
    ac260: 3600,
    ac310: 4500,
  },
};

// Harga kertas digital — hanya untuk ukuran 32x48 cm, maks. 200 pcs
const digitalPrice = {
  hvs70: { "1-50": 1900, "51-100": 1800, "101-200": 1700 },
  hvs80: { "1-50": 2000, "51-100": 1900, "101-200": 1800 },
  hvs100: { "1-50": 2100, "51-100": 2000, "101-200": 1900 },
  ap120: { "1-50": 2200, "51-100": 2100, "101-200": 2000 },
  ap150: { "1-50": 2300, "51-100": 2200, "101-200": 2100 },
  ac210: { "1-50": 2400, "51-100": 2300, "101-200": 2200 },
  ac230: { "1-50": 2500, "51-100": 2400, "101-200": 2300 },
  ac260: { "1-50": 2600, "51-100": 2500, "101-200": 2400 },
  ac310: { "1-50": 2800, "51-100": 2700, "101-200": 2600 },
};

// Dimensi kalender (orientasi fixed/portrait — panjang = sisi pendek, lebar = sisi panjang)
// lebar dipakai untuk hitung finishing Spiral dan luas laminasi offset
const sizeData = {
  "38x53 cm": { lebar: 38, panjang: 53 },
  "32x48 cm": { lebar: 32, panjang: 48 },
  "44x64 cm": { lebar: 44, panjang: 64 },
  "46x64 cm": { lebar: 46, panjang: 64 },
  custom: { panjang: 0, lebar: 0 }, // diisi dinamis dari input
};

// Dimensi plano yang tersedia untuk offset
const planoData = {
  "65x100 cm": { panjang: 65, lebar: 100 },
  "79x109 cm": { panjang: 79, lebar: 109 },
};

const hargaMesin = {
  "SM-66": 400000, // per set (1 set = 1 lembar desain)
  "SM-74": 420000, // per set (1 set = 2 lembar desain)
};

// Jumlah set cetak berdasarkan mesin
const hitungJumlahSet = {
  "SM-74": (lembar) => Math.ceil(lembar / 2), // 2-up
  "SM-66": (lembar) => lembar, // 1-up
};

// Rate laminasi: digital = Rp/lembar (flat), offset = Rp/cm² (per area)
const rateLaminasi = {
  none: { digital: 0, offset: 0 },
  doff: { digital: 1000, offset: 0.25 },
  glossy: { digital: 1000, offset: 0.15 },
};

// Display names
const paperName = {
  hvs70: "HVS 70gsm",
  hvs80: "HVS 80gsm",
  hvs100: "HVS 100gsm",
  ap120: "Art Paper 120gsm",
  ap150: "Art Paper 150gsm",
  ac210: "Art Carton 210gsm",
  ac230: "Art Carton 230gsm",
  ac260: "Art Carton 260gsm",
};

const jenisKalender = {
  1: "Bulanan (1 lembar)",
  3: "Caturwulan (3 lembar)",
  4: "Triwulan (4 lembar)",
  5: "Triwulan + Cover (5 lembar)",
  6: "Dwiwulan (6 lembar)",
  7: "Dwiwulan + Cover (7 lembar)",
  12: "Bulanan (12 lembar)",
  13: "Bulanan + Cover (13 lembar)",
};

const laminasi = {
  none: "Tidak Ada",
  doff: "Laminasi Doff",
  glossy: "Laminasi Glossy",
};

let hasilTerakhir = null;
/* =====================================================================
   HELPERS
   ===================================================================== */

function formatCurrency(n) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatNumber(n) {
  return new Intl.NumberFormat("id-ID").format(n);
}

function formatDecimal(n, digits = 2) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

function rentangDigital(quantity) {
  if (quantity <= 50) return "1-50";
  if (quantity <= 100) return "51-100";
  return "101-200";
}

function hitungMargin(quantity) {
  if (quantity >= 500) return 0.38;
  if (quantity >= 300) return 0.43;
  return 0.35;
}

function hitungBiayaPotong(quantity) {
  if (quantity < 500) return 40000;
  if (quantity < 2000) return 50000;
  return 60000;
}

/* =====================================================================
   SELEKSI PLANO & MESIN
   ===================================================================== */

// Hitung berapa kalender yang muat dalam 1 lembar plano (orientasi fixed)
function hitungJadiPerPlano(ukuranKode, planoKode) {
  const k = sizeData[ukuranKode];
  const p = planoData[planoKode];
  const opsi1 =
    Math.floor(p.panjang / k.panjang) * Math.floor(p.lebar / k.lebar);
  const opsi2 =
    Math.floor(p.lebar / k.panjang) * Math.floor(p.panjang / k.lebar);
  return Math.max(opsi1, opsi2);
}

// Hitung sisa area (waste) per kalender untuk kombinasi ukuran × plano
function hitungWastePerKalender(ukuranKode, planoKode, jadi) {
  if (jadi === 0) return Infinity;
  const k = sizeData[ukuranKode];
  const p = planoData[planoKode];
  return (p.panjang * p.lebar - jadi * k.panjang * k.lebar) / jadi;
}

// Evaluasi semua kombinasi plano × mesin, kembalikan rekomendasi terbaik:
// 1. Plano dipilih berdasarkan waste per kalender terkecil
// 2. Mesin dipilih berdasarkan total biaya cetak terkecil (untuk plano terpilih)
function rekomendasiPlanoMesin(ukuranKode, jumlahLembar, quantity) {
  const combos = [];

  for (const planoKode of Object.keys(planoData)) {
    const jadi = hitungJadiPerPlano(ukuranKode, planoKode);
    if (jadi === 0) continue; // kalender tidak muat di plano ini

    const waste = hitungWastePerKalender(ukuranKode, planoKode, jadi);
    const jumlahKertas = Math.ceil(((quantity + 100) * jumlahLembar) / jadi);

    for (const mesin of Object.keys(hargaMesin)) {
      const jumlahSet = hitungJumlahSet[mesin](jumlahLembar);
      const biayaCetakBase = jumlahSet * hargaMesin[mesin];
      const biayaOverprint =
        quantity > 1000 ? (quantity - 900) * jumlahLembar * 100 : 0;
      const totalBiayaCetak = biayaCetakBase + biayaOverprint;

      combos.push({
        planoKode,
        mesin,
        jadi,
        waste,
        jumlahKertas,
        jumlahSet,
        totalBiayaCetak,
      });
    }
  }

  if (combos.length === 0) return null;

  // Step 1: plano dengan waste terkecil
  const minWaste = Math.min(...combos.map((c) => c.waste));
  const bestPlano = combos.find((c) => c.waste === minWaste).planoKode;

  // Step 2: dari plano terpilih, mesin dengan biaya cetak terkecil
  const candidates = combos.filter((c) => c.planoKode === bestPlano);
  candidates.sort((a, b) => a.totalBiayaCetak - b.totalBiayaCetak);

  const best = candidates[0];
  return {
    planoKode: best.planoKode,
    mesin: best.mesin,
    jadi: best.jadi,
    waste: best.waste,
    allCombos: combos,
  };
}

/* =====================================================================
                        FUNGSI UTAMA PERHITUNGAN
   ===================================================================== */

function hitungBiayaKalender(
  quantity,
  ukuran,
  jumlahLembar,
  jenisKertas,
  jenisLaminasi,
  jenisFinishing,
  mesinOverride
) {
  // --- Validasi ---
  if (
    !quantity ||
    !ukuran ||
    !jumlahLembar ||
    !jenisKertas ||
    !jenisLaminasi ||
    !jenisFinishing
  ) {
    showError("Mohon lengkapi semua data.");
    return null;
  }
  if (quantity < 100 || quantity % 10 !== 0) {
    showError("Jumlah minimal 100 pcs dan harus dalam kelipatan 10.");
    return null;
  }

  if (ukuran === "custom") {
    const p = parseFloat(document.getElementById("customPanjang").value);
    const l = parseFloat(document.getElementById("customLebar").value);
    if (!p || !l || p <= 0 || l <= 0) {
      showError("Masukkan dimensi custom yang valid.");
      return null;
    }
    sizeData["custom"].panjang = p;
    sizeData["custom"].lebar = l;
  }

  const dataUkuran = sizeData[ukuran];
  if (!dataUkuran) {
    showError("Ukuran tidak valid.");
    return null;
  }

  const isDigital = ukuran === "32x48 cm" && quantity <= 200;

  // --- Variabel yang diisi berbeda tergantung jalur digital/offset ---
  let planoKode, usedMachine, rekomendasiMesin, rekomendasiPlano;
  let jadi, jumlahKertas, hargaKertas, biayaKertas;
  let jumlahCetak, hargaCetak, biayaOverprint, biayaCetak;

  if (isDigital) {
    planoKode = "—";
    usedMachine = "Digital Printing";
    rekomendasiMesin = "Digital Printing";
    rekomendasiPlano = "—";
    jadi = 1;

    jumlahKertas = quantity * jumlahLembar;
    hargaKertas = digitalPrice[jenisKertas][rentangDigital(quantity)];
    biayaKertas = 0; // termasuk dalam biaya cetak

    jumlahCetak = jumlahKertas;
    hargaCetak = hargaKertas;
    biayaOverprint = 0;
    biayaCetak = jumlahKertas * hargaKertas;
  } else {
    const rec = rekomendasiPlanoMesin(ukuran, jumlahLembar, quantity);
    if (!rec) {
      showError("Tidak ada kombinasi plano yang valid untuk ukuran ini.");
      return null;
    }

    planoKode = rec.planoKode;
    rekomendasiMesin = rec.mesin;
    rekomendasiPlano = rec.planoKode;
    usedMachine = mesinOverride || rec.mesin;
    jadi = hitungJadiPerPlano(ukuran, planoKode);

    jumlahKertas = Math.ceil(((quantity + 100) * jumlahLembar) / jadi);
    hargaKertas = offsetPrice[planoKode][jenisKertas];
    biayaKertas = jumlahKertas * hargaKertas;

    jumlahCetak = hitungJumlahSet[usedMachine](jumlahLembar);
    hargaCetak = hargaMesin[usedMachine];
    biayaOverprint =
      quantity > 1000 ? (quantity - 900) * jumlahLembar * 100 : 0;
    biayaCetak = jumlahCetak * hargaCetak + biayaOverprint;
  }

  // --- Laminasi ---
  let biayaLaminasi = 0;
  if (jenisLaminasi !== "none") {
    biayaLaminasi = isDigital
      ? quantity * jumlahLembar * rateLaminasi[jenisLaminasi].digital
      : dataUkuran.panjang *
        dataUkuran.lebar *
        rateLaminasi[jenisLaminasi].offset *
        jumlahKertas;
  }

  // --- Finishing ---
  const hargaFinishing =
    jenisFinishing === "Jepit Seng" ? 1000 : dataUkuran.lebar * 100;
  const jumlahFinishing = quantity + 10;
  const biayaFinishing = hargaFinishing * jumlahFinishing;

  // --- Potong ---
  const biayaPotong =
    !isDigital && jenisFinishing !== "Spiral" ? hitungBiayaPotong(quantity) : 0;

  // --- Potong ---
  const hadiah = 60000;

  // --- Total ---
  const subtotal =
    biayaKertas + biayaCetak + biayaLaminasi + biayaFinishing + biayaPotong;
  const margin = hitungMargin(quantity);
  const totalBiaya = subtotal * (1 + margin) + 50000 + hadiah / quantity;
  const hargaSatuan = totalBiaya / quantity;

  const hasil = {
    mesin: usedMachine,
    rekomendasiMesin,
    rekomendasiPlano,
    isDigital,
    quantity,
    ukuran,
    jumlahLembar,
    namaKertas: paperName[jenisKertas],
    namaJenisKalender: jenisKalender[jumlahLembar] || `${jumlahLembar} lembar`,
    planoKode,
    jadiPerPlano: jadi,
    planoPerKalender: isDigital ? null : jumlahLembar / jadi,
    jumlahKertas,
    hargaKertas,
    biayaKertas,
    jumlahCetak,
    hargaCetak,
    biayaCetak,
    jumlahOverprint: quantity > 1000 && !isDigital ? quantity - 900 : 0,
    biayaOverprint,
    namaLaminasi: laminasi[jenisLaminasi],
    biayaLaminasi,
    jenisFinishing,
    jumlahFinishing,
    hargaFinishing,
    biayaFinishing,
    biayaPotong,
    subtotal,
    hpp: subtotal / quantity,
    margin,
    hadiah,
    totalBiaya,
    hargaSatuan,
  };

  logBreakdownPerhitungan(hasil);
  return hasil;
}

/* =====================================================================
                        LOGGING DETAIL KE CONSOLE
   ===================================================================== */

function generateSketsaPlano(h) {
  if (h.isDigital) return "";

  const k = sizeData[h.ukuran];
  const p = planoData[h.planoKode];

  const o1 = {
    cols: Math.floor(p.panjang / k.panjang),
    rows: Math.floor(p.lebar / k.lebar),
  };
  const o2 = {
    cols: Math.floor(p.lebar / k.panjang),
    rows: Math.floor(p.panjang / k.lebar),
  };
  const ori = o1.cols * o1.rows >= o2.cols * o2.rows ? o1 : o2;
  const pw = o1.cols * o1.rows >= o2.cols * o2.rows ? p.panjang : p.lebar;
  const ph = o1.cols * o1.rows >= o2.cols * o2.rows ? p.lebar : p.panjang;

  const kw = k.panjang,
    kh = k.lebar;

  let rects = "";
  for (let r = 0; r < ori.rows; r++) {
    for (let c = 0; c < ori.cols; c++) {
      const x = c * kw,
        y = r * kh;
      rects += `
          <rect x="${x}" y="${y}" width="${kw}" height="${kh}"
                fill="#dbeafe" stroke="#3b82f6" stroke-width="0.8"/>
          <text x="${x + kw / 2}" y="${y + kh / 2}" text-anchor="middle"
                dominant-baseline="middle"
                font-size="${Math.min(kw, kh) * 0.18}"
                fill="#1d4ed8" font-family="sans-serif">
            ${k.lebar}×${k.panjang}
          </text>`;
    }
  }

  return `
      <svg viewBox="0 0 ${pw} ${ph}"
           style="width:100%; max-width:180px; height:auto;
                  border:1.5px solid #cbd5e1; border-radius:6px; display:block;"
           xmlns="http://www.w3.org/2000/svg">
        <rect width="${pw}" height="${ph}" fill="#f8fafc"/>
        ${rects}
      </svg>`;
}

function generateBreakdownHTML(h) {
  const ppk = h.planoPerKalender;
  const skets = generateSketsaPlano(h);
  const rupiah = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");
  const row = (label, val) => `
      <tr>
        <td class="lbl">${label}</td>
        <td class="val">${val}</td>
      </tr>`;
  const divider = `<tr><td colspan="2"><div class="divider"></div></td></tr>`;

  return `<!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Detail Kalkulasi</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
      body {
        font-family: 'Inter', system-ui, sans-serif;
        background: #f1f5f9;
        color: #1e293b;
        padding: 16px;
        font-size: 14px;
        line-height: 1.6;
      }
  
      .wrap {
        max-width: 920px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
  
      .spec-header {
        background: #0f172a;
        border-radius: 12px;
        padding: 16px 20px;
        text-align: center;
      }
      .spec-header h2 {
        color: #fff;
        font-size: 15px;
        font-weight: 700;
        margin-bottom: 4px;
        line-height: 1.4;
      }
      .spec-header .sub { color: #94a3b8; font-size: 12.5px; }
      .badge {
        display: inline-block;
        background: #3b82f6;
        color: #fff;
        font-size: 11px;
        font-weight: 600;
        padding: 2px 9px;
        border-radius: 99px;
        margin-left: 6px;
        white-space: nowrap;
      }
  
      .card {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,.07), 0 4px 12px rgba(0,0,0,.05);
        padding: 16px 18px;
      }
      .card-title {
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: #64748b;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e2e8f0;
      }

      /* Grid 2 kolom di desktop, 1 kolom di mobile */
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto;
        gap: 12px;
      }

      .col-left  { display: flex; flex-direction: column; gap: 12px; }
      .col-right { display: flex; flex-direction: column; gap: 12px; }

      @media (max-width: 560px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
  
      .plano-wrap { display: flex; gap: 16px; align-items: flex-start; }
      .plano-sketch { flex: 0 0 auto; width: 38%; max-width: 160px; }
      .plano-sketch figcaption {
        font-size: 11px;
        color: #64748b;
        text-align: center;
        margin-top: 5px;
      }
      .plano-info { flex: 1; min-width: 0; }
  
      @media (max-width: 400px) {
        .plano-wrap   { flex-direction: column; }
        .plano-sketch { width: 100%; max-width: 100%; }
      }
  
      table { width: 100%; border-collapse: collapse; }
      td { padding: 5px 0; vertical-align: top; }
      td.lbl { color: #64748b; font-size: 12.5px; width: 48%; padding-right: 10px; }
      td.val { color: #0f172a; font-weight: 500; font-size: 12.5px; word-break: break-word; }
      .divider { height: 1px; background: #f1f5f9; margin: 4px 0; }
  
      .margin-card {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,.07);
        padding: 14px 18px;
      }
      .margin-card label {
        display: block;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: #64748b;
        margin-bottom: 8px;
      }
      .margin-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
      .margin-row input {
        width: 80px;
        border: 1.5px solid #cbd5e1;
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 16px;
        font-family: inherit;
        font-weight: 700;
        color: #0f172a;
        text-align: center;
        outline: none;
        -webkit-appearance: none;
        transition: border-color .15s;
      }
      .margin-row input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px #dbeafe; }
      .margin-hint { font-size: 12px; color: #94a3b8; }
  
      .total-card { background: #0f172a; border-radius: 12px; padding: 18px 20px; }
      .total-meta {
        display: flex;
        justify-content: space-between;
        font-size: 12.5px;
        color: #64748b;
        margin-bottom: 10px;
      }
      .total-sep { height: 1px; background: #1e293b; margin-bottom: 12px; }
      .total-main {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 4px;
      }
      .total-main .t-label { color: #94a3b8; font-size: 12.5px; }
      .total-main .t-val   { color: #fff; font-size: 18px; font-weight: 800; }
      .hpp-row { display: flex; justify-content: space-between; align-items: baseline; }
      .hpp-row .h-label { color: #475569; font-size: 12px; }
      .hpp-row .h-val   { color: #94a3b8; font-size: 13px; font-weight: 600; }
    </style>
  </head>
  <body>
  <div class="wrap">
  
    <div class="spec-header">
      <h2>${h.namaJenisKalender} &nbsp;<span class="badge">${
    h.mesin
  }</span></h2>
      <div class="sub">
        ${h.ukuran} &nbsp;·&nbsp; ${h.namaKertas} &nbsp;·&nbsp;
        ${h.quantity.toLocaleString("id-ID")} pcs
      </div>
    </div>
  
    <div class="grid">

    <div class="col-left">
      <div class="card">
      <div class="card-title">${h.isDigital ? "Kertas" : "Plano & Kertas"}</div>
      ${
        !h.isDigital
          ? `
      <div class="plano-wrap">
        <figure class="plano-sketch">
          ${skets}
          <figcaption>${h.planoKode} - ${h.jadiPerPlano} pcs/plano</figcaption>
        </figure>
        <div class="plano-info">
          <table>
            ${row(
              "Kebutuhan/set",
              formatDecimal(ppk) +
                " lembar (" +
                h.jumlahLembar +
                " lembar ÷ " +
                h.jadiPerPlano +
                ")"
            )}
            ${divider}
            ${row("Total kertas", formatNumber(h.jumlahKertas) + " lbr")}
            ${row("Harga/lembar", rupiah(h.hargaKertas))}
            ${row(
              "Biaya kertas",
              "<strong>" + rupiah(h.biayaKertas) + "</strong>"
            )}
          </table>
        </div>
      </div>`
          : `
      <table>
        ${row("Jumlah lembar", formatNumber(h.jumlahKertas))}
        ${row("Harga/lembar", rupiah(h.hargaKertas))}
        ${row("Biaya kertas", "<strong>Rp 0 — termasuk cetak</strong>")}
      </table>`
      }
    </div>
      <div class="card">
      <div class="card-title">Laminasi & Finishing</div>
      <table>
        ${row(
          "Laminasi",
          h.namaLaminasi +
            (h.namaLaminasi !== "Tidak Ada"
              ? " — " + "<strong>" + rupiah(h.biayaLaminasi) + "</strong>"
              : "")
        )}
        ${row(
          "Finishing",
          h.jenisFinishing +
            " (" +
            formatNumber(h.jumlahFinishing) +
            " pcs)" +
            " — " +
            "<strong>" +
            rupiah(h.biayaFinishing) +
            "</strong>"
        )}
        ${row("Biaya Potong", "<strong>" + rupiah(h.biayaPotong) + "</strong>")}
      </table>
    </div>
    </div>

    <div class="col-right">
      <div class="card">
      <div class="card-title">Cetak</div>
      <table>
        ${row(
          "Jumlah " + (h.isDigital ? "lembar" : "set"),
          formatNumber(h.jumlahCetak)
        )}
        ${row(
          "Harga / " + (h.isDigital ? "lembar" : "set"),
          rupiah(h.hargaCetak)
        )}
        ${
          h.jumlahOverprint > 0
            ? row(
                "Overprint",
                formatNumber(h.jumlahOverprint) +
                  " lbr — " +
                  "<strong>" +
                  rupiah(h.biayaOverprint) +
                  "</strong>"
              )
            : ""
        }
        ${divider}
        ${row("Biaya cetak", "<strong>" + rupiah(h.biayaCetak) + "</strong>")}
      </table>
    </div>
      <div class="margin-card">
      <label for="marginInput">Margin</label>
      <div class="margin-row">
        <input id="marginInput" type="number" inputmode="decimal"
               min="0" max="100" step="1"
               value="${(h.margin * 100).toFixed(0)}"/>
        <span class="margin-hint">
          % &nbsp;·&nbsp; default ${(h.margin * 100).toFixed(0)}% dari quantity
        </span>
      </div>
    </div>
      <div class="total-card">
        <div class="total-meta">
          <span>Subtotal: ${rupiah(h.subtotal)}</span>
          <span>HPP/pcs: ${rupiah(h.hpp)}</span>
        </div>
        <div class="total-sep"></div>
        <div class="total-main">
          <span class="t-label">Total Biaya</span>
          <span class="t-val" id="totalBiaya">—</span>
        </div>
        <div class="hpp-row">
          <span class="h-label">Harga / pcs</span>
          <span class="h-val" id="hargaPerPcs">—</span>
        </div>
      </div>
    </div>

  </div><!-- /grid -->
  
  </div>
  
  <script>
    const subtotal = ${h.subtotal};
    const hadiah   = ${h.hadiah};
    const quantity = ${h.quantity};
    const fmt = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");
  
    function hitung() {
      const margin     = (parseFloat(document.getElementById("marginInput").value) || 0) / 100;
      const totalBiaya = subtotal * (1 + margin) + 50000 + hadiah / quantity;
      const perPcs     = totalBiaya / quantity;
      document.getElementById("totalBiaya").textContent  = fmt(totalBiaya);
      document.getElementById("hargaPerPcs").textContent = fmt(perPcs);
    }
  
    document.getElementById("marginInput").addEventListener("input", hitung);
    hitung();
  </script>
  </body>
  </html>`;
}

function bukaBreakdownTab(h) {
  const tab = window.open("", "_blank");
  tab.document.write(generateBreakdownHTML(h));
  tab.document.close();
}

function logBreakdownPerhitungan(h) {
  const garis = "=".repeat(60);
  const garisTipis = "-".repeat(60);
  console.clear();
  console.log(garis);
  console.log(
    "%cBREAKDOWN PERHITUNGAN",
    "display: block; text-align: center; font-weight: bold;"
  );
  console.log(garis);
  console.log(`Mesin: ${h.mesin} || Quantity: ${formatNumber(h.quantity)} pcs`);
  console.log(`Ukuran: ${h.ukuran} || Jenis: ${h.namaJenisKalender}`);
  console.log(`Kertas: ${h.namaKertas}`);

  if (!h.isDigital) {
    const ppk = h.planoPerKalender;
    console.log(garisTipis);
    console.log("BIAYA PLANO");
    console.log(
      `Plano terpilih: ${h.planoKode} || Jadi/Plano: ${h.jadiPerPlano} pcs`
    );
    console.log(`Kebutuhan Plano: ${formatDecimal(ppk)} lembar plano`);
    // console.log(
    //   `  (${h.jumlahLembar} lembar ÷ ${h.jadiPerPlano} jadi = ${formatDecimal(
    //     ppk
    //   )} → dibulatkan ke atas)`
    // );
    console.log(
      `Total Kertas: ${formatNumber(
        h.jumlahKertas
      )} lembar || Harga/lembar: Rp ${formatCurrency(h.hargaKertas)}`
    );
    console.log(`Biaya Kertas: Rp ${formatCurrency(h.biayaKertas)}`);
  } else {
    console.log(garisTipis);
    console.log("BIAYA KERTAS (Digital)");
    console.log(
      `Jumlah lembar: ${formatNumber(
        h.jumlahKertas
      )} || Harga/lembar: Rp ${formatCurrency(h.hargaKertas)}`
    );
    console.log(`Biaya Kertas: Rp 0 (sudah termasuk dalam biaya cetak)`);
  }

  console.log(garisTipis);
  console.log("BIAYA CETAK");
  if (!h.isDigital) {
    console.log(
      `Jumlah Cetak: ${formatNumber(
        h.jumlahCetak
      )} set || Harga/set: Rp ${formatCurrency(h.hargaCetak)}`
    );
    if (h.jumlahOverprint > 0) {
      console.log(
        `Overprint: ${formatNumber(
          h.jumlahOverprint
        )} lembar || Biaya overprint: Rp ${formatCurrency(h.biayaOverprint)}`
      );
    }
  } else {
    console.log(
      `Jumlah lembar cetak: ${formatNumber(
        h.jumlahCetak
      )} || Harga/lembar: Rp ${formatCurrency(h.hargaCetak)}`
    );
  }
  console.log(`Biaya Cetak: Rp ${formatCurrency(h.biayaCetak)}`);

  console.log(garisTipis);
  console.log("BIAYA LAMINASI & FINISHING");
  if (h.namaLaminasi !== "Tidak Ada") {
    console.log(
      `Laminasi: ${h.namaLaminasi} || Biaya: Rp ${formatCurrency(
        h.biayaLaminasi
      )}`
    );
  } else {
    console.log("Laminasi: Tidak Ada");
  }
  console.log(
    `Finishing: ${h.jenisFinishing} (${formatNumber(
      h.jumlahFinishing
    )} pcs) || Biaya: Rp ${formatCurrency(h.biayaFinishing)}`
  );
  console.log(`Biaya Potong: Rp ${formatCurrency(h.biayaPotong)}`);
  console.log("");

  console.log(garis);
  console.log(
    `Subtotal: Rp ${formatCurrency(h.subtotal)} || HPP/pcs: Rp ${formatCurrency(
      h.hpp
    )}`
  );
  console.log(
    `Margin: ${(h.margin * 100).toFixed(
      0
    )}% || Hadiah Langsung: Rp ${formatCurrency(h.hadiah)}`
  );
  console.log(
    `Total Biaya: Rp ${formatCurrency(
      h.totalBiaya
    )} || Harga/pcs: Rp ${formatCurrency(h.hargaSatuan)}`
  );
  console.log(garis);
  console.log("");
}

/* =====================================================================
                                UI HELPERS
   ===================================================================== */

function resetForm() {
  document.getElementById("calculatorForm").reset();
  document.getElementById("resultCard").style.display = "none";
  document.getElementById("errorAlert").style.display = "none";
  document.getElementById("rekomendasiMesin").textContent = "";
  document.getElementById("mesinPilihan").disabled = true;
  document.getElementById("customSizeWrapper").style.display = "none";
  document.getElementById("customPanjang").disabled = true;
  document.getElementById("customLebar").disabled = true;
}

function showError(message) {
  const el = document.getElementById("errorAlert");
  el.textContent = message;
  el.style.display = "block";
  document.getElementById("resultCard").style.display = "none";
}

function displayResults(h) {
  document.getElementById("errorAlert").style.display = "none";
  document.getElementById("resultCard").style.display = "block";

  const badge = document.getElementById("mesinBadge");
  badge.textContent = h.mesin;
  badge.className =
    "badge " +
    (h.mesin === "SM-74"
      ? "badge-sm74"
      : h.mesin === "SM-66"
      ? "badge-sm66"
      : "badge-digital");

  document.getElementById("jumlahCetak").textContent = `${formatNumber(
    h.quantity
  )} pcs (${h.jumlahLembar} lembar/set)`;
  document.getElementById(
    "bahan"
  ).textContent = `${h.namaKertas}, uk. ${h.ukuran}`;

  let finishingText = h.jenisFinishing;
  if (h.namaLaminasi !== "Tidak Ada") finishingText += `, ${h.namaLaminasi}`;
  document.getElementById("finishingInfo").textContent = finishingText;

  document.getElementById("totalBiaya").textContent =
    "Rp " + formatCurrency(h.totalBiaya);
  document.getElementById("hargaPerBuah").textContent =
    "Rp " + formatCurrency(h.hargaSatuan);

  hasilTerakhir = h;
  document.getElementById("linkBreakdown").style.display = "inline";
  document.getElementById("linkBreakdown").onclick = (e) => {
    e.preventDefault();
    bukaBreakdownTab(hasilTerakhir);
  };
}

// Update teks rekomendasi mesin secara real-time saat input berubah
function updateRekomendasi() {
  const quantity = parseInt(document.getElementById("quantity").value);
  const ukuran = document.getElementById("size").value;
  const jumlahLembar = parseInt(document.getElementById("type").value);
  const rekEl = document.getElementById("rekomendasiMesin");
  const mesinSelect = document.getElementById("mesinPilihan");

  if (!ukuran || isNaN(quantity) || isNaN(jumlahLembar)) {
    rekEl.textContent = "";
    return;
  }

  // Baca dimensi custom sebelum rekomendasiPlanoMesin dipanggil
  if (ukuran === "custom") {
    const p = parseFloat(document.getElementById("customPanjang").value);
    const l = parseFloat(document.getElementById("customLebar").value);
    if (!p || !l || p <= 0 || l <= 0) {
      rekEl.textContent = "";
      return;
    }
    sizeData["custom"].panjang = p;
    sizeData["custom"].lebar = l;
  }

  const isDigital = ukuran === "32x48 cm" && quantity <= 200;

  if (isDigital) {
    rekEl.textContent = "✦ Rekomendasi: Digital Printing";
    mesinSelect.value = "Digital Printing";
    mesinSelect.disabled = true; // ← ditambahkan
    return;
  }

  mesinSelect.disabled = false;
  const rek = rekomendasiPlanoMesin(ukuran, jumlahLembar, quantity);
  if (!rek) {
    rekEl.textContent = "⚠ Tidak ada plano yang cocok";
    return;
  }

  rekEl.textContent = `✦ Rekomendasi: ${rek.mesin} — Plano ${rek.planoKode}`;
  mesinSelect.value = rek.mesin;
}

/* =====================================================================
                              EVENT LISTENERS
   ===================================================================== */

["quantity", "size", "type"].forEach((id) => {
  document.getElementById(id).addEventListener("input", updateRekomendasi);
  document.getElementById(id).addEventListener("change", updateRekomendasi);
});

document.getElementById("quantity").addEventListener("input", function () {
  const v = parseInt(this.value);
  this.classList.toggle("is-invalid", isNaN(v) || v < 100 || v % 10 !== 0);
});

document.getElementById("size").addEventListener("change", function () {
  const isCustom = this.value === "custom";
  const wrapper = document.getElementById("customSizeWrapper");
  const inputP = document.getElementById("customPanjang");
  const inputL = document.getElementById("customLebar");

  wrapper.style.display = this.value ? "flex" : "none"; // tampil untuk semua pilihan
  inputP.disabled = !isCustom;
  inputL.disabled = !isCustom;

  if (!isCustom && sizeData[this.value]) {
    inputP.value = sizeData[this.value].panjang;
    inputL.value = sizeData[this.value].lebar;
  } else {
    inputP.value = "";
    inputL.value = "";
  }
});

document
  .getElementById("calculatorForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const quantity = parseInt(document.getElementById("quantity").value);
    const ukuran = document.getElementById("size").value;
    const jumlahLembar = parseInt(document.getElementById("type").value);
    const jenisKertas = document.getElementById("paper").value;
    const jenisLaminasi = document.getElementById("lamination").value;
    const jenisFinishing = document.getElementById("finishing").value;
    const isDigital = ukuran === "32x48 cm" && quantity <= 200;
    const mesinOverride = isDigital
      ? null
      : document.getElementById("mesinPilihan").value;

    const hasil = hitungBiayaKalender(
      quantity,
      ukuran,
      jumlahLembar,
      jenisKertas,
      jenisLaminasi,
      jenisFinishing,
      mesinOverride
    );
    if (hasil) displayResults(hasil);
  });

document.getElementById("resetBtn").addEventListener("click", resetForm);
window.addEventListener("load", resetForm);

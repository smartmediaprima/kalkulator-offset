/* =====================================================================
   DATABASE HARGA
   ===================================================================== */
const DB = {
  kertas_folio: {
    hvs: 50000,
    ncr_top: 60000,
    ncr_mid: 65000,
    ncr_bot: 65000,
  },
  // Semua bahan cover pakai rentang tier yang sama: 1-50, 51-100, 101-500.
  cover_material: {
    AP120: { "1-50": 2300, "51-100": 2200, "101-500": 2100 },
    AP150: { "1-50": 2400, "51-100": 2300, "101-500": 2200 },
    AC210: { "1-50": 2500, "51-100": 2400, "101-500": 2300 },
    AC230: { "1-50": 2600, "51-100": 2500, "101-500": 2400 },
    AC260: { "1-50": 2700, "51-100": 2600, "101-500": 2500 },
    AC310: { "1-50": 2800, "51-100": 2700, "101-500": 2600 },
  },
  mesin_toko: {
    plat: 8500,
    ongkos: 20000,
  },
  // Nota HANYA Binding (dipaksa+disable di UI).
  // Spiral khusus Block Note.
  finishing_blocknote: {
    binding: 15000,
    spiral: 2000,
    porporasi: 5000,
    numerator: 20000,
  },
  finishing_nota: {
    binding: 20000, // sudah termasuk cover + porporasi
    numerator: 15000,
  },
};

const defaultMargin = 0.3;
const dummyFinishing = false;
const insheet = 10;

const namaMaterialCover = {
  AP120: "Art Paper 120gr",
  AP150: "Art Paper 150gr",
  AC210: "Art Carton 210gr",
  AC230: "Art Carton 230gr",
  AC260: "Art Carton 260gr",
  AC310: "Art Carton 310gr",
};

let hasilTerakhir = null;

/* =====================================================================
   HELPERS
   ===================================================================== */
const formatRp = (angka) => "Rp " + Math.round(angka).toLocaleString("id-ID");

function formatNumber(n) {
  return new Intl.NumberFormat("id-ID").format(n);
}

function showError(message) {
  const el = document.getElementById("errorAlert");
  el.textContent = message;
  el.style.display = "block";
}
function clearError() {
  document.getElementById("errorAlert").style.display = "none";
}

/* =====================================================================
   FORM TOGGLE LOGIC
   ===================================================================== */
function toggleForm() {
  const isNota = document.getElementById("typeNota").checked;
  const isBlocknote = document.getElementById("typeBlocknote").checked;
  const notaSection = document.getElementById("notaPlySection");
  const coverSection = document.getElementById("blocknoteCoverSection");
  const labelIsi = document.getElementById("labelIsi");
  const labelQtyBuku = document.getElementById("labelQtyBuku");
  const qtyBukuHint = document.getElementById("qtyBukuHint");
  const finishingSelect = document.getElementById("jenisFinishing");
  const optSpiral = document.getElementById("optSpiral");
  const checkPorporasi = document.getElementById("tambahPorporasi");

  finishingSelect.disabled = false;
  finishingSelect.value = "";
  optSpiral.disabled = false;
  optSpiral.hidden = false;
  checkPorporasi.disabled = false;

  if (isNota) {
    notaSection.style.display = "block";
    coverSection.style.display = "none";
    labelIsi.innerText = "Jumlah Set per Nota";

    // Nota: field kuantitas pertama sekarang berarti RIM kertas Top yang
    // dicetak, bukan jumlah buku jadi -- jumlah buku jadi dihitung terbalik
    // dari rim ini (lihat hitungKalkulasi).
    labelQtyBuku.innerText = "Jumlah Rim";
    qtyBukuHint.style.display = "block";

    optSpiral.disabled = true;
    optSpiral.hidden = true;
    finishingSelect.value = "binding";
    finishingSelect.disabled = true;

    // Nota: porporasi sudah bundled di binding -> checkbox dipaksa aktif,
    // tidak bisa dimatikan.
    checkPorporasi.checked = true;
    checkPorporasi.disabled = true;
  } else if (isBlocknote) {
    notaSection.style.display = "none";
    coverSection.style.display = "block";
    labelIsi.innerText = "Jumlah Lembar per Buku";

    // Block Note: field kuantitas pertama tetap berarti jumlah buku (pcs),
    // format lama tidak berubah.
    labelQtyBuku.innerText = "Jumlah Buku";
    qtyBukuHint.style.display = "none";

    checkPorporasi.checked = false;
  }
  document.getElementById("resultCard").style.display = "none";
  clearError();
}

function handleUkuranChange() {
  const preset = document.getElementById("ukuranPreset").value;
  const inputP = document.getElementById("ukuranPanjang");
  const inputL = document.getElementById("ukuranLebar");

  if (preset === "custom") {
    inputP.disabled = false;
    inputL.disabled = false;
    inputP.value = "";
    inputL.value = "";
    inputP.focus();
  } else {
    inputP.disabled = true;
    inputL.disabled = true;
    const dims = preset.split("|");
    inputP.value = dims[0];
    inputL.value = dims[1];
  }
}

function resetForm() {
  document.getElementById("calculatorForm").reset();
  handleUkuranChange();
  document.getElementById("jenisFinishing").disabled = false;
  document.getElementById("optSpiral").disabled = false;
  document.getElementById("optSpiral").hidden = false;
  document.getElementById("tambahPorporasi").disabled = false;
  document.getElementById("tambahPorporasi").checked = false;
  document.getElementById("notaPlySection").style.display = "none";
  document.getElementById("blocknoteCoverSection").style.display = "none";
  document.getElementById("labelQtyBuku").innerText = "Jumlah Buku";
  document.getElementById("qtyBukuHint").style.display = "none";
  document.getElementById("resultCard").style.display = "none";
  document.getElementById("dummyWarningBox").innerHTML = "";
  document.getElementById("tierWarningBox").innerHTML = "";
  clearError();
}

/* =====================================================================
   PLANO YIELD & SKETSA
   ===================================================================== */
function hitungYieldInfo(planoW, planoH, potW, potH) {
  const cols1 = Math.floor(planoW / potW);
  const rows1 = Math.floor(planoH / potH);
  const yield1 = cols1 * rows1;

  const cols2 = Math.floor(planoW / potH);
  const rows2 = Math.floor(planoH / potW);
  const yield2 = cols2 * rows2;

  if (yield1 >= yield2) {
    return {
      yieldCount: yield1,
      cols: cols1,
      rows: rows1,
      cw: potW,
      ch: potH,
      pw: planoW,
      ph: planoH,
    };
  }
  return {
    yieldCount: yield2,
    cols: cols2,
    rows: rows2,
    cw: potH,
    ch: potW,
    pw: planoW,
    ph: planoH,
  };
}

// Bangun SVG sketsa pembagian plano, dipakai di dalam modal untuk plano isi maupun plano cover.
//
// Plano Folio (21.5x33) dan A3+ (32x48) sama-sama portrait (lebih tinggi dari lebar).
// Tanpa koreksi, SVG digambar tinggi-memanjang ke bawah dan jadi besar di modal.
// Di sini sketsa DIPAKSA selalu landscape (lebih lebar dari tinggi)
// dengan menukar sumbu plano+grid -- meniru logika generateSketsaPlano() di kalkulator Kalender Dinding (ph>pw -> swap).
// Murni transformasi tampilan (rotasi layout), jumlah & label potongan tidak berubah.
// viewBox landscape + max-width kecil membuat sketsa tampil ringkas, bukan memanjang ke bawah.
function generateSketsaSVG(info) {
  let { cols, rows, cw, ch, pw, ph } = info;

  if (ph > pw) {
    [pw, ph] = [ph, pw];
    [cols, rows] = [rows, cols];
    [cw, ch] = [ch, cw];
  }

  let rects = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cw;
      const y = r * ch;
      rects += `
        <rect x="${x}" y="${y}" width="${cw}" height="${ch}"
              fill="#e8f4ff" stroke="#0466c8" stroke-width="0.25"/>
        ${
          c < cols - 1
            ? `<line x1="${(c + 1) * cw}" y1="0" x2="${(c + 1) * cw}" y2="${
                rows * ch
              }"
                 stroke="#0466c8" stroke-width="0.75" stroke-dasharray="4,3"/>`
            : ""
        }
        ${
          r < rows - 1
            ? `<line x1="0" y1="${(r + 1) * ch}" x2="${cols * cw}" y2="${
                (r + 1) * ch
              }"
                 stroke="#0466c8" stroke-width="0.75" stroke-dasharray="4,3"/>`
            : ""
        }
        <text x="${x + cw / 2}" y="${y + ch / 2}" text-anchor="middle"
              dominant-baseline="middle"
              font-size="${Math.min(cw, ch) * 0.18}"
              fill="#0354a0" font-weight="700">
          ${cw}×${ch}
        </text>`;
    }
  }
  return `
    <svg viewBox="0 0 ${pw} ${ph}"
         style="width:100%; max-width:200px; display:inline-block;"
         xmlns="http://www.w3.org/2000/svg">
      <rect width="${pw}" height="${ph}" fill="#e8f4ff" stroke="#0466c8" stroke-width="0.5" rx="2"/>
      ${rects}
    </svg>`;
}

/* =====================================================================
   LOOKUP HARGA COVER (TIER GENERIK)
   ===================================================================== */
function getCoverPricePerSheet(material, qtyLembar) {
  const tiers = DB.cover_material[material];
  const tierEntries = Object.keys(tiers)
    .map((key) => {
      const [min, max] = key.split("-").map(Number);
      return { key, min, max };
    })
    .sort((a, b) => a.min - b.min);

  let matched = tierEntries.find(
    (t) => qtyLembar >= t.min && qtyLembar <= t.max
  );
  let outOfRange = false;
  if (!matched) {
    matched = tierEntries[tierEntries.length - 1];
    outOfRange = true;
  }
  return { harga: tiers[matched.key], tierKey: matched.key, outOfRange };
}

/* =====================================================================
   FUNGSI UTAMA PERHITUNGAN (murni, tidak menyentuh DOM)
   ===================================================================== */
function hitungKalkulasi(input) {
  const {
    productType,
    p,
    l,
    qtyBuku,
    isiPerBuku,
    jumlahPly,
    jenisFinishing,
    adaPorporasi,
    adaNumerator,
    materialCover,
  } = input;

  const isBlocknote = productType === "blocknote";
  const isNota = productType === "nota";

  const yieldIsiInfo = hitungYieldInfo(21.5, 33, p, l);
  if (yieldIsiInfo.yieldCount < 1) {
    return {
      error: "Ukuran lebih besar dari area cetak kertas Folio (21.5 x 33 cm)!",
    };
  }

  // Block Note: alur lama -- qtyBuku adalah INPUT jumlah buku (pcs), dari situ
  // dihitung kebutuhan lembar lalu dibulatkan ke rim.
  //
  // Nota: alur DIBALIK -- qtyBuku sekarang adalah INPUT jumlah RIM kertas Top
  // yang ingin dicetak. Jumlah buku/pad nota yang jadi adalah HASIL hitungan
  // (rim -> lembar -> total pcs set via yield plano -> dibagi isi per buku),
  // bukan lagi input langsung.
  let totalSet, lembarFolioPerPly, rimFolioPerPly;
  let totalBukuJadi, notaTotalPcsJadi, notaSisaPcs;
  let qtyBukuProduksi = null;

  if (isNota) {
    rimFolioPerPly = qtyBuku; // input kini berarti rim, bukan pcs buku
    lembarFolioPerPly = rimFolioPerPly * 500;
    notaTotalPcsJadi = lembarFolioPerPly * yieldIsiInfo.yieldCount;
    totalBukuJadi = Math.floor(notaTotalPcsJadi / isiPerBuku);
    notaSisaPcs = notaTotalPcsJadi - totalBukuJadi * isiPerBuku;
    totalSet = notaTotalPcsJadi;

    if (totalBukuJadi < 1) {
      return {
        error: `Jumlah rim terlalu sedikit -- ${rimFolioPerPly} Rim hanya menghasilkan ${notaTotalPcsJadi} pcs set, belum cukup untuk 1 buku nota (butuh ${isiPerBuku} set/buku). Tambah jumlah rim atau kurangi isi per buku.`,
      };
    }
  } else {
    qtyBukuProduksi = qtyBuku + insheet;
    totalSet = qtyBukuProduksi * isiPerBuku;
    lembarFolioPerPly = Math.ceil(totalSet / yieldIsiInfo.yieldCount);
    rimFolioPerPly = Math.ceil(lembarFolioPerPly / 500) || 1;
    totalBukuJadi = qtyBuku;
    5;
  }

  let bahanIsi = [];
  let totalHPP = 0;

  let coverInfo = null;
  let yieldCoverInfo = null;

  if (isBlocknote) {
    const biayaHVS = rimFolioPerPly * DB.kertas_folio.hvs;
    bahanIsi.push({
      label: "Kertas HVS",
      rim: rimFolioPerPly,
      hargaPerRim: DB.kertas_folio.hvs,
      biaya: biayaHVS,
    });
    totalHPP += biayaHVS;

    yieldCoverInfo = hitungYieldInfo(32, 48, p, l);
    if (yieldCoverInfo.yieldCount < 1) {
      return {
        error:
          "Ukuran lebih besar dari area cetak kertas A3+ (32 x 48 cm) untuk cover!",
      };
    }
    const totalCoverPcs = qtyBukuProduksi * 2;
    const lbrA3 = Math.ceil(totalCoverPcs / yieldCoverInfo.yieldCount);
    const priceInfo = getCoverPricePerSheet(materialCover, lbrA3);
    const biayaBahanCover = lbrA3 * priceInfo.harga;

    coverInfo = {
      material: materialCover,
      namaMaterial: namaMaterialCover[materialCover],
      lbrA3,
      tierKey: priceInfo.tierKey,
      outOfRange: priceInfo.outOfRange,
      hargaPerLembar: priceInfo.harga,
      biaya: biayaBahanCover,
    };
    totalHPP += biayaBahanCover;
  } else {
    const biayaTop = rimFolioPerPly * DB.kertas_folio.ncr_top;
    bahanIsi.push({
      label: "Kertas NCR Top",
      rim: rimFolioPerPly,
      hargaPerRim: DB.kertas_folio.ncr_top,
      biaya: biayaTop,
    });
    totalHPP += biayaTop;

    if (jumlahPly >= 2) {
      const biayaBot = rimFolioPerPly * DB.kertas_folio.ncr_bot;
      bahanIsi.push({
        label: "Kertas NCR Bottom",
        rim: rimFolioPerPly,
        hargaPerRim: DB.kertas_folio.ncr_bot,
        biaya: biayaBot,
      });
      totalHPP += biayaBot;
    }
    if (jumlahPly >= 3) {
      const qtyMid = jumlahPly - 2;
      const rimMid = rimFolioPerPly * qtyMid;
      const biayaMid = rimMid * DB.kertas_folio.ncr_mid;
      bahanIsi.push({
        label: "Kertas NCR Middle",
        rim: rimMid,
        hargaPerRim: DB.kertas_folio.ncr_mid,
        biaya: biayaMid,
      });
      totalHPP += biayaMid;
    }
  }

  // totalRimMasukMesin = rim per ply (sudah dibulatkan ke atas) dikali jumlah
  // ply. Ini jadi SATU-SATUNYA basis "total rim" yang dipakai baik untuk
  // ongkos cetak isi maupun untuk semua komponen finishing (binding, spiral,
  // porporasi, numerator) di bawah -- menggantikan basis "totalRimBuku" lama
  // yang dihitung ulang dari total LEMBAR (totalSet * jumlahPly / 500).
  // Dua formula itu bisa beda hasil karena beda urutan pembulatan; dengan
  // satu basis yang sama, jumlah rim yang dipakai untuk menghitung biaya
  // cetak dan biaya finishing selalu konsisten satu sama lain.
  const totalRimMasukMesin = rimFolioPerPly * jumlahPly;
  const cetakIsiIncluded = isBlocknote;
  const biayaPlat = cetakIsiIncluded ? 0 : jumlahPly * DB.mesin_toko.plat;
  const biayaOngkosCetak = cetakIsiIncluded
    ? 0
    : totalRimMasukMesin * DB.mesin_toko.ongkos;
  totalHPP += biayaPlat + biayaOngkosCetak;

  const finishingTable = isBlocknote
    ? DB.finishing_blocknote
    : DB.finishing_nota;

  let biayaJilid = 0;
  let namaJilid = "";
  let lebarSpiral = null;
  if (jenisFinishing === "binding") {
    biayaJilid = totalRimMasukMesin * finishingTable.binding;
    namaJilid =
      "Jilid Lem Punggung (Binding)" + (isNota ? " - incl. Cover" : "");
  } else if (jenisFinishing === "spiral") {
    lebarSpiral = Math.min(p, l);
    biayaJilid = totalRimMasukMesin * lebarSpiral * finishingTable.spiral;
    namaJilid = `Jilid Spiral Kawat (lebar ${lebarSpiral}cm)`;
  }
  totalHPP += biayaJilid;

  // Nota: porporasi sudah bundled di harga binding, TIDAK dihitung terpisah
  // (checkbox tetap tampil aktif di UI sebagai indikator saja).
  let biayaPorporasi = 0;
  const porporasiBundledDiBinding = isNota;
  if (adaPorporasi && !porporasiBundledDiBinding) {
    biayaPorporasi = totalRimMasukMesin * finishingTable.porporasi;
    totalHPP += biayaPorporasi;
  }

  let biayaNumerator = 0;
  if (adaNumerator) {
    biayaNumerator = totalRimMasukMesin * finishingTable.numerator;
    totalHPP += biayaNumerator;
  }

  // hppPerBuku & hargaJualPerBuku HARUS dibagi jumlah buku yang BENAR-BENAR
  // jadi (totalBukuJadi), bukan input mentah qtyBuku -- karena untuk Nota,
  // qtyBuku sekarang adalah rim (bukan jumlah buku), jadi membagi dengan
  // qtyBuku langsung akan menghasilkan harga per buku yang salah total.
  const hppPerBuku = totalHPP / totalBukuJadi;
  const nominalMargin = totalHPP * defaultMargin;
  const hargaJualTotal = totalHPP + nominalMargin;
  const hargaJualPerBuku = hargaJualTotal / totalBukuJadi;

  return {
    productType,
    isBlocknote,
    isNota,
    p,
    l,
    ukuranLabel: `${p} x ${l} cm`,
    // qtyBuku di sini SELALU berarti jumlah buku/pad yang benar-benar jadi:
    // untuk Block Note persis sama dengan input, untuk Nota ini hasil
    // hitungan dari rim (totalBukuJadi) -- bukan angka rim yang diinput.
    qtyBuku: totalBukuJadi,
    // Khusus Nota: info tambahan untuk ditampilkan di kartu hasil & modal.
    notaRimDiminta: isNota ? rimFolioPerPly : null,
    notaTotalPcsJadi: isNota ? notaTotalPcsJadi : null,
    notaSisaPcs: isNota ? notaSisaPcs : null,
    insheetBlocknote: isBlocknote ? insheet : null,
    qtyBukuProduksi: isBlocknote ? qtyBukuProduksi : null,
    isiPerBuku,
    totalSet,
    jumlahPly,
    jenisFinishing,
    namaJilid,
    lebarSpiral,
    adaPorporasi,
    adaNumerator,
    porporasiBundledDiBinding,
    yieldIsiInfo,
    rimFolioPerPly,
    lembarFolioPerPly,
    bahanIsi,
    coverInfo,
    yieldCoverInfo,
    totalRimMasukMesin,
    biayaPlat,
    biayaOngkosCetak,
    cetakIsiIncluded,
    biayaJilid,
    biayaPorporasi,
    biayaNumerator,
    totalHPP,
    hppPerBuku,
    margin: defaultMargin,
    nominalMargin,
    hargaJualTotal,
    hargaJualPerBuku,
  };
}

/* =====================================================================
   RENDER: KARTU HASIL UTAMA (ringkas, tanpa detail rim/ongkos cetak)
   ===================================================================== */
function displayResults(h) {
  clearError();
  document.getElementById("resultCard").style.display = "block";

  document.getElementById("produkBadge").textContent = h.isBlocknote
    ? "Block Note"
    : "Nota / Bon";

  if (h.isNota) {
    // Nota: "Jumlah" menampilkan rim yang diminta DAN total pcs nota yang
    // jadi dari rim tersebut (hasil hitungan, bukan input langsung).
    document.getElementById("jumlahCetakInfo").textContent =
      `${formatNumber(h.notaRimDiminta)} Rim → ` +
      `${formatNumber(h.qtyBuku)} buku jadi`;
  } else {
    document.getElementById("jumlahCetakInfo").textContent = `${formatNumber(
      h.qtyBuku
    )} buku (${formatNumber(h.isiPerBuku)} lembar/buku)`;
  }

  document.getElementById("bahanInfo").textContent = h.isBlocknote
    ? "HVS"
    : "Kertas NCR";
  document.getElementById("ukuranDetail").textContent = h.ukuranLabel;

  if (h.isBlocknote && h.coverInfo) {
    document.getElementById("extraInfoLabel").textContent = "Jenis Cover";
    document.getElementById("extraInfoValue").textContent =
      h.coverInfo.namaMaterial;
  } else if (h.isNota) {
    document.getElementById("extraInfoLabel").textContent =
      "Jumlah Rangkap (Ply)";
    document.getElementById(
      "extraInfoValue"
    ).textContent = `${h.jumlahPly} Ply`;
  }

  let finishingText = h.namaJilid;
  const tambahan = [];
  if (h.adaPorporasi) tambahan.push("Porporasi");
  if (h.adaNumerator) tambahan.push("Numerator");
  if (tambahan.length) finishingText += `, ${tambahan.join(" + ")}`;
  document.getElementById("finishingInfo").textContent = finishingText;

  document.getElementById("totalBiaya").textContent = formatRp(
    h.hargaJualTotal
  );
  document.getElementById("hargaPerBuah").textContent = formatRp(
    h.hargaJualPerBuku
  );

  let dummyMsg = "";
  if (dummyFinishing) {
    dummyMsg = h.isBlocknote
      ? "Harga finishing Block Note masih DUMMY, belum harga asli. Ganti di <code>DB.finishing_blocknote</code>."
      : "Harga finishing Nota masih DUMMY, belum harga asli. Ganti di <code>DB.finishing_nota</code>.";
  }
  document.getElementById("dummyWarningBox").innerHTML = dummyMsg
    ? `<div class="alert-dummy"><i class="fas fa-triangle-exclamation me-1"></i> ${dummyMsg}</div>`
    : "";

  let tierMsgs = [];
  if (h.coverInfo && h.coverInfo.outOfRange) {
    tierMsgs.push(
      `Jumlah lembar cover (${h.coverInfo.lbrA3} lbr) melebihi tier harga tertinggi yang tersedia untuk ${h.coverInfo.namaMaterial}. Harga dipakai dari tier "${h.coverInfo.tierKey}" sebagai perkiraan — perlu konfirmasi harga resmi.`
    );
  }
  if (h.isNota && h.notaSisaPcs > 0) {
    tierMsgs.push(
      `Dari ${formatNumber(
        h.notaRimDiminta
      )} Rim yang dicetak, ada sisa ${formatNumber(
        h.notaSisaPcs
      )} pcs set yang tidak cukup untuk 1 buku penuh (isi ${formatNumber(
        h.isiPerBuku
      )} set/buku) -- sisa ini tidak dihitung ke dalam ${formatNumber(
        h.qtyBuku
      )} buku jadi di atas.`
    );
  }
  document.getElementById("tierWarningBox").innerHTML = tierMsgs.length
    ? tierMsgs
        .map(
          (m) =>
            `<div class="alert-dummy"><i class="fas fa-triangle-exclamation me-1"></i> ${m}</div>`
        )
        .join("")
    : "";

  hasilTerakhir = h;
}

/* =====================================================================
   RENDER: MODAL RINCIAN
   ===================================================================== */
function row(label, val) {
  return `<div class="modal-row"><span>${label}</span><span>${val}</span></div>`;
}
function rowTotal(label, val) {
  return `<div class="modal-row total-row-inner"><span>${label}</span><span>${val}</span></div>`;
}

function updateModalTotals(marginPct) {
  if (!hasilTerakhir) return;
  const h = hasilTerakhir;
  const margin = (parseFloat(marginPct) || 0) / 100;
  const totalBiaya = h.totalHPP * (1 + margin);
  const perBuku = totalBiaya / h.qtyBuku;
  document.getElementById("modalTotal").textContent = formatRp(totalBiaya);
  document.getElementById("modalPerPcs").textContent = formatRp(perBuku);
}

function buildModalContent(h) {
  document.getElementById("modalTitle").textContent = `${
    h.isBlocknote ? "Block Note" : "Nota / Bon"
  } · ${h.ukuranLabel}`;
  document.getElementById(
    "modalProdukBadge"
  ).innerHTML = `<span class="badge-soft">${
    h.isBlocknote ? "Block Note" : "Nota"
  }</span>`;
  document.getElementById("modalSubtitle").textContent = h.isNota
    ? `${formatNumber(h.notaRimDiminta)} Rim · ${formatNumber(
        h.qtyBuku
      )} buku jadi · ${formatNumber(h.isiPerBuku)} set/buku`
    : `${formatNumber(h.qtyBuku)} buku · ${formatNumber(
        h.isiPerBuku
      )} lembar/buku`;

  document.getElementById("modalPlanoSketchIsi").innerHTML =
    generateSketsaSVG(h.yieldIsiInfo) +
    `<div style="font-size:11px; color:#64748b; margin-top:5px;">
       Folio (21.5×33cm) — ${h.yieldIsiInfo.yieldCount} pcs/plano
     </div>`;

  // Kertas HVS/NCR: baris per bahan hanya menampilkan HARGA SATUAN (per rim), bukan biaya total per bahan.
  // Catatan untuk Nota 3-Ply: kertas Middle butuh rim lebih banyak
  // (rimFolioPerPly dikali jumlah lapisan Middle) dibanding Top/Bottom --
  // total biaya keseluruhan tetap akurat karena dihitung dari totalBahanIsi
  // di bawah, terlepas dari bagaimana rim per bahan ditampilkan.
  let isiHtml = h.bahanIsi
    .map((b) => row(b.label, formatRp(b.hargaPerRim) + "/rim"))
    .join("");
  const totalBahanIsi = h.bahanIsi.reduce((s, b) => s + b.biaya, 0);

  if (h.isNota) {
    // Nota: tampilkan rim yang diminta, lembar hasil cetak, dan yang paling
    // penting -- total pcs nota yang JADI dari rim tersebut (serta jadi
    // berapa buku setelah dibagi isi/buku).
    isiHtml += row(
      "Rim Dicetak",
      `${formatNumber(h.notaRimDiminta)} Rim (${formatNumber(
        h.lembarFolioPerPly
      )} lbr)`
    );
    isiHtml += row(
      "Jadi Buku Nota",
      `${formatNumber(h.qtyBuku)} buku (isi ${formatNumber(
        h.isiPerBuku
      )} set/buku)`
    );
    if (h.notaSisaPcs > 0) {
      isiHtml += row(
        "Sisa Pcs (kurang dari 1 buku)",
        `${formatNumber(h.notaSisaPcs)} pcs`
      );
    }
  } else {
    isiHtml += row(
      "Insheet",
      `+${formatNumber(h.insheetBlocknote)} pcs → dicetak ${formatNumber(
        h.qtyBukuProduksi
      )} buku`
    );

    isiHtml += row(
      "Total Kebutuhan Lembar",
      `${formatNumber(h.lembarFolioPerPly)} lbr (${formatNumber(
        h.rimFolioPerPly
      )} Rim)`
    );
  }

  isiHtml += rowTotal(
    "Biaya Bahan Isi",
    `<strong>${formatRp(totalBahanIsi)}</strong>`
  );
  document.getElementById("modalPaperDetailsIsi").innerHTML = isiHtml;

  const coverSection = document.getElementById("modalCoverSection");
  if (h.coverInfo) {
    coverSection.style.display = "block";
    document.getElementById("modalPlanoSketchCover").innerHTML =
      generateSketsaSVG(h.yieldCoverInfo) +
      `<div style="font-size:11px; color:#64748b; margin-top:5px;">
         A3+ (32×48cm) — ${h.yieldCoverInfo.yieldCount} pcs/plano
       </div>`;

    let coverHtml =
      row("Bahan", h.coverInfo.namaMaterial) +
      row("Jumlah Lembar", `${formatNumber(h.coverInfo.lbrA3)} lbr A3+`) +
      row(
        "Harga/lembar",
        `${formatRp(h.coverInfo.hargaPerLembar)} (tier ${h.coverInfo.tierKey})`
      ) +
      row("Biaya Cetak Digital", "include di harga bahan") +
      rowTotal(
        "Biaya Cover",
        `<strong>${formatRp(h.coverInfo.biaya)}</strong>`
      );
    document.getElementById("modalPaperDetailsCover").innerHTML = coverHtml;
  } else {
    coverSection.style.display = "none";
  }

  // Biaya Cetak: detail hitungan (jumlah set x harga cetak) ditampilkan
  // langsung di label baris, di samping tulisan "Biaya Cetak".
  let printHtml;
  if (h.cetakIsiIncluded) {
    printHtml = row("Biaya Cetak Isi", "include di harga kertas HVS");
  } else {
    printHtml =
      row(`Plat Master (${h.jumlahPly} warna/ply)`, formatRp(h.biayaPlat)) +
      row(
        `Biaya Cetak (${formatNumber(h.totalRimMasukMesin)} x ${formatRp(
          DB.mesin_toko.ongkos
        )})`,
        formatRp(h.biayaOngkosCetak)
      ) +
      rowTotal(
        "Total Biaya Cetak Isi",
        `<strong>${formatRp(h.biayaPlat + h.biayaOngkosCetak)}</strong>`
      );
  }
  document.getElementById("modalPrintDetails").innerHTML = printHtml;

  let finishingHtml = row(h.namaJilid, formatRp(h.biayaJilid));
  if (h.adaPorporasi) {
    finishingHtml += h.porporasiBundledDiBinding
      ? row("Biaya Porporasi (include di Binding)", "Rp -")
      : row("Biaya Porporasi", formatRp(h.biayaPorporasi));
  }
  if (h.adaNumerator)
    finishingHtml += row("Biaya Numerator", formatRp(h.biayaNumerator));
  const totalFinishing = h.biayaJilid + h.biayaPorporasi + h.biayaNumerator;
  finishingHtml += rowTotal(
    "Total Biaya Finishing",
    `<strong>${formatRp(totalFinishing)}</strong>`
  );
  document.getElementById("modalFinishingDetails").innerHTML = finishingHtml;

  document.getElementById("modalSubtotal").textContent = formatRp(h.totalHPP);
  document.getElementById("modalHpp").textContent = formatRp(h.hppPerBuku);

  const defaultMarginPct = Math.round(h.margin * 100);
  document.getElementById("marginInput").value = defaultMarginPct;
  document.getElementById(
    "defaultMarginHint"
  ).textContent = `default ${defaultMarginPct}%`;
  updateModalTotals(defaultMarginPct);
}

/* =====================================================================
   EVENT: HITUNG
   ===================================================================== */
function kalkulasiHarga() {
  document.getElementById("dummyWarningBox").innerHTML = "";
  document.getElementById("tierWarningBox").innerHTML = "";
  clearError();

  const isBlocknote = document.getElementById("typeBlocknote").checked;
  const isNota = document.getElementById("typeNota").checked;
  if (!isBlocknote && !isNota) {
    showError("Pilih jenis produk terlebih dahulu (Block Note atau Nota)!");
    return;
  }

  const p = parseFloat(document.getElementById("ukuranPanjang").value) || 0;
  const l = parseFloat(document.getElementById("ukuranLebar").value) || 0;
  const qtyBuku = parseInt(document.getElementById("qtyBuku").value) || 0;
  const isiPerBuku = parseInt(document.getElementById("isiPerBuku").value) || 0;

  let jumlahPly = 1;
  if (isNota) {
    const plyRaw = document.getElementById("jumlahPly").value;
    if (plyRaw === "") {
      showError("Pilih jumlah rangkap (ply) kertas NCR terlebih dahulu!");
      return;
    }
    jumlahPly = parseInt(plyRaw);
  }

  const jenisFinishing = document.getElementById("jenisFinishing").value;
  if (jenisFinishing === "") {
    showError("Pilih jenis finishing terlebih dahulu!");
    return;
  }

  const adaPorporasi = document.getElementById("tambahPorporasi").checked;
  const adaNumerator = document.getElementById("tambahNumerator").checked;

  const materialCover = isBlocknote
    ? document.getElementById("jenisCoverMaterial").value
    : "";
  if (isBlocknote && materialCover === "") {
    showError("Pilih jenis bahan cover terlebih dahulu!");
    return;
  }

  if (p === 0 || l === 0) {
    showError("Masukkan ukuran panjang dan lebar yang valid!");
    return;
  }
  if (qtyBuku === 0 || isiPerBuku === 0) {
    showError("Masukkan jumlah buku dan isi per buku yang valid!");
    return;
  }

  const result = hitungKalkulasi({
    productType: isBlocknote ? "blocknote" : "nota",
    p,
    l,
    qtyBuku,
    isiPerBuku,
    jumlahPly,
    jenisFinishing,
    adaPorporasi,
    adaNumerator,
    materialCover,
  });

  if (result.error) {
    showError(result.error);
    return;
  }

  displayResults(result);
}

/* =====================================================================
   EVENT LISTENERS
   ===================================================================== */
document.getElementById("marginInput").addEventListener("input", function () {
  updateModalTotals(this.value);
});

document
  .getElementById("priceHighlightLink")
  .addEventListener("click", function (e) {
    e.preventDefault();
    if (!hasilTerakhir) return;
    buildModalContent(hasilTerakhir);
  });

window.addEventListener("load", function () {
  document.getElementById("resultCard").style.display = "none";
});

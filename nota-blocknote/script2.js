// ==========================================
// DATABASE HARGA (Konversi ke ukuran dasar)
// ==========================================
const DB = {
  kertas_folio: {
    hvs: 50000, // Harga HVS per RIM (500 lbr Folio)
    ncr_top: 30000, // Harga NCR Top Putih per RIM Folio
    ncr_mid: 32000, // Harga NCR Middle per RIM Folio
    ncr_bot: 28000, // Harga NCR Bottom per RIM Folio
  },
  // Harga bahan cover per LEMBAR A3+, bertingkat sesuai jumlah lembar
  // yang dicetak (lbrA3). ==> ANGKA DARI USER, SUDAH FIX <==
  cover_material: {
    AP120: { "1-50": 2200, "51-100": 2100, "101-300": 2000 },
    AP150: { "1-50": 2300, "51-100": 2200, "101-300": 2100 },
    AC210: { "1-50": 2400, "51-100": 2300, "101-300": 2200 },
    AC230: { "1-50": 2500, "51-100": 2400, "101-300": 2300 },
    AC260: { "1-50": 2600, "51-100": 2500, "101-300": 2400 },
    AC310: { "1-50": 2800, "51-100": 2700, "101-200": 2600 },
  },
  mesin_toko: {
    plat: 9000, // Harga master plat (per warna/ply)
    ongkos: 10000, // Ongkos jalan mesin per Rim masuk
  },
  finishing_blocknote: {
    binding: 15000, // per Rim hasil buku
    staples: 20000, // per Rim hasil buku
    spiral: 2000, // per cm lebar buku per Rim
    porporasi: 15000, // per Rim tambahan
    numerator: 20000, // per Rim tambahan
  },
  finishing_nota: {
    binding: 15000, // DUMMY - ganti dengan harga asli (sudah termasuk cover bundled)
    staples: 20000, // DUMMY - ganti dengan harga asli
    spiral: 2000, // DUMMY - ganti dengan harga asli
    porporasi: 15000, // DUMMY - ganti dengan harga asli
    numerator: 20000, // DUMMY - ganti dengan harga asli
  },
};

const IS_FINISHING_NOTA_DUMMY = true; // set false setelah harga asli nota diinput

// Utility Format Rupiah
const formatRp = (angka) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);

function toggleForm() {
  const isNota = document.getElementById("typeNota").checked;
  const isBlocknote = document.getElementById("typeBlocknote").checked;
  const notaSection = document.getElementById("notaPlySection");
  const coverSection = document.getElementById("blocknoteCoverSection");
  const labelIsi = document.getElementById("labelIsi");
  const infoCoverAlert = document.getElementById("infoCoverAlert");

  if (isNota) {
    notaSection.style.display = "block";
    coverSection.style.display = "none";
    labelIsi.innerText = "Jumlah Set per Nota";
    infoCoverAlert.style.display = "none"; // Nota tidak pakai cover terpisah (sudah bundled di finishing)
  } else if (isBlocknote) {
    notaSection.style.display = "none";
    coverSection.style.display = "block";
    labelIsi.innerText = "Jumlah Lembar per Buku";
    infoCoverAlert.style.display = "inline";
  }
  document.getElementById("resultCard").style.display = "none";
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
    inputP.value = dims[0]; // Panjang
    inputL.value = dims[1]; // Lebar
  }
}

function resetForm() {
  document.getElementById("calculatorForm").reset();
  handleUkuranChange();
  document.getElementById("resultCard").style.display = "none";
  document.getElementById("dummyWarningBox").innerHTML = "";
  document.getElementById("tierWarningBox").innerHTML = "";
}

// Fungsi untuk menghitung berapa banyak potongan kecil muat di kertas plano
// CATATAN: fungsi ini BELUM memperhitungkan margin/gutter potong (bleed).
// Jika di lapangan ada toleransi potong beberapa mm antar pcs, yield
// riil bisa lebih kecil dari hasil hitung ini. Perlu dicek ke praktik
// operator potong sebelum dipakai sebagai acuan final.
function hitungYield(planoW, planoH, potongW, potongH) {
  let susun1 = Math.floor(planoW / potongW) * Math.floor(planoH / potongH);
  let susun2 = Math.floor(planoW / potongH) * Math.floor(planoH / potongW);
  return Math.max(susun1, susun2);
}

// Lookup harga bahan cover per lembar A3+, berdasarkan TIER JUMLAH LEMBAR (lbrA3).
// Tabel cuma didefinisikan sampai tier "101-300". Untuk qty > 300,
// TIDAK ADA DATA HARGA -> fallback pakai tier tertinggi yang ada,
// dan tampilkan warning eksplisit ke user (jangan diam-diam dipakai).
function getCoverPricePerSheet(material, qtyLembar) {
  const tiers = DB.cover_material[material];
  let tierKey;
  let outOfRange = false;

  if (qtyLembar <= 50) {
    tierKey = "1-50";
  } else if (qtyLembar <= 100) {
    tierKey = "51-100";
  } else if (qtyLembar <= 300) {
    tierKey = "101-300";
  } else {
    tierKey = "101-300"; // fallback, belum ada data resmi > 300
    outOfRange = true;
  }

  return { harga: tiers[tierKey], tierKey, outOfRange };
}

function kalkulasiHarga() {
  // Reset warning boxes
  document.getElementById("dummyWarningBox").innerHTML = "";
  document.getElementById("tierWarningBox").innerHTML = "";

  // Ambil Input
  const isBlocknote = document.getElementById("typeBlocknote").checked;
  const isNota = document.getElementById("typeNota").checked;

  if (!isBlocknote && !isNota) {
    alert("Pilih jenis produk terlebih dahulu (Block Note atau Nota)!");
    return;
  }

  const p = parseFloat(document.getElementById("ukuranPanjang").value) || 0;
  const l = parseFloat(document.getElementById("ukuranLebar").value) || 0;
  const qtyBuku = parseInt(document.getElementById("qtyBuku").value) || 0;
  const isiPerBuku = parseInt(document.getElementById("isiPerBuku").value) || 0;

  // Validasi jumlah ply untuk NOTA (sebelumnya rawan NaN karena
  // dropdown boleh kosong tanpa terdeteksi)
  let jumlahPly = 1;
  if (isNota) {
    const plyRaw = document.getElementById("jumlahPly").value;
    if (plyRaw === "") {
      alert("Pilih jumlah rangkap (ply) kertas NCR terlebih dahulu!");
      return;
    }
    jumlahPly = parseInt(plyRaw);
  }

  const jenisFinishing = document.getElementById("jenisFinishing").value;
  if (jenisFinishing === "") {
    alert("Pilih jenis finishing terlebih dahulu!");
    return;
  }

  const adaPorporasi = document.getElementById("tambahPorporasi").checked;
  const adaNumerator = document.getElementById("tambahNumerator").checked;
  const margin =
    parseFloat(document.getElementById("marginKeuntungan").value) || 0;

  // Validasi cover untuk block note
  const materialCover = isBlocknote
    ? document.getElementById("jenisCoverMaterial").value
    : "";
  if (isBlocknote && materialCover === "") {
    alert("Pilih jenis bahan cover terlebih dahulu!");
    return;
  }

  // Validasi Dimensi
  if (p === 0 || l === 0) {
    alert("Masukkan ukuran panjang dan lebar yang valid!");
    return;
  }
  if (qtyBuku === 0 || isiPerBuku === 0) {
    alert("Masukkan jumlah buku dan isi per buku yang valid!");
    return;
  }

  // 1. Hitung Daya Muat (Yield) di Plano Folio (21.5 x 33 cm)
  let yieldFolio = hitungYield(21.5, 33, p, l);
  if (yieldFolio < 1) {
    alert(
      "Ukuran yang Anda masukkan lebih besar dari area cetak kertas Folio (21.5 x 33 cm)!"
    );
    return;
  }

  let htmlBahan = "";
  let htmlFinishing = "";
  let totalHPP = 0;
  let tierWarnings = [];

  // Kebutuhan Lembar Isi (Pcs Kecil)
  const totalSet = qtyBuku * isiPerBuku;
  const lembarFolioPerPly = Math.ceil(totalSet / yieldFolio);
  const rimFolioPerPly = Math.ceil(lembarFolioPerPly / 500) || 1; // Minimal 1 Rim

  // --- BIAYA BAHAN KERTAS & CETAK ISI ---
  if (isBlocknote) {
    let biayaHVS = rimFolioPerPly * DB.kertas_folio.hvs;
    htmlBahan += `<tr><td>Kertas HVS (${rimFolioPerPly} Rim Folio)</td><td>${formatRp(
      biayaHVS
    )}</td></tr>`;
    totalHPP += biayaHVS;

    // --- BIAYA COVER (OPSIONAL, sesuai bahan yang dipilih) ---
    let yieldA3 = hitungYield(32, 48, p, l);
    let totalCoverPcs = qtyBuku * 2;
    let lbrA3 = Math.ceil(totalCoverPcs / yieldA3);
    const coverPriceInfo = getCoverPricePerSheet(materialCover, lbrA3);

    if (coverPriceInfo.outOfRange) {
      tierWarnings.push(
        `Jumlah lembar cover (${lbrA3} lbr) melebihi tier tertinggi yang tersedia. Harga dipakai memakai tier "101-300" sebagai perkiraan sementara — perlu konfirmasi harga resmi untuk kuantitas ini.`
      );
    }

    let biayaBahanCover = lbrA3 * coverPriceInfo.harga;
    const namaMaterial = {
      AP120: "Art Paper 120gr",
      AP150: "Art Paper 150gr",
      AC210: "Art Carton 210gr",
      AC230: "Art Carton 230gr",
      AC260: "Art Carton 260gr",
    }[materialCover];

    htmlBahan += `<tr><td>Bahan Cover ${namaMaterial} (${lbrA3} lbr A3+, tier ${
      coverPriceInfo.tierKey
    })</td><td>${formatRp(biayaBahanCover)}</td></tr>`;
    totalHPP += biayaBahanCover;
  } else {
    let biayaTop = rimFolioPerPly * DB.kertas_folio.ncr_top;
    htmlBahan += `<tr><td>Kertas NCR Top (${rimFolioPerPly} Rim Folio)</td><td>${formatRp(
      biayaTop
    )}</td></tr>`;
    totalHPP += biayaTop;

    if (jumlahPly >= 2) {
      let biayaBot = rimFolioPerPly * DB.kertas_folio.ncr_bot;
      htmlBahan += `<tr><td>Kertas NCR Bottom (${rimFolioPerPly} Rim Folio)</td><td>${formatRp(
        biayaBot
      )}</td></tr>`;
      totalHPP += biayaBot;
    }
    if (jumlahPly >= 3) {
      let qtyMid = jumlahPly - 2;
      let biayaMid = rimFolioPerPly * qtyMid * DB.kertas_folio.ncr_mid;
      htmlBahan += `<tr><td>Kertas NCR Middle (${
        rimFolioPerPly * qtyMid
      } Rim Folio)</td><td>${formatRp(biayaMid)}</td></tr>`;
      totalHPP += biayaMid;
    }
  }

  // Ongkos Cetak Mesin Toko (isi)
  let totalRimMasukMesin = rimFolioPerPly * jumlahPly;
  let biayaPlat = jumlahPly * DB.mesin_toko.plat;
  let biayaOngkos = totalRimMasukMesin * DB.mesin_toko.ongkos;

  htmlBahan += `<tr><td>Plat Master (${jumlahPly} warna/ply)</td><td>${formatRp(
    biayaPlat
  )}</td></tr>`;
  htmlBahan += `<tr><td>Ongkos Cetak (${totalRimMasukMesin} Rim Mesin)</td><td>${formatRp(
    biayaOngkos
  )}</td></tr>`;
  totalHPP += biayaPlat + biayaOngkos;

  // --- BIAYA FINISHING (tabel dipisah sesuai jenis produk) ---
  const finishingTable = isBlocknote
    ? DB.finishing_blocknote
    : DB.finishing_nota;

  let totalRimBuku = Math.ceil((totalSet * jumlahPly) / 500) || 1;

  let biayaJilid = 0;
  let namaJilid = "";
  if (jenisFinishing === "binding") {
    biayaJilid = totalRimBuku * finishingTable.binding;
    namaJilid = "Jilid Lem Punggung" + (isNota ? " (termasuk cover)" : "");
  } else if (jenisFinishing === "staples") {
    biayaJilid = totalRimBuku * finishingTable.staples;
    namaJilid = "Jilid Staples" + (isNota ? " (termasuk cover)" : "");
  } else if (jenisFinishing === "spiral") {
    let lebarTerpendek = Math.min(p, l);
    biayaJilid = totalRimBuku * lebarTerpendek * finishingTable.spiral;
    namaJilid =
      `Jilid Spiral (Lebar ${lebarTerpendek}cm)` +
      (isNota ? " (termasuk cover)" : "");
  }
  htmlFinishing += `<tr><td>${namaJilid}</td><td>${formatRp(
    biayaJilid
  )}</td></tr>`;
  totalHPP += biayaJilid;

  if (adaPorporasi) {
    let biayaPorporasi = totalRimBuku * finishingTable.porporasi;
    htmlFinishing += `<tr><td>Porporasi Sobekan</td><td>${formatRp(
      biayaPorporasi
    )}</td></tr>`;
    totalHPP += biayaPorporasi;
  }
  if (adaNumerator) {
    let biayaNum = totalRimBuku * finishingTable.numerator;
    htmlFinishing += `<tr><td>Numerator Angka</td><td>${formatRp(
      biayaNum
    )}</td></tr>`;
    totalHPP += biayaNum;
  }

  // --- RENDER WARNING BOXES ---
  let dummyMsg = "";
  if (isBlocknote) {
    dummyMsg =
      "Harga finishing Block Note di tabel ini masih DUMMY (harga contoh dari developer), belum harga asli. Ganti di variabel <code>DB.finishing_blocknote</code> sebelum dipakai ke pelanggan.";
  } else if (isNota && IS_FINISHING_NOTA_DUMMY) {
    dummyMsg =
      "Harga finishing Nota (yang sudah termasuk cover bundled) BELUM PERNAH DIISI dengan angka asli — ini masih dummy sementara. Ganti di variabel <code>DB.finishing_nota</code> sebelum dipakai ke pelanggan.";
  }
  if (dummyMsg) {
    document.getElementById(
      "dummyWarningBox"
    ).innerHTML = `<div class="alert-dummy"><i class="fas fa-triangle-exclamation me-1"></i> ${dummyMsg}</div>`;
  }

  if (tierWarnings.length > 0) {
    document.getElementById("tierWarningBox").innerHTML = tierWarnings
      .map(
        (w) =>
          `<div class="alert-dummy"><i class="fas fa-triangle-exclamation me-1"></i> ${w}</div>`
      )
      .join("");
  }

  // --- RENDER TOTAL ---
  document.getElementById("rincianBahan").innerHTML = htmlBahan;
  document.getElementById("rincianFinishing").innerHTML = htmlFinishing;

  let hppPerBuku = totalHPP / qtyBuku;
  let nominalMargin = totalHPP * (margin / 100);
  let hargaJualTotal = totalHPP + nominalMargin;
  let hargaJualPerBuku = hargaJualTotal / qtyBuku;

  document.getElementById("totalHPP").innerText = formatRp(totalHPP);
  document.getElementById("hppPerBuku").innerText = formatRp(hppPerBuku);
  document.getElementById("badgeMargin").innerText = margin + "%";
  document.getElementById("nominalMargin").innerText =
    "+ " + formatRp(nominalMargin);
  document.getElementById("hargaJualTotal").innerText =
    formatRp(hargaJualTotal);
  document.getElementById("hargaJualPerBuku").innerText =
    formatRp(hargaJualPerBuku);

  document.getElementById("resultCard").style.display = "block";
}

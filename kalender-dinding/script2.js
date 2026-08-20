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

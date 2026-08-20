// =============================================
// FORMAT CURRENCY & HELPERS
// =============================================
function formatCurrency(number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

// =============================================
// DATA TABLES
// =============================================

// Ukuran plano per mesin
const ukuranPlano = {
  "Digital Printing": "A3+ (32x48 cm)",
  "SM-52": "Speedmaster-52 (65x100 cm)",
  "SM-74": "Speedmaster-74 (79x109 cm)",
};

// Pembagian plano ISI buku (halaman per sisi plano) — disamakan dengan buku
// pcs = hasil bagi per set (jumlah brosur per plano)
// Untuk brosur: 1 plano = N lembar brosur (2 muka sudah include)
const pembagianPlano = {
  "32x48": { small: 1, sm52: 4, sm74: 4 }, // A3+ = Digital/Offset small=1, SM-52=4
  "21x29.7": { small: 2, sm52: 8, sm74: 10 }, // A4: Digital/Offset small=2, SM-52=8
  "14.8x21": { small: 4, sm52: 16, sm74: 25 }, // A5: Digital/Offset small=4, SM-52=16
};

// Ukuran laminasi per mesin (diambil dari buku)
const ukuranLaminasi = {
  "Offset-52": { panjang: 33, lebar: 43 },
  "SM-52": { panjang: 32.5, lebar: 50 },
};

// Harga kertas digital per plano (disesuaikan dengan harga digital buku)
const hargaPlanoDigital = {
  HVS70: { "1-50": 3600, "51-100": 3600, "101-300": 3500 },
  HVS80: { "1-50": 3700, "51-100": 3700, "101-300": 3600 },
  HVS100: { "1-50": 3800, "51-100": 3800, "101-300": 3700 },
  AP120: { "1-50": 3900, "51-100": 3900, "101-300": 3800 },
  AP150: { "1-50": 4000, "51-100": 4000, "101-300": 3900 },
  AC210: { "1-50": 4100, "51-100": 4100, "101-300": 4000 },
  AC230: { "1-50": 4200, "51-100": 4200, "101-300": 4100 },
  AC260: { "1-50": 4300, "51-100": 4300, "101-300": 4200 },
};

// Harga kertas per rim (500 lbr) Offset-52 — disamakan dengan harga Double Folio buku
const hargaKertasOffset52 = {
  HVS70: 93000,
  HVS80: 95000,
  HVS100: 97000,
  AP120: 130000,
  AP150: 160000,
  AC210: 310000,
  AC230: 330000,
  AC260: 350000,
};

// Harga kertas SM-52 per plano (diambil dari hargaKertasOffset buku)
const hargaKertasSM52 = {
  HVS70: 800,
  HVS80: 1000,
  HVS100: 1150,
  AP120: 1700,
  AP150: 1900,
  AC210: 2300,
  AC230: 2600,
  AC260: 2900,
};

// Harga cetak per set (SM-52 = 4 warna)
const hargaCetakPerSet = {
  "Offset-52": 200000, // per set double folio
  "SM-52": 280000, // per set SM-52
};

// Display names
const jenisKertasText = {
  HVS70: "HVS 70gsm",
  HVS80: "HVS 80gsm",
  HVS100: "HVS 100gsm",
  AP120: "Art Paper 120gsm",
  AP150: "Art Paper 150gsm",
  AC210: "Art Carton 210gsm",
  AC230: "Art Carton 230gsm",
  AC260: "Art Carton 260gsm",
};

const ukuranText = {
  "32x48": "32x48 cm / A3+",
  "21x29.7": "21x29.7 cm / A4",
  "14.8x21": "14.8x21 cm / A5",
};

// =============================================
// REKOMENDASI MESIN (sama logika dengan buku)
// =============================================
function rekomendasiMesin(quantity) {
  if (quantity <= 300) return "Digital Printing";
  if (quantity < 1000) return "Offset-52";
  return "SM-52";
}

// =============================================
// HARGA PLANO DIGITAL
// =============================================
function getHargaPlanoDigital(jenisKertas, quantity) {
  const prices = hargaPlanoDigital[jenisKertas];
  if (quantity <= 50) return prices["1-50"];
  if (quantity <= 100) return prices["51-100"];
  return prices["101-300"];
}

// =============================================
// FIELDS SPESIFIKASI — untuk enable/disable mesin
// =============================================
const fieldsSpesifikasi = [
  "quantity",
  "ukuran_brosur",
  "jenis_kertas",
  "laminasi",
];

function cekKelengkapanSpesifikasi() {
  const semuaTerisi = fieldsSpesifikasi.every((id) => {
    const el = document.getElementById(id);
    return el && el.value !== "" && el.value !== null;
  });

  const mesinEl = document.getElementById("mesin_cetak");
  mesinEl.disabled = !semuaTerisi;

  if (!semuaTerisi) {
    mesinEl.value = "";
    document.getElementById("saranMesin").textContent = "";
  }
}

function updateSaranMesin() {
  const quantity = parseInt(document.getElementById("quantity").value);
  if (!quantity) return;

  const semuaTerisi = fieldsSpesifikasi.every((id) => {
    const el = document.getElementById(id);
    return el && el.value !== "" && el.value !== null;
  });
  if (!semuaTerisi) return;

  const rekomendasi = rekomendasiMesin(quantity);
  document.getElementById("mesin_cetak").value = rekomendasi;
  document.getElementById(
    "saranMesin"
  ).textContent = `✦ Rekomendasi: ${rekomendasi}`;
}

fieldsSpesifikasi.forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("change", () => {
      cekKelengkapanSpesifikasi();
      updateSaranMesin();
    });
    el.addEventListener("input", () => {
      cekKelengkapanSpesifikasi();
      updateSaranMesin();
    });
  }
});

// =============================================
// MAIN CALCULATION
// =============================================
function hitungBiayaCetak(
  quantity,
  ukuranBrosur,
  jenisKertas,
  laminasi,
  mesinPilihan
) {
  if (
    !quantity ||
    !ukuranBrosur ||
    !jenisKertas ||
    !laminasi ||
    !mesinPilihan
  ) {
    showError("Mohon lengkapi semua data.");
    return null;
  }

  if (quantity < 100 || quantity % 10 !== 0) {
    showError("Jumlah minimal 100 pcs dan harus dalam kelipatan 10.");
    return null;
  }

  const mesin = mesinPilihan;

  // ── Pembagian plano (diambil dari pembagianPlanoIsi buku) ──
  const pbInfo = pembagianPlano[ukuranBrosur];
  let hasilBagiPlano;
  if (mesin === "SM-52") {
    hasilBagiPlano = pbInfo.sm52;
  } else {
    hasilBagiPlano = pbInfo.small; // Digital & Offset-52
  }

  // ── Insheet (sama logika insheet buku untuk offset) ──
  let tambahanInsheet = 0;
  if (mesin !== "Digital Printing" && quantity >= 100) {
    tambahanInsheet = 100; // 4-warna ekuivalen di brosur
  }
  const quantityRounded = quantity + tambahanInsheet;

  // ── Jumlah plano ──
  // Format: totalLembar = ceil(quantityRounded / hasilBagiPlano)
  // Mirip jumlahPlanoIsi di buku = totalLembarIsi * quantityIsiRounded
  // Untuk brosur: jumlahPlano = ceil(quantityRounded / hasilBagiPlano)
  let jumlahPlano = Math.ceil(quantityRounded / hasilBagiPlano);

  // ── Biaya kertas (disamakan format biaya kertas isi buku) ──
  let totalBiayaKertas = 0;
  let hargaPerPlano = 0;
  let jumlahRim = 0;
  let hargaPerRim = 0;

  if (mesin === "Digital Printing") {
    hargaPerPlano = getHargaPlanoDigital(jenisKertas, quantity);
    totalBiayaKertas = jumlahPlano * hargaPerPlano;
  } else if (mesin === "Offset-52") {
    // Per rim (500 lbr), disamakan dengan harga Double Folio buku
    jumlahRim = Math.ceil(jumlahPlano / 500);
    hargaPerRim = hargaKertasOffset52[jenisKertas];
    totalBiayaKertas = jumlahRim * hargaPerRim;
  } else {
    // SM-52: harga per plano (diambil dari hargaKertasOffset buku)
    hargaPerPlano = hargaKertasSM52[jenisKertas];
    totalBiayaKertas = jumlahPlano * hargaPerPlano;
  }

  // ── Set cetak & biaya cetak ──
  // Brosur = 1 set (sudah 2 muka termasuk dalam harga cetak/plano)
  let jumlahSet = 1;
  let totalBiayaCetak = 0;
  if (mesin === "Offset-52" || mesin === "SM-52") {
    totalBiayaCetak = jumlahSet * hargaCetakPerSet[mesin];
  }

  // ── Overprint (quantity > 1000) ──
  let totalBiayaOverprint = 0;
  if (quantity > 1000) {
    const jumlahOverprint = quantity - 1000 + 100;
    totalBiayaOverprint = jumlahOverprint * 80;
  }

  // ── Pond ──
  let biayaPond = 0;
  if (mesin === "SM-52" || mesin === "Offset-52") {
    const ribuanLembar = Math.ceil(quantity / 1000);
    biayaPond = ribuanLembar * 50000;
  }

  // ── Potong ──
  let biayaPotong = 0;
  if (ukuranBrosur === "32x48") {
    biayaPotong = 0; // A3+ tidak dipotong
  } else if (quantity <= 1000) {
    biayaPotong = 10000;
  } else {
    const additionalBatches = Math.ceil((quantity - 1000) / 500);
    biayaPotong = 10000 + additionalBatches * 5000;
  }

  // ── Laminasi (diambil dari formula laminasi cover buku) ──
  let totalBiayaLaminasi = 0;
  if (laminasi !== "Tidak Ada") {
    if (mesin === "Digital Printing") {
      // Digital: per plano (mirip jumlahPlanoCover * 1500 di buku)
      totalBiayaLaminasi = jumlahPlano * 1500;
    } else {
      // Offset: dimensi plano x rate x quantity
      const ukuran = ukuranLaminasi[mesin];
      const rate = laminasi === "Doff" ? 0.22 : 0.15;
      const hitung = ukuran.panjang * ukuran.lebar * rate * quantity;
      totalBiayaLaminasi = hitung > 80000 ? hitung : 80000;
    }
  }

  // ── HPP (subtotal sebelum margin) ──
  const hpp =
    totalBiayaKertas +
    totalBiayaOverprint +
    totalBiayaCetak +
    biayaPond +
    biayaPotong +
    totalBiayaLaminasi;

  // ── Margin (disamakan dengan margin buku) ──
  let margin;
  if (quantity <= 100) {
    margin = 1.0;
  } else if (quantity <= 1000) {
    margin = 0.65;
  } else if (quantity <= 5000) {
    margin = 0.45;
  } else {
    margin = 0.3;
  }

  // ── Total biaya jual ──
  const totalBiaya = hpp * (1 + margin) + 50000 / quantity;
  const hargaPerPcs = totalBiaya / quantity;
  const hppPerPcs = hpp / quantity;

  return {
    mesin,
    ukuran_plano: ukuranPlano[mesin],
    quantity,
    ukuran_brosur: ukuranBrosur,
    jenis_kertas: jenisKertas,
    laminasi,
    hasil_bagi_plano: hasilBagiPlano,
    tambahan_insheet: tambahanInsheet,
    quantity_rounded: quantityRounded,
    jumlah_plano: jumlahPlano,
    jumlah_rim: jumlahRim,
    harga_per_plano: hargaPerPlano,
    harga_per_rim: hargaPerRim,
    total_biaya_kertas: totalBiayaKertas,
    total_biaya_overprint: totalBiayaOverprint,
    total_biaya_cetak: totalBiayaCetak,
    biaya_pond: biayaPond,
    biaya_potong: biayaPotong,
    total_biaya_laminasi: totalBiayaLaminasi,
    hpp,
    hpp_per_pcs: hppPerPcs,
    margin,
    total_biaya: totalBiaya,
    harga_per_pcs: hargaPerPcs,
  };
}

// =============================================
// DISPLAY RESULTS
// =============================================
function displayResults(hasil) {
  document.getElementById("errorAlert").style.display = "none";
  document.getElementById("resultCard").style.display = "block";

  // Machine badge
  const mesinBadge = document.getElementById("mesinBadge");
  mesinBadge.textContent = hasil.mesin;
  if (hasil.mesin === "SM-52") {
    mesinBadge.className = "badge badge-sm52";
  } else if (hasil.mesin === "Offset-52") {
    mesinBadge.className = "badge badge-offset";
  } else {
    mesinBadge.className = "badge badge-digital";
  }

  document.getElementById(
    "planoInfo"
  ).textContent = `Plano: ${hasil.ukuran_plano} · ${hasil.hasil_bagi_plano} pcs/set`;

  // Summary rows
  document.getElementById("jumlahCetak").textContent = `${formatCurrency(
    hasil.quantity
  )} pcs`;

  document.getElementById("bahan").textContent = `${
    jenisKertasText[hasil.jenis_kertas]
  }, uk. ${ukuranText[hasil.ukuran_brosur]}`;

  const finishingRow = document.getElementById("finishingRow");
  if (hasil.laminasi !== "Tidak Ada") {
    finishingRow.style.display = "";
    document.getElementById(
      "laminasiInfo"
    ).textContent = `Laminasi ${hasil.laminasi}`;
  } else {
    finishingRow.style.display = "none";
  }

  // ── Breakdown rows ──
  // const breakdownRows = document.getElementById("breakdownRows");
  // const items = [{ label: "Biaya Kertas", value: hasil.total_biaya_kertas }];
  // if (hasil.total_biaya_cetak > 0) {
  //   items.push({ label: "Biaya Cetak", value: hasil.total_biaya_cetak });
  // }
  // if (hasil.total_biaya_overprint > 0) {
  //   items.push({ label: "Overprint", value: hasil.total_biaya_overprint });
  // }
  // if (hasil.biaya_pond > 0) {
  //   items.push({ label: "Pond/Lipat", value: hasil.biaya_pond });
  // }
  // if (hasil.biaya_potong > 0) {
  //   items.push({ label: "Potong", value: hasil.biaya_potong });
  // }
  // if (hasil.total_biaya_laminasi > 0) {
  //   items.push({
  //     label: `Laminasi ${hasil.laminasi}`,
  //     value: hasil.total_biaya_laminasi,
  //   });
  // }
  // items.push({ label: "HPP / pcs", value: hasil.hpp_per_pcs, note: true });

  // breakdownRows.innerHTML = items
  //   .map(
  //     (item) => `
  //   <div class="breakdown-row ${item.note ? "fw-bold" : ""}">
  //     <span class="bd-label">${item.label}</span>
  //     <span class="bd-value">Rp ${formatCurrency(item.value)}</span>
  //   </div>
  // `
  //   )
  //   .join("");

  // Totals
  // document.getElementById("nilaiHPP").textContent = `Rp ${formatCurrency(
  //   hasil.hpp
  // )} (margin ${Math.round(hasil.margin * 100)}%)`;
  document.getElementById("totalBiaya").textContent = `Rp ${formatCurrency(
    hasil.total_biaya
  )}`;
  document.getElementById("hargaSatuan").textContent = `Rp ${formatCurrency(
    hasil.harga_per_pcs
  )} / pcs`;

  // Console breakdown
  showBreakdown(hasil);
}

// =============================================
// CONSOLE BREAKDOWN
// =============================================
function showBreakdown(hasil) {
  console.log("========= BREAKDOWN BROSUR =========");
  console.log(`Mesin: ${hasil.mesin} || Ukuran Plano: ${hasil.ukuran_plano}`);
  console.log(
    `Quantity: ${hasil.quantity} | Insheet: +${hasil.tambahan_insheet} → ${hasil.quantity_rounded}`
  );
  console.log(`Hasil Bagi Plano: ${hasil.hasil_bagi_plano} pcs/set`);
  console.log(`Jumlah Plano: ${hasil.jumlah_plano}`);
  console.log("====================================");
  console.log(`Biaya Kertas: Rp ${formatCurrency(hasil.total_biaya_kertas)}`);
  console.log(`Biaya Cetak: Rp ${formatCurrency(hasil.total_biaya_cetak)}`);
  console.log(`Biaya Pond: Rp ${formatCurrency(hasil.biaya_pond)}`);
  console.log(`Biaya Potong: Rp ${formatCurrency(hasil.biaya_potong)}`);
  console.log(`Laminasi: Rp ${formatCurrency(hasil.total_biaya_laminasi)}`);
  console.log("====================================");
  console.log(
    `HPP: Rp ${formatCurrency(hasil.hpp)} | HPP/pcs: Rp ${formatCurrency(
      hasil.hpp_per_pcs
    )}`
  );
  console.log(`Margin: ${hasil.margin * 100}%`);
  console.log(
    `Total Jual: Rp ${formatCurrency(
      hasil.total_biaya
    )} | Harga/pcs: Rp ${formatCurrency(hasil.harga_per_pcs)}`
  );
  console.log("====================================");
}

// =============================================
// ERROR & RESET
// =============================================
function showError(message) {
  const errorAlert = document.getElementById("errorAlert");
  errorAlert.textContent = message;
  errorAlert.style.display = "block";
  document.getElementById("resultCard").style.display = "none";
}

function resetForm() {
  document.getElementById("calculatorForm").reset();
  document.getElementById("resultCard").style.display = "none";
  document.getElementById("errorAlert").style.display = "none";
  document.getElementById("mesin_cetak").value = "";
  document.getElementById("mesin_cetak").disabled = true;
  document.getElementById("saranMesin").textContent = "";
}

// =============================================
// FORM EVENTS
// =============================================
document.getElementById("quantity").addEventListener("input", function () {
  const value = parseInt(this.value);
  if (value < 100 || value % 10 !== 0) {
    this.classList.add("is-invalid");
  } else {
    this.classList.remove("is-invalid");
  }
});

document
  .getElementById("calculatorForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const quantity = parseInt(document.getElementById("quantity").value);
    const ukuranBrosur = document.getElementById("ukuran_brosur").value;
    const jenisKertas = document.getElementById("jenis_kertas").value;
    const laminasi = document.getElementById("laminasi").value;
    const mesinPilihan = document.getElementById("mesin_cetak").value;

    const hasil = hitungBiayaCetak(
      quantity,
      ukuranBrosur,
      jenisKertas,
      laminasi,
      mesinPilihan
    );
    if (hasil) displayResults(hasil);
  });

document.getElementById("resetBtn").addEventListener("click", resetForm);
window.addEventListener("load", resetForm);

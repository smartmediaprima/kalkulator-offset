// Format currency to IDR
function formatCurrency(number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

// Format number with 2 decimal places
function formatDecimal(number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

// Ukuran plano untuk masing-masing mesin
const ukuranPlano = {
  "Digital Printing": "A3+ (32x48 cm)",
  "Offset-52": "Double Folio (33x43 cm)",
  "SM-52": "Double Folio (33x43 cm)",
};

// Plano division rates for each machine and size
// Format: ukuran: jumlah_pcs (jumlah_set)
const pembagianPlano = {
  "32x48": { pcs: 1, set: 2 },
  "21x29.7": { pcs: 2, set: 1 },
  "14.8x21": { pcs: 4, set: 1 },
};

// Harga kertas per plano untuk mesin Digital
const hargaPlanoDigital = {
  HVS70: { "1-50": 3100, "51-100": 3100, "101-300": 3000 },
  HVS80: { "1-50": 3200, "51-100": 3200, "101-300": 3100 },
  HVS100: { "1-50": 3300, "51-100": 3300, "101-300": 3200 },
  AP120: { "1-50": 3400, "51-100": 3400, "101-300": 3300 },
  AP150: { "1-50": 3500, "51-100": 3500, "101-300": 3400 },
  AC210: { "1-50": 3600, "51-100": 3600, "101-300": 3500 },
  AC230: { "1-50": 3700, "51-100": 3700, "101-300": 3600 },
  AC260: { "1-50": 3800, "51-100": 3800, "101-300": 3700 },
};

// Harga kertas per rim untuk mesin Offset-52 dan SM-52 (500 lembar per rim)
const hargaKertasPerRim = {
  HVS70: 130000,
  HVS80: 140000,
  HVS100: 150000,
  AP120: 160000,
  AP150: 165000,
  AC210: 175000,
  AC230: 180000,
  AC260: 190000,
};

// Harga print per set
const hargaPrintPerSet = {
  "Offset-52": 200000,
  "SM-52": 280000,
};

// Size dimensions for lamination calculation (in cm)
const ukuranLaminasi = {
  "32x48": { panjang: 32, lebar: 48 },
  "21x29.7": { panjang: 21, lebar: 29.7 },
  "14.8x21": { panjang: 14.8, lebar: 21 },
};

// Paper type display names
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

// Size display names
const ukuranText = {
  "32x48": "32x48 cm / A3+",
  "21x29.7": "21x29.7 cm / A4",
  "14.8x21": "14.8x21 cm / A5",
};

// Function to get plano price based on machine and paper type
function getHargaPlano(mesin, jenisKertas, quantity) {
  if (mesin === "Digital Printing") {
    const hargaMap = hargaPlanoDigital;
    const prices = hargaMap[jenisKertas];

    // Tentukan harga berdasarkan quantity
    if (quantity <= 50) {
      return prices["1-50"];
    } else if (quantity <= 100) {
      return prices["51-100"];
    } else {
      return prices["101-300"];
    }
  }
  // Untuk Offset-52 dan SM-52 tidak menggunakan harga plano lagi
  return 0;
}

// Main calculation function
function hitungBiayaCetak(quantity, ukuranBrosur, jenisKertas, laminasi) {
  // Validate inputs
  if (!quantity || !ukuranBrosur || !jenisKertas || !laminasi) {
    showError("Mohon lengkapi semua data.");
    return null;
  }

  if (quantity < 100 || quantity % 50 !== 0) {
    showError("Jumlah minimal 100 pcs dan harus dalam kelipatan 50.");
    return null;
  }

  // Fixed 2 muka untuk semua brosur
  const jumlahMuka = 2;

  // Determine machine based on quantity
  let mesin = "";
  if (quantity <= 300) {
    mesin = "Digital Printing";
  } else if (quantity < 1000) {
    mesin = "Offset-52";
  } else {
    mesin = "SM-52";
  }

  // Calculate paper amount (jumlah plano yang dibutuhkan)
  const pembagianInfo = pembagianPlano[ukuranBrosur];
  const hasilBagiPlano = pembagianInfo.pcs;
  const jumlahSet = pembagianInfo.set;

  // Digital tidak perlu insheet tambahan, Offset dan SM-52 perlu tambahan 100
  let jumlahPlano;
  if (mesin === "Digital Printing") {
    jumlahPlano = Math.ceil(quantity / hasilBagiPlano);
  } else {
    jumlahPlano = Math.ceil((quantity + 100) / hasilBagiPlano);
  }

  // Calculate paper cost based on machine type
  let hargaPerPlano = 0;
  let totalBiayaKertas = 0;
  let jumlahRim = 0;
  let hargaPerRim = 0;

  if (mesin === "Digital Printing") {
    // Digital menggunakan harga per plano
    hargaPerPlano = getHargaPlano(mesin, jenisKertas, quantity);
    totalBiayaKertas = jumlahPlano * hargaPerPlano;
  } else {
    // Offset-52 dan SM-52 menggunakan harga per rim
    jumlahRim = Math.ceil(jumlahPlano / 500); // 1 rim = 500 lembar, dibulatkan keatas
    hargaPerRim = hargaKertasPerRim[jenisKertas];
    totalBiayaKertas = jumlahRim * hargaPerRim;
  }

  // Calculate overprint cost
  let jumlahOverprint = 0;
  let totalBiayaOverprint = 0;
  if (quantity > 1000) {
    jumlahOverprint = quantity - 1000 + 100;
    totalBiayaOverprint = jumlahOverprint * 80;
  }

  // Calculate printing cost
  let totalBiayaCetak = 0;
  let totalSetCetak = 0;
  if (mesin === "Offset-52" || mesin === "SM-52") {
    // Set cetak langsung dari pembagian plano berdasarkan ukuran
    totalSetCetak = jumlahSet;
    totalBiayaCetak = totalSetCetak * hargaPrintPerSet[mesin];
  }
  // Digital tidak menggunakan biaya cetak

  // Calculate pond cost (50k per 1000 lembar, rounded up)
  let biayaPond = 0;
  if (mesin === "SM-52" || mesin === "Offset-52") {
    const ribuanLembar = Math.ceil(quantity / 1000);
    biayaPond = ribuanLembar * 50000;
  }

  // Calculate potong cost
  let biayaPotong = 0;
  if (quantity <= 1000 && ukuranBrosur != "32x48") {
    biayaPotong = 10000;
  } else {
    const additionalBatches = Math.ceil((quantity - 1000) / 500);
    biayaPotong = 10000 + additionalBatches * 5000;
  }

  // Calculate lamination cost
  let totalBiayaLaminasi = 0;
  if (laminasi !== "none") {
    if (mesin === "SM-52" || mesin === "Offset-52") {
      const rate = laminasi === "doff" ? 0.25 : 0.15;
      const ukuran = ukuranLaminasi[ukuranBrosur];
      totalBiayaLaminasi = ukuran.panjang * ukuran.lebar * rate * quantity;
    } else {
      totalBiayaLaminasi = quantity * 1000;
    }
  }

  // Calculate subtotal
  // Harga plano/rim sudah termasuk 2 muka, jadi tidak perlu multiplier
  // Multiplier jumlah muka hanya berlaku untuk laminasi
  let multiplierMuka = 1;
  if (laminasi !== "none") {
    multiplierMuka = jumlahMuka;
  }

  // Biaya dasar (tanpa laminasi)
  const biayaDasar =
    totalBiayaKertas +
    totalBiayaOverprint +
    totalBiayaCetak +
    biayaPond +
    biayaPotong;

  // Laminasi dikalikan multiplier jika perlu
  const subtotal = biayaDasar + totalBiayaLaminasi * multiplierMuka;

  let margin;
  if (quantity <= 300) {
    margin = 0.35;
  } else if (quantity < 1000) {
    margin = 0.43;
  } else {
    margin = 0.38;
  }

  // Calculate total cost (subtotal + 35% margin)
  const totalBiaya = subtotal * (1 + margin) + 50000 / quantity;

  // Calculate price per piece
  const hargaPerPcs = totalBiaya / quantity;

  // Return calculation results
  return {
    mesin: mesin,
    ukuran_plano: ukuranPlano[mesin],
    quantity: quantity,
    ukuran_brosur: ukuranBrosur,
    jenis_kertas: jenisKertas,
    laminasi: laminasi,
    jumlah_muka: jumlahMuka,
    jumlah_plano: jumlahPlano,
    hasil_bagi_plano: hasilBagiPlano,
    jumlah_set: jumlahSet,
    total_set_cetak: totalSetCetak,
    jumlah_rim: jumlahRim,
    harga_per_plano: hargaPerPlano,
    harga_per_rim: hargaPerRim,
    total_biaya_kertas: totalBiayaKertas,
    jumlah_overprint: jumlahOverprint,
    total_biaya_overprint: totalBiayaOverprint,
    total_biaya_cetak: totalBiayaCetak,
    biaya_pond: biayaPond,
    biaya_potong: biayaPotong,
    total_biaya_laminasi: totalBiayaLaminasi,
    subtotal: subtotal,
    total_biaya: totalBiaya,
    harga_per_pcs: hargaPerPcs,
  };
}

// Form reset function
function resetForm() {
  document.getElementById("calculatorForm").reset();
  document.getElementById("resultCard").style.display = "none";
  document.getElementById("errorAlert").style.display = "none";
}

// Show error message
function showError(message) {
  const errorAlert = document.getElementById("errorAlert");
  errorAlert.textContent = message;
  errorAlert.style.display = "block";
  document.getElementById("resultCard").style.display = "none";
}

// Validate quantity input
document.getElementById("quantity").addEventListener("input", function () {
  const value = parseInt(this.value);
  if (value < 100 || value % 50 !== 0) {
    this.classList.add("is-invalid");
  } else {
    this.classList.remove("is-invalid");
  }
});

// Display calculation results
function displayResults(hasil) {
  // Hide error alert if visible
  document.getElementById("errorAlert").style.display = "none";

  // Display result card
  document.getElementById("resultCard").style.display = "block";

  // Set machine badge and combine with quantity info
  // Set machine badge
  const mesinBadge = document.getElementById("mesinBadge");
  mesinBadge.textContent = hasil.mesin;

  if (hasil.mesin === "SM-52") {
    mesinBadge.className = "badge bg-primary badge-sm52";
  } else if (hasil.mesin === "Offset-52") {
    mesinBadge.className = "badge bg-warning badge-offset52";
  } else if (hasil.mesin === "Digital Printing") {
    mesinBadge.className = "badge bg-success badge-digital";
  }

  // Set jumlah cetak dengan format: quantity (hasil_bagi_plano lembar / set)
  document.getElementById("jumlahCetak").textContent = `${formatCurrency(
    hasil.quantity
  )} pcs (${hasil.hasil_bagi_plano} lembar / set)`;

  // Set material info with size
  document.getElementById("bahan").textContent = `${
    jenisKertasText[hasil.jenis_kertas]
  }, uk. ${ukuranText[hasil.ukuran_brosur]}`;

  // Display laminasi only if exists
  const laminasiRow = document.getElementById("laminasiRow");
  if (hasil.laminasi !== "none") {
    laminasiRow.style.display = "";
    document.getElementById("laminasiInfo").textContent = hasil.laminasi;
  } else {
    laminasiRow.style.display = "none";
  }

  // Set cost details
  document.getElementById("totalBiaya").textContent = `Rp ${formatCurrency(
    hasil.total_biaya
  )}`;
  document.getElementById("hargaSatuan").textContent = `Rp ${formatCurrency(
    hasil.harga_per_pcs
  )}`;
}

// Handle form submission
document
  .getElementById("calculatorForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    // Get form values
    const quantity = parseInt(document.getElementById("quantity").value);
    const ukuranBrosur = document.getElementById("ukuran_brosur").value;
    const jenisKertas = document.getElementById("jenis_kertas").value;
    const laminasi = document.getElementById("laminasi").value;

    // Calculate cost
    const hasil = hitungBiayaCetak(
      quantity,
      ukuranBrosur,
      jenisKertas,
      laminasi
    );

    if (hasil) {
      // Display results
      displayResults(hasil);
    }
  });

// Reset button handler
document.getElementById("resetBtn").addEventListener("click", resetForm);

// Reset the form when the page loads/refreshes
window.addEventListener("load", resetForm);

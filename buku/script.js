// Format currency to IDR
function formatCurrency(number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

// Ukuran plano untuk masing-masing mesin
const ukuranPlano = {
  "Digital Printing": "A3+ (32x48 cm)",
  "Ryobi-52": "Double Folio (33x43 cm)",
  "Speedmaster-52": "Speedmaster-52 (65x100 cm)",
  "Speedmaster-74": "Speedmaster-74 (79x109 cm)",
  PhotoCopy: "F4 (21.5x33 cm)", // tambah
};

// Plano division rates for each machine and size
// Untuk ISI: small = Digital/Ryobi-52, large = Speedmaster-52 (halaman per sisi plano)
const pembagianPlanoIsi = {
  "21x29.7": { small: 2, sm52: 8, sm74: 8, photocopy: 2 },
  "17.6x25": { small: 2, sm52: 8, sm74: 16, photocopy: 2 },
  "14.8x21": { small: 4, sm52: 16, sm74: 16, photocopy: 4 },
  "10.5x14.8": { small: 8, sm52: 32, sm74: 40, photocopy: 8 },
};

// Untuk COVER (lebar 2x lipat dari isi)
const pembagianPlanoCover = {
  "21x29.7": { small: 1, sm52: 4, sm74: 4 },
  "17.6x25": { small: 1, sm52: 4, sm74: 8 },
  "14.8x21": { small: 2, sm52: 8, sm74: 8 },
  "10.5x14.8": { small: 4, sm52: 16, sm74: 20 },
};

// Harga kertas per plano untuk mesin Digital - COVER
const hargaPlanoDigitalCover = {
  // HVS70: { "1-50": 1900, "51-100": 1800, "101-300": 1700 },
  // HVS80: { "1-50": 2000, "51-100": 1900, "101-300": 1800 },
  // HVS100: { "1-50": 2100, "51-100": 2000, "101-300": 1900 },
  AP120: { "1-50": 2500, "51-100": 2400, "101-300": 2300 },
  AP150: { "1-50": 2600, "51-100": 2500, "101-300": 2400 },
  AC210: { "1-50": 2700, "51-100": 2600, "101-300": 2500 },
  AC230: { "1-50": 2800, "51-100": 2700, "101-300": 2600 },
  AC260: { "1-50": 2900, "51-100": 2800, "101-300": 2700 },
};

// Harga kertas per plano untuk mesin Digital - ISI
const hargaPlanoDigitalIsi = {
  HVS60: { "1-50": 3500, "51-100": 3500, "101-300": 3400 },
  HVS70: { "1-50": 3600, "51-100": 3600, "101-300": 3500 },
  HVS80: { "1-50": 3700, "51-100": 3700, "101-300": 3600 },
  HVS100: { "1-50": 3800, "51-100": 3800, "101-300": 3700 },
  AP120: { "1-50": 3900, "51-100": 3900, "101-300": 3800 },
  AP150: { "1-50": 4000, "51-100": 4000, "101-300": 3900 },
  // AC210: { "1-50": 3700, "51-100": 3700, "101-300": 3600 },
  // AC230: { "1-50": 3800, "51-100": 3800, "101-300": 3700 },
  // AC260: { "1-50": 3900, "51-100": 3900, "101-300": 3800 },
};

// Harga kertas Double Folio untuk mesin Ryobi-52
const hargaKertasDoubleFolio = {
  HVS60: 91000,
  HVS70: 93000,
  HVS80: 95000,
  HVS100: 97000,
  AP120: 130000,
  AP150: 160000,
  AC210: 310000,
  AC230: 330000,
  AC260: 350000,
};

// Harga kertas Fotokopi:
const hargaKertasPhotocopy = {
  "1warna": { HVS60: 80, HVS70: 200, HVS80: 320, HVS100: 440 },
  "2warna": { HVS60: 80, HVS70: 200, HVS80: 320, HVS100: 440 },
  "4warna": { HVS60: 100, HVS70: 250, HVS80: 400, HVS100: 550 },
};

// Harga kertas SM-52 per plano
const hargaKertasOffset = {
  "SM-52": {
    HVS60: 600,
    HVS70: 800,
    HVS80: 1000,
    HVS100: 1150,
    AP120: 1700,
    AP150: 1900,
    AC210: 2300,
    AC230: 2600,
    AC260: 2900,
  },
  "SM-74": {
    HVS60: 770,
    HVS70: 900,
    HVS80: 1050,
    HVS100: 1200,
    AP120: 2300,
    AP150: 2000,
    AC210: 4200,
    AC230: 4450,
    AC260: 4700,
  },
};

// Harga print per set
const hargaCetakPerSet = {
  "Ryobi-52": {
    "1warna": 35000,
    "2warna": 60000,
  },
  "SM-52": {
    "1warna": 35000,
    "2warna": 60000,
    "4warna": 280000,
  },
  "SM-74": {
    "1warna": 120000,
    "2warna": 200000,
    "4warna": 420000,
  },
};

// Harga plat (hanya untuk isi, cover sudah include di cetak)
const hargaPlatIsi = {
  "Ryobi-52": 14500,
  // "SM-52": 16000,
};

// Size dimensions for lamination calculation
const ukuranLaminasi = {
  "Ryobi-52": {
    panjang: 33,
    lebar: 43,
  },
  "SM-52": {
    panjang: 32.5,
    lebar: 50,
  },
  "SM-74": {
    panjang: 39.5,
    lebar: 54.5,
  },
};

// Harga jilid
const hargaJilid = {
  Binding: 2000,
  // Staples: 1000, // 1k dibawah 100
  Spiral: 3000,
};

// Paper type display names
const jenisKertasText = {
  HVS60: "HVS 60gsm",
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
  "21x29.7": "21x29.7 cm / A4",
  "17.6x25": "17.6x25 cm / B5",
  "14.8x21": "14.8x21 cm / A5",
  "10.5x14.8": "10.5x14.8 cm / A6",
};

// Jenis cetak display names
const jenisCetakText = {
  "1warna": "1 Warna (B/W)",
  "2warna": "2 Warna",
  "4warna": "4 Warna (CMYK)",
};

// Function to get plano price
function getHargaPlano(mesin, jenisKertas, quantity, isCover = false) {
  if (mesin === "Digital Printing") {
    const prices = isCover
      ? hargaPlanoDigitalCover[jenisKertas]
      : hargaPlanoDigitalIsi[jenisKertas];
    if (quantity <= 50) return prices["1-50"];
    else if (quantity <= 100) return prices["51-100"];
    else return prices["101-300"];
  }
  return 0;
}

// Tambah map rekomendasi mesin offset per ukuran:
const rekomendasiMesinOffset = {
  "21x29.7": "SM-52", // sama, pilih lebih murah
  "17.6x25": "SM-74", // SM-74 lebih efektif (16 vs 8)
  "14.8x21": "SM-52", // sama, pilih lebih murah
  "10.5x14.8": "SM-74", // SM-74 lebih efektif (40 vs 32)
};

function isKertasHVS(jenisIsi) {
  return ["HVS60", "HVS70", "HVS80", "HVS100"].includes(jenisIsi);
}

// === FUNGSI SARAN MESIN OTOMATIS ===
function tentukanMesinOtomatis(quantity, jenisCetakIsi, ukuranBuku, jenisIsi) {
  let mesinCover, mesinIsi;
  const mesinOffsetRekomendasi = rekomendasiMesinOffset[ukuranBuku] || "SM-52";
  if (quantity <= 50) {
    mesinCover = "Digital Printing";
    // Jika bukan HVS, skip PhotoCopy → fallback ke Digital atau Ryobi
    if (!isKertasHVS(jenisIsi)) {
      mesinIsi = jenisCetakIsi === "4warna" ? "Digital Printing" : "Ryobi-52";
    } else {
      mesinIsi = "PhotoCopy";
    }
  } else if (quantity <= 300) {
    mesinCover = "Digital Printing";
    mesinIsi = jenisCetakIsi === "4warna" ? "Digital Printing" : "Ryobi-52";
  } else if (quantity <= 500) {
    // mesinCover = "SM-52";
    // mesinIsi = jenisCetakIsi === "4warna" ? "SM-52" : "Ryobi-52";
    mesinCover = mesinOffsetRekomendasi;
    mesinIsi = jenisCetakIsi === "4warna" ? mesinOffsetRekomendasi : "Ryobi-52";
  } else {
    mesinCover = "SM-74";
    mesinIsi = "SM-74";
  }
  // Override ke SM-52 jika ukuran B5, terlepas dari quantity
  // if (ukuranBuku === "17.6x25") {
  //   mesinCover = "SM-74";
  //   mesinIsi = "SM-74";
  // }
  return { mesinCover, mesinIsi };
}

// Field yang harus terisi sebelum mesin bisa dipilih
const fieldsSpesifikasi = [
  "quantity_exp",
  "ukuran_buku",
  "jenis_cover",
  "muka_cover",
  "tipe_cover",
  "laminasi",
  "jenis_isi",
  "jenis_cetak_isi",
  "quantity_isi",
];

function cekKelengkapanSpesifikasi() {
  const semuaTerisi = fieldsSpesifikasi.every((id) => {
    const el = document.getElementById(id);
    return el && el.value !== "" && el.value !== null;
  });

  const mesinCoverEl = document.getElementById("mesin_cover");
  const mesinIsiEl = document.getElementById("mesin_isi");

  mesinCoverEl.disabled = !semuaTerisi;
  mesinIsiEl.disabled = !semuaTerisi;

  // Jika belum lengkap, reset pilihan mesin dan label saran
  if (!semuaTerisi) {
    mesinCoverEl.value = "";
    mesinIsiEl.value = "";
    document.getElementById("saranMesinCover").textContent = "";
    document.getElementById("saranMesinIsi").textContent = "";
  }
}

// Pasang listener ke semua field spesifikasi
fieldsSpesifikasi.forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("change", cekKelengkapanSpesifikasi);
    el.addEventListener("input", cekKelengkapanSpesifikasi);
  }
});

function updateSaranMesin() {
  const quantity = parseInt(document.getElementById("quantity_exp").value);
  const jenisCetakIsi = document.getElementById("jenis_cetak_isi").value;
  const ukuranBuku = document.getElementById("ukuran_buku").value;
  const jenisIsi = document.getElementById("jenis_isi").value;

  if (!quantity || !jenisCetakIsi || !ukuranBuku || !jenisIsi) return;

  // Pastikan field lain sudah terisi sebelum update saran
  const semuaTerisi = fieldsSpesifikasi.every((id) => {
    const el = document.getElementById(id);
    return el && el.value !== "" && el.value !== null;
  });
  if (!semuaTerisi) return;

  const { mesinCover, mesinIsi } = tentukanMesinOtomatis(
    quantity,
    jenisCetakIsi,
    ukuranBuku,
    jenisIsi
  );

  document.getElementById("mesin_cover").value = mesinCover;
  document.getElementById("mesin_isi").value = mesinIsi;
  document.getElementById(
    "saranMesinCover"
  ).textContent = `✦ Rekomendasi: ${mesinCover}`;
  document.getElementById(
    "saranMesinIsi"
  ).textContent = `✦ Rekomendasi: ${mesinIsi}`;
}

document
  .getElementById("quantity_exp")
  .addEventListener("input", updateSaranMesin);
document
  .getElementById("jenis_cetak_isi")
  .addEventListener("change", updateSaranMesin);
document
  .getElementById("ukuran_buku")
  .addEventListener("change", updateSaranMesin);
document
  .getElementById("jenis_isi")
  .addEventListener("change", updateSaranMesin);

// Handle tipe cover change
document.getElementById("tipe_cover").addEventListener("change", function () {
  const jilidSelect = document.getElementById("opsi_jilid");
  if (this.value === "hard_cover") {
    jilidSelect.value = "Spiral";
    jilidSelect.disabled = true;
  } else {
    jilidSelect.disabled = false;
  }
});

// Main calculation function
function hitungBiayaCetak(
  quantity,
  ukuranBuku,
  jenisCover,
  mukaCover,
  jenisIsi,
  laminasi,
  jenisCetakIsi,
  quantityIsi,
  tipeCover,
  jenisJilid,
  jenisKemasan,
  mesinCoverPilihan,
  mesinIsiPilihan
) {
  // Validate inputs
  if (
    !quantity ||
    !ukuranBuku ||
    !jenisCover ||
    !jenisIsi ||
    !laminasi ||
    !jenisCetakIsi ||
    !quantityIsi ||
    !tipeCover ||
    !jenisJilid ||
    !jenisKemasan ||
    !mesinCoverPilihan ||
    !mesinIsiPilihan
  ) {
    showError("Mohon lengkapi semua data.");
    return null;
  }

  // Gunakan pilihan mesin dari user secara langsung
  const mesinCover = mesinCoverPilihan;
  const mesinIsi = mesinIsiPilihan;
  // mesin utama digunakan untuk logika laminasi & margin
  const mesin = mesinIsiPilihan;

  const pembagianInfoIsi = pembagianPlanoIsi[ukuranBuku];
  // hasilBagiPlanoIsi: halaman per sisi plano, tergantung mesin isi
  // const hasilBagiPlanoIsi = mesinIsi === "SM-52" ? pembagianInfoIsi.large : pembagianInfoIsi.small;
  let hasilBagiPlanoIsi;
  if (mesinIsi === "SM-52") {
    hasilBagiPlanoIsi = pembagianInfoIsi.sm52;
  } else if (mesinIsi === "SM-74") {
    hasilBagiPlanoIsi = pembagianInfoIsi.sm74;
  } else if (mesinIsi === "PhotoCopy") {
    hasilBagiPlanoIsi = pembagianInfoIsi.photocopy;
  } else {
    // Digital Printing & Ryobi-52
    hasilBagiPlanoIsi = pembagianInfoIsi.small;
  }

  // Insheet isi: 0 jika Digital atau qty < 100
  // qty >= 100: +50 untuk 1/2 warna, +100 untuk 4 warna
  let tambahanInsheetIsi = 0;
  if (
    mesinIsi !== "Digital Printing" &&
    mesinIsi !== "PhotoCopy" &&
    quantity >= 100
  ) {
    tambahanInsheetIsi = jenisCetakIsi === "4warna" ? 100 : 50;
  }
  const quantityIsiRounded = quantity + tambahanInsheetIsi;

  // Insheet cover: 0 jika Digital atau qty < 100
  // qty >= 100: +100 jika offset
  let tambahanInsheetCover = 0;
  if (mesinCover !== "Digital Printing" && quantity >= 100) {
    tambahanInsheetCover = 100;
  }
  const quantityCoverRounded = quantity + tambahanInsheetCover;

  const pembagianInfoCover = pembagianPlanoCover[ukuranBuku];
  // Tentukan hasil bagi plano cover berdasarkan mesin cover
  // const hasilBagiPlanoCover = Math.floor(hasilBagiPlanoIsi / 2);
  let hasilBagiPlanoCover = 0;
  if (mesinCover === "SM-74") {
    hasilBagiPlanoCover = pembagianInfoCover.sm74;
  } else if (mesinCover === "SM-52") {
    hasilBagiPlanoCover = pembagianInfoCover.sm52;
  } else {
    hasilBagiPlanoCover = pembagianInfoCover.small;
  }

  // Hard cover: bagi 2, kecuali A4 (21x29.7) dan B5 (17.6x25) tetap
  const ukuranUndivided = ["21x29.7", "17.6x25"];
  if (tipeCover === "hard_cover" && !ukuranUndivided.includes(ukuranBuku)) {
    hasilBagiPlanoCover = Math.max(1, Math.floor(hasilBagiPlanoCover / 2));
  }

  // Set ambil dari parameter fungsi
  const jumlahSetCover = mukaCover === 1 ? 1 : 2;
  // const jumlahSetCover = 1; // Cover selalu 1 set

  let jumlahPlanoCover = Math.ceil(quantityCoverRounded / hasilBagiPlanoCover);

  // === HITUNG BIAYA KERTAS COVER ===
  let totalBiayaKertasCover = 0;
  if (mesinCover === "Digital Printing") {
    const hargaPerPlano = getHargaPlano(mesinCover, jenisCover, quantity, true);
    totalBiayaKertasCover = jumlahSetCover * jumlahPlanoCover * hargaPerPlano;
  } else if (mesinCover === "SM-52" || mesinCover === "SM-74") {
    const hargaPerPlano = hargaKertasOffset[mesinCover][jenisCover];
    totalBiayaKertasCover = jumlahPlanoCover * hargaPerPlano;
  } else {
    // Ryobi-52
    const jumlahRimCover = Math.ceil(jumlahPlanoCover / 500);
    const hargaPerRim = hargaKertasDoubleFolio[jenisCover];
    totalBiayaKertasCover = jumlahRimCover * hargaPerRim;
  }

  // === HITUNG BIAYA KERTAS ISI ===
  // totalLembarIsi: dibulatkan ke kelipatan 0.5 terdekat ke atas
  let totalLembarIsi;
  if (mesinIsi === "PhotoCopy") {
    totalLembarIsi = Math.ceil(quantityIsi / hasilBagiPlanoIsi);
  } else {
    totalLembarIsi = Math.ceil((quantityIsi / (hasilBagiPlanoIsi * 2)) * 2) / 2;
  }

  // jumlahSet ditentukan dari jenis cetak isi
  // const jumlahSet = jenisCetakIsi === "4warna" ? 4 : 2;
  let jumlahSetIsi = 0;
  if (mesinIsi === "Ryobi-52") {
    jumlahSetIsi = Math.ceil(totalLembarIsi * 2);
  } else if (mesinIsi === "SM-52" || mesinIsi === "SM-74") {
    jumlahSetIsi = Math.ceil(quantityIsi / 4);
  }

  let jumlahPlanoIsi;
  if (mesinIsi === "PhotoCopy") {
    jumlahPlanoIsi = totalLembarIsi * quantity; // tanpa insheet
  } else {
    jumlahPlanoIsi = totalLembarIsi * quantityIsiRounded;
  }

  let totalBiayaKertasIsi = 0;
  if (mesinIsi === "Digital Printing") {
    const hargaPerPlano = getHargaPlano(mesinIsi, jenisIsi, quantity, false);
    totalBiayaKertasIsi = jumlahPlanoIsi * hargaPerPlano;
  } else if (mesinIsi === "SM-52" || mesinIsi === "SM-74") {
    const hargaPerPlano = hargaKertasOffset[mesinIsi][jenisIsi];
    totalBiayaKertasIsi = jumlahPlanoIsi * hargaPerPlano;
  } else if (mesinIsi === "PhotoCopy") {
    // biaya = total lembar isi x harga kertas per lembar x quantity
    totalBiayaKertasIsi =
      jumlahPlanoIsi * hargaKertasPhotocopy[jenisCetakIsi][jenisIsi];
  } else {
    // Ryobi-52
    const jumlahRimIsi = Math.ceil(jumlahPlanoIsi / 500);
    const hargaPerRim = hargaKertasDoubleFolio[jenisIsi];
    totalBiayaKertasIsi = jumlahRimIsi * hargaPerRim;
  }

  // Total biaya kertas
  const totalBiayaKertas = totalBiayaKertasCover + totalBiayaKertasIsi;

  // === BIAYA OVERPRINT ===
  let jumlahOverprint = 0;
  let totalBiayaOverprint = 0;
  if (quantity > 1000) {
    jumlahOverprint = quantity - 1000;
    totalBiayaOverprint = jumlahOverprint * 100 * jumlahSetIsi;
  }

  // === BIAYA PLAT ===
  // Rumus: hasilBagiPlanoIsi x jumlahSet x hargaPlatIsi
  let biayaPlatIsi = 0;
  // if (mesinIsi !== "Digital Printing") {
  if (mesinIsi === "Ryobi-52") {
    // biayaPlatIsi = totalLembarIsi * jumlahSet * hargaPlatIsi[mesinIsiPilihan];
    biayaPlatIsi = jumlahSetIsi * hargaPlatIsi[mesinIsiPilihan];
    // } else {
    //   // biayaPlatIsi = hasilBagiPlanoIsi * jumlahSet * hargaPlatIsi[mesinIsiPilihan];
    //   const jumlahWarna =
    //     jenisCetakIsi === "4warna" ? 4 : jenisCetakIsi === "2warna" ? 2 : 1;
    //   biayaPlatIsi = jumlahWarna * jumlahSetIsi * hargaPlatIsi[mesinIsiPilihan];
    // }
  }

  // === BIAYA CETAK ===
  let biayaCetakCover = 0;
  let biayaCetakIsi = 0;

  // CETAK COVER - hanya jika bukan Digital
  if (mesinCover !== "Digital Printing") {
    biayaCetakCover = jumlahSetCover * hargaCetakPerSet[mesinCover]["4warna"];
  }

  // CETAK ISI - rumus: totalLembarIsi x hargaCetakPerSet
  if (mesinIsi !== "Digital Printing" && mesinIsi !== "PhotoCopy") {
    if (mesinIsi === "SM-52" || mesinIsi === "SM-74") {
      // biayaCetakIsi = pembagianPlanoIsi * hargaCetakPerSet["SM-52"][jenisCetakIsi];
      biayaCetakIsi = jumlahSetIsi * hargaCetakPerSet[mesinIsi][jenisCetakIsi];
    } else {
      // Ryobi-52
      // biayaCetakIsi = totalLembarIsi * jumlahSet * hargaCetakPerSet["Ryobi-52"][jenisCetakIsi];
      biayaCetakIsi =
        jumlahSetIsi * hargaCetakPerSet["Ryobi-52"][jenisCetakIsi];
    }
  }

  const totalBiayaCetak = biayaCetakCover + biayaCetakIsi;

  // === BIAYA LAMINASI ===
  let totalBiayaLaminasi = 0;
  if (laminasi !== "Tidak Ada") {
    if (mesinCover === "Digital Printing") {
      totalBiayaLaminasi = jumlahPlanoCover * 1500;
    } else {
      const ukuran = ukuranLaminasi[mesinCover];
      const rate = laminasi === "Doff" ? 0.22 : 0.15;
      const hitungLaminasi = ukuran.panjang * ukuran.lebar * rate * quantity;
      totalBiayaLaminasi = hitungLaminasi > 80000 ? hitungLaminasi : 80000;
    }
  }

  // === BIAYA JILID ===
  let totalBiayaJilid = 0;
  if (tipeCover === "hard_cover") {
    totalBiayaJilid = quantity * 12000;
  } else if (jenisJilid === "Binding") {
    const hitungBinding = quantity * hargaJilid[jenisJilid];
    totalBiayaJilid = hitungBinding > 100000 ? hitungBinding : 100000;
  } else if (jenisJilid === "Staples") {
    const hargaStaples = quantity <= 100 ? 1000 : 500;
    totalBiayaJilid = quantity * hargaStaples;
  } else {
    totalBiayaJilid = quantity * hargaJilid[jenisJilid];
  }

  // === BIAYA KEMASAN ===
  let biayaKemasan = 0;
  if (jenisKemasan === "Plastik") {
    biayaKemasan = quantity * 300;
  } else if (jenisKemasan === "Shrink") {
    biayaKemasan = quantity * 1000;
  }

  // === SUBTOTAL ===
  const subtotal =
    totalBiayaKertas +
    totalBiayaOverprint +
    biayaPlatIsi +
    totalBiayaCetak +
    totalBiayaLaminasi +
    totalBiayaJilid +
    biayaKemasan;

  // === MARGIN : flat 30% ===
  // const margin = 0;
  if (quantity <= 100) {
    margin = 1;
  } else if (quantity <= 1000) {
    margin = 0.65;
  } else if (quantity <= 5000) {
    margin = 0.45;
  } else {
    margin = 0.3;
  }

  const totalBiaya = subtotal * (1 + margin) + 50000 / quantity;
  const hargaPerPcs = totalBiaya / quantity;

  return {
    mesin_cover: mesinCover,
    mesin_isi: mesinIsi,
    quantity: quantity,
    ukuran_buku: ukuranBuku,
    jenis_cover: jenisCover,
    muka_cover: mukaCover,
    jumlah_set_cover: jumlahSetCover,
    jenis_isi: jenisIsi,
    laminasi: laminasi,
    tipe_cover: tipeCover,
    jenis_jilid: jenisJilid,
    jenis_kemasan: jenisKemasan,
    jenis_cetak_isi: jenisCetakIsi,
    quantity_isi: quantityIsi,
    quantity_isi_rounded: quantityIsiRounded,
    tambahan_insheet_cover: tambahanInsheetCover,
    tambahan_insheet_isi: tambahanInsheetIsi,
    total_lembar_isi: totalLembarIsi,
    jumlah_set_isi: jumlahSetIsi,
    hasil_bagi_plano_isi: hasilBagiPlanoIsi,
    hasil_bagi_plano_cover: hasilBagiPlanoCover,
    jumlah_plano_cover: jumlahPlanoCover,
    jumlah_plano_isi: jumlahPlanoIsi,
    total_biaya_kertas_cover: totalBiayaKertasCover,
    total_biaya_kertas_isi: totalBiayaKertasIsi,
    total_biaya_kertas: totalBiayaKertas,
    total_biaya_overprint: totalBiayaOverprint,
    biaya_plat_isi: biayaPlatIsi,
    biaya_cetak_cover: biayaCetakCover,
    biaya_cetak_isi: biayaCetakIsi,
    total_biaya_cetak: totalBiayaCetak,
    total_biaya_laminasi: totalBiayaLaminasi,
    biaya_jilid: totalBiayaJilid,
    biaya_kemasan: biayaKemasan,
    total_hpp: subtotal,
    hpp: subtotal / quantity,
    margin: margin,
    total_biaya: totalBiaya,
    harga_per_pcs: hargaPerPcs,
  };
}

// Debug function to show detailed breakdown
function showBreakdown(hasil) {
  console.log("===== BREAKDOWN PERHITUNGAN =====");
  console.log(
    `Mesin Cover: ${hasil.mesin_cover} || Mesin Isi: ${hasil.mesin_isi}`
  );
  console.log(
    `Quantity: ${hasil.quantity} eks || Ukuran: ${
      ukuranText[hasil.ukuran_buku]
    }`
  );
  console.log(
    `Insheet Cover: +${hasil.tambahan_insheet_cover} → ${
      hasil.quantity + hasil.tambahan_insheet_cover
    } lembar (${
      hasil.tambahan_insheet_cover === 0
        ? "Digital atau qty < 100"
        : "offset, qty >= 100"
    })`
  );
  console.log(
    `Insheet Isi: +${hasil.tambahan_insheet_isi} → ${
      hasil.quantity_isi_rounded
    } lembar (${
      hasil.tambahan_insheet_isi === 0
        ? "Digital atau qty < 100"
        : hasil.jenis_cetak_isi === "4warna"
        ? "4 warna +100"
        : "1/2 warna +50"
    })`
  );
  console.log(
    `Hasil Bagi Plano Isi: ${hasil.hasil_bagi_plano_isi} hal/sisi plano`
  );
  console.log(
    `Hasil Bagi Plano Cover: ${hasil.hasil_bagi_plano_cover} pcs/plano`
  );
  console.log("");
  console.log("--- COVER ---");
  console.log(`Jenis: ${jenisKertasText[hasil.jenis_cover]}`);
  console.log(
    `Cetak Cover: ${hasil.muka_cover} muka (${hasil.jumlah_set_cover} set)`
  );
  console.log(`Jumlah Plano Cover: ${hasil.jumlah_plano_cover}`);
  console.log(
    `Biaya Kertas Cover: Rp ${formatCurrency(hasil.total_biaya_kertas_cover)}`
  );
  console.log("");
  console.log("--- ISI ---");
  console.log(`Jenis: ${jenisKertasText[hasil.jenis_isi]}`);
  console.log(`Jenis Cetak: ${jenisCetakText[hasil.jenis_cetak_isi]}`);
  console.log(`Jumlah Halaman: ${hasil.quantity_isi} hal`);
  console.log(`Total Lembar Isi: ${hasil.total_lembar_isi} lembar`);
  console.log(
    `Jumlah Set Isi (${hasil.mesin_isi}): ${hasil.jumlah_set_isi} set`
  );
  console.log(`Jumlah Plano Isi: ${hasil.jumlah_plano_isi}`);
  console.log(
    `Biaya Kertas Isi: Rp ${formatCurrency(hasil.total_biaya_kertas_isi)}`
  );
  console.log("");
  console.log("--- BIAYA LAINNYA ---");
  console.log(
    `Overprint: Rp ${formatCurrency(
      hasil.total_biaya_overprint
    )} || Plat Isi: Rp ${formatCurrency(hasil.biaya_plat_isi)}`
  );
  console.log(
    `Cetak Cover (${hasil.mesin_cover}): Rp ${formatCurrency(
      hasil.biaya_cetak_cover
    )}`
  );
  console.log(
    `Cetak Isi (${hasil.mesin_isi}): Rp ${formatCurrency(
      hasil.biaya_cetak_isi
    )}`
  );
  console.log(
    `Laminasi: Rp ${formatCurrency(
      hasil.total_biaya_laminasi
    )} || Jilid: Rp ${formatCurrency(hasil.biaya_jilid)}`
  );
  console.log(`Kemasan: Rp ${formatCurrency(hasil.biaya_kemasan)}`);
  console.log("");
  console.log("--- TOTAL ---");
  console.log(
    `Total HPP: Rp ${formatCurrency(
      hasil.total_hpp
    )} || HPP: Rp ${formatCurrency(hasil.hpp)}`
  );
  console.log(`Margin: ${hasil.margin * 100}%`);
  console.log(
    `Total Biaya: Rp ${formatCurrency(
      hasil.total_biaya
    )} || Harga/pcs: Rp ${formatCurrency(hasil.harga_per_pcs)}`
  );
  console.log("====================================");
}

// Display results
function displayResults(hasil) {
  document.getElementById("errorAlert").style.display = "none";
  document.getElementById("resultCard").style.display = "block";

  document.getElementById("jumlahCetakExp").textContent = `${formatCurrency(
    hasil.quantity
  )} eksemplar, ${hasil.quantity_isi} halaman`;

  document.getElementById("coverInfo").textContent = `${
    jenisKertasText[hasil.jenis_cover]
  }`;

  document.getElementById("isiInfo").textContent = `${
    jenisKertasText[hasil.jenis_isi]
  }`;

  const finishingRow = document.getElementById("finishingRow");
  let finishingItems = [];

  const tipeCoverText =
    hasil.tipe_cover === "hard_cover" ? "Hard Cover" : "Soft Cover";
  finishingItems.push(`${tipeCoverText} - ${hasil.jenis_jilid}`);

  if (hasil.laminasi !== "Tidak Ada") {
    finishingItems.push(`Laminasi ${hasil.laminasi}`);
  }

  if (hasil.jenis_kemasan !== "Tidak Ada") {
    finishingItems.push(`Kemasan ${hasil.jenis_kemasan}`);
  }

  finishingRow.style.display = "";
  document.getElementById("finishingInfo").textContent =
    finishingItems.join(", ");

  document.getElementById("totalBiaya").textContent = `Rp ${formatCurrency(
    hasil.total_biaya
  )}`;
  document.getElementById("hargaSatuan").textContent = `Rp ${formatCurrency(
    hasil.harga_per_pcs
  )}`;
}

// Show error
function showError(message) {
  const errorAlert = document.getElementById("errorAlert");
  errorAlert.textContent = message;
  errorAlert.style.display = "block";
  document.getElementById("resultCard").style.display = "none";
}

// Form reset
function resetForm() {
  document.getElementById("calculatorForm").reset();
  document.getElementById("resultCard").style.display = "none";
  document.getElementById("errorAlert").style.display = "none";
  document.getElementById("opsi_jilid").disabled = false;
  document.getElementById("mesin_cover").value = "";
  document.getElementById("mesin_isi").value = "";
  document.getElementById("saranMesinCover").textContent = "";
  document.getElementById("saranMesinIsi").textContent = "";
  document.getElementById("mesin_cover").disabled = true;
  document.getElementById("mesin_isi").disabled = true;
}

// Form submit
document
  .getElementById("calculatorForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const quantity = parseInt(document.getElementById("quantity_exp").value);
    const ukuranBuku = document.getElementById("ukuran_buku").value;
    const jenisCover = document.getElementById("jenis_cover").value;
    const mukaCover = parseInt(document.getElementById("muka_cover").value);
    const jenisIsi = document.getElementById("jenis_isi").value;
    const laminasi = document.getElementById("laminasi").value;
    const jenisCetakIsi = document.getElementById("jenis_cetak_isi").value;
    const quantityIsi =
      parseInt(document.getElementById("quantity_isi").value) || 0;
    const tipeCover = document.getElementById("tipe_cover").value;
    const jenisJilid = document.getElementById("opsi_jilid").value;
    const jenisKemasan = document.getElementById("opsi_kemasan").value;
    const mesinCoverPilihan = document.getElementById("mesin_cover").value;
    const mesinIsiPilihan = document.getElementById("mesin_isi").value;

    const hasil = hitungBiayaCetak(
      quantity,
      ukuranBuku,
      jenisCover,
      mukaCover,
      jenisIsi,
      laminasi,
      jenisCetakIsi,
      quantityIsi,
      tipeCover,
      jenisJilid,
      jenisKemasan,
      mesinCoverPilihan,
      mesinIsiPilihan
    );

    if (hasil) {
      displayResults(hasil);
      showBreakdown(hasil);
    }
  });

// Reset button
document.getElementById("resetBtn").addEventListener("click", resetForm);

// Reset on page load
window.addEventListener("load", resetForm);

// tambahkan opsi uk. 61x86. ukuran itu dan 79x109, 65x100 bisa dipakai di mesin sm52 dan sm74
// kertas 61x86 jumlah kertas dihitung per rim, mirip rumus kertas double folio
// hitungan jumlahsetisi tidak flat dibagi 4 bagian
// kertas 61x86 terbagi menjadi 2 bagian, 65x100 dan 79x109 terbagi menjadi 4 bagian
// kertas plano yg dipilih berdasarkan jml pembagian plano yg didapat dan area yg terbuang paling sedikit
// hapus opsi cetak cover 1 atau 2 muka, sementara cover flat 1 muka
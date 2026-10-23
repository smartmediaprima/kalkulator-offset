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
  "SM-52": "Speedmaster-52",
  "SM-74": "Speedmaster-74",
  PhotoCopy: "F4 (21.5x33 cm)",
};

// Dimensi ukuran buku dalam cm (portrait)
const dimensiBuku = {
  "21x29.7": { w: 21, h: 29.7 },
  "17.6x25": { w: 17.6, h: 25 },
  "14.8x21": { w: 14.8, h: 21 },
  "10.5x14.8": { w: 10.5, h: 14.8 },
};

// Dimensi kertas plano offset tersedia
const dimensiKertasOffset = {
  "61x86": { w: 61, h: 86 },
  "65x100": { w: 65, h: 100 },
  "79x109": { w: 79, h: 109 },
};

// Set per ukuran kertas offset (untuk jumlahSetIsi)
const setPerKertasOffset = {
  "SM-52": 2,
  "SM-74": 4,
};

// Plano division rates — small = Digital/Ryobi-52
const pembagianPlanoIsi = {
  "21x29.7": { small: 2, photocopy: 1 },
  "17.6x25": { small: 2, photocopy: 1 },
  "14.8x21": { small: 4, photocopy: 2 },
  "10.5x14.8": { small: 8, photocopy: 4 },
};

const pembagianPlanoCover = {
  "21x29.7": { small: 1 },
  "17.6x25": { small: 1 },
  "14.8x21": { small: 2 },
  "10.5x14.8": { small: 4 },
};

const hargaPlanoDigitalIsi = {
  "1muka": {
    HVS60: { "1-50": 1800, "51-100": 1700, "101-300": 1600 },
    HVS70: { "1-50": 1900, "51-100": 1800, "101-300": 1700 },
    HVS80: { "1-50": 2000, "51-100": 1900, "101-300": 1800 },
    HVS100: { "1-50": 2100, "51-100": 2000, "101-300": 1900 },
    AP120: { "1-50": 2200, "51-100": 2100, "101-300": 2000 },
    AP150: { "1-50": 2300, "51-100": 2200, "101-300": 2100 },
    AC210: { "1-50": 2400, "51-100": 2300, "101-300": 2200 },
    AC230: { "1-50": 2500, "51-100": 2400, "101-300": 2300 },
    AC260: { "1-50": 2600, "51-100": 2500, "101-300": 2400 },
    AC310: { "1-50": 2800, "51-100": 2700, "101-300": 2600 },
  },
  "2muka": {
    HVS60: { "1-50": 3100, "51-100": 3100, "101-300": 3000 },
    HVS70: { "1-50": 3200, "51-100": 3200, "101-300": 3100 },
    HVS80: { "1-50": 3300, "51-100": 3300, "101-300": 3200 },
    HVS100: { "1-50": 3400, "51-100": 3400, "101-300": 3300 },
    AP120: { "1-50": 3500, "51-100": 3500, "101-300": 3400 },
    AP150: { "1-50": 3600, "51-100": 3600, "101-300": 3500 },
    AC210: { "1-50": 3700, "51-100": 3700, "101-300": 3600 },
    AC230: { "1-50": 3800, "51-100": 3800, "101-300": 3700 },
    AC260: { "1-50": 3900, "51-100": 3900, "101-300": 3800 },
    AC310: { "1-50": 4100, "51-100": 4100, "101-300": 4000 },
  },
};

// Harga kertas Double Folio - Ryobi-52 (per rim)
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
  AC310: 380000,
};

const hargaKertasPhotocopy = {
  "1warna": { HVS60: 200, HVS70: 350, HVS80: 500, HVS100: 650 },
  "2warna": { HVS60: 200, HVS70: 350, HVS80: 500, HVS100: 650 },
  "4warna": { HVS60: 500, HVS70: 600, HVS80: 700, HVS100: 800 },
};

const hargaKertasOffset = {
  "61x86": {
    HVS60: 550,
    HVS70: 800,
    HVS80: 950,
    HVS100: 1050,
    AP120: 1300,
    AP150: 1500,
    AC210: 2200,
    AC230: 2500,
    AC260: 2700,
    AC310: 3100,
  },
  "65x100": {
    HVS60: 750,
    HVS70: 900,
    HVS80: 1000,
    HVS100: 1200,
    AP120: 1600,
    AP150: 1900,
    AC210: 3000,
    AC230: 3200,
    AC260: 3300,
    AC310: 4200,
  },
  "79x109": {
    HVS60: 950,
    HVS70: 1200,
    HVS80: 1300,
    HVS100: 1400,
    AP120: 2200,
    AP150: 2500,
    AC210: 3100,
    AC230: 3400,
    AC260: 3600,
    AC310: 4500,
  },
};

// Harga cetak per set
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

// Hanya Ryobi-52
const hargaPlatIsi = 14500;

const ukuranLaminasi = {
  "double-folio": { panjang: 33, lebar: 43 },
  "61x86": { panjang: 31, lebar: 43 },
  "65x100": { panjang: 32.5, lebar: 50 },
  "79x109": { panjang: 39.5, lebar: 54.5 },
};

// Harga jilid
const hargaJilid = {
  Binding: 2000,
  Spiral: 3000,
  // Staples dihitung dinamis
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
  AC310: "Art Carton 310gsm",
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

// =============================================
// FUNGSI PEMILIHAN KERTAS PLANO TERBAIK
// =============================================
function hitungPcsPerPlano(bukuW, bukuH, planoW, planoH) {
  const fitNormal = Math.floor(planoW / bukuW) * Math.floor(planoH / bukuH);
  const fitRotated = Math.floor(planoW / bukuH) * Math.floor(planoH / bukuW);
  const pcs = Math.max(fitNormal, fitRotated);
  return Math.floor(pcs / 4) * 4; // bulatkan ke kelipatan 4
}

function hitungAreaTerbuang(bukuW, bukuH, planoW, planoH, pcs) {
  return planoW * planoH - pcs * bukuW * bukuH;
}

function pilihKertasPlanoTerbaik(ukuranBuku, orientasi) {
  const dim = dimensiBuku[ukuranBuku];
  const bukuW = orientasi === "landscape" ? dim.h : dim.w;
  const bukuH = orientasi === "landscape" ? dim.w : dim.h;

  let terbaik = null;
  for (const [namaKertas, dimPlano] of Object.entries(dimensiKertasOffset)) {
    const pcs = hitungPcsPerPlano(bukuW, bukuH, dimPlano.w, dimPlano.h);
    if (pcs === 0) continue;
    const areaTerbuang = hitungAreaTerbuang(bukuW, bukuH, dimPlano.w, dimPlano.h, pcs);
    if (
      terbaik === null ||
      pcs > terbaik.pcs ||
      (pcs === terbaik.pcs && areaTerbuang < terbaik.areaTerbuang)
    ) {
      terbaik = { namaKertas, pcs, areaTerbuang };
    }
  }
  return terbaik;
}

// =============================================
// FUNGSI GET HARGA PLANO DIGITAL
// =============================================
function getHargaPlano(mesin, jenisKertas, quantity, jumlahMuka = "2muka") {
  if (mesin === "Digital Printing") {
    const prices = hargaPlanoDigitalIsi[jumlahMuka][jenisKertas];
    if (!prices) return 0;
    if (quantity <= 50) return prices["1-50"];
    if (quantity <= 100) return prices["51-100"];
    return prices["101-300"];
  }
  return 0;
}

function isKertasHVS(jenisIsi) {
  return ["HVS60", "HVS70", "HVS80", "HVS100"].includes(jenisIsi);
}

// =============================================
// SARAN MESIN OTOMATIS
// =============================================
function tentukanMesinOtomatis(quantity, jenisCetakIsi, ukuranBuku, jenisIsi) {
  let mesinCover, mesinIsi;

  if (quantity <= 50) {
    mesinCover = "Digital Printing";
    mesinIsi = isKertasHVS(jenisIsi)
      ? "PhotoCopy"
      : jenisCetakIsi === "4warna"
      ? "Digital Printing"
      : "Ryobi-52";
  } else if (quantity <= 300) {
    mesinCover = "Digital Printing";
    mesinIsi = jenisCetakIsi === "4warna" ? "Digital Printing" : "Ryobi-52";
  } else if (quantity <= 500) {
    mesinCover = "SM-52";
    mesinIsi = "SM-52";
  } else {
    mesinCover = "SM-74";
    mesinIsi = "SM-74";
  }

  // Override ke SM-74 jika ukuran B5, terlepas dari quantity
  if (ukuranBuku === "17.6x25" && quantity > 300) {
    mesinCover = "SM-74";
    mesinIsi = "SM-74";
  }
  return { mesinCover, mesinIsi };
}

// =============================================
// CEK KELENGKAPAN SPESIFIKASI
// =============================================
const fieldsSpesifikasi = [
  "quantity_exp",
  "ukuran_buku",
  "orientasi_buku",
  "jenis_cover",
  "jumlah_muka_cover",
  "tipe_cover",
  "laminasi",
  "jenis_isi",
  "quantity_isi",
  "jenis_cetak_isi",
  "jumlah_muka_isi",
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

  if (!semuaTerisi) {
    mesinCoverEl.value = "";
    mesinIsiEl.value = "";
    document.getElementById("saranMesinCover").textContent = "";
    document.getElementById("saranMesinIsi").textContent = "";
  }
}

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
  document.getElementById("saranMesinCover").textContent = `✦ Rekomendasi: ${mesinCover}`;
  document.getElementById("saranMesinIsi").textContent = `✦ Rekomendasi: ${mesinIsi}`;
}

document.getElementById("quantity_exp").addEventListener("input", updateSaranMesin);
document.getElementById("jenis_cetak_isi").addEventListener("change", updateSaranMesin);
document.getElementById("ukuran_buku").addEventListener("change", updateSaranMesin);
document.getElementById("jenis_isi").addEventListener("change", updateSaranMesin);

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

// =============================================
// FUNGSI UTAMA PERHITUNGAN
// =============================================
function hitungBiayaCetak(
  quantity,
  ukuranBuku,
  orientasi,
  jenisCover,
  jumlahMukaCover,
  jenisIsi,
  laminasi,
  jenisCetakIsi,
  quantityIsi,
  tipeCover,
  jenisJilid,
  jenisKemasan,
  mesinCoverPilihan,
  mesinIsiPilihan,
  jumlahMukaIsi
) {
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
    !mesinIsiPilihan ||
    !orientasi
  ) {
    showError("Mohon lengkapi semua data.");
    return null;
  }

  // Validasi PhotoCopy hanya HVS
  if (mesinIsiPilihan === "PhotoCopy" && !isKertasHVS(jenisIsi)) {
    showError("Mesin PhotoCopy hanya support kertas HVS. Silakan pilih mesin lain.");
    return null;
  }

  const mesinCover = mesinCoverPilihan;
  const mesinIsi = mesinIsiPilihan;

  const pembagianInfoIsi = pembagianPlanoIsi[ukuranBuku];
  const pembagianInfoCover = pembagianPlanoCover[ukuranBuku];

  // === PILIH KERTAS PLANO TERBAIK (hanya SM) ===
  let kertasPlanoPilihan = null;
  if (mesinIsi === "SM-52" || mesinIsi === "SM-74") {
    kertasPlanoPilihan = pilihKertasPlanoTerbaik(ukuranBuku, orientasi);
    if (!kertasPlanoPilihan) {
      showError("Tidak ada kertas plano yang cocok untuk ukuran buku ini.");
      return null;
    }
  }

  // === HASIL BAGI PLANO ISI ===
  let hasilBagiPlanoIsi;
  if (mesinIsi === "SM-52" || mesinIsi === "SM-74") {
    hasilBagiPlanoIsi = kertasPlanoPilihan.pcs;
  } else if (mesinIsi === "PhotoCopy") {
    hasilBagiPlanoIsi = pembagianInfoIsi.photocopy;
  } else {
    hasilBagiPlanoIsi = pembagianInfoIsi.small;
  }

  // === HASIL BAGI PLANO COVER ===
  let hasilBagiPlanoCover;
  if (mesinCover === "SM-52" || mesinCover === "SM-74") {
    const kertasCover = pilihKertasPlanoTerbaik(ukuranBuku, orientasi);
    hasilBagiPlanoCover = Math.max(1, Math.floor(kertasCover.pcs / 2));
  } else {
    hasilBagiPlanoCover = pembagianInfoCover.small;
  }

  // Hard cover: bagi 2, kecuali A5 dan B5
  const ukuranUndivided = ["14.8x21", "17.6x25"];
  if (tipeCover === "hard_cover" && !ukuranUndivided.includes(ukuranBuku)) {
    hasilBagiPlanoCover = Math.max(1, Math.floor(hasilBagiPlanoCover / 2));
  }

  // === JUMLAH SET COVER — flat 1 ===
  const jumlahSetCover = 1;

  // === INSHEET ===
  let tambahanInsheetIsi = 0;
  if (mesinIsi !== "Digital Printing" && mesinIsi !== "PhotoCopy" && quantity >= 100) {
    tambahanInsheetIsi = jenisCetakIsi === "4warna" ? 100 : 50;
  }
  const quantityIsiRounded = quantity + tambahanInsheetIsi;

  let tambahanInsheetCover = 0;
  if (mesinCover !== "Digital Printing" && quantity >= 100) {
    tambahanInsheetCover = 100;
  }
  const quantityCoverRounded = quantity + tambahanInsheetCover;

  // === JUMLAH PLANO COVER ===
  const jumlahPlanoCover = Math.ceil(quantityCoverRounded / hasilBagiPlanoCover);

  // === BIAYA KERTAS COVER ===
  let totalBiayaKertasCover = 0;
  let hargaPerPlanoCover = 0;
  let hargaPerPlanoIsi = 0;
  let hargaPerRimIsi = 0;
  let jumlahRimIsi = 0;
  let kertasCoverPilihan = null;
  if (mesinCover === "Digital Printing") {
    const mukaCover = jumlahMukaCover === 1 ? "1muka" : "2muka";
    const hargaPerPlano = getHargaPlano(mesinCover, jenisCover, quantity, mukaCover);
    if (!hargaPerPlano) {
      showError(
        `Harga kertas cover ${jenisKertasText[jenisCover]} (${mukaCover}) untuk Digital Printing belum tersedia.`
      );
      return null;
    }
    hargaPerPlanoCover = hargaPerPlano;
    totalBiayaKertasCover = jumlahPlanoCover * hargaPerPlano;
  } else if (mesinCover === "SM-52" || mesinCover === "SM-74") {
    const kertasCover = pilihKertasPlanoTerbaik(ukuranBuku, orientasi);
    kertasCoverPilihan = kertasCover;
    hargaPerPlanoCover = hargaKertasOffset[kertasCover.namaKertas][jenisCover];
    totalBiayaKertasCover = jumlahPlanoCover * hargaPerPlanoCover;
  } else {
    // Ryobi-52
    const jumlahRimCover = Math.ceil(jumlahPlanoCover / 500);
    totalBiayaKertasCover = jumlahRimCover * hargaKertasDoubleFolio[jenisCover];
  }

  // === TOTAL LEMBAR ISI ===
  let totalLembarIsi;
  if (mesinIsi === "Digital Printing") {
    totalLembarIsi = Math.ceil(quantityIsi / hasilBagiPlanoIsi) / jumlahMukaIsi;
  } else {
    totalLembarIsi =
      Math.ceil((quantityIsi / (hasilBagiPlanoIsi * 2)) * 2) / jumlahMukaIsi;
  }

  // === JUMLAH SET ISI ===
  let jumlahSetIsi = 0;
  if (mesinIsi === "Ryobi-52") {
    jumlahSetIsi = Math.ceil(totalLembarIsi * 2);
  } else if (mesinIsi === "SM-52" || mesinIsi === "SM-74") {
    const setKertas = setPerKertasOffset[mesinIsi];
    jumlahSetIsi = Math.ceil(quantityIsi / setKertas);
    // jumlahSetIsi = Math.ceil(quantityIsi / 4);
  }

  // === JUMLAH PLANO ISI ===
  let jumlahPlanoIsi;
  if (mesinIsi === "PhotoCopy" || mesinIsi === "Digital Printing") {
    jumlahPlanoIsi = totalLembarIsi * quantity;
  } else {
    jumlahPlanoIsi = totalLembarIsi * quantityIsiRounded;
  }

  // === BIAYA KERTAS ISI ===
  let totalBiayaKertasIsi = 0;
  if (mesinIsi === "Digital Printing") {
    const mukaKey = jumlahMukaIsi === 2 ? "2muka" : "1muka";
    const hargaPerPlano = getHargaPlano(mesinIsi, jenisIsi, quantity, mukaKey);
    if (!hargaPerPlano) {
      showError(
        `Harga kertas isi ${jenisKertasText[jenisIsi]} (${mukaKey}) untuk Digital Printing belum tersedia.`
      );
      return null;
    }
    hargaPerPlanoIsi = hargaPerPlano;
    totalBiayaKertasIsi = jumlahPlanoIsi * hargaPerPlano;
  } else if (mesinIsi === "SM-52" || mesinIsi === "SM-74") {
    hargaPerPlanoIsi = hargaKertasOffset[kertasPlanoPilihan.namaKertas][jenisIsi];
    totalBiayaKertasIsi = jumlahPlanoIsi * hargaPerPlanoIsi;
  } else if (mesinIsi === "PhotoCopy") {
    hargaPerPlanoIsi = hargaKertasPhotocopy[jenisCetakIsi][jenisIsi];
    totalBiayaKertasIsi = jumlahPlanoIsi * hargaPerPlanoIsi;
  } else {
    // Ryobi-52
    jumlahRimIsi = Math.ceil(jumlahPlanoIsi / 500);
    hargaPerRimIsi = hargaKertasDoubleFolio[jenisIsi];
    totalBiayaKertasIsi = jumlahRimIsi * hargaPerRimIsi;
  }

  const totalBiayaKertas = totalBiayaKertasCover + totalBiayaKertasIsi;

  // === BIAYA OVERPRINT ===
  let totalBiayaOverprint = 0;
  if (quantity > 1000) {
    totalBiayaOverprint = (quantity - 1000 + 100) * 80;
  }

  // === BIAYA PLAT (hanya Ryobi-52) ===
  let biayaPlatIsi = 0;
  if (mesinIsi === "Ryobi-52") {
    const jumlahWarna = jenisCetakIsi === "2warna" ? 2 : 1;
    biayaPlatIsi = jumlahWarna * jumlahSetIsi * hargaPlatIsi;
  }

  // === BIAYA CETAK ===
  let biayaCetakCover = 0;
  let biayaCetakIsi = 0;

  if (mesinCover !== "Digital Printing") {
    biayaCetakCover = jumlahSetCover * hargaCetakPerSet[mesinCover]["4warna"];
  }

  if (mesinIsi !== "Digital Printing" && mesinIsi !== "PhotoCopy") {
    biayaCetakIsi = jumlahSetIsi * hargaCetakPerSet[mesinIsi][jenisCetakIsi];
  }

  const totalBiayaCetak = biayaCetakCover + biayaCetakIsi;

  // === BIAYA LAMINASI ===
  let totalBiayaLaminasi = 0;
  if (laminasi !== "Tidak Ada") {
    if (mesinCover === "Digital Printing") {
      totalBiayaLaminasi = jumlahPlanoCover * 1500;
    } else {
      const keyPlano =
        mesinCover === "Ryobi-52"
          ? "double-folio"
          : kertasCoverPilihan
          ? kertasCoverPilihan.namaKertas
          : "65x100";
      const ukuran = ukuranLaminasi[keyPlano];
      const rate = laminasi === "Doff" ? 0.25 : 0.15;
      const hitung =
        ukuran.panjang * ukuran.lebar * rate * (quantity + tambahanInsheetCover);
      totalBiayaLaminasi = hitung > 80000 ? hitung : 80000;
    }
  }

  // === BIAYA JILID ===
  let totalBiayaJilid = 0;
  if (tipeCover === "hard_cover") {
    totalBiayaJilid = quantity * 12000;
  } else if (jenisJilid === "Binding") {
    const hitung = quantity * hargaJilid["Binding"];
    totalBiayaJilid = hitung > 100000 ? hitung : 100000;
  } else if (jenisJilid === "Staples") {
    const hargaStaples = quantity <= 100 ? 1000 : 500;
    totalBiayaJilid = quantity * hargaStaples;
  } else {
    totalBiayaJilid = quantity * hargaJilid[jenisJilid];
  }

  // === BIAYA KEMASAN ===
  let biayaKemasan = 0;
  if (jenisKemasan === "Plastik") {
    biayaKemasan = (quantity / 100) * 30000;
  } else if (jenisKemasan === "Shrink") {
    biayaKemasan = quantity * 2000;
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

  // === MARGIN ===
  let margin;
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
    quantity,
    ukuran_buku: ukuranBuku,
    orientasi,
    kertas_plano_cover: kertasCoverPilihan ? kertasCoverPilihan.namaKertas : "-",
    harga_per_plano_cover: hargaPerPlanoCover,
    harga_per_plano_isi: hargaPerPlanoIsi,
    harga_per_rim_isi: hargaPerRimIsi,
    jumlah_rim_isi: jumlahRimIsi,
    kertas_plano_pilihan: kertasPlanoPilihan ? kertasPlanoPilihan.namaKertas : "-",
    pcs_per_plano: kertasPlanoPilihan ? kertasPlanoPilihan.pcs : 0,
    jenis_cover: jenisCover,
    jumlah_set_cover: jumlahSetCover,
    jenis_isi: jenisIsi,
    laminasi,
    tipe_cover: tipeCover,
    jumlah_muka_cover: jumlahMukaCover,
    jenis_jilid: jenisJilid,
    jenis_kemasan: jenisKemasan,
    jenis_cetak_isi: jenisCetakIsi,
    quantity_isi: quantityIsi,
    tambahan_insheet_cover: tambahanInsheetCover,
    tambahan_insheet_isi: tambahanInsheetIsi,
    quantity_isi_rounded: quantityIsiRounded,
    total_lembar_isi: totalLembarIsi,
    jumlah_muka_isi: jumlahMukaIsi,
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
    margin,
    total_biaya: totalBiaya,
    harga_per_pcs: hargaPerPcs,
  };
}

// =============================================
// HELPER TAMPILAN
// =============================================
let lastHasil = null;

const dimensiPlanoMesin = {
  "Digital Printing": { w: 32, h: 48, label: "A3+ (32x48 cm)" },
  "Ryobi-52": { w: 33, h: 43, label: "Double Folio (33x43 cm)" },
  PhotoCopy: { w: 21.5, h: 33, label: "F4 (21.5x33 cm)" },
};

const badgeClassMesin = {
  "Digital Printing": "badge-digital",
  "Ryobi-52": "badge-ryobi",
  "SM-52": "badge-sm52",
  "SM-74": "badge-sm74",
  PhotoCopy: "badge-photocopy",
};

function badgeMesinHtml(mesin) {
  return `<span class="badge ${
    badgeClassMesin[mesin] || "bg-secondary"
  }">${mesin}</span>`;
}

function row(label, value) {
  return `<div class="modal-row"><span>${label}</span><span>${value}</span></div>`;
}

function rowTotal(label, value) {
  return `<div class="modal-row total-row-inner"><span>${label}</span><span>${value}</span></div>`;
}

function rp(n) {
  return `Rp ${formatCurrency(n)}`;
}

// Ambil dimensi plano (cm) + label untuk bagian cover / isi
function infoPlano(hasil, bagian) {
  const mesin = bagian === "cover" ? hasil.mesin_cover : hasil.mesin_isi;
  if (mesin === "SM-52" || mesin === "SM-74") {
    const nama =
      bagian === "cover" ? hasil.kertas_plano_cover : hasil.kertas_plano_pilihan;
    const d = dimensiKertasOffset[nama];
    return { w: d.w, h: d.h, label: `Plano ${nama} cm` };
  }
  return dimensiPlanoMesin[mesin];
}

// =============================================
// SKETSA PLANO (SVG)
// =============================================
function buatSketsaPlano(
  planoW,
  planoH,
  bukuW,
  bukuH,
  pcsDipakai,
  label,
  pengaliLebar = 1
) {
  // Paksa landscape: sisi panjang = lebar gambar
  const W = Math.max(planoW, planoH);
  const H = Math.min(planoW, planoH);

  // Pilih arah potong (normal / diputar) yang muat lebih banyak
  const lebarKotak = bukuW * pengaliLebar;
  const A = { pw: lebarKotak, ph: bukuH };
  const B = { pw: bukuH, ph: lebarKotak };
  const hitung = (o) => ({
    ...o,
    cols: Math.floor(W / o.pw),
    rows: Math.floor(H / o.ph),
  });
  const a = hitung(A);
  const b = hitung(B);
  const pilih = a.cols * a.rows >= b.cols * b.rows ? a : b;
  const { pw, ph, cols, rows } = pilih;
  const totalSel = cols * rows;
  const dipakai = Math.min(pcsDipakai, totalSel);

  // Grid diposisikan di tengah plano
  const offX = (W - cols * pw) / 2;
  const offY = (H - rows * ph) / 2;
  const fs = Math.min(pw, ph) * 0.38;
  const tampilNomor = totalSel <= 48;

  let sel = "";
  let n = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      n++;
      const x = offX + c * pw;
      const y = offY + r * ph;
      const pakai = n <= dipakai;
      sel += `<rect x="${x}" y="${y}" width="${pw}" height="${ph}" fill="${
        pakai ? "#dbeafe" : "#f1f5f9"
      }" stroke="${
        pakai ? "#2563eb" : "#94a3b8"
      }" stroke-width="1" vector-effect="non-scaling-stroke"${
        pakai ? "" : ' stroke-dasharray="4 3"'
      }/>`;
      if (pakai && tampilNomor) {
        sel += `<text x="${x + pw / 2}" y="${
          y + ph / 2
        }" font-size="${fs}" fill="#1e3a8a" text-anchor="middle" dominant-baseline="central" font-family="Inter, sans-serif">${n}</text>`;
      }
    }
  }

  const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sketsa plano ${W}x${H}">
<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff" stroke="#334155" stroke-width="2" vector-effect="non-scaling-stroke"/>${sel}</svg>`;

  const caption = `${label} · ${W}x${H} cm<br>${dipakai} pcs/plano`;
  return `<div class="sketsa-wrap">${svg}<div class="sketsa-caption">${caption}</div></div>`;
}

function dimBukuTerorientasi(hasil) {
  const d = dimensiBuku[hasil.ukuran_buku];
  return hasil.orientasi === "landscape" ? { w: d.h, h: d.w } : { w: d.w, h: d.h };
}

// =============================================
// MODAL
// =============================================
function hitungTotalDenganMargin(hasil, marginPersen) {
  const total = hasil.total_hpp * (1 + marginPersen / 100) + 50000 / hasil.quantity;
  return { total, perPcs: total / hasil.quantity };
}

function updateModalTotals() {
  if (!lastHasil) return;
  const input = document.getElementById("marginInput");
  let m = parseFloat(input.value);
  if (isNaN(m) || m < 0) m = 0;
  const { total, perPcs } = hitungTotalDenganMargin(lastHasil, m);
  document.getElementById("modalTotal").textContent = rp(total);
  document.getElementById("modalPerPcs").textContent = rp(perPcs);
  document.getElementById("totalBiaya").textContent = rp(total);
  document.getElementById("hargaSatuan").textContent = rp(perPcs);
}

function buildModalContent(hasil) {
  const mukaCover = hasil.jumlah_muka_cover;
  const tipeCoverText = hasil.tipe_cover === "hard_cover" ? "Hard Cover" : "Soft Cover";
  const buku = dimBukuTerorientasi(hasil);

  document.getElementById("modalMachineBadge").innerHTML =
    "Cover: " +
    badgeMesinHtml(hasil.mesin_cover) +
    " &nbsp;Isi: " +
    badgeMesinHtml(hasil.mesin_isi);
  document.getElementById("modalSubtitle").textContent = `${formatCurrency(
    hasil.quantity
  )} eks · ${hasil.quantity_isi} hal · ${ukuranText[hasil.ukuran_buku]}`;

  // --- Spesifikasi ---
  document.getElementById("modalSpesifikasi").innerHTML =
    row("Ukuran Buku", `${ukuranText[hasil.ukuran_buku]} (${hasil.orientasi})`) +
    row("Jumlah Cetak", `${formatCurrency(hasil.quantity)} eksemplar`) +
    row("Halaman Isi", `${hasil.quantity_isi} halaman`) +
    row(
      "Cover",
      `${jenisKertasText[hasil.jenis_cover]} · ${mukaCover} muka · ${tipeCoverText}`
    ) +
    row(
      "Isi",
      `${jenisKertasText[hasil.jenis_isi]} · ${hasil.jumlah_muka_isi} muka · ${
        jenisCetakText[hasil.jenis_cetak_isi]
      }`
    );

  // --- Kertas cover ---
  const pCover = infoPlano(hasil, "cover");
  document.getElementById("modalKertasCover").innerHTML =
    row("Ukuran Plano", pCover.label) +
    row("Hasil Bagi Plano", `${hasil.hasil_bagi_plano_cover} pcs`) +
    row(
      "Insheet",
      `+${hasil.tambahan_insheet_cover} → ${
        hasil.quantity + hasil.tambahan_insheet_cover
      } eks`
    ) +
    row("Jumlah Plano", `${formatCurrency(hasil.jumlah_plano_cover)}`) +
    row(
      "Harga Kertas / plano",
      hasil.harga_per_plano_cover ? rp(hasil.harga_per_plano_cover) : "per rim"
    ) +
    rowTotal("Biaya Kertas Cover", rp(hasil.total_biaya_kertas_cover));
  document.getElementById("modalSketsaCover").innerHTML = buatSketsaPlano(
    pCover.w,
    pCover.h,
    buku.w,
    buku.h,
    hasil.hasil_bagi_plano_cover,
    "Cover"
  );

  // --- Kertas isi ---
  const pIsi = infoPlano(hasil, "isi");
  document.getElementById("modalKertasIsi").innerHTML =
    row("Ukuran Plano", pIsi.label) +
    row("Hasil Bagi Plano", `${hasil.hasil_bagi_plano_isi} pcs`) +
    row("Insheet", `+${hasil.tambahan_insheet_isi} → ${hasil.quantity_isi_rounded} eks`) +
    row("Total Lembar Isi", `${hasil.total_lembar_isi}`) +
    row("Jumlah Plano", `${formatCurrency(hasil.jumlah_plano_isi)}`) +
    (hasil.harga_per_rim_isi
      ? row("Harga Kertas / rim", rp(hasil.harga_per_rim_isi)) +
        row("Jumlah Rim", `${hasil.jumlah_rim_isi} rim`)
      : row("Harga Kertas / plano", rp(hasil.harga_per_plano_isi))) +
    rowTotal("Biaya Kertas Isi", rp(hasil.total_biaya_kertas_isi));
  document.getElementById("modalSketsaIsi").innerHTML = buatSketsaPlano(
    pIsi.w,
    pIsi.h,
    buku.w,
    buku.h,
    hasil.hasil_bagi_plano_isi,
    "Isi"
  );

  // --- Cetak ---
  document.getElementById("modalCetak").innerHTML =
    row("Jumlah Set Cover", `${hasil.jumlah_set_cover}`) +
    row("Biaya Cetak Cover", rp(hasil.biaya_cetak_cover)) +
    row("Jumlah Set Isi", `${hasil.jumlah_set_isi}`) +
    row("Biaya Cetak Isi", rp(hasil.biaya_cetak_isi)) +
    row("Biaya Plat Isi", rp(hasil.biaya_plat_isi)) +
    row("Overprint", rp(hasil.total_biaya_overprint)) +
    rowTotal(
      "Total",
      rp(hasil.total_biaya_cetak + hasil.biaya_plat_isi + hasil.total_biaya_overprint)
    );

  // --- Finishing ---
  document.getElementById("modalFinishing").innerHTML =
    row("Laminasi", hasil.laminasi) +
    row("Biaya Laminasi", rp(hasil.total_biaya_laminasi)) +
    row("Jilid", `${tipeCoverText} - ${hasil.jenis_jilid}`) +
    row("Biaya Jilid", rp(hasil.biaya_jilid)) +
    row("Kemasan", hasil.jenis_kemasan) +
    row("Biaya Kemasan", rp(hasil.biaya_kemasan));

  // --- Margin & total ---
  document.getElementById("marginInput").value = Math.round(hasil.margin * 100);
  document.getElementById("defaultMarginHint").textContent = `default ${Math.round(
    hasil.margin * 100
  )}%`;
  document.getElementById("modalSubtotal").textContent = rp(hasil.total_hpp);
  document.getElementById("modalHpp").textContent = rp(hasil.hpp);
  updateModalTotals();
}

document.getElementById("marginInput").addEventListener("input", updateModalTotals);
document
  .getElementById("priceHighlight")
  .addEventListener("click", function () {
    if (!lastHasil) return;
    buildModalContent(lastHasil);
  });

// =============================================
// DISPLAY RESULTS
// =============================================
function displayResults(hasil) {
  document.getElementById("errorAlert").style.display = "none";
  document.getElementById("resultCard").style.display = "block";

  document.getElementById("mesinCoverBadge").innerHTML = badgeMesinHtml(
    hasil.mesin_cover
  );
  document.getElementById("mesinIsiBadge").innerHTML = badgeMesinHtml(hasil.mesin_isi);
  document.getElementById("jumlahCetakExp").textContent = `${formatCurrency(
    hasil.quantity
  )} eksemplar`;
  document.getElementById("jumlahHalaman").textContent = `${hasil.quantity_isi} halaman`;

  document.getElementById("coverInfo").textContent = `${
    jenisKertasText[hasil.jenis_cover]
  } · ${hasil.jumlah_muka_cover} muka`;
  document.getElementById("isiInfo").textContent = `${
    jenisKertasText[hasil.jenis_isi]
  } · ${hasil.jumlah_muka_isi} muka · ${jenisCetakText[hasil.jenis_cetak_isi]}`;
  document.getElementById("ukuranDetail").textContent = `${
    ukuranText[hasil.ukuran_buku]
  } (${hasil.orientasi})`;

  const tipeCoverText = hasil.tipe_cover === "hard_cover" ? "Hard Cover" : "Soft Cover";
  const finishingItems = [`${tipeCoverText} - ${hasil.jenis_jilid}`];
  if (hasil.laminasi !== "Tidak Ada") finishingItems.push(`Laminasi ${hasil.laminasi}`);
  if (hasil.jenis_kemasan !== "Tidak Ada")
    finishingItems.push(`Kemasan ${hasil.jenis_kemasan}`);
  document.getElementById("finishingInfo").textContent = finishingItems.join(", ");
  document.getElementById("finishingRow").style.display = "";

  document.getElementById("totalBiaya").textContent = rp(hasil.total_biaya);
  document.getElementById("hargaSatuan").textContent = rp(hasil.harga_per_pcs);
}

// =============================================
// SHOW ERROR
// =============================================
function showError(message) {
  const el = document.getElementById("errorAlert");
  el.textContent = message;
  el.style.display = "block";
  document.getElementById("resultCard").style.display = "none";
}

// =============================================
// RESET FORM
// =============================================
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

// =============================================
// FORM SUBMIT
// =============================================
document.getElementById("calculatorForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const quantity = parseInt(document.getElementById("quantity_exp").value);
  const ukuranBuku = document.getElementById("ukuran_buku").value;
  const orientasi = document.getElementById("orientasi_buku").value;
  const jenisCover = document.getElementById("jenis_cover").value;
  const jenisIsi = document.getElementById("jenis_isi").value;
  const laminasi = document.getElementById("laminasi").value;
  const jenisCetakIsi = document.getElementById("jenis_cetak_isi").value;
  const quantityIsi = parseInt(document.getElementById("quantity_isi").value) || 0;
  const tipeCover = document.getElementById("tipe_cover").value;
  const jenisJilid = document.getElementById("opsi_jilid").value;
  const jenisKemasan = document.getElementById("opsi_kemasan").value;
  const mesinCoverPilihan = document.getElementById("mesin_cover").value;
  const mesinIsiPilihan = document.getElementById("mesin_isi").value;
  const jumlahMukaCover = parseInt(document.getElementById("jumlah_muka_cover").value);
  const jumlahMukaIsi = parseInt(document.getElementById("jumlah_muka_isi").value);

  const hasil = hitungBiayaCetak(
    quantity,
    ukuranBuku,
    orientasi,
    jenisCover,
    jumlahMukaCover,
    jenisIsi,
    laminasi,
    jenisCetakIsi,
    quantityIsi,
    tipeCover,
    jenisJilid,
    jenisKemasan,
    mesinCoverPilihan,
    mesinIsiPilihan,
    jumlahMukaIsi
  );

  if (hasil) {
    lastHasil = hasil;
    displayResults(hasil);
  }
});

document.getElementById("resetBtn").addEventListener("click", resetForm);
window.addEventListener("load", resetForm);

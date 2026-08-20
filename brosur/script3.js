// =============================================
// HELPER
// =============================================
function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(angka));
}

// =============================================
// KONSTANTA: MESIN CETAK
// =============================================
const machine = {
  digital: "Digital Printing",
  sm52: "Speedmaster-52",
  sm74: "Speedmaster-74",
};

// =============================================
// KONSTANTA: UKURAN BROSUR (produk jadi)
// =============================================
const brochureSize = {
  "32x48": { label: "A3+ (32x48 cm)", panjang: 32, lebar: 48 },
  "21x33": { label: "F4 (21x33 cm)", panjang: 21, lebar: 33 },
  "21x29.7": { label: "A4 (21x29.7 cm)", panjang: 21, lebar: 29.7 },
  "16.5x21.5": { label: "F5 (16.5x21.5 cm)", panjang: 16.5, lebar: 21.5 },
  "14.8x21": { label: "A5 (14.8x21 cm)", panjang: 14.8, lebar: 21 },
  "10.5x14.8": { label: "A6 (10.5x14.8 cm)", panjang: 10.5, lebar: 14.8 },
  custom: { label: "Custom", panjang: 0, lebar: 0 },
};

// =============================================
// KONSTANTA: UKURAN PLANO (kertas mentah)
// Dipisah dari mesin -> setiap plano hanya mendata mesin apa saja
// yang bisa memakainya. Mesin besar (SM-52 & SM-74) bisa memakai
// kedua ukuran plano besar; sistem akan memilih yang paling efisien.
// ASUMSI: kedua plano besar dianggap bisa jalan di kedua mesin besar.
// Jika di lapangan tiap mesin terkunci ke satu ukuran plano tertentu,
// bagian mesinTersedia ini perlu disesuaikan.
// =============================================
const planoSize = {
  "32x48": {
    label: "A3+",
    panjang: 32,
    lebar: 48,
    mesinTersedia: [machine.digital],
  },
  "65x100": {
    label: "Plano 65",
    panjang: 65,
    lebar: 100,
    mesinTersedia: [machine.sm52, machine.sm74],
  },
  "79x109": {
    label: "Plano 79",
    panjang: 79,
    lebar: 109,
    mesinTersedia: [machine.sm52, machine.sm74],
  },
};

// =============================================
// KONSTANTA: JENIS KERTAS (label tampilan)
// Linen & Jasmine hanya didukung mesin Digital (lihat KERTAS_KHUSUS_DIGITAL)
// =============================================
const paperType = {
  hvs60: "HVS 60gsm",
  hvs70: "HVS 70gsm",
  hvs80: "HVS 80gsm",
  hvs100: "HVS 100gsm",
  ap150: "Art Paper 150gsm",
  ap120: "Art Paper 120gsm",
  ac210: "Art Carton 210gsm",
  ac230: "Art Carton 230gsm",
  ac260: "Art Carton 260gsm",
  linen: "Linen",
  jasmine: "Jasmine",
};

// Kertas yang HANYA tersedia untuk mesin Digital
const digitalSpeciality = ["linen", "jasmine"];

// =============================================
// HARGA KERTAS - MESIN DIGITAL
// Per lembar plano (32x48cm), dibedakan jumlah muka cetak & rentang qty.
// CATATAN: brosur diasumsikan selalu cetak 2 muka (bolak-balik), mengikuti
// perilaku kalkulator sebelumnya. Tabel "1muka" disediakan untuk pemakaian
// di masa depan jika nanti dibutuhkan opsi cetak 1 sisi.
// Harga Linen & Jasmine di bawah ini DUMMY, belum ada data resmi -> perlu
// verifikasi/konfirmasi harga asli sebelum dipakai produksi.
// =============================================
const digitalPaperPrice = {
  "1muka": {
    hvs60: { "1-50": 1800, "51-100": 1700, "101-300": 1600 },
    hvs70: { "1-50": 1900, "51-100": 1800, "101-300": 1700 },
    hvs80: { "1-50": 2000, "51-100": 1900, "101-300": 1800 },
    hvs100: { "1-50": 2100, "51-100": 2000, "101-300": 1900 },
    ap120: { "1-50": 2200, "51-100": 2100, "101-300": 2000 },
    ap150: { "1-50": 2300, "51-100": 2200, "101-300": 2100 },
    ac210: { "1-50": 2400, "51-100": 2300, "101-300": 2200 },
    ac230: { "1-50": 2500, "51-100": 2400, "101-300": 2300 },
    ac260: { "1-50": 2600, "51-100": 2500, "101-300": 2400 },
    ac310: { "1-50": 2800, "51-100": 2700, "101-200": 2600 },
    linen: { "1-50": 3800, "51-100": 3700, "101-300": 3600 },
    jasmine: { "1-50": 3800, "51-100": 3700, "101-300": 3600 },
  },
  "2muka": {
    hvs60: { "1-50": 3100, "51-100": 3100, "101-300": 3000 },
    hvs70: { "1-50": 3200, "51-100": 3200, "101-300": 3100 },
    hvs80: { "1-50": 3300, "51-100": 3300, "101-300": 3200 },
    hvs100: { "1-50": 3400, "51-100": 3400, "101-300": 3300 },
    ap120: { "1-50": 3500, "51-100": 3500, "101-300": 3400 },
    ap150: { "1-50": 3600, "51-100": 3600, "101-300": 3500 },
    ac210: { "1-50": 3700, "51-100": 3700, "101-300": 3600 },
    ac230: { "1-50": 3800, "51-100": 3800, "101-300": 3700 },
    ac260: { "1-50": 3900, "51-100": 3900, "101-300": 3800 },
    ac310: { "1-50": 4100, "51-100": 4100, "101-300": 4000 },
    linen: { "1-50": 5000, "51-100": 4900, "101-300": 4800 },
    jasmine: { "1-50": 5000, "51-100": 4900, "101-300": 4800 },
  },
};

// Muka cetak yang dipakai untuk brosur (lihat catatan di atas)
// const MUKA_CETAK_BROSUR = "2muka";

// =============================================
// HARGA KERTAS - PLANO BESAR (65x100 & 79x109)
// Harga per lembar plano, tidak dibedakan jumlah muka (sudah termasuk   dalam biaya cetak per set di printPrice).
// Linen & Jasmine tidak tersedia di sini (khusus Digital).
// =============================================
const planoPaperPrice = {
  "65x100": {
    HVS60: 750,
    HVS70: 1000,
    HVS80: 1100,
    HVS100: 1300,
    AP120: 1700,
    AP150: 2000,
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

// =============================================
// BIAYA CETAK PER SET (biaya setup/plate, flat per job)
// Hanya berlaku untuk mesin besar (Digital sudah termasuk dalam harga kertas per plano).
// =============================================
const printPrice = {
  [machine.sm52]: 280000,
  [machine.sm74]: 420000,
};

// Area cetak maksimum per mesin (cm)
const areaCetak = {
  [machine.sm52]: { panjang: 50, lebar: 35 },
  [machine.sm74]: { panjang: 74, lebar: 51 },
};

const laminasiRate = { Doff: 0.22, Glossy: 0.15 }; // per cm2 x qty

// Margin berdasarkan jumlah cetak
const marginList = [
  { maks: 100, margin: 1.0 },
  { maks: 1000, margin: 0.65 },
  { maks: 5000, margin: 0.45 },
  { maks: Infinity, margin: 0.3 },
];

function getMargin(quantity) {
  return marginList.find((row) => quantity <= row.maks).margin;
}

function getBracketQty(quantity) {
  if (quantity <= 50) return "1-50";
  if (quantity <= 100) return "51-100";
  return "101-300";
}

function getHargaKertasDigital(jenisKertas, quantity) {
  const bracket = getBracketQty(quantity);
  const mukaKey = mukaCetak === "2" ? "2muka" : "1muka";
  return digitalPaperPrice[mukaKey][jenisKertas][bracket];
}

// =============================================
// VALIDASI KOMPATIBILITAS KERTAS <-> MESIN
// =============================================
function suppMachine(jenisKertas, mesin) {
  if (mesin === machine.digital) return true; // semua jenis didukung Digital
  return !digitalSpeciality.includes(jenisKertas);
}

// =============================================
// PERHITUNGAN JUMLAH PCS PER LEMBAR PLANO
// Pendekatan grid sederhana (potong lurus horizontal/vertikal),
// dicoba 2 orientasi (normal & diputar 90 derajat), diambil yang
// hasilnya paling banyak. CATATAN: ini estimasi umum, bukan hasil
// algoritma cutting-stock optimal (nesting campuran), jadi di kasus
// tertentu jumlah aktual di lapangan bisa sedikit lebih banyak.
// =============================================
function hitungPcsPerPlano(
  planoPanjang,
  planoLebar,
  brosurPanjang,
  brosurLebar
) {
  const normal =
    Math.floor(planoPanjang / brosurPanjang) *
    Math.floor(planoLebar / brosurLebar);
  const diputar =
    Math.floor(planoPanjang / brosurLebar) *
    Math.floor(planoLebar / brosurPanjang);
  return Math.max(normal, diputar);
}

function hitungJumlahSetCetak(mesin, brosurPanjang, brosurLebar) {
  const area = areaCetak[mesin];
  if (!area) return 1; // Digital tidak memakai konsep set/area cetak

  const pcsMuatSekaligus = hitungPcsPerPlano(
    area.panjang,
    area.lebar,
    brosurPanjang,
    brosurLebar
  );

  // Butuh 2 brosur muat bersamaan dalam 1 area cetak
  // (front & belakang tercetak sekali jalan).
  // Kalau cuma 1 pcs yang muat, perlu 2x jalan.
  return pcsMuatSekaligus >= 2 ? 1 : 2;

  // const muatNormal = brosurPanjang <= area.panjang && brosurLebar <= area.lebar;
  // const muatDiputar = brosurPanjang <= area.lebar && brosurLebar <= area.panjang;
  // const muat = muatNormal || muatDiputar;

  // return muat ? 1 : 2;
}

// =============================================
// PEMILIHAN UKURAN PLANO TERBAIK UNTUK SATU MESIN
// Kriteria: jumlah pcs per plano terbanyak, lalu sisa area (waste)
// paling sedikit sebagai tie-breaker.
// =============================================
function pilihPlanoTerbaik(mesin, ukuranBrosurKey) {
  const brosur = brochureSize[ukuranBrosurKey];
  let terbaik = null;

  for (const [key, plano] of Object.entries(planoSize)) {
    if (!plano.mesinTersedia.includes(mesin)) continue;

    const pcs = hitungPcsPerPlano(
      plano.panjang,
      plano.lebar,
      brosur.panjang,
      brosur.lebar
    );
    if (pcs === 0) continue; // brosur tidak muat di plano ini

    const luasPlano = plano.panjang * plano.lebar;
    const luasTerpakai = pcs * brosur.panjang * brosur.lebar;
    const sisaArea = luasPlano - luasTerpakai;

    const kandidat = { key, ...plano, pcs, sisaArea, luasPlano };

    if (
      !terbaik ||
      kandidat.pcs > terbaik.pcs ||
      (kandidat.pcs === terbaik.pcs && kandidat.sisaArea < terbaik.sisaArea)
    ) {
      terbaik = kandidat;
    }
  }

  return terbaik; // null jika brosur tidak muat di plano manapun utk mesin ini
}

// =============================================
// PERHITUNGAN UTAMA
// input: { quantity, ukuranBrosur, jenisKertas, laminasi, mukaLaminasi, mesin }
// =============================================
function hitungBiayaCetak(input) {
  const { quantity, ukuranBrosur, jenisKertas, laminasi, mukaCetak, mesin } =
    input;
  const brosurDipilih = brochureSize[ukuranBrosur];
  if (!brosurDipilih || !brosurDipilih.panjang || !brosurDipilih.lebar) {
    return {
      error: "Dimensi ukuran brosur belum lengkap. Mohon isi panjang & lebar.",
    };
  }

  if (!quantity || !ukuranBrosur || !jenisKertas || !laminasi || !mesin) {
    return { error: "Mohon lengkapi semua data." };
  }
  if (quantity < 100 || quantity % 10 !== 0) {
    return { error: "Jumlah minimal 100 pcs dan harus dalam kelipatan 10." };
  }
  if (!mukaCetak) {
    return { error: "Mohon pilih jumlah muka." };
  }
  if (!suppMachine(jenisKertas, mesin)) {
    return {
      error: `${paperType[jenisKertas]} hanya tersedia untuk mesin Digital.`,
    };
  }

  const planoTerpilih = pilihPlanoTerbaik(mesin, ukuranBrosur);
  if (!planoTerpilih) {
    return {
      error:
        "Ukuran brosur ini tidak muat di plano manapun untuk mesin yang dipilih.",
    };
  }

  const isDigital = mesin === machine.digital;
  const pcsPerPlano = planoTerpilih.pcs;
  const jumlahMuka = mukaCetak === "2" ? 2 : 1;

  // Insheet: toleransi cetak untuk mesin offset besar
  const tambahanInsheet = isDigital ? 0 : 100;
  const quantityInsheet = quantity + tambahanInsheet;

  const jumlahPlano = Math.ceil(quantityInsheet / pcsPerPlano);

  // --- Biaya kertas ---
  let hargaPerPlano;
  if (isDigital) {
    hargaPerPlano = getHargaKertasDigital(jenisKertas, quantity, mukaCetak);
  } else {
    hargaPerPlano = planoPaperPrice[planoTerpilih.key][jenisKertas];
  }
  const biayaKertas = jumlahPlano * hargaPerPlano;

  // --- Biaya cetak (mesin besar saja); jumlah set tergantung apakah
  // brosur muat dicetak bolak-balik di area cetak mesin ---
  const jumlahSetCetak = isDigital
    ? 1
    : hitungJumlahSetCetak(mesin, brosurDipilih.panjang, brosurDipilih.lebar);
  const biayaCetak = isDigital ? 0 : printPrice[mesin] * jumlahSetCetak;

  // --- Overprint ---
  let biayaOverprint = 0;
  if (quantity > 1000) {
    const jumlahOverprint = quantity - 1000 + 100;
    biayaOverprint = jumlahOverprint * 80;
  }

  // --- Pond (mesin besar saja) ---
  // let biayaPond = 0;
  // if (!isDigital) {
  //   biayaPond = Math.ceil(quantity / 1000) * 50000;
  // }

  // --- Potong: tidak ada biaya jika 1 brosur = 1 plano penuh ---
  let biayaPotong = 0;
  if (pcsPerPlano > 1) {
    biayaPotong =
      quantity <= 1000
        ? 20000
        : 10000 + Math.ceil((quantity - 1000) / 500) * 5000;
  }

  // --- Laminasi ---
  let biayaLaminasi = 0;
  if (laminasi !== "Tidak Ada") {
    if (isDigital) {
      biayaLaminasi = jumlahPlano * 1500;
    } else {
      // Diasumsikan laminasi dikerjakan di atas plano yang sudah dipotong
      // separuh (mengikuti pola data SM-52 lama: 65x100 -> 32.5x50).
      const dimLaminasi = {
        panjang: brosurDipilih.panjang + 2,
        lebar: brosurDipilih.lebar + 2,
      };
      const rate = laminasiRate[laminasi];
      const hitung =
        dimLaminasi.panjang * dimLaminasi.lebar * rate * quantity * jumlahMuka;
      biayaLaminasi = Math.max(hitung, 80000);
    }
  }

  const hpp =
    biayaKertas +
    biayaOverprint +
    biayaCetak +
    // biayaPond +
    biayaPotong +
    biayaLaminasi;

  const margin = getMargin(quantity);
  const totalBiaya = hpp * (1 + margin) + 50000 / quantity;
  const hargaPerPcs = totalBiaya / quantity;
  const hppPerPcs = hpp / quantity;

  return {
    mesin,
    plano: planoTerpilih,
    quantity,
    ukuranBrosur,
    jenisKertas,
    laminasi,
    mukaCetak,
    pcsPerPlano,
    tambahanInsheet,
    quantityInsheet,
    jumlahPlano,
    hargaPerPlano,
    biayaKertas,
    biayaCetak,
    jumlahSetCetak,
    biayaOverprint,
    // biayaPond,
    biayaPotong,
    biayaLaminasi,
    hpp,
    hppPerPcs,
    margin,
    totalBiaya,
    hargaPerPcs,
  };
}

// =============================================
// REKOMENDASI MESIN
// Menjalankan hitungBiayaCetak untuk setiap mesin yang kompatibel
// dengan jenis kertas yang dipilih, lalu merekomendasikan yang
// totalBiaya-nya paling murah. Dengan begitu, faktor "ekonomis"
// (bukan sekadar ambang jumlah cetak) yang menentukan rekomendasi.
// =============================================
function rekomendasiMesin({
  quantity,
  ukuranBrosur,
  jenisKertas,
  laminasi,
  mukaCetak,
}) {
  const kandidatMesin = Object.values(machine).filter((m) =>
    suppMachine(jenisKertas, m)
  );

  let terbaik = null;
  for (const mesin of kandidatMesin) {
    const hasil = hitungBiayaCetak({
      quantity,
      ukuranBrosur,
      jenisKertas,
      laminasi,
      mukaCetak,
      mesin,
    });
    if (hasil.error) continue; // brosur tidak muat / kombinasi tidak valid utk mesin ini
    if (!terbaik || hasil.totalBiaya < terbaik.totalBiaya) {
      terbaik = { mesin, totalBiaya: hasil.totalBiaya };
    }
  }

  return terbaik ? terbaik.mesin : null;
}

// =============================================
// BREAKDOWN DI CONSOLE (format rapi ala nota)
// =============================================
function tampilkanBreakdownConsole(hasil) {
  const garis = "=".repeat(60);
  const garisTipis = "-".repeat(60);

  console.clear();
  console.log(garis);
  console.log("           BREAKDOWN PERHITUNGAN CETAK BROSUR");
  console.log(garis);
  console.log(`Mesin Cetak   : ${hasil.mesin}`);
  console.log(
    `Ukuran Plano  : ${hasil.plano.label} (${hasil.plano.panjang}x${hasil.plano.lebar} cm)`
  );
  console.log(`Ukuran Brosur : ${brochureSize[hasil.ukuranBrosur].label}`);
  console.log(`Jenis Kertas  : ${paperType[hasil.jenisKertas]}`);
  console.log(`Laminasi      : ${hasil.laminasi}`);
  console.log(`Muka Cetak    : ${hasil.mukaCetak} Muka`);
  console.log(garisTipis);
  console.log(`Jumlah Cetak  : ${formatRupiah(hasil.quantity)} pcs`);
  console.log(
    `Insheet       : +${hasil.tambahanInsheet} pcs -> ${formatRupiah(
      hasil.quantityInsheet
    )} pcs`
  );
  console.log(`Pcs/Plano     : ${hasil.pcsPerPlano} pcs`);
  console.log(`Jumlah Plano  : ${formatRupiah(hasil.jumlahPlano)} lembar`);
  console.log(garisTipis);
  console.log("RINCIAN BIAYA");
  console.log(
    `Kertas        : Rp ${formatRupiah(hasil.biayaKertas)} (@ Rp ${formatRupiah(
      hasil.hargaPerPlano
    )}/plano)`
  );
  if (hasil.biayaCetak > 0)
    console.log(
      `Cetak (set)   : Rp ${formatRupiah(hasil.biayaCetak)} (${
        hasil.jumlahSetCetak
      } set)`
    );
  if (hasil.biayaOverprint > 0)
    console.log(`Overprint     : Rp ${formatRupiah(hasil.biayaOverprint)}`);
  // if (hasil.biayaPond > 0)
  //   console.log(`Biaya Pond    : Rp ${formatRupiah(hasil.biayaPond)}`);
  if (hasil.biayaPotong > 0)
    console.log(`Biaya Potong  : Rp ${formatRupiah(hasil.biayaPotong)}`);
  if (hasil.biayaLaminasi > 0)
    console.log(`Laminasi      : Rp ${formatRupiah(hasil.biayaLaminasi)}`);
  console.log(garisTipis);
  console.log(
    `Subtotal      : Rp ${formatRupiah(hasil.hpp)}  |  HPP: Rp ${formatRupiah(
      hasil.hppPerPcs
    )}`
  );
  console.log(`Margin        : ${Math.round(hasil.margin * 100)}%`);
  console.log(`Total Biaya   : Rp ${formatRupiah(hasil.totalBiaya)}`);
  console.log(`Harga / pcs   : Rp ${formatRupiah(hasil.hargaPerPcs)}`);
  console.log(garis);
}

// =============================================
// BAGIAN DOM (hanya jalan di browser)
// =============================================
if (typeof document !== "undefined") {
  const baseField = ["quantity", "ukuran_brosur", "jenis_kertas", "laminasi", "muka_cetak"];

  function elemAda(id) {
    return document.getElementById(id) !== null;
  }

  function ambilNilaiForm() {
    return {
      quantity: parseInt(document.getElementById("quantity").value),
      ukuranBrosur: document.getElementById("ukuran_brosur").value,
      jenisKertas: document.getElementById("jenis_kertas").value,
      laminasi: document.getElementById("laminasi").value,
      mukaCetak: document.getElementById("muka_cetak").value,
      mesin: document.getElementById("mesin_cetak").value,
    };
  }

  function semuaSpesifikasiTerisi() {
    const dasarTerisi = baseField.every((id) => {
      const el = document.getElementById(id);
      return el && el.value !== "" && el.value !== null;
    });
    const laminasiEl = document.getElementById("laminasi");
    const mukaTerisi =
      laminasiEl.value === "Tidak Ada" ||
      document.getElementById("muka_laminasi").value !== "";
    return dasarTerisi && mukaTerisi;
  }

  function updateOpsiMesinTersedia() {
    const jenisKertas = document.getElementById("jenis_kertas").value;
    const mesinEl = document.getElementById("mesin_cetak");
    Array.from(mesinEl.options).forEach((opt) => {
      if (!opt.value) return;
      opt.disabled = !suppMachine(jenisKertas, opt.value);
    });
  }

  function updateKelengkapanDanMesin() {
    updateOpsiMesinTersedia();

    const mesinEl = document.getElementById("mesin_cetak");
    const lengkap = semuaSpesifikasiTerisi();
    mesinEl.disabled = !lengkap;

    if (!lengkap) {
      mesinEl.value = "";
      document.getElementById("saranMesin").textContent = "";
      return;
    }

    const nilai = ambilNilaiForm();
    const rekomendasi = rekomendasiMesin(nilai);

    if (rekomendasi) {
      mesinEl.value = rekomendasi;
      document.getElementById(
        "saranMesin"
      ).textContent = `✦ Rekomendasi: ${rekomendasi}`;
    } else {
      document.getElementById("saranMesin").textContent = "";
    }
  }

  function tampilkanError(pesan) {
    const errorAlert = document.getElementById("errorAlert");
    errorAlert.textContent = pesan;
    errorAlert.style.display = "block";
    document.getElementById("resultCard").style.display = "none";
  }

  function tampilkanHasil(hasil) {
    document.getElementById("errorAlert").style.display = "none";
    document.getElementById("resultCard").style.display = "block";

    document.getElementById("mesinBadge").textContent = hasil.mesin;
    document.getElementById(
      "planoInfo"
    ).textContent = `Plano: ${hasil.plano.label} · ${hasil.pcsPerPlano} pcs/plano`;

    document.getElementById("jumlahCetak").textContent = `${formatRupiah(
      hasil.quantity
    )} eksemplar`;
    document.getElementById("bahan").textContent = `${
      paperType[hasil.jenisKertas]
    }, uk. ${brochureSize[hasil.ukuranBrosur].label}`;

    const finishingRow = document.getElementById("finishingRow");
    if (hasil.laminasi !== "Tidak Ada") {
      finishingRow.style.display = "";
      document.getElementById(
        "laminasiInfo"
      ).textContent = `Laminasi ${hasil.laminasi} (${hasil.mukaLaminasi} muka)`;
    } else {
      finishingRow.style.display = "none";
    }

    document.getElementById("totalBiaya").textContent = `Rp ${formatRupiah(
      hasil.totalBiaya
    )}`;
    document.getElementById("hargaSatuan").textContent = `Rp ${formatRupiah(
      hasil.hargaPerPcs
    )} / pcs`;

    tampilkanBreakdownConsole(hasil);
  }

  function resetForm() {
    document.getElementById("calculatorForm").reset();
    document.getElementById("resultCard").style.display = "none";
    document.getElementById("errorAlert").style.display = "none";
    document.getElementById("brosur_panjang").value = "";
    document.getElementById("brosur_lebar").value = "";
    document.getElementById("brosur_panjang").disabled = true;
    document.getElementById("brosur_lebar").disabled = true;
    document.getElementById("mesin_cetak").value = "";
    document.getElementById("mesin_cetak").disabled = true;
    document.getElementById("muka_laminasi").value = "";
    document.getElementById("muka_laminasi").disabled = true;
    document.getElementById("saranMesin").textContent = "";
  }

  baseField.concat(["muka_laminasi"]).forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("change", updateKelengkapanDanMesin);
      el.addEventListener("input", updateKelengkapanDanMesin);
    }
  });

  document.getElementById("quantity").addEventListener("input", function () {
    const value = parseInt(this.value);
    this.classList.toggle("is-invalid", value < 100 || value % 10 !== 0);
  });

  document
    .getElementById("ukuran_brosur")
    .addEventListener("change", function () {
      const panjangEl = document.getElementById("brosur_panjang");
      const lebarEl = document.getElementById("brosur_lebar");
      if (this.value === "custom") {
        panjangEl.disabled = false;
        lebarEl.disabled = false;
        panjangEl.value = "";
        lebarEl.value = "";
        brochureSize.custom.panjang = 0;
        brochureSize.custom.lebar = 0;
      } else {
        const ukuran = brochureSize[this.value];
        panjangEl.disabled = true;
        lebarEl.disabled = true;
        panjangEl.value = ukuran ? ukuran.panjang : "";
        lebarEl.value = ukuran ? ukuran.lebar : "";
      }
    });

  ["brosur_panjang", "brosur_lebar"].forEach((id) => {
    document.getElementById(id).addEventListener("input", function () {
      brochureSize.custom.panjang =
        parseFloat(document.getElementById("brosur_panjang").value) || 0;
      brochureSize.custom.lebar =
        parseFloat(document.getElementById("brosur_lebar").value) || 0;
      brochureSize.custom.label = `Custom (${brochureSize.custom.panjang}x${brochureSize.custom.lebar} cm)`;
      updateKelengkapanDanMesin();
    });
  });

  document
    .getElementById("calculatorForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const nilai = ambilNilaiForm();
      const hasil = hitungBiayaCetak(nilai);
      if (hasil.error) {
        tampilkanError(hasil.error);
      } else {
        tampilkanHasil(hasil);
      }
    });

  document.getElementById("resetBtn").addEventListener("click", resetForm);
  window.addEventListener("load", resetForm);
}

// Ekspor untuk keperluan testing di Node (tidak memengaruhi browser)
if (typeof module !== "undefined") {
  module.exports = {
    hitungBiayaCetak,
    rekomendasiMesin,
    pilihPlanoTerbaik,
    hitungPcsPerPlano,
    suppMachine,
    machine,
    planoSize,
    brochureSize,
    paperType,
  };
}

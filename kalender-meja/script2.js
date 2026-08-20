// Size data dengan plano berbeda untuk digital dan SM-52
const sizeData = {
  "15x21": {
    panjang: 15,
    lebar: 21,
  },
  "21x15": {
    panjang: 21,
    lebar: 15,
  },
};

const planoData = {
  "33x43": { panjang: 33, lebar: 43 },
  // "65x100": { panjang: 65, lebar: 100 },
};

// Paper data dengan harga per lembar dan per rim
const paperData = {
  AC210: {
    name: "Art Carton 210gsm",
    perLembar: 650,
    perRim: 310000, // per 500 lembar
    digitalPrices: {
      "1-300": 3700,
    },
  },
  AC230: {
    name: "Art Carton 230gsm",
    perLembar: 750,
    perRim: 330000, // per 500 lembar
    digitalPrices: {
      "1-300": 3800,
    },
  },
  AC260: {
    name: "Art Carton 260gsm",
    perLembar: 850,
    perRim: 350000, // per 500 lembar
    digitalPrices: {
      "1-300": 3900,
    },
  },
  AC310: {
    name: "Art Carton 310gsm",
    perLembar: 1100,
    perRim: 400000, // per 500 lembar
    digitalPrices: {
      "1-300": 4100,
    },
  },
};

// Lamination rates
const laminationRates = {
  digital: {
    doff: 1000,
    glossy: 1000,
  },
  sm52: {
    doff: 0.25,
    glossy: 0.15,
  },
};

function formatCurrency(number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

function getMachineType(quantity) {
  return quantity <= 100 ? "digital" : "sm52";
}

function getJadiPerPlano(quantity, calendarType) {
  if (quantity < 1000) {
    if (calendarType < 8) {
      return Math.ceil(calendarType / 4); // Double Folio
    } else {
      return calendarType / 4; // Double Folio
    }
  } else {
    // return Math.ceil(calendarType / 4); // Double Folio
    return calendarType / 4; // Double Folio
  }
}

function calculatePaperCost(machineType, quantity, totalPlano, paperType) {
  if (machineType === "digital") {
    return 0; // Digital tidak ada biaya kertas terpisah
  }

  const paper = paperData[paperType];

  if (quantity < 1000) {
    return totalPlano * paper.perLembar;
  } else {
    return Math.round(totalPlano / 500) * paper.perRim;
  }
}

function calculatePrintCost(machineType, quantity, calendarType, paperType) {
  if (machineType === "digital") {
    const jadiPerPlano = getJadiPerPlano(quantity, calendarType);
    const totalPlano = quantity * jadiPerPlano; // Total plano yang dibutuhkan
    const digitalPrice = paperData[paperType].digitalPrices["1-300"];
    return totalPlano * digitalPrice;
  } else {
    // SM-52
    const baseCost = Math.ceil(calendarType / 2) * 280000;
    const overprintCost =
      quantity > 1000 ? (quantity - 900) * Math.ceil(calendarType / 2) * 80 : 0;
    return baseCost + overprintCost;
  }
}

function calculateLaminationCost(
  machineType,
  quantity,
  calendarType,
  laminationType
) {
  if (laminationType === "none") return 0;

  // const selectedSize = sizeData[size];
  const rate = laminationRates[machineType][laminationType];
  // const sides = 2;
  const jadiPerPlano = getJadiPerPlano(quantity, calendarType);
  const totalPlano =
    machineType === "sm52"
      ? (quantity + 100) * jadiPerPlano
      : quantity * jadiPerPlano;

  if (machineType === "digital") {
    return totalPlano * rate;
  } else {
    const { panjang, lebar } = planoData["33x43"];
    return panjang * lebar * rate * totalPlano;
  }
}

function hitungBiayaKalender(
  quantity,
  size,
  calendarType,
  paperType,
  laminationType
) {
  // Validasi input
  if (!quantity || !size || !calendarType || !paperType) {
    showError("Mohon lengkapi semua data.");
    return null;
  }

  if (quantity < 100 || quantity % 50 !== 0) {
    showError("Jumlah minimal 100 pcs dan harus dalam kelipatan 50.");
    return null;
  }

  if (calendarType < 1 || !Number.isInteger(parseFloat(calendarType))) {
    showError("Jumlah lembar harus berupa angka positif.");
    return null;
  }

  if (calendarType > 14) {
    showError("Jumlah lembar maksimal 14.");
    return null;
  }

  const machineType = getMachineType(quantity);
  const plano = "33x43 cm";
  const jadiPerPlano = getJadiPerPlano(quantity, calendarType);
  const totalPlano =
    machineType === "sm52"
      ? (quantity + 100) * jadiPerPlano
      : quantity * jadiPerPlano;

  // Calculate costs
  const paperCost = calculatePaperCost(
    machineType,
    quantity,
    totalPlano,
    paperType
  );
  const printCost = calculatePrintCost(
    machineType,
    quantity,
    calendarType,
    paperType
  );
  const finishingCost = (quantity + 10) * 10000;
  const laminationCost = calculateLaminationCost(
    machineType,
    quantity,
    calendarType,
    laminationType
  );

  const subtotal = paperCost + printCost + finishingCost + laminationCost;

  // Calculate margin
  let margin;
  if (machineType === "digital") {
    margin = 0.65;
  } else {
    if (quantity <= 300) {
      margin = 0.35;
    } else if (quantity >= 500) {
      margin = 0.25;
    } else {
      margin = 0.33;
    }
  }

  const hadiah = 60000;

  // Final cost calculation
  const totalCost = subtotal * (1 + margin) + 50000 + hadiah / quantity;
  const pricePerPiece = totalCost / quantity;

  // Calculate number of prints
  let numPrints;
  if (machineType === "digital") {
    numPrints = quantity * jadiPerPlano;
  } else {
    numPrints = Math.ceil(calendarType / 2);
  }

  // Data for console display
  const consoleData = {
    machineType,
    quantity,
    size,
    calendarType,
    jadiPerPlano,
    totalPlano,
    plano,
    selectedPaper: paperData[paperType].name,
    laminationType,
    paperCost,
    printCost,
    finishingCost,
    laminationCost,
    subtotal,
    hadiah,
    margin,
    totalCost,
    pricePerPiece,
  };

  // Display console output
  displayConsoleOutput(consoleData);

  return {
    quantity,
    machineType,
    calendarType: parseInt(calendarType),
    jenis_kertas: paperData[paperType].name,
    ukuran_kalender: size + " cm",
    plano,
    jadiPerPlano,
    totalPlano,
    paperCost,
    printCost,
    laminationType,
    finishingCost,
    laminationCost,
    subtotal,
    hadiah,
    margin,
    totalCost,
    pricePerPiece,
  };
}

function displayConsoleOutput(data) {
  const {
    machineType,
    quantity,
    size,
    calendarType,
    jadiPerPlano,
    totalPlano,
    plano,
    selectedPaper,
    laminationType,
    paperCost,
    printCost,
    finishingCost,
    laminationCost,
    subtotal,
    hadiah,
    margin,
    totalCost,
    pricePerPiece,
  } = data;

  // Harga sebelum margin
  const costBeforeMargin = subtotal;
  const priceBeforeMargin = costBeforeMargin / quantity;

  console.clear();
  console.log(
    "%c=== SPESIFIKASI ===",
    "color: #0466c8; font-weight: bold; font-size: 14px;"
  );
  console.log(
    `Mesin: ${
      machineType === "digital" ? "Digital Printing" : "SM-52"
    } || Plano: ${plano}`
  );
  console.log(
    `Quantity: ${formatCurrency(quantity)} pcs || Ukuran: ${size} cm`
  );
  console.log(`Kertas: ${selectedPaper} || Jenis: ${calendarType} lembar`);
  console.log(
    `Hasil/Plano: ${jadiPerPlano} pcs/plano || Total Plano : ${formatCurrency(
      totalPlano
    )} plano`
  );
  if (laminationType !== "none") {
    console.log(
      `Laminasi: ${
        laminationType.charAt(0).toUpperCase() + laminationType.slice(1)
      }`
    );
  }

  console.log(
    "\n%c=== RINCIAN BIAYA ===",
    "color: #0466c8; font-weight: bold; font-size: 14px;"
  );
  if (machineType === "sm52") {
    console.log(`Biaya Kertas     : Rp ${formatCurrency(paperCost)}`);
  }
  console.log(`Biaya Cetak      : Rp ${formatCurrency(printCost)}`);
  console.log(`Biaya Finishing  : Rp ${formatCurrency(finishingCost)}`);
  if (laminationCost > 0) {
    console.log(`Biaya Laminasi   : Rp ${formatCurrency(laminationCost)}`);
  }

  console.log(
    "\n%c=== TOTAL HARGA ===",
    "color: #0466c8; font-weight: bold; font-size: 14px;"
  );
  console.log(`Subtotal         : Rp ${formatCurrency(subtotal)}`);
  console.log(`HPP              : Rp ${formatCurrency(priceBeforeMargin)}`);
  console.log(`Margin           : ${(margin * 100).toFixed(0)}%`);
  console.log(`Hadiah Langsung  : Rp ${formatCurrency(hadiah)}`);
  console.log(`Total Harga      : Rp ${formatCurrency(totalCost)}`);
  console.log(`Harga /pcs       : Rp ${formatCurrency(pricePerPiece)}`);
}

function resetForm() {
  document.getElementById("calculatorForm").reset();
  document.getElementById("resultCard").style.display = "none";
  document.getElementById("errorAlert").style.display = "none";
  document.getElementById("machineInfo").style.display = "none";
}

function showError(message) {
  const errorAlert = document.getElementById("errorAlert");
  errorAlert.textContent = message;
  errorAlert.style.display = "block";
  document.getElementById("resultCard").style.display = "none";
}

function displayResults(hasil) {
  document.getElementById("errorAlert").style.display = "none";
  document.getElementById("resultCard").style.display = "block";

  const machineBadge =
    hasil.machineType === "digital"
      ? '<span class="badge badge-digital">Digital Printing</span>'
      : '<span class="badge badge-sm52">Speedmaster-52</span>';

  document.getElementById("mesinDetail").innerHTML = machineBadge;
  document.getElementById("cetakDetail").textContent =
    formatCurrency(hasil.quantity) +
    " pcs (" +
    hasil.calendarType +
    " lembar/set)";
  document.getElementById("bahanDetail").textContent = hasil.jenis_kertas;
  document.getElementById("planoDetail").textContent = hasil.plano;

  let finishingText = "Hard Cover - Spiral";
  if (hasil.laminationType !== "none") {
    const lamiName =
      hasil.laminationType === "doff" ? "Laminasi Doff" : "Laminasi Glossy";
    finishingText += `, ${lamiName}`;
  }
  document.getElementById("finishingDetail").textContent = finishingText;

  // Price display
  document.getElementById("totalBiaya").textContent =
    "Rp " + formatCurrency(hasil.totalCost);
  document.getElementById("hargaPerBuah").textContent =
    "Rp " + formatCurrency(hasil.pricePerPiece);
}

function updateMachineInfo(quantity) {
  const machineInfo = document.getElementById("machineInfo");
  const machineInfoText = document.getElementById("machineInfoText");

  if (quantity >= 100) {
    const machineType = getMachineType(quantity);
    if (machineType === "digital") {
      machineInfoText.textContent = "Digital Printing (maks. 200 pcs)";
    } else {
      machineInfoText.textContent = "Mesin SM-52 (di atas 200 pcs)";
    }
    machineInfo.style.display = "block";
  } else {
    machineInfo.style.display = "none";
  }
}

// Event listeners
document.getElementById("quantity").addEventListener("input", function () {
  const value = parseInt(this.value);
  if (value >= 100 && value % 50 === 0) {
    this.classList.remove("is-invalid");
    updateMachineInfo(value);
  } else {
    this.classList.add("is-invalid");
  }
});

document.getElementById("type").addEventListener("input", function () {
  const value = parseInt(this.value);
  const errorElement = document.getElementById("typeError");

  if (value > 14) {
    this.classList.add("is-invalid");
    errorElement.style.display = "block";
  } else if (value >= 1) {
    this.classList.remove("is-invalid");
    errorElement.style.display = "none";
  }
});

document
  .getElementById("calculatorForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const quantity = parseInt(document.getElementById("quantity").value);
    const size = document.getElementById("size").value;
    const calendarType = parseInt(document.getElementById("type").value);
    const paperType = document.getElementById("paper").value;
    const laminationType = document.getElementById("lamination").value;

    const hasil = hitungBiayaKalender(
      quantity,
      size,
      calendarType,
      paperType,
      laminationType
    );

    if (hasil) {
      displayResults(hasil);
    }
  });

document.getElementById("resetBtn").addEventListener("click", resetForm);

window.addEventListener("load", function () {
  resetForm();
});

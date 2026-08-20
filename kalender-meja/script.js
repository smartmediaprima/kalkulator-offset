const sizeData = {
  "15x21": {
    plano: "33x43 cm",
    jadi: { 7: 2, 13: 3.5 },
    panjang: 33,
    lebar: 43,
  },
  "21x15": {
    plano: "33x43 cm",
    jadi: { 7: 2, 13: 3.5 },
    panjang: 33,
    lebar: 43,
  },
};

const paperPrices = {
  artCarton210: 600,
  artCarton230: 700,
  artCarton260: 800,
};

const paperPricesPerRim = {
  artCarton210: 310000,
  artCarton230: 330000,
  artCarton260: 350000,
};

const digitalPrintPrices = {
  artCarton210: {
    "1-50": 3600,
    "51-100": 3600,
    "101-200": 3500,
  },
  artCarton230: {
    "1-50": 3700,
    "51-100": 3700,
    "101-200": 3600,
  },
  artCarton260: {
    "1-50": 3800,
    "51-100": 3800,
    "101-200": 3700,
  },
};

const paperTypeNames = {
  artCarton210: "Art Carton 210gsm",
  artCarton230: "Art Carton 230gsm",
  artCarton260: "Art Carton 260gsm",
};

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

function formatDecimal(number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

function roundToNearest50Down(num) {
  return Math.floor(num / 50) * 50;
}

function getMachineType(quantity) {
  return quantity <= 200 ? "digital" : "sm52";
}

function getDigitalPrintPrice(quantity, paperType) {
  const priceTable = digitalPrintPrices[paperType];
  if (quantity <= 50) return priceTable["1-50"];
  if (quantity <= 100) return priceTable["51-100"];
  return priceTable["101-200"];
}

function calculateLaminationCost(
  machineType,
  quantity,
  calendarType,
  size,
  laminationType,
  paperAmount
) {
  if (laminationType === "none") return 0;

  const rate = laminationRates[machineType][laminationType];
  const sidesMultiplier = 2; // Always use 2 sides
  const selectedSize = sizeData[size];
  const hasilBagi = selectedSize.jadi[calendarType];

  if (machineType === "digital") {
    return quantity * hasilBagi * rate * sidesMultiplier;
  } else {
    const panjang = selectedSize.panjang;
    const lebar = selectedSize.lebar;
    return panjang * lebar * hasilBagi * rate * paperAmount * sidesMultiplier;
  }
}

function hitungBiayaKalender(
  quantity,
  size,
  calendarType,
  paperType,
  laminationType
) {
  if (!quantity || !size || !calendarType || !paperType) {
    showError("Mohon lengkapi semua data.");
    return null;
  }

  if (quantity < 100 || quantity % 50 !== 0) {
    showError("Jumlah minimal 100 pcs dan harus dalam kelipatan 50.");
    return null;
  }

  const machineType = getMachineType(quantity);
  const selectedSize = sizeData[size];
  const jadiPerPlano = selectedSize.jadi[calendarType];
  const paperTypeName = paperTypeNames[paperType];

  let paperCost = 0;
  let overprintCost = 0;
  let totalPrintCost = 0;

  if (machineType === "digital") {
    const digitalPrintPrice = getDigitalPrintPrice(quantity, paperType);
    totalPrintCost = quantity * jadiPerPlano * digitalPrintPrice;
  } else {
    const paperAmount = (quantity + 100) * jadiPerPlano;

    // Calculate paper cost based on quantity
    if (quantity => 1000) {
      // Use rim price for quantity above 1000pcs
      const paperPricePerRim = paperPricesPerRim[paperType];
      paperCost = Math.ceil(paperAmount / 500) * paperPricePerRim;
    } else {
      // Use per sheet price for quantity 1000pcs and below
      const paperPrice = paperPrices[paperType];
      paperCost = paperAmount * paperPrice;
    }

    let overprintAmount = 0;
    if (quantity > 1000) {
      overprintCost = (quantity - 900) * calendarType * 100; // Fixed: 900 instead of 1000
    }

    const printUnitPrice = 280000;
    const printAmount = Math.ceil(calendarType / 2);
    totalPrintCost = printAmount * printUnitPrice;
  }

  const finishingUnitPrice = 10000;
  const finishingAmount = quantity + 10;
  const finishingCost = finishingUnitPrice * finishingAmount;

  const laminationCost = calculateLaminationCost(
    machineType,
    quantity,
    calendarType,
    size,
    laminationType,
    machineType === "sm52" ? (quantity + 100) * jadiPerPlano : 0
  );

  const subTotal =
    paperCost + overprintCost + totalPrintCost + finishingCost + laminationCost;

  let margin;
  if (machineType === "digital") {
    margin = 0.64;
  } else {
    if (quantity <= 300) {
      margin = 0.15; // 15% margin for under 300 pcs
    } else if (quantity < 1000) {
      margin = 0.11; // 11% margin for under 500 pcs
    } else {
      margin = 0.05; // 5% margin for 1000+ pcs
    }
  }

  const totalCost = subTotal * (1 + margin) + 50000 / quantity;
  const pricePerPiece = totalCost / quantity;

  let calendarTypeName = "";
  if (calendarType === 7) {
    calendarTypeName = "Dwiwulan + Cover (7 lembar)";
  } else if (calendarType === 13) {
    calendarTypeName = "Bulanan + Cover (13 lembar)";
  }

  return {
    quantity: quantity,
    machineType: machineType,
    jumlah_lembar: calendarType,
    jenis_kalender: calendarTypeName,
    jenis_kertas: paperTypeName,
    ukuran_kalender: size + " cm",
    ukuran_plano: selectedSize.plano,
    jadi_per_plano: jadiPerPlano,
    jumlah_cetak:
      machineType === "digital"
        ? quantity * calendarType
        : Math.round(calendarType / 2),
    total_biaya_cetak: totalPrintCost,
    total_biaya_kertas: paperCost,
    total_biaya_overprint: overprintCost,
    finishing: "Hard Cover - Spiral",
    jumlah_finishing: finishingAmount,
    total_biaya_finishing: finishingCost,
    laminationType: laminationType,
    laminationSides: 2, // Always 2 sides
    total_biaya_laminasi: laminationCost,
    subtotal: subTotal,
    total_biaya: totalCost,
    harga_per_buah: pricePerPiece,
  };
}

function resetForm() {
  document.getElementById("calculatorForm").reset();
  document.getElementById("resultCard").style.display = "none";
  document.getElementById("errorAlert").style.display = "none";
  document.getElementById("machineInfo").style.display = "none";
  document.getElementById("paperSelection").style.display = "block";
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

  const machineDetail =
    hasil.machineType === "digital"
      ? '<span class="badge badge-digital">Digital Printing</span>'
      : '<span class="badge badge-sm52">SM-52</span>';

  const cetakDetail = `${formatCurrency(hasil.quantity)} pcs (${
    hasil.jumlah_lembar
  } lembar / set)`;

  const bahanDetail = `${hasil.jenis_kertas}, uk. ${hasil.ukuran_kalender}`;
  const finishingDetail = hasil.finishing;

  document.getElementById("mesinDetail").innerHTML = machineDetail;
  document.getElementById("cetakDetail").textContent = cetakDetail;
  document.getElementById("bahanDetail").textContent = bahanDetail;
  document.getElementById("finishingDetail").textContent = finishingDetail;

  if (hasil.laminationType !== "none") {
    const laminationDetail = `${
      hasil.laminationType.charAt(0).toUpperCase() +
      hasil.laminationType.slice(1)
    } - ${hasil.laminationSides} Muka (Rp ${formatCurrency(
      hasil.total_biaya_laminasi
    )})`;
    document.getElementById("laminationDetail").textContent = laminationDetail;
    document.getElementById("laminationRow").style.display = "table-row";
  } else {
    document.getElementById("laminationRow").style.display = "none";
  }

  document.getElementById("totalBiaya").textContent =
    "Rp " + formatCurrency(hasil.total_biaya);
  document.getElementById("hargaPerBuah").textContent =
    "Rp " + formatCurrency(hasil.harga_per_buah);
}

function updateMachineInfo(quantity) {
  const machineInfo = document.getElementById("machineInfo");
  const machineInfoText = document.getElementById("machineInfoText");
  const paperSelection = document.getElementById("paperSelection");

  if (quantity >= 100) {
    const machineType = getMachineType(quantity);

    if (machineType === "digital") {
      machineInfoText.textContent =
        "Menggunakan Digital Printing (maks. 200pcs)";
      machineInfo.style.display = "block";
      paperSelection.style.display = "block";
    } else {
      machineInfoText.textContent = "Menggunakan mesin SM-52 (di atas 200pcs)";
      machineInfo.style.display = "block";
      paperSelection.style.display = "block";
    }
  } else {
    machineInfo.style.display = "none";
  }
}

document.getElementById("quantity").addEventListener("input", function () {
  const value = parseInt(this.value);
  if (value < 100 || value % 50 !== 0) {
    this.classList.add("is-invalid");
  } else {
    this.classList.remove("is-invalid");
    updateMachineInfo(value);
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


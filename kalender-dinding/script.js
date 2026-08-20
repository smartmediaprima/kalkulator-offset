// Data ukuran dan harga (updated to match Excel data structure)
const sizeData = {
  "38x53 cm": {
    plano: "79x109 cm",
    jadi: 4,
    panjang: 38,
    lebar: 53,
    hvs70Price: 1150,
    hvs80Price: 1300,
    hvs100Price: 1800,
    ap120Price: 2000,
    ap150Price: 2300,
    ac210Price: 3000,
    ac230Price: 3300,
    ac260Price: 3500,
  },
  "32x48 cm": {
    plano: "65x100 cm",
    jadi: 4,
    panjang: 32,
    lebar: 48,
    hvs70Price: 1000,
    hvs80Price: 1100,
    hvs100Price: 1300,
    ap120Price: 1500,
    ap150Price: 1800,
    ac210Price: 3000,
    ac230Price: 3200,
    ac260Price: 3300,
    // Digital printing prices by quantity ranges
    digitalPrices: {
      hvs70: { "1-50": 1900, "51-100": 1800, "101-300": 1700 },
      hvs80: { "1-50": 2000, "51-100": 1900, "101-300": 1800 },
      hvs100: { "1-50": 2100, "51-100": 2000, "101-300": 1900 },
      ap120: { "1-50": 2200, "51-100": 2100, "101-300": 2000 },
      ap150: { "1-50": 2300, "51-100": 2200, "101-300": 2100 },
      ac210: { "1-50": 2400, "51-100": 2300, "101-300": 2200 },
      ac230: { "1-50": 2500, "51-100": 2400, "101-300": 2300 },
      ac260: { "1-50": 2600, "51-100": 2500, "101-300": 2400 },
    },
  },
  "44x64 cm": {
    plano: "65x100 cm",
    jadi: 2,
    panjang: 44,
    lebar: 64,
    hvs70Price: 1000,
    hvs80Price: 1100,
    hvs100Price: 1300,
    ap120Price: 1500,
    ap150Price: 1800,
    ac210Price: 3000,
    ac230Price: 3200,
    ac260Price: 3300,
  },
  "46x64 cm": {
    plano: "65x100 cm",
    jadi: 2,
    panjang: 46,
    lebar: 64,
    hvs70Price: 1000,
    hvs80Price: 1100,
    hvs100Price: 1300,
    ap120Price: 1500,
    ap150Price: 1800,
    ac210Price: 3000,
    ac230Price: 3200,
    ac260Price: 3300,
  },
};

// Paper type mapping for display names
const paperTypeNames = {
  hvs70: "HVS 70gsm",
  hvs80: "HVS 80gsm",
  hvs100: "HVS 100gsm",
  ap120: "Art Paper 120gsm",
  ap150: "Art Paper 150gsm",
  ac210: "Art Carton 210gsm",
  ac230: "Art Carton 230gsm",
  ac260: "Art Carton 260gsm",
};

// Lamination rates (matching Excel data)
const laminationRates = {
  none: { digital: 0, offset: 0 },
  doff: { digital: 1000, offset: 0.25 },
  glossy: { digital: 1000, offset: 0.15 },
};

// Lamination display names
const laminationNames = {
  none: "Tidak Ada",
  doff: "Laminasi Doff",
  glossy: "Laminasi Glossy",
};

// Format currency to IDR
function formatCurrency(number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

// Function to calculate printing cost - Updated to match Excel formula exactly
function hitungBiayaKalender(
  quantity,
  size,
  calendarType,
  paperType,
  lamination,
  finishing
) {
  // Validate inputs
  if (
    !quantity ||
    !size ||
    !calendarType ||
    !paperType ||
    !lamination ||
    !finishing
  ) {
    showError("Mohon lengkapi semua data.");
    return null;
  }

  if (quantity < 100 || quantity % 50 !== 0) {
    showError("Jumlah minimal 100 pcs dan harus dalam kelipatan 50.");
    return null;
  }

  // Get size data
  const selectedSize = sizeData[size];
  if (!selectedSize) {
    showError("Ukuran tidak valid.");
    return null;
  }

  // Determine if using digital printing (32x48 cm AND quantity <= 300)
  const isDigital = size === "32x48 cm" && quantity <= 300;

  // Calculate paper amount (KertasJml)
  let kertasJml;
  if (isDigital) {
    kertasJml = quantity * calendarType;
  } else {
    kertasJml = Math.ceil(
      ((quantity + 100) * calendarType) / selectedSize.jadi
    );
  }

  // Get paper price (KertasPrice)
  let kertasPrice = 0;
  if (isDigital) {
    // Digital printing price based on quantity ranges
    let priceRange;
    if (quantity <= 50) {
      priceRange = "1-50";
    } else if (quantity <= 100) {
      priceRange = "51-100";
    } else {
      priceRange = "101-300";
    }
    kertasPrice = selectedSize.digitalPrices[paperType][priceRange];
  } else {
    // Offset printing price
    kertasPrice = selectedSize[paperType + "Price"];
  }

  // Calculate paper cost (KertasCost)
  const kertasCost = isDigital ? 0 : kertasJml * kertasPrice;

  // Calculate printing cost (PrintCost)
  let printCost;
  if (isDigital) {
    printCost = kertasJml * kertasPrice;
  } else {
    let basePrintCost;
    if (size === "32x48 cm") {
      basePrintCost = Math.ceil(calendarType / 2) * 420000;
    } else {
      basePrintCost = calendarType * 400000;
    }

    // Add overprint cost if quantity > 1000
    let overprintCost = 0;
    if (quantity > 1000) {
      overprintCost = (quantity - 900) * calendarType * 100; // Fixed: 900 instead of 1000
    }

    printCost = basePrintCost + overprintCost;
  }

  // Calculate lamination cost (LaminasiCost)
  let laminasiCost = 0;
  if (lamination !== "none") {
    if (isDigital) {
      laminasiCost =
        quantity * calendarType * laminationRates[lamination].digital;
    } else {
      const laminasiArea = selectedSize.panjang * selectedSize.lebar;
      laminasiCost =
        laminasiArea * laminationRates[lamination].offset * kertasJml;
    }
  }

  // Calculate finishing cost (FinishCost)
  let finishUnitPrice;
  if (finishing === "Jepit Seng") {
    finishUnitPrice = 1000;
  } else if (finishing === "Spiral") {
    finishUnitPrice = selectedSize.lebar * 100;
  }
  const finishCost = (quantity + 10) * finishUnitPrice;

  // Calculate cutting cost (CutCost)
  let cutCost = 0;
  if (!isDigital && finishing !== "Spiral") {
    if (quantity < 500) {
      cutCost = 40000;
    } else if (quantity < 2000) {
      cutCost = 50000;
    } else {
      cutCost = 60000;
    }
  }

  // Calculate base total cost
  const baseCost = kertasCost + printCost + laminasiCost + finishCost + cutCost;

  // Calculate margin based on quantity
  let margin;
  if (quantity <= 300) {
    margin = 0.35;
  } else if (quantity <= 500) {
    margin = 0.43;
  } else {
    margin = 0.38;
  }

  // Final total cost calculation (matching Excel formula exactly)
  const totalCost = baseCost * (1 + margin) + 50000 / quantity;
  const pricePerPiece = totalCost / quantity;

  // Determine machine used
  let usedMachine;
  if (isDigital) {
    usedMachine = "Digital Printing";
  } else {
    usedMachine = size === "38x53 cm" ? "SM-74" : "SM-66";
  }

  // Calculate overprint details for display
  let overprintAmount = 0;
  let overprintCostDisplay = 0;
  if (!isDigital && quantity > 1000) {
    overprintAmount = quantity - 900;
    overprintCostDisplay = overprintAmount * calendarType * 100;
  }

  // Prepare return data
  return {
    mesin: usedMachine,
    quantity: quantity,
    jumlah_lembar: calendarType,
    jenis_kertas: paperTypeNames[paperType],
    ukuran_kalender: size,
    ukuran_plano: selectedSize.plano,
    jadi_per_plano: selectedSize.jadi,
    jumlah_cetak: isDigital
      ? kertasJml
      : size === "32x48 cm"
      ? Math.ceil(calendarType / 2)
      : calendarType,
    harga_cetak: isDigital
      ? kertasPrice
      : size === "32x48 cm"
      ? 420000
      : 400000,
    total_biaya_cetak: printCost,
    jumlah_overprint: overprintAmount,
    harga_overprint: overprintAmount > 0 ? 100 : 0,
    total_biaya_overprint: overprintCostDisplay,
    jumlah_kertas: kertasJml,
    harga_kertas: kertasPrice,
    total_biaya_kertas: kertasCost,
    laminasi: laminationNames[lamination],
    total_biaya_laminasi: laminasiCost,
    finishing: finishing,
    jumlah_finishing: quantity + 10,
    harga_finishing: finishUnitPrice,
    total_biaya_finishing: finishCost,
    harga_potong: cutCost > 0 ? cutCost : 0,
    total_biaya_potong: cutCost,
    subtotal: baseCost,
    total_biaya: totalCost,
    harga_per_buah: pricePerPiece,
    is_digital: isDigital,
    margin_used: margin,
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

// Display calculation results
function displayResults(hasil) {
  // Hide error alert if visible
  document.getElementById("errorAlert").style.display = "none";

  // Display result card
  document.getElementById("resultCard").style.display = "block";

  // Set machine badge
  const mesinBadge = document.getElementById("mesinBadge");
  mesinBadge.textContent = hasil.mesin;

  if (hasil.mesin === "SM-74") {
    mesinBadge.className = "badge bg-primary badge-sm74";
  } else if (hasil.mesin === "SM-66") {
    mesinBadge.className = "badge bg-success badge-sm66";
  } else if (hasil.mesin === "Digital Printing") {
    mesinBadge.className = "badge bg-warning badge-digital";
  }

  // Display simplified results
  document.getElementById("jumlahCetak").textContent =
    formatCurrency(hasil.quantity) +
    " pcs (" +
    hasil.jumlah_lembar +
    " lembar/set)";

  document.getElementById(
    "bahan"
  ).textContent = `${hasil.jenis_kertas}, uk. ${hasil.ukuran_kalender}`;

  // Display finishing with lamination info
  let finishingText = hasil.finishing;
  if (hasil.laminasi !== "Tidak Ada") {
    finishingText += `, ${hasil.laminasi}`;
  }
  document.getElementById("finishingInfo").textContent = finishingText;

  document.getElementById("totalBiaya").textContent =
    "Rp " + formatCurrency(hasil.total_biaya);

  document.getElementById("hargaPerBuah").textContent =
    "Rp " + formatCurrency(hasil.harga_per_buah);
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

// Handle form submission
document
  .getElementById("calculatorForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    // Get form values
    const quantity = parseInt(document.getElementById("quantity").value);
    const size = document.getElementById("size").value;
    const calendarType = parseInt(document.getElementById("type").value);
    const paperType = document.getElementById("paper").value;
    const lamination = document.getElementById("lamination").value;
    const finishing = document.getElementById("finishing").value;

    // Calculate cost
    const hasil = hitungBiayaKalender(
      quantity,
      size,
      calendarType,
      paperType,
      lamination,
      finishing
    );

    if (hasil) {
      // Display results
      displayResults(hasil);

      // Log detailed calculation for debugging
      console.log("Calculation Results:", {
        "Is Digital": hasil.is_digital,
        "Kertas Jumlah": hasil.jumlah_kertas,
        "Kertas Price": hasil.harga_kertas,
        "Kertas Cost": hasil.total_biaya_kertas,
        "Print Cost": hasil.total_biaya_cetak,
        "Laminasi Cost": hasil.total_biaya_laminasi,
        "Finishing Cost": hasil.total_biaya_finishing,
        "Cut Cost": hasil.total_biaya_potong,
        Subtotal: hasil.subtotal,
        Margin: hasil.margin_used,
        "Total Cost": hasil.total_biaya,
        "Price per Piece": hasil.harga_per_buah,
      });
    }
  });

// Reset button handler
document.getElementById("resetBtn").addEventListener("click", resetForm);

// Reset the form when the page loads/refreshes
window.addEventListener("load", resetForm);

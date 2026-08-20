// Data ukuran dan harga (updated with new paper types and prices)
const sizeData = {
  "38x53 cm": {
    plano: "79x109 cm",
    jadi: 4,
    hvs70Price: 1200,
    hvs80Price: 1500,
    artPaper100Price: 2000,
    artPaper120Price: 2200,
    artPaper150Price: 2300,
    artCarton210Price: 4200,
    artCarton230Price: 4500,
    artCarton260Price: 4700,
    width: 38, // for spiral calculation
  },
  "32x48 cm / A3": {
    plano: "65x100 cm",
    jadi: 4,
    hvs70Price: 800,
    hvs80Price: 870,
    artPaper100Price: 1450,
    artPaper120Price: 1700,
    artPaper150Price: 2100,
    artCarton210Price: 3000,
    artCarton230Price: 3150,
    artCarton260Price: 3300,
    width: 32, // for spiral calculation
  },
  "44x64 cm": {
    plano: "65x100 cm",
    jadi: 2,
    hvs70Price: 800,
    hvs80Price: 870,
    artPaper100Price: 1450,
    artPaper120Price: 1700,
    artPaper150Price: 2100,
    artCarton210Price: 3000,
    artCarton230Price: 3150,
    artCarton260Price: 3300,
    width: 44, // for spiral calculation
  },
  "46x64 cm": {
    plano: "65x100 cm",
    jadi: 2,
    hvs70Price: 800,
    hvs80Price: 870,
    artPaper100Price: 1450,
    artPaper120Price: 1700,
    artPaper150Price: 2100,
    artCarton210Price: 3000,
    artCarton230Price: 3150,
    artCarton260Price: 3300,
    width: 46, // for spiral calculation
  },
};

// Paper type mapping for display names
const paperTypeNames = {
  hvs70: "HVS 70gsm",
  hvs80: "HVS 80gsm",
  artPaper100: "Art Paper 100gsm",
  artPaper120: "Art Paper 120gsm",
  artPaper150: "Art Paper 150gsm",
  artCarton210: "Art Carton 210gsm",
  artCarton230: "Art Carton 230gsm",
  artCarton260: "Art Carton 260gsm",
};

// Format currency to IDR
function formatCurrency(number) {
  return new Intl.NumberFormat("id-ID").format(number);
}

// Format number with 2 decimal places
function formatDecimal(number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

// Round to nearest 100 (up if >= 50, down if < 50)
function roundToNearest100(num) {
  return Math.floor(num / 100) * 100;
}

// Function to calculate printing cost
function hitungBiayaKalender(
  quantity,
  size,
  calendarType,
  paperType,
  finishing
) {
  // Validate inputs
  if (!quantity || !size || !calendarType || !paperType || !finishing) {
    showError("Mohon lengkapi semua data.");
    return null;
  }

  if (quantity < 100 || quantity % 50 !== 0) {
    showError("Jumlah minimal 100 pcs dan harus dalam kelipatan 50.");
    return null;
  }

  // Get size data
  const selectedSize = sizeData[size];

  // Calculate paper amount
  const paperAmount = Math.ceil(
    ((quantity + 100) * calendarType) / selectedSize.jadi
  );

  // Get paper price based on paper type
  let paperPrice = 0;
  let paperTypeName = "";

  switch (paperType) {
    case "hvs70":
      paperPrice = selectedSize.hvs70Price;
      paperTypeName = paperTypeNames.hvs70;
      break;
    case "hvs80":
      paperPrice = selectedSize.hvs80Price;
      paperTypeName = paperTypeNames.hvs80;
      break;
    case "artPaper100":
      paperPrice = selectedSize.artPaper100Price;
      paperTypeName = paperTypeNames.artPaper100;
      break;
    case "artPaper120":
      paperPrice = selectedSize.artPaper120Price;
      paperTypeName = paperTypeNames.artPaper120;
      break;
    case "artPaper150":
      paperPrice = selectedSize.artPaper150Price;
      paperTypeName = paperTypeNames.artPaper150;
      break;
    case "artCarton210":
      paperPrice = selectedSize.artCarton210Price;
      paperTypeName = paperTypeNames.artCarton210;
      break;
    case "artCarton230":
      paperPrice = selectedSize.artCarton230Price;
      paperTypeName = paperTypeNames.artCarton230;
      break;
    case "artCarton260":
      paperPrice = selectedSize.artCarton260Price;
      paperTypeName = paperTypeNames.artCarton260;
      break;
  }

  // Calculate paper cost
  const paperCost = paperAmount * paperPrice;

  // Calculate overprint
  let overprintAmount = 0;
  if (quantity > 1000) {
    overprintAmount = quantity - 1000 + 100;
  }
  const overprintUnitPrice = 100;
  const overprintCost = overprintAmount * overprintUnitPrice * calendarType;

  // Determine machine based on size (38x53 uses SM-74, others use SM-66)
  const usedMachine = size === "38x53 cm" ? "SM-74" : "SM-66";

  // Calculate printing cost
  let printUnitPrice;
  if (size === "32x48 cm / A3") {
    printUnitPrice = 420000;
  } else {
    printUnitPrice = 400000;
  }

  let totalPrintCost;
  let printAmount;

  // Calculate print amount based on size
  if (size === "32x48 cm / A3") {
    // For 32x48: (jumlah lembar jenis kalender / 2) rounded up × harga cetak
    printAmount = Math.ceil(calendarType / 2);
  } else {
    // For other sizes: jumlah lembar jenis kalender × harga cetak
    printAmount = calendarType;
  }

  totalPrintCost = printAmount * printUnitPrice;

  // Calculate finishing cost - Updated spiral calculation
  let finishingUnitPrice;
  if (finishing === "Jepit Seng") {
    finishingUnitPrice = 1000;
  } else if (finishing === "Spiral") {
    // New spiral calculation: length x Rp. 100
    finishingUnitPrice = selectedSize.width * 100;
  }

  const finishingAmount = quantity + 10;
  const finishingCost = finishingUnitPrice * finishingAmount;

  // Calculate cutting cost
  let cuttingCost = 0;
  let cuttingUnitPrice = 0;
  if (finishing !== "Spiral") {
    if (quantity < 500) {
      cuttingUnitPrice = 40000;
    } else if (quantity < 2000) {
      cuttingUnitPrice = 50000;
    } else {
      cuttingUnitPrice = 60000;
    }
    cuttingCost = cuttingUnitPrice;
  }

  // Calculate base total cost
  const baseTotalCost =
    paperCost + overprintCost + totalPrintCost + finishingCost + cuttingCost;

  // Add 35% profit margin
  const totalCost = baseTotalCost + baseTotalCost * 0.35;

  // Calculate price per piece
  const pricePerPiece = roundToNearest100(totalCost / quantity);

  // Prepare data for results
  return {
    mesin: usedMachine,
    quantity: quantity,
    jumlah_lembar: calendarType,
    jenis_kertas: paperTypeName,
    ukuran_kalender: size,
    ukuran_plano: selectedSize.plano,
    jadi_per_plano: selectedSize.jadi,
    jumlah_cetak: printAmount,
    harga_cetak: printUnitPrice,
    total_biaya_cetak: totalPrintCost,
    jumlah_overprint: overprintAmount > 0 ? overprintAmount : 0,
    harga_overprint: overprintUnitPrice,
    total_biaya_overprint: overprintCost,
    jumlah_kertas: paperAmount,
    harga_kertas: paperPrice,
    total_biaya_kertas: paperCost,
    finishing: finishing,
    jumlah_finishing: finishingAmount,
    harga_finishing: finishingUnitPrice,
    total_biaya_finishing: finishingCost,
    harga_potong: cuttingUnitPrice,
    total_biaya_potong: cuttingCost,
    subtotal: baseTotalCost,
    total_biaya: totalCost,
    harga_per_buah: pricePerPiece,
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
  mesinBadge.className =
    "badge " +
    (hasil.mesin === "SM-74"
      ? "bg-primary badge-sm74"
      : "bg-success badge-sm66");

  // Display simplified results
  document.getElementById("jumlahCetak").textContent =
    formatCurrency(hasil.quantity) +
    " pcs (" +
    hasil.jumlah_lembar +
    " lembar/set)";

  document.getElementById(
    "bahan"
  ).textContent = `${hasil.jenis_kertas}, uk. ${hasil.ukuran_kalender}`;

  document.getElementById("finishingInfo").textContent = hasil.finishing;

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
    const finishing = document.getElementById("finishing").value;

    // Calculate cost
    const hasil = hitungBiayaKalender(
      quantity,
      size,
      calendarType,
      paperType,
      finishing
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

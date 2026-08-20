// Data ukuran dan harga
const sizeData = {
  "15x21": {
    plano: "33x43 cm",
    jadi: { 7: 2, 13: 3.5 }, // hasil pembagian plano berdasarkan jenis kalender
  },
  "21x15": {
    plano: "33x43 cm",
    jadi: { 7: 2, 13: 3.5 }, // hasil pembagian plano berdasarkan jenis kalender
  },
};

// Harga kertas
const paperPrices = {
  artCarton210: 600,
  artCarton230: 700,
  artCarton260: 800,
};

// Paper type apping for display names
const paperTypeNames = {
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

// Round to nearest 50 down
function roundToNearest50Down(num) {
  return Math.floor(num / 50) * 50;
}

// Function to calculate printing cost
function hitungBiayaKalender(quantity, size, calendarType, paperType) {
  // Validate inputs
  if (!quantity || !size || !calendarType || !paperType) {
    showError("Mohon lengkapi semua data.");
    return null;
  }

  if (quantity < 100 || quantity % 50 !== 0) {
    showError("Jumlah minimal 100 pcs dan harus dalam kelipatan 50.");
    return null;
  }

  // Get size data
  const selectedSize = sizeData[size];
  const jadiPerPlano = selectedSize.jadi[calendarType];

  // Calculate paper amount: (oplah + 100) x hasil pembagian plano
  const paperAmount = (quantity + 100) * jadiPerPlano;

  // Get paper price
  const paperPrice = paperPrices[paperType];
  const paperTypeName = paperTypeNames[paperType];

  // Calculate paper cost
  const paperCost = paperAmount * paperPrice;

  // Calculate overprint
  let overprintAmount = 0;
  if (quantity > 1000) {
    overprintAmount = quantity - 1000 + 100;
  }
  const overprintUnitPrice = 80;
  const overprintCost = overprintAmount * overprintUnitPrice;

  // Calculate printing cost
  const printUnitPrice = 280000;
  // jumlah lembar jenis kalender/2 (dibulatkan ke bilangan bulat terdekat) x harga cetak
  const printAmount = Math.round(calendarType / 2);
  const totalPrintCost = printAmount * printUnitPrice;

  // Calculate finishing cost (Hard Cover - Spiral)
  const finishingUnitPrice = 10000;
  const finishingAmount = quantity + 10;
  const finishingCost = finishingUnitPrice * finishingAmount;

  // Calculate subtotal
  const subtotal = paperCost + overprintCost + totalPrintCost + finishingCost;

  // Calculate total with 35% markup
  const totalCost = subtotal + subtotal * 0.35;

  // Calculate price per piece
  const pricePerPiece = totalCost / quantity;

  let calendarTypeName = "";
  if (calendarType === 7) {
    calendarTypeName = "Dwiwulan + Cover (7 lembar)";
  } else if (calendarType === 13) {
    calendarTypeName = "Bulanan + Cover (13 lembar)";
  }

  // Prepare data for results
  return {
    quantity: quantity,
    jumlah_lembar: calendarType,
    jenis_kalender: calendarTypeName,
    jenis_kertas: paperTypeName,
    ukuran_kalender: size + " cm",
    ukuran_plano: selectedSize.plano,
    jadi_per_plano: jadiPerPlano,
    jumlah_cetak: printAmount,
    harga_cetak: printUnitPrice,
    total_biaya_cetak: totalPrintCost,
    jumlah_overprint: overprintAmount,
    harga_overprint: overprintUnitPrice,
    total_biaya_overprint: overprintCost,
    jumlah_kertas: paperAmount,
    harga_kertas: paperPrice,
    total_biaya_kertas: paperCost,
    finishing: "Hard Cover - Spiral",
    jumlah_finishing: finishingAmount,
    harga_finishing: finishingUnitPrice,
    total_biaya_finishing: finishingCost,
    subtotal: subtotal,
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

  // Format hasil sesuai permintaan
  const cetakDetail = `${formatCurrency(hasil.quantity)} pcs (${
    hasil.jumlah_lembar
  } lembar / set)`;
  const bahanDetail = `${hasil.jenis_kertas}, uk. ${hasil.ukuran_kalender}`;
  const finishingDetail = hasil.finishing;

  document.getElementById("cetakDetail").textContent = cetakDetail;
  document.getElementById("bahanDetail").textContent = bahanDetail;
  document.getElementById("finishingDetail").textContent = finishingDetail;
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

    // Calculate cost
    const hasil = hitungBiayaKalender(quantity, size, calendarType, paperType);

    if (hasil) {
      // Display results
      displayResults(hasil);
    }
  });

// Reset button handler
document.getElementById("resetBtn").addEventListener("click", resetForm);

// Reset the form when the page loads/refreshes
window.addEventListener("load", resetForm);

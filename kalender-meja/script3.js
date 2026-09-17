// ═══════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════

const sizeData = {
  "15x21": { panjang: 15, lebar: 21 },
  "21x15": { panjang: 21, lebar: 15 },
  custom: { panjang: 0, lebar: 0 },
};

const planoData = {
  "33x43": { panjang: 33, lebar: 43 },
};

// Dikelompokkan per kategori harga
const paperData = {
  AC210: {
    name: "Art Carton 210gsm",
    prices: {
      perLembar: 650, // qty < 1000, per lembar
      perRim: 310000, // qty >= 1000, per 500 lembar
      digital: 3700, // digital printing, per plano
    },
  },
  AC230: {
    name: "Art Carton 230gsm",
    prices: {
      perLembar: 750,
      perRim: 330000,
      digital: 3800,
    },
  },
  AC260: {
    name: "Art Carton 260gsm",
    prices: {
      perLembar: 850,
      perRim: 350000,
      digital: 3900,
    },
  },
  AC310: {
    name: "Art Carton 310gsm",
    prices: {
      perLembar: 1100,
      perRim: 400000,
      digital: 4100,
    },
  },
};

const laminationRates = {
  digital: { doff: 1000, glossy: 1000 },
  sm52: { doff: 0.25, glossy: 0.15 },
};

// ═══════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════

function formatCurrency(n) {
  return new Intl.NumberFormat("id-ID").format(Math.round(n));
}

function getMachineType(qty) {
  return qty <= 100 ? "digital" : "sm52";
}

function getSheetsPerPlano(effectiveSize) {
  const [calW, calH] = effectiveSize.split("x").map(Number);
  const { panjang: planoW, lebar: planoH } = planoData["33x43"];
  // Coba dua orientasi, ambil yang paling banyak
  const fit1 = Math.floor(planoW / calW) * Math.floor(planoH / calH);
  const fit2 = Math.floor(planoW / calH) * Math.floor(planoH / calW);
  return Math.max(fit1, fit2, 1); // min 1 untuk hindari pembagian nol
}

function getJadiPerPlano(calendarType, effectiveSize) {
  const sheetsPerPlano = getSheetsPerPlano(effectiveSize);
  return Math.ceil(calendarType / sheetsPerPlano);
}

function getDefaultMarginPct(machineType, qty) {
  if (machineType === "digital") return 68;
  if (qty <= 300) return 38; // dibawah 300
  if (qty >= 500) return 35; // diatas 500
  if (qty >= 1000) return 28; // diatas 1k
  return 36; // 301 - 499
}

// ═══════════════════════════════════════════
//  COST CALCULATIONS
// ═══════════════════════════════════════════

function calculatePaperCost(machineType, qty, totalPlano, paperType) {
  if (machineType === "digital") return 0;
  const { prices } = paperData[paperType];
  if (qty < 1000) return totalPlano * prices.perLembar;
  return Math.round(totalPlano / 500) * prices.perRim;
}

function calculatePrintCost(
  machineType,
  qty,
  calendarType,
  paperType,
  jadiPerPlano
) {
  if (machineType === "digital") {
    return qty * jadiPerPlano * paperData[paperType].prices.digital;
  }
  const sets = Math.ceil(calendarType / 2);
  const base = sets * 280000;
  const overprint = qty > 1000 ? (qty - 900) * sets * 80 : 0;
  return base + overprint;
}

function calculateLaminationCost(
  machineType,
  qty,
  calendarType,
  laminationType,
  jadiPerPlano
) {
  if (laminationType === "none") return 0;
  const rate = laminationRates[machineType][laminationType];
  const totalPlano =
    machineType === "sm52"
      ? (qty + 100) * jadiPerPlano // ← pakai param
      : qty * jadiPerPlano;
  if (machineType === "digital") return totalPlano * rate;
  const { panjang, lebar } = planoData["33x43"];
  return panjang * lebar * rate * totalPlano;
}

// ═══════════════════════════════════════════
//  PLANO SKETCH
// ═══════════════════════════════════════════

function generatePlanoSketch(effectiveSize) {
  const [kPanjang, kLebar] = effectiveSize.split("x").map(Number);
  const p = planoData["33x43"]; // { panjang: 33, lebar: 43 }

  const o1 = {
    cols: Math.floor(p.panjang / kPanjang),
    rows: Math.floor(p.lebar / kLebar),
  };
  const o2 = {
    cols: Math.floor(p.lebar / kPanjang),
    rows: Math.floor(p.panjang / kLebar),
  };

  const useO1 = o1.cols * o1.rows >= o2.cols * o2.rows;
  const ori = useO1 ? { ...o1 } : { ...o2 };
  let pw = useO1 ? p.panjang : p.lebar;
  let ph = useO1 ? p.lebar : p.panjang;

  let kw = kPanjang,
    kh = kLebar;

  let [finalPw, finalPh] = ph > pw ? [ph, pw] : [pw, ph];
  if (ph > pw) {
    [ori.cols, ori.rows] = [ori.rows, ori.cols];
    [kw, kh] = [kh, kw];
  }

  let rects = "";
  for (let r = 0; r < ori.rows; r++) {
    for (let c = 0; c < ori.cols; c++) {
      const x = c * kw,
        y = r * kh;
      rects += `
        <rect x="${x}" y="${y}" width="${kw}" height="${kh}"
              fill="#e8f4ff" stroke="#0466c8" stroke-width="0.25"/>
        ${
          c < ori.cols - 1
            ? `<line x1="${(c + 1) * kw}" y1="0" x2="${
                (c + 1) * kw
              }" y2="${finalPh}"
                   stroke="#0466c8" stroke-width="0.5" stroke-dasharray="4,3"/>`
            : ""
        }
        ${
          r < ori.rows - 1
            ? `<line x1="0" y1="${(r + 1) * kh}" x2="${finalPw}" y2="${
                (r + 1) * kh
              }"
                   stroke="#0466c8" stroke-width="0.5" stroke-dasharray="4,3"/>`
            : ""
        }
        <text x="${x + kw / 2}" y="${y + kh / 2}" text-anchor="middle"
              dominant-baseline="middle"
              font-size="${Math.min(kw, kh) * 0.18}"
              fill="#0354a0" font-weight="700">
          ${kLebar}×${kPanjang}
        </text>`;
    }
  }

  const totalLembar = ori.cols * ori.rows;

  return `
    <svg viewBox="0 0 ${finalPw} ${finalPh}"
         style="width:100%; max-width:200px; display:inline-block;"
         xmlns="http://www.w3.org/2000/svg">
      <rect width="${finalPw}" height="${finalPh}" fill="#e8f4ff" stroke="#0466c8" stroke-width="1" rx="2"/>
      ${rects}
    </svg>
    <div class="text-center text-muted mt-1" style="font-size:11px;">
      33×43 cm · ${totalLembar} lembar/plano (${ori.cols}×${ori.rows})
    </div>`;
}

// ═══════════════════════════════════════════
//  MODAL
// ═══════════════════════════════════════════

let lastCalcData = null;

function row(label, value) {
  return `<div class="modal-detail-row"><span>${label}</span><span>${value}</span></div>`;
}
function rowTotal(label, value) {
  return `<div class="modal-detail-row modal-detail-total"><span>${label}</span><span>${value}</span></div>`;
}

function updateModalTotals(marginPct) {
  if (!lastCalcData) return;
  const { subtotal, hadiah, quantity } = lastCalcData;
  const margin = marginPct / 100;
  const total = subtotal * (1 + margin) + 50000 + hadiah / quantity;
  const perPcs = total / quantity;

  document.getElementById("modalSubtotal").textContent =
    "Rp " + formatCurrency(subtotal);
  document.getElementById("modalHpp").textContent =
    "Rp " + formatCurrency(subtotal / quantity);
  document.getElementById("modalTotal").textContent =
    "Rp " + formatCurrency(total);
  document.getElementById("modalPerPcs").textContent =
    "Rp " + formatCurrency(perPcs);

  // Sync main card
  document.getElementById("totalBiaya").textContent =
    "Rp " + formatCurrency(total);
  document.getElementById("hargaPerPcs").textContent =
    "Rp " + formatCurrency(perPcs);
}

function buildModalContent(ctx) {
  const {
    machineType,
    quantity,
    size: effectiveSize,
    calendarType,
    jadiPerPlano,
    totalPlano,
    paperType,
    laminationType,
    paperCost,
    printCost,
    finishingCost,
    laminationCost,
    subtotal,
    defaultMarginPct,
    hadiah,
  } = ctx;

  const IS_DIG = machineType === "digital";
  const paper = paperData[paperType];
  const sets = Math.ceil(calendarType / 2);
  const overprintAmt = !IS_DIG && quantity > 1000 ? quantity - 900 : 0;
  const overprintCost = overprintAmt * sets * 80;
  const lamiLabel =
    laminationType === "none"
      ? "Tidak Ada"
      : laminationType === "doff"
      ? "Laminasi Doff"
      : "Laminasi Glossy";

  // Header
  document.getElementById(
    "modalTitle"
  ).textContent = `${calendarType} lembar · ${effectiveSize} cm`;
  document.getElementById("modalMachineBadge").innerHTML = IS_DIG
    ? '<span class="badge badge-digital">Digital Printing</span>'
    : '<span class="badge badge-sm52">SM-52</span>';
  document.getElementById("modalSubtitle").textContent = `${
    paper.name
  } · ${formatCurrency(quantity)} pcs`;

  // Plano sketch
  document.getElementById("modalPlanoSketch").innerHTML =
    generatePlanoSketch(effectiveSize);

  // Paper / Kertas section
  let paperHtml;
  if (IS_DIG) {
    paperHtml =
      row("Harga/plano", `Rp ${formatCurrency(paper.prices.digital)}`) +
      row(
        "Total plano",
        `<strong>${formatCurrency(totalPlano)} plano</strong>`
      ) +
      rowTotal(
        "Biaya cetak",
        `<strong>Rp ${formatCurrency(printCost)}</strong>`
      );
  } else {
    const useRim = quantity >= 1000;
    const priceVal = useRim ? paper.prices.perRim : paper.prices.perLembar;
    const priceLabel = useRim ? "Harga/rim" : "Harga/lembar";
    const totalLabel = useRim
      ? `${Math.round(totalPlano / 500)} rim`
      : `${formatCurrency(totalPlano)} lbr`;
    paperHtml =
      row("Kebutuhan/set", `${jadiPerPlano} plano`) +
      row("Total plano", `<strong>${totalLabel}</strong>`) +
      row(priceLabel, `Rp ${formatCurrency(priceVal)}`) +
      rowTotal(
        "Biaya kertas",
        `<strong>Rp ${formatCurrency(paperCost)}</strong>`
      );
  }
  document.getElementById("modalPaperDetails").innerHTML = paperHtml;

  // Cetak section
  let printHtml;
  if (IS_DIG) {
    printHtml = `<p class="text-muted small mb-0 py-1">Sudah termasuk dalam biaya plano di atas.</p>`;
  } else {
    printHtml =
      row("Jumlah set", sets) +
      row("Harga/set", `Rp ${formatCurrency(280000)}`);
    if (overprintAmt > 0) {
      printHtml += row(
        "Overprint",
        `${formatCurrency(overprintAmt)} lbr — <strong>Rp ${formatCurrency(
          overprintCost
        )}</strong>`
      );
    }
    printHtml += rowTotal(
      "Biaya cetak",
      `<strong>Rp ${formatCurrency(printCost)}</strong>`
    );
  }
  document.getElementById("modalPrintDetails").innerHTML = printHtml;

  // Laminasi & Finishing
  document.getElementById("modalLaminasiFinishing").innerHTML =
    row(
      "Laminasi",
      lamiLabel +
        (laminationCost > 0 ? ` — Rp ${formatCurrency(laminationCost)}` : "")
    ) +
    row(
      "Finishing",
      `Hard Cover - Spiral (${formatCurrency(quantity + 10)} pcs)` +
        ` — <strong>Rp ${formatCurrency(finishingCost)}</strong>`
    ) +
    row("Hadiah langsung", `Rp ${formatCurrency(hadiah)}`);

  // Margin input
  document.getElementById("marginInput").value = defaultMarginPct;
  document.getElementById(
    "defaultMarginHint"
  ).textContent = `default ${defaultMarginPct}% dari quantity`;

  // Totals
  updateModalTotals(defaultMarginPct);
}

// ═══════════════════════════════════════════
//  MAIN CALCULATION
// ═══════════════════════════════════════════

function hitungBiayaKalender(
  qty,
  size,
  calendarType,
  paperType,
  laminationType
) {
  if (!qty || !size || !calendarType || !paperType || !laminationType) {
    showError("Mohon lengkapi semua data.");
    return null;
  }
  if (qty < 100 || qty % 50 !== 0) {
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

  const machineType = getMachineType(qty);
  // Resolusi ukuran efektif
  let effectiveSize = size;
  if (size === "custom") {
    const p = parseInt(document.getElementById("sizePanjang").value);
    const l = parseInt(document.getElementById("sizeLebar").value);
    if (!p || !l || p < 1 || l < 1) {
      showError("Masukkan ukuran custom yang valid (panjang dan lebar).");
      return null;
    }
    effectiveSize = `${p}x${l}`;
  }
  const plano = "33x43 cm";
  const jadiPerPlano = getJadiPerPlano(calendarType, effectiveSize);
  const totalPlano =
    machineType === "sm52" ? (qty + 100) * jadiPerPlano : qty * jadiPerPlano;

  const paperCost = calculatePaperCost(machineType, qty, totalPlano, paperType);
  const printCost = calculatePrintCost(
    machineType,
    qty,
    calendarType,
    paperType,
    jadiPerPlano
  );
  const finishingCost = (qty + 10) * 10000;
  const laminationCost = calculateLaminationCost(
    machineType,
    qty,
    calendarType,
    laminationType,
    jadiPerPlano
  );
  const hadiah = 30000;
  const subtotal = paperCost + printCost + finishingCost + laminationCost;

  const defaultMarginPct = getDefaultMarginPct(machineType, qty);
  const margin = defaultMarginPct / 100;
  const totalCost = subtotal * (1 + margin) + 50000 + hadiah / qty;
  const pricePerPiece = totalCost / qty;
  const hpp = subtotal / qty;

  // Store for dynamic margin updates
  lastCalcData = { subtotal, hadiah, quantity: qty, defaultMarginPct };

  // Console log
  console.clear();
  console.log(
    "%c=== SPESIFIKASI ===",
    "color:#0466c8;font-weight:bold;font-size:13px"
  );
  console.log(
    `Mesin: ${
      machineType === "digital" ? "Digital" : "SM-52"
    } | Plano: ${plano}`
  );
  console.log(
    `Qty: ${formatCurrency(
      qty
    )} pcs | Ukuran: ${size} cm | ${calendarType} lembar`
  );
  console.log(
    `Jadi/plano: ${jadiPerPlano} | Total plano: ${formatCurrency(totalPlano)}`
  );
  if (laminationType !== "none") console.log(`Laminasi: ${laminationType}`);
  console.log(
    "%c=== RINCIAN BIAYA ===",
    "color:#0466c8;font-weight:bold;font-size:13px"
  );
  if (machineType === "sm52")
    console.log(`Kertas     : Rp ${formatCurrency(paperCost)}`);
  console.log(`Cetak      : Rp ${formatCurrency(printCost)}`);
  console.log(`Finishing  : Rp ${formatCurrency(finishingCost)}`);
  if (laminationCost > 0)
    console.log(`Laminasi   : Rp ${formatCurrency(laminationCost)}`);
  console.log(
    "%c=== TOTAL ===",
    "color:#0466c8;font-weight:bold;font-size:13px"
  );
  console.log(
    `Subtotal   : Rp ${formatCurrency(subtotal)} | HPP/pcs: Rp ${formatCurrency(
      hpp
    )}`
  );
  console.log(`Margin     : ${defaultMarginPct}%`);
  console.log(
    `Total      : Rp ${formatCurrency(
      totalCost
    )} | Harga/pcs: Rp ${formatCurrency(pricePerPiece)}`
  );

  // Build modal
  buildModalContent({
    machineType,
    quantity: qty,
    size: effectiveSize,
    calendarType,
    jadiPerPlano,
    totalPlano,
    paperType,
    laminationType,
    paperCost,
    printCost,
    finishingCost,
    laminationCost,
    subtotal,
    defaultMarginPct,
    hadiah,
  });

  return {
    quantity: qty,
    machineType,
    calendarType: parseInt(calendarType),
    jenis_kertas: paperData[paperType].name,
    ukuran_kalender: effectiveSize + " cm",
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

// ═══════════════════════════════════════════
//  UI
// ═══════════════════════════════════════════

function resetForm() {
  document.getElementById("calculatorForm").reset();
  document.getElementById("resultCard").style.display = "none";
  document.getElementById("errorAlert").style.display = "none";
  // document.getElementById("machineInfo").style.display = "none";
  lastCalcData = null;
}

function showError(msg) {
  const el = document.getElementById("errorAlert");
  el.textContent = msg;
  el.style.display = "block";
  document.getElementById("resultCard").style.display = "none";
}

function displayResults(hasil) {
  document.getElementById("errorAlert").style.display = "none";
  document.getElementById("resultCard").style.display = "block";

  document.getElementById("mesinDetail").innerHTML =
    hasil.machineType === "digital"
      ? '<span class="badge badge-digital">Digital Printing</span>'
      : '<span class="badge badge-sm52">Speedmaster-52</span>';

  document.getElementById("cetakDetail").textContent = `${formatCurrency(
    hasil.quantity
  )} pcs (${hasil.calendarType} lembar/set)`;
  document.getElementById("bahanDetail").textContent = hasil.jenis_kertas;
  document.getElementById("planoDetail").textContent = hasil.plano;

  let finishingText = "Hard Cover - Spiral";
  if (hasil.laminationType !== "none") {
    finishingText += `, ${
      hasil.laminationType === "doff" ? "Laminasi Doff" : "Laminasi Glossy"
    }`;
  }
  document.getElementById("finishingDetail").textContent = finishingText;

  document.getElementById("totalBiaya").textContent =
    "Rp " + formatCurrency(hasil.totalCost);
  document.getElementById("hargaPerPcs").textContent =
    "Rp " + formatCurrency(hasil.pricePerPiece);
}

// function updateMachineInfo(qty) {
//   const el = document.getElementById("machineInfo");
//   const text = document.getElementById("machineInfoText");
//   if (qty >= 100) {
//     text.textContent =
//       getMachineType(qty) === "digital"
//         ? "Digital Printing (maks. 100 pcs)"
//         : "Mesin SM-52 (di atas 100 pcs)";
//     el.style.display = "block";
//   } else {
//     el.style.display = "none";
//   }
// }

// ═══════════════════════════════════════════
//  EVENT LISTENERS
// ═══════════════════════════════════════════

document.getElementById("quantity").addEventListener("input", function () {
  const v = parseInt(this.value);
  const ok = !isNaN(v) && v >= 100 && v % 50 === 0;
  this.classList.toggle("is-invalid", !ok);
  // if (ok) updateMachineInfo(v);
  // else document.getElementById("machineInfo").style.display = "none";
});

document.getElementById("size").addEventListener("change", function () {
  const pEl = document.getElementById("sizePanjang");
  const lEl = document.getElementById("sizeLebar");

  if (this.value === "custom") {
    pEl.disabled = false;
    lEl.disabled = false;
    pEl.value = "";
    lEl.value = "";
    pEl.focus();
  } else {
    const dim = sizeData[this.value];
    pEl.disabled = true;
    lEl.disabled = true;
    pEl.value = dim ? dim.panjang : "";
    lEl.value = dim ? dim.lebar : "";
  }
});

document.getElementById("type").addEventListener("input", function () {
  const v = parseInt(this.value);
  const err = document.getElementById("typeError");
  if (v > 14) {
    this.classList.add("is-invalid");
    err.style.display = "block";
  } else if (v >= 1) {
    this.classList.remove("is-invalid");
    err.style.display = "none";
  }
});

document.getElementById("marginInput").addEventListener("input", function () {
  const v = parseFloat(this.value);
  if (!isNaN(v) && v >= 0) updateModalTotals(v);
});

document
  .getElementById("calculatorForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const qty = parseInt(document.getElementById("quantity").value);
    const size = document.getElementById("size").value;
    const calendarType = parseInt(document.getElementById("type").value);
    const paperType = document.getElementById("paper").value;
    const laminationType = document.getElementById("lamination").value;

    const hasil = hitungBiayaKalender(
      qty,
      size,
      calendarType,
      paperType,
      laminationType
    );
    if (hasil) displayResults(hasil);
  });

document.getElementById("resetBtn").addEventListener("click", resetForm);
window.addEventListener("load", resetForm);

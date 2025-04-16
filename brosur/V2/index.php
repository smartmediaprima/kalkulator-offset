<?php
// Program untuk menghitung biaya cetak brosur dengan spesifikasi mesin SM-74 dan SM-52

// Fungsi untuk menghitung biaya cetak brosur
function hitungBiayaCetak($oplah, $jumlahMuka = 1) {
    // Tentukan mesin yang digunakan berdasarkan oplah
    $mesin = ($oplah >= 5000) ? 'SM-74' : 'SM-52';
    
    // Harga cetak berdasarkan mesin
    $hargaCetak = ($mesin == 'SM-74') ? 400000 : 280000;
    
    // Hitung jumlah overprint dan biaya overprint
    $jumlahOverprint = 0;
    $hargaOverprint = 0;
    
    if ($mesin == 'SM-74') {
        // SM-74: jika oplah < 2000, tidak ada overprint, harga 100 per lembar
        if ($oplah >= 2000) {
            $jumlahOverprint = $oplah - 1000; // Asumsi: oplah - 1000 untuk SM-74
            $hargaOverprint = 100; // Rp. 100 per lembar
        }
    } else {
        // SM-52: jika oplah >= 2000, rumus total overprint
        if ($oplah >= 2000) {
            $jumlahOverprint = ($oplah * $jumlahMuka / 2) - 1000;
            $hargaOverprint = 80; // Rp. 80 per lembar
        }
    }
    
    // Hitung jumlah kertas dan biaya kertas
    $jumlahKertas = 0;
    $hargaKertas = 0;
    
    if ($mesin == 'SM-74') {
        // SM-74: jumlah cetak/4+100, harga 900 per kertas
        $jumlahKertas = ceil($oplah / 4) + 100;
        $hargaKertas = 900; // Rp. 900 per kertas
    } else {
        // SM-52: jumlah cetak/2+100, harga 450 per kertas
        $jumlahKertas = ceil($oplah / 2) + 100;
        $hargaKertas = 450; // Rp. 450 per kertas
    }
    
    // Biaya potong
    $biayaPotong = 20000; // Rp. 20.000
    
    // Hitung total biaya overprint
    $totalBiayaOverprint = $jumlahOverprint * $hargaOverprint;
    
    // Hitung total biaya kertas
    $totalBiayaKertas = $jumlahKertas * $hargaKertas;
    
    // Hitung total biaya
    $totalBiaya = $hargaCetak + $totalBiayaOverprint + $totalBiayaKertas + $biayaPotong;
    
    // Hitung harga per lembar
    $hargaPerLembar = $totalBiaya / $oplah;
    
    // Siapkan data untuk hasil
    $hasil = [
        'mesin' => $mesin,
        'oplah' => $oplah,
        'jumlah_muka' => $jumlahMuka,
        'harga_cetak' => $hargaCetak,
        'jumlah_overprint' => max(0, $jumlahOverprint), // Pastikan tidak negatif
        'harga_overprint' => $hargaOverprint,
        'total_biaya_overprint' => max(0, $totalBiayaOverprint), // Pastikan tidak negatif
        'jumlah_kertas' => $jumlahKertas,
        'harga_kertas' => $hargaKertas,
        'total_biaya_kertas' => $totalBiayaKertas,
        'biaya_potong' => $biayaPotong,
        'total_biaya' => $totalBiaya,
        'harga_per_lembar' => $hargaPerLembar
    ];
    
    return $hasil;
}

// Form handling
$pesanError = "";
$hasilPerhitungan = null;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Ambil data dari form
    $oplah = isset($_POST['oplah']) ? (int)$_POST['oplah'] : 0;
    $jumlahMuka = isset($_POST['jumlah_muka']) ? (int)$_POST['jumlah_muka'] : 1;
    
    // Validasi input dasar
    if ($oplah <= 0) {
        $pesanError = "Jumlah oplah harus lebih dari 0";
    } elseif ($jumlahMuka <= 0 || $jumlahMuka > 2) {
        $pesanError = "Jumlah muka harus 1 atau 2";
    } else {
        // Hitung biaya
        $hasilPerhitungan = hitungBiayaCetak($oplah, $jumlahMuka);
    }
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kalkulator Cetak Brosur</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Inter Font -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap">
    
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8f9fa;
            padding-top: 2rem;
            padding-bottom: 2rem;
        }
        
        .container {
            max-width: 900px;
        }
        
        .header {
            margin-bottom: 2rem;
        }
        
        .card {
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }
        
        .card-header {
            background-color: #f8f9fa;
            border-bottom: 1px solid rgba(0, 0, 0, 0.125);
            font-weight: 600;
        }
        
        .info-card {
            background-color: #f1f8ff;
            border-left: 5px solid #0d6efd;
        }
        
        .machine-card {
            transition: all 0.3s;
        }
        
        .machine-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
        }
        
        .sm74-card {
            border-top: 5px solid #0d6efd;
        }
        
        .sm52-card {
            border-top: 5px solid #198754;
        }
        
        .btn-primary {
            background-color: #0d6efd;
            border: none;
            padding: 0.6rem 1.5rem;
            font-weight: 500;
        }
        
        .result-header {
            background-color: #0d6efd;
            color: white;
            padding: 1rem;
            border-radius: 10px 10px 0 0;
        }
        
        .table-result th {
            background-color: #f8f9fa;
        }
        
        .total-row {
            background-color: #f1f8ff;
            font-weight: 600;
        }
        
        .price-per-piece {
            background-color: #e8f4ff;
        }
        
        .badge-sm74 {
            background-color: #0d6efd !important;
        }
        
        .badge-sm52 {
            background-color: #198754 !important;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header text-center">
            <h1 class="fw-bold">Kalkulator Biaya Cetak Brosur</h1>
            <p class="text-muted">Perhitungan otomatis biaya cetak brosur dengan mesin SM-74 dan SM-52</p>
        </div>
        
        <!-- <div class="row mb-4">
            <div class="col-md-6 mb-3 mb-md-0">
                <div class="card machine-card sm74-card h-100">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Mesin SM-74</h5>
                    </div>
                    <div class="card-body">
                        <h6 class="fw-bold">Digunakan untuk oplah ≥ 5.000 pcs</h6>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item">Harga cetak: Rp 400.000</li>
                            <li class="list-group-item">Overprint: Jika oplah ≥ 2.000, (oplah - 1.000) lembar dengan harga Rp 100/lembar</li>
                            <li class="list-group-item">Kertas: (oplah/4 + 100) lembar double folio dengan harga Rp 900/lembar</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card machine-card sm52-card h-100">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Mesin SM-52</h5>
                    </div>
                    <div class="card-body">
                        <h6 class="fw-bold">Digunakan untuk oplah < 5.000 pcs</h6>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item">Harga cetak: Rp 280.000</li>
                            <li class="list-group-item">Overprint: Jika oplah ≥ 2.000, (oplah × jumlah_muka/2 - 1.000) lembar dengan harga Rp 80/lembar</li>
                            <li class="list-group-item">Kertas: (oplah/2 + 100) lembar double folio dengan harga Rp 450/lembar</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="card-title mb-0">Biaya Tambahan</h5>
            </div>
            <div class="card-body">
                <p class="mb-0"><strong>Biaya potong:</strong> Rp 20.000 (flat)</p>
            </div>
        </div> -->
        
        <?php if ($pesanError): ?>
        <div class="alert alert-danger" role="alert">
            <?php echo $pesanError; ?>
        </div>
        <?php endif; ?>
        
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="card-title mb-0">Hitung Biaya Cetak</h5>
            </div>
            <div class="card-body">
                <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="oplah" class="form-label">Jumlah Oplah (pcs)</label>
                            <input type="number" class="form-control" id="oplah" name="oplah" min="100" required 
                                   value="<?php echo isset($_POST['oplah']) ? $_POST['oplah'] : ''; ?>">
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label for="jumlah_muka" class="form-label">Jumlah Muka</label>
                            <select class="form-select" id="jumlah_muka" name="jumlah_muka" required>
                                <option value="1" <?php echo (!isset($_POST['jumlah_muka']) || $_POST['jumlah_muka'] == '1') ? 'selected' : ''; ?>>1 Muka</option>
                                <option value="2" <?php echo (isset($_POST['jumlah_muka']) && $_POST['jumlah_muka'] == '2') ? 'selected' : ''; ?>>2 Muka</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                        <button type="submit" class="btn btn-primary">Hitung Biaya</button>
                    </div>
                </form>
            </div>
        </div>
        
        <?php if ($hasilPerhitungan): ?>
        <div class="card">
            <div class="result-header">
                <h4 class="mb-0">Hasil Perhitungan</h4>
            </div>
            <div class="card-body">
                <div class="alert alert-info" role="alert">
                    <h5 class="alert-heading">Mesin yang digunakan: 
                        <span class="badge <?php echo ($hasilPerhitungan['mesin'] == 'SM-74') ? 'bg-primary badge-sm74' : 'bg-success badge-sm52'; ?>">
                            <?php echo $hasilPerhitungan['mesin']; ?>
                        </span>
                    </h5>
                    <hr>
                    <p class="mb-0">
                        <strong>Oplah:</strong> <?php echo number_format($hasilPerhitungan['oplah'], 0, ',', '.'); ?> pcs | 
                        <strong>Jumlah Muka:</strong> <?php echo $hasilPerhitungan['jumlah_muka']; ?>   
                    </p>
                </div>
                
                <div class="table-responsive">
                    <table class="table table-hover table-result">
                        <thead>
                            <tr>
                                <th>Rincian</th>
                                <th>Jumlah</th>
                                <th>Harga Satuan</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Biaya Cetak</td>
                                <td>-</td>
                                <td>Rp <?php echo number_format($hasilPerhitungan['harga_cetak'], 0, ',', '.'); ?></td>
                                <td>Rp <?php echo number_format($hasilPerhitungan['harga_cetak'], 0, ',', '.'); ?></td>
                            </tr>
                            <tr>
                                <td>Overprint</td>
                                <td><?php echo number_format($hasilPerhitungan['jumlah_overprint'], 0, ',', '.'); ?> lembar</td>
                                <td>Rp <?php echo number_format($hasilPerhitungan['harga_overprint'], 0, ',', '.'); ?></td>
                                <td>Rp <?php echo number_format($hasilPerhitungan['total_biaya_overprint'], 0, ',', '.'); ?></td>
                            </tr>
                            <tr>
                                <td>Kertas Double Folio</td>
                                <td><?php echo number_format($hasilPerhitungan['jumlah_kertas'], 0, ',', '.'); ?> lembar</td>
                                <td>Rp <?php echo number_format($hasilPerhitungan['harga_kertas'], 0, ',', '.'); ?></td>
                                <td>Rp <?php echo number_format($hasilPerhitungan['total_biaya_kertas'], 0, ',', '.'); ?></td>
                            </tr>
                            <tr>
                                <td>Jasa Potong</td>
                                <td>-</td>
                                <td>Rp <?php echo number_format($hasilPerhitungan['biaya_potong'], 0, ',', '.'); ?></td>
                                <td>Rp <?php echo number_format($hasilPerhitungan['biaya_potong'], 0, ',', '.'); ?></td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="3" class="text-end"><strong>Total Biaya</strong></td>
                                <td><strong>Rp <?php echo number_format($hasilPerhitungan['total_biaya'], 0, ',', '.'); ?></strong></td>
                            </tr>
                            <tr class="price-per-piece">
                                <td colspan="3" class="text-end">Harga per Lembar</td>
                                <td>Rp <?php echo number_format($hasilPerhitungan['harga_per_lembar'], 2, ',', '.'); ?></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- <div class="card info-card mt-4">
                    <div class="card-body">
                        <h5 class="card-title">Rumus Perhitungan</h5>
                        <div class="card-text">
                            <p><strong>Total Biaya =</strong> Harga Cetak + (Jumlah Overprint × Harga Overprint) + (Jumlah Kertas × Harga Kertas) + Jasa Potong</p>
                            <hr>
                            <p><strong>Harga per Lembar =</strong> Total Biaya ÷ Oplah</p>
                        </div>
                    </div>
                </div> -->
            </div>
        </div>
        <?php endif; ?>
        
        <footer class="mt-4 text-center text-muted">
            <p>&copy; 2025 Kalkulator Cetak Brosur</p>
        </footer>
    </div>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
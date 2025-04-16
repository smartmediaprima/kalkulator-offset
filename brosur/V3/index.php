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
        
        #resultCard {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header text-center">
            <h1 class="fw-bold">Kalkulator Biaya Cetak Brosur</h1>
            <p class="text-muted">Perhitungan otomatis biaya cetak brosur dengan mesin SM-74 dan SM-52</p>
        </div>
        
        <div id="errorAlert" class="alert alert-danger" role="alert" style="display: none;"></div>
        
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="card-title mb-0">Hitung Biaya Cetak</h5>
            </div>
            <div class="card-body">
                <form id="calculatorForm">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="oplah" class="form-label">Jumlah Oplah (pcs)</label>
                            <input type="number" class="form-control" id="oplah" name="oplah" min="100" required>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label for="jumlah_muka" class="form-label">Jumlah Muka</label>
                            <select class="form-select" id="jumlah_muka" name="jumlah_muka" required>
                                <option value="1">1 Muka</option>
                                <option value="2">2 Muka</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                        <button type="submit" class="btn btn-primary">Hitung Biaya</button>
                        <button type="button" id="resetBtn" class="btn btn-secondary">Reset</button>
                    </div>
                </form>
            </div>
        </div>
        
        <div id="resultCard" class="card">
            <div class="result-header">
                <h4 class="mb-0">Hasil Perhitungan</h4>
            </div>
            <div class="card-body">
                <div class="alert alert-info" role="alert">
                    <h5 class="alert-heading">Mesin yang digunakan: 
                        <span id="mesinBadge" class="badge"></span>
                    </h5>
                    <hr>
                    <p class="mb-0">
                        <strong>Oplah:</strong> <span id="oplahResult"></span> pcs | 
                        <strong>Jumlah Muka:</strong> <span id="jumlahMukaResult"></span>   
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
                                <td id="hargaCetak"></td>
                                <td id="subtotalCetak"></td>
                            </tr>
                            <tr>
                                <td>Overprint</td>
                                <td id="jumlahOverprint"></td>
                                <td id="hargaOverprint"></td>
                                <td id="subtotalOverprint"></td>
                            </tr>
                            <tr>
                                <td>Kertas Double Folio</td>
                                <td id="jumlahKertas"></td>
                                <td id="hargaKertas"></td>
                                <td id="subtotalKertas"></td>
                            </tr>
                            <tr>
                                <td>Jasa Potong</td>
                                <td>-</td>
                                <td id="biayaPotong"></td>
                                <td id="subtotalPotong"></td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="3" class="text-end"><strong>Total Biaya</strong></td>
                                <td id="totalBiaya"></td>
                            </tr>
                            <tr class="price-per-piece">
                                <td colspan="3" class="text-end">Harga per Lembar</td>
                                <td id="hargaPerLembar"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <footer class="mt-4 text-center text-muted">
            <p>&copy; 2025 Kalkulator Cetak Brosur</p>
        </footer>
    </div>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        // Function to format number as currency
        function formatCurrency(number) {
            return new Intl.NumberFormat('id-ID').format(number);
        }
        
        // Function to format number with 2 decimal places
        function formatDecimal(number) {
            return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);
        }
        
        // Function to calculate printing cost
        function hitungBiayaCetak(oplah, jumlahMuka) {
            // Determine machine used based on the number of copies
            const mesin = (oplah >= 5000) ? 'SM-74' : 'SM-52';
            
            // Printing cost based on machine
            const hargaCetak = (mesin === 'SM-74') ? 400000 : 280000;
            
            // Calculate overprint amount and cost
            let jumlahOverprint = 0;
            let hargaOverprint = 0;
            
            if (mesin === 'SM-74') {
                // SM-74: if oplah < 2000, no overprint, price 100 per sheet
                if (oplah < 2000) {
                    jumlahOverprint = oplah - 1000; // Assumption: oplah - 1000 for SM-74
                    hargaOverprint = 100; // Rp. 100 per sheet
                }
            } else {
                // SM-52: if oplah >= 2000, formula for total overprint
                if (oplah >= 2000) {
                    jumlahOverprint = (oplah * jumlahMuka / 2) - 1000;
                    hargaOverprint = 80; // Rp. 80 per sheet
                }
            }
            
            // Calculate paper amount and cost
            let jumlahKertas = 0;
            let hargaKertas = 0;
            
            if (mesin === 'SM-74') {
                // SM-74: print count/4+100, price 900 per paper
                jumlahKertas = Math.ceil(oplah / 4) + 100;
                hargaKertas = 900; // Rp. 900 per paper
            } else {
                // SM-52: print count/2+100, price 450 per paper
                jumlahKertas = Math.ceil(oplah / 2) + 100;
                hargaKertas = 450; // Rp. 450 per paper
            }
            
            // Cutting cost
            const biayaPotong = 20000; // Rp. 20,000
            
            // Calculate total overprint cost
            const totalBiayaOverprint = Math.max(0, jumlahOverprint) * hargaOverprint;
            
            // Calculate total paper cost
            const totalBiayaKertas = jumlahKertas * hargaKertas;
            
            // Calculate total cost
            const totalBiaya = hargaCetak + totalBiayaOverprint + totalBiayaKertas + biayaPotong;
            
            // Calculate price per sheet
            const hargaPerLembar = totalBiaya / oplah;
            
            // Prepare data for results
            return {
                mesin: mesin,
                oplah: oplah,
                jumlah_muka: jumlahMuka,
                harga_cetak: hargaCetak,
                jumlah_overprint: Math.max(0, Math.floor(jumlahOverprint)),
                harga_overprint: hargaOverprint,
                total_biaya_overprint: Math.max(0, totalBiayaOverprint),
                jumlah_kertas: jumlahKertas,
                harga_kertas: hargaKertas,
                total_biaya_kertas: totalBiayaKertas,
                biaya_potong: biayaPotong,
                total_biaya: totalBiaya,
                harga_per_lembar: hargaPerLembar
            };
        }
        
        // Form reset function
        function resetForm() {
            document.getElementById('calculatorForm').reset();
            document.getElementById('resultCard').style.display = 'none';
            document.getElementById('errorAlert').style.display = 'none';
        }
        
        // Handle form submission
        document.getElementById('calculatorForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const oplah = parseInt(document.getElementById('oplah').value);
            const jumlahMuka = parseInt(document.getElementById('jumlah_muka').value);
            
            // Validate input
            if (oplah <= 0) {
                showError("Jumlah oplah harus lebih dari 0");
                return;
            } else if (jumlahMuka <= 0 || jumlahMuka > 2) {
                showError("Jumlah muka harus 1 atau 2");
                return;
            }
            
            // Calculate cost
            const hasil = hitungBiayaCetak(oplah, jumlahMuka);
            
            // Display results
            displayResults(hasil);
        });
        
        // Reset button handler
        document.getElementById('resetBtn').addEventListener('click', resetForm);
        
        // Show error message
        function showError(message) {
            const errorAlert = document.getElementById('errorAlert');
            errorAlert.textContent = message;
            errorAlert.style.display = 'block';
            document.getElementById('resultCard').style.display = 'none';
        }
        
        // Display calculation results
        function displayResults(hasil) {
            // Hide error alert if visible
            document.getElementById('errorAlert').style.display = 'none';
            
            // Display result card
            document.getElementById('resultCard').style.display = 'block';
            
            // Set machine badge
            const mesinBadge = document.getElementById('mesinBadge');
            mesinBadge.textContent = hasil.mesin;
            mesinBadge.className = 'badge ' + (hasil.mesin === 'SM-74' ? 'bg-primary badge-sm74' : 'bg-success badge-sm52');
            
            // Set basic info
            document.getElementById('oplahResult').textContent = formatCurrency(hasil.oplah);
            document.getElementById('jumlahMukaResult').textContent = hasil.jumlah_muka;
            
            // Set table values
            document.getElementById('hargaCetak').textContent = 'Rp ' + formatCurrency(hasil.harga_cetak);
            document.getElementById('subtotalCetak').textContent = 'Rp ' + formatCurrency(hasil.harga_cetak);
            
            document.getElementById('jumlahOverprint').textContent = formatCurrency(hasil.jumlah_overprint) + ' lembar';
            document.getElementById('hargaOverprint').textContent = 'Rp ' + formatCurrency(hasil.harga_overprint);
            document.getElementById('subtotalOverprint').textContent = 'Rp ' + formatCurrency(hasil.total_biaya_overprint);
            
            document.getElementById('jumlahKertas').textContent = formatCurrency(hasil.jumlah_kertas) + ' lembar';
            document.getElementById('hargaKertas').textContent = 'Rp ' + formatCurrency(hasil.harga_kertas);
            document.getElementById('subtotalKertas').textContent = 'Rp ' + formatCurrency(hasil.total_biaya_kertas);
            
            document.getElementById('biayaPotong').textContent = 'Rp ' + formatCurrency(hasil.biaya_potong);
            document.getElementById('subtotalPotong').textContent = 'Rp ' + formatCurrency(hasil.biaya_potong);
            
            document.getElementById('totalBiaya').textContent = 'Rp ' + formatCurrency(hasil.total_biaya);
            document.getElementById('hargaPerLembar').textContent = 'Rp ' + formatDecimal(hasil.harga_per_lembar);
        }
        
        // Reset the form when the page loads/refreshes
        window.addEventListener('load', resetForm);
    </script>
</body>
</html>
<?php
// config.php - File konfigurasi untuk menyimpan data harga dan parameter
$config = [
    // Data mesin cetak
    'mesin_cetak' => [
        'mesin_A' => [
            'nama' => 'Mesin A (4 Warna)',
            'harga_setup' => 500000,
            'harga_per_rim' => [
                '1-10' => 150000,
                '11-20' => 120000,
                '21-50' => 100000,
                '51-100' => 80000,
                '100+' => 70000
            ],
            'minimal_order' => 1,
            'overprint' => 0.15 // 15% lebih untuk antisipasi rusak
        ],
        'mesin_B' => [
            'nama' => 'Mesin B (2 Warna)',
            'harga_setup' => 300000,
            'harga_per_rim' => [
                '1-10' => 100000,
                '11-20' => 90000,
                '21-50' => 80000,
                '51-100' => 70000,
                '100+' => 60000
            ],
            'minimal_order' => 1,
            'overprint' => 0.10 // 10% lebih untuk antisipasi rusak
        ],
    ],
    
    // Data kertas
    'kertas' => [
        'art_paper_120' => [
            'nama' => 'Art Paper 120 gsm',
            'harga_per_rim' => 450000,
            'ukuran' => '65x100',
            'jumlah_plano' => 500 // lembar per rim
        ],
        'art_paper_150' => [
            'nama' => 'Art Paper 150 gsm',
            'harga_per_rim' => 550000,
            'ukuran' => '65x100',
            'jumlah_plano' => 500
        ],
        'art_carton_230' => [
            'nama' => 'Art Carton 230 gsm',
            'harga_per_rim' => 750000,
            'ukuran' => '65x100',
            'jumlah_plano' => 500
        ],
        'art_carton_260' => [
            'nama' => 'Art Carton 260 gsm',
            'harga_per_rim' => 850000,
            'ukuran' => '65x100',
            'jumlah_plano' => 500
        ]
    ],
    
    // Ukuran cetak standar
    'ukuran_cetak' => [
        'A4' => [
            'nama' => 'A4 (21 x 29.7 cm)',
            'lebar' => 21,
            'tinggi' => 29.7,
            'satuan' => 'cm'
        ],
        'A5' => [
            'nama' => 'A5 (14.8 x 21 cm)',
            'lebar' => 14.8,
            'tinggi' => 21,
            'satuan' => 'cm'
        ],
        'F4' => [
            'nama' => 'F4 (21.6 x 33 cm)',
            'lebar' => 21.6,
            'tinggi' => 33,
            'satuan' => 'cm'
        ],
        'custom' => [
            'nama' => 'Custom',
            'lebar' => 0,
            'tinggi' => 0,
            'satuan' => 'cm'
        ]
    ]
];

// functions.php - File berisi fungsi-fungsi perhitungan
function hitungJumlahCetakPerPlano($ukuran_plano, $ukuran_cetak, $bleed = 0.5) {
    // Ukuran plano dalam cm
    list($plano_lebar, $plano_tinggi) = explode('x', $ukuran_plano);
    
    // Tambahkan bleed pada ukuran cetak
    $cetak_lebar = $ukuran_cetak['lebar'] + ($bleed * 2);
    $cetak_tinggi = $ukuran_cetak['tinggi'] + ($bleed * 2);
    
    // Hitung berapa banyak yang bisa masuk dalam 1 plano
    $jumlah_horizontal = floor($plano_lebar / $cetak_lebar);
    $jumlah_vertikal = floor($plano_tinggi / $cetak_tinggi);
    
    // Coba juga dengan orientasi portrait/landscape
    $jumlah_horizontal_alt = floor($plano_lebar / $cetak_tinggi);
    $jumlah_vertikal_alt = floor($plano_tinggi / $cetak_lebar);
    
    // Pilih yang paling optimal
    $total_normal = $jumlah_horizontal * $jumlah_vertikal;
    $total_alt = $jumlah_horizontal_alt * $jumlah_vertikal_alt;
    
    return max($total_normal, $total_alt);
}

function hitungHargaKertas($jumlah_cetak, $jenis_kertas, $ukuran_cetak, $config) {
    $data_kertas = $config['kertas'][$jenis_kertas];
    $ukuran_plano = $data_kertas['ukuran'];
    
    // Hitung berapa banyak cetak yang bisa masuk dalam 1 plano
    $jumlah_per_plano = hitungJumlahCetakPerPlano($ukuran_plano, $ukuran_cetak);
    
    // Hitung total plano yang dibutuhkan
    $total_plano_dibutuhkan = ceil($jumlah_cetak / $jumlah_per_plano);
    
    // Hitung jumlah rim yang dibutuhkan
    $jumlah_rim_dibutuhkan = $total_plano_dibutuhkan / $data_kertas['jumlah_plano'];
    
    // Hitung harga kertas
    $harga_kertas = $jumlah_rim_dibutuhkan * $data_kertas['harga_per_rim'];
    
    return [
        'jumlah_per_plano' => $jumlah_per_plano,
        'total_plano' => $total_plano_dibutuhkan,
        'jumlah_rim' => $jumlah_rim_dibutuhkan,
        'harga_kertas' => $harga_kertas
    ];
}

function hitungHargaCetak($jumlah_cetak, $jenis_mesin, $config) {
    $data_mesin = $config['mesin_cetak'][$jenis_mesin];
    
    // Hitung jumlah rim (1 rim = 500 lembar)
    $jumlah_rim = ceil($jumlah_cetak / 500);
    
    // Tentukan harga per rim berdasarkan jumlah rim
    $harga_per_rim = 0;
    foreach ($data_mesin['harga_per_rim'] as $range => $harga) {
        $range_parts = explode('-', $range);
        
        if (count($range_parts) == 1) {
            // Untuk rentang "100+"
            $min = intval(str_replace('+', '', $range_parts[0]));
            if ($jumlah_rim >= $min) {
                $harga_per_rim = $harga;
            }
        } else {
            // Untuk rentang normal
            $min = intval($range_parts[0]);
            $max = intval($range_parts[1]);
            
            if ($jumlah_rim >= $min && $jumlah_rim <= $max) {
                $harga_per_rim = $harga;
                break;
            }
        }
    }
    
    // Hitung harga cetak
    $biaya_setup = $data_mesin['harga_setup'];
    $biaya_cetak = $jumlah_rim * $harga_per_rim;
    $total_cetak = $biaya_setup + $biaya_cetak;
    
    return [
        'biaya_setup' => $biaya_setup,
        'biaya_cetak' => $biaya_cetak,
        'total_cetak' => $total_cetak
    ];
}

function hitungBiayaTotal($jumlah_cetak, $jenis_mesin, $jenis_kertas, $ukuran_cetak, $config) {
    // Hitung overprint (bahan lebih untuk antisipasi kerusakan)
    $data_mesin = $config['mesin_cetak'][$jenis_mesin];
    $overprint_rate = $data_mesin['overprint'];
    $jumlah_dengan_overprint = ceil($jumlah_cetak * (1 + $overprint_rate));
    
    // Hitung harga kertas
    $hasil_kertas = hitungHargaKertas($jumlah_dengan_overprint, $jenis_kertas, $ukuran_cetak, $config);
    
    // Hitung harga cetak
    $hasil_cetak = hitungHargaCetak($jumlah_dengan_overprint, $jenis_mesin, $config);
    
    // Total biaya
    $total_biaya = $hasil_kertas['harga_kertas'] + $hasil_cetak['total_cetak'];
    
    // Hitung harga per satuan
    $harga_per_satuan = $total_biaya / $jumlah_cetak;
    
    return [
        'jumlah_cetak' => $jumlah_cetak,
        'jumlah_dengan_overprint' => $jumlah_dengan_overprint,
        'data_kertas' => $hasil_kertas,
        'data_cetak' => $hasil_cetak,
        'total_biaya' => $total_biaya,
        'harga_per_satuan' => $harga_per_satuan
    ];
}

// index.php - File utama untuk form input dan tampilan hasil
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kalkulator Perhitungan Cetak Offset</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            padding-top: 20px;
            padding-bottom: 20px;
        }
        .hasil-perhitungan {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="mb-4">Kalkulator Perhitungan Cetak Offset</h1>
        
        <form method="post" action="" class="mb-4">
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="jumlah_cetak" class="form-label">Jumlah Cetak</label>
                    <input type="number" class="form-control" id="jumlah_cetak" name="jumlah_cetak" required min="1" value="<?php echo isset($_POST['jumlah_cetak']) ? $_POST['jumlah_cetak'] : 1000; ?>">
                </div>
                
                <div class="col-md-6">
                    <label for="jenis_mesin" class="form-label">Mesin Cetak</label>
                    <select class="form-select" id="jenis_mesin" name="jenis_mesin" required>
                        <?php foreach ($config['mesin_cetak'] as $id => $mesin): ?>
                            <option value="<?php echo $id; ?>" <?php echo (isset($_POST['jenis_mesin']) && $_POST['jenis_mesin'] == $id) ? 'selected' : ''; ?>>
                                <?php echo $mesin['nama']; ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="jenis_kertas" class="form-label">Jenis Kertas</label>
                    <select class="form-select" id="jenis_kertas" name="jenis_kertas" required>
                        <?php foreach ($config['kertas'] as $id => $kertas): ?>
                            <option value="<?php echo $id; ?>" <?php echo (isset($_POST['jenis_kertas']) && $_POST['jenis_kertas'] == $id) ? 'selected' : ''; ?>>
                                <?php echo $kertas['nama']; ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                
                <div class="col-md-6">
                    <label for="ukuran_cetak" class="form-label">Ukuran Cetak</label>
                    <select class="form-select" id="ukuran_cetak" name="ukuran_cetak" required>
                        <?php foreach ($config['ukuran_cetak'] as $id => $ukuran): ?>
                            <option value="<?php echo $id; ?>" <?php echo (isset($_POST['ukuran_cetak']) && $_POST['ukuran_cetak'] == $id) ? 'selected' : ''; ?>>
                                <?php echo $ukuran['nama']; ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>
            
            <div class="row mb-3" id="custom_ukuran" style="display: none;">
                <div class="col-md-6">
                    <label for="custom_lebar" class="form-label">Lebar (cm)</label>
                    <input type="number" step="0.1" class="form-control" id="custom_lebar" name="custom_lebar" value="<?php echo isset($_POST['custom_lebar']) ? $_POST['custom_lebar'] : ''; ?>">
                </div>
                
                <div class="col-md-6">
                    <label for="custom_tinggi" class="form-label">Tinggi (cm)</label>
                    <input type="number" step="0.1" class="form-control" id="custom_tinggi" name="custom_tinggi" value="<?php echo isset($_POST['custom_tinggi']) ? $_POST['custom_tinggi'] : ''; ?>">
                </div>
            </div>
            
            <button type="submit" class="btn btn-primary" name="hitung">Hitung Biaya</button>
        </form>
        
        <?php
        if (isset($_POST['hitung'])) {
            // Ambil data dari form
            $jumlah_cetak = intval($_POST['jumlah_cetak']);
            $jenis_mesin = $_POST['jenis_mesin'];
            $jenis_kertas = $_POST['jenis_kertas'];
            $ukuran_id = $_POST['ukuran_cetak'];
            
            // Jika ukuran custom
            if ($ukuran_id == 'custom') {
                $custom_lebar = floatval($_POST['custom_lebar']);
                $custom_tinggi = floatval($_POST['custom_tinggi']);
                
                // Update ukuran custom
                $ukuran_cetak = [
                    'nama' => "Custom ({$custom_lebar} x {$custom_tinggi} cm)",
                    'lebar' => $custom_lebar,
                    'tinggi' => $custom_tinggi,
                    'satuan' => 'cm'
                ];
            } else {
                $ukuran_cetak = $config['ukuran_cetak'][$ukuran_id];
            }
            
            // Hitung total biaya
            $hasil = hitungBiayaTotal($jumlah_cetak, $jenis_mesin, $jenis_kertas, $ukuran_cetak, $config);
            
            // Tampilkan hasil
            ?>
            <div class="hasil-perhitungan">
                <h2>Hasil Perhitungan</h2>
                
                <div class="row">
                    <div class="col-md-6">
                        <h3>Detail Pesanan</h3>
                        <table class="table">
                            <tr>
                                <th>Jumlah Cetak</th>
                                <td><?php echo number_format($jumlah_cetak); ?> pcs</td>
                            </tr>
                            <tr>
                                <th>Jumlah dengan Overprint</th>
                                <td><?php echo number_format($hasil['jumlah_dengan_overprint']); ?> pcs</td>
                            </tr>
                            <tr>
                                <th>Mesin Cetak</th>
                                <td><?php echo $config['mesin_cetak'][$jenis_mesin]['nama']; ?></td>
                            </tr>
                            <tr>
                                <th>Jenis Kertas</th>
                                <td><?php echo $config['kertas'][$jenis_kertas]['nama']; ?></td>
                            </tr>
                            <tr>
                                <th>Ukuran Cetak</th>
                                <td><?php echo $ukuran_cetak['nama']; ?></td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="col-md-6">
                        <h3>Rincian Biaya</h3>
                        <table class="table">
                            <tr>
                                <th>Biaya Kertas</th>
                                <td>Rp. <?php echo number_format($hasil['data_kertas']['harga_kertas']); ?></td>
                            </tr>
                            <tr>
                                <th>Biaya Setup Mesin</th>
                                <td>Rp. <?php echo number_format($hasil['data_cetak']['biaya_setup']); ?></td>
                            </tr>
                            <tr>
                                <th>Biaya Proses Cetak</th>
                                <td>Rp. <?php echo number_format($hasil['data_cetak']['biaya_cetak']); ?></td>
                            </tr>
                            <tr class="table-primary">
                                <th>Total Biaya</th>
                                <td>Rp. <?php echo number_format($hasil['total_biaya']); ?></td>
                            </tr>
                            <tr>
                                <th>Harga per Unit</th>
                                <td>Rp. <?php echo number_format($hasil['harga_per_satuan']); ?></td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <div class="mt-4">
                    <h3>Detail Perhitungan</h3>
                    <table class="table">
                        <tr>
                            <th>Ukuran Plano</th>
                            <td><?php echo $config['kertas'][$jenis_kertas]['ukuran']; ?> cm</td>
                        </tr>
                        <tr>
                            <th>Jumlah per Plano</th>
                            <td><?php echo $hasil['data_kertas']['jumlah_per_plano']; ?> pcs</td>
                        </tr>
                        <tr>
                            <th>Total Plano Dibutuhkan</th>
                            <td><?php echo number_format($hasil['data_kertas']['total_plano']); ?> lembar</td>
                        </tr>
                    </table>
                </div>
            </div>
            <?php
        }
        ?>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // JavaScript untuk menampilkan/menyembunyikan form ukuran custom
        document.addEventListener('DOMContentLoaded', function() {
            const ukuranCetak = document.getElementById('ukuran_cetak');
            const customUkuran = document.getElementById('custom_ukuran');
            
            function toggleCustomUkuran() {
                if (ukuranCetak.value === 'custom') {
                    customUkuran.style.display = 'flex';
                } else {
                    customUkuran.style.display = 'none';
                }
            }
            
            ukuranCetak.addEventListener('change', toggleCustomUkuran);
            toggleCustomUkuran(); // Panggil sekali saat halaman dimuat
        });
    </script>
</body>
</html>
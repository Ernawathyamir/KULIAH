void main() {
  String namaKaryawan = 'John Doe';
  int jamKerja = 40;  
  double upahPerJam = 100000;  
  bool statusKaryawan = true;  

  double gajiKotor = jamKerja * upahPerJam;

  double pajak = 0;
  if (statusKaryawan) {
    pajak = gajiKotor * 0.10;  
  } else {
    pajak = gajiKotor * 0.05;  
  }

  double gajiBersih = gajiKotor - pajak;

  print('Nama Karyawan  : $namaKaryawan');
  print('Gaji Kotor     : $gajiKotor');
  print('Pajak          : $pajak');
  print('Gaji Bersih    : $gajiBersih');
}

import 'dart:io';

void main() {
  // Meminta input skor dari pengguna
  stdout.write('Masukkan skor Anda (0 - 100): ');
  String? input = stdin.readLineSync();

  // Validasi apakah input bukan null dan bisa dikonversi ke integer
  if (input == null || int.tryParse(input) == null) {
    print('Input tidak valid. Harap masukkan angka.');
    return;
  }

  int skor = int.parse(input);

  // Validasi rentang skor
  if (skor < 0 || skor > 100) {
    print('Error: Skor harus berada dalam rentang 0 sampai 100.');
    return;
  }

  String grade;

  // Menentukan grade berdasarkan skor menggunakan if-else
  if (skor >= 85 && skor <= 100) {
    grade = 'A';
  } else if (skor >= 70 && skor <= 84) {
    grade = 'B';
  } else if (skor >= 60 && skor <= 69) {
    grade = 'C';
  } else if (skor >= 50 && skor <= 59) {
    grade = 'D';
  } else {
    grade = 'E';
  }

  // Menampilkan hasil
  print('Skor Anda: $skor');
  print('Grade Anda: $grade');
}

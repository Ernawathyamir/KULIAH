abstract class Transportasi {
  String id;
  String nama;
  double _tarifDasar;
  int kapasitas;

  Transportasi (this.id, this.nama, this._tarifDasar, this.kapasitas);
  double get tarifDasar => _tarifDasar;
  double hitungTarif(int jumlahPenumpang);

  void tampilInfo() {
    print('--- Info Transportasi ---');
    print('ID           : $id');
    print('Nama         : $nama');
    print('tarif Dasar  : $_tarifDasar');
    print('Kapasitas    : $kapasitas');
  }
}

class Taksi extends Transportasi {
  double jarak;
  Taksi(String id, String nama, double _tarifDasar, int kapasitas, this.jarak)
      : super(id, nama, _tarifDasar, kapasitas);

  @override
  double hitungTarif(int jumlahPenumpang) {
    return tarifDasar * jarak;
  }

  @override
  void tampilInfo() {
    super.tampilInfo();
    print('jarak        : $jarak km');
  }
}

class Bus extends Transportasi {
  bool adaWifi;

  Bus(String id, String nama, double _tarifDasar, int kapasitas, this.adaWifi)
    : super(id, nama, _tarifDasar, kapasitas);
  
  @override
  double hitungTarif(int jumlahPenumpang) {
    return (tarifDasar * jumlahPenumpang) + (adaWifi ? 5000 : 0);
  }
  @override
  void tampilInfo() {
    super.tampilInfo();
    print('ada Wifi   :${adaWifi ? "ya" : "Tidak"}');
  }
}
class Pesawat extends Transportasi {
  String kelas;

  Pesawat (String id, String nama, double tarifDasar, int kapasitas, this.kelas)
      : super(id, nama, tarifDasar, kapasitas);

  @override
  double hitungTarif(int jumlahPenumpang) {
  double faktorKelas = (kelas == "Bisnis") ? 1.5 : 1.10;
  return tarifDasar * jumlahPenumpang * faktorKelas;
  }

  @override
  void tampilInfo() {
  super.tampilInfo();
  print('kelas      : $kelas');
  }
}

class Pemesanan {
  String idPemesanan;
  String namaPelanggan;
  Transportasi transportasi;
  int jumlahPenumpang;
  double totalTarif;

  Pemesanan(this.idPemesanan, this.namaPelanggan, this.transportasi,
      this.jumlahPenumpang, this.totalTarif);
  
  void cetakStruk() {
    print('\n========== STRUK PEMESANAN ==========');
    print('ID Pemesanan       : $idPemesanan');
    print('Nama Pelanggan     : $namaPelanggan');
    print('Jenis Transportasi : $transportasi');
    print('Jumlah Penumpang   : $jumlahPenumpang');
    print('Total Tarif        : Rp ${totalTarif.toStringAsFixed(2)}');
    print('============================');
  }

  Map<String, dynamic> toMap() {
    return {
      'idPemesanan' : idPemesanan,
      'namaPelanggan' : namaPelanggan,
      'transportasi'  : transportasi,
      'jumlahPenumpang' : jumlahPenumpang,
      'totalTarif' : totalTarif
    };
  }
}

Pemesanan buatPemesanan(
    Transportasi t, String nama, int jumlahPenumpang, String idPemesanan) {
  double total = t.hitungTarif(jumlahPenumpang);
    return Pemesanan(idPemesanan, nama, t, jumlahPenumpang, total);
  }
  void tampilSemuaPemesanan(List<Pemesanan> daftar) {
  print('\n===== RIWAYAT SEMUA PEMESANAN =====');
  for (var p in daftar) {
    p.cetakStruk();
  }
}

  void main() {
  Taksi taksi1 = Taksi("T001", "Taksi BlueBird", 8000, 4, 12.5);
  Bus bus1 = Bus("B001", "Bus TransJakarta", 3000, 40, true);
  Pesawat pesawat1 =
      Pesawat("P001", "Garuda Indonesia", 150000, 150, "Bisnis");

  taksi1.tampilInfo();
  bus1.tampilInfo();
  pesawat1.tampilInfo();

  var daftarPemesanan = <Pemesanan>[];

  daftarPemesanan.add(buatPemesanan(taksi1, "evri", 1, "PM001"));
  daftarPemesanan.add(buatPemesanan(bus1, "faraa", 3, "PM002"));
  daftarPemesanan.add(buatPemesanan(pesawat1, "putt", 2, "PM003"));
  tampilSemuaPemesanan(daftarPemesanan);
}
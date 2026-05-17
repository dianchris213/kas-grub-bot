<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kas Grup</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    .container { max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 10px; }
    input, button { width: 100%; padding: 10px; margin: 8px 0; border-radius: 5px; border: 1px solid #ddd; }
    button { background: #2563eb; color: white; border: none; cursor: pointer; }
    button:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Input Kas Grup</h2>
    <form id="kasForm">
      <input type="text" id="nama" placeholder="Nama" required>
      <input type="number" id="jumlah" placeholder="Jumlah" required>
      <input type="text" id="keterangan" placeholder="Keterangan">
      <button type="submit">Simpan</button>
    </form>
    <p id="status"></p>
  </div>
  <script>
    document.getElementById('kasForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      document.getElementById('status').innerText = "Mengirim...";
      // Nanti disambungin ke backend/database kamu
      document.getElementById('status').innerText = "Data tersimpan!";
      e.target.reset();
    });
  </script>
</body>
</html>
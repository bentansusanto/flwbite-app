#!/bin/bash

# Pastikan folder logs ada
mkdir -p logs

echo "🚀 Starting flwbite-app with PM2..."

# Hapus proses lama jika ada
pm2 delete flwbite-app 2>/dev/null || true

# Tunggu sebentar
sleep 2

# Jalankan dengan ecosystem config
pm2 start ecosystem.config.js

# Simpan list proses agar auto-start saat reboot
pm2 save

# Tampilkan status
pm2 list

echo "✅ flwbite-app started successfully!"

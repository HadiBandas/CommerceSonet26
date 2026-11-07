# PRD — Sonnet Digital Ecosystem: Fase 0 (Concierge MVP)

Nov 6, 2026 · @hadi

## 1. Ringkasan dan scope PRD

Fase 0 membutuhkan sistem yang cukup untuk membuktikan permintaan, suplai merchant, dan ekonomi per order di **satu micro-zone selama 4 minggu pilot (minggu 5–8)**, bukan aplikasi penuh. PRD ini mendefinisikan apa yang dibangun engineering untuk itu, dan memberi outline Fase 1 sebagai arah, karena proposal secara eksplisit menahan build aplikasi sampai Gate 1 terpenuhi.

Sumber: proposal "Sonnet Digital Ecosystem — Fase 0" (draft 6 November 2026). Anggaran Fase 0 di proposal masih kosong ("Rp \[●\] juta"), jadi estimasi biaya di PRD ini belum ada.

**Keputusan arah teknis**

1. **Web app ringan, bukan app native.** Storefront mobile-first yang PWA-ready, dibuka dari link WhatsApp atau QR di merchant. Ini sejalan dengan proposal ("halaman web ringan atau kanal pesan") dan menghindari review Play Store dan App Store di jalur kritis 8 minggu.
2. **Operasi manual, tercatat di sistem.** Dispatch dan penanganan order dilakukan tim ops lewat admin console. Tujuannya bukan otomatisasi, tetapi data per order yang bersih untuk menghitung contribution margin.
3. **Build vs buy mengikuti proposal.** Bangun: alur order, aturan komisi, dashboard operasional. Beli atau integrasikan: pembayaran (penyedia berizin, Sonnet tidak menampung dana), peta, notifikasi, verifikasi.
4. **Data pelanggan ISP dipisah secara logis** dari data transaksi, dengan akses berbasis peran.

**Cakupan**

| Dalam scope Fase 0 | Di luar scope (Fase 1 ke atas) |
| --- | --- |
| Storefront web: pencarian merchant per zona, katalog, keranjang, checkout, pelacakan status | Aplikasi native Android/iOS |
| Alat merchant ringan: kelola katalog, stok, jam buka, terima dan update status order | Driver app dan auto-dispatch |
| Admin console: order, dispatch manual, merchant, kurir, refund, rekonsiliasi payout | Loyalty wallet, poin otomatis, sponsored listing, iklan, langganan merchant |
| Pembayaran lewat penyedia berizin (payment link atau checkout hosted) | Multi-zona dan multi-kota |
| Verifikasi pelanggan Sonnet untuk voucher first order | Pencairan dana yang dipegang Sonnet |
| Dashboard segmentasi basis 4.000 dan dashboard KPI pilot | Integrasi penuh ke billing atau CRM ISP |
| Consent, privacy notice, audit trail | Rekomendasi atau ranking berbasis ML |

## 2. Tujuan, non-goals, dan metrik sukses

Sistem dianggap berhasil jika pilot menghasilkan data yang cukup dan cukup bersih untuk memutuskan Gate 1, bukan jika fiturnya banyak.

**Tujuan**

- **G1.** Menjalankan pilot concierge 4 minggu di satu micro-zone dengan minimal 20 merchant siap (target minggu 3–5 di proposal).
- **G2.** Mencatat setiap order sampai level biaya (ongkir, fee pembayaran, subsidi voucher, komisi) sehingga contribution margin per order dapat dihitung tanpa spreadsheet manual.
- **G3.** Tim ops non-engineer dapat mengoperasikan harian (onboarding merchant, dispatch, refund) lewat admin console.
- **G4.** Privasi sejak awal: consent tercatat, data ISP terpisah, tidak ada insiden privasi atau keamanan serius.

**Non-goals**

- Bersaing fitur dengan marketplace nasional.
- Otomatisasi penuh dispatch atau penetapan tarif dinamis.
- Menampung dana merchant atau kurir di akun Sonnet.
- Menjual atau membagikan data personal sebagai produk iklan.

**Metrik sukses dan sumber datanya**

Ambang diambil dari Bagian 8.3 proposal (usulan awal, dikalibrasi manajemen di akhir minggu 4). Kolom kanan adalah pekerjaan engineering: event atau field yang harus ada agar angkanya bisa dihitung.

| Indikator pilot | Go | Berhenti / ubah arah | Sumber di sistem |
| --- | --- | --- | --- |
| Merchant aktif (≥ 1 order per minggu) | ≥ 15 | < 8 | `orders.merchant_id` per minggu |
| Total order selama pilot | ≥ 200 | < 80 | `orders` berstatus selesai |
| Pembeli order ≥ 2 kali | ≥ 25% | < 10% | `orders.customer_id`, cohort |
| Tingkat pembatalan | ≤ 10% | > 20% | `order_events` (cancelled) vs total |
| Ketepatan waktu pengantaran | ≥ 85% | < 70% | `deliveries.promised_at` vs `delivered_at` |
| CSAT | ≥ 4,2 / 5 | < 3,5 | `order_ratings` |
| Contribution margin per order | ≥ 0 | Negatif tanpa jalur perbaikan | `order_financials` |
| Insiden privasi atau keamanan serius | 0 | Pilot dihentikan | log insiden, audit trail |

## 3. Persona dan user stories

Enam peran memakai sistem di Fase 0; kurir dan mitra sengaja dilayani lewat tautan web sederhana, bukan aplikasi sendiri.

| ID | Persona | Sebagai ... saya ingin ... | Prioritas |
| --- | --- | --- | --- |
| US-01 | Pelanggan umum | memasukkan alamat dan melihat hanya merchant yang bisa mengantar ke lokasi saya, supaya saya tidak memesan dari toko di luar jangkauan | P0 |
| US-02 | Pelanggan umum | melihat harga produk, ongkir, biaya layanan, dan pajak sebelum membayar, supaya tidak ada kejutan di checkout | P0 |
| US-03 | Pelanggan umum | memantau status pesanan dan menghubungi tim bila terlambat | P0 |
| US-04 | Pelanggan Sonnet | memverifikasi diri sebagai pelanggan internet dan mendapat voucher first order | P0 |
| US-05 | Pelanggan umum | memesan ulang dari riwayat dalam beberapa ketukan | P1 |
| US-06 | Merchant | mengelola katalog, stok, dan jam buka dari ponsel, atau meminta tim Sonnet melakukannya atas nama saya | P0 |
| US-07 | Merchant | mendapat notifikasi order di WhatsApp dan menerima atau menolak dalam satu ketukan | P0 |
| US-08 | Merchant | melihat laporan order, komisi, dan jadwal payout | P1 |
| US-09 | Merchant ops Sonnet | memantau funnel merchant (prospecting sampai activation) dan mengimpor katalog massal | P0 |
| US-10 | Delivery ops Sonnet | melihat antrian order per zona, menugaskan kurir, dan mencatat biaya kurir aktual per order | P0 |
| US-11 | Kurir | membuka tautan order, mengonfirmasi pickup dan delivery dengan bukti, tanpa memasang aplikasi | P0 |
| US-12 | Mitra Sonnet | memakai kode referal dan melihat merchant yang saya bawa | P1 |
| US-13 | Finance | mencocokkan transaksi penyedia pembayaran dengan order dan melihat selisih | P0 |
| US-14 | Product owner | melihat dashboard KPI pilot dan indikator go/no-go setiap hari | P0 |
| US-15 | Marketing / CRM | membagi basis 4.000 per segmen dan kanal yang sah, dan melihat konversi first order per kanal | P0 |

## 5. Functional requirements Fase 0

Total 40 requirement: P0 wajib ada sebelum pilot dimulai (minggu 5), P1 diusahakan selama pilot, P2 ditunda. Satu keranjang hanya berisi satu merchant; multi-merchant ditunda karena menggandakan kompleksitas ongkir dan dispatch.

### A. Storefront pelanggan

| ID | Requirement | P |
| --- | --- | --- |
| FR-A1 | Pelanggan memasukkan alamat atau pin lokasi; sistem memeriksa apakah di dalam micro-zone aktif dan hanya menampilkan merchant yang radiusnya mencakup alamat. Di luar zona: pesan jelas dan opsi waitlist. | P0 |
| FR-A2 | Daftar merchant dan katalog dengan jam buka, status buka/tutup, dan ketersediaan stok. | P0 |
| FR-A3 | Keranjang satu merchant per order. | P0 |
| FR-A4 | Checkout menampilkan produk, ongkir, biaya layanan, pajak, dan diskon sebelum konfirmasi; harga final dikunci saat pelanggan membayar. | P0 |
| FR-A5 | Registrasi dengan nomor HP dan OTP; consent dan versi privacy notice tercatat. | P0 |
| FR-A6 | Halaman status order dengan tahap: diterima, diproses, siap, diantar, selesai, dibatalkan. | P0 |
| FR-A7 | Rating 1–5 dan komentar setelah order selesai (sumber CSAT). | P1 |
| FR-A8 | Order ulang dari riwayat. | P1 |
| FR-A9 | Install prompt PWA. | P2 |

### B. Alat merchant

| ID | Requirement | P |
| --- | --- | --- |
| FR-B1 | Login merchant dengan OTP; staf ops dapat masuk atas nama merchant (impersonation tercatat di audit trail). | P0 |
| FR-B2 | Kelola katalog: nama, foto, harga, varian sederhana, toggle stok. | P0 |
| FR-B3 | Atur jam layanan dan radius antar. | P0 |
| FR-B4 | Terima atau tolak order dengan batas waktu; order yang tidak direspons otomatis ditandai dan masuk antrian alert ops. | P0 |
| FR-B5 | Notifikasi order masuk lewat WhatsApp dengan tautan aksi, karena UMKM tidak selalu membuka portal. | P0 |
| FR-B6 | Laporan sederhana: order, GMV, komisi, payout. | P1 |
| FR-B7 | Impor katalog massal dari CSV atau Google Sheet untuk mempercepat onboarding 20 merchant. | P1 |

### C. Order dan dispatch

| ID | Requirement | P |
| --- | --- | --- |
| FR-C1 | State machine order dengan transisi valid saja; setiap transisi mencatat event, aktor, dan waktu (append-only). | P0 |
| FR-C2 | Antrian order di admin, difilter per zona dan status; alert untuk order yang melewati ambang waktu (belum diterima merchant, belum ada kurir). | P0 |
| FR-C3 | Dispatch manual: pilih mode (pickup pelanggan, merchant antar sendiri, kurir mitra) dan catat biaya kurir aktual per order. | P0 |
| FR-C4 | Bukti pickup dan delivery (foto atau PIN) lewat tautan web satu kali pakai untuk kurir, tanpa driver app. | P0 |
| FR-C5 | Pembatalan dan refund dengan kode alasan dan perlakuan komisi yang eksplisit. | P0 |
| FR-C6 | Pencatatan komplain, kerusakan, keterlambatan dengan batas waktu penanganan. | P1 |
| FR-C7 | Ekspor order dan event ke CSV. | P1 |

### D. Pembayaran, komisi, dan payout

| ID | Requirement | P |
| --- | --- | --- |
| FR-D1 | Integrasi satu penyedia pembayaran berizin dengan checkout hosted atau payment link; metode minimal QRIS dan satu opsi VA atau e-wallet. Webhook idempoten dan terverifikasi tanda tangannya. | P0 |
| FR-D2 | Hitung komisi per kategori dan biaya layanan per order; ongkir yang diteruskan ke kurir dipisah dari pendapatan platform. | P0 |
| FR-D3 | Ledger per order yang memisahkan GMV, pendapatan kotor, pendapatan bersih, subsidi voucher, biaya pembayaran, dan biaya kurir. | P0 |
| FR-D4 | Rekonsiliasi harian transaksi penyedia pembayaran terhadap order, dengan laporan selisih. | P0 |
| FR-D5 | Payout merchant dan kurir dengan jadwal, bukti, dan status; di Fase 0 boleh transfer manual oleh Finance yang tercatat di sistem. | P1 |
| FR-D6 | Alur sengketa pembayaran dengan status dan batas waktu. | P1 |

### E. Voucher dan benefit pelanggan Sonnet

| ID | Requirement | P |
| --- | --- | --- |
| FR-E1 | Verifikasi pelanggan Sonnet untuk benefit (mekanisme di Bagian 13, open question O1). | P0 |
| FR-E2 | Voucher first order: nilai, kuota, masa berlaku, batas per pelanggan; subsidi dicatat sebagai biaya akuisisi. | P0 |
| FR-E3 | Atribusi kanal: kode QR dan tautan unik per merchant, per mitra, dan per kanal komunikasi (menjawab H3 dan H5). | P0 |
| FR-E4 | Kode referral dengan batas anti-fraud (per nomor dan per perangkat). | P1 |

### F. Admin, segmentasi, dan analytics

| ID | Requirement | P |
| --- | --- | --- |
| FR-F1 | RBAC dengan peran: merchant ops, delivery ops, marketing/CRM, finance, product, legal (read-only), admin. | P0 |
| FR-F2 | Funnel merchant: prospecting, qualification, onboarding, activation, retention; dokumen legalitas dasar dan perjanjian tersimpan. | P0 |
| FR-F3 | Impor dan segmentasi basis 4.000 per jenis (pelanggan, mitra, merchant), status aktif, kota, dan status dapat dihubungi. Analisis zona memakai data agregat; kolom kontak hanya terlihat oleh peran berizin. | P0 |
| FR-F4 | Peta densitas dan zone scorecard untuk memilih 2–3 kandidat micro-zone (output minggu 1–2). | P0 |
| FR-F5 | Dashboard KPI pilot (Bagian 10). | P0 |
| FR-F6 | Manajemen mitra: kode referal dan merchant yang dibawa. | P1 |
| FR-F7 | Audit trail untuk aksi admin sensitif: ubah harga atau komisi, refund, ekspor data, impersonation. | P0 |

### G. Notifikasi dan consent

| ID | Requirement | P |
| --- | --- | --- |
| FR-G1 | Notifikasi status order ke pelanggan dan merchant lewat WhatsApp Business (template berizin); fallback SMS atau email. | P0 |
| FR-G2 | Consent per kanal tercatat; opt-out satu langkah dan dihormati di seluruh sistem. | P0 |
| FR-G3 | Pengingat repeat order berbasis opt-in. | P1 |

## 7. Data model

Skema relasional di PostgreSQL dengan tiga aturan: setiap perubahan status order adalah event append-only, harga dan alamat di-snapshot ke order, dan semua uang disimpan sebagai bilangan bulat rupiah. Dengan itu contribution margin dapat dihitung ulang kapan saja dari event dan ledger.

| Entitas | Field kunci | Catatan |
| --- | --- | --- |
| `users` | id, phone, name, role, created\_at | Pelanggan, staf merchant, admin; role menentukan akses |
| `customer_profiles` | user\_id, sonnet\_verified, verified\_at, acquisition\_channel | Hanya flag hasil verifikasi, bukan data billing ISP |
| `consents` | user\_id, channel, purpose, status, notice\_version, ts | Satu baris per perubahan; opt-out tercatat |
| `zones` | id, name, city, polygon, active, service\_hours | Polygon geospasial (PostGIS) |
| `merchants` | id, name, category, zone\_id, geo, radius\_m, hours, funnel\_stage, commission\_rate, partner\_id | `funnel_stage` mengikuti funnel proposal 7.2 |
| `products` | id, merchant\_id, name, price, photo, in\_stock, variants |  |
| `orders` | id, customer\_id, merchant\_id, zone\_id, status, fulfillment\_mode, address\_snapshot, subtotal, delivery\_fee, service\_fee, tax, discount, total, promised\_at, channel | Harga dan alamat adalah snapshot |
| `order_items` | order\_id, product\_id, name, unit\_price, qty | Snapshot nama dan harga |
| `order_events` | id, order\_id, from\_status, to\_status, actor\_type, actor\_id, reason\_code, ts | Append-only; sumber ketepatan waktu dan pembatalan |
| `deliveries` | order\_id, courier\_id, mode, courier\_cost, picked\_up\_at, delivered\_at, pickup\_proof, delivery\_proof | `courier_cost` adalah biaya aktual |
| `couriers` | id, name, phone, vehicle, contract\_type, zone\_id | Kontak hanya terlihat peran delivery ops |
| `payments` | id, order\_id, psp, psp\_ref, method, amount, psp\_fee, status, paid\_at | `psp_ref` unik untuk idempotensi webhook |
| `refunds` | id, payment\_id, amount, reason\_code, status |  |
| `order_financials` | order\_id, gmv, commission, service\_fee\_rev, delivery\_fee\_passthrough, courier\_cost, psp\_fee, voucher\_subsidy, refund\_loss, contribution\_margin | Dihitung dari baris lain; dapat dihitung ulang |
| `vouchers` | id, code, value, quota, valid\_until, per\_user\_limit, cost\_center | Subsidi dicatat sebagai biaya akuisisi |
| `voucher_redemptions` | voucher\_id, user\_id, order\_id, amount |  |
| `payouts` | id, payee\_type, payee\_id, period, amount, status, proof | Merchant dan kurir |
| `partners` | id, code, name | Mitra Sonnet dan merchant yang dibawanya (H5) |
| `ratings` | order\_id, score, comment | Sumber CSAT |
| `audit_log` | id, actor, action, entity, before, after, ts, ip | Aksi sensitif admin |
| `base_segments` | pseudo\_id, kind, city, zone\_id, active, contactable | Hasil impor basis 4.000, tanpa identitas langsung |

**Rumus contribution margin per order** (usulan; Finance mengonfirmasi definisinya):

```latex
CM = komisi + biaya_layanan + (ongkir_dibayar - biaya_kurir) - biaya_pembayaran - subsidi_voucher - kerugian_refund
```

Ongkir yang diteruskan ke kurir tidak dihitung sebagai pendapatan; yang masuk CM hanya selisih antara ongkir yang dibayar pelanggan dan biaya kurir aktual, sesuai aturan keuangan Bagian 5.4 proposal.

**Aturan data**

- Primary key UUID v7; waktu disimpan UTC dan ditampilkan WIB.
- Data ISP dan data aplikasi berada di skema atau database terpisah dengan kredensial berbeda; aplikasi hanya menerima hasil verifikasi.
- Kolom kontak (telepon, alamat) dienkripsi di level field dan dimasking di dashboard analitik.
- Perubahan tarif, komisi, dan subsidi disimpan dengan versi dan penyetuju.

## 8. API dan integrasi

Kontrak API ditulis sebagai OpenAPI 3.1 lebih dulu, lalu frontend dan backend dikerjakan paralel terhadap kontrak itu. Semua endpoint berada di `/api/v1`, memakai JSON, pagination berbasis cursor, error format RFC 7807, dan header `Idempotency-Key` pada pembuatan order dan pembayaran.

| Permukaan | Endpoint utama | Autentikasi |
| --- | --- | --- |
| Pelanggan | `POST /auth/otp/request`, `POST /auth/otp/verify`, `GET /zones/check`, `GET /merchants`, `GET /merchants/{id}/products`, `POST /quotes`, `POST /orders`, `GET /orders/{id}`, `POST /orders/{id}/cancel`, `POST /orders/{id}/rating`, `POST /vouchers/validate`, `POST /sonnet-verification/start`, `POST /sonnet-verification/confirm` | Sesi OTP |
| Merchant | `GET/PATCH /merchant/profile`, `CRUD /merchant/products`, `GET /merchant/orders`, `POST /merchant/orders/{id}/accept`, `/reject`, `/ready`, `GET /merchant/reports` | Sesi OTP, peran merchant |
| Kurir | `GET /c/{token}`, `POST /c/{token}/pickup`, `POST /c/{token}/deliver` | Token sekali pakai per order, kedaluwarsa |
| Admin | `/admin/orders`, `/admin/orders/{id}/dispatch`, `/admin/orders/{id}/refund`, `/admin/merchants`, `/admin/couriers`, `/admin/vouchers`, `/admin/payouts`, `/admin/reconciliation`, `/admin/segments/import`, `/admin/kpi` | SSO atau email + MFA, RBAC |
| Webhook masuk | `POST /webhooks/psp`, `POST /webhooks/whatsapp` | Verifikasi tanda tangan, idempoten |

`POST /quotes` menghitung harga final (produk, ongkir berdasarkan jarak jalan aktual, biaya layanan, pajak, diskon) dan mengembalikan `quote_id` dengan masa berlaku singkat. `POST /orders` hanya menerima `quote_id`, sehingga harga yang dilihat pelanggan sama dengan yang ditagih (prinsip harga transparan proposal).

**Integrasi pihak ketiga**

Proposal menetapkan build vs buy tetapi tidak memilih vendor. Kolom kandidat di bawah adalah usulan untuk dievaluasi, bukan keputusan; kemampuan dan izin tiap vendor harus dikonfirmasi langsung.

| Kebutuhan | Kandidat | Yang dievaluasi |
| --- | --- | --- |
| Pembayaran | Midtrans, Xendit, DOKU, atau penyedia berizin lain | Izin, QRIS, pembagian dana ke merchant tanpa Sonnet menampung dana, biaya, rekonsiliasi |
| Pesan | WhatsApp Business Platform lewat penyedia resmi; SMS sebagai fallback | Template berizin, biaya per percakapan, opt-in |
| Peta dan jarak jalan | Google Maps Platform atau alternatif berbasis OpenStreetMap | Biaya per request, akurasi alamat Bandung, Jakarta, Sukabumi |
| Penyimpanan foto | Object storage S3-compatible dengan image resize | Biaya dan latensi dari Indonesia |
| Monitoring | Sentry untuk error, uptime monitor, alert ke WhatsApp atau Slack | Cakupan alert order tertahan |

## 9. Non-functional requirements

Skala pilot kecil (ratusan order per bulan), jadi risiko utamanya adalah keamanan, privasi, dan kebenaran uang, bukan throughput. Angka di bawah adalah target usulan yang bisa dikalibrasi dengan Technology lead.

| Kategori | Requirement |
| --- | --- |
| Performa | Halaman katalog dapat dipakai di Android kelas menengah dengan 4G; target LCP ≤ 2,5 detik; p95 respons API ≤ 500 ms pada beban pilot |
| Ketersediaan | 99,5% pada jam layanan zona pilot; jendela deploy di luar jam layanan |
| Backup dan pemulihan | Backup harian dan point-in-time recovery database; uji pemulihan sekali sebelum pilot |
| Keamanan aplikasi | HTTPS di semua jalur, tinjauan terhadap OWASP ASVS Level 1, rate limit OTP dan login, verifikasi tanda tangan webhook, secret di secret manager, pemindaian dependensi |
| Keamanan data | Enkripsi at rest dan in transit; enkripsi level field untuk telepon dan alamat; MFA untuk admin; prinsip least privilege per peran |
| Privasi (UU PDP) | Pengumpulan data minimum; consent dan versi privacy notice tercatat; hak akses, koreksi, dan penghapusan dapat dipenuhi; kebijakan retensi; prosedur insiden dengan batas waktu notifikasi yang dikonfirmasi Legal |
| Pemisahan data ISP | Data pelanggan ISP dan data transaksi aplikasi terpisah secara logis dengan hak akses berbasis peran; data ISP tidak dipakai untuk pemasaran tanpa dasar pemrosesan dan izin |
| Integritas keuangan | Idempotensi pada webhook dan pembuatan order; ledger tidak dapat diubah, koreksi lewat entri baru; rekonsiliasi harian otomatis |
| Observability | Log terstruktur dengan correlation id per order; alert untuk webhook pembayaran gagal, order tertahan, dan error rate; dashboard operasional |
| Lokalisasi dan aksesibilitas | Bahasa Indonesia, format Rupiah, zona waktu WIB, kontras dan ukuran sentuh yang layak untuk pengguna awam |
| Kepatuhan | Legal checklist Bagian 9.4 proposal (PSE, UU PDP, penyedia pembayaran berizin, perdagangan elektronik) diselesaikan sebelum pilot komersial; PRD ini bukan opini hukum |

## 10. Instrumentasi analytics dan dashboard KPI

Setiap hipotesis H1–H5 dan setiap ambang go/no-go harus dapat dijawab dari data sistem, tanpa rekap manual. Event produk dikirim ke tabel `analytics_events` milik sendiri (bukan hanya tool pihak ketiga), supaya data tetap dimiliki Sonnet.

**Event wajib**

| Event | Pemicu | Tahap funnel (proposal 7.2) |
| --- | --- | --- |
| `zone_checked` | Alamat dicek terhadap zona (in\_zone true/false) | Awareness |
| `signup_completed` | OTP terverifikasi, consent tercatat | Registrasi |
| `address_set` | Alamat tersimpan | Alamat |
| `merchant_viewed`, `product_viewed` | Halaman dibuka | Browse |
| `cart_updated` | Item ditambah atau dihapus | Keranjang |
| `checkout_started` | Halaman checkout dibuka | Checkout |
| `payment_succeeded` | Webhook pembayaran valid | Checkout |
| `order_status_changed` | Setiap transisi di `order_events` | Order selesai |
| `order_completed`, `order_cancelled` | Status akhir, dengan kode alasan | Order selesai |
| `rating_submitted` | Rating dikirim | Kepuasan |
| `voucher_redeemed`, `sonnet_verification_completed` | Voucher dipakai, verifikasi selesai | Aktivasi |
| `merchant_stage_changed` | Perpindahan funnel merchant | Funnel merchant |

Setiap event membawa `channel` (QR merchant, mitra, kanal komunikasi Sonnet, organik), `zone_id`, dan apakah pelanggan terverifikasi Sonnet, supaya konversi first order per kanal (H3) dan merchant per mitra (H5) dapat dihitung.

**Dashboard**

1. **Basis dan zona:** segmentasi 4.000 per jenis, kota, status aktif, dapat dihubungi; peta densitas dan zone scorecard.
2. **Funnel pelanggan:** konversi di tiap tahap, bukan hanya jumlah registrasi.
3. **Merchant:** funnel prospecting sampai activation, merchant aktif per minggu, merchant yang dibawa tiap mitra.
4. **Operasional:** order tertahan, waktu terima merchant, waktu dispatch, ketepatan waktu, pembatalan per alasan.
5. **Unit economics:** GMV, pendapatan, biaya kurir, biaya pembayaran, subsidi, dan contribution margin per order dan per zona.
6. **Scoreboard go/no-go:** delapan indikator Bagian 2 dengan status hijau, kuning, atau merah. Ambang disimpan sebagai konfigurasi, bukan kode, karena proposal akan mengalibrasi ulang di akhir minggu 4.

**Hipotesis dan datanya**

| Hipotesis | Data yang menjawab |
| --- | --- |
| H1 Warga sulit menemukan dan memesan dari toko sekitar | `zone_checked`, waitlist di luar zona, konversi funnel; survei dilakukan di luar sistem |
| H2 Merchant mau menerima order dan membayar komisi | `merchants.funnel_stage`, merchant aktif per minggu, tingkat penerimaan order |
| H3 Pelanggan Sonnet merespons benefit | `voucher_redeemed` dan first order per kanal |
| H4 Pengantaran dengan contribution margin ≥ 0 | `deliveries.courier_cost`, `order_financials` |
| H5 Mitra membantu onboarding merchant | `merchants.partner_id`, merchant aktif per mitra |

## 12. Preview Fase 1 dan kriteria transisi

Fase 1 hanya dimulai jika Gate 1 terpenuhi, dan arsitektur Fase 0 dirancang agar hampir semuanya terbawa: backend, kontrak API, data model, dan admin console tetap; yang diganti hanya klien pelanggan jika data pilot membenarkannya. Proposal memperkirakan build MVP 12–16 minggu, closed beta sekitar 4 minggu, lalu pilot terkontrol 4–8 minggu, bergantung pada tim, vendor, integrasi pembayaran, dan kesiapan data.

| Kapabilitas | Fase 0 (PRD ini) | Fase 1: MVP aplikasi | Fase 2–3 |
| --- | --- | --- | --- |
| Klien pelanggan | Web mobile-first | Android-first atau PWA, diputuskan dari data pilot | iOS |
| Merchant | Alat web ringan + WhatsApp | Merchant portal penuh | Langganan premium |
| Kurir | Tautan web per order | Dispatch semi-otomatis | Driver app, tarif berbasis zona |
| Pembayaran | Penyedia berizin, payout semi-manual | Payment gateway penuh, payout terjadwal | Loyalty wallet |
| Promosi | Voucher first order, kode QR | Promosi dasar, referral | Sponsored listing, layanan kampanye |
| Analytics | Dashboard KPI pilot | Analytics produk dan cohort retensi | Pelaporan P&L per kota dan zona |
| Cakupan | 1 micro-zone | Zona yang disetujui | Zona dan kota baru |

**Kriteria agar Fase 0 tidak menjadi kode buangan**

- Monolit modular dengan batas modul yang jelas (katalog, order, pembayaran, dispatch, voucher, analytics); belum perlu microservice.
- API-first: storefront Fase 0 hanyalah salah satu klien dari API yang sama dengan yang akan dipakai app Fase 1.
- Ambang, komisi, tarif, dan zona dalam konfigurasi, bukan hardcode.
- Keputusan PWA vs native diambil dari data pilot (friksi instalasi, repeat order, kebutuhan notifikasi), bukan sebelum pilot.

## 13. Risiko, asumsi, open questions, dan temuan dari proposal

Empat temuan dari proposal memengaruhi build dan perlu keputusan sebelum minggu 1.

### Temuan dari proposal

1. **Tim Fase 0 tidak memuat engineer.** Daftar tim di Bagian 8.2 berisi sponsor, product owner, ops, marketing, dan Finance/legal/data paruh waktu; Technology lead hanya muncul di tata kelola (9.1). Anggaran Fase 0 juga dirinci untuk "tim, insentif merchant dan voucher pilot, biaya kurir, riset, dan legal review", tanpa biaya engineering, vendor, atau cloud. Estimasi saya untuk lingkup PRD ini: minimal 2 engineer fullstack dan desainer paruh waktu selama 8 minggu, dengan QA dan DevOps dirangkap atau paruh waktu. Ini perlu dimasukkan ke batas anggaran yang masih kosong ("Rp \[●\] juta").
2. **Target merchant tidak seragam.** Hipotesis H2 menyebut minimal 15 merchant siap, jadwal minggu 3–5 menyebut minimal 20 siap, dan ambang Go menyebut ≥ 15 merchant aktif. PRD memakai 20 siap dan ≥ 15 aktif; Product owner perlu mengonfirmasi.
3. **Ambang 200 order mungkin tinggi untuk satu micro-zone.** Base case proposal (Bagian 5.1) memperkirakan 400 order per bulan dari seluruh basis 4.000, dan conservative 120. Pilot di satu zona dengan target ≥ 200 order dalam 4 minggu menuntut kinerja mendekati separuh base case seluruh basis, kecuali pembeli non-Sonnet banyak. Proposal sendiri berencana mengalibrasi ambang di minggu ke-4, jadi dashboard memisahkan pembeli Sonnet dan non-Sonnet agar kalibrasi berbasis data.
4. **Verifikasi pelanggan Sonnet belum didefinisikan.** Proposal menjanjikan voucher untuk "pelanggan internet yang terverifikasi" tetapi tidak menyebut jalur data dari sistem ISP. Lihat O1.

### Open questions

| ID | Pertanyaan | Pemilik | Rekomendasi awal |
| --- | --- | --- | --- |
| O1 | Bagaimana pelanggan Sonnet diverifikasi? | Product, Legal, Tech | Fase 0: kode voucher unik sekali pakai yang dikirim lewat kanal Sonnet yang sah, sehingga tidak ada data ISP yang masuk ke aplikasi. Integrasi CRM ditunda ke Fase 1. |
| O2 | Entitas hukum operator platform dan siapa merchant of record? | Legal, Finance | Diputuskan sebelum integrasi penyedia pembayaran |
| O3 | Kategori awal dan komisi per kategori? | Product | Kebutuhan rutin dan F&B (Bagian 7.1); komisi sebagai konfigurasi |
| O4 | Model ongkir dan biaya kurir di Fase 0? | Delivery ops, Finance | Kerangka tarif Bagian 6 proposal; angka divalidasi sebelum pilot |
| O5 | Micro-zone mana yang dipilih? | Product, Network Ops | Output minggu 1–2; polygon zona diinput di admin |
| O6 | Siapa pemilik akun cloud, domain, repo, dan akun penyedia pembayaran? | Legal, Tech | Atas nama Sonnet sejak hari pertama (Bagian 9.2 proposal) |
| O7 | Dikerjakan tim internal atau vendor? | Sponsor, Tech lead | Jika vendor: kontrak memuat serah terima source code dan acceptance test |
| O8 | SLA yang dijanjikan ke pelanggan (waktu terima merchant, estimasi antar)? | Delivery ops | Ditetapkan sebelum UAT agar alert order tertahan punya ambang |
| O9 | Dasar pemrosesan untuk menghubungi pelanggan ISP? | Legal | Kanal hanya untuk yang sudah berizin (Lampiran A proposal) |

### Risiko teknis

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Izin penyedia pembayaran dan template WhatsApp memakan waktu di luar kendali tim | Pilot mundur dari minggu 5 | Ajukan ke dua kandidat paralel di minggu 1; siapkan fallback manual yang disetujui Legal |
| Merchant tidak membuka portal | Order tertahan, pembatalan naik | Notifikasi WhatsApp dengan tautan aksi; ops dapat bertindak atas nama merchant |
| Kesalahan hitung harga atau komisi | Kerugian uang dan sengketa | Quote server-side, ledger per order, tes otomatis aturan komisi, rekonsiliasi harian |
| Kebocoran data kontak | Insiden privasi menghentikan pilot | Enkripsi field, masking, RBAC, audit trail, pemisahan data ISP |
| Kualitas basis 4.000 rendah (komposisi belum divalidasi) | Segmentasi menyesatkan | Validasi dan dedup saat impor; laporan kualitas data |
| Scope creep ke fitur Fase 1 | Pilot terlambat | P0 dibekukan sebelum minggu 5; P1 hanya selama pilot dan tidak mengganggu pencatatan data |
| Dispatch manual salah atau terlambat | Ketepatan waktu turun, data biaya tidak valid | Antrian dan alert order tertahan; biaya kurir wajib diisi sebelum order ditutup |

### Asumsi

- Pilot satu micro-zone dengan 20 merchant dan ratusan order, jadi satu server aplikasi dan satu database sudah cukup.
- Tim ops mengoperasikan dispatch dan onboarding secara manual selama pilot.
- Semua angka ambang dan simulasi ekonomi dari proposal bersifat ilustratif dan akan diganti data pilot.

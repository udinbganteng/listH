/* --- KONFIGURASI UMUM --- */
const NOMOR_WA = "6289638435479"; // Ubah dengan nomor WA Penjual

/* ========================================================
   1. KONFIGURASI & INISIALISASI FIREBASE
   (Ganti dengan kredensial Firebase dari Console Anda)
   ======================================================== */
const firebaseConfig = {
    apiKey: "API_KEY_ANDA",
    authDomain: "DOMAIN_ANDA.firebaseapp.com",
    projectId: "PROJECT_ID_ANDA",
    storageBucket: "BUCKET_ANDA.appspot.com",
    messagingSenderId: "SENDER_ID_ANDA",
    appId: "APP_ID_ANDA"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Objek lokal untuk menampung sinkronisasi state stok realtime dari Firestore
let realtimeStockData = {};

/* --- MASTER DATA PRODUK --- */
const products = [
    // Telkomsel Harian
    { id: 1, name: "Telkomsel Mini Data 1GB", provider: "Telkomsel", type: "harian", quota: "1 GB", activePeriod: "1 Hari", price: 10000, class: "telkomsel", location: "Isi Ulang Data > Paket Mini Data > harian", note: "Paket ada di menu promo harian." },
    { id: 2, name: "Telkomsel Mini Data 4GB", provider: "Telkomsel", type: "harian", quota: "4 GB", activePeriod: "1 Hari", price: 11000, class: "telkomsel", location: "Isi Ulang Data > Paket Mini Data > harian", note: "Stok terbatas sering berubah harga." },
    { id: 3, name: "Telkomsel Mini Data 3GB", provider: "Telkomsel", type: "harian", quota: "3 GB", activePeriod: "5 Hari", price: 14000, class: "telkomsel", location: "Isi Ulang Data > Paket Mini Data > harian", note: "Promo reguler nasional." },
    { id: 4, name: "Telkomsel Mini Data 5GB", provider: "Telkomsel", type: "harian", quota: "5 GB", activePeriod: "1 Hari", price: 17000, class: "telkomsel", location: "Isi Ulang Data > Paket Mini Data > harian", note: "Khusus pelanggan terpilih." },
    { id: 5, name: "Telkomsel Mini Data 5GB", provider: "Telkomsel", type: "harian", quota: "5 GB", activePeriod: "5 Hari", price: 21000, class: "telkomsel", location: "Isi Ulang Data > Paket Mini Data > harian", note: "Bisa ditembak via digipos." },
    { id: 6, name: "Telkomsel Mini Data 7GB", provider: "Telkomsel", type: "harian", quota: "7 GB", activePeriod: "3 Hari", price: 29000, class: "telkomsel", location: "Isi Ulang Data > Paket Mini Data > harian", note: "Paling laris untuk streaming harian." },
    { id: 7, name: "Telkomsel Mini Data 8GB", provider: "Telkomsel", type: "harian", quota: "8 GB", activePeriod: "2 Hari", price: 30000, class: "telkomsel", location: "Isi Ulang Data > Paket Mini Data > harian", note: "Pengisian instan." },

    // Telkomsel Mingguan / Bulanan
    { id: 8, name: "Telkomsel Mini Data 1GB", provider: "Telkomsel", type: "mingguan", quota: "1 GB", activePeriod: "30 Hari", price: 16000, class: "telkomsel", location: "Isi Ulang Data > Paket Mini Data > Mingguan", note: "Masa aktif panjang harga hemat." },
    { id: 9, name: "Telkomsel Mini Data 3GB", provider: "Telkomsel", type: "mingguan", quota: "3 GB", activePeriod: "7 Hari", price: 18000, class: "telkomsel", location: "Isi Ulang Data > Paket Mini Data > Mingguan", note: "Paket mingguan standar." },
    { id: 10, name: "Telkomsel Mini Data 7GB", provider: "Telkomsel", type: "mingguan", quota: "7 GB", activePeriod: "7 Hari", price: 28000, class: "telkomsel", location: "Isi Ulang Data > Paket Mini Data > Mingguan", note: "Termasuk kuota aplikasi chat." },
    { id: 11, name: "Telkomsel Mini Data 1.5GB", provider: "Telkomsel", type: "mingguan", quota: "1.5 GB", activePeriod: "14 Hari", price: 28000, class: "telkomsel", location: "Isi Ulang Data > Paket Mini Data > Mingguan", note: "Sering dipakai anak sekolahan." },

    // AXIS
    { id: 40, name: "Aigo Mini 5GB + Bonus", provider: "Axis", type: "harian", quota: "5 GB", activePeriod: "1 Hari", price: 8000, class: "axis", location: "Aigo Kuota Mini > 1-3hari", note: "Paket reguler non-lokal." },
    { id: 41, name: "Aigo Mini 15GB + Bonus", provider: "Axis", type: "harian", quota: "15 GB", activePeriod: "1 Hari", price: 10000, class: "axis", location: "Aigo Kuota Mini > 1-3hari", note: "Paket reguler non-lokal." },
    { id: 42, name: "Aigo Mini 5GB + Bonus", provider: "Axis", type: "harian", quota: "5 GB", activePeriod: "2 Hari", price: 10000, class: "axis", location: "Aigo Kuota Mini > 1-3hari", note: "Paket reguler non-lokal." },
    { id: 43, name: "Aigo Mini 5GB + Bonus", provider: "Axis", type: "harian", quota: "5 GB", activePeriod: "3 Hari", price: 12000, class: "axis", location: "Aigo Kuota Mini > 1-3hari", note: "Paket reguler non-lokal." },

    // Tri
    { id: 50, name: "TRI 6GB", provider: "Three", type: "harian", quota: "6GB", activePeriod: "1 Hari", price: 8000, class: "three", location: "paket Happy", note: "Full kuota 24 jam nonstop." },
    { id: 51, name: "TRI 10GB", provider: "Three", type: "harian", quota: "10GB", activePeriod: "1 Hari", price: 10000, class: "three", location: "paket Happy", note: "Full kuota 24 jam nonstop." },
    { id: 57, name: "TRI 3GB", provider: "Three", type: "mingguan", quota: "3GB", activePeriod: "28 Hari", price: 22000, class: "three", location: "paket Happy", note: "Full kuota 24 jam nonstop." },

    // Indosat
    { id: 70, name: "Indosat Freedom Mini 1GB", provider: "Indosat", type: "harian", quota: "1GB", activePeriod: "2 Hari", price: 8000, class: "indosat", location: "Isi Ulang > Fredoom Mini Data > All Nasional", note: "Full kuota 24 jam nonstop." },
    { id: 76, name: "PROMO Indosat Freedom 4GB", provider: "Indosat", type: "mingguan", quota: "4GB", activePeriod: "28 Hari", price: 24000, class: "indosat", location: "Isi Ulang > Fredoom Data > Mobo", note: "Full kuota 24 jam nonstop." },

    // XL Axiata
    { id: 80, name: "Flex Mini 10GB", provider: "XL", type: "harian", quota: "10GB", activePeriod: "1 Hari", price: 10000, class: "xl", location: "Isi Ulang > XL Combo Flex > Mini", note: "Bonus opsi kuota lokal aplikasi." },
    { id: 81, name: "Flex Mini 6GB", provider: "XL", type: "harian", quota: "6GB", activePeriod: "2 Hari", price: 11000, class: "xl", location: "Isi Ulang > XL Combo Flex > Mini", note: "Bisa inject langsung via h2h." },

    // Smartfren
    { id: 90, name: "Smart 1GB ALL", provider: "Smartfren", type: "harian", quota: "1GB", activePeriod: "3 Hari", price: 7000, class: "smartfren", location: "Isi Ulang > Mini Data Smartfren", note: "Murah meriah, cocok untuk main game." },
    { id: 91, name: "Smart 4GB ALL", provider: "Smartfren", type: "harian", quota: "4GB", activePeriod: "3 Hari", price: 10000, class: "smartfren", location: "Isi Ulang > Mini Data Smartfren", note: "Murah meriah, cocok untuk main game." },

    // By.U
    { id: 100, name: "ByU 2GB", provider: "ByU", type: "harian", quota: "2 GB", activePeriod: "1 Hari", price: 8000, class: "byu", location: "Paket Data by U > Byu Data Harian >", note: "Sinyal Telkomsel 100% aman." },
    { id: 101, name: "ByU 10GB", provider: "ByU", type: "harian", quota: "10 GB", activePeriod: "1 Hari", price: 12000, class: "byu", location: "Paket Data by U > Byu Data Harian >", note: "Paling dicari anak sekolah/kuliah." }
];

let currentFilter = 'all';
let currentCategory = 'all';
let currentSort = 'default';
let isAdminMode = false;
let selectedProductId = null; // Menyimpan ID paket yg dipilih di Modal

// Inisialisasi Aplikasi saat Load Pertama Kali
window.addEventListener('DOMContentLoaded', () => {
    renderTabs();
    renderProducts(); // Render awal agar tidak kosong selagi load Firestore
    initFirebaseStock(); // Mulai sinkronisasi realtime & auto-generate collection
});

/* ========================================================
   2. INISIALISASI DATA & LISTENER REALTIME FIRESTORE
   ======================================================== */
function initFirebaseStock() {
    const collectionRef = db.collection('produk');

    // --- Listener Realtime (onSnapshot) ---
    // Setiap ada perubahan data di cloud, akan ter-sync otomatis tanpa refresh
    collectionRef.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            const data = change.doc.data();
            const docId = change.doc.id;

            if (change.type === "added" || change.type === "modified") {
                realtimeStockData[docId] = data.stok;
            }
            if (change.type === "removed") {
                delete realtimeStockData[docId];
            }
        });
        // Render ulang produk secara realtime untuk semua pengunjung (pembeli & penjual)
        renderProducts();
    });

    // --- Auto-inisialisasi Data (Mencegah perubahan pada array asli) ---
    collectionRef.get().then((querySnapshot) => {
        const existingIds = [];
        querySnapshot.forEach((doc) => existingIds.push(doc.id));

        products.forEach(p => {
            const strId = p.id.toString();
            // Jika produk lokal belum ada di Firestore, maka buat datanya
            if (!existingIds.includes(strId)) {
                collectionRef.doc(strId).set({
                    id: strId,
                    nama: p.name,
                    harga: p.price.toString(),
                    stok: true
                }).catch(err => console.error("Gagal inisialisasi produk ke DB:", err));
            }
        });
    }).catch(err => console.error("Gagal membaca koleksi awal:", err));
}

/* ========================================================
   3. MENGAMBIL STATUS STOK (MODE PEMBELI)
   ======================================================== */
function getStockStatus(id) {
    const strId = id.toString();
    // Jika data firestore belum terpanggil secara penuh, asumsikan true
    return realtimeStockData.hasOwnProperty(strId) ? realtimeStockData[strId] : true;
}

/* ========================================================
   4. MENYIMPAN PERUBAHAN STOK KE FIRESTORE (MODE PENJUAL)
   ======================================================== */
function toggleStock(id, isAvailable) {
    const strId = id.toString();
    db.collection('produk').doc(strId).update({
        stok: isAvailable
    }).then(() => {
        // Berhasil disimpan. onSnapshot akan menangkap perubahannya dan trigger renderProducts()
        console.log(`Stok ${strId} diubah menjadi: ${isAvailable}`);
    }).catch((error) => {
        console.error("Error update stok:", error);
        alert("Gagal memperbarui stok di server. Silakan cek koneksi internet.");
    });
}

/* --- DINAMIS PROVIDER MENUS GENERATOR --- */
function renderTabs() {
    const wrapper = document.getElementById('dynamicTabsWrapper');
    const uniqueProviders = ['all'];
    products.forEach(p => {
        if (!uniqueProviders.includes(p.provider)) {
            uniqueProviders.push(p.provider);
        }
    });

    const providerNames = {
        'all': '🔥 Semua',
        'Telkomsel': '🔴 Telkomsel',
        'Indosat': '🟡 Indosat',
        'XL': '🔵 XL Axiata',
        'Axis': '🟣 Axis',
        'Three': '⚫ Three (3)',
        'Smartfren': '💗 Smartfren',
        'LiveOn': '💎 Live.On',
        'ByU': '🔷 By.U'
    };

    wrapper.innerHTML = uniqueProviders.map(prov => {
        const displayName = providerNames[prov] || prov;
        const activeClass = currentFilter === prov ? 'active' : '';
        return `<button class="tab-btn ${activeClass}" id="tab-${prov}" onclick="filterProvider('${prov}')">${displayName}</button>`;
    }).join('');
}

/* --- LOGIKA MODAL PEMBELIAN & VALIDASI NOMOR --- */
function openBuyModal(id) {
    selectedProductId = id;
    const item = products.find(p => p.id === id);
    if (!item) return;

    // Set text di Modal
    document.getElementById('modalPackageName').innerText = `Nama Paket: ${item.name}`;
    document.getElementById('modalPackagePrice').innerText = `Harga: Rp ${item.price.toLocaleString('id-ID')}`;

    // Reset input form
    document.getElementById('targetNumber').value = '';
    document.getElementById('numberError').style.display = 'none';

    // Tampilkan modal
    document.getElementById('buyModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('buyModal').style.display = 'none';
    selectedProductId = null;
}

function processBuy() {
    const numInput = document.getElementById('targetNumber').value.trim();
    const errorMsg = document.getElementById('numberError');

    // Validasi Nomor jika diisi (Hanya 08 atau 62)
    if (numInput !== '') {
        if (!numInput.startsWith('08') && !numInput.startsWith('62')) {
            errorMsg.style.display = 'block';
            return; // Hentikan proses jika nomor salah
        }
    }
    const productId = selectedProductId;
    // Jika valid / dikosongkan
    errorMsg.style.display = 'none';
    closeModal();
    showToast();

    // Eksekusi Generate Link WhatsApp (Delay 1.5 detik agar toast terbaca)
    setTimeout(() => {
        const item = products.find(p => p.id === productId);
        const formatPrice = item.price.toLocaleString('id-ID');

        // Format Pesan
        let rawMessage = `Halo, saya ingin membeli paket berikut:\n` +
            `Provider: ${item.provider}\n` +
            `Nama Paket: ${item.name}\n` +
            `Kuota: ${item.quota}\n` +
            `Masa Aktif: ${item.activePeriod}\n` +
            `Harga: Rp ${formatPrice}\n` +
            `Lokasi: ${item.location}`;

        // Tambahkan Nomor Tujuan jika tidak kosong
        if (numInput !== '') {
            rawMessage += `\nNomor Tujuan: ${numInput}`;
        }

        const encodedText = encodeURIComponent(rawMessage);
        const waUrl = `https://api.whatsapp.com/send?phone=${NOMOR_WA}&text=${encodedText}`;

        window.open(waUrl, '_blank');
    }, 1500);
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.className = "toast show";
    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 2000); // Hilang setelah 2 detik
}

/* --- 5. RENDER DAFTAR PRODUK (DENGAN LOGIKA STOK) --- */
function renderProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';

    // Filter Berdasarkan Provider & Kategori
    let filtered = products.filter(p => {
        const matchProv = (currentFilter === 'all' || p.provider === currentFilter);
        const matchCat = (currentCategory === 'all' || p.type === currentCategory);
        return matchProv && matchCat;
    });

    // Pengurutan (Sorting) Harga
    if (currentSort === 'asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'desc') {
        filtered.sort((a, b) => b.price - a.price);
    }

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted); font-size:0.9rem;">Paket tidak ditemukan.</div>`;
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement('div');

        // Cek status ketersediaan stok
        const inStock = getStockStatus(p.id);

        // Jika stok habis, tambahkan class out-of-stock untuk efek redup
        card.className = inStock ? 'product-card' : 'product-card out-of-stock';

        let adminPanelHtml = '';
        if (isAdminMode) {
            adminPanelHtml = `
                        <div class="seller-info-panel">
                            <!-- Checkbox khusus penjual untuk mengatur stok (Terhubung Firestore) -->
                            <div class="stock-checkbox-container">
                                <input type="checkbox" id="chk-${p.id}" onchange="toggleStock(${p.id}, this.checked)" ${inStock ? 'checked' : ''}>
                                <label for="chk-${p.id}" style="color: ${inStock ? 'var(--success-color)' : 'var(--danger-color)'};">
                                    ${inStock ? 'Stok Tersedia' : 'Stok Habis (Centang untuk buka stok)'}
                                </label>
                            </div>
                            <h4>🛠️ Data Kulakan Seller:</h4>
                            <div class="seller-meta">📍 Tembak: <span>${p.location}</span></div>
                            <div class="seller-meta">📝 Note: <span>${p.note}</span></div>
                        </div>
                    `;
        }

        // Render tombol beli (Aktif jika tersedia, disabled jika habis)
        const buyBtnHtml = inStock
            ? `<button class="btn-buy" onclick="openBuyModal(${p.id})">Beli</button>`
            : `<button class="btn-buy btn-disabled" disabled>Stok Habis</button>`;

        // Render badge stok habis jika inStock == false
        const stockBadgeHtml = !inStock
            ? `<span class="badge badge-stok-habis">STOK HABIS</span>`
            : '';

        card.innerHTML = `
                    <div class="prod-info-main">
                        <div>
                            <span class="badge ${p.class}">${p.provider}</span>
                            ${stockBadgeHtml}
                        </div>
                        <div class="prod-name" title="${p.name}">${p.name}</div>
                        <div class="prod-meta-sub">${p.quota}</div>
                    </div>
                    <div class="prod-price-box">
                        <div class="prod-price">Rp ${p.price.toLocaleString('id-ID')}</div>
                        <div class="prod-active-period">⌛ ${p.activePeriod}</div>
                    </div>
                    <div>
                        ${buyBtnHtml}
                    </div>
                    ${adminPanelHtml}
                `;
        grid.appendChild(card);
    });
}

/* --- CONTROLLER FILTER & SORTING --- */
function filterProvider(prov) {
    currentFilter = prov;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeTab = document.getElementById(`tab-${prov}`);
    if (activeTab) activeTab.classList.add('active');

    const providerTitles = { 'all': 'Semua Paket Internet' };
    document.getElementById('sectionTitle').innerText = `📶 ${providerTitles[prov] || 'Paket ' + prov}`;

    renderProducts();
}

function filterCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.sub-btn').forEach(btn => btn.classList.remove('active'));

    if (cat === 'all') document.getElementById('subAll').classList.add('active');
    if (cat === 'harian') document.getElementById('subHarian').classList.add('active');
    if (cat === 'mingguan') document.getElementById('subMingguan').classList.add('active');

    renderProducts();
}

function changeSort(val) {
    currentSort = val;
    renderProducts();
}

/* --- SELLER INTERNAL FEATURES CONTROL --- */
function toggleAdminMode() {
    const formContainer = document.getElementById('adminFormContainer');
    if (!isAdminMode) {
        const password = prompt("Masukkan Kode Keamanan Penjual:");
        if (password === "ujangRonda") {
            isAdminMode = true;
            document.getElementById('adminBtn').innerText = "🔓 Mode Penjual (Aktif)";
            document.getElementById('adminBtn').style.background = "var(--danger-color)";
            formContainer.style.display = 'block';
            alert("Akses diterima. Fitur kontrol stok realtime sekarang aktif.");
            renderProducts();
        } else {
            alert("Kode salah!");
        }
    } else {
        isAdminMode = false;
        document.getElementById('adminBtn').innerText = "🔒 Mode Penjual";
        document.getElementById('adminBtn').style.background = "rgba(255, 255, 255, 0.2)";
        formContainer.style.display = 'none';
        renderProducts(); // Render ulang untuk menyembunyikan opsi stok dari pembeli
    }
}

function addNewProduct(event) {
    event.preventDefault();

    const name = document.getElementById('pName').value;
    const provider = document.getElementById('pProvider').value;
    const type = document.getElementById('pType').value;
    const quota = document.getElementById('pQuota').value;
    const activePeriod = document.getElementById('pActive').value;
    const price = parseInt(document.getElementById('pPrice').value);
    const location = document.getElementById('pLocation').value;
    const note = document.getElementById('pNote').value;

    let providerClass = provider.toLowerCase();
    if (provider === "XL") providerClass = "xl";
    if (provider === "ByU") providerClass = "byu";
    if (provider === "LiveOn") providerClass = "liveon";

    const newProduct = {
        id: Date.now(), // ID unik berdasarkan waktu
        name, provider, type, quota, activePeriod, price,
        class: providerClass, location, note
    };

    // Tambahkan di state array lokal
    products.push(newProduct);

    // Tambahkan dokumen baru ke Firestore
    const strId = newProduct.id.toString();
    db.collection('produk').doc(strId).set({
        id: strId,
        nama: newProduct.name,
        harga: newProduct.price.toString(),
        stok: true
    }).catch(err => console.error("Gagal menambah ke database:", err));

    alert(`Paket "${name}" Berhasil ditambahkan ke Aplikasi!`);

    document.getElementById('newProductForm').reset();
    renderTabs();
    // Tidak perlu renderProducts() manual, snapshot listener otomatis akan me-render karena 'added' data.
}

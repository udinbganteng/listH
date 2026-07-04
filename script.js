import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    getDocs,
    setDoc,
    updateDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* --- KONFIGURASI UMUM --- */
const NOMOR_WA = "6289638435479"; // Ubah dengan nomor WA Penjual

// Konfigurasi Firebase Modular
const firebaseConfig = {
    apiKey: "AIzaSy....",
    authDomain: "udin-kuota.firebaseapp.com",
    projectId: "udin-kuota",
    storageBucket: "udin-kuota.firebasestorage.app",
    messagingSenderId: "634570933178",
    appId: "1:634570933178:web:91aabb192e9f51d90a1383"
};

// Inisialisasi Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// State Realtime Stok dari Firestore
let realtimeStockData = {};

/* --- MASTER DATA PRODUK (Untuk Info Statis, Stok via DB) --- */
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
let selectedProductId = null;

/* ========================================================
   INISIALISASI DATA & LISTENER REALTIME FIRESTORE (MODULAR)
   ======================================================== */
async function initFirebaseStock() {
    const produkCollectionRef = collection(db, "produk");

    // --- 1. Listener Realtime (onSnapshot) ---
    onSnapshot(produkCollectionRef, (snapshot) => {
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
        renderProducts(); // Langsung update UI jika ada stok yang diubah
    });

    // --- 2. Auto-inisialisasi Data Awal ke Firestore ---
    try {
        const querySnapshot = await getDocs(produkCollectionRef);
        const existingIds = [];
        querySnapshot.forEach((docSnap) => existingIds.push(docSnap.id));

        for (let p of products) {
            const strId = p.id.toString();
            // Jika produk belum ada di database, buat dokumennya
            if (!existingIds.includes(strId)) {
                const newDocRef = doc(db, "produk", strId);
                await setDoc(newDocRef, {
                    id: strId,
                    nama: p.name,
                    harga: p.price.toString(),
                    stok: true
                });
            }
        }
    } catch (err) {
        console.error("Gagal membaca koleksi awal:", err);
    }
}

// Ambil ketersediaan dari mapping realtime lokal
function getStockStatus(id) {
    const strId = id.toString();
    return realtimeStockData.hasOwnProperty(strId) ? realtimeStockData[strId] : true;
}

// Simpan perubahan ke Firestore (Khusus Admin)
async function toggleStock(id, isAvailable) {
    const strId = id.toString();
    const docRef = doc(db, "produk", strId);

    try {
        await updateDoc(docRef, { stok: isAvailable });
        console.log(`Stok ${strId} diubah ke: ${isAvailable}`);
    } catch (error) {
        console.error("Error update stok:", error);
        alert("Gagal memperbarui stok di server. Cek koneksi internet.");
    }
}

/* ========================================================
   FUNGSI-FUNGSI UI & LOGIKA 
   ======================================================== */
function renderTabs() {
    const wrapper = document.getElementById('dynamicTabsWrapper');
    const uniqueProviders = ['all'];
    products.forEach(p => {
        if (!uniqueProviders.includes(p.provider)) uniqueProviders.push(p.provider);
    });

    const providerNames = {
        'all': '🔥 Semua', 'Telkomsel': '🔴 Telkomsel', 'Indosat': '🟡 Indosat',
        'XL': '🔵 XL Axiata', 'Axis': '🟣 Axis', 'Three': '⚫ Three (3)',
        'Smartfren': '💗 Smartfren', 'LiveOn': '💎 Live.On', 'ByU': '🔷 By.U'
    };

    wrapper.innerHTML = uniqueProviders.map(prov => {
        const displayName = providerNames[prov] || prov;
        const activeClass = currentFilter === prov ? 'active' : '';
        return `<button class="tab-btn ${activeClass}" id="tab-${prov}" onclick="filterProvider('${prov}')">${displayName}</button>`;
    }).join('');
}

function renderProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';

    let filtered = products.filter(p => {
        const matchProv = (currentFilter === 'all' || p.provider === currentFilter);
        const matchCat = (currentCategory === 'all' || p.type === currentCategory);
        return matchProv && matchCat;
    });

    if (currentSort === 'asc') filtered.sort((a, b) => a.price - b.price);
    else if (currentSort === 'desc') filtered.sort((a, b) => b.price - a.price);

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted); font-size:0.9rem;">Paket tidak ditemukan.</div>`;
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement('div');
        const inStock = getStockStatus(p.id);

        card.className = inStock ? 'product-card' : 'product-card out-of-stock';

        let adminPanelHtml = '';
        if (isAdminMode) {
            adminPanelHtml = `
                        <div class="seller-info-panel">
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

        const buyBtnHtml = inStock
            ? `<button class="btn-buy" onclick="openBuyModal(${p.id})">Beli</button>`
            : `<button class="btn-buy btn-disabled" disabled>Stok Habis</button>`;

        const stockBadgeHtml = !inStock ? `<span class="badge badge-stok-habis">STOK HABIS</span>` : '';

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
                    <div>${buyBtnHtml}</div>
                    ${adminPanelHtml}
                `;
        grid.appendChild(card);
    });
}

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

function changeSort(val) { currentSort = val; renderProducts(); }

function openBuyModal(id) {
    selectedProductId = id;
    const item = products.find(p => p.id === id);
    if (!item) return;
    document.getElementById('modalPackageName').innerText = `Nama Paket: ${item.name}`;
    document.getElementById('modalPackagePrice').innerText = `Harga: Rp ${item.price.toLocaleString('id-ID')}`;
    document.getElementById('targetNumber').value = '';
    document.getElementById('numberError').style.display = 'none';
    document.getElementById('buyModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('buyModal').style.display = 'none';
    selectedProductId = null;
}

function processBuy() {
    const numInput = document.getElementById('targetNumber').value.trim();
    const errorMsg = document.getElementById('numberError');

    if (numInput !== '' && !numInput.startsWith('08') && !numInput.startsWith('62')) {
        errorMsg.style.display = 'block'; return;
    }

    const productId = selectedProductId;
    errorMsg.style.display = 'none';
    closeModal(); showToast();

    setTimeout(() => {
        const item = products.find(p => p.id === productId);
        const formatPrice = item.price.toLocaleString('id-ID');
        let rawMessage = `Halo, saya ingin membeli paket berikut:\nProvider: ${item.provider}\nNama Paket: ${item.name}\nKuota: ${item.quota}\nMasa Aktif: ${item.activePeriod}\nHarga: Rp ${formatPrice}\nLokasi: ${item.location}`;
        if (numInput !== '') rawMessage += `\nNomor Tujuan: ${numInput}`;
        window.open(`https://api.whatsapp.com/send?phone=${NOMOR_WA}&text=${encodeURIComponent(rawMessage)}`, '_blank');
    }, 1500);
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.className = "toast show";
    setTimeout(() => toast.className = toast.className.replace("show", ""), 2000);
}

function toggleAdminMode() {
    const formContainer = document.getElementById('adminFormContainer');
    if (!isAdminMode) {
        if (prompt("Masukkan Kode Keamanan Penjual:") === "ujangRonda") {
            isAdminMode = true;
            document.getElementById('adminBtn').innerText = "🔓 Mode Penjual (Aktif)";
            document.getElementById('adminBtn').style.background = "var(--danger-color)";
            formContainer.style.display = 'block';
            alert("Akses diterima. Fitur kontrol stok realtime di Firestore aktif.");
            renderProducts();
        } else alert("Kode salah!");
    } else {
        isAdminMode = false;
        document.getElementById('adminBtn').innerText = "🔒 Mode Penjual";
        document.getElementById('adminBtn').style.background = "rgba(255, 255, 255, 0.2)";
        formContainer.style.display = 'none';
        renderProducts();
    }
}

async function addNewProduct(event) {
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
        id: Date.now(), name, provider, type, quota,
        activePeriod, price, class: providerClass, location, note
    };

    products.push(newProduct);

    // Simpan ke Firestore Modular
    const strId = newProduct.id.toString();
    const docRef = doc(db, "produk", strId);
    try {
        await setDoc(docRef, { id: strId, nama: newProduct.name, harga: newProduct.price.toString(), stok: true });
        alert(`Paket "${name}" Berhasil ditambahkan ke Aplikasi & Database!`);
        document.getElementById('newProductForm').reset();
        renderTabs();
    } catch (err) {
        console.error("Gagal menambah ke database:", err);
    }
}

/* --- MENJADIKAN FUNGSI GLOBAL --- 
   Karena kita menggunakan type="module", fungsi di atas tidak otomatis bisa dipanggil 
   dari atribut HTML (onclick/onchange). Kita perlu mendaftarkannya ke object window. */
window.filterProvider = filterProvider;
window.filterCategory = filterCategory;
window.changeSort = changeSort;
window.toggleAdminMode = toggleAdminMode;
window.openBuyModal = openBuyModal;
window.closeModal = closeModal;
window.processBuy = processBuy;
window.toggleStock = toggleStock;
window.addNewProduct = addNewProduct;

// Inisialisasi saat load DOM
window.addEventListener('DOMContentLoaded', () => {
    renderTabs();
    renderProducts();
    initFirebaseStock();
});
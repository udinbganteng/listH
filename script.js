import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    updateDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

/* --- KONFIGURASI UMUM --- */
const NOMOR_WA = "6289638435479"; // Ubah dengan nomor WA Penjual

// Konfigurasi Firebase Modular
const firebaseConfig = {
    apiKey: "AIzaSyD8iht3iWBvxTcrKy_Ks9663qsPOodQ5Nw",
    authDomain: "udin-kuota.firebaseapp.com",
    projectId: "udin-kuota",
    storageBucket: "udin-kuota.firebasestorage.app",
    messagingSenderId: "634570933178",
    appId: "1:634570933178:web:91aabb192e9f51d90a1383"
};

// Inisialisasi Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

/* --- MASTER DATA PRODUK DARI FIRESTORE --- */
let products = [];

let currentFilter = 'all';
let currentCategory = 'all';
let currentSort = 'default';
let isAdminMode = false;
let selectedProductId = null;

// 1. Fungsi Login
async function loginAdmin() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        document.getElementById('loginError').innerText = "";
        document.getElementById('email').value = "";
        document.getElementById('password').value = "";
        document.getElementById('loginError').innerText = "";
    } catch (error) {
        document.getElementById('loginError').innerText = "Gagal login: Periksa email/password.";
    }
}

// 2. Auth State Listener (Auto Check)
onAuthStateChanged(auth, (user) => {
    const adminControls = document.getElementById('adminControls');
    const loginPage = document.getElementById('loginPage');

    if (user) {
        loginPage.style.display = 'none';
        adminControls.style.display = 'block';
        isAdminMode = true;
    } else {
        loginPage.style.display = 'block';
        adminControls.style.display = 'none';
        isAdminMode = false;
    }

    setTimeout(() => {
        renderProducts(); // kasih delay biar DOM ready
    }, 50);
});

function logoutAdmin() {
    signOut(auth);
    document.getElementById('email').value = "";
    document.getElementById('password').value = "";
    document.getElementById('loginError').innerText = "";
}

/* ========================================================
   INISIALISASI DATA & LISTENER REALTIME FIRESTORE (MODULAR)
   ======================================================== */
async function initFirebaseStock() {
    const produkCollectionRef = collection(db, "produk");

    // Listener Realtime (onSnapshot)
    onSnapshot(produkCollectionRef, (snapshot) => {
        products = []; // Kosongkan array setiap ada pembaruan data

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            products.push({
                id: docSnap.id,
                name: data.nama,
                provider: data.provider,
                type: data.type,
                quota: data.quota,
                activePeriod: data.activePeriod,
                price: Number(data.harga),
                class: data.class,
                location: data.location,
                note: data.note,
                stok: data.stok
            });
        });

        renderTabs();
        renderProducts();
    });
}

// Simpan perubahan ke Firestore (Khusus Admin)
async function toggleStock(id, isAvailable) {
    const docRef = doc(db, "produk", String(id));

    try {
        await updateDoc(docRef, { 
            stok: isAvailable 
        });
        console.log(`Stok ${id} diubah ke: ${isAvailable}`);
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
        const inStock = p.stok;

        card.className = inStock ? 'product-card' : 'product-card out-of-stock';

        let adminPanelHtml = '';
        if (isAdminMode) {
            adminPanelHtml = `
                        <div class="seller-info-panel">
                            <div class="stock-checkbox-container">
                                <input type="checkbox" id="chk-${p.id}" onchange="toggleStock('${p.id}', this.checked)" ${inStock ? 'checked' : ''}>
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
            ? `<button class="btn-buy" onclick="openBuyModal('${p.id}')">Beli</button>`
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
    const item = products.find(p => String(p.id) === String(id));
    
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
        errorMsg.style.display = 'block'; 
        return;
    }

    const productId = selectedProductId;
    errorMsg.style.display = 'none';
    closeModal(); 
    showToast();

    setTimeout(() => {
        const item = products.find(p => String(p.id) === String(productId));
        if(!item) return;

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

// ... (Biarkan fungsi initFirebaseStock, renderProducts, loginAdmin dll tetap seperti semula) ...

async function addNewProduct(event) {
    event.preventDefault();
    
    // Ambil data dari form
    const nama = document.getElementById('pName').value;
    const provider = document.getElementById('pProvider').value;
    const type = document.getElementById('pType').value;
    const quota = document.getElementById('pQuota').value;
    const activePeriod = document.getElementById('pActive').value;
    const price = document.getElementById('pPrice').value;
    const location = document.getElementById('pLocation').value;
    const note = document.getElementById('pNote').value;

    // Tentukan class warna badge sesuai provider
    let providerClass = provider.toLowerCase();
    if (provider === "XL") providerClass = "xl";
    if (provider === "ByU") providerClass = "byu";
    if (provider === "LiveOn") providerClass = "liveon";

    // MENGGUNAKAN ID OTOMATIS DARI FIRESTORE
    const newDoc = doc(collection(db, "produk"));
    
    try {
        await setDoc(newDoc, {
            nama: nama,
            provider: provider,
            type: type,
            quota: quota,
            activePeriod: activePeriod,
            harga: Number(price), // Pastikan tersimpan sebagai Number
            class: providerClass,
            location: location,
            note: note,
            stok: true
        });
        
        // Reset form dan berikan notifikasi
        document.getElementById('newProductForm').reset();
        alert(`Berhasil! Paket "${nama}" telah ditambahkan ke database.`);
        
        // Produk otomatis ter-render ulang karena onSnapshot() tetap berjalan
    } catch (err) {
        console.error("Gagal menambah ke database:", err);
        alert("Terjadi kesalahan saat menambahkan produk. Silakan coba lagi.");
    }
}

// ... (Biarkan deklarasi window.* di bagian bawah tetap sama) ...
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

window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;

// Inisialisasi saat load DOM
window.addEventListener('DOMContentLoaded', () => {
    initFirebaseStock();
});
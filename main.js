/* ============================================================
   main.js - dipakai di semua halaman (index, about, pendidikan,
   skill, hobi, project)
   Fitur:
   1. Animasi reveal saat di-scroll (fade + geser) pakai IntersectionObserver
   2. Efek ketik (typing) pada teks sambutan di halaman awal
   3. Hamburger menu otomatis untuk tampilan handphone (collapse/expand)
   4. Gerak paralel ringan pada lingkaran dekoratif background
   ============================================================ */

// tandai bahwa JS aktif, supaya CSS animasi boleh menyembunyikan elemen
document.documentElement.classList.add('js-anim');

/* ============================================================
   1. ANIMASI REVAL / SCROLL REVEAL
   Elemen yang cocok dengan daftar selector di bawah awalnya
   disembunyikan (lewat CSS .js-anim), lalu dimunculkan saat
   sudah masuk ke area layar. Setiap elemen dalam satu kelompok
   diberi jeda agar munculnya bergiliran (stagger).
   ============================================================ */
const REVEAL_SELECTOR = [
    '.wrapper > .container',      // foto profil di halaman awal
    '.sosmed',                    // ikon sosial media
    '.content',                   // teks sambutan
    '.menu-link:not(.menu)',      // kartu menu (hanya yang terluar)
    '.content-box',               // kotak konten besar
    '.card',                      // kartu isi (about, pengalaman, hobi)
    '.timeline-item',             // item timeline pendidikan
    '.skill-table',               // tabel keahlian
    '.experience-table'           // tabel pengalaman kerja
].join(', ');

function setupScrollReveal() {
    const targets = Array.from(document.querySelectorAll(REVEAL_SELECTOR));
    if (!targets.length) return;

    // sembunyikan dulu, CSS yang menangani (.js-anim .reveal-pending)
    targets.forEach(el => el.classList.add('reveal-pending'));

    // hitung indeks per parent supaya animasi berurutan per kelompok
    const countByParent = new Map();
    targets.forEach(el => {
        const parent = el.parentElement;
        const n = countByParent.get(parent) || 0;
        countByParent.set(parent, n);
        el.dataset.revealIndex = n;
        countByParent.set(parent, n + 1);
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const i = Number(entry.target.dataset.revealIndex || 0);
                entry.target.style.transitionDelay = (i * 120) + 'ms';
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
}

/* ============================================================
   2. EFEK KETIK pada <h1> di bagian ".content" (halaman awal)
   ============================================================ */
function setupTyping() {
    const h1 = document.querySelector('.content h1');
    if (!h1) return; // hanya jalan kalau elemennya ada

    const teks = h1.textContent.trim();
    h1.textContent = '';
    h1.setAttribute('aria-label', teks); // tetap terbaca untuk accessibility

    const cursor = document.createElement('span');
    cursor.className = 'type-cursor';
    cursor.textContent = '|';
    h1.after(cursor);

    let i = 0;
    function ketik() {
        if (i < teks.length) {
            h1.textContent += teks.charAt(i);
            i++;
            setTimeout(ketik, 55); // kecepatan ketik per huruf
        } else {
            // kursor berkedip beberapa detik lalu hilang
            setTimeout(() => cursor.remove(), 4000);
        }
    }
    setTimeout(ketik, 400);
}

/* ============================================================
   3. HAMBURGER MENU MOBILE
   Navbar yang ada diubah otomatis jadi tombol garis tiga di
   layar kecil, tanpa perlu mengubah struktur HTML masing-masing
   halaman. Klik lagi untuk menutup, klik salah satu link untuk
   navigasi normal.
   ============================================================ */
const MOBILE_BREAKPOINT = 992;

function setupMobileNav() {
    const navbars = document.querySelectorAll('.navbar');

    navbars.forEach(nav => {
        // simpan kelas asli supaya gampang dibersihkan
        nav.dataset.originalClass = nav.className;

        // sisipkan tombol hamburger
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'nav-toggle';
        toggle.setAttribute('aria-label', 'Buka menu navigasi');
        toggle.innerHTML = '<span></span><span></span><span></span>';
        nav.prepend(toggle);

        // bungkus link-link yang ada ke dalam satu container
        const linksWrap = document.createElement('div');
        linksWrap.className = 'nav-links';
        nav.querySelectorAll('a').forEach(a => linksWrap.appendChild(a));
        nav.appendChild(linksWrap);

        // buka / tutup menu
        toggle.addEventListener('click', () => {
            const terbuka = nav.classList.toggle('nav-open');
            toggle.setAttribute('aria-label',
                terbuka ? 'Tutup menu navigasi' : 'Buka menu navigasi');
        });

        // tutup menu lagi setelah salah satu link diklik
        linksWrap.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                nav.classList.remove('nav-open');
            });
        });
    });

    // tautan "aktif" (halaman yang sedang dibuka) ditandai
    const halamanSaatIni = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar a').forEach(a => {
        const target = a.getAttribute('href');
        if (target === halamanSaatIni) a.classList.add('nav-active');
    });
}

/* ============================================================
   4. PARALEL RINGAN pada lingkaran dekoratif wrapper
   (hanya di layar besar, supaya HP tidak berat)
   ============================================================ */
function setupParallax() {
    const bubbles = document.querySelectorAll('.bg-animation span');
    if (!bubbles.length) return;

    window.addEventListener('scroll', () => {
        if (window.innerWidth < MOBILE_BREAKPOINT) return;
        const y = window.scrollY;
        bubbles.forEach((b, idx) => {
            const kecepatan = 0.04 + idx * 0.02;
            b.style.translate = `0 ${y * kecepatan}px`;
        });
    }, { passive: true });
}

/* ============================================================
   5. TOMBOL KEMBALI KE ATAS (dibuat otomatis oleh JS)
   ============================================================ */
function setupScrollTopButton() {
    const btn = document.createElement('button');
    btn.className = 'scroll-top-btn';
    btn.setAttribute('aria-label', 'Kembali ke atas');
    btn.textContent = '\u2191'; // panah atas
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', () => {
        btn.classList.toggle('show', window.scrollY > 400);
    }, { passive: true });
}

/* ============================================================
   Jalankan semua setup setelah DOM siap
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    setupMobileNav();
    setupTyping();
    setupScrollReveal();
    setupParallax();
    setupScrollTopButton();
});

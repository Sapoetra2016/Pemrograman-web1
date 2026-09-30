/* ============================================================
   main.js - dipakai di semua halaman (index, about, pendidikan,
   skill, hobi, project)
   Fitur:
   1. Animasi reveal saat di-scroll (fade + geser) pakai IntersectionObserver
   2. Efek ketik-hapus berputar pada peran ("Saya seorang ...") di halaman awal
   3. Hamburger menu otomatis untuk tampilan handphone (collapse/expand)
   4. Gerak paralel ringan pada lingkaran dekoratif background
   5. Animasi baris tabel muncul bergiliran (stagger)
   6. Tilt 3D pada kartu menu halaman awal
   7. Tombol kembali ke atas
   8. Tombol toggle light / dark mode (preferensi disimpan di localStorage)
   9. Cincin gradient berputar di foto profil + judul masuk animasi naik
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
    '.experience-table',          // tabel pengalaman kerja
    '.project-card'               // kartu project
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
                entry.target.style.animationDelay = (i * 120) + 'ms';
                // buang pending supaya transform kembali ke normal,
                // efek hover berbasis transform tetap berfungsi
                entry.target.classList.remove('reveal-pending');
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
}

/* ============================================================
   2. EFEK KETIK-HAPUS BERPUTAR pada peran ("Saya seorang ...")
   di <h2> halaman awal. Judul <h1> sekarang statis.
   ============================================================ */
const ROLE_TEKS = ['IT Operation', 'IT Support', 'Customer Support', 'Administrator'];

function setupRoleTyping() {
    const el = document.getElementById('role-text');
    if (!el) return; // hanya jalan di halaman awal

    let peranIdx = 0;
    let hurufIdx = ROLE_TEKS[0].length; // teks pertama sudah tertulis di HTML
    let menghapus = true;               // langsung hapus setelah muncul sejenak

    function langkah() {
        const teks = ROLE_TEKS[peranIdx];

        if (menghapus) {
            hurufIdx--;
            el.textContent = teks.slice(0, hurufIdx);
            if (hurufIdx === 0) {
                menghapus = false;
                peranIdx = (peranIdx + 1) % ROLE_TEKS.length;
                setTimeout(langkah, 400); // jeda sebelum ganti peran baru
                return;
            }
            setTimeout(langkah, 35); // kecepatan hapus per huruf
        } else {
            hurufIdx++;
            el.textContent = ROLE_TEKS[peranIdx].slice(0, hurufIdx);
            if (hurufIdx === ROLE_TEKS[peranIdx].length) {
                menghapus = true;
                setTimeout(langkah, 1800); // teks utuh tertahan sebelum dihapus
                return;
            }
            setTimeout(langkah, 70); // kecepatan ketik per huruf
        }
    }

    setTimeout(langkah, 1200); // mulai animasi setelah halaman termuat
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
   5. ANIMASI BARIS TABEL (stagger)
   Saat sebuah tabel masuk layar, baris-barisnya muncul
   bergiliran dari kiri supaya tampilan lebih hidup.
   ============================================================ */
function setupTableRows() {
    const tables = document.querySelectorAll('.skill-table, .experience-table');
    if (!tables.length) return;

    // sembunyikan semua baris tbody dulu
    tables.forEach(table => {
        table.querySelectorAll('tbody tr').forEach(tr => {
            tr.classList.add('table-row-pending');
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const rows = entry.target.querySelectorAll('tbody tr');
            rows.forEach((tr, idx) => {
                setTimeout(() => {
                    tr.classList.remove('table-row-pending');
                    tr.classList.add('table-row-revealed');
                }, idx * 90); // jeda antar baris
            });
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.2 });

    tables.forEach(table => observer.observe(table));
}

/* ============================================================
   6. TILT 3D pada kartu menu halaman awal
   Kartu miring sedikit mengikuti posisi kursor (layar besar saja)
   ============================================================ */
function setupCardTilt() {
    // hormati pengguna yang tidak suka animasi
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = document.querySelectorAll('.menu');
    if (!cards.length) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (window.innerWidth < MOBILE_BREAKPOINT) return;
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;  // -0.5 s/d 0.5
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform =
                `perspective(700px) rotateX(${(-y * 8).toFixed(2)}deg)` +
                ` rotateY(${(x * 8).toFixed(2)}deg)` +
                ` translateY(-10px) scale(1.03)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = ''; // kembalikan ke CSS hover normal
        });
    });
}

/* ============================================================
   7. TOMBOL KEMBALI KE ATAS (dibuat otomatis oleh JS)
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
   8. TOMBOL TOGGLE LIGHT / DARK MODE
   Tombol dibuat otomatis oleh JS lalu dipasang di pojok kanan
   atas pada semua halaman. Tema aktif disimpan di localStorage
   supaya tetap sama saat pindah halaman / reload. Class
   .theme-fade sengaja tidak dipakai oleh reveal-pending agar
   transisi warna tidak bertabrakan dengan animasi scroll.
   ============================================================ */
const THEME_KEY = 'tema';

function terapkanTema(tema) {
    const root = document.documentElement;
    root.setAttribute('data-theme', tema);
    root.setAttribute('data-bs-theme', tema); // Bootstrap ikut menyesuaikan
    try { localStorage.setItem(THEME_KEY, tema); } catch (e) { /* storage mati */ }
}

function setupThemeToggle() {
    const btn = document.createElement('button');
    btn.className = 'theme-btn';
    btn.type = 'button';
    document.body.appendChild(btn);

    const icon = document.createElement('span');
    icon.className = 'theme-icon';
    btn.appendChild(icon);

    function perbaruiTampilan() {
        const gelap = document.documentElement.getAttribute('data-theme') === 'dark';
        // bulan sabit saat terang, matahari saat gelap
        icon.className = 'theme-icon ' + (gelap ? 'icon-sun' : 'icon-moon');
        btn.setAttribute('aria-label',
            gelap ? 'Beralih ke mode terang' : 'Beralih ke mode gelap');
        btn.title = btn.getAttribute('aria-label');
    }

    btn.addEventListener('click', () => {
        const saatIni = document.documentElement.getAttribute('data-theme') || 'light';
        terapkanTema(saatIni === 'dark' ? 'light' : 'dark');
        perbaruiTampilan();
    });

    perbaruiTampilan();
}

/* ============================================================
   9. CINCIN GRADIENT FOTO PROFIL
   Lingkaran gradient berputar mengelilingi foto di halaman awal,
   dibuat oleh JS supaya HTML-nya tetap bersih
   ============================================================ */
function setupAvatarRing() {
    const hero = document.querySelector('.wrapper > .container');
    if (!hero || !hero.querySelector('img')) return;
    const ring = document.createElement('span');
    ring.className = 'avatar-ring';
    ring.setAttribute('aria-hidden', 'true');
    hero.appendChild(ring);
}

/* ============================================================
   10. JUDUL MASUK ANIMASI (halaman dalam)
   h1/h2/h3 di dalam content-box naik lembut saat pertama
   terlihat, beda dari animasi reveal kartu yang sudah ada
   ============================================================ */
function setupHeadingEntrance() {
    const headings = document.querySelectorAll(
        '.content-box h1, .content-box h2, .content-box h3, .project-info h3');
    if (!headings.length) return;

    headings.forEach(el => el.classList.add('heading-pending'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('heading-pending');
                entry.target.classList.add('heading-revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    headings.forEach(el => observer.observe(el));
}

/* ============================================================
   11. TAHUN FOOTER OTOMATIS
   Angka tahun di dalam <footer> diganti tahun berjalan,
   supaya hak cipta tidak terlihat basi saat berganti tahun
   ============================================================ */
function setupFooterYear() {
    const tahun = new Date().getFullYear();
    document.querySelectorAll('footer p').forEach(p => {
        p.innerHTML = p.innerHTML.replace(/©\s*\d{4}/, '\u00a9 ' + tahun);
    });
}

/* ============================================================
   Jalankan semua setup setelah DOM siap
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // pasang transisi warna lebih dulu, sebelum elemen lain hidden animasi reveal
    document.body.classList.add('theme-fade');
    setupThemeToggle();
    setupMobileNav();
    setupRoleTyping();
    setupScrollReveal();
    setupTableRows();
    setupCardTilt();
    setupParallax();
    setupScrollTopButton();
    setupAvatarRing();
    setupHeadingEntrance();
    setupFooterYear();
});

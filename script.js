/**
 * Portfolio — Interactivity Layer
 * Handles: animated background, scroll reveal, card glow, nav state
 * GitHub Pages compatible: no external deps, all relative paths.
 */

(function () {
    'use strict';

    // ─────────────────────────────────────────────────────────────
    // 1. BACKGROUND CANVAS — floating particle field
    // ─────────────────────────────────────────────────────────────
    const canvas = document.getElementById('bg-canvas');
    const ctx    = canvas.getContext('2d');

    const PARTICLE_COUNT = 120;
    const ACCENT = { r: 0, g: 255, b: 204 };

    let W, H, particles = [];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function createParticle() {
        return {
            x:     rand(0, W),
            y:     rand(0, H),
            r:     rand(0.8, 2.8),
            vx:    rand(-0.22, 0.22),
            vy:    rand(-0.18, 0.18),
            alpha: rand(0.06, 0.30),
            // slow pulse
            pulse: rand(0, Math.PI * 2),
            pulseSpeed: rand(0.004, 0.014),
        };
    }

    function initParticles() {
        particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
    }

    function drawParticle(p) {
        const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${a})`;
        ctx.fill();
    }

    // Draw soft lines between close particles
    function drawConnections() {
        const maxDist = 220;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i], b = particles[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxDist) {
                    const alpha = (1 - dist / maxDist) * 0.055;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${alpha})`;
                    ctx.lineWidth = 0.6;
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }
    }

    function tick() {
        ctx.clearRect(0, 0, W, H);

        drawConnections();

        particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.pulse += p.pulseSpeed;

            // Wrap at edges
            if (p.x < -10) p.x = W + 10;
            if (p.x > W + 10) p.x = -10;
            if (p.y < -10) p.y = H + 10;
            if (p.y > H + 10) p.y = -10;

            drawParticle(p);
        });

        requestAnimationFrame(tick);
    }

    resize();
    initParticles();
    tick();
    window.addEventListener('resize', () => { resize(); }, { passive: true });


    // ─────────────────────────────────────────────────────────────
    // 2. SCROLL REVEAL via IntersectionObserver
    // ─────────────────────────────────────────────────────────────
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px 0px -60px 0px', threshold: 0.08 });

    document.querySelectorAll('.card, .section-header').forEach((el) => {
        revealObserver.observe(el);
    });


    // ─────────────────────────────────────────────────────────────
    // 3. CARD GLOW — cursor position tracking
    // ─────────────────────────────────────────────────────────────
    document.querySelectorAll('.card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
            card.style.setProperty('--mouse-y', (e.clientY - rect.top)  + 'px');
        });
    });


    // ─────────────────────────────────────────────────────────────
    // 4. NAV SCROLL STATE
    // ─────────────────────────────────────────────────────────────
    const nav = document.getElementById('site-nav');

    function handleNavScroll() {
        nav.style.borderBottomColor = window.scrollY > 10
            ? 'rgba(42,42,42,0.6)'
            : 'var(--border-dim)';
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();


    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });


    // ─────────────────────────────────────────────────────────────
    // 6. ACTIVE NAV SECTION — highlight category link on scroll
    // ─────────────────────────────────────────────────────────────
    const sectionLinks = document.querySelectorAll('.nav-section-link');
    const sectionIds = ['section-consumer-ai','section-enterprise-ai','section-systems-architecture','section-micro-products'];

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const id = entry.target.id;
            const link = document.querySelector(`.nav-section-link[href="#${id}"]`);
            if (!link) return;
            if (entry.isIntersecting) {
                sectionLinks.forEach(l => l.classList.remove('is-active'));
                link.classList.add('is-active');
            }
        });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

    sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) sectionObserver.observe(el);
    });



})();

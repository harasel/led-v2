/**
 * ============================================
 * LED SOLUTIONS — Landing Page JavaScript
 * Commercial LED Lighting Lead Generation
 * Vanilla JS — Zero Dependencies
 * ============================================
 */
(function () {
    'use strict';

    /* =====================
       CONFIG
       ===================== */

    /**
     * FORM ENDPOINT
     * -----------------------------------------------
     * Replace this empty string with your production
     * form submission URL before going live.
     *
     * Examples:
     *   'https://hooks.zapier.com/hooks/catch/xxxxx'
     *   'https://formspree.io/f/xxxxx'
     *   'https://your-api.com/api/leads'
     *   'https://api.hubapi.com/...'
     * -----------------------------------------------
     */
    const FORM_ENDPOINT = '';

    /**
     * TRANSPORT
     * -----------------------------------------------
     * 'json'     — posts application/json. Fastest, but
     *              file attachments CANNOT be included.
     * 'formdata' — posts multipart/form-data, which DOES
     *              carry the uploaded files. Required for
     *              Formspree, Web3Forms, Netlify Forms and
     *              most PHP/Node handlers that accept files.
     * -----------------------------------------------
     */
    const FORM_TRANSPORT = 'formdata';

    /* Minimum seconds a plausible human submission takes. Kept low so a
       returning visitor using browser autofill is never rejected; the
       honeypot above is the primary bot defence. */
    const MIN_FILL_SECONDS = 2;

    /* Reject attachments larger than this (per file). */
    const MAX_FILE_MB = 10;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* =====================
       ANALYTICS HELPER
       ===================== */
    function track(name, params) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: name, ...params });
    }

    /* =====================
       STICKY HEADER
       ===================== */
    function initHeader() {
        const h = document.getElementById('site-header');
        if (!h) return;
        const check = () => h.classList.toggle('scrolled', window.scrollY > 60);
        window.addEventListener('scroll', check, { passive: true });
        check();
    }

    /* =====================
       MOBILE MENU
       ===================== */
    function initMobileMenu() {
        const btn = document.getElementById('mobile-toggle');
        const nav = document.getElementById('mobile-nav');
        if (!btn || !nav) return;

        function toggle(open) {
            const isOpen = typeof open === 'boolean' ? open : !nav.classList.contains('open');
            nav.classList.toggle('open', isOpen);
            nav.setAttribute('aria-hidden', String(!isOpen));
            btn.classList.toggle('active', isOpen);
            btn.setAttribute('aria-expanded', String(isOpen));
            btn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
            document.body.style.overflow = isOpen ? 'hidden' : '';
        }

        btn.addEventListener('click', () => toggle());
        nav.querySelectorAll('.mobile-link, .mobile-cta').forEach(l =>
            l.addEventListener('click', () => toggle(false))
        );

        /* Escape closes the menu and returns focus to the trigger */
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                toggle(false);
                btn.focus();
            }
        });

        /* Clicking the backdrop (not a link) closes it */
        nav.addEventListener('click', e => {
            if (e.target === nav) toggle(false);
        });

        /* Never leave the body scroll-locked after rotating to desktop */
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024 && nav.classList.contains('open')) toggle(false);
        }, { passive: true });
    }

    /* =====================
       SMOOTH SCROLL
       ===================== */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', function (e) {
                const id = this.getAttribute('href');
                if (id === '#') return;
                const el = document.querySelector(id);
                if (!el) return;
                e.preventDefault();
                const offset = (document.getElementById('site-header')?.offsetHeight || 0) + 20;
                window.scrollTo({
                    top: el.getBoundingClientRect().top + window.scrollY - offset,
                    behavior: reducedMotion ? 'auto' : 'smooth'
                });
            });
        });
    }

    /* =====================
       CTA TRACKING
       ===================== */
    function initCTATracking() {
        document.querySelectorAll('[data-cta]').forEach(el => {
            el.addEventListener('click', function () {
                track('cta_click', {
                    cta_location: this.dataset.cta,
                    cta_text: this.textContent.trim().substring(0, 80)
                });
            });
        });
    }

    /* =====================
       SCROLL REVEAL
       ===================== */
    function initReveal() {
        const els = document.querySelectorAll('.anim-up');
        /* Without IO support (or with reduced motion) show everything
           immediately — content must never be trapped at opacity:0. */
        if (reducedMotion || !('IntersectionObserver' in window)) {
            els.forEach(e => e.classList.add('vis'));
            return;
        }

        const io = new IntersectionObserver((entries) => {
            entries.forEach(en => {
                if (en.isIntersecting) {
                    const d = parseInt(en.target.dataset.delay) || 0;
                    setTimeout(() => en.target.classList.add('vis'), d);
                    io.unobserve(en.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        els.forEach(e => io.observe(e));
    }

    /* =====================
       COUNT-UP
       ===================== */
    function initCountUp() {
        const nums = document.querySelectorAll('[data-count]');
        if (reducedMotion) {
            nums.forEach(el => {
                const t = parseFloat(el.dataset.count);
                el.textContent = fmt(t, el.dataset.decimal);
            });
            return;
        }

        if (!('IntersectionObserver' in window)) {
            nums.forEach(el => { el.textContent = fmt(parseFloat(el.dataset.count), el.dataset.decimal); });
            return;
        }

        const io = new IntersectionObserver(entries => {
            entries.forEach(en => {
                if (en.isIntersecting) { countUp(en.target); io.unobserve(en.target); }
            });
        }, { threshold: 0.3 });
        nums.forEach(e => io.observe(e));
    }

    function countUp(el) {
        const target = parseFloat(el.dataset.count);
        const dec = el.dataset.decimal;
        const dur = 2200;
        const start = performance.now();
        (function step(now) {
            const p = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = fmt(ease * target, dec);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = fmt(target, dec);
        })(start);
    }

    function fmt(n, dec) {
        if (dec) return n.toFixed(1);
        return n >= 1000 ? Math.round(n).toLocaleString('en-AU') : String(Math.round(n));
    }

    /* =====================
       BEFORE/AFTER SLIDER
       -----------------------------------------
       Uses a single CSS custom property (--ba-pos)
       for both the clip-path reveal and the handle
       position, so they can never drift apart.
       Pointer Events + pointer capture gives one
       code path for mouse, touch and pen, and
       `touch-action:none` stops the page scrolling
       while the user drags on a phone.
       ===================== */
    function initBA() {
        const slider = document.getElementById('ba-slider');
        const handle = document.getElementById('ba-handle');
        if (!slider || !handle) return;

        const MIN = 0;
        const MAX = 100;
        let value = 50;
        let dragging = false;
        let frame = null;
        let queuedX = null;
        let touched = false;

        const clamp = v => Math.min(MAX, Math.max(MIN, v));

        function apply(pct, smooth) {
            value = clamp(pct);
            slider.classList.toggle('is-smooth', !!smooth && !reducedMotion);
            slider.style.setProperty('--ba-pos', value.toFixed(2) + '%');
            const rounded = Math.round(value);
            handle.setAttribute('aria-valuenow', rounded);
            handle.setAttribute('aria-valuetext', rounded + ' percent of the before image shown');
        }

        function markTouched() {
            if (touched) return;
            touched = true;
            slider.classList.add('is-touched');
        }

        function fromClientX(x) {
            const r = slider.getBoundingClientRect();
            if (!r.width) return;
            apply(((x - r.left) / r.width) * 100, false);
        }

        /* rAF-throttled so a fast drag never queues up layout work */
        function schedule(x) {
            queuedX = x;
            if (frame !== null) return;
            frame = requestAnimationFrame(() => {
                frame = null;
                fromClientX(queuedX);
            });
        }

        function endDrag(e) {
            if (!dragging) return;
            dragging = false;
            slider.classList.remove('is-dragging');
            if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
            /* Flush the last queued position only if the pointer actually
               moved — otherwise a plain click would snap the reveal to 0. */
            if (queuedX !== null) fromClientX(queuedX);
            queuedX = null;
            if (e && e.pointerId !== undefined) {
                try { slider.releasePointerCapture(e.pointerId); } catch (_) { /* already released */ }
            }
        }

        slider.addEventListener('pointerdown', e => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            e.preventDefault();
            markTouched();
            dragging = true;
            queuedX = null;
            slider.classList.add('is-dragging');
            slider.classList.remove('is-smooth');
            try { slider.setPointerCapture(e.pointerId); } catch (_) { /* unsupported */ }
            fromClientX(e.clientX);
            handle.focus({ preventScroll: true });
        });

        slider.addEventListener('pointermove', e => {
            if (!dragging) return;
            e.preventDefault();
            schedule(e.clientX);
        });

        slider.addEventListener('pointerup', endDrag);
        slider.addEventListener('pointercancel', endDrag);
        slider.addEventListener('lostpointercapture', endDrag);
        window.addEventListener('blur', () => endDrag());

        /* Double-click / double-tap resets to centre */
        slider.addEventListener('dblclick', e => { e.preventDefault(); apply(50, true); });

        handle.addEventListener('keydown', e => {
            const big = e.shiftKey ? 10 : 2;
            let next = value;
            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowDown':  next = value - big; break;
                case 'ArrowRight':
                case 'ArrowUp':    next = value + big; break;
                case 'PageDown':   next = value - 10;  break;
                case 'PageUp':     next = value + 10;  break;
                case 'Home':       next = MIN;         break;
                case 'End':        next = MAX;         break;
                default: return;
            }
            e.preventDefault();
            markTouched();
            apply(next, true);
        });

        /* Keep the reveal correct if the viewport (and therefore the
           slider width) changes — percentages are resolution-independent,
           but this also re-syncs after an orientation change. */
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => apply(value, false), 120);
        }, { passive: true });

        apply(50, false);

        /* One-time affordance sweep when the section first scrolls into
           view, so the control reads as interactive. Skipped entirely for
           reduced-motion users and cancelled the moment they interact. */
        if (!reducedMotion && 'IntersectionObserver' in window) {
            const io = new IntersectionObserver(entries => {
                entries.forEach(en => {
                    if (!en.isIntersecting) return;
                    io.disconnect();
                    setTimeout(() => {
                        if (touched) return;
                        apply(68, true);
                        setTimeout(() => { if (!touched) apply(50, true); }, 750);
                    }, 400);
                });
            }, { threshold: 0.35 });
            io.observe(slider);
        }
    }

    /* =====================
       SAVINGS BARS
       ===================== */
    function initSavBars() {
        const fills = document.querySelectorAll('.sav-fill');
        if (reducedMotion || !('IntersectionObserver' in window)) {
            fills.forEach(f => { f.style.width = f.dataset.width + '%'; });
            return;
        }

        const io = new IntersectionObserver(entries => {
            entries.forEach(en => {
                if (en.isIntersecting) {
                    setTimeout(() => { en.target.style.width = en.target.dataset.width + '%'; }, 250);
                    io.unobserve(en.target);
                }
            });
        }, { threshold: 0.4 });
        fills.forEach(f => io.observe(f));
    }

    /* =====================
       MOBILE STICKY CTA
       ===================== */
    function initSticky() {
        const el = document.getElementById('sticky-cta');
        const hero = document.getElementById('hero');
        const form = document.getElementById('lead-form');
        if (!el) return;

        function check() {
            const past = window.scrollY > (hero ? hero.offsetTop + hero.offsetHeight - 200 : 500);
            let inForm = false;
            if (form) {
                const r = form.getBoundingClientRect();
                inForm = r.top < window.innerHeight && r.bottom > 0;
            }
            const show = past && !inForm;
            el.classList.toggle('show', show);
            el.setAttribute('aria-hidden', String(!show));
        }

        window.addEventListener('scroll', check, { passive: true });
        window.addEventListener('resize', check, { passive: true });
        check();
    }

    /* =====================
       FILE UPLOAD
       ===================== */
    function initFile() {
        const inp = document.getElementById('f-files');
        const names = document.getElementById('file-names');
        if (!inp || !names) return;

        inp.addEventListener('change', function () {
            const files = Array.from(this.files || []);
            const tooBig = files.filter(f => f.size > MAX_FILE_MB * 1024 * 1024);

            if (tooBig.length) {
                names.textContent = 'Each file must be under ' + MAX_FILE_MB + 'MB. Please remove: ' +
                    tooBig.map(f => f.name).join(', ');
                names.classList.add('is-invalid');
                this.value = '';
                return;
            }

            names.classList.remove('is-invalid');
            names.textContent = files.length
                ? files.length + (files.length === 1 ? ' file attached: ' : ' files attached: ') +
                  files.map(f => f.name).join(', ')
                : '';
        });
    }

    /* =====================
       FORM
       ===================== */
    function initForm() {
        const form = document.getElementById('enquiry-form');
        if (!form) return;

        const btn = document.getElementById('form-submit');
        const ok = document.getElementById('form-success');
        const errBox = document.getElementById('form-error-msg');
        const loadedAt = Date.now();

        wireFieldIds(form);

        /* Clear a field's error as soon as the user starts correcting it */
        form.addEventListener('input', e => {
            if (e.target.classList && e.target.classList.contains('has-error')) clearField(e.target);
        });

        let started = false;
        form.addEventListener('focusin', () => {
            if (!started) { started = true; track('form_start'); }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErr(form);

            /* --- Spam guards: honeypot + minimum fill time --- */
            const trap = form.querySelector('[name="_company_website"]');
            if (trap && trap.value) { showSuccess(); return; }
            if ((Date.now() - loadedAt) / 1000 < MIN_FILL_SECONDS) { showSuccess(); return; }

            if (!validate(form)) return;

            setLoading(true);
            hide(errBox);

            try {
                await send(form);
                showSuccess();
                track('generate_lead', { form_location: 'main_form' });
            } catch (err) {
                console.error('[LED Solutions — form submission failed]', err);
                show(errBox);
                errBox && errBox.focus && errBox.focus({ preventScroll: true });
                track('form_error', { message: String(err && err.message || err) });
            } finally {
                setLoading(false);
            }
        });

        async function send(f) {
            if (!FORM_ENDPOINT) {
                /* DEV MODE — no endpoint configured yet. Logs the payload
                   so you can verify field names before going live. */
                console.log('[LED Solutions — form data (dev mode)]',
                    Object.fromEntries(new FormData(f).entries()));
                await new Promise(r => setTimeout(r, 1200));
                return;
            }

            let res;
            if (FORM_TRANSPORT === 'formdata') {
                const fd = new FormData(f);
                fd.delete('_company_website');
                res = await fetch(FORM_ENDPOINT, {
                    method: 'POST',
                    headers: { Accept: 'application/json' },
                    body: fd
                });
            } else {
                const data = Object.fromEntries(new FormData(f).entries());
                delete data.files;
                delete data._company_website;
                res = await fetch(FORM_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify(data)
                });
            }

            if (!res.ok) throw new Error('Endpoint responded with ' + res.status);
        }

        function setLoading(on) {
            if (!btn) return;
            btn.classList.toggle('is-loading', on);
            btn.disabled = on;
            btn.setAttribute('aria-busy', String(on));
        }

        function showSuccess() {
            form.hidden = true;
            show(ok);
            if (ok) {
                ok.setAttribute('tabindex', '-1');
                ok.focus({ preventScroll: true });
            }
        }
    }

    function show(el) {
        if (!el) return;
        el.classList.add('show');
        el.setAttribute('aria-hidden', 'false');
    }

    function hide(el) {
        if (!el) return;
        el.classList.remove('show');
        el.setAttribute('aria-hidden', 'true');
    }

    /* Link every input to its error message so screen readers announce it */
    function wireFieldIds(form) {
        form.querySelectorAll('.form-group').forEach(group => {
            const field = group.querySelector('input, textarea, select');
            const msg = group.querySelector('.f-error');
            if (!field || !msg || !field.id) return;
            msg.id = field.id + '-error';
        });
    }

    /* =====================
       VALIDATION
       ===================== */
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function validate(form) {
        const checks = [
            ['f-name', v => v.length >= 2, 'Please enter your full name.'],
            ['f-company', v => v.length >= 2, 'Please enter your company or property name.'],
            ['f-email', v => EMAIL_RE.test(v), 'Please enter a valid email address.'],
            ['f-phone', v => validPhone(v), 'Please enter a valid contact phone number.']
        ];

        let firstBad = null;

        checks.forEach(([id, test, msg]) => {
            const el = form.querySelector('#' + id);
            if (!el) return;
            const value = el.value.trim();
            const empty = !value;
            if (empty || !test(value)) {
                err(el, empty ? emptyMessage(id) : msg);
                if (!firstBad) firstBad = el;
            }
        });

        if (firstBad) {
            firstBad.focus({ preventScroll: true });
            firstBad.scrollIntoView({
                block: 'center',
                behavior: reducedMotion ? 'auto' : 'smooth'
            });
            return false;
        }
        return true;
    }

    function emptyMessage(id) {
        return {
            'f-name': 'Please enter your full name.',
            'f-company': 'Please enter your company or property name.',
            'f-email': 'Please enter your email address.',
            'f-phone': 'Please enter your phone number.'
        }[id] || 'This field is required.';
    }

    /* Accepts Australian mobile/landline formats plus +61 international,
       ignoring spaces, dashes, dots and brackets. */
    function validPhone(v) {
        const digits = v.replace(/[\s\-().]/g, '');
        return /^(\+?61|0)[2-9]\d{8}$/.test(digits) || /^\+?\d{8,15}$/.test(digits);
    }

    function err(el, msg) {
        el.classList.add('has-error');
        el.setAttribute('aria-invalid', 'true');
        const box = el.closest('.form-group');
        const e = box && box.querySelector('.f-error');
        if (e) {
            e.textContent = msg;
            e.setAttribute('role', 'alert');
            if (e.id) el.setAttribute('aria-describedby', e.id);
        }
    }

    function clearField(el) {
        el.classList.remove('has-error');
        el.removeAttribute('aria-invalid');
        el.removeAttribute('aria-describedby');
        const box = el.closest('.form-group');
        const e = box && box.querySelector('.f-error');
        if (e) { e.textContent = ''; e.removeAttribute('role'); }
    }

    function clearErr(form) {
        form.querySelectorAll('.has-error').forEach(clearField);
    }

    /* =====================
       IMAGE FALLBACK
       -----------------------------------------
       All imagery is currently hot-linked from a
       third party. If a request is blocked or the
       host rate-limits, hide the broken icon and
       let the layer's gradient background show
       instead of a shattered-image placeholder.
       ===================== */
    function initImages() {
        document.querySelectorAll('img').forEach(img => {
            const fail = () => img.setAttribute('data-failed', '');
            if (img.complete && img.naturalWidth === 0 && img.currentSrc) fail();
            img.addEventListener('error', fail, { once: true });
        });
    }

    /* =====================
       FOOTER YEAR
       ===================== */
    function initYear() {
        const el = document.getElementById('footer-year');
        if (el) el.textContent = new Date().getFullYear();
    }

    /* =====================
       INIT
       ===================== */
    function init() {
        initHeader();
        initMobileMenu();
        initSmoothScroll();
        initCTATracking();
        initReveal();
        initCountUp();
        initBA();
        initSavBars();
        initSticky();
        initFile();
        initForm();
        initImages();
        initYear();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
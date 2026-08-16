(function () {
  const SITE = window.SITE || {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  const $ = (sel) => document.querySelector(sel);

  document.documentElement.classList.add('has-js');

  document.getElementById('year').textContent = new Date().getFullYear();

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  /* =====================================================================
     CONTENT RENDERING
  ===================================================================== */
  function renderSkills() {
    const el = document.getElementById('skill-tags');
    if (!el) return;
    (SITE.skills || []).forEach((s) => {
      const item = document.createElement('span');
      item.className = 'skill-item';
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = s;
      item.appendChild(tag);
      el.appendChild(item);
    });
    [...el.children].forEach((item, i) => item.style.setProperty('--i', i));
  }

  function renderFeatured() {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;
    (SITE.featured || []).forEach((p) => {
      const a = document.createElement('a');
      a.className = 'featured-card';
      a.href = p.href;
      a.target = '_blank';
      a.rel = 'noopener';
      a.innerHTML = `
        <img src="${p.cover}" alt="${p.title} project cover" loading="lazy" />
        <div class="featured-body">
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          <div class="project-tags">${(p.tags || []).map((t) => `<span class="tag tag-small">${t}</span>`).join('')}</div>
        </div>`;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(p);
      });
      grid.appendChild(a);
    });
  }

  function renderProjects(filter) {
    const grid = document.getElementById('project-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const list = (SITE.projects || []).filter((p) => !filter || (p.tags || []).includes(filter));
    if (list.length === 0) {
      grid.innerHTML = '<p class="filter-empty">No projects match that tag yet.</p>';
      return;
    }
    list.forEach((p) => {
      const art = document.createElement('article');
      art.className = 'project-card';
      art.innerHTML = `
        <h3><a class="project-link" href="${p.href}" target="_blank" rel="noopener">${p.title}</a></h3>
        <p>${p.desc}</p>
        <div class="project-tags">${(p.tags || []).map((t) => `<span class="tag tag-small">${t}</span>`).join('')}</div>`;
      art.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(p);
      });
      grid.appendChild(art);
    });
    observeReveals();
    applyTilt();
  }

  function buildFilter() {
    const bar = document.getElementById('filter-bar');
    if (!bar) return;
    const tags = [...new Set((SITE.projects || []).flatMap((p) => p.tags || []))].sort();
    const make = (label, value) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'filter-btn';
      b.textContent = label;
      b.dataset.filter = value || '';
      if (!value) b.classList.add('is-active');
      b.addEventListener('click', () => {
        bar.querySelectorAll('.filter-btn').forEach((x) => x.classList.remove('is-active'));
        b.classList.add('is-active');
        renderProjects(value);
      });
      bar.appendChild(b);
    };
    make('All', '');
    tags.forEach((t) => make(t, t));
  }

  function renderContactLinks() {
    const el = document.getElementById('contact-links');
    if (!el) return;
    (SITE.contact?.links || []).forEach((l) => {
      const a = document.createElement('a');
      a.className = 'contact-link';
      a.href = l.href;
      a.textContent = l.label;
      a.rel = 'noopener';
      if (/^https?:/.test(l.href)) a.target = '_blank';
      el.appendChild(a);
    });
  }

  renderSkills();
  renderFeatured();
  buildFilter();
  renderProjects('');
  renderContactLinks();

  /* =====================================================================
     SMOOTH SCROLL (LENIS) + SCROLL PROGRESS + WIND
  ===================================================================== */
  window.__scrollVel = 0;

  let lenis = null;
  if (!reducedMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    lenis.on('scroll', (e) => {
      window.__scrollVel = Math.abs(e.velocity);
      updateProgress(e.scroll);
    });

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (ev) => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        ev.preventDefault();
        lenis.scrollTo(target, { offset: -64 });
      });
    });
  }

  function updateProgress(scrollY) {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    document.getElementById('scroll-progress').style.width = max > 0 ? `${(scrollY / max) * 100}%` : '0%';
  }

  window.addEventListener('scroll', () => {
    if (!lenis) updateProgress(window.scrollY);
  }, { passive: true });

  if (!reducedMotion) {
    setInterval(() => {
      window.__scrollVel *= 0.82;
    }, 120);
  }

  /* =====================================================================
     CUSTOM CURSOR GLOW
  ===================================================================== */
  if (!reducedMotion && !coarsePointer) {
    const glow = document.getElementById('cursor-glow');
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let tx = cx;
    let ty = cy;

    window.addEventListener('pointermove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
    });

    const glowRaf = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      glow.style.transform = `translate(${cx - 240}px, ${cy - 240}px)`;
      requestAnimationFrame(glowRaf);
    };
    requestAnimationFrame(glowRaf);
  }

  /* =====================================================================
     INTRO LOAD ANIMATION
  ===================================================================== */
  function dismissIntro() {
    const overlay = document.getElementById('intro-overlay');
    if (!overlay || overlay.classList.contains('is-done')) return;
    overlay.classList.add('is-done');
    setTimeout(() => overlay.remove(), 1300);
  }
  window.addEventListener('load', () => setTimeout(dismissIntro, 250));
  setTimeout(dismissIntro, 1800);

  /* =====================================================================
     CARD REVEAL ON SCROLL
  ===================================================================== */
  function observeReveals() {
    document
      .querySelectorAll('.featured-card:not(.is-in), .project-card:not(.is-in)')
      .forEach((card) => revealObserver.observe(card));
  }
  observeReveals();

  /* =====================================================================
     3D TILT + PETAL BURST ON HOVER
  ===================================================================== */
  function petalBurst(x, y) {
    window.dispatchEvent(new CustomEvent('petal-burst', { detail: { x, y } }));
  }

  function applyTilt() {
    if (reducedMotion || coarsePointer) return;
    document.querySelectorAll('.featured-card, .project-card').forEach((card) => {
      if (card.dataset.tiltReady) return;
      card.dataset.tiltReady = '1';
      let lastBurst = 0;
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * 11;
        const ry = (px - 0.5) * 11;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        const now = performance.now();
        if (now - lastBurst > 350) {
          lastBurst = now;
          petalBurst(e.clientX, e.clientY);
        }
      });
      card.addEventListener('pointerenter', (e) => petalBurst(e.clientX, e.clientY));
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }
  applyTilt();

  /* =====================================================================
     SKILL RINGS
  ===================================================================== */
  const skillTags = document.getElementById('skill-tags');
  if (skillTags) {
    const skillObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            skillTags.classList.add('is-visible');
            skillObserver.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    skillObserver.observe(skillTags);
  }

  /* =====================================================================
     SECTION REVEAL ON SCROLL
  ===================================================================== */
  const revealEls = document.querySelectorAll('.section-title, .sub-title, .contact-note, .filter-bar');
  revealEls.forEach((el) => el.classList.add('reveal'));
  const sectionRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          sectionRevealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => sectionRevealObserver.observe(el));

  /* =====================================================================
     SCROLLSPY (active nav link)
  ===================================================================== */
  const navLinkMap = {};
  document.querySelectorAll('#nav-links a').forEach((a) => {
    const id = a.getAttribute('href');
    if (id && id.startsWith('#') && id.length > 1) navLinkMap[id.slice(1)] = a;
  });
  const spyTargets = ['skills', 'projects', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          Object.values(navLinkMap).forEach((l) => l.classList.remove('is-active'));
          const link = navLinkMap[entry.target.id];
          if (link) link.classList.add('is-active');
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  spyTargets.forEach((t) => spyObserver.observe(t));

  /* =====================================================================
     BACK TO TOP + STICKY CTA
  ===================================================================== */
  const toTop = document.getElementById('to-top');
  const ctaFloat = document.getElementById('cta-float');
  function onScrollUI() {
    const y = window.scrollY;
    const show = y > 600;
    toTop?.classList.toggle('is-visible', show);
    const m = document.getElementById('project-modal');
    ctaFloat?.classList.toggle('is-visible', show && (!m || !m.classList.contains('is-open')));
  }
  window.addEventListener('scroll', onScrollUI, { passive: true });
  onScrollUI();
  toTop?.addEventListener('click', () => {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* =====================================================================
     MAGNETIC PRIMARY BUTTONS
  ===================================================================== */
  function applyMagnetic() {
    if (reducedMotion || coarsePointer) return;
    document.querySelectorAll('.btn-primary').forEach((btn) => {
      if (btn.closest('.modal')) return;
      btn.classList.add('magnetic');
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${mx * 0.22}px, ${my * 0.32}px)`;
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
      });
    });
  }
  applyMagnetic();

  /* =====================================================================
     PROJECT MODAL
  ===================================================================== */
  const modal = document.getElementById('project-modal');
  const modalCover = document.getElementById('modal-cover');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalTags = document.getElementById('modal-tags');
  const modalLink = document.getElementById('modal-link');
  const resumeModal = document.getElementById('resume-modal');
  let lastFocused = null;

  function lockScroll() {
    document.body.classList.add('modal-open');
  }
  function unlockScroll() {
    document.body.classList.remove('modal-open');
  }

  function openModal(p) {
    if (!modal) return;
    lastFocused = document.activeElement;
    if (p.cover) {
      modalCover.src = p.cover;
      modalCover.alt = `${p.title} cover`;
      modalCover.style.display = '';
    } else {
      modalCover.style.display = 'none';
    }
    modalTitle.textContent = p.title;
    modalDesc.textContent = p.desc;
    modalTags.innerHTML = (p.tags || []).map((t) => `<span class="tag tag-small">${t}</span>`).join('');
    modalLink.href = p.href || '#';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    lockScroll();
    onScrollUI();
    modal.querySelector('.modal-close')?.focus();
  }

  function openResume() {
    if (!resumeModal) return;
    lastFocused = document.activeElement;
    resumeModal.classList.add('is-open');
    resumeModal.setAttribute('aria-hidden', 'false');
    lockScroll();
    onScrollUI();
    resumeModal.querySelector('.modal-close')?.focus();
  }

  function closeAnyModal() {
    const open = document.querySelector('.modal.is-open');
    if (!open) return;
    open.classList.remove('is-open');
    open.setAttribute('aria-hidden', 'true');
    unlockScroll();
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  document.querySelectorAll('.modal').forEach((m) => {
    m.setAttribute('data-lenis-prevent', '');
    m.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeAnyModal));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAnyModal();
  });

  // Open resume in-page (embedded PDF) instead of navigating away
  document.querySelectorAll('a[href$="resume.pdf"]').forEach((a) => {
    if (a.hasAttribute('download')) return;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      openResume();
    });
  });

  /* =====================================================================
     THEME TOGGLE (light / dark)
  ===================================================================== */
  const html = document.documentElement;
  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    try {
      if (window.setFlowerTheme) window.setFlowerTheme(theme);
    } catch (_) {}
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
  }
  const savedTheme = localStorage.getItem('theme');
  const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  window.__initialTheme = initialTheme;
  applyTheme(initialTheme);
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });

  /* =====================================================================
     MOBILE NAV TOGGLE
  ===================================================================== */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  navToggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks?.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle?.setAttribute('aria-expanded', 'false');
    })
  );

  /* =====================================================================
     CONTACT FORM (resilient: mailto / formspree / supabase)
  ===================================================================== */
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');

  function setStatus(msg, ok) {
    statusEl.textContent = msg;
    statusEl.classList.toggle('is-success', ok === true);
    statusEl.classList.toggle('is-error', ok === false);
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('cf-name').value.trim();
      const email = document.getElementById('cf-email').value.trim();
      const message = document.getElementById('cf-message').value.trim();

      if (!name || !email || !message) {
        setStatus('Please fill in every field.', false);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStatus('That email address doesn’t look right.', false);
        return;
      }

      const mode = SITE.formMode || 'mailto';
      const to = SITE.contact?.email || 'danielosinor123@gmail.com';

      if (mode === 'mailto') {
        const subject = encodeURIComponent(`Portfolio message from ${name}`);
        const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
        setStatus(`Your email app should open with the message ready. If it didn’t, email me directly: ${to}`, true);
        petalBurst(window.innerWidth / 2, form.getBoundingClientRect().top);
        return;
      }

      const submitBtn = form.querySelector('.form-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      setStatus('', null);

      try {
        let res;
        if (mode === 'formspree' && SITE.FORMSPREE_ENDPOINT) {
          res = await fetch(SITE.FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ name, email, message }),
          });
        } else if (mode === 'supabase' && SITE.SUPABASE_ANON_KEY) {
          res = await fetch(`${SITE.SUPABASE_URL}/rest/v1/${SITE.SUPABASE_TABLE}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: SITE.SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SITE.SUPABASE_ANON_KEY}`,
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({ name, email, message }),
          });
        } else {
          throw new Error('not-configured');
        }
        if (!res.ok) throw new Error(res.status);
        form.reset();
        setStatus('Message sent — I’ll get back to you soon!', true);
        petalBurst(window.innerWidth / 2, submitBtn.getBoundingClientRect().top);
      } catch {
        setStatus(`Couldn’t send — please email me directly: ${to}`, false);
      } finally {
        const b = form.querySelector('.form-submit');
        b.disabled = false;
        b.textContent = 'Send message';
      }
    });
  }
})();

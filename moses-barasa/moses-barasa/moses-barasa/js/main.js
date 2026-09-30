(function () {
  'use strict';

  /* ── Elements ── */
  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  /* ── Header scroll state ── */
  function onScroll() {
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile navigation ── */
  function openMenu() {
    navToggle.setAttribute('aria-expanded', 'true');
    navMenu.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    navMenu.querySelector('a').focus();
  }
  function closeMenu() {
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('is-open');
    document.body.style.overflow = '';
    navToggle.focus();
  }
  navToggle.addEventListener('click', () => {
    if (navMenu.classList.contains('is-open')) closeMenu(); else openMenu();
  });
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      closeMenu();
    }
  });

  /* ── Smooth scroll for anchors ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Reveal on scroll ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── Lightbox ── */
  const items = Array.from(document.querySelectorAll('[data-index]'));
  const images = items.map(item => {
    const img = item.querySelector('img');
    return {
      src: img ? img.getAttribute('src') : '',
      alt: img ? img.getAttribute('alt') : '',
      el: item
    };
  }).filter(item => item.src);

  let currentIndex = -1;
  let touchStartX = 0;
  let touchEndX = 0;

  function openLightbox(index) {
    if (index < 0 || index >= images.length) return;
    currentIndex = index;
    const item = images[index];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxCaption.textContent = item.alt;
    lightbox.hidden = false;
    // force reflow for transition
    requestAnimationFrame(() => {
      lightbox.classList.add('is-active');
    });
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-active');
    setTimeout(() => {
      lightbox.hidden = true;
      lightboxImg.src = '';
      lightboxImg.alt = '';
      document.body.style.overflow = '';
      if (currentIndex >= 0 && images[currentIndex] && images[currentIndex].el) {
        images[currentIndex].el.focus();
      }
    }, 350);
  }

  function showPrev() {
    const idx = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    openLightbox(idx);
  }
  function showNext() {
    const idx = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    openLightbox(idx);
  }

  items.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(idx);
      }
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', showPrev);
  lightboxNext.addEventListener('click', showNext);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  /* Touch swipe */
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) showNext(); else showPrev();
    }
  }, { passive: true });

  /* Focus trap inside lightbox */
  lightbox.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = lightbox.querySelectorAll('button');
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

})();

/* ═══════════════════════════════════════════════════════════════
   ACHIL PORTFOLIO — Script
   Canvas animation, scroll effects, form handling, custom cursor
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Custom Cursor ──────────────────────────────────────────
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  function initCursor() {
    if (window.innerWidth <= 768) return;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    });

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, input, textarea, .project-card, .skill-category, .stat-card');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
    });

    animateCursorRing();
  }

  function animateCursorRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
    requestAnimationFrame(animateCursorRing);
  }

  // ─── Hero Canvas Animation (Particle Network) ──────────────
  function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = (Math.random() - 0.5) * 0.8;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.hue = Math.random() > 0.5 ? 245 : 190; // purple or cyan
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${this.opacity})`;
        ctx.fill();
      }
    }

    // Create particles based on screen size
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 150);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(108, 99, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    // Central glow effect
    function drawCentralGlow() {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.4;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, 'rgba(108, 99, 255, 0.05)');
      gradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.02)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCentralGlow();

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      drawConnections();
      animationId = requestAnimationFrame(animate);
    }

    animate();

    // Pause when not in viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!animationId) animate();
        } else {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas);
  }

  // ─── Frame Sequence Animation (if frames exist) ─────────────
  function initFrameAnimation() {
    const canvas = document.getElementById('heroCanvas');
    const ctx = canvas.getContext('2d');
    const totalFrames = 120;
    const frames = [];
    let loadedCount = 0;
    let hasFrames = false;

    // Try to load first frame to check if frames exist
    const testImg = new Image();
    testImg.onload = function () {
      hasFrames = true;
      loadAllFrames();
    };
    testImg.onerror = function () {
      // Frames don't exist — particle animation is already running
    };
    testImg.src = 'assets/frames/frame_0001.png';

    function loadAllFrames() {
      for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        const num = String(i).padStart(4, '0');
        img.src = `assets/frames/frame_${num}.png`;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalFrames) startFramePlayback();
        };
        frames[i - 1] = img;
      }
    }

    function startFramePlayback() {
      let currentFrame = 0;

      // Scroll-synced animation
      window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const scrollFraction = scrollTop / maxScroll;
        currentFrame = Math.min(
          totalFrames - 1,
          Math.floor(scrollFraction * totalFrames)
        );
      });

      function renderFrame() {
        if (frames[currentFrame] && frames[currentFrame].complete) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          // Cover-fit the frame
          const img = frames[currentFrame];
          const scale = Math.max(
            canvas.width / img.width,
            canvas.height / img.height
          );
          const w = img.width * scale;
          const h = img.height * scale;
          const x = (canvas.width - w) / 2;
          const y = (canvas.height - h) / 2;
          ctx.drawImage(img, x, y, w, h);
        }
        requestAnimationFrame(renderFrame);
      }

      renderFrame();
    }
  }

  // ─── Navbar ─────────────────────────────────────────────────
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Mobile toggle
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    // Close mobile menu on link click
    links.forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });

    // Active section highlighting
    const sections = document.querySelectorAll('.section');
    const observerOptions = { threshold: 0.3 };
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach((l) => l.classList.remove('active'));
          const activeLink = document.querySelector(`.nav-link[data-section="${id}"]`);
          if (activeLink) activeLink.classList.add('active');
        }
      });
    }, observerOptions);

    sections.forEach((s) => sectionObserver.observe(s));
  }

  // ─── Scroll Reveal ──────────────────────────────────────────
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  // ─── Stat Counter Animation ─────────────────────────────────
  function initStatCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-target'));
            animateCounter(el, target);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => observer.observe(c));
  }

  function animateCounter(el, target) {
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current);
    }, 25);
  }

  // ─── Contact Form ──────────────────────────────────────────
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formResponse = document.getElementById('formResponse');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('formName').value.trim();
      const email = document.getElementById('formEmail').value.trim();
      const message = document.getElementById('formMessage').value.trim();

      // Client-side validation
      if (!name || !email || !message) {
        showFormMessage('Please fill in all fields.', 'error');
        return;
      }

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        showFormMessage('Please enter a valid email address.', 'error');
        return;
      }

      if (message.length < 10) {
        showFormMessage('Message must be at least 10 characters.', 'error');
        return;
      }

      // Loading state
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      try {
        const res = await fetch('/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message })
        });

        const data = await res.json();

        if (data.success) {
          showFormMessage(data.message, 'success');
          form.reset();
        } else {
          showFormMessage(data.error || 'Something went wrong.', 'error');
        }
      } catch (err) {
        showFormMessage('Network error. Please try again later.', 'error');
      } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
    });

    function showFormMessage(msg, type) {
      formResponse.textContent = msg;
      formResponse.className = `form-message ${type}`;
      setTimeout(() => {
        formResponse.className = 'form-message';
      }, 5000);
    }
  }

  // ─── Smooth Scroll for CTA ─────────────────────────────────
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ─── Scroll Indicator Hide ─────────────────────────────────
  function initScrollIndicator() {
    const indicator = document.getElementById('scrollIndicator');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        indicator.style.opacity = '0';
        indicator.style.pointerEvents = 'none';
      } else {
        indicator.style.opacity = '1';
        indicator.style.pointerEvents = 'auto';
      }
    });
  }

  // ─── Init ──────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initHeroCanvas();
    initFrameAnimation();
    initNavbar();
    initScrollReveal();
    initStatCounters();
    initContactForm();
    initSmoothScroll();
    initScrollIndicator();
  });
})();

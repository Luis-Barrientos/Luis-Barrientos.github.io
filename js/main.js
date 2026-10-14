/**
 * Portfolio de Luis Barrientos Pérez · Desarrollador Full Stack Junior
 * JavaScript puro (Vanilla) · Sin dependencias externas
 */

(function () {
  'use strict';

  // ═════════════════════════════════════════════════════════════════════════
  // 1. GESTIÓN DE TEMA (CLARO / OSCURO) CON PERSISTENCIA SEGURA
  // ═════════════════════════════════════════════════════════════════════════
  const themeToggle = document.getElementById('theme-toggle');
  
  function getStoredTheme() {
    try {
      return localStorage.getItem('lb_theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggle) {
      const isLight = theme === 'light';
      themeToggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
      themeToggle.setAttribute('aria-label', isLight ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro');
    }
  }

  // Inicializar tema inmediatamente
  const currentTheme = getStoredTheme();
  applyTheme(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const active = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(active);
      try {
        localStorage.setItem('lb_theme', active);
      } catch (e) {
        // En caso de que el almacenamiento local esté bloqueado
      }
    });
  }

  // Comprobar preferencia de movimiento reducido
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  // ═════════════════════════════════════════════════════════════════════════
  // 2. EFECTO DE TEXTO DESCIFRADO (TEXT SCRAMBLE)
  // ═════════════════════════════════════════════════════════════════════════
  const scrambleElements = document.querySelectorAll('.scramble-line');
  const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}#_!&';

  function runTextScramble(element, finalString, duration) {
    if (prefersReducedMotion) {
      element.textContent = finalString;
      return;
    }

    const length = finalString.length;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const revealedCount = Math.floor(progress * length);

      let output = '';
      for (let i = 0; i < length; i++) {
        if (finalString[i] === ' ') {
          output += ' ';
        } else if (i < revealedCount) {
          output += finalString[i];
        } else {
          output += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }
      }

      element.textContent = output;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = finalString;
      }
    }

    requestAnimationFrame(update);
  }

  // Ejecutar descifrado al cargar la página
  window.addEventListener('DOMContentLoaded', function () {
    scrambleElements.forEach((el, index) => {
      const text = el.getAttribute('data-scramble') || el.textContent.trim();
      el.setAttribute('aria-label', text);
      // Duración ~1000ms con ligero escalonamiento
      setTimeout(() => {
        runTextScramble(el, text, 950);
      }, index * 90);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 3. MALLA HEXAGONAL EN CANVAS (HERO BACKGROUND)
  // ═════════════════════════════════════════════════════════════════════════
  const canvas = document.getElementById('hex-canvas');
  const heroSection = document.getElementById('inicio');

  if (canvas && heroSection) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = 1;
    let dots = [];
    let isCanvasVisible = true;
    let animId = null;

    // Coordenadas del puntero en el canvas
    let mouse = { x: -9999, y: -9999, isInside: false };

    // Configuración física de la retícula
    const SPACING = 38;
    const RADIUS_BASE = 1.75;
    const INFLUENCE_RADIUS = 150;
    const MAX_DISPLACEMENT = 26;

    function buildGrid() {
      dots = [];
      const colDist = SPACING;
      const rowDist = SPACING * (Math.sqrt(3) / 2);

      const cols = Math.ceil(width / colDist) + 2;
      const rows = Math.ceil(height / rowDist) + 2;

      for (let r = -1; r <= rows; r++) {
        const yBase = r * rowDist;
        const xOffset = (r % 2 === 0) ? 0 : colDist / 2;

        for (let c = -1; c <= cols; c++) {
          const xBase = c * colDist + xOffset;
          dots.push({
            baseX: xBase,
            baseY: yBase,
            x: xBase,
            y: yBase,
            vx: 0,
            vy: 0,
            radius: RADIUS_BASE,
            colorRatio: 0
          });
        }
      }
    }

    function resizeCanvas() {
      const rect = heroSection.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();

      if (prefersReducedMotion) {
        drawStaticFrame();
      }
    }

    function drawStaticFrame() {
      ctx.clearRect(0, 0, width, height);
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      ctx.fillStyle = isDark ? '#1f382a' : '#d2ddd4';

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        ctx.beginPath();
        ctx.arc(d.baseX, d.baseY, RADIUS_BASE, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function renderCanvas() {
      if (!isCanvasVisible || prefersReducedMotion) return;

      ctx.clearRect(0, 0, width, height);
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const baseDotColor = isDark ? { r: 31, g: 56, b: 42 } : { r: 210, g: 221, b: 212 };
      const amberColor = isDark ? { r: 242, g: 182, b: 90 } : { r: 192, g: 116, b: 16 };

      const hasMouse = mouse.isInside && isFinePointer;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        let targetX = d.baseX;
        let targetY = d.baseY;
        let targetRatio = 0;
        let targetR = RADIUS_BASE;

        if (hasMouse) {
          const dx = d.baseX - mouse.x;
          const dy = d.baseY - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < INFLUENCE_RADIUS) {
            const force = (1 - dist / INFLUENCE_RADIUS);
            const disp = MAX_DISPLACEMENT * (force * force);
            const angle = Math.atan2(dy, dx);

            targetX = d.baseX + Math.cos(angle) * disp;
            targetY = d.baseY + Math.sin(angle) * disp;
            targetRatio = force;
            targetR = RADIUS_BASE + force * 2.2;
          }
        }

        // Interpolación suave (lerp)
        d.x += (targetX - d.x) * 0.16;
        d.y += (targetY - d.y) * 0.16;
        d.radius += (targetR - d.radius) * 0.16;
        d.colorRatio += (targetRatio - d.colorRatio) * 0.16;

        // Color interpolado
        const cr = Math.round(baseDotColor.r + (amberColor.r - baseDotColor.r) * d.colorRatio);
        const cg = Math.round(baseDotColor.g + (amberColor.g - baseDotColor.g) * d.colorRatio);
        const cb = Math.round(baseDotColor.b + (amberColor.b - baseDotColor.b) * d.colorRatio);
        const alpha = isDark ? (0.45 + d.colorRatio * 0.55) : (0.6 + d.colorRatio * 0.4);

        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(renderCanvas);
    }

    // Interacción con ratón en el Hero
    heroSection.addEventListener('mousemove', function (e) {
      if (!isFinePointer) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.isInside = true;
    });

    heroSection.addEventListener('mouseleave', function () {
      mouse.isInside = false;
      mouse.x = -9999;
      mouse.y = -9999;
    });

    // Pausar con IntersectionObserver para ahorrar batería y recursos
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(entry => {
        isCanvasVisible = entry.isIntersecting;
        if (isCanvasVisible) {
          if (!prefersReducedMotion && !animId) {
            animId = requestAnimationFrame(renderCanvas);
          }
        } else {
          if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
          }
        }
      });
    }, { threshold: 0.05 });

    observer.observe(heroSection);

    // Ajuste de redimensionamiento
    let resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 150);
    });

    resizeCanvas();
    if (!prefersReducedMotion) {
      animId = requestAnimationFrame(renderCanvas);
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 4. CURSOR PERSONALIZADO (SOLO CON PUNTERO FINO)
  // ═════════════════════════════════════════════════════════════════════════
  const customCursor = document.getElementById('custom-cursor');

  if (customCursor && isFinePointer && !prefersReducedMotion) {
    let mouseX = -100;
    let mouseY = -100;
    let cursorX = -100;
    let cursorY = -100;

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      customCursor.style.opacity = '1';
    });

    document.addEventListener('mouseleave', function () {
      customCursor.style.opacity = '0';
    });

    document.addEventListener('mouseenter', function () {
      customCursor.style.opacity = '1';
    });

    function loopCursor() {
      // Lerp con retardo suave (~0.18)
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;
      customCursor.style.left = cursorX.toFixed(2) + 'px';
      customCursor.style.top = cursorY.toFixed(2) + 'px';
      requestAnimationFrame(loopCursor);
    }

    requestAnimationFrame(loopCursor);

    // Detección de elementos interactivos para expandir cursor
    const interactiveSelector = 'a, button, [role="button"], .project-card, .filter-btn, .tech-chip, .theme-toggle';

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(interactiveSelector)) {
        customCursor.classList.add('is-active');
      }
    });

    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(interactiveSelector)) {
        customCursor.classList.remove('is-active');
      }
    });
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 5. BOTONES MAGNÉTICOS DEL HERO
  // ═════════════════════════════════════════════════════════════════════════
  const magneticButtons = document.querySelectorAll('.magnetic-btn');

  if (isFinePointer && !prefersReducedMotion) {
    magneticButtons.forEach(btn => {
      btn.addEventListener('mousemove', function (e) {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.22;
        const deltaY = (e.clientY - centerY) * 0.22;

        btn.style.transition = 'none';
        btn.style.transform = `translate(${deltaX.toFixed(2)}px, ${deltaY.toFixed(2)}px)`;
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 6. INCLINACIÓN 3D Y BRILLO RADIAL EN TARJETAS DE PROYECTOS
  // ═════════════════════════════════════════════════════════════════════════
  const projectCards = document.querySelectorAll('.project-card');

  if (isFinePointer && !prefersReducedMotion) {
    projectCards.forEach(card => {
      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const xNorm = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const yNorm = ((e.clientY - rect.top) / rect.height) * 2 - 1;

        const maxAngle = 8;
        const rotX = (-yNorm * maxAngle).toFixed(2);
        const rotY = (xNorm * maxAngle).toFixed(2);

        const posX = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1);
        const posY = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1);

        card.style.setProperty('--rx', `${rotX}deg`);
        card.style.setProperty('--ry', `${rotY}deg`);
        card.style.setProperty('--mx', `${posX}%`);
        card.style.setProperty('--my', `${posY}%`);
      });

      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '50%');
      });
    });
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 7. FILTROS DE PROYECTOS (TODOS / LARAVEL / JAVASCRIPT)
  // ═════════════════════════════════════════════════════════════════════════
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      const selectedFilter = btn.getAttribute('data-filter');

      // Actualizar estados aria-pressed y clases
      filterButtons.forEach(b => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      // Filtrar tarjetas
      projectCards.forEach(card => {
        const cardTech = card.getAttribute('data-t');
        if (selectedFilter === 'all' || cardTech === selectedFilter) {
          card.style.display = 'flex';
          card.removeAttribute('hidden');
        } else {
          card.style.display = 'none';
          card.setAttribute('hidden', '');
        }
      });
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 8. DIAGRAMA HEXAGONAL INTERACTIVO (ARQUITECTURA HEXAGONAL)
  // ═════════════════════════════════════════════════════════════════════════
  const nodeElements = document.querySelectorAll('.hex-node');
  const detailTitle = document.getElementById('diagram-active-title');
  const detailBody = document.getElementById('hex-detail');

  // Datos reales de cada adaptador (sin inventar nada)
  const nodeData = {
    'laravel': {
      title: 'Laravel',
      desc: 'Backend de Rekom, LecturaXP y Casino educativo.',
      lineId: 'line-laravel'
    },
    'api-rest': {
      title: 'API REST',
      desc: 'Consumo de APIs externas en Rekom y LecturaXP.',
      lineId: 'line-api-rest'
    },
    'rabbitmq': {
      title: 'RabbitMQ',
      desc: 'Mensajería asíncrona para integrar servicios en mis prácticas.',
      lineId: 'line-rabbitmq'
    },
    'typescript': {
      title: 'TypeScript',
      desc: 'Proyectos internos de las prácticas, trabajando en equipo.',
      lineId: 'line-typescript'
    },
    'python': {
      title: 'Python',
      desc: 'Lo uso junto a TypeScript en los proyectos internos de las prácticas.',
      lineId: 'line-python'
    },
    'javascript': {
      title: 'JavaScript',
      desc: 'Dungeon game: un juego completo con HTML, CSS y JavaScript.',
      lineId: 'line-javascript'
    }
  };

  function selectDiagramNode(nodeKey) {
    const data = nodeData[nodeKey];
    if (!data) return;

    // Actualizar nodos
    nodeElements.forEach(el => {
      const match = el.getAttribute('data-node') === nodeKey;
      el.classList.toggle('active', match);
      el.setAttribute('aria-pressed', match ? 'true' : 'false');
    });

    // Actualizar líneas conectoras
    document.querySelectorAll('.connector-line').forEach(line => {
      line.classList.toggle('active', line.id === data.lineId);
    });

    // Actualizar panel de descripción accesible
    if (detailTitle) detailTitle.textContent = data.title;
    if (detailBody) detailBody.textContent = data.desc;
  }

  nodeElements.forEach(node => {
    // Clic con ratón
    node.addEventListener('click', function () {
      const key = node.getAttribute('data-node');
      selectDiagramNode(key);
    });

    // Soporte accesible por teclado (Enter y Espacio)
    node.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        const key = node.getAttribute('data-node');
        selectDiagramNode(key);
      }
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 9. BARRA DE PROGRESO DE LECTURA Y BOTÓN VOLVER ARRIBA
  // ═════════════════════════════════════════════════════════════════════════
  const scrollProgress = document.getElementById('scroll-progress');
  const backToTopBtn = document.getElementById('back-to-top');

  let isScrolling = false;

  function handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Barra de progreso
    if (scrollProgress && scrollHeight > 0) {
      const progress = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
      scrollProgress.style.transform = `scaleX(${progress})`;
    }

    // Botón volver arriba (visible pasados los 600px)
    if (backToTopBtn) {
      if (scrollTop > 600) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    isScrolling = false;
  }

  window.addEventListener('scroll', function () {
    if (!isScrolling) {
      requestAnimationFrame(handleScroll);
      isScrolling = true;
    }
  }, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }

})();

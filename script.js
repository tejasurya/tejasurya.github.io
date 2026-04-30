/* ============================================================
   TEJA SURYA — Portfolio Script
   Solar System Canvas | Satellite Orbit | Typing | Chatbot
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ═══════════════════════════════════════════════════════
     1. SOLAR SYSTEM CANVAS
     - Renders ONLY while hero is in view (IntersectionObserver)
     - Stars react to mouse; planets on fixed orbits, unaffected
     - Moon orbits Earth; Saturn has a ring
  ═══════════════════════════════════════════════════════ */
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, dpr = window.devicePixelRatio || 1;
  let mouseX = -9999, mouseY = -9999;
  let heroVisible = true;
  let animId;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
  }

  /* ─── Stars ─── */
  const STAR_COUNT = 280;
  let stars = [];

  function buildStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x:    Math.random() * W,
        y:    Math.random() * H,
        ox:   0, oy: 0,           // offset from mouse repulsion
        r:    Math.random() * 1.4 + 0.3,
        base: Math.random() * 0.7 + 0.2,  // base opacity
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        color: pickStarColor(),
      });
    }
  }

  function pickStarColor() {
    const p = Math.random();
    if (p < 0.6)  return '#ffffff';
    if (p < 0.75) return '#cce8ff';  // blue-white
    if (p < 0.88) return '#ffe8a0';  // yellow
    return '#ffcccc';                // red giant
  }

  /* ─── Planets data ─── */
  // orbitR: orbit radius px, size: planet radius px, speed: rad/s
  const SUN_X = () => W * 0.5;
  const SUN_Y = () => H * 0.5;
  const SUN_R = 28;

  const PLANETS = [
    {
      name: 'Mercury',
      orbitR: 70,
      size: 4,
      speed: 0.0088,
      angle: 0.8,
      color: '#b5b5b5',
      glow: null,
    },
    {
      name: 'Venus',
      orbitR: 105,
      size: 7,
      speed: 0.0055,
      angle: 2.1,
      color: '#e8c97a',
      glow: '#ffdd99',
    },
    {
      name: 'Earth',
      orbitR: 148,
      size: 8,
      speed: 0.0038,
      angle: 0.4,
      color: '#4a90d9',
      glow: '#80b8ff',
      hasAtmo: true,   // thin blue atmosphere ring
      hasMoon: true,
      moonAngle: 0,
      moonOrbitR: 18,
      moonSize: 2.5,
      moonSpeed: 0.025,
    },
    {
      name: 'Mars',
      orbitR: 200,
      size: 6,
      speed: 0.0025,
      angle: 3.9,
      color: '#c1440e',
      glow: '#e0663a',
    },
    {
      name: 'Jupiter',
      orbitR: 272,
      size: 18,
      speed: 0.00095,
      angle: 1.2,
      color: '#c88b3a',
      glow: null,
      hasBands: true,
    },
    {
      name: 'Saturn',
      orbitR: 350,
      size: 14,
      speed: 0.00058,
      angle: 4.5,
      color: '#e4d191',
      glow: null,
      hasRing: true,
    },
    {
      name: 'Uranus',
      orbitR: 420,
      size: 10,
      speed: 0.00038,
      angle: 2.8,
      color: '#7de8e8',
      glow: '#a0ffff',
    },
    {
      name: 'Neptune',
      orbitR: 485,
      size: 9,
      speed: 0.00025,
      angle: 0.6,
      color: '#3f54ba',
      glow: '#6b82ff',
    },
  ];

  /* ─── Asteroid belt (sparse dots between Mars & Jupiter) ─── */
  const ASTEROIDS = [];
  for (let i = 0; i < 80; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 228 + Math.random() * 28;
    ASTEROIDS.push({ angle: a, orbitR: r, size: Math.random() * 1.2 + 0.3, speed: 0.0015 + Math.random() * 0.0005 });
  }

  let t = 0; // global time accumulator

  /* ─── Draw helpers ─── */
  function drawOrbitPath(cx, cy, r) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawSun(cx, cy) {
    // Corona glow
    const grad = ctx.createRadialGradient(cx, cy, SUN_R * 0.5, cx, cy, SUN_R * 3.5);
    grad.addColorStop(0,   'rgba(255,220,80,0.45)');
    grad.addColorStop(0.4, 'rgba(255,140,20,0.15)');
    grad.addColorStop(1,   'rgba(255,80,0,0)');
    ctx.save();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, SUN_R * 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Sun body
    const sunGrad = ctx.createRadialGradient(cx - SUN_R * 0.3, cy - SUN_R * 0.3, 2, cx, cy, SUN_R);
    sunGrad.addColorStop(0,   '#fffde0');
    sunGrad.addColorStop(0.4, '#ffe566');
    sunGrad.addColorStop(0.75,'#ffaa00');
    sunGrad.addColorStop(1,   '#ff6600');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, SUN_R, 0, Math.PI * 2);
    ctx.fill();

    // subtle sunspot
    ctx.fillStyle = 'rgba(180,80,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(cx + 6, cy + 4, 5, 3, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPlanet(p, cx, cy) {
    const px = cx + Math.cos(p.angle) * p.orbitR;
    const py = cy + Math.sin(p.angle) * p.orbitR;

    // Glow halo
    if (p.glow) {
      const g = ctx.createRadialGradient(px, py, p.size * 0.6, px, py, p.size * 2.2);
      g.addColorStop(0, p.glow.replace(')', ',0.4)').replace('rgb', 'rgba'));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save();
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, p.size * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();

    // Saturn ring (behind planet)
    if (p.hasRing) {
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(1, 0.35);
      const rg = ctx.createLinearGradient(-p.size * 2.6, 0, p.size * 2.6, 0);
      rg.addColorStop(0,   'rgba(200,180,100,0)');
      rg.addColorStop(0.2, 'rgba(220,200,120,0.55)');
      rg.addColorStop(0.5, 'rgba(240,220,140,0.75)');
      rg.addColorStop(0.8, 'rgba(220,200,120,0.55)');
      rg.addColorStop(1,   'rgba(200,180,100,0)');
      ctx.strokeStyle = rg;
      ctx.lineWidth = p.size * 0.9;
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 2.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Planet body gradient
    const grad = ctx.createRadialGradient(
      px - p.size * 0.35, py - p.size * 0.35, p.size * 0.1,
      px, py, p.size
    );

    if (p.name === 'Earth') {
      grad.addColorStop(0,   '#7ac5ff');
      grad.addColorStop(0.4, '#4a90d9');
      grad.addColorStop(0.75,'#1a5fa0');
      grad.addColorStop(1,   '#0a3560');
    } else if (p.name === 'Jupiter') {
      grad.addColorStop(0,   '#e8c07a');
      grad.addColorStop(0.5, '#c88b3a');
      grad.addColorStop(1,   '#8a5010');
    } else {
      grad.addColorStop(0,   lighten(p.color, 50));
      grad.addColorStop(0.6, p.color);
      grad.addColorStop(1,   darken(p.color, 50));
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fill();

    // Earth cloud wisps
    if (p.name === 'Earth') {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(px - 2, py - 2, p.size * 0.6, p.size * 0.2, 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(px + 1, py + 3, p.size * 0.5, p.size * 0.15, -0.4, 0, Math.PI * 2);
      ctx.fill();
      // Thin blue atmosphere
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = '#88ccff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, p.size + 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Jupiter bands
    if (p.name === 'Jupiter') {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = '#a06020';
      ctx.lineWidth = 2.5;
      for (let b = -1; b <= 1; b++) {
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0.1, Math.PI - 0.1);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Moon
    if (p.hasMoon) {
      const mx = px + Math.cos(p.moonAngle) * p.moonOrbitR;
      const my = py + Math.sin(p.moonAngle) * p.moonOrbitR;
      // Moon orbit path
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(px, py, p.moonOrbitR, 0, Math.PI * 2);
      ctx.stroke();
      // Moon body
      const mg = ctx.createRadialGradient(mx - 0.8, my - 0.8, 0.2, mx, my, p.moonSize);
      mg.addColorStop(0, '#e8e8e8');
      mg.addColorStop(1, '#9a9a9a');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(mx, my, p.moonSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  function drawStars(now) {
    stars.forEach(s => {
      // Twinkle
      const alpha = s.base + Math.sin(now * s.twinkleSpeed + s.twinklePhase) * 0.25;

      // Mouse repulsion (only for stars, not planets)
      const dx = s.x - mouseX;
      const dy = s.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const REPEL = 120;
      if (dist < REPEL) {
        const force = (1 - dist / REPEL) * 18;
        s.ox += (dx / dist) * force * 0.08;
        s.oy += (dy / dist) * force * 0.08;
      }
      s.ox *= 0.88; // damping
      s.oy *= 0.88;

      const rx = s.x + s.ox;
      const ry = s.y + s.oy;

      ctx.save();
      ctx.globalAlpha = Math.max(0.05, Math.min(1, alpha));
      ctx.fillStyle = s.color;
      // Larger stars get a tiny cross-hair sparkle
      if (s.r > 1.1) {
        ctx.shadowColor  = s.color;
        ctx.shadowBlur   = 4;
      }
      ctx.beginPath();
      ctx.arc(rx, ry, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawAsteroids(cx, cy) {
    ASTEROIDS.forEach(a => {
      a.angle += a.speed * 0.016;
      const ax = cx + Math.cos(a.angle) * a.orbitR;
      const ay = cy + Math.sin(a.angle) * a.orbitR;
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = '#888';
      ctx.beginPath();
      ctx.arc(ax, ay, a.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  /* ─── Colour helpers ─── */
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return { r, g, b };
  }
  function lighten(hex, amt) {
    const { r,g,b } = hexToRgb(hex);
    return `rgb(${Math.min(255,r+amt)},${Math.min(255,g+amt)},${Math.min(255,b+amt)})`;
  }
  function darken(hex, amt) {
    const { r,g,b } = hexToRgb(hex);
    return `rgb(${Math.max(0,r-amt)},${Math.max(0,g-amt)},${Math.max(0,b-amt)})`;
  }

  /* ─── Main render loop ─── */
  let last = 0;
  function render(now) {
    animId = requestAnimationFrame(render);
    if (!heroVisible) return;

    const dt = Math.min((now - last) / 1000, 0.05); // seconds, capped
    last = now;
    t += dt;

    ctx.clearRect(0, 0, W, H);

    // Deep space background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#00010a');
    bg.addColorStop(0.5, '#03071e');
    bg.addColorStop(1, '#060818');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const cx = SUN_X(), cy = SUN_Y();

    // Stars (behind everything)
    drawStars(now);

    // Orbit paths
    PLANETS.forEach(p => drawOrbitPath(cx, cy, p.orbitR));

    // Asteroid belt
    drawAsteroids(cx, cy);

    // Sun
    drawSun(cx, cy);

    // Planets
    PLANETS.forEach(p => {
      p.angle += p.speed;
      if (p.hasMoon) p.moonAngle += p.moonSpeed;
      drawPlanet(p, cx, cy);
    });
  }

  /* ─── Hero visibility — only run canvas when hero visible ─── */
  const heroEl = document.getElementById('hero');
  const heroObserver = new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    // Show/hide canvas
    canvas.style.opacity = heroVisible ? '1' : '0';
  }, { threshold: 0.01 });
  heroObserver.observe(heroEl);

  /* ─── Mouse tracking ─── */
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  document.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(render);

  /* ═══════════════════════════════════════════════════════
     2. NAVBAR — switch style when leaving hero
  ═══════════════════════════════════════════════════════ */
  const navbar = document.getElementById('navbar');
  function updateNav() {
    const heroBottom = heroEl.getBoundingClientRect().bottom;
    if (heroBottom <= 80) {
      navbar.classList.add('light-nav');
    } else {
      navbar.classList.remove('light-nav');
    }
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ═══════════════════════════════════════════════════════
     3. HAMBURGER
  ═══════════════════════════════════════════════════════ */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));

  /* ═══════════════════════════════════════════════════════
     4. SATELLITE ORBIT — tilt toward mouse on hover
  ═══════════════════════════════════════════════════════ */
  const orbitContainer = document.getElementById('orbit-container');
  const orbitRing      = document.getElementById('orbit-ring');
  const satellite      = document.getElementById('satellite');

  if (orbitContainer && orbitRing && satellite) {
    heroEl.addEventListener('mousemove', e => {
      const rect = orbitContainer.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const tiltX = Math.max(-28, Math.min(28, (e.clientY - cy) * 0.09));
      const tiltY = Math.max(-28, Math.min(28, (e.clientX - cx) * 0.09));
      orbitRing.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
    heroEl.addEventListener('mouseleave', () => { orbitRing.style.transform = ''; });
    heroEl.addEventListener('mouseenter', () => {
      orbitRing.style.animationDuration  = '5s';
      satellite.style.animationDuration  = '5s';
    });
    heroEl.addEventListener('mouseleave', () => {
      orbitRing.style.animationDuration  = '12s';
      satellite.style.animationDuration  = '12s';
    });
  }

  /* ═══════════════════════════════════════════════════════
     5. TYPING EFFECT
  ═══════════════════════════════════════════════════════ */
  const typedEl = document.getElementById('typed-text');
  const phrases  = ['GeoAI Researcher','Sensor Fusion Engineer','LiDAR & SLAM Specialist','Machine Learning Expert','Kaggle 3x Expert'];
  let pIdx = 0, cIdx = 0, deleting = false;

  function typeLoop() {
    const phrase = phrases[pIdx];
    typedEl.textContent = deleting ? phrase.slice(0, --cIdx) : phrase.slice(0, ++cIdx);
    if (!deleting && cIdx === phrase.length) { deleting = true; setTimeout(typeLoop, 2000); return; }
    if (deleting && cIdx === 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; }
    setTimeout(typeLoop, deleting ? 50 : 85);
  }
  typeLoop();

  /* ═══════════════════════════════════════════════════════
     6. SCROLL REVEAL
  ═══════════════════════════════════════════════════════ */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 70);
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '-30px' });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ═══════════════════════════════════════════════════════
     7. SKILL BARS
  ═══════════════════════════════════════════════════════ */
  const skillsSec = document.getElementById('skills');
  let skillsDone = false;
  if (skillsSec) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !skillsDone) {
        skillsDone = true;
        document.querySelectorAll('.skill-bar-fill').forEach(bar => {
          setTimeout(() => { bar.style.width = bar.getAttribute('data-pct') + '%'; }, 200);
        });
      }
    }, { threshold: 0.3 }).observe(skillsSec);
  }

  /* ═══════════════════════════════════════════════════════
     8. TEJABOT CHATBOT
  ═══════════════════════════════════════════════════════ */
  const botToggle  = document.getElementById('bot-toggle');
  const botWindow  = document.getElementById('tejabot-window');
  const botClose   = document.getElementById('bot-close');
  const botInput   = document.getElementById('bot-input');
  const botSend    = document.getElementById('bot-send');
  const botMsgs    = document.getElementById('bot-messages');

  const KB = {
    greet:        ['hi','hello','hey','namaste','good','morning','evening'],
    research:     ['research','slam','lidar','sensor','fusion','geoai','geoinformatics','robotics','navigation','autonomous','spatial'],
    education:    ['education','study','degree','iit','madras','kanpur','university','college','mit','anna','master','msc'],
    skills:       ['skill','python','pytorch','tensorflow','coding','programming','kaggle','ml','ai','tool'],
    hobbies:      ['hobby','hobbies','interest','music','keyboard','piano','german','language','food','vegetarian','polyglot'],
    contact:      ['contact','email','reach','hire','collaborate','connect'],
    achievements: ['achievement','award','rank','jam','inspire','expert','grant'],
    experience:   ['experience','work','job','amazon','internship','climate','taruni'],
  };

  const RESPONSES = {
    greet:        `👋 Hi! I'm <strong>TejaBot</strong>. Ask me about Teja's research, education, skills, or interests!`,
    research:     `🔬 Teja's research focuses on <strong>GeoAI, Sensor Fusion, LiDAR & SLAM</strong> for autonomous navigation at <strong>IIT Kanpur</strong> under Prof. Salil Goel.`,
    education:    `🎓 <strong>IIT Kanpur</strong> — M.Tech Geoinformatics (current)<br><strong>IIT Madras</strong> — M.Sc Mathematics (2019–2021)<br><strong>MIT, Anna University</strong> — B.E. CS (2014–2018)`,
    skills:       `💻 PyTorch · TensorFlow · Scikit-learn · Python · C++ · QGIS · ArcGIS · CloudCompare · AWS · Spark<br>Also a <strong>3x Kaggle Expert</strong> 🏆`,
    hobbies:      `🎹 Musician & keyboardist · Learning German 🇩🇪 · Polyglot (Tamil, Telugu, Kannada, Hindi, English, Malayalam) · Vegetarian 🌿`,
    contact:      `📬 <strong>Email:</strong> tejasurya@alumni.iitm.ac.in<br><strong>LinkedIn:</strong> /in/tejasurya<br><strong>GitHub:</strong> github.com/tejasurya`,
    achievements: `🏆 3x Kaggle Expert · AIR 81 JAM 2019 (99.5%) · INSPIRE Scholar (DST, Govt. of India) · Rs. 2,00,000 research grant`,
    experience:   `💼 Amazon (Sr. Product Associate) · Climate Connect Digital (Data Scientist Intern, MAPE 0.76) · Taruni Restaurant (Android App) · CTDT Anna University (50% cost reduction)`,
    default:      `🤖 I can answer questions about Teja's <strong>research</strong>, <strong>education</strong>, <strong>skills</strong>, <strong>experience</strong>, <strong>hobbies</strong>, or <strong>contact</strong> details. What would you like to know?`,
  };

  function getResponse(input) {
    const l = input.toLowerCase();
    for (const [key, words] of Object.entries(KB)) {
      if (words.some(w => l.includes(w))) return RESPONSES[key];
    }
    return RESPONSES.default;
  }

  function addMsg(html, type) {
    const d = document.createElement('div');
    d.className = type === 'bot' ? 'bot-msg' : 'user-msg';
    d.innerHTML = html;
    botMsgs.appendChild(d);
    botMsgs.scrollTop = botMsgs.scrollHeight;
  }

  function send(text) {
    if (!text.trim()) return;
    addMsg(text, 'user');
    botInput.value = '';
    setTimeout(() => addMsg(getResponse(text), 'bot'), 380);
  }

  botToggle.addEventListener('click', () => {
    const open = botWindow.classList.contains('open');
    if (!open) { botWindow.style.display = 'flex'; requestAnimationFrame(() => botWindow.classList.add('open')); }
    else { botWindow.classList.remove('open'); setTimeout(() => { botWindow.style.display = 'none'; }, 280); }
  });
  botClose.addEventListener('click', () => { botWindow.classList.remove('open'); setTimeout(() => { botWindow.style.display = 'none'; }, 280); });
  botSend.addEventListener('click', () => send(botInput.value));
  botInput.addEventListener('keydown', e => { if (e.key === 'Enter') send(botInput.value); });
  document.querySelectorAll('.quick-reply').forEach(btn => btn.addEventListener('click', () => send(btn.textContent)));

  console.log('%c🛰️  Teja Surya H · GeoAI Portfolio', 'color:#4f8ef7;font-size:14px;font-weight:bold;');
});

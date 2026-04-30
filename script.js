/* ============================================================
   TEJA SURYA — Portfolio Script
   Satellite Orbit | Typing | Scroll Reveal | Chatbot
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     1. NAVBAR SCROLL
  ───────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  /* ─────────────────────────────────────────
     2. HAMBURGER MOBILE MENU
  ───────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  /* ─────────────────────────────────────────
     3. CANVAS — subtle dot grid (light)
  ───────────────────────────────────────── */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const DOTS = [];
  const DOT_COUNT = 60;

  class Dot {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : -6;
      this.r = Math.random() * 1.8 + 0.4;
      this.vy = Math.random() * 0.3 + 0.1;
      this.vx = (Math.random() - 0.5) * 0.15;
      this.alpha = Math.random() * 0.25 + 0.05;
    }
    update() {
      this.y += this.vy;
      this.x += this.vx;
      if (this.y > H + 8) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = '#1a56db';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < DOT_COUNT; i++) DOTS.push(new Dot());

  function drawGrid() {
    const size = 60;
    ctx.strokeStyle = 'rgba(26,86,219,0.04)';
    ctx.lineWidth = 0.8;
    for (let x = 0; x <= W; x += size) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += size) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    DOTS.forEach(d => { d.update(); d.draw(); });
    requestAnimationFrame(animateCanvas);
  }
  animateCanvas();

  /* ─────────────────────────────────────────
     4. SATELLITE ORBIT — follows mouse
  ───────────────────────────────────────── */
  const orbitContainer = document.getElementById('orbit-container');
  const orbitRing = document.getElementById('orbit-ring');
  const satellite = document.getElementById('satellite');

  if (orbitContainer && orbitRing && satellite) {
    // Default: CSS animation spins the ring
    // On mousemove over hero: satellite tilts toward cursor

    const hero = document.getElementById('hero');

    hero.addEventListener('mousemove', (e) => {
      const rect = orbitContainer.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      // Tilt the orbit plane toward the mouse
      const tiltX = Math.max(-25, Math.min(25, dy * 0.08));
      const tiltY = Math.max(-25, Math.min(25, dx * 0.08));

      orbitRing.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    hero.addEventListener('mouseleave', () => {
      orbitRing.style.transform = '';
    });

    // Speed up satellite on hover
    hero.addEventListener('mouseenter', () => {
      orbitRing.style.animationDuration = '4s';
      satellite.style.animationDuration = '4s';
    });
    hero.addEventListener('mouseleave', () => {
      orbitRing.style.animationDuration = '12s';
      satellite.style.animationDuration = '12s';
    });
  }

  /* ─────────────────────────────────────────
     5. TYPING EFFECT
  ───────────────────────────────────────── */
  const typedEl = document.getElementById('typed-text');
  const phrases = [
    'GeoAI Researcher',
    'Sensor Fusion Engineer',
    'LiDAR & SLAM Specialist',
    'Machine Learning Expert',
    'Kaggle 3x Expert'
  ];
  let pIdx = 0, cIdx = 0, deleting = false;

  function typeLoop() {
    const phrase = phrases[pIdx];
    if (!deleting) {
      typedEl.textContent = phrase.slice(0, ++cIdx);
      if (cIdx === phrase.length) {
        deleting = true;
        setTimeout(typeLoop, 2000);
        return;
      }
    } else {
      typedEl.textContent = phrase.slice(0, --cIdx);
      if (cIdx === 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
      }
    }
    setTimeout(typeLoop, deleting ? 50 : 85);
  }
  typeLoop();

  /* ─────────────────────────────────────────
     6. SCROLL REVEAL
  ───────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 70);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '-30px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ─────────────────────────────────────────
     7. SKILL BARS
  ───────────────────────────────────────── */
  const skillsSection = document.getElementById('skills');
  let skillsDone = false;
  const skillObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !skillsDone) {
      skillsDone = true;
      document.querySelectorAll('.skill-bar-fill').forEach(bar => {
        const pct = bar.getAttribute('data-pct');
        setTimeout(() => { bar.style.width = pct + '%'; }, 200);
      });
    }
  }, { threshold: 0.3 });
  if (skillsSection) skillObserver.observe(skillsSection);

  /* ─────────────────────────────────────────
     8. TEJABOT CHATBOT
  ───────────────────────────────────────── */
  const botToggle  = document.getElementById('bot-toggle');
  const botWindow  = document.getElementById('tejabot-window');
  const botClose   = document.getElementById('bot-close');
  const botInput   = document.getElementById('bot-input');
  const botSend    = document.getElementById('bot-send');
  const botMsgs    = document.getElementById('bot-messages');
  const quickReplies = document.querySelectorAll('.quick-reply');

  const KB = {
    greet:        ['hi','hello','hey','namaste','good','morning','evening','howdy'],
    research:     ['research','slam','lidar','sensor','fusion','geoai','geoinformatics','robotics','navigation','autonomous','spatial'],
    education:    ['education','study','degree','iit','madras','kanpur','university','college','mit','anna','master','msc','btech','beng'],
    skills:       ['skill','python','pytorch','tensorflow','coding','programming','kaggle','ml','ai','tool','framework'],
    hobbies:      ['hobby','hobbies','interest','music','keyboard','piano','german','language','food','vegetarian','polyglot','languages'],
    contact:      ['contact','email','reach','hire','collaborate','connect'],
    achievements: ['achievement','award','rank','jam','inspire','expert','grant'],
    experience:   ['experience','work','job','amazon','internship','climate','taruni'],
  };

  const RESPONSES = {
    greet: `👋 Hi there! I'm <strong>TejaBot</strong>, Teja's AI assistant. Ask me about his research, education, skills, or interests!`,
    research: `🔬 Teja's research focuses on <strong>GeoAI, Sensor Fusion, LiDAR, and SLAM</strong> for autonomous navigation. He is a Research Scholar at <strong>IIT Kanpur</strong> under Prof. Salil Goel, combining mathematical rigor with deep learning for complex spatial problems.`,
    education: `🎓 Teja's academic path:<br>
• <strong>IIT Kanpur</strong> — M.Tech Geoinformatics (Research Scholar, current)<br>
• <strong>IIT Madras</strong> — M.Sc Mathematics (2019–2021)<br>
• <strong>MIT, Anna University</strong> — B.E. Computer Science (2014–2018)`,
    skills: `💻 Teja's core tools:<br>
• <strong>GeoAI</strong>: QGIS, ArcGIS, CloudCompare, MATLAB, GeoPandas<br>
• <strong>AI/ML</strong>: PyTorch, TensorFlow, Scikit-learn, Transformers<br>
• <strong>Programming</strong>: Python, C++, Java, SQL, AWS, Spark<br>
He's also a <strong>3x Kaggle Expert</strong> 🏆`,
    hobbies: `🎹 Beyond research, Teja:<br>
• Is a <strong>musician and keyboardist</strong> 🎹<br>
• Is currently learning <strong>German</strong> 🇩🇪<br>
• Is a <strong>polyglot</strong> — Tamil, Telugu, Kannada, Hindi, English, Malayalam 🌏<br>
• Follows a <strong>vegetarian diet</strong> 🌿`,
    contact: `📬 Reach Teja at:<br>
• <strong>Email</strong>: tejasurya@alumni.iitm.ac.in<br>
• <strong>LinkedIn</strong>: /in/tejasurya<br>
• <strong>GitHub</strong>: github.com/tejasurya<br>
Or use the <strong>Contact form</strong> below!`,
    achievements: `🏆 Key achievements:<br>
• <strong>3x Kaggle Expert</strong> (Datasets, Notebooks, Discussions)<br>
• <strong>AIR 81 in JAM 2019</strong> — 99.5 percentile in Mathematics<br>
• <strong>INSPIRE Scholar</strong> — DST, Govt. of India<br>
• <strong>Rs. 2,00,000 research grant</strong> from Tamil Nadu Govt.`,
    experience: `💼 Work experience:<br>
• <strong>Amazon</strong> — Senior Product Associate (Nov '23–May '24)<br>
• <strong>Climate Connect Digital</strong> — Data Scientist Intern; MAPE reduced to 0.76<br>
• <strong>Freelance</strong> — Android app for Taruni Restaurant<br>
• <strong>CTDT, Anna University</strong> — Laser-LDR tracking system, 50% cost reduction`,
    default: `🤖 I can tell you about Teja's <strong>research</strong>, <strong>education</strong>, <strong>skills</strong>, <strong>experience</strong>, <strong>hobbies</strong>, <strong>achievements</strong>, or how to <strong>contact</strong> him. What would you like to know?`
  };

  function getResponse(input) {
    const lower = input.toLowerCase();
    for (const [key, keywords] of Object.entries(KB)) {
      if (keywords.some(kw => lower.includes(kw))) return RESPONSES[key];
    }
    return RESPONSES.default;
  }

  function addMsg(html, type) {
    const div = document.createElement('div');
    div.className = type === 'bot' ? 'bot-msg' : 'user-msg';
    div.innerHTML = html;
    botMsgs.appendChild(div);
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
    if (!open) {
      botWindow.style.display = 'flex';
      requestAnimationFrame(() => botWindow.classList.add('open'));
    } else {
      botWindow.classList.remove('open');
      setTimeout(() => { botWindow.style.display = 'none'; }, 280);
    }
  });

  botClose.addEventListener('click', () => {
    botWindow.classList.remove('open');
    setTimeout(() => { botWindow.style.display = 'none'; }, 280);
  });

  botSend.addEventListener('click', () => send(botInput.value));
  botInput.addEventListener('keydown', e => { if (e.key === 'Enter') send(botInput.value); });
  quickReplies.forEach(btn => btn.addEventListener('click', () => send(btn.textContent)));

  console.log('%cTeja Surya H — Portfolio', 'color:#1a56db;font-size:16px;font-weight:bold;');
});

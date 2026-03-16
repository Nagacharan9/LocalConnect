/* ==========================================================
   LOCALCONNECT – Interactive JS
   Particle Canvas · Navigation · SOS · Marketplace Filter
   ========================================================== */

// ── Navigation between screens ──────────────────────────────
function showSection(id, pushHash) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    // Scroll to the top if not hero to prevent jumpy behavior. The hero section is at the top.
    if (id !== 'hero') {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Update nav active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + id) link.classList.add('active');
  });

  // Close mobile menu if open
  const nl = document.querySelector('.nav-links');
  if (nl && window.getComputedStyle(nl).position === 'fixed') {
    nl.style.display = 'none';
  }

  // Sync URL hash (skip if called from hashchange to avoid loop)
  if (pushHash !== false && window.location.hash !== '#' + id) {
    try {
      window.history.replaceState(null, '', '#' + id);
    } catch (e) {
      console.warn("Could not update URL hash:", e);
    }
  }
}

// ── Handle browser hash navigation (back/forward, direct URL) ──
window.addEventListener('hashchange', function() {
  var id = window.location.hash.replace('#', '');
  if (id && document.getElementById(id)) {
    showSection(id, false);
  }
});

// ── Mobile Menu ──────────────────────────────────────────────
function toggleMobileMenu() {
  const nl = document.querySelector('.nav-links');
  const isOpen = nl.style.display === 'flex';
  nl.style.display    = isOpen ? 'none' : 'flex';
  nl.style.position   = 'fixed';
  nl.style.top        = '80px';
  nl.style.left       = '16px';
  nl.style.right      = '16px';
  nl.style.flexDirection = 'column';
  nl.style.background = 'rgba(4,8,15,0.97)';
  nl.style.border     = '1px solid rgba(79,143,255,0.2)';
  nl.style.borderRadius = '16px';
  nl.style.padding    = '16px';
  nl.style.gap        = '4px';
  nl.style.zIndex     = '999';
  if (isOpen) nl.style.display = 'none';
}

// ── Compose Modal ─────────────────────────────────────────────
function openComposeModal() {
  document.getElementById('composeModal').classList.add('open');
}
function closeComposeModal(e) {
  if (!e || e.target === document.getElementById('composeModal')) {
    document.getElementById('composeModal').classList.remove('open');
  }
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeComposeModal();
});

// ── SOS Trigger ───────────────────────────────────────────────
let sosHeld = false;
let sosTimer = null;

function triggerSOS() {
  const btn  = document.getElementById('mainSosBtn');
  const toast = document.getElementById('sosToast');

  btn.style.transform = 'scale(0.92)';
  btn.style.background = 'radial-gradient(circle at 35% 35%, #ff0000, #7f0000 40%, #3f0000)';

  // vibrate if supported
  if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);

  setTimeout(() => {
    btn.style.transform = '';
    btn.style.background = '';

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  }, 600);
}

// ── Marketplace Filter ────────────────────────────────────────
function filterCategory(btn, cat) {
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');

  const cards = document.querySelectorAll('.market-card');
  cards.forEach(card => {
    if (cat === 'all' || card.dataset.cat === cat) {
      card.classList.remove('hidden');
      card.style.animation = '';
      void card.offsetWidth; // reflow to restart animation
      card.style.animation = null;
    } else {
      card.classList.add('hidden');
    }
  });
}

// ── Parallax mouse effect (for cards only now) ──────────────────
document.addEventListener('mousemove', e => {
  const mx = (e.clientX - window.innerWidth  / 2) / window.innerWidth;
  const my = (e.clientY - window.innerHeight / 2) / window.innerHeight;

  document.querySelectorAll('.ep-card').forEach((el, i) => {
    const depth = (i + 1) * 0.3;
    el.style.transform = `translateX(${mx * 6 * depth}px) translateY(${my * 4 * depth + (parseFloat(getComputedStyle(el).animationDelay) || 0)}px)`;
  });
});

// ── Particle system ────────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');
  let width, height, particles = [], animFrame;

  function resize() {
    width = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function createParticle() {
    return {
      x:    Math.random() * width,
      y:    Math.random() * height,
      r:    Math.random() * 1.5 + 0.3,
      vx:   (Math.random() - 0.5) * 0.3,
      vy:   (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.6
               ? `rgba(79,143,255,` 
               : Math.random() > 0.5
               ? `rgba(159,122,234,`
               : `rgba(34,197,94,`,
    };
  }

  const NUM = 120;
  for (let i = 0; i < NUM; i++) particles.push(createParticle());

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(79,143,255,${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
    });

    animFrame = requestAnimationFrame(draw);
  }

  draw();
})();

// ── Navigation scroll effect ───────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  if (window.scrollY > 30) {
    nav.style.background = 'rgba(4,8,15,0.85)';
    nav.style.boxShadow  = '0 8px 40px rgba(0,0,0,0.6)';
  } else {
    nav.style.background = '';
    nav.style.boxShadow  = '';
  }
});

// ── Post action buttons interactivity ─────────────────────────
document.addEventListener('click', e => {
  const btn = e.target.closest('.post-action-btn');
  if (!btn) return;
  const card = btn.closest('.feed-card');
  const txt  = btn.textContent.trim();

  // ❤️ Like toggle
  if (txt.startsWith('❤️')) {
    btn.classList.toggle('liked');
    const num = parseInt(txt.replace(/[^\d]/g,'')) || 0;
    btn.textContent = '❤️ ' + (btn.classList.contains('liked') ? num + 1 : Math.max(0, num - 1));
    return;
  }

  // 💬 Comment – toggle inline comment section
  if (txt.startsWith('💬')) {
    if (!card) return;
    let section = card.querySelector('.comment-section');
    if (section) { section.remove(); return; }

    // Build comment section
    section = document.createElement('div');
    section.className = 'comment-section';
    section.style.cssText = 'margin-top:12px; border-top:1px solid rgba(79,143,255,0.12); padding-top:12px;';

    // Existing stub comments from count
    const existingCount = parseInt(txt.replace(/[^\d]/g,'')) || 0;
    const stubNames = ['Priya R.','Dev J.','Sara M.','Rahul K.','Ananya N.'];
    const stubTexts = ['Great point! Thanks for sharing 🙌','Appreciate the heads-up!','Saw this too, very helpful.','Sharing with my neighbours!'];
    let stubHtml = '';
    const show = Math.min(existingCount, 3);
    for (let i = 0; i < show; i++) {
      stubHtml += buildCommentBubble(stubNames[i % stubNames.length], stubTexts[i % stubTexts.length], (i+1)+'m ago');
    }

    section.innerHTML = stubHtml
      + '<div class="comment-input-row" style="display:flex;gap:8px;margin-top:10px;align-items:flex-start;">'
      + '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#4f8fff,#9f7aea);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.72rem;flex-shrink:0;">'
      + (window.userLoginName ? window.userLoginName.charAt(0).toUpperCase() : 'ME')
      + '</div>'
      + '<div style="flex:1;display:flex;gap:6px;">'
      + '<textarea class="comment-input" placeholder="Write a comment…" rows="1" style="flex:1;background:rgba(79,143,255,0.06);border:1px solid rgba(79,143,255,0.2);border-radius:10px;padding:8px 12px;color:#e8edf7;font-size:0.82rem;font-family:inherit;resize:none;outline:none;line-height:1.4;transition:border-color 0.2s;" onfocus="this.style.borderColor=\'rgba(79,143,255,0.45)\'" onblur="this.style.borderColor=\'rgba(79,143,255,0.2)\'" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();this.closest(\'.comment-input-row\').querySelector(\'.comment-send-btn\').click();}"></textarea>'
      + '<button class="comment-send-btn" style="padding:8px 14px;border-radius:10px;background:linear-gradient(135deg,#4f8fff,#9f7aea);border:none;color:#fff;font-size:0.8rem;font-weight:700;cursor:pointer;align-self:flex-end;white-space:nowrap;">Send</button>'
      + '</div></div>';

    card.appendChild(section);
    section.querySelector('.comment-input').focus();

    // Send button handler
    section.querySelector('.comment-send-btn').addEventListener('click', () => {
      const input = section.querySelector('.comment-input');
      const text  = input.value.trim();
      if (!text) { input.focus(); return; }

      const name = window.userLoginName || 'You';
      const bubble = document.createElement('div');
      bubble.innerHTML = buildCommentBubble(name, text, 'Just now');
      const inputRow = section.querySelector('.comment-input-row');
      section.insertBefore(bubble.firstChild, inputRow);

      // Update comment count on button
      const cBtn = card.querySelector('.post-action-btn');
      const allBtns = card.querySelectorAll('.post-action-btn');
      allBtns.forEach(b => {
        if (b.textContent.startsWith('💬')) {
          const n = parseInt(b.textContent.replace(/[^\d]/g,'')) || 0;
          b.textContent = '💬 ' + (n + 1);
        }
      });

      input.value = '';
      input.focus();
    });
    return;
  }

  // ↗ Share – copy post text to clipboard
  if (txt.startsWith('↗')) {
    if (!card) return;
    const postText = card.querySelector('.post-text');
    const copyText = postText ? postText.textContent.trim() : 'Check out this post on LocalConnect!';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(copyText).then(() => showShareToast(btn));
    } else {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = copyText; ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy');
      document.body.removeChild(ta); showShareToast(btn);
    }
    return;
  }

  // 🤝 Helpful / 👍 toggle
  if (txt.includes('Helpful')) {
    btn.classList.toggle('liked');
    btn.textContent = btn.classList.contains('liked') ? '🤝 Helped!' : '🤝 Helpful';
    return;
  }

  // 🔔 Remind toggle
  if (txt.includes('Remind') || txt.includes('Alert')) {
    btn.classList.toggle('liked');
    btn.textContent = btn.classList.contains('liked') ? '🔔 Reminded!' : '🔔 Remind';
    return;
  }
});

function buildCommentBubble(name, text, time) {
  const initials = name.charAt(0).toUpperCase();
  const colors   = ['#4f8fff','#9f7aea','#22c55e','#f59e0b','#f87171'];
  const col       = colors[name.charCodeAt(0) % colors.length];
  return '<div style="display:flex;gap:8px;margin-bottom:10px;animation:modalSlideUp 0.3s ease;">'
    + '<div style="width:26px;height:26px;border-radius:50%;background:'+col+';color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.68rem;flex-shrink:0;">'+initials+'</div>'
    + '<div style="flex:1;">'
    + '<div style="background:rgba(79,143,255,0.07);border:1px solid rgba(79,143,255,0.12);border-radius:10px;padding:8px 12px;">'
    + '<span style="display:block;font-size:0.72rem;font-weight:700;color:#a0bcff;margin-bottom:3px;">'+name+'</span>'
    + '<span style="font-size:0.83rem;color:#d1ddf7;line-height:1.4;">'+text.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</span>'
    + '</div>'
    + '<span style="font-size:0.65rem;color:#4a6080;margin-left:4px;">'+time+'</span>'
    + '</div></div>';
}

function showShareToast(btn) {
  const orig = btn.textContent;
  btn.textContent = '✓ Copied!';
  btn.style.color = '#22c55e';
  setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 2000);
}

// ── Book button interaction (only for cards without explicit onclick) ────
document.addEventListener('click', e => {
  const btn = e.target.closest('.mc-book-btn');
  // Skip if this button has its own onclick (provider modal buttons)
  if (!btn || btn.hasAttribute('onclick')) return;
  const orig = btn.textContent;
  btn.textContent = '✓ Booked!';
  btn.style.background = 'linear-gradient(135deg, #22c55e, #166534)';
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.background = '';
  }, 2000);
});

// ── Emergency call buttons ─────────────────────────────────────
function callEmergency(number, label, btn) {
  if (!btn) { window.location.href = 'tel:' + number; return; }
  const origText = btn.textContent;
  const origBg   = btn.style.background;

  // Visual feedback
  btn.textContent = '📞 Calling ' + number + '…';
  btn.style.background = 'linear-gradient(135deg,#22c55e,#166534)';
  btn.disabled = true;

  // On mobile → open real dialer; on desktop → show feedback toast
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    window.location.href = 'tel:' + number;
  } else {
    const toast = document.createElement('div');
    toast.innerHTML = `📞 <strong>Calling ${label} (${number})</strong> — opens phone dialer on mobile devices`;
    toast.style.cssText = [
      'position:fixed','top:24px','left:50%','transform:translateX(-50%) translateY(-20px)',
      'background:rgba(10,18,35,0.97)','border:1px solid rgba(34,197,94,0.4)',
      'color:#e8edf7','padding:14px 28px','border-radius:999px',
      'font-size:0.88rem','font-weight:600','z-index:99999',
      'box-shadow:0 8px 40px rgba(0,0,0,0.5),0 0 20px rgba(34,197,94,0.2)',
      'backdrop-filter:blur(16px)',
      'transition:opacity 0.4s ease,transform 0.4s ease','opacity:0'
    ].join(';');
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-12px)';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  setTimeout(() => {
    btn.textContent = origText;
    btn.style.background = origBg;
    btn.disabled = false;
  }, 2500);
}

// ── Alert neighbors button ─────────────────────────────────────
function alertNeighbors(btn) {
  const orig = btn.textContent;
  btn.textContent = '✅ Alerted!';
  btn.style.transform = 'scale(0.95)';

  const toast = document.createElement('div');
  toast.innerHTML = '🏘️ <strong>3 nearby neighbors alerted!</strong> Help is on the way.';
  toast.style.cssText = [
    'position:fixed','top:24px','left:50%','transform:translateX(-50%) translateY(-20px)',
    'background:rgba(10,18,35,0.97)','border:1px solid rgba(159,122,234,0.5)',
    'color:#e8edf7','padding:14px 28px','border-radius:999px',
    'font-size:0.88rem','font-weight:600','z-index:99999',
    'box-shadow:0 8px 40px rgba(0,0,0,0.5),0 0 20px rgba(159,122,234,0.3)',
    'backdrop-filter:blur(16px)',
    'transition:opacity 0.4s ease,transform 0.4s ease','opacity:0'
  ].join(';');
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-12px)';
    setTimeout(() => toast.remove(), 400);
  }, 4000);

  setTimeout(() => {
    btn.textContent = orig;
    btn.style.transform = '';
  }, 3000);
}

// ── Post type chip selection ──────────────────────────────────
function selectPostType(btn) {
  document.querySelectorAll('.post-type-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
}

// ── Photo picker ───────────────────────────────────────────────
function openPhotoPicker() {
  const inp = document.getElementById('photoFileInput');
  if (inp) inp.click();
}

function handlePhotoSelected(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img  = document.getElementById('photoPreviewImg');
    const area = document.getElementById('photoPreviewArea');
    const btn  = document.getElementById('photoBtn');
    if (img)  img.src = e.target.result;
    if (area) area.style.display = 'block';
    if (btn)  { btn.textContent = '📷 Photo ✓'; btn.style.borderColor = '#22c55e'; btn.style.color = '#22c55e'; }
    window._composePhoto = e.target.result;
  };
  reader.readAsDataURL(file);
}

function removePhoto() {
  const img  = document.getElementById('photoPreviewImg');
  const area = document.getElementById('photoPreviewArea');
  const inp  = document.getElementById('photoFileInput');
  const btn  = document.getElementById('photoBtn');
  if (img)  img.src = '';
  if (area) area.style.display = 'none';
  if (inp)  inp.value = '';
  if (btn)  { btn.textContent = '📷 Photo'; btn.style.borderColor = ''; btn.style.color = ''; }
  window._composePhoto = null;
}

// ── Location attach ────────────────────────────────────────────
function attachLocation() {
  const btn  = document.getElementById('locationBtn2');
  const area = document.getElementById('locationTagArea');
  const text = document.getElementById('locationTagText');
  if (!navigator.geolocation) {
    if (text) text.textContent = 'Location not supported';
    if (area) { area.style.display = 'flex'; }
    return;
  }
  if (btn) { btn.textContent = '📍 Locating…'; btn.disabled = true; }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude.toFixed(4);
      const lng = pos.coords.longitude.toFixed(4);
      window._composeLocation = { lat, lng, label: `${lat}, ${lng}` };
      // Try reverse geocode label via Nominatim (no API key needed)
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        .then(r => r.json())
        .then(d => {
          const label = d.address && (d.address.suburb || d.address.neighbourhood || d.address.city || d.address.town) || `${lat}, ${lng}`;
          window._composeLocation.label = label;
          if (text) text.textContent = label;
        })
        .catch(() => { if (text) text.textContent = `${lat}, ${lng}`; });
      if (text) text.textContent = `${lat}, ${lng}`;
      if (area) { area.style.display = 'flex'; }
      if (btn)  { btn.textContent = '📍 Location ✓'; btn.style.borderColor = '#22c55e'; btn.style.color = '#22c55e'; btn.disabled = false; }
    },
    () => {
      if (btn) { btn.textContent = '📍 Location'; btn.disabled = false; }
      alert('Location access denied. Please allow location permission in your browser.');
    },
    { timeout: 8000 }
  );
}

function removeLocation() {
  const area = document.getElementById('locationTagArea');
  const btn  = document.getElementById('locationBtn2');
  if (area) area.style.display = 'none';
  if (btn)  { btn.textContent = '📍 Location'; btn.style.borderColor = ''; btn.style.color = ''; }
  window._composeLocation = null;
}


// ── Compose Post submit – actually posts to feed ──────────────
function postToFeed() {
  const ta  = document.getElementById('composeText');
  const text = ta ? ta.value.trim() : '';
  if (!text) {
    if (ta) { ta.focus(); ta.placeholder = '⚠️ Please write something first!'; }
    return;
  }

  const postBtn = document.querySelector('.compose-post-btn');

  // Get selected tag chip
  const activeChip = document.querySelector('.post-type-chip.active');
  const badgeType  = activeChip ? activeChip.dataset.badge  : 'community';
  const typeLabel  = activeChip ? activeChip.textContent.trim() : '👥 Community';

  // Badge colour map
  const badgeClass = { community:'community', alert:'alert', event:'event', service:'service' };
  const bc = badgeClass[badgeType] || 'community';

  // Author info
  const authorInitial = window.userLoginName ? window.userLoginName.charAt(0).toUpperCase() : 'ME';
  const authorName    = window.userLoginName  || 'You';
  const authorEmail   = window.userLoginEmail || '';

  // Timestamp
  const now  = new Date();
  const time = 'Just now · 📍 Your neighbourhood';

  // Avatar colour (cycle)
  const avColors = ['av-blue','av-purple','av-green','av-orange','av-pink'];
  const avClass  = avColors[Math.floor(Math.random() * avColors.length)];

  // Build card HTML
  const card = document.createElement('div');
  card.className = 'feed-card';
  card.style.cssText = '--rotate:0deg; --translateY:0px; --delay:0s; opacity:0; transform:translateY(-20px); transition:opacity 0.4s ease, transform 0.4s ease;';
  // Photo and location extras
  const photoSrc  = window._composePhoto    || null;
  const locLabel  = window._composeLocation ? window._composeLocation.label : null;
  const photoHtml = photoSrc ? '<img src="'+photoSrc+'" style="width:100%;border-radius:10px;margin:10px 0;object-fit:cover;max-height:220px;border:1px solid rgba(79,143,255,0.15);" />' : '';
  const locHtml   = locLabel ? '<div style="font-size:0.74rem;color:#4f8fff;margin:4px 0 8px;">📍 '+locLabel+'</div>' : '';

  card.innerHTML =
    '<div class="post-header">'
    + '<div class="post-avatar '+avClass+'">'+authorInitial+'</div>'
    + '<div class="post-meta"><span class="post-username">'+authorName+'</span><span class="post-time">'+time+'</span></div>'
    + '<span class="post-badge '+bc+'">'+typeLabel+'</span>'
    + '</div>'
    + locHtml
    + '<p class="post-text">'+text.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</p>'
    + photoHtml
    + '<div class="post-actions">'
    + '<button class="post-action-btn liked">❤️ 1</button>'
    + '<button class="post-action-btn">💬 0</button>'
    + '<button class="post-action-btn">🤝 Helpful</button>'
    + '<button class="post-action-btn">🔔 Remind</button>'
    + '<button class="post-action-btn">↗ Share</button>'
    + '</div>';

  // Prepend to feed
  const feedContainer = document.querySelector('.feed-container');
  if (feedContainer) {
    feedContainer.insertBefore(card, feedContainer.firstChild);
    requestAnimationFrame(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
  }

  // Button feedback
  postBtn.textContent = '✓ Posted!';
  postBtn.style.background = 'linear-gradient(135deg, #22c55e, #166534)';

  setTimeout(() => {
    closeComposeModal();
    showSection('feed');
    postBtn.textContent = 'Post';
    postBtn.style.background = '';
    ta.value = '';
    ta.placeholder = "What's happening in your neighborhood?";
    // Reset chips, photo, location
    document.querySelectorAll('.post-type-chip').forEach(c => c.classList.remove('active'));
    const firstChip = document.querySelector('.post-type-chip');
    if (firstChip) firstChip.classList.add('active');
    removePhoto();
    removeLocation();
  }, 900);
}

// ── Intersection observer for float-card reveals ───────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = '';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.float-card, .feed-card, .feature-card').forEach(el => {
  observer.observe(el);
});

// ── Initial screen (respect URL hash if present) ──────────────
(function() {
  var hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) {
    showSection(hash);
  } else {
    showSection('hero');
  }
})();


/* ==========================================================
   AUTH / LOGIN SYSTEM
   ========================================================== */

function requestOtp() {
  const name = document.getElementById('authName').value.trim();
  const email = document.getElementById('authEmail').value.trim();
  const btn = document.getElementById('sendOtpBtn');
  
  if (!name || !email) {
    alert('Please enter your name and email');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Sending...';

  fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      document.getElementById('authStep1').style.display = 'none';
      document.getElementById('authStep2').style.display = 'block';
      document.getElementById('authOtp').focus();
    } else {
      alert(data.message || 'Failed to send OTP');
      btn.disabled = false;
      btn.textContent = 'Send Login Code';
    }
  })
  .catch(err => {
    console.error(err);
    alert('Network error. Is the server running?');
    btn.disabled = false;
    btn.textContent = 'Send Login Code';
  });
}

function resetLogin() {
  document.getElementById('authStep2').style.display = 'none';
  document.getElementById('authStep1').style.display = 'block';
  document.getElementById('sendOtpBtn').disabled = false;
  document.getElementById('sendOtpBtn').textContent = 'Send Login Code';
  document.getElementById('authOtp').value = '';
}

function getLocation() {
  const btn = document.getElementById('locationBtn');
  const statusText = document.getElementById('locationStatus');
  const subBtn = document.getElementById('loginSubmitBtn');
  const latInput = document.getElementById('authLat');
  const lngInput = document.getElementById('authLng');

  if (!navigator.geolocation) {
    statusText.textContent = 'Geolocation is not supported by your browser';
    statusText.style.color = '#f87171';
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span>?</span> <span>Locating...</span>';
  statusText.textContent = 'Requesting permission...';

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      latInput.value = pos.coords.latitude;
      lngInput.value = pos.coords.longitude;
      
      btn.innerHTML = '<span>?</span> <span>Location Verified</span>';
      btn.style.borderColor = '#22c55e';
      btn.style.color = '#22c55e';
      statusText.textContent = 'Location acquired successfully';
      statusText.style.color = '#22c55e';
      subBtn.disabled = false; // Enable login button
    },
    (err) => {
      console.warn('Geolocation error:', err);
      // Fallback for demo if blocked
      btn.innerHTML = '<span>??</span> <span>Using Default Demo Location</span>';
      btn.style.borderColor = '#fbbf24';
      btn.style.color = '#fbbf24';
      statusText.textContent = 'Using demo location (Sector 15)';
      statusText.style.color = '#fbbf24';
      
      latInput.value = '28.6139';
      lngInput.value = '77.2090';
      subBtn.disabled = false;
    },
    { timeout: 10000 }
  );
}

function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('authEmail').value.trim();
  const otp = document.getElementById('authOtp').value.trim();
  const lat = parseFloat(document.getElementById('authLat').value);
  const lng = parseFloat(document.getElementById('authLng').value);
  const btn = document.getElementById('loginSubmitBtn');

  if (!otp || otp.length < 6) {
    alert('Please enter a valid 6-digit OTP');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Verifying...';

  fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      const token = data.data.token;
      localStorage.setItem('localconnect_token', token);
      btn.textContent = 'Success!';
      btn.style.background = 'linear-gradient(135deg, #22c55e, #166534)';
      
      // Update user location in background if we have it
      if (lat && lng) {
        fetch('/api/users/location', {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ latitude: lat, longitude: lng })
        });
      }

      // Go to feed
      setTimeout(() => {
        showSection('feed');
        // Hide login button, show user profile pill with email
        document.querySelector('.nav-cta').style.display = 'none';
        const navLinks = document.querySelector('.nav-links');
        const existing = navLinks.querySelector('.user-nav-pill');
        if (existing) existing.remove();
        const li = document.createElement('li');
        li.className = 'user-nav-pill';
        const initials   = data.data.user.name ? data.data.user.name.charAt(0).toUpperCase() : '?';
        const emailVal   = data.data.user.email || '';
        const shortEmail = emailVal.length > 18 ? emailVal.substring(0,16) + '…' : emailVal;
        li.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:5px 14px 5px 6px;border-radius:999px;background:rgba(79,143,255,0.1);border:1px solid rgba(79,143,255,0.2);cursor:pointer;" title="' + emailVal + '" onclick="showSection(\\\'emergency-profile\\\')">'
          + '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#4f8fff,#9f7aea);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem;flex-shrink:0;">' + initials + '</div>'
          + '<span style="font-size:0.75rem;font-weight:600;color:#a0bcff;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + shortEmail + '</span>'
          + '</div>';
        navLinks.appendChild(li);
        // Store login info for map marker
        window.userLoginName  = data.data.user.name || 'You';
        window.userLoginEmail = emailVal;
        
        // Update User Profile Screen
        const profileAvatarBig = document.getElementById('profileAvatarBig');
        const profileNameBig = document.getElementById('profileNameBig');
        const profileEmailVal = document.getElementById('profileEmailVal');
        const profilePhoneVal = document.getElementById('profilePhoneVal');
        if (profileAvatarBig) profileAvatarBig.textContent = initials;
        if (profileNameBig) profileNameBig.textContent = window.userLoginName;
        if (profileEmailVal) profileEmailVal.textContent = emailVal;
        if (profilePhoneVal && data.data.user.phone) profilePhoneVal.textContent = data.data.user.phone;

        if (lat && lng) {
          window.userLoginLocation = [lng, lat];
          if (window._mapAddUserMarker) window._mapAddUserMarker([lng, lat], window.userLoginName, emailVal);
        }
      }, 1000);
    } else {
      alert(data.message || 'Invalid OTP');
      btn.disabled = false;
      btn.textContent = 'Log In';
    }
  })
  .catch(err => {
    console.error(err);
    alert('Network error during login');
    btn.disabled = false;
    btn.textContent = 'Log In';
  });
}

/* ==========================================================
   INTERACTIVE 3D MAP ENGINE
   ========================================================== */

function init3DMap() {
  const mapContainer = document.getElementById('mapContainer');
  if (!mapContainer || typeof maplibregl === 'undefined') return;

  // Set default center (New Delhi)
  const defaultCenter = [77.2090, 28.6139]; 
  
  const map = new maplibregl.Map({
    container: 'mapContainer',
    // CartoDB Dark Matter – free public vector tiles that fit the dark theme beautifully
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: defaultCenter, 
    zoom: 15,
    pitch: 60,       // Angle to create 3D effect
    bearing: -17,    // Slight rotation
    antialias: true,
    interactive: true
  });

  // Try to locate user natively
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      map.flyTo({
        center: [pos.coords.longitude, pos.coords.latitude],
        zoom: 15.5,
        speed: 1.2,
        curve: 1.42
      });
    }, () => {
      console.log('Location access denied. Using default center.');
    });
  }

  map.on('load', () => {

    // ── Inject CSS for markers ────────────────────────────
    if (!document.getElementById('markerPulseCss')) {
      const style = document.createElement('style');
      style.id = 'markerPulseCss';
      style.innerHTML = `
        @keyframes pulseMarker {
          0%   { transform:scale(0.85); box-shadow:0 0 0 0 rgba(79,143,255,0.8); }
          70%  { transform:scale(1);    box-shadow:0 0 0 20px rgba(79,143,255,0); }
          100% { transform:scale(0.85); box-shadow:0 0 0 0 rgba(79,143,255,0); }
        }
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .im-here-bubble { display:flex; flex-direction:column; align-items:center; animation:fadeInUp 0.4s ease; cursor:default; }
        .im-here-dot { width:16px;height:16px;border-radius:50%;background:#4f8fff;box-shadow:0 0 0 0 rgba(79,143,255,0.7);animation:pulseMarker 2s infinite ease-out;position:relative;z-index:2; }
        .im-here-label { background:rgba(10,18,35,0.93);border:1px solid rgba(79,143,255,0.4);border-radius:10px;padding:6px 10px;margin-bottom:5px;white-space:nowrap;backdrop-filter:blur(8px);box-shadow:0 4px 20px rgba(0,0,0,0.5),0 0 16px rgba(79,143,255,0.2); }
        .im-here-label .ihl-name  { display:block;font-size:0.7rem;font-weight:800;color:#e8edf7;letter-spacing:0.02em; }
        .im-here-label .ihl-email { display:block;font-size:0.6rem;color:#4f8fff;margin-top:1px; }
        .im-here-label .ihl-tag   { display:block;font-size:0.58rem;color:#22c55e;font-weight:700;margin-top:2px;letter-spacing:0.06em; }
        .im-here-caret { width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid rgba(79,143,255,0.4);margin-top:-1px;z-index:1; }
        .community-count-badge { position:absolute;top:12px;left:12px;z-index:20;background:rgba(10,18,35,0.88);border:1px solid rgba(34,197,94,0.35);border-radius:12px;padding:7px 12px;backdrop-filter:blur(10px);box-shadow:0 4px 20px rgba(0,0,0,0.5);display:flex;align-items:center;gap:8px;animation:fadeInUp 0.6s 0.5s ease both; }
        .ccb-dot  { width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;animation:blinkLive 1.2s ease-in-out infinite; }
        .ccb-text { font-size:0.72rem;font-weight:700;color:#e8edf7; }
        .ccb-sub  { font-size:0.6rem;color:#4a6080;margin-top:1px; }
      `;
      document.head.appendChild(style);
    }

    // ── Community count badge on map container ────────────
    const mapBox = document.getElementById('homeMap');
    if (mapBox && !mapBox.querySelector('.community-count-badge')) {
      const badge = document.createElement('div');
      badge.className = 'community-count-badge';
      badge.innerHTML = '<div class="ccb-dot"></div><div><div class="ccb-text">47 people nearby</div><div class="ccb-sub">in your community</div></div>';
      mapBox.appendChild(badge);
    }

    // ── Build "I'm Here" bubble element ──────────────────
    function buildHereBubble(name, email) {
      const wrap = document.createElement('div');
      wrap.className = 'im-here-bubble';
      const initials    = name  ? name.charAt(0).toUpperCase()  : '?';
      const display     = email ? email : (name || 'You');
      const shortDisplay = display.length > 18 ? display.substring(0,16) + '…' : display;
      wrap.innerHTML =
        '<div class="im-here-label">'
        + '<span class="ihl-name">' + (name || 'You') + '</span>'
        + '<span class="ihl-email">' + shortDisplay + '</span>'
        + '<span class="ihl-tag">📍 I\'m here</span>'
        + '</div>'
        + '<div class="im-here-caret"></div>'
        + '<div class="im-here-dot"></div>';
      return wrap;
    }

    // ── User marker (moves to real location) ─────────────
    let userMarkerObj = null;

    function placeUserMarker(lngLat, name, email) {
      if (userMarkerObj) userMarkerObj.remove();
      const el = buildHereBubble(name, email);
      userMarkerObj = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(lngLat)
        .addTo(map);
    }

    // Expose so login handler can update it live
    window._mapAddUserMarker = placeUserMarker;

    // Place initial marker
    const initLoc  = window.userLoginLocation || defaultCenter;
    const initName = window.userLoginName     || 'You';
    const initMail = window.userLoginEmail    || '';
    placeUserMarker(initLoc, initName, initMail);

    // Refine with GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const loc = [pos.coords.longitude, pos.coords.latitude];
        map.flyTo({ center: loc, zoom: 15.5, speed: 1.2, curve: 1.42 });
        placeUserMarker(loc, window.userLoginName || 'You', window.userLoginEmail || '');
      }, () => {
        if (window.userLoginLocation) {
          map.flyTo({ center: window.userLoginLocation, zoom: 15.5, speed: 1 });
        }
      });
    }

    // ── Neighbour dots with popups ────────────────────────
    const neighbors = [
      { c: [defaultCenter[0]+0.0022, defaultCenter[1]+0.0011], color:'#22c55e', label:'Sara M.'   },
      { c: [defaultCenter[0]-0.0031, defaultCenter[1]-0.0018], color:'#9f7aea', label:'Priya R.'  },
      { c: [defaultCenter[0]+0.0013, defaultCenter[1]-0.0038], color:'#fbbf24', label:'Dev J.'    },
      { c: [defaultCenter[0]-0.0019, defaultCenter[1]+0.0029], color:'#f87171', label:'Rahul K.'  },
      { c: [defaultCenter[0]+0.0041, defaultCenter[1]-0.0012], color:'#34d399', label:'Ananya N.' },
    ];
    neighbors.forEach(n => {
      const nel = document.createElement('div');
      nel.title = n.label;
      nel.style.cssText = 'width:12px;height:12px;border-radius:50%;background:' + n.color + ';box-shadow:0 0 10px ' + n.color + ';border:2px solid rgba(255,255,255,0.15);cursor:pointer;';
      new maplibregl.Marker({ element: nel })
        .setLngLat(n.c)
        .setPopup(new maplibregl.Popup({ offset:14, closeButton:false })
          .setHTML('<div style="font-family:Inter,sans-serif;font-size:0.78rem;font-weight:700;color:#e8edf7;padding:4px 6px;">' + n.label + '</div>'))
        .addTo(map);
    });

  });
}

// Ensure map is initialized once the JS is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init3DMap);
} else {
  init3DMap();
}

/* ==========================================================
   ADMIN DASHBOARD ENGINE
   ========================================================== */

let adminInitialized = false;

function initAdminDashboard() {
  if (adminInitialized) return;
  adminInitialized = true;

  // ── KPI counter roll-up ──────────────────────────────────
  const kpis = [
    { id: 'kpiUsers',          target: 48312 },
    { id: 'kpiNeighbourhoods', target: 284   },
    { id: 'kpiOrders',         target: 6741  },
    { id: 'kpiSos',            target: 17    },
    { id: 'kpiResponse',       target: 12    },
  ];

  kpis.forEach(({ id, target }) => {
    const el = document.getElementById(id);
    if (!el) return;
    let current = 0;
    const step  = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString();
      if (current >= target) clearInterval(timer);
    }, 25);
  });

  // ── Traffic Chart (SVG) ──────────────────────────────────
  const rawData = [42, 65, 58, 80, 73, 91, 87]; // 0-100 normalised
  const maxH    = 110;
  const xStep   = 70;
  const points  = rawData.map((v, i) => `${i * xStep},${maxH - (v / 100) * maxH}`);

  const lineEl = document.getElementById('chartLine');
  const fillEl = document.getElementById('chartFill');
  if (lineEl) lineEl.setAttribute('points', points.join(' '));
  if (fillEl) {
    const first = points[0];
    const last  = points[points.length - 1];
    const px    = last.split(',')[0];
    fillEl.setAttribute('d',
      `M${first} ` + points.slice(1).map(p => `L${p}`).join(' ') +
      ` L${px},${maxH + 5} L0,${maxH + 5} Z`
    );
  }

  // ── Live Activity Ticker ─────────────────────────────────
  const demoEvents = [
    { color:'#22c55e', text:'New user joined – Jayanagar' },
    { color:'#4f8fff', text:'Order #5012 placed – Whitefield' },
    { color:'#f87171', text:'SOS alert – Koramangala (resolved)' },
    { color:'#9f7aea', text:'New service provider registered' },
    { color:'#fbbf24', text:'Post flagged – Community section' },
    { color:'#34d399', text:'Safety profile updated – HSR Layout' },
    { color:'#4f8fff', text:'Order #5013 placed – Indiranagar' },
    { color:'#22c55e', text:'New user joined – Marathahalli' },
  ];
  let evtIdx = 0;

  setInterval(() => {
    const list = document.getElementById('adminActivityList');
    if (!list) return;
    const e   = demoEvents[evtIdx % demoEvents.length];
    evtIdx++;
    const now  = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;

    const li = document.createElement('li');
    li.className = 'activity-item';
    li.style.animation = 'modalSlideUp 0.4s ease';
    li.innerHTML = `
      <span class="act-dot" style="background:${e.color};"></span>
      <div>
        <span class="act-title">${e.text}</span>
        <span class="act-time">Just now · ${time}</span>
      </div>`;

    list.insertBefore(li, list.firstChild);
    if (list.children.length > 8) list.removeChild(list.lastChild);
  }, 8000);
}

// Patch showSection to init admin when navigating there
const _origShowSection = showSection;
window.showSection = function(id) {
  _origShowSection(id);
  if (id === 'admin') initAdminDashboard();
};

/* ==========================================================
   ADMIN PASSWORD MODAL
   ========================================================== */

const ADMIN_PASSWORD = 'admin@123';

function openAdminLogin() {
  const modal = document.getElementById('adminLoginModal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.getElementById('adminPassInput').value = '';
  document.getElementById('adminPassError').style.display = 'none';
  setTimeout(() => document.getElementById('adminPassInput').focus(), 100);
}

function closeAdminLogin() {
  const modal = document.getElementById('adminLoginModal');
  if (modal) modal.style.display = 'none';
}

function verifyAdminPass() {
  const input = document.getElementById('adminPassInput').value;
  const errEl = document.getElementById('adminPassError');
  if (input === ADMIN_PASSWORD) {
    closeAdminLogin();
    showSection('admin');
  } else {
    errEl.style.display = 'block';
    const inp = document.getElementById('adminPassInput');
    inp.style.borderColor = '#f87171';
    setTimeout(() => {
      inp.style.borderColor = 'rgba(159,122,234,0.3)';
    }, 1500);
  }
}

// Close modal on backdrop click
document.addEventListener('click', e => {
  const modal = document.getElementById('adminLoginModal');
  if (modal && e.target === modal) closeAdminLogin();
});

// Close modal on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAdminLogin();
});

/* ==========================================================
   PROFILE EDIT & SETTINGS MODALS
   ========================================================== */
function openProfileEditModal() {
  const modal = document.getElementById('profileEditModal');
  if (!modal) return;
  modal.classList.add('open');
  
  // Pre-fill input fields
  document.getElementById('editProfileName').value = document.getElementById('profileNameBig').textContent;
  document.getElementById('editProfileEmail').value = document.getElementById('profileEmailVal').textContent;
  document.getElementById('editProfilePhone').value = document.getElementById('profilePhoneVal').textContent || '';
  
  const currentEmergency = document.getElementById('profileEmergencyVal').textContent;
  document.getElementById('editProfileEmergency').value = currentEmergency === 'Not Set' ? '' : currentEmergency;
}

function closeProfileEditModal(e) {
  const modal = document.getElementById('profileEditModal');
  if (!modal) return;
  // If e is passed, ensure we only close if clicking exactly on overlay or close button
  if (!e || e.target === modal || e.target.classList.contains('modal-close')) {
    modal.classList.remove('open');
  }
}

function saveProfileEdit() {
  const btn = document.querySelector('#profileEditModal .compose-post-btn');
  btn.textContent = 'Saving...';
  btn.disabled = true;

  setTimeout(() => {
    // Update DOM elements manually to simulate setting the settings
    document.getElementById('profileNameBig').textContent = document.getElementById('editProfileName').value || 'User Name';
    document.getElementById('profileEmailVal').textContent = document.getElementById('editProfileEmail').value || 'Not Set';
    document.getElementById('profilePhoneVal').textContent = document.getElementById('editProfilePhone').value || 'Not Set';
    
    const emergencyVal = document.getElementById('editProfileEmergency').value;
    document.getElementById('profileEmergencyVal').textContent = emergencyVal || 'Not Set';
    
    // Update global state if name/email changed (for comments/map)
    window.userLoginName = document.getElementById('editProfileName').value;
    window.userLoginEmail = document.getElementById('editProfileEmail').value;
    const initials = window.userLoginName ? window.userLoginName.charAt(0).toUpperCase() : '?';
    
    const avatar = document.getElementById('profileAvatarBig');
    if(avatar) avatar.textContent = initials;
    
    // reset button
    btn.textContent = '✓ Saved!';
    btn.style.background = 'linear-gradient(135deg, #22c55e, #166534)';
    
    setTimeout(() => {
      closeProfileEditModal();
      btn.textContent = 'Save Changes';
      btn.style.background = '';
      btn.disabled = false;
    }, 800);
  }, 400);
}

function openSettingsModal() {
  const modal = document.getElementById('profileSettingsModal');
  if (!modal) return;
  modal.classList.add('open');
}

function closeSettingsModal(e) {
  const modal = document.getElementById('profileSettingsModal');
  if (!modal) return;
  if (!e || e.target === modal || e.target.classList.contains('modal-close')) {
    modal.classList.remove('open');
  }
}

function saveSettings() {
  const btn = document.querySelector('#profileSettingsModal .compose-post-btn');
  btn.textContent = 'Saving...';
  btn.disabled = true;

  setTimeout(() => {
    const notifs = document.getElementById('settingNotifs').checked;
    document.getElementById('profileNotifSettings').textContent = notifs ? 'All Alerts Enabled' : 'Alerts Disabled';
    
    btn.textContent = '✓ Saved!';
    btn.style.background = 'linear-gradient(135deg, #22c55e, #166534)';
    
    setTimeout(() => {
      closeSettingsModal();
      btn.textContent = 'Save Settings';
      btn.style.background = '';
      btn.disabled = false;
    }, 800);
  }, 400);
}

/* ==========================================================
   MARKETPLACE – PROVIDER PROFILES & ADD SKILLS
   ========================================================== */

// ── Provider data store (seeded + user-added) ────────────────
const PROVIDER_DB = {
  plumbing: [
    { name:'Ramesh Kumar',    phone:'+91 98400 12345', rating:4.9, reviews:128, dist:'0.8 km', jobs:212, exp:'7 yrs', spec:'Emergency & pipe repair,    bathrooms', avail:'Mon–Sat' },
    { name:'Vikram Singh',    phone:'+91 87200 67890', rating:4.7, reviews:94,  dist:'1.1 km', jobs:145, exp:'5 yrs', spec:'Bathroom fitting & waterproofing', avail:'Mon–Fri' },
    { name:'Suresh Nair',     phone:'+91 76543 21098', rating:4.8, reviews:63,  dist:'1.5 km', jobs:89,  exp:'9 yrs', spec:'Gas lines & hot water systems', avail:'All days' },
    { name:'Arjun Patel',     phone:'+91 90000 33445', rating:4.6, reviews:52,  dist:'2.0 km', jobs:67,  exp:'3 yrs', spec:'Leakage & drainage repairs',     avail:'Weekdays' },
  ],
  electrical: [
    { name:'Anil Sharma',     phone:'+91 99800 44556', rating:4.8, reviews:96,  dist:'1.2 km', jobs:176, exp:'10 yrs', spec:'Home wiring & circuit boards', avail:'Mon–Sat' },
    { name:'Deepak Yadav',    phone:'+91 88700 55667', rating:4.9, reviews:71,  dist:'0.9 km', jobs:134, exp:'6 yrs',  spec:'Inverter & solar panel setup', avail:'All days' },
    { name:'Mohan Verma',     phone:'+91 77600 66778', rating:4.6, reviews:48,  dist:'1.8 km', jobs:95,  exp:'4 yrs',  spec:'Fan, AC & appliance wiring',   avail:'Weekdays' },
    { name:'Kiran Reddy',     phone:'+91 66500 77889', rating:4.7, reviews:55,  dist:'2.3 km', jobs:78,  exp:'8 yrs',  spec:'CCTV & smart home wiring',    avail:'Mon–Fri' },
  ],
  food: [
    { name:'Meena Iyer',      phone:'+91 95500 11223', rating:5.0, reviews:312, dist:'0.3 km', jobs:560, exp:'8 yrs', spec:'South Indian, tiffin service', avail:'Daily 7–10 AM' },
    { name:'Sunita Devi',     phone:'+91 84400 22334', rating:4.9, reviews:189, dist:'0.6 km', jobs:324, exp:'5 yrs', spec:'North Indian, home-style meals', avail:'Mon–Sat' },
    { name:'Fatima Begum',    phone:'+91 73300 33445', rating:4.8, reviews:142, dist:'1.0 km', jobs:201, exp:'6 yrs', spec:'Biryani & Mughlai specialties',   avail:'All days' },
    { name:'Kavitha Pillai',  phone:'+91 62200 44556', rating:4.7, reviews:98,  dist:'1.4 km', jobs:167, exp:'4 yrs', spec:'Healthy salads & juice bar',     avail:'5 days/wk' },
  ],
  delivery: [
    { name:'Rohit Gupta',     phone:'+91 91100 55667', rating:4.7, reviews:87,  dist:'0.5 km', jobs:890, exp:'3 yrs', spec:'Grocery & medicine delivery', avail:'7 AM–9 PM' },
    { name:'Sanjay Mishra',   phone:'+91 80000 66778', rating:4.8, reviews:214, dist:'0.7 km', jobs:1240,exp:'5 yrs', spec:'Parcel & courier pickup',       avail:'All days' },
    { name:'Pradeep Tiwari',  phone:'+91 79900 77889', rating:4.6, reviews:56,  dist:'1.0 km', jobs:432, exp:'2 yrs', spec:'Food & restaurant orders',      avail:'Mon–Sat' },
    { name:'Anand Joshi',     phone:'+91 68800 88990', rating:4.9, reviews:125, dist:'1.3 km', jobs:678, exp:'4 yrs', spec:'Cash on delivery & returns',    avail:'8 AM–8 PM' },
  ],
  tutoring: [
    { name:'Dr. Priya Iyer',  phone:'+91 97700 99001', rating:4.9, reviews:54,  dist:'1.0 km', jobs:320, exp:'12 yrs', spec:'Maths, Physics, Chemistry Gr 6–10', avail:'Mon–Fri 4–8 PM' },
    { name:'Rahul Bhat',      phone:'+91 86600 00112', rating:4.8, reviews:38,  dist:'1.4 km', jobs:210, exp:'7 yrs',  spec:'Science & Computer Science',       avail:'Weekends' },
    { name:'Ananya Singh',    phone:'+91 75500 11223', rating:4.7, reviews:29,  dist:'1.8 km', jobs:145, exp:'5 yrs',  spec:'English Literature & Hindi',        avail:'Evenings' },
    { name:'Sudhir Rao',      phone:'+91 64400 22334', rating:4.9, reviews:61,  dist:'2.1 km', jobs:387, exp:'15 yrs', spec:'IIT-JEE & NEET coaching',          avail:'All days' },
  ],
  cleaning: [
    { name:'Geeta Bai',       phone:'+91 93300 33445', rating:4.8, reviews:142, dist:'2.1 km', jobs:567, exp:'8 yrs', spec:'Deep home & bathroom cleaning',   avail:'Mon–Sat' },
    { name:'Laxmi Singh',     phone:'+91 82200 44556', rating:4.7, reviews:98,  dist:'1.5 km', jobs:345, exp:'5 yrs', spec:'Kitchen & floor scrubbing',        avail:'All days' },
    { name:'Kamla Devi',      phone:'+91 71100 55667', rating:4.9, reviews:67,  dist:'0.9 km', jobs:234, exp:'10 yrs', spec:'Post-construction cleanup',       avail:'Weekdays' },
    { name:'Savita Patil',    phone:'+91 60000 66778', rating:4.6, reviews:45,  dist:'2.5 km', jobs:178, exp:'4 yrs', spec:'Sofa & carpet steamers',          avail:'Weekends' },
  ],
  beauty: [
    { name:'Ritu Kapoor',     phone:'+91 99000 77889', rating:4.9, reviews:78,  dist:'0.9 km', jobs:423, exp:'9 yrs', spec:'Bridal & party makeup, pedicure',  avail:'All days' },
    { name:'Deepa Nair',      phone:'+91 88000 88990', rating:4.8, reviews:64,  dist:'1.1 km', jobs:298, exp:'6 yrs', spec:'Hair color, keratin & spa',        avail:'Mon–Sat' },
    { name:'Pooja Menon',     phone:'+91 77000 99001', rating:4.7, reviews:48,  dist:'1.6 km', jobs:201, exp:'4 yrs', spec:'Eyebrow threading & waxing',      avail:'Weekdays' },
    { name:'Asha Chandra',    phone:'+91 66000 00112', rating:4.9, reviews:91,  dist:'0.7 km', jobs:512, exp:'11 yrs', spec:'Ayurveda body massage & facials', avail:'All days' },
  ],
};

// Avatar colors per initial letter
const AV_COLORS = ['#4f8fff','#9f7aea','#22c55e','#f59e0b','#f87171','#06b6d4','#ec4899'];
function avatarColor(name) { return AV_COLORS[name.charCodeAt(0) % AV_COLORS.length]; }

// ── Open Provider Modal ───────────────────────────────────────
function openProviderModal(card) {
  const cat     = card.dataset.cat     || 'plumbing';
  const service = card.dataset.service || 'Service';
  const price   = card.dataset.price   || '';
  const rating  = card.dataset.rating  || '4.8';
  const reviews = card.dataset.reviews || '0';

  // Collect all providers for this category (seeded + user-added)
  const seedProviders = PROVIDER_DB[cat] || PROVIDER_DB['plumbing'];
  const userAdded = (window._userProviders || []).filter(p => p.cat === cat);
  const providers = [...userAdded, ...seedProviders];

  // Title
  document.getElementById('providerModalTitle').textContent = service;
  document.getElementById('providerModalSubtitle').textContent =
    `${providers.length} providers available in your neighbourhood`;

  // Service stats bar
  document.getElementById('providerServiceBar').innerHTML = `
    <div class="psb-stat"><div class="psb-val">${price}</div><div class="psb-lbl">Starting Rate</div></div>
    <div class="psb-stat"><div class="psb-val">⭐ ${rating}</div><div class="psb-lbl">Avg Rating (${reviews})</div></div>
    <div class="psb-stat"><div class="psb-val">${providers.length}</div><div class="psb-lbl">Available Now</div></div>
    <div class="psb-stat"><div class="psb-val">✅</div><div class="psb-lbl">Verified Community</div></div>
  `;

  // Provider list
  const list = document.getElementById('providerList');
  list.innerHTML = '';

  providers.forEach((p, idx) => {
    const initials  = p.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
    const col       = avatarColor(p.name);
    const isOnline  = idx < 2; // first 2 shown as online
    const starBar   = '⭐'.repeat(Math.round(p.rating));
    const delay     = idx * 0.07;

    const el = document.createElement('div');
    el.className = 'provider-card';
    el.style.animationDelay = delay + 's';
    el.innerHTML = `
      <div class="provider-avatar" style="background:linear-gradient(135deg,${col}cc,${col}55)">
        ${initials}
        ${isOnline ? '<div class="provider-online-dot"></div>' : ''}
      </div>
      <div class="provider-info">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <div class="provider-name">${p.name}</div>
          <span class="provider-verified-badge">✅ Verified</span>
          ${isOnline ? '<span style="font-size:0.65rem;color:var(--green-300);font-weight:700;">● Online now</span>' : ''}
        </div>
        <div class="provider-skill">${p.spec}</div>
        <div class="provider-stats">
          <span class="provider-stat">⭐ <strong>${p.rating}</strong> (${p.reviews} reviews)</span>
          <span class="provider-stat">📍 <strong>${p.dist}</strong></span>
          <span class="provider-stat">🛠 <strong>${p.jobs}+</strong> jobs done</span>
          <span class="provider-stat">📅 <strong>${p.exp}</strong> exp</span>
          <span class="provider-stat">🕒 ${p.avail}</span>
        </div>
      </div>
      <div class="provider-actions">
        <button class="provider-call-btn" onclick="providerCall('${p.phone}')" title="Call ${p.name}">📞</button>
        <button class="provider-book-btn" onclick="providerBookNow('${p.name}', this)">Book</button>
      </div>
    `;
    list.appendChild(el);
  });

  document.getElementById('providerModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProviderModal(e) {
  if (e && e.target !== document.getElementById('providerModal')) return;
  document.getElementById('providerModal').classList.remove('open');
  document.body.style.overflow = '';
}

function providerCall(phone) {
  // On mobile this opens the dialer; on desktop shows a toast
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    window.location.href = 'tel:' + phone.replace(/\s/g,'');
  } else {
    showComingSoonMP('📞 Calling ' + phone + ' — opens your phone dialer on mobile!');
  }
}

function providerBookNow(name, btn) {
  const orig = btn.textContent;
  btn.textContent = '✓ Booked!';
  btn.style.background = 'linear-gradient(135deg,#22c55e,#166534)';
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.background = '';
  }, 2500);
  showComingSoonMP('🎉 Booking confirmed with ' + name + '!');
}

function showComingSoonMP(msg) {
  const old = document.getElementById('mpToast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.id = 'mpToast';
  t.textContent = msg;
  t.style.cssText = 'position:fixed;top:24px;left:50%;transform:translateX(-50%) translateY(-20px);background:rgba(10,18,35,0.97);border:1px solid rgba(79,143,255,0.35);color:#e8edf7;padding:12px 24px;border-radius:999px;font-size:0.85rem;font-weight:600;z-index:999999;box-shadow:0 8px 40px rgba(0,0,0,0.5);backdrop-filter:blur(16px);transition:opacity 0.3s,transform 0.3s;opacity:0;';
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)'; });
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(-10px)'; setTimeout(()=>t.remove(),300); }, 3000);
}

// ── Add Skill Modal ───────────────────────────────────────────
function openAddSkillModal() {
  document.getElementById('addSkillModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAddSkillModal(e) {
  if (e && e.target !== document.getElementById('addSkillModal')) return;
  document.getElementById('addSkillModal').classList.remove('open');
  document.body.style.overflow = '';
}

function toggleDay(btn) {
  btn.classList.toggle('active');
}

function submitSkillListing() {
  const name  = (document.getElementById('skillName').value  || '').trim();
  const phone = (document.getElementById('skillPhone').value || '').trim();
  const cat   = document.getElementById('skillCategory').value;
  const rate  = (document.getElementById('skillRate').value  || '').trim();
  const desc  = (document.getElementById('skillDesc').value  || '').trim();
  const exp   = document.getElementById('skillExp').value + '+ yrs';
  const btn   = document.getElementById('addSkillSubmitBtn');

  if (!name) { alert('Please enter your name.'); return; }
  if (!phone || !phone.includes('+')) { alert('Please enter a valid phone number starting with +91.'); return; }

  const days = [...document.querySelectorAll('.avail-day.active')].map(b => b.textContent).join(', ') || 'Flexible';

  // Add to in-memory store
  window._userProviders = window._userProviders || [];
  window._userProviders.push({
    name, phone,
    rating: 5.0, reviews: 1,
    dist: '< 1 km', jobs: 0,
    exp, spec: desc || 'Community provider',
    avail: days, cat,
    rate: rate || 'Negotiable',
    isNew: true
  });

  // Loading animation then success
  btn.disabled    = true;
  btn.textContent = '⏳ Listing…';

  setTimeout(() => {
    btn.textContent = '✅ Listed Successfully!';
    btn.style.background = 'linear-gradient(135deg,#22c55e,#166534)';

    // Inject a new card into the marketplace grid
    injectNewSkillCard({ name, cat, rate, desc, days });

    setTimeout(() => {
      closeAddSkillModal();
      btn.textContent = '🚀 List on Marketplace';
      btn.style.background = '';
      btn.disabled = false;
      // Reset form
      ['skillName','skillPhone','skillRate','skillDesc'].forEach(id => document.getElementById(id).value = '');
      document.querySelectorAll('.avail-day').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.avail-day').forEach((b, i) => { if (i < 5) b.classList.add('active'); });

      showComingSoonMP('🌟 Your skill is now live on the marketplace!');
    }, 1200);
  }, 800);
}

// Inject a new market card when user adds a skill
function injectNewSkillCard({ name, cat, rate, desc, days }) {
  const catEmoji = { plumbing:'🔧', electrical:'⚡', food:'🍱', delivery:'🚚', tutoring:'📚', cleaning:'🧹', beauty:'💄', other:'🛠' };
  const catLabel = { plumbing:'Plumbing', electrical:'Electrical', food:'Food', delivery:'Delivery', tutoring:'Tutoring', cleaning:'Cleaning', beauty:'Beauty', other:'Other' };
  const emoji = catEmoji[cat] || '🛠';
  const label = catLabel[cat] || 'Service';
  const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const col = avatarColor(name);

  const card = document.createElement('div');
  card.className = 'market-card float-card';
  card.dataset.cat = cat;
  card.dataset.service = desc || (name + "'s " + label + " Service");
  card.dataset.price = rate || 'Negotiable';
  card.dataset.rating = '5.0';
  card.dataset.reviews = '0';
  card.style.cssText = '--float-delay:0s; opacity:0; transform:translateY(20px); transition:opacity 0.5s,transform 0.5s;';
  card.setAttribute('onclick', 'openProviderModal(this)');
  card.innerHTML = `
    <div class="mc-img mc-img-${cat}" style="background:linear-gradient(135deg,${col}44,${col}22)">
      <div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,${col},${col}88);display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:800;color:#fff;">${initials}</div>
    </div>
    <div class="mc-body">
      <div class="mc-category">${label}</div>
      <h4 class="mc-title">${name}'s ${label} Service</h4>
      <div class="mc-meta">
        <span class="mc-price">${rate || 'Negotiable'}</span>
        <span class="mc-rating">⭐ New</span>
      </div>
      <div class="mc-footer">
        <span class="mc-distance">📍 &lt; 1 km · ${days}</span>
        <button class="mc-book-btn" onclick="event.stopPropagation();openProviderModal(this.closest('.market-card'))">View Profile</button>
      </div>
    </div>
    <div class="mc-provider-count">🆕 Community</div>
  `;
  const grid = document.getElementById('marketGrid');
  if (grid) {
    grid.insertBefore(card, grid.firstChild);
    requestAnimationFrame(() => { card.style.opacity='1'; card.style.transform='translateY(0)'; });
  }
}

// ── Marketplace category filter ────────────────────────────────
function filterCategory(btn, cat) {
  document.querySelectorAll('.category-pills .pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.querySelectorAll('.market-card').forEach(card => {
    if (cat === 'all' || card.dataset.cat === cat) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

// ── Marketplace text search ──────────────────────────────────
function filterMarketSearch(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('.market-card').forEach(card => {
    const text = (card.dataset.service || '') + ' ' + (card.dataset.cat || '');
    card.classList.toggle('hidden', q.length > 0 && !text.toLowerCase().includes(q));
  });
}

/* ==========================================================
   ADMIN DASHBOARD – QUICK ACTIONS
   ========================================================== */

// Helper: get stored JWT token (same key used by auth flow)
function getAdminToken() {
  return localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken') || '';
}

// Helper: admin API fetch wrapper
async function adminFetch(url, options = {}) {
  const token = getAdminToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || res.statusText);
  }
  return res.json();
}

// Helper: show a top toast
function adminToast(msg, color = '#4f8fff') {
  const old = document.getElementById('adminToastEl');
  if (old) old.remove();
  const t = document.createElement('div');
  t.id = 'adminToastEl';
  t.innerHTML = msg;
  t.style.cssText = [
    'position:fixed','top:20px','left:50%','transform:translateX(-50%) translateY(-18px)',
    `background:rgba(10,18,35,0.97)`,
    `border:1px solid ${color}55`,
    'color:#e8edf7','padding:12px 26px','border-radius:999px',
    'font-size:0.86rem','font-weight:600','z-index:99999',
    'box-shadow:0 8px 40px rgba(0,0,0,0.5)',
    'backdrop-filter:blur(16px)',
    'transition:opacity 0.35s ease,transform 0.35s ease','opacity:0',
    'max-width:90vw','text-align:center'
  ].join(';');
  document.body.appendChild(t);
  requestAnimationFrame(() => {
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(-12px)';
    setTimeout(() => t.remove(), 400);
  }, 4500);
}

// Helper: close any admin modal
function closeAdminModal(id, e) {
  if (e && e.target !== document.getElementById(id)) return;
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
  document.body.style.overflow = '';
}

// ── 1. BROADCAST ALERT ──────────────────────────────────────
let _broadcastType = 'general';

function openAdminBroadcast() {
  document.getElementById('broadcastTitle').value = '';
  document.getElementById('broadcastMsg').value   = '';
  document.getElementById('broadcastEmail').checked = false;
  _broadcastType = 'general';
  document.querySelectorAll('#broadcastTypePills .avail-day').forEach((b,i) => {
    b.classList.toggle('active', i === 0);
  });
  document.getElementById('adminBroadcastModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function setBroadcastType(btn, type) {
  _broadcastType = type;
  document.querySelectorAll('#broadcastTypePills .avail-day').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

async function sendAdminBroadcast() {
  const title   = (document.getElementById('broadcastTitle').value || '').trim();
  const message = (document.getElementById('broadcastMsg').value   || '').trim();
  const emailAll = document.getElementById('broadcastEmail').checked;
  const btn     = document.getElementById('broadcastSendBtn');

  if (!message) { adminToast('⚠️ Please write a message before broadcasting.', '#f59e0b'); return; }

  btn.disabled    = true;
  btn.textContent = '⏳ Sending…';

  try {
    const data = await adminFetch('/api/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type: _broadcastType, title, message, emailAll })
    });
    closeAdminModal('adminBroadcastModal');
    adminToast('✅ ' + (data.message || 'Broadcast sent!'), '#22c55e');
  } catch (err) {
    adminToast('❌ Broadcast failed: ' + err.message, '#f87171');
  } finally {
    btn.disabled    = false;
    btn.textContent = '📤 Send Broadcast';
  }
}

// ── 2. EXPORT REPORT ────────────────────────────────────────
async function adminExportReport(btn) {
  const orig = btn.textContent;
  btn.textContent = '⏳ Generating…';
  btn.disabled = true;

  try {
    const [users, posts] = await Promise.all([
      adminFetch('/api/admin/users'),
      adminFetch('/api/admin/posts')
    ]);

    // Build CSV
    let csv = 'LOCALCONNECT REPORT\n';
    csv += 'Generated,' + new Date().toLocaleString() + '\n\n';
    csv += '=== USERS ===\n';
    csv += 'ID,Name,Email,Role\n';
    (users || []).forEach(u => {
      csv += `${u.id},"${u.name || ''}","${u.email || ''}","${u.role || ''}"\n`;
    });
    csv += '\n=== POSTS ===\n';
    csv += 'ID,Author,Preview,Date\n';
    (posts || []).forEach(p => {
      const preview = (p.content || '').replace(/"/g, "'").slice(0, 60);
      csv += `${p.id},"${p.author || ''}","${preview}","${p.createdAt || ''}"\n`;
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'localconnect-report-' + Date.now() + '.csv';
    a.click();
    URL.revokeObjectURL(url);

    adminToast('📊 Report downloaded! ' + (users.length || 0) + ' users, ' + (posts.length || 0) + ' posts.', '#9f7aea');
  } catch (err) {
    adminToast('❌ Export failed: ' + err.message, '#f87171');
  } finally {
    btn.textContent = orig;
    btn.disabled    = false;
  }
}

// ── 3. CLEAR CACHE ──────────────────────────────────────────
async function adminClearCache(btn) {
  const orig = btn.textContent;
  btn.textContent = '⏳ Clearing…';
  btn.disabled = true;
  try {
    const data = await adminFetch('/api/admin/cache/clear', { method: 'POST' });
    const d = data.data || {};
    adminToast(`🗑 Cache cleared! ${d.users||0} users · ${d.posts||0} posts indexed.`, '#22c55e');
  } catch (err) {
    adminToast('❌ Cache clear failed: ' + err.message, '#f87171');
  } finally {
    btn.textContent = orig;
    btn.disabled    = false;
  }
}

// ── 4. BACKUP DB ────────────────────────────────────────────
async function adminBackupDB(btn) {
  const orig = btn.textContent;
  btn.disabled    = true;
  btn.textContent = '⏳ Backing up…';

  // Animate button through a progress sequence
  const steps   = ['10%', '35%', '60%', '85%', '100%'];
  let stepIdx   = 0;
  const interval = setInterval(() => {
    if (stepIdx < steps.length) {
      btn.textContent = '💾 ' + steps[stepIdx++];
    } else {
      clearInterval(interval);
    }
  }, 300);

  try {
    const data = await adminFetch('/api/admin/backup', { method: 'POST' });
    clearInterval(interval);
    const d = data.data || {};
    adminToast(
      `💾 <strong>Backup complete!</strong> ID: ${d.backupId || '–'}<br>` +
      `${d.users||0} users · ${d.posts||0} posts · ${(d.timestamp||'').split('T')[0]}`,
      '#fbbf24'
    );
  } catch (err) {
    clearInterval(interval);
    adminToast('❌ Backup failed: ' + err.message, '#f87171');
  } finally {
    btn.textContent = orig;
    btn.disabled    = false;
  }
}

// ── 5. REVIEW POSTS ─────────────────────────────────────────
let _adminAllPosts = [];

async function openAdminReviewPosts() {
  document.getElementById('adminPostsList').innerHTML =
    '<div style="text-align:center;color:#4a6080;padding:24px;">⏳ Loading posts…</div>';
  document.getElementById('adminPostsModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  await loadAdminPosts();
}

async function loadAdminPosts() {
  const list = document.getElementById('adminPostsList');
  list.innerHTML = '<div style="text-align:center;color:#4a6080;padding:24px;">⏳ Loading…</div>';
  try {
    _adminAllPosts = await adminFetch('/api/admin/posts');
    renderAdminPosts(_adminAllPosts);
  } catch (err) {
    list.innerHTML = `<div style="text-align:center;color:#f87171;padding:24px;">❌ ${err.message}</div>`;
  }
}

function renderAdminPosts(posts) {
  const list  = document.getElementById('adminPostsList');
  const count = document.getElementById('adminPostsCount');
  count.textContent = posts.length + ' post' + (posts.length !== 1 ? 's' : '');
  if (!posts.length) {
    list.innerHTML = '<div style="text-align:center;color:#4a6080;padding:32px;">📭 No posts found.</div>';
    return;
  }
  list.innerHTML = '';
  posts.forEach(p => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:flex-start;gap:14px;background:rgba(4,8,15,0.5);border:1px solid rgba(79,143,255,0.1);border-radius:14px;padding:14px 16px;transition:0.2s;';
    row.dataset.id = p.id;
    const preview = (p.content || '—').slice(0, 120) + ((p.content || '').length > 120 ? '…' : '');
    const date    = p.createdAt ? p.createdAt.split('T')[0] : '—';
    row.innerHTML = `
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#4f8fff,#9f7aea);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:800;color:#fff;flex-shrink:0;">${(p.author||'?')[0].toUpperCase()}</div>
          <strong style="font-size:0.9rem;color:#e8edf7;">${p.author || 'Unknown'}</strong>
          <span style="font-size:0.72rem;color:#4a6080;margin-left:auto;">${date} · #${p.id}</span>
        </div>
        <p style="font-size:0.84rem;color:#a0bcff;line-height:1.5;margin:0;">${preview}</p>
      </div>
      <button onclick="adminDeletePost(${p.id}, this)" style="flex-shrink:0;width:34px;height:34px;border-radius:50%;background:rgba(248,113,113,0.12);border:1px solid rgba(248,113,113,0.3);color:#f87171;cursor:pointer;font-size:0.95rem;display:flex;align-items:center;justify-content:center;transition:0.2s;" title="Delete post">🗑</button>
    `;
    list.appendChild(row);
  });
}

function filterAdminPosts(q) {
  const filtered = _adminAllPosts.filter(p =>
    (p.content||'').toLowerCase().includes(q.toLowerCase()) ||
    (p.author||'').toLowerCase().includes(q.toLowerCase())
  );
  renderAdminPosts(filtered);
}

async function adminDeletePost(id, btn) {
  if (!confirm('Delete this post? This cannot be undone.')) return;
  btn.textContent = '⏳';
  btn.disabled = true;
  try {
    await adminFetch('/api/admin/posts/' + id, { method: 'DELETE' });
    // Remove from DOM
    const row = btn.closest('[data-id]');
    if (row) {
      row.style.opacity = '0';
      row.style.transform = 'translateX(20px)';
      row.style.transition = '0.3s';
      setTimeout(() => row.remove(), 300);
    }
    _adminAllPosts = _adminAllPosts.filter(p => p.id !== id);
    document.getElementById('adminPostsCount').textContent =
      _adminAllPosts.length + ' post' + (_adminAllPosts.length !== 1 ? 's' : '');
    adminToast('🗑 Post #' + id + ' deleted.', '#f87171');
  } catch (err) {
    btn.textContent = '🗑';
    btn.disabled    = false;
    adminToast('❌ ' + err.message, '#f87171');
  }
}

// ── 6. MANAGE USERS ─────────────────────────────────────────
let _adminAllUsers = [];

async function openAdminManageUsers() {
  document.getElementById('adminUsersList').innerHTML =
    '<div style="text-align:center;color:#4a6080;padding:24px;">⏳ Loading users…</div>';
  document.getElementById('adminUsersModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  await loadAdminUsers();
}

async function loadAdminUsers() {
  const list = document.getElementById('adminUsersList');
  list.innerHTML = '<div style="text-align:center;color:#4a6080;padding:24px;">⏳ Loading…</div>';
  try {
    _adminAllUsers = await adminFetch('/api/admin/users');
    renderAdminUsers(_adminAllUsers);
  } catch (err) {
    list.innerHTML = `<div style="text-align:center;color:#f87171;padding:24px;">❌ ${err.message}</div>`;
  }
}

function renderAdminUsers(users) {
  const list  = document.getElementById('adminUsersList');
  const count = document.getElementById('adminUsersCount');
  count.textContent = users.length + ' user' + (users.length !== 1 ? 's' : '');
  if (!users.length) {
    list.innerHTML = '<div style="text-align:center;color:#4a6080;padding:32px;">📭 No users found.</div>';
    return;
  }
  list.innerHTML = '';
  users.forEach(u => {
    const row     = document.createElement('div');
    row.dataset.id = u.id;
    row.style.cssText = 'display:flex;align-items:center;gap:14px;background:rgba(4,8,15,0.5);border:1px solid rgba(79,143,255,0.1);border-radius:14px;padding:12px 16px;transition:0.2s;';
    const isAdmin  = (u.role || '').toUpperCase() === 'ADMIN';
    const roleColor = isAdmin ? '#9f7aea' : '#22c55e';
    const initials  = (u.name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    row.innerHTML = `
      <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#4f8fff,#9f7aea);display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:800;color:#fff;flex-shrink:0;">${initials}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:0.92rem;font-weight:700;color:#e8edf7;margin-bottom:2px;">${u.name || '—'}</div>
        <div style="font-size:0.75rem;color:#4a6080;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${u.email || '—'}</div>
      </div>
      <span style="font-size:0.72rem;font-weight:700;padding:3px 10px;border-radius:999px;background:${roleColor}22;border:1px solid ${roleColor}55;color:${roleColor};">${u.role || 'USER'}</span>
      <button onclick="adminToggleRole(${u.id},'${isAdmin ? 'USER' : 'ADMIN'}',this)" style="padding:6px 12px;border-radius:999px;border:1px solid rgba(79,143,255,0.3);background:rgba(79,143,255,0.08);color:#a0bcff;cursor:pointer;font-size:0.72rem;font-weight:600;white-space:nowrap;transition:0.2s;">${isAdmin ? '↓ Demote' : '↑ Make Admin'}</button>
      <button onclick="adminDeleteUser(${u.id}, this)" style="width:32px;height:32px;border-radius:50%;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3);color:#f87171;cursor:pointer;font-size:0.88rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:0.2s;" title="Delete user">🗑</button>
    `;
    list.appendChild(row);
  });
}

function filterAdminUsers(q) {
  const filtered = _adminAllUsers.filter(u =>
    (u.name||'').toLowerCase().includes(q.toLowerCase()) ||
    (u.email||'').toLowerCase().includes(q.toLowerCase()) ||
    (u.role||'').toLowerCase().includes(q.toLowerCase())
  );
  renderAdminUsers(filtered);
}

async function adminToggleRole(id, newRole, btn) {
  const orig = btn.textContent;
  btn.disabled    = true;
  btn.textContent = '⏳';
  try {
    await adminFetch('/api/admin/users/' + id + '/role', {
      method: 'PUT',
      body: JSON.stringify({ role: newRole })
    });
    adminToast(`✅ User #${id} role changed to <strong>${newRole}</strong>.`, '#9f7aea');
    await loadAdminUsers();
  } catch (err) {
    btn.textContent = orig;
    btn.disabled    = false;
    adminToast('❌ ' + err.message, '#f87171');
  }
}

async function adminDeleteUser(id, btn) {
  if (!confirm('Delete user #' + id + '? This cannot be undone.')) return;
  btn.textContent = '⏳';
  btn.disabled    = true;
  try {
    await adminFetch('/api/admin/users/' + id, { method: 'DELETE' });
    const row = btn.closest('[data-id]');
    if (row) {
      row.style.opacity   = '0';
      row.style.transform = 'translateX(20px)';
      row.style.transition = '0.3s';
      setTimeout(() => row.remove(), 300);
    }
    _adminAllUsers = _adminAllUsers.filter(u => u.id !== id);
    document.getElementById('adminUsersCount').textContent =
      _adminAllUsers.length + ' user' + (_adminAllUsers.length !== 1 ? 's' : '');
    adminToast('🗑 User #' + id + ' deleted.', '#f87171');
  } catch (err) {
    btn.textContent = '🗑';
    btn.disabled    = false;
    adminToast('❌ ' + err.message, '#f87171');
  }
}

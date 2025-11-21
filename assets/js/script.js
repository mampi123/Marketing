// ====== HERO: Simplified for minimalism ======
// The user wanted a minimalist look, and a single strong image is often better than a carousel.

// ====== EXISTING APP CODE (products, cart, etc.) ======
// -- I integrated your previous product & cart logic and kept the API the same.

// ===== STATE MANAGEMENT =====

let cart = [];
let products = [
  {
    id: 1,
    name: 'Luz Pro',
    category: 'Ultrabook',
    price: 730,
    specs: ['Intel i5 12th Gen', '16GB RAM', '512GB SSD', 'Pantalla Retina'],
    description: 'Equilibrio perfecto entre potencia y portabilidad. Ideal para profesionales en movimiento.',
    image: 'laptop-performance.jpg'
  },
  {
    id: 2,
    name: 'Lux Elite',
    category: 'Workstation',
    price: 1165,
    specs: ['Intel i7 12th Gen', '32GB RAM', '1TB SSD', 'RTX 3080'],
    description: 'Máximo rendimiento para tareas exigentes. Diseño térmico avanzado y construcción premium.',
    image: 'laptop-elite.jpg'
  }
];

let discountCode = '';
let selectedPaymentMethod = 'transfer';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  loadCartFromStorage();
  updateCartUI();
  
  // Animate stats on scroll
  initCounters();
});

// ===== PRODUCTS =====
function renderProducts() {
  const productsGrid = document.getElementById('productsGrid');
  if (!productsGrid) return;
  productsGrid.innerHTML = products.map(product => `
    <div class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <p class="product-category">${product.category}</p>
      <h3 class="product-name">${product.name}</h3>
      <p class="product-description">${product.description}</p>
      <ul class="product-specs">
        ${product.specs.map(spec => `<li>${spec}</li>`).join('')}
      </ul>
      <div class="product-footer">
        <div class="product-price">$${product.price.toLocaleString()}</div>
        <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
          <span>Agregar al Carrito</span>
        </button>
      </div>
    </div>
  `).join('');
}

// ===== CART FUNCTIONS =====
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCartToStorage();
  updateCartUI();
  
  // Optional: Show feedback
  const btn = event.currentTarget;
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span>¡Agregado!</span>';
  setTimeout(() => btn.innerHTML = originalText, 1500);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCartToStorage();
  updateCartUI();
}

function updateQuantity(productId, quantity) {
  if (quantity <= 0) {
    removeFromCart(productId);
  } else {
    const item = cart.find(item => item.id === productId);
    if (item) {
      item.quantity = quantity;
      saveCartToStorage();
      updateCartUI();
    }
  }
}

function updateCartUI() {
  const cartBadge = document.getElementById('cartBadge');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cartBadge) {
    if (totalItems > 0) {
      cartBadge.textContent = totalItems;
      cartBadge.style.display = 'flex';
    } else {
      cartBadge.style.display = 'none';
    }
  }

  renderCartItems();
  updateSummary();
}

function renderCartItems() {
  const cartItems = document.getElementById('cartItems');

  if (!cartItems) return;
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart" style="text-align:center; padding:2rem;">
        <p style="color:#666; margin-bottom:1rem;">Tu carrito está vacío</p>
        <button onclick="toggleCart()" style="background:#000; color:#fff; border:none; padding:0.5rem 1rem; border-radius:4px; cursor:pointer;">Ver Productos</button>
      </div>
    `;
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-details" style="flex:1;">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p style="color:#666; font-size:0.9rem;">${item.category}</p>
          <p class="cart-item-price">$${item.price.toLocaleString()}</p>
        </div>
        <div class="cart-item-controls" style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem;">
          <div class="qty-control">
            <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
            <input type="number" value="${item.quantity}" onchange="updateQuantity(${item.id}, parseInt(this.value) || 1)" min="1" readonly>
            <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
          </div>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">Eliminar</button>
        </div>
      </div>
    </div>
  `).join('');
}

function updateSummary() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = calculateDiscount(subtotal);
  const shipping = subtotal > 50 ? 0 : 0;
  const tax = (subtotal - discount + shipping) * 0.21;
  const total = subtotal - discount + shipping + tax;

  const eSubtotal = document.getElementById('subtotal');
  const eDiscount = document.getElementById('discount');
  const eShipping = document.getElementById('shipping');
  const eTax = document.getElementById('tax');
  const eTotal = document.getElementById('total');

  if (eSubtotal) eSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  if (eDiscount) eDiscount.textContent = `-$${discount.toFixed(2)}`;
  if (eShipping) eShipping.textContent = shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`;
  if (eTax) eTax.textContent = `$${tax.toFixed(2)}`;
  if (eTotal) eTotal.textContent = `$${total.toFixed(2)}`;
}

function calculateDiscount(subtotal) {
  if (discountCode === 'LUMENYX10') {
    return subtotal * 0.1;
  }
  return 0;
}

function applyDiscount() {
  const codeInput = document.getElementById('discountCode');
  const code = codeInput ? codeInput.value.toUpperCase() : '';
  if (code === 'LUMENYX10') {
    discountCode = code;
    updateSummary();
    alert('Código de descuento aplicado: 10% descuento');
  } else {
    alert('Código inválido');
  }
}

function selectPaymentMethod(method, element) {
  selectedPaymentMethod = method;
  document.querySelectorAll('.payment-btn').forEach(btn => btn.classList.remove('active'));
  if (element) element.classList.add('active');
}

function checkout() {
  if (cart.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }
  alert(`Procediendo al pago con ${selectedPaymentMethod}. Total: $${getTotalPrice()}`);
}

function getTotalPrice() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = calculateDiscount(subtotal);
  const tax = (subtotal - discount) * 0.21;
  return (subtotal - discount + tax).toFixed(2);
}

// ===== LOCAL STORAGE =====
function saveCartToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}
function loadCartFromStorage() {
  const saved = localStorage.getItem('cart');
  if (saved) cart = JSON.parse(saved);
}

// ===== PAGE NAVIGATION =====
function toggleCart() {
  const mainContent = document.getElementById('mainContent');
  const cartPage = document.getElementById('cartPage');
  if (!mainContent || !cartPage) return;

  if (cartPage.style.display === 'none' || cartPage.style.display === '') {
    mainContent.style.display = 'none';
    cartPage.style.display = 'block';
    window.scrollTo(0,0);
  } else {
    mainContent.style.display = 'block';
    cartPage.style.display = 'none';
    window.scrollTo(0,0);
  }
}

function scrollToProducts() {
  const productsSection = document.getElementById('productsSection');
  if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth' });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Counters animation
function initCounters() {
  const counters = Array.from(document.querySelectorAll('.stat-number'));
  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
  const target = +el.dataset.target || 0;
  const duration = 1500;
  const start = 0;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const value = Math.floor(start + (target - start) * eased);
    el.textContent = formatNumber(value, target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = formatNumber(target, target);
  }
  requestAnimationFrame(step);
}

function formatNumber(val, target) {
  if (target >= 1000) {
    return (val/1000).toFixed(0) + 'k+';
  }
  return val;
}

// Contadores animados (misma lógica que el hero)
(function() {
  const counters = document.querySelectorAll('#philosophySection .stat-number');
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCount(el, +el.dataset.target || 0);
        o.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));

  function animateCount(el, target) {
    const duration = target > 1000 ? 1600 : 1100;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.floor(target * eased);
      el.textContent = target >= 1000 ? Math.floor(value / 1000) + 'k+' : value;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target >= 1000 ? Math.floor(target / 1000) + 'k+' : target;
    }
    requestAnimationFrame(step);
  }
})();

// Animación para contadores en la sección "philosophy"
(function() {
  const counters = document.querySelectorAll('#philosophySection .stat-number');
  if (!counters || counters.length === 0) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target || el.textContent.replace(/\D/g,''), 10) || 0;
        animateCount(el, target);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));

  function animateCount(el, target) {
    const duration = target > 1000 ? 1400 : 1000;
    const start = 0;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.floor(start + (target - start) * eased);
      el.textContent = target >= 1000 ? Math.floor(value/1000) + 'k+' : value;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target >= 1000 ? Math.floor(target/1000) + 'k+' : target;
    }
    requestAnimationFrame(step);
  }
})();

// CONTADORES: animan cuando la sección entra en pantalla
(function() {
  const counters = document.querySelectorAll('#philosophySection .stat-number');
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target || '0', 10) || 0;
        animate(el, target);
        o.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));

  function animate(el, target) {
    const duration = target > 1000 ? 1400 : 900;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.floor(target * eased);
      el.textContent = target >= 1000 ? Math.floor(value/1000) + 'k+' : value;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target >= 1000 ? Math.floor(target/1000) + 'k+' : target;
    }
    requestAnimationFrame(step);
  }
})();

// CONTADORES: animan cuando la sección entra en pantalla
(function() {
  const counters = document.querySelectorAll('#philosophySection .stat-number');
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target || '0', 10) || 0;
        animate(el, target);
        o.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));

  function animate(el, target) {
    const duration = target > 1000 ? 1400 : 900;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.floor(target * eased);
      el.textContent = target >= 1000 ? Math.floor(value/1000) + 'k+' : value;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target >= 1000 ? Math.floor(target/1000) + 'k+' : target;
    }
    requestAnimationFrame(step);
  }
})();

// ---- Quote dinámico: rotador con controles ----
(function() {
  const root = document.querySelector('.quote-card.dynamic-quote');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.quote-slide'));
  const btnPrev = root.querySelector('.quote-btn.prev');
  const btnNext = root.querySelector('.quote-btn.next');
  const btnToggle = root.querySelector('.quote-btn.toggle');

  let current = 0;
  let autoplay = true;
  let intervalId = null;
  const DELAY = 4500; // ms

  function show(index) {
    slides.forEach((s, i) => {
      const active = i === index;
      s.classList.toggle('active', active);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    current = index;
  }

  function next() { show((current + 1) % slides.length); }
  function prev() { show((current - 1 + slides.length) % slides.length); }

  function startAutoplay() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(next, DELAY);
    autoplay = true;
    btnToggle && btnToggle.setAttribute('data-paused', 'false');
    btnToggle && (btnToggle.title = 'Pausar rotación');
  }
  function stopAutoplay() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
    autoplay = false;
    btnToggle && btnToggle.setAttribute('data-paused', 'true');
    btnToggle && (btnToggle.title = 'Reanudar rotación');
  }
  function toggleAutoplay() { autoplay ? stopAutoplay() : startAutoplay(); }

  // Controls
  btnNext && btnNext.addEventListener('click', () => { next(); stopAutoplay(); });
  btnPrev && btnPrev.addEventListener('click', () => { prev(); stopAutoplay(); });
  btnToggle && btnToggle.addEventListener('click', () => { toggleAutoplay(); });

  // Pause on hover & focus (accessibility)
  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', () => { if (!root.contains(document.activeElement)) startAutoplay(); });
  root.addEventListener('focusin', stopAutoplay);
  root.addEventListener('focusout', (e) => {
    // if focus moved outside, resume
    if (!root.contains(e.relatedTarget)) startAutoplay();
  });

  // Keyboard navigation (left/right)
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); stopAutoplay(); }
    if (e.key === 'ArrowLeft') { prev(); stopAutoplay(); }
    if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); toggleAutoplay(); } // space toggles
  });

  // init
  show(0);
  startAutoplay();

  // expose for debugging (optional)
  root.__quoteAPI = { show, next, prev, startAutoplay, stopAutoplay, toggleAutoplay };
})();

// ---- Quote dinámico: autoplay simple (sin botones) ----
(function() {
  const root = document.querySelector('.quote-card.dynamic-quote');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.quote-slide'));
  let current = 0;
  let intervalId = null;
  const DELAY = 4500; // ms, cambia si querés más rápido/lento

  function show(index) {
    slides.forEach((s, i) => {
      const active = i === index;
      s.classList.toggle('active', active);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    current = index;
  }

  function next() { show((current + 1) % slides.length); }

  function startAutoplay() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(next, DELAY);
    root.setAttribute('data-autoplay', 'true');
  }
  function stopAutoplay() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
    root.setAttribute('data-autoplay', 'false');
  }

  // Pause on hover & focus, resume on leave/blur
  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', () => { if (!root.contains(document.activeElement)) startAutoplay(); });
  root.addEventListener('focusin', stopAutoplay);
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget)) startAutoplay();
  });

  // Keyboard: allow left/right navigation (optional) — does not show UI
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); stopAutoplay(); }
    if (e.key === 'ArrowLeft')  { show((current - 1 + slides.length) % slides.length); stopAutoplay(); }
  });

  // Init
  show(0);
  startAutoplay();

  // expose for debugging (optional)
  root.__quoteAPI = { show, next, startAutoplay, stopAutoplay };
})();

// ---- Quote dinámico: autoplay rápido + entrada + parallax ----
(function() {
  const root = document.querySelector('.quote-card.dynamic-quote');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.quote-slide'));
  let current = 0;
  let intervalId = null;
  const DELAY = 2000; // 3s between slides (más dinámico)
  const TRANSITION_GAP = 100; // tiempo de transición en ms (coincide con CSS)

  function show(index) {
    slides.forEach((s, i) => {
      const active = i === index;
      s.classList.toggle('active', active);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    current = index;
  }

  function next() { show((current + 1) % slides.length); }

  function startAutoplay() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(next, DELAY);
    root.setAttribute('data-autoplay', 'true');
  }
  function stopAutoplay() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
    root.setAttribute('data-autoplay', 'false');
  }

  // Pause on hover & focus, resume on leave/blur
  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', () => { if (!root.contains(document.activeElement)) startAutoplay(); });
  root.addEventListener('focusin', stopAutoplay);
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget)) startAutoplay();
  });

  // Keyboard: allow left/right navigation (optional)
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); stopAutoplay(); }
    if (e.key === 'ArrowLeft')  { show((current - 1 + slides.length) % slides.length); stopAutoplay(); }
  });

  // Parallax micro-effect while hovering: subtle translate based on cursor
  (function addParallax() {
    let rect = null;
    root.addEventListener('mousemove', (ev) => {
      rect = rect || root.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (ev.clientX - cx) / rect.width; // -0.5 .. 0.5
      const dy = (ev.clientY - cy) / rect.height;
      // apply small transform
      const tx = clamp(dx * 8, -10, 10); // px
      const ty = clamp(dy * 6, -8, 8);   // px
      root.style.transform = `translateY(-6px) rotateX(${ty * 0.04}deg) rotateY(${tx * 0.03}deg)`;
    });
    root.addEventListener('mouseleave', () => {
      root.style.transform = '';
    });
    root.addEventListener('mouseenter', () => { /* ensure lift when entering */ root.style.transform = 'translateY(-6px)'; });
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  })();

  // Observer: add 'is-visible' class when element enters viewport for entrance animation
  (function observeVisibility() {
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          root.classList.add('is-visible');
          startAutoplay();
          o.unobserve(root);
        }
      });
    }, { threshold: 0.35 });
    obs.observe(root);
  })();

  // Init
  show(0);
  // don't start autoplay until visible — observer handles it
  root.setAttribute('tabindex','0'); // make focusable for keyboard pause
  root.__quoteAPI = { show, next, startAutoplay, stopAutoplay };
})();

/* ===== UI: Reveal on scroll + Nav highlight ===== */
(function() {
  // 1) Reveal on scroll
  function setupRevealOnScroll() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    const ro = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target); // unobserve to reveal once
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => ro.observe(el));
  }

  // 2) Nav highlight based on section in view
  function setupNavHighlight() {
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const sections = navLinks.map(a => {
      const id = a.getAttribute('href')?.replace('#','');
      return document.getElementById(id);
    }).filter(Boolean);

    if (!sections.length) return;

    const navObserver = new IntersectionObserver((entries) => {
      // pick the section most in view
      let visible = entries.filter(e => e.isIntersecting).sort((a,b) =>
        (b.intersectionRatio - a.intersectionRatio)
      )[0];

      // remove active from all
      navLinks.forEach(link => link.classList.remove('active'));

      if (visible) {
        const id = visible.target.id;
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (link) link.classList.add('active');
      } else {
        // if none visible, leave first link active by default (optional)
      }
    }, { threshold: [0.45, 0.6, 0.8] });

    sections.forEach(s => navObserver.observe(s));
  }

  // 3) Smooth scroll for nav links (account for sticky nav height)
  function setupNavScrollSmooth() {
    const offset = document.querySelector('.navbar') ? document.querySelector('.navbar').offsetHeight : 0;

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a.nav-link, a.logo');
      if (!a) return;
      const href = a.getAttribute('href') || a.dataset.navTarget || '';
      if (!href.startsWith('#')) return;
      e.preventDefault();
      const targetId = href.replace('#','');
      const target = targetId === 'top' ? document.documentElement : document.getElementById(targetId);
      if (target) {
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset - 12;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  }

  // init after DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    setupRevealOnScroll();
    setupNavHighlight();
    setupNavScrollSmooth();
  });

})();


// Llama updateMiniCartHTML(cart) cuando actualices el carrito

const hv = document.getElementById('heroVideo');
if(hv){
  // pause/play on hover desktop
  hv.addEventListener('mouseenter', ()=> hv.pause());
  hv.addEventListener('mouseleave', ()=> hv.play());
  // fallback: si no soportado o error -> mostrar imagen
  hv.addEventListener('error', ()=> {
    hv.style.display = 'none';
    document.querySelector('.hero-visual').insertAdjacentHTML('afterbegin', '<img class="hero-main-image" src="laptop elitee.png" alt="Laptop">');
  });
}



// Si hay un carrito guardado en localStorage, lo cargamos para mantener sincronía
try {
  const saved = localStorage.getItem('cart');
  if (saved) {
    cartItems = JSON.parse(saved);
  }
} catch(e) { console.warn('No se pudo leer el carrito desde localStorage', e); }

/* ---------------- Mini cart dropdown & sync (localStorage) ---------------- */

function getCartFromStorage() {
  try {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.warn('Error parsing cart from localStorage', e);
    return [];
  }
}

function updateMiniCartHTML(items) {
  const container = document.getElementById('miniCartItems');
  if (!container) return;
  if (!items) {
    container.innerHTML = '<div class="mini-loading">Cargando...</div>';
    return;
  }
  if (items.length === 0) {
    container.innerHTML = '<div style="padding:1rem;color:#666">Carrito vacío</div>';
    return;
  }
  container.innerHTML = items.map(it => `
    <div class="mini-cart-item">
      <img src="${it.image || 'laptop elitee.png'}" alt="${it.name}">
      <div class="meta">
        <div class="name">${it.name}</div>
        <div class="price">$${(it.price).toFixed(2)} × ${it.quantity}</div>
      </div>
    </div>
  `).join('');
}

function refreshMiniCart() {
  const badge = document.getElementById('cartBadge');
  const cart = getCartFromStorage();
  if (badge) {
    const totalItems = cart.reduce((s, it) => s + (it.quantity || 0), 0);
    if (totalItems > 0) {
      badge.textContent = totalItems;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
  const mini = document.getElementById('miniCart');
  if (mini && mini.classList.contains('open')) {
    updateMiniCartHTML(cart);
  }
}

// Toggle mini-cart on click, close on outside click
document.addEventListener('click', function(e){
  const mini = document.getElementById('miniCart');
  const btn = document.getElementById('cartBtn');
  if (!mini || !btn) return;

  if (btn.contains(e.target)) {
    const open = mini.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      const cart = getCartFromStorage();
      updateMiniCartHTML(cart);
    }
    e.stopPropagation();
    return;
  }
  // click outside -> close
  if (mini.classList && mini.classList.contains('open')) {
    if (!mini.contains(e.target)) {
      mini.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  }
});

// Sync across tabs/windows
window.addEventListener('storage', function(e){
  if (e.key === 'cart') refreshMiniCart();
});

// Ensure badge is up-to-date on load
document.addEventListener('DOMContentLoaded', function(){
  refreshMiniCart();
});

// OPTIONAL: if tu código actual actualiza el carrito en memoria, llama a refreshMiniCart() después de cada update
// Ejemplo: después de saveCartToStorage(); llama refreshMiniCart();

/* === Mini-cart: forzar carga correcta y proteger parseo === */

function getCartFromStorage() {
  try {
    const raw = localStorage.getItem('cart');
    if (!raw) return [];               // nada guardado -> carrito vacío
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.warn('Error leyendo/parsing cart desde localStorage:', e);
    return [];
  }
}

function updateMiniCartHTML(items) {
  const container = document.getElementById('miniCartItems');
  if (!container) return;
  // si items es null/undefined mostramos vacío en vez de 'Cargando...'
  if (!items) items = [];
  if (items.length === 0) {
    container.innerHTML = '<div style="padding:1rem;color:#666">Tu carrito está vacío</div>';
    return;
  }

  container.innerHTML = items.map(it => `
    <div class="mini-cart-item">
      <img src="${it.image || 'laptop elitee.png'}" alt="${(it.name||'Producto')}">
      <div class="meta">
        <div class="name">${it.name || 'Sin nombre'}</div>
        <div class="price">$${(Number(it.price) || 0).toFixed(2)} × ${it.quantity || 1}</div>
      </div>
    </div>
  `).join('');
}

function refreshMiniCart() {
  const cart = getCartFromStorage();
  updateMiniCartHTML(cart);
  const badge = document.getElementById('cartBadge');
  if (badge) {
    const total = cart.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
    if (total > 0) { badge.textContent = total; badge.style.display = 'flex'; }
    else { badge.style.display = 'none'; }
  }
}

// Llamadas seguras al cargar la página y al cambiar storage en otras pestañas
document.addEventListener('DOMContentLoaded', function(){ refreshMiniCart(); });
// También por si algo carga más tarde (videos/otros scripts)
window.addEventListener('load', function(){ setTimeout(refreshMiniCart, 150); });
// Sincroniza entre pestañas
window.addEventListener('storage', function(e){ if (e.key === 'cart') refreshMiniCart(); });

/* faq.js
 - Crea dinámicamente el listado de preguntas/respuestas.
 - Accesible (aria), teclado, búsqueda y accordion (solo 1 abierto).
*/



/* Util: busca el contenedor, crea si no existe (seguro). */
function getFaqContainer() {
  let container = document.querySelector('#faqList');
  if (!container) {
    const section = document.querySelector('#faqSection') || document.querySelector('.faq-section') || document.body;
    container = document.createElement('div');
    container.id = 'faqList';
    container.className = 'faq-list';
    section.appendChild(container);
    console.warn('Se creó #faqList dinámicamente.');
  }
  return container;
}

/* Renderiza preguntas en el DOM */
function renderFAQs(items) {
  const container = getFaqContainer();
  container.innerHTML = ''; // limpiar

  items.forEach((it, idx) => {
    const item = document.createElement('div');
    item.className = 'faq-item';
    item.setAttribute('role','listitem');

    // boton (trigger)
    const btn = document.createElement('button');
    btn.className = 'faq-trigger';
    btn.type = 'button';
    btn.setAttribute('aria-expanded','false');

    const title = document.createElement('span');
    title.className = 'faq-title-text';
    title.textContent = it.q;

    const icon = document.createElement('span');
    icon.className = 'faq-icon';
    icon.setAttribute('aria-hidden','true');
    icon.textContent = '+';

    btn.appendChild(title);
    btn.appendChild(icon);

    // panel/respuesta
    const panel = document.createElement('div');
    panel.className = 'faq-panel';
    panel.setAttribute('role','region');
    panel.setAttribute('aria-hidden','true');
    panel.id = `faq-panel-${idx}`;

    const p = document.createElement('p');
    p.textContent = it.a;
    panel.appendChild(p);

    item.appendChild(btn);
    item.appendChild(panel);
    container.appendChild(item);

    // listeners (click y teclado)
    btn.addEventListener('click', () => toggleItem(item, btn, panel, icon));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleItem(item, btn, panel, icon); }
      if (e.key === 'ArrowDown') { e.preventDefault(); focusNext(idx); }
      if (e.key === 'ArrowUp') { e.preventDefault(); focusPrev(idx); }
    });
  });
}

/* Toggle: cierra todos y abre el seleccionado (solo 1 abierto) */
function toggleItem(item, btn, panel, icon) {
  const isOpen = item.classList.contains('open');

  // cerrar todo
  document.querySelectorAll('.faq-item.open').forEach(openItem => {
    openItem.classList.remove('open');
    const b = openItem.querySelector('.faq-trigger');
    const p = openItem.querySelector('.faq-panel');
    const i = openItem.querySelector('.faq-icon');
    if (b) b.setAttribute('aria-expanded','false');
    if (p) p.setAttribute('aria-hidden','true');
    if (i) i.textContent = '+';
  });

  if (!isOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded','true');
    panel.setAttribute('aria-hidden','false');
    icon.textContent = '-';
    setTimeout(() => item.scrollIntoView({behavior:'smooth', block:'center'}), 160);
  }
}

/* keyboard helper */
function focusNext(idx) {
  const triggers = document.querySelectorAll('.faq-trigger');
  if (triggers[idx+1]) triggers[idx+1].focus();
}
function focusPrev(idx) {
  const triggers = document.querySelectorAll('.faq-trigger');
  if (triggers[idx-1]) triggers[idx-1].focus();
}

/* Búsqueda simple */
function setupSearch() {
  const input = document.querySelector('#faqSearch');
  if (!input) return;

  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) return renderFAQs(FAQ_ITEMS);
    const filtered = FAQ_ITEMS.filter(it => it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q));
    renderFAQs(filtered);
  });
}


/* ------------------ FAQ dinámico seguro (añadir al final de script.js) ------------------ */

/* -------------------------------------------------------------------------------- */

(function(){
  document.addEventListener('DOMContentLoaded', function(){
    const nav = document.querySelector('nav') || document.querySelector('.site-nav') || document.querySelector('#mainNav');
    if(!nav) return console.warn('navbar-fix: nav no encontrado (selector).');

    // altura y clase base
    const navHeight = nav.offsetHeight;
    document.body.classList.add('has-fixed-nav'); // activa padding-top CSS si la usás

    // Forzar style fixed si sticky no funciona
    nav.style.position = 'fixed';
    nav.style.top = '0';
    nav.style.left = '0';
    nav.style.right = '0';
    nav.style.zIndex = '9999';

    // Opcional: aplicar transición al contenido cuando scrollea
    // window.addEventListener('scroll', ()=>{ /* se puede añadir sombra o cambiar fondo */ });
  });
})();

/* Robust addToCart: normaliza valores y suma quantities si existe el mismo id */
function addToCart(product) {
  // Normalizar/defensivo
  const id = String(product.id ?? product.dataId ?? product.dataset?.id ?? Date.now());
  const name = product.name ?? product.dataName ?? product.dataset?.name ?? 'Producto';
  const price = Number(product.price ?? product.dataPrice ?? product.dataset?.price ?? 0) || 0;
  const image = product.image ?? product.dataImage ?? product.dataset?.image ?? '';
  const specs = product.specs ?? product.dataSpecs ?? product.dataset?.specs ?? '';
  const quantity = Number(product.quantity ?? 1) || 1;

  const cart = loadCart();

  // Buscar por id (comparación como string para consistencia)
  const existing = cart.find(i => String(i.id) === id);
  if (existing) {
    existing.quantity = Number(existing.quantity || 0) + quantity;
    // en caso de que falten datos, actualizarlos si vienen nuevos
    if (!existing.name && name) existing.name = name;
    if ((!existing.price || existing.price === 0) && price !== 0) existing.price = price;
    if (!existing.image && image) existing.image = image;
    if (!existing.specs && specs) existing.specs = specs;
  } else {
    cart.push({
      id: id,
      name: name,
      price: price,
      quantity: quantity,
      image: image,
      specs: specs
    });
  }

  saveCart(cart);
  renderMiniCart();
}

/* addToCart robusta — acepta productId (número/string) o un objeto product */
function addToCart(productOrId) {
  // Si recibimos solo un id (number o string), buscamos el producto en el array `products`
  let product = null;

  if (productOrId == null) return;

  if (typeof productOrId === 'number' || typeof productOrId === 'string') {
    // buscar en products por id numérico o string
    const pid = Number(productOrId);
    product = products.find(p => Number(p.id) === pid);
    if (!product) {
      console.warn('addToCart: producto no encontrado para id', productOrId);
      return;
    }
  } else if (typeof productOrId === 'object') {
    // ya es un objeto producto (puede venir desde dataset o llamado directo)
    // si vino solo con atributos mínimos, intentamos normalizar
    product = productOrId;
  } else {
    console.warn('addToCart: argumento inválido', productOrId);
    return;
  }

  // Normalizar campos mínimos
  const id = String(product.id ?? product.sku ?? Date.now());
  const name = product.name ?? 'Producto';
  const price = Number(product.price ?? product.price_value ?? 0) || 0;
  const image = product.image ?? product.img ?? '';
  const specs = product.specs ? (Array.isArray(product.specs) ? product.specs.join(' • ') : product.specs) : (product.description || '');
  const quantityToAdd = Number(product.quantity ?? 1) || 1;

  // Cargar carrito desde la variable global / storage
  // Usamos la variable `cart` si existe (tu script tiene `let cart = []`), sino fallback a storage
  try {
    if (typeof cart === 'undefined') window.cart = [];
  } catch(e){ window.cart = []; }

  const existing = cart.find(it => String(it.id) === id);
  if (existing) {
    existing.quantity = Number(existing.quantity || 0) + quantityToAdd;
    // actualizar datos si están vacíos
    if ((!existing.name || existing.name === '') && name) existing.name = name;
    if ((!existing.price || existing.price === 0) && price !== 0) existing.price = price;
    if (!existing.image && image) existing.image = image;
  } else {
    cart.push({
      id: id,
      name: name,
      price: price,
      quantity: quantityToAdd,
      image: image,
      specs: specs
    });
  }

  // guardar y refrescar UI (llama a las funciones que ya tiene tu script)
  try { saveCartToStorage(); } catch(e){ localStorage.setItem('cart', JSON.stringify(cart)); }
  try { updateCartUI(); } catch(e){ /* si no existe, refrescar mini cart */ refreshMiniCart(); }
}


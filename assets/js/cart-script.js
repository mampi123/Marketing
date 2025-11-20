/* ===== NAV HEIGHT + FOCUS SCROLL FIX (IIFE, sin cambios funcionales) ===== */

(function(){
  'use strict';

  function computeNavHeight(){
    const nav = document.querySelector('nav') || document.querySelector('.site-nav') || document.querySelector('.header') || document.querySelector('.header-container');
    const h = nav ? Math.ceil(nav.getBoundingClientRect().height) : 72;
    document.documentElement.style.setProperty('--nav-height', h + 'px');
    if (!document.body.classList.contains('has-fixed-nav')) {
      document.body.classList.add('has-fixed-nav');
    }
    if (nav) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 6) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
      }, {passive:true});
    }
    return h;
  }

  function ensureVisibleUnderNav(el){
    if (!el || !el.getBoundingClientRect) return;
    const rect = el.getBoundingClientRect();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || computeNavHeight();
    const topVisible = rect.top;
    const buffer = 18;
    if (topVisible < navH + buffer || rect.bottom < navH + 40) {
      const scrollByY = Math.ceil(rect.top - navH - buffer);
      window.scrollBy({ top: scrollByY, behavior: 'smooth' });
    }
  }

  function handleHashLinks(){
    document.addEventListener('click', function(e){
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const hash = a.getAttribute('href');
      if (hash && hash.length > 1) {
        setTimeout(() => {
          const target = document.querySelector(hash);
          if (target) ensureVisibleUnderNav(target);
        }, 40);
      }
    });
  }

  function addFocusListeners(){
    document.addEventListener('focusin', function(e){
      const el = e.target;
      if (!el) return;
      if (el.closest('nav')) return;
      ensureVisibleUnderNav(el);
    });

    document.addEventListener('mouseover', function(e){
      const el = e.target;
      if (!el) return;
      if (el.matches && (el.matches('a, button, input, textarea, select, .product-item, .faq-trigger') || el.closest('.product-item') || el.closest('.faq-item'))) {
        ensureVisibleUnderNav(el);
      }
    }, {passive:true});
  }

  window.addEventListener('load', computeNavHeight);
  window.addEventListener('resize', function(){ setTimeout(computeNavHeight, 120); });

  document.addEventListener('DOMContentLoaded', function(){
    computeNavHeight();
    handleHashLinks();
    addFocusListeners();
    if (location.hash && document.querySelector(location.hash)) {
      setTimeout(()=> ensureVisibleUnderNav(document.querySelector(location.hash)), 120);
    }
    console.info('nav/focus fix initialized (nav-height:', getComputedStyle(document.documentElement).getPropertyValue('--nav-height').trim(), ')');
  });

})();

/* ===== nav-height runtime fix (small helper) ===== */
(function(){
  function setNavHeight(){
    const nav = document.querySelector('nav') || document.querySelector('.site-nav') || document.querySelector('.header') || document.querySelector('.header-container');
    const h = nav ? Math.ceil(nav.getBoundingClientRect().height) : 72;
    document.documentElement.style.setProperty('--nav-height', h + 'px');
    document.querySelectorAll('.order-summary-box, .sticky-sidebar, .payment-methods').forEach(el=>{
      el.style.top = `calc(var(--nav-height) + 28px)`;
    });
    if(!document.body.classList.contains('has-fixed-nav')) document.body.classList.add('has-fixed-nav');
    return h;
  }
  window.addEventListener('load', setNavHeight);
  window.addEventListener('resize', ()=> setTimeout(setNavHeight, 120));
  document.addEventListener('DOMContentLoaded', setNavHeight);
})();

/* ===== CARRO DE COMPRAS (sin duplicados, almacenamiento en localStorage) ===== */

/*
  Notas:
  - El carrito se sincroniza con localStorage bajo la key "cart".
  - Si quieres que NO haya producto por defecto cuando el storage está vacío, edita `initialCart` a [] abajo.
  - Rutas de imágenes son relativas: 'laptop-performance.jpg' (ajusta según dónde pongas imágenes).




// ---------- Local Storage helpers ----------
function saveCartToStorage() {
  try {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  } catch (e) {
    console.warn('No se pudo guardar el carrito en localStorage', e);
  }
}

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem('cart');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch (e) {
    console.warn('Error leyendo/parsing cart desde localStorage:', e);
    return null;
  }
}

// ---------- Inicialización ----------
document.addEventListener('DOMContentLoaded', function() {
  const saved = loadCartFromStorage();
  if (saved && saved.length > 0) {
    cartItems = saved;
  } else {
    // Si preferís no mostrar producto por defecto, pon []
    cartItems = [...initialCart];
  }

  renderCart();
  updateOrderSummary();

  const discountInput = document.getElementById('discountCode');
  if (discountInput) {
    discountInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') applyDiscount();
    });
  }
});

// ---------- Render cart ----------
function renderCart() {
  const container = document.getElementById('productsContainer');
  if (!container) return;
  container.innerHTML = '';

  if (!cartItems || cartItems.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 3rem;">
        <p style="font-size:1.5rem; font-weight:300; margin-bottom:1rem;">Tu carrito está vacío</p>
        <p style="color:#999999; margin-bottom:1.5rem;">Descubre nuestros computadores premium</p>
        <a href="index.html" style="display:inline-block; padding:0.75rem 2rem; background-color:#000; color:#fff; text-decoration:none; font-weight:300;">Volver a la Tienda</a>
      </div>
    `;
    const itemCountEl = document.getElementById('itemCount');
    if (itemCountEl) itemCountEl.textContent = 0;
    updateOrderSummary();
    return;
  }

  cartItems.forEach(item => {
    const productHTML = `
      <div class="product-item" data-id="${item.id}">
        <div class="product-image"><img src="${item.image}" alt="${item.name}" /></div>
        <div class="product-info">
          <div>
            <h3 class="product-name">${item.name}</h3>
            <p class="product-specs">${item.specs || ''}</p>
          </div>
          <div class="product-actions">
            <div class="quantity-selector">
              <button class="qty-btn" data-action="decrease" data-id="${item.id}">−</button>
              <div class="qty-display">${item.quantity}</div>
              <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
            </div>
            <div class="product-price">
              <div class="price-total">$${(item.price * item.quantity).toLocaleString()}</div>
              <div class="price-unit">$${item.price.toLocaleString()} / unidad</div>
            </div>
            <button class="remove-btn" data-action="remove" data-id="${item.id}" title="Eliminar">Eliminar</button>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', productHTML);
  });

  // Delegación de eventos para botones
  container.querySelectorAll('.qty-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = Number(btn.getAttribute('data-id'));
      const action = btn.getAttribute('data-action');
      const item = cartItems.find(i=> i.id === id);
      if (!item) return;
      if (action === 'decrease') updateQuantity(id, item.quantity - 1);
      if (action === 'increase') updateQuantity(id, item.quantity + 1);
    });
  });
  container.querySelectorAll('.remove-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = Number(btn.getAttribute('data-id'));
      removeFromCart(id);
    });
  });

  const itemCountEl = document.getElementById('itemCount');
  if (itemCountEl) itemCountEl.textContent = cartItems.length;
}

// ---------- Update quantity ----------
function updateQuantity(productId, quantity) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  const item = cartItems.find(it => it.id === productId);
  if (item) {
    item.quantity = Number(quantity);
    saveCartToStorage();
    renderCart();
    updateOrderSummary();
  }
}

// ---------- Remove ----------
function removeFromCart(productId) {
  cartItems = cartItems.filter(it => it.id !== productId);
  saveCartToStorage();
  renderCart();
  updateOrderSummary();
}

// ---------- Apply discount ----------
function applyDiscount() {
  const codeInput = document.getElementById('discountCode');
  const message = document.getElementById('discountMessage');
  const code = codeInput ? (codeInput.value || '').toUpperCase() : '';

  if (code === 'LUMENYX10') {
    appliedDiscount = 10;
    if (message) { message.textContent = 'Descuento de 10% aplicado ✓'; message.style.color = ''; message.classList.add('show'); }
  } else if (code === '') {
    appliedDiscount = 0;
    if (message) { message.textContent = ''; message.classList.remove('show'); }
  } else {
    appliedDiscount = 0;
    if (message) { message.textContent = 'Código de descuento inválido'; message.style.color = '#ff4444'; message.classList.add('show'); }
  }

  updateOrderSummary();
}

// ---------- Update order summary ----------
function updateOrderSummary() {
  const subtotal = (cartItems || []).reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
  const discountAmount = Math.round(subtotal * (appliedDiscount / 100));
  const subtotalAfterDiscount = subtotal - discountAmount;
  const shipping = subtotalAfterDiscount > 5000 ? 0 : 150;
  const tax = Math.round(subtotalAfterDiscount * 0.21);
  const total = subtotalAfterDiscount + shipping + tax;

  const elSubtotal = document.getElementById('subtotal');
  const elTax = document.getElementById('tax');
  const elShipping = document.getElementById('shipping');
  const elTotal = document.getElementById('total');

  if (elSubtotal) elSubtotal.textContent = `$${subtotal.toLocaleString()}`;
  if (elTax) elTax.textContent = `$${tax.toLocaleString()}`;
  if (elShipping) elShipping.textContent = shipping === 0 ? 'Gratis' : `$${shipping}`;
  if (elTotal) elTotal.textContent = `$${total.toLocaleString()}`;

  const discountRow = document.getElementById('discountRow');
  if (appliedDiscount > 0 && discountRow) {
    discountRow.style.display = 'flex';
    const dPct = document.getElementById('discountPercent');
    const dAmt = document.getElementById('discountAmount');
    if (dPct) dPct.textContent = String(appliedDiscount);
    if (dAmt) dAmt.textContent = `-$${discountAmount.toLocaleString()}`;
  } else if (discountRow) {
    discountRow.style.display = 'none';
  }
}

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
function renderCart() {
  const container = document.getElementById('productsContainer');
  if (!container) return;
  container.innerHTML = '';

  if (!cartItems || cartItems.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <p class="cart-empty-title">Tu carrito está vacío</p>
        <p class="cart-empty-sub">Explora nuestros modelos y agrega el que prefieras</p>
        <a class="btn" href="index.html">Volver a la tienda</a>
      </div>
    `;
    const itemCountEl = document.getElementById('itemCount');
    if (itemCountEl) itemCountEl.textContent = 0;
    updateOrderSummary();
    return;
  }

  // --- AGRUPAR POR ID (sumar quantities) para evitar duplicados ---
  const grouped = {};
  cartItems.forEach(item => {
    const key = String(item.id ?? 'unknown');
    if (!grouped[key]) {
      grouped[key] = {
        id: key,
        name: item.name ?? 'Producto',
        price: Number(item.price) || 0,
        image: item.image || '',
        specs: item.specs || '',
        quantity: Number(item.quantity) || 0
      };
    } else {
      // sumar quantity si hay entradas duplicadas en storage
      grouped[key].quantity = Number(grouped[key].quantity || 0) + (Number(item.quantity) || 0);
      // actualizar campos si faltaban
      if ((!grouped[key].name || grouped[key].name === 'Producto') && item.name) grouped[key].name = item.name;
      if ((!grouped[key].price || grouped[key].price === 0) && item.price) grouped[key].price = Number(item.price);
      if (!grouped[key].image && item.image) grouped[key].image = item.image;
      if (!grouped[key].specs && item.specs) grouped[key].specs = item.specs;
    }
  });

  // Convertir grouped a array ordenado (mantener orden original aproximado)
  const itemsToRender = Object.values(grouped);

  // --- renderizar items únicos ---
 


  // Delegación de eventos (cantidad / eliminar) - reaplicar listeners
  container.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      const item = cartItems.find(x => String(x.id) === String(id));
      if (!item) return;
      if (action === 'decrease') updateQuantity(id, Number(item.quantity) - 1);
      if (action === 'increase') updateQuantity(id, Number(item.quantity) + 1);
    });
  });

  container.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      removeFromCart(id);
    });
  });

  const itemCountEl = document.getElementById('itemCount');
  if (itemCountEl) itemCountEl.textContent = cartItems.length;
}

/* cart-script.js - Versión reforzada */

/* ---------- Helper: formato Euro (es-ES) ---------- */
function formatPrice(value) {
  const v = Number(value) || 0;
  return v.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

/* ---------- Storage key ---------- */
const CART_KEY = 'cart';

/* ---------- Load & save con coerción ---------- */
function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Coerce types: asegurar number en price y quantity
    return parsed.map(item => ({
      id: String(item.id ?? item.sku ?? item.name ?? Date.now()),
      name: item.name ?? 'Producto',
      price: Number(item.price) || 0,
      quantity: Math.max(0, Number(item.quantity) || 0),
      image: item.image || '',
      specs: item.specs || ''
    }));
  } catch (e) {
    console.warn('Error reading cart from storage:', e);
    return [];
  }
}

function saveCartToStorage(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.warn('Error saving cart to storage:', e);
  }
}

/* ---------- Estado local ---------- */

/* ---------- Inicialización ---------- */


/* ---------- Util: agrupar por id (suma cantidades) ---------- */
function groupCartItems(items) {
  const grouped = {};
  (items || []).forEach(item => {
    const key = String(item.id ?? 'unknown');
    if (!grouped[key]) {
      grouped[key] = {
        id: key,
        name: item.name ?? 'Producto',
        price: Number(item.price) || 0,
        image: item.image || '',
        specs: item.specs || '',
        quantity: Number(item.quantity) || 0
      };
    } else {
      grouped[key].quantity += Number(item.quantity) || 0;
      // completar datos si faltan
      if ((!grouped[key].name || grouped[key].name === 'Producto') && item.name) grouped[key].name = item.name;
      if ((!grouped[key].price || grouped[key].price === 0) && item.price) grouped[key].price = Number(item.price);
      if (!grouped[key].image && item.image) grouped[key].image = item.image;
      if (!grouped[key].specs && item.specs) grouped[key].specs = item.specs;
    }
  });
  return Object.values(grouped);
}

/* ---------- Render del carrito (agrupa y muestra cantidades correctas) ---------- */
function renderCart() {
  const container = document.getElementById('productsContainer');
  if (!container) return;
  container.innerHTML = '';

  if (!cartItems || cartItems.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <p class="cart-empty-title">Tu carrito está vacío</p>
        <p class="cart-empty-sub">Explora nuestros modelos y agrega el que prefieras</p>
        <a class="btn" href="index.html">Volver a la tienda</a>
      </div>
    `;
    updateItemCountDisplay();
    updateOrderSummary();
    return;
  }

  // Nos aseguramos de que cartItems esté agrupado
  cartItems = groupCartItems(cartItems);
  // Renderizar cada item agrupado
  cartItems.forEach(item => {
    const wrapper = document.createElement('div');
    wrapper.className = 'product-item';
    wrapper.setAttribute('data-id', item.id);
    wrapper.innerHTML = `
      <div class="product-image"><img src="${escapeHtml(item.image || '')}" alt="${escapeHtml(item.name)}"></div>
      <div class="product-info">
        <div class="product-title-row">
          <h3 class="product-name">${escapeHtml(item.name)}</h3>
          <div class="product-specs">${escapeHtml(item.specs || '')}</div>
        </div>

        <div class="product-actions">
          <div class="quantity-selector">
            <button class="qty-btn" data-action="decrease" data-id="${item.id}">−</button>
            <div class="qty-display" aria-live="polite">${Number(item.quantity)}</div>
            <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
          </div>

          <div class="product-price-box">
            <div class="price-total">${formatPrice(Number(item.price) * Number(item.quantity))}</div>
            <div class="price-unit">${formatPrice(item.price)} / unidad</div>
          </div>

          <button class="remove-btn" data-action="remove" data-id="${item.id}" aria-label="Eliminar producto">Eliminar</button>
        </div>
      </div>
    `;
    container.appendChild(wrapper);
  });

  // Guardar agrupado en storage para limpiar duplicados antiguos
  saveCartToStorage(cartItems);

  // Delegar eventos (cantidad/eliminar)
  container.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      const target = cartItems.find(x => String(x.id) === String(id));
      if (!target) return;
      if (action === 'decrease') updateQuantity(id, Number(target.quantity) - 1);
      if (action === 'increase') updateQuantity(id, Number(target.quantity) + 1);
    });
  });

  container.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      removeFromCart(id);
    });
  });

  updateItemCountDisplay();
  updateOrderSummary();
}

/* ---------- Actualizar cantidad (asegurarse de number y salvar) ---------- */
function updateQuantity(productId, newQuantity) {
  const id = String(productId);
  newQuantity = Number(newQuantity) || 0;
  if (newQuantity <= 0) {
    removeFromCart(id);
    return;
  }
  const item = cartItems.find(it => String(it.id) === id);
  if (item) {
    item.quantity = newQuantity;
    saveCartToStorage(cartItems);
    renderCart(); // re-render con valores actualizados
    updateOrderSummary();
  }
}

/* ---------- Eliminar ---------- */
function removeFromCart(productId) {
  const id = String(productId);
  cartItems = (cartItems || []).filter(it => String(it.id) !== id);
  saveCartToStorage(cartItems);
  renderCart();
  updateOrderSummary();
}

/* ---------- Contador: suma de quantities (no lines) ---------- */
function updateItemCountDisplay() {
  const itemCountEl = document.getElementById('itemCount');
  const totalQuantity = (cartItems || []).reduce((s, it) => s + (Number(it.quantity) || 0), 0);
  if (itemCountEl) itemCountEl.textContent = totalQuantity;
  // También actualizar título que muestra "X producto(s)" si existe
  const titleCount = document.querySelector('.cart-title-count');
  if (titleCount) titleCount.textContent = `${totalQuantity} producto(s)`;
}

/* ---------- Descuentos (mantener) ---------- */
function applyDiscount() {
  const code = (document.getElementById('discountCode') && document.getElementById('discountCode').value || '').toUpperCase();
  const message = document.getElementById('discountMessage');

  if (code === 'LUMENYX10') {
    appliedDiscount = 10;
    if (message) { message.textContent = 'Descuento 10% aplicado ✓'; message.style.color = ''; message.classList.add('show'); }
  } else if (code === '') {
    appliedDiscount = 0;
    if (message) { message.textContent = ''; message.classList.remove('show'); }
  } else {
    appliedDiscount = 0;
    if (message) { message.textContent = 'Código inválido'; message.style.color = '#ff4444'; message.classList.add('show'); }
  }
  updateOrderSummary();
}

/* ---------- Resumen del pedido ---------- */
function updateOrderSummary() {
  const subtotal = (cartItems || []).reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
  const discountAmount = Math.round(subtotal * (appliedDiscount / 100));
  const subtotalAfterDiscount = subtotal - discountAmount;
  const shipping = subtotalAfterDiscount > 5000 ? 0 : 150;
  const tax = Math.round(subtotalAfterDiscount * 0.21);
  const total = subtotalAfterDiscount + shipping + tax;

  const elSubtotal = document.getElementById('subtotal');
  const elTax = document.getElementById('tax');
  const elShipping = document.getElementById('shipping');
  const elTotal = document.getElementById('total');

  if (elSubtotal) elSubtotal.textContent = formatPrice(subtotal);
  if (elTax) elTax.textContent = formatPrice(tax);
  if (elShipping) elShipping.textContent = shipping === 0 ? 'Gratis' : formatPrice(shipping);
  if (elTotal) elTotal.textContent = formatPrice(total);

  const discountRow = document.getElementById('discountRow');
  if (appliedDiscount > 0 && discountRow) {
    discountRow.style.display = 'flex';
    const dPct = document.getElementById('discountPercent');
    const dAmt = document.getElementById('discountAmount');
    if (dPct) dPct.textContent = String(appliedDiscount);
    if (dAmt) dAmt.textContent = '-' + formatPrice(discountAmount);
  } else if (discountRow) {
    discountRow.style.display = 'none';
  }
}

/* ---------- Escape helper ---------- */
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"'`=\/]/g, function (s) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '=': '&#x3D;',
      '`': '&#x60;'
    })[s];
  });
}

/* cart-script.js - versión reforzada para precios y totales */

/* ---------- Helper: formato Euro (es-ES) ---------- */
function formatPrice(value) {
  const v = Number(value) || 0;
  return v.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

/* ---------- Storage key ---------- */

/* ---------- Load & save con coerción y limpieza ---------- */
function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Coerce types: asegurar number en price y quantity
    const normalized = parsed.map(item => ({
      id: String(item.id ?? item.sku ?? item.name ?? Date.now()),
      name: item.name ?? 'Producto',
      price: Number(item.price) || 0,
      quantity: Math.max(0, Number(item.quantity) || 0),
      image: item.image || '',
      specs: item.specs || ''
    }));
    return normalized;
  } catch (e) {
    console.warn('Error leyendo cart desde storage:', e);
    return [];
  }
}

function saveCartToStorage(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.warn('Error guardando cart en storage:', e);
  }
}

/* ---------- Estado local ---------- */
let cartItems = []; // cargado en DOMContentLoaded
let appliedDiscount = 0;

/* ---------- Util: agrupar por id (suma cantidades) ---------- */
function groupCartItems(items) {
  const grouped = {};
  (items || []).forEach(item => {
    const key = String(item.id ?? 'unknown');
    if (!grouped[key]) {
      grouped[key] = {
        id: key,
        name: item.name ?? 'Producto',
        price: Number(item.price) || 0,
        image: item.image || '',
        specs: item.specs || '',
        quantity: Number(item.quantity) || 0
      };
    } else {
      grouped[key].quantity += Number(item.quantity) || 0;
      if ((!grouped[key].name || grouped[key].name === 'Producto') && item.name) grouped[key].name = item.name;
      if ((!grouped[key].price || grouped[key].price === 0) && item.price) grouped[key].price = Number(item.price);
      if (!grouped[key].image && item.image) grouped[key].image = item.image;
      if (!grouped[key].specs && item.specs) grouped[key].specs = item.specs;
    }
  });
  return Object.values(grouped);
}

/* ---------- Inicialización ---------- */
document.addEventListener('DOMContentLoaded', function() {
  // Cargar desde storage y normalizar
  cartItems = loadCartFromStorage();
  // Si en storage había datos inconsistentes, los agrupamos/normalizamos
  cartItems = groupCartItems(cartItems);
  // Guardar la versión saneada (evita que vuelvan duplicados antiguos)
  saveCartToStorage(cartItems);

  // Depuración: ver qué hay al iniciar
  // (Quitar o comentar estas líneas si no las necesitás)
  console.info('DEBUG: cartItems al iniciar:', JSON.parse(JSON.stringify(cartItems)));

  renderCart();
  updateOrderSummary();

  const discountInput = document.getElementById('discountCode');
  if (discountInput) {
    discountInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') applyDiscount();
    });
  }
});

/* ---------- Render del carrito ---------- */
function renderCart() {
  const container = document.getElementById('productsContainer');
  if (!container) return;
  container.innerHTML = '';

  if (!cartItems || cartItems.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <p class="cart-empty-title">Tu carrito está vacío</p>
        <p class="cart-empty-sub">Explora nuestros modelos y agrega el que prefieras</p>
        <a class="btn" href="index.html">Volver a la tienda</a>
      </div>
    `;
    updateItemCountDisplay();
    updateOrderSummary();
    return;
  }

  // Asegurarnos de que cartItems esté agrupado y con types correctos
  cartItems = groupCartItems(cartItems);

  // Renderizar cada item
  cartItems.forEach(item => {
    const wrapper = document.createElement('div');
    wrapper.className = 'product-item';
    wrapper.setAttribute('data-id', item.id);
    wrapper.innerHTML = `
      <div class="product-image"><img src="${escapeHtml(item.image || '')}" alt="${escapeHtml(item.name)}"></div>
      <div class="product-info">
        <div class="product-title-row">
          <h3 class="product-name">${escapeHtml(item.name)}</h3>
          <div class="product-specs">${escapeHtml(item.specs || '')}</div>
        </div>

        <div class="product-actions">
          <div class="quantity-selector">
            <button class="qty-btn" data-action="decrease" data-id="${item.id}">−</button>
            <div class="qty-display" aria-live="polite">${Number(item.quantity)}</div>
            <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
          </div>

          <div class="product-price-box">
            <div class="price-total">${formatPrice(Number(item.price) * Number(item.quantity))}</div>
            <div class="price-unit">${formatPrice(item.price)} / unidad</div>
          </div>

          <button class="remove-btn" data-action="remove" data-id="${item.id}" aria-label="Eliminar producto">Eliminar</button>
        </div>
      </div>
    `;
    container.appendChild(wrapper);
  });

  // Guardar agrupado en storage para limpiar duplicados antiguos
  saveCartToStorage(cartItems);

  // Delegación de eventos (cantidad / eliminar)
  container.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      const target = cartItems.find(x => String(x.id) === String(id));
      if (!target) return;
      if (action === 'decrease') updateQuantity(id, Number(target.quantity) - 1);
      if (action === 'increase') updateQuantity(id, Number(target.quantity) + 1);
    });
  });

  container.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      removeFromCart(id);
    });
  });

  updateItemCountDisplay();
  updateOrderSummary();
}

/* ---------- Actualizar cantidad ---------- */
function updateQuantity(productId, newQuantity) {
  const id = String(productId);
  newQuantity = Number(newQuantity) || 0;
  if (newQuantity <= 0) {
    removeFromCart(id);
    return;
  }
  const item = cartItems.find(it => String(it.id) === id);
  if (item) {
    item.quantity = newQuantity;
    saveCartToStorage(cartItems);
    renderCart(); // re-render con valores actualizados
    updateOrderSummary();
  }
}

/* ---------- Eliminar ---------- */
function removeFromCart(productId) {
  const id = String(productId);
  cartItems = (cartItems || []).filter(it => String(it.id) !== id);
  saveCartToStorage(cartItems);
  renderCart();
  updateOrderSummary();
}

/* ---------- Contador: suma de quantities (no lines) ---------- */
function updateItemCountDisplay() {
  const itemCountEl = document.getElementById('itemCount');
  const totalQuantity = (cartItems || []).reduce((s, it) => s + (Number(it.quantity) || 0), 0);
  if (itemCountEl) itemCountEl.textContent = totalQuantity;
  // título que muestra "X producto(s)" si existe
  const titleCount = document.querySelector('.cart-title-count');
  if (titleCount) titleCount.textContent = `${totalQuantity} producto(s)`;
}

/* ---------- Descuento ---------- */
function applyDiscount() {
  const code = (document.getElementById('discountCode') && document.getElementById('discountCode').value || '').toUpperCase();
  const message = document.getElementById('discountMessage');

  if (code === 'LUMENYX10') {
    appliedDiscount = 10;
    if (message) { message.textContent = 'Descuento 10% aplicado ✓'; message.style.color = ''; message.classList.add('show'); }
  } else if (code === '') {
    appliedDiscount = 0;
    if (message) { message.textContent = ''; message.classList.remove('show'); }
  } else {
    appliedDiscount = 0;
    if (message) { message.textContent = 'Código inválido'; message.style.color = '#ff4444'; message.classList.add('show'); }
  }
  updateOrderSummary();
}

/* ---------- Resumen del pedido ---------- */
function updateOrderSummary() {
  // subtotal = suma(price * quantity)
  const subtotal = (cartItems || []).reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 0)), 0);

  const discountAmount = Math.round(subtotal * (appliedDiscount / 100));
  const subtotalAfterDiscount = subtotal - discountAmount;
  const shipping = subtotalAfterDiscount > 5000 ? 0 : 150; // regla ejemplo
  const tax = Math.round(subtotalAfterDiscount * 0.21);
  const total = subtotalAfterDiscount + shipping + tax;

  // Depuración: ver valores que influyen en el total
  console.info('DEBUG totals -> subtotal:', subtotal, 'discount:', discountAmount, 'shipping:', shipping, 'tax:', tax, 'total:', total);

  const elSubtotal = document.getElementById('subtotal');
  const elTax = document.getElementById('tax');
  const elShipping = document.getElementById('shipping');
  const elTotal = document.getElementById('total');

  if (elSubtotal) elSubtotal.textContent = formatPrice(subtotal);
  if (elTax) elTax.textContent = formatPrice(tax);
  if (elShipping) elShipping.textContent = shipping === 0 ? 'Gratis' : formatPrice(shipping);
  if (elTotal) elTotal.textContent = formatPrice(total);

  const discountRow = document.getElementById('discountRow');
  if (appliedDiscount > 0 && discountRow) {
    discountRow.style.display = 'flex';
    const dPct = document.getElementById('discountPercent');
    const dAmt = document.getElementById('discountAmount');
    if (dPct) dPct.textContent = String(appliedDiscount);
    if (dAmt) dAmt.textContent = '-' + formatPrice(discountAmount);
  } else if (discountRow) {
    discountRow.style.display = 'none';
  }
}

/* ---------- Escape helper ---------- */
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"'`=\/]/g, function (s) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '=': '&#x3D;',
      '`': '&#x60;'
    })[s];
  });
}

/* ---------- Debug helper (opcional) ----------
   Ejecutá esto en la consola si querés ver el JSON actual del carrito:
   JSON.stringify(JSON.parse(localStorage.getItem('cart')||'[]'), null, 2)
*/


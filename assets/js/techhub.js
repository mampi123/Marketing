// Datos de ejemplo (simulando base de datos)
const episodes = [
  {
    id: 1,
    title: "IA para PYMES: Automatización sin dolor",
    duration: "24:15",
    date: "15 Nov 2025",
    image: "developer-setup.jpg",
    desc: "Descubre cómo implementar herramientas de IA en tu pequeño negocio sin necesidad de un equipo técnico. Casos reales de ahorro de tiempo.",
    tags: ["pymes", "ia"],
    takeaways: [
      "Herramientas gratuitas para empezar hoy",
      "Automatización de correos y citas",
      "Cómo evitar estafas de 'consultores IA'"
    ],
    mentioned: [
      { name: "Consultoría PYME", url: "#" },
      { name: "Mini PC Office", url: "#" }
    ]
  },
  {
    id: 2,
    title: "¿Qué hardware necesito para Deep Learning?",
    duration: "42:30",
    date: "10 Nov 2025",
    image: "gpu-hardware.jpg",
    desc: "Analizamos las mejores configuraciones de GPU para 2025. ¿Vale la pena invertir en una 4090 o esperar a la nueva generación?",
    tags: ["hardware", "advanced"],
    takeaways: [
      "VRAM vs RAM del sistema",
      "Configuraciones recomendadas por presupuesto",
      "Refrigeración líquida: ¿necesaria?"
    ],
    mentioned: [
      { name: "Workstation Pro", url: "#" },
      { name: "NVIDIA RTX 4090", url: "#" }
    ]
  },
  {
    id: 3,
    title: "El futuro de la automatización en almacenes",
    duration: "31:05",
    date: "05 Nov 2025",
    image: "warehouse-automation.jpg",
    desc: "Entrevista con expertos en logística sobre cómo los robots autónomos están cambiando la gestión de inventario.",
    tags: ["automation", "advanced"],
    takeaways: [
      "Robots colaborativos (Cobots)",
      "Software de gestión de stock con IA",
      "ROI en automatización física"
    ],
    mentioned: [
      { name: "Servidores Industriales", url: "#" }
    ]
  }
];

const news = [
  { text: "Nueva serie de procesadores Intel Ultra anunciada para Q1 2026", date: "Hace 2h" },
  { text: "OpenAI lanza modelo optimizado para hardware local", date: "Hace 5h" },
  { text: "Lumenyx abre nuevo centro de soporte en Madrid", date: "Ayer" }
];

// Renderizar Episodios
function renderEpisodes(filter = 'all', searchTerm = '') {
  const container = document.getElementById('episodesList');
  container.innerHTML = '';

  const filtered = episodes.filter(ep => {
    const matchesFilter = filter === 'all' || ep.tags.includes(filter);
    const matchesSearch = ep.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ep.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div class="text-center p-4 text-muted">No se encontraron episodios.</div>';
    return;
  }

  filtered.forEach(ep => {
    const card = document.createElement('article');
    card.className = 'card episode';
    card.innerHTML = `
      <div class="episode-art">
        <img src="${ep.image}" alt="${ep.title}" loading="lazy">
      </div>
      <div class="episode-content">
        <div class="episode-header">
          <div>
            <div class="episode-meta">
              <span>${ep.date}</span>
              <span>•</span>
              <span>${ep.duration}</span>
            </div>
            <h3 class="episode-title">${ep.title}</h3>
          </div>
          <button class="btn btn-primary btn-sm play-btn" data-id="${ep.id}">
            ▶ Escuchar
          </button>
        </div>
        
        <p class="episode-desc">${ep.desc}</p>
        
        <div class="takeaways-box">
          <h5 class="takeaways-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            Puntos Clave
          </h5>
          <ul class="takeaways-list">
            ${ep.takeaways.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </div>

        <div class="mentioned-box">
          <strong>Mencionado:</strong>
          ${ep.mentioned.map(m => `<a href="${m.url}" class="mentioned-link">${m.name}</a>`).join('')}
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Attach events
  document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', () => openPlayer(btn.dataset.id));
  });
}

// Renderizar Noticias
function renderNews() {
  const container = document.getElementById('newsList');
  news.forEach(n => {
    const item = document.createElement('div');
    item.className = 'radar-item';
    item.innerHTML = `
      <div class="radar-dot"></div>
      <div class="radar-content">
        <span class="radar-date">${n.date}</span>
        ${n.text}
      </div>
    `;
    container.appendChild(item);
  });
}

// Player Logic
function openPlayer(id) {
  const ep = episodes.find(e => e.id == id);
  if (!ep) return;

  // Crear player si no existe
  let player = document.getElementById('playerBar');
  if (!player) {
    player = document.createElement('div');
    player.id = 'playerBar';
    player.className = 'player-bar';
    document.body.appendChild(player);
  }

  player.innerHTML = `
    <div class="player-info">
      <img src="${ep.image}" alt="${ep.title}">
      <div class="player-text">
        <h4>${ep.title}</h4>
        <p>Reproduciendo ahora • ${ep.duration}</p>
      </div>
    </div>
    <div class="player-controls">
      <audio controls autoplay style="width: 100%">
        <source src="#" type="audio/mpeg">
        Tu navegador no soporta audio.
      </audio>
    </div>
    <button class="player-close" onclick="document.getElementById('playerBar').classList.remove('active')">
      ✕
    </button>
  `;

  // Forzar reflow para animación
  setTimeout(() => player.classList.add('active'), 10);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  renderEpisodes();
  renderNews();

  // Tabs Filter
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      renderEpisodes(e.target.dataset.filter, document.getElementById('th-search').value);
    });
  });

  // Search
  document.getElementById('th-search').addEventListener('input', (e) => {
    const activeFilter = document.querySelector('.tab.active').dataset.filter;
    renderEpisodes(activeFilter, e.target.value);
  });
});

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

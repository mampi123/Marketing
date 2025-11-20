// Datos de ejemplo (simulando base de datos)
const episodes = [
  {
    id: 1,
    title: "IA para PYMES: Automatización sin dolor",
    duration: "24:15",
    date: "15 Nov 2025",
    image: "developer-setup.jpg",
    desc: "Descubre cómo implementar herramientas de IA en tu pequeño negocio sin necesidad de un equipo técnico. Casos reales de ahorro de tiempo.",
    // en techhub.js dentro del objeto del episodio correspondiente
    audio: "Plan_secreto_de_LUMENYX_vender_IA_a_pymes (1).m4a",
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
    audio: "Inversión_IA_2025_GPU_VRAM_manda.m4a",
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
    audio: "Almacenes_del_Futuro_Cobots_e_IA_para_PYMES (1).m4a",
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
            Escuchar
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

// funciones para controlar el reproductor
function openPlayer(ep) {
  const bar = document.getElementById('playerBar');
  const audio = document.getElementById('audioPlayer');
  const image = document.getElementById('playerImage');
  const title = document.getElementById('playerTitle');
  const time = document.getElementById('playerTime');

  if (!ep) return alert('Episodio no encontrado');

  image.src = ep.image || '';
  title.textContent = ep.title || 'Podcast';
  time.textContent = (ep.duration ? (ep.duration + ' • ') : '') + (ep.date || '');

  // asigna la fuente de audio (m4a, mp3 o mp4)
  audio.src = ep.audio || ep.video || '';
  audio.load();
  // intenta reproducir; si el navegador bloquea autoplay, el usuario deberá pulsar play en el control
  audio.play().catch(() => {/* autoplay puede estar bloqueado; el usuario pulsa play */});

  bar.classList.add('active');
  bar.setAttribute('aria-hidden', 'false');
}

function closePlayer() {
  const bar = document.getElementById('playerBar');
  const audio = document.getElementById('audioPlayer');
  if (audio) {
    audio.pause();
    audio.src = '';
  }
  bar.classList.remove('active');
  bar.setAttribute('aria-hidden', 'true');
}

// escucha clicks en los botones "Escuchar" (delegación)
document.addEventListener('click', function(e){
  const btn = e.target.closest('.play-btn');
  if (!btn) return;
  const id = parseInt(btn.dataset.id, 10);
  const ep = episodes.find(x => x.id === id);
  if (!ep) { alert('Episodio no encontrado'); return; }
  if (!ep.audio && !ep.video) { alert('Aún no hay archivo para este episodio'); return; }
  openPlayer(ep);
});

// cerrar player (botón)
document.getElementById('playerCloseBtn')?.addEventListener('click', closePlayer);

// ---------------------------
// Mejora cierre del player
// ---------------------------

function closePlayer() {
  const bar = document.getElementById('playerBar');
  const audio = document.getElementById('audioPlayer');

  if (!bar) return;
  // Pausa y resetea el audio
  if (audio) {
    try {
      audio.pause();
      audio.currentTime = 0;
      // Limpia la fuente para liberar recursos
      audio.removeAttribute('src');
      audio.load();
    } catch (err) {
      console.warn('Error al parar el audio:', err);
    }
  }

  // Oculta el player
  bar.classList.remove('active');
  bar.setAttribute('aria-hidden', 'true');
}

// Aseguramos listeners cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Botón X
  const btnClose = document.getElementById('playerCloseBtn');
  if (btnClose) {
    btnClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closePlayer();
    });
  }

  // Cerrar al presionar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const bar = document.getElementById('playerBar');
      if (bar && bar.classList.contains('active')) closePlayer();
    }
  });

  // Cerrar al hacer click fuera del player (pero no cuando clicas en botones "Escuchar")
  document.addEventListener('click', (e) => {
    const bar = document.getElementById('playerBar');
    if (!bar) return;
    if (!bar.classList.contains('active')) return;

    // Si el click NO está dentro del player y NO es un click en un .play-btn -> cerrar
    const clickedInsidePlayer = !!e.target.closest('#playerBar');
    const clickedPlayBtn = !!e.target.closest('.play-btn');

    if (!clickedInsidePlayer && !clickedPlayBtn) {
      closePlayer();
    }
  }, true);

  // Si el audio termina, ocultar player automáticamente
  const audioEl = document.getElementById('audioPlayer');
  if (audioEl) {
    audioEl.addEventListener('ended', () => {
      closePlayer();
    });
  }
});

const news = [
  {
    text: "Nueva serie de procesadores Intel Ultra anunciada para Q1 2026",
    date: "Hace 2h",
    url: "https://www.estrategiasdeinversion.com/actualidad/noticias/bolsa-eeuu/intel-presenta-su-nuevo-chip-core-ultra-serie-n-852877"
  },
  {
    text: "OpenAI lanza modelo optimizado para hardware local",
    date: "Hace 5h",
    url: "https://es.digitaltrends.com/computadoras/el-modelo-abierto-de-openai-ya-esta-disponible-en-windows/"
  },
  {
    text: "Quantax utilizará la IA para ayudar a pymes y autónomos a emitir factura electrónica a partir de 2026",
    date: "Ayer",
    url: "https://www.msn.com/es-es/dinero/noticias/quantax-utilizar%C3%A1-la-ia-para-ayudar-a-pymes-y-aut%C3%B3nomos-a-emitir-factura-electr%C3%B3nica-a-partir-de-2026/ar-AA1QJTZm?ocid=BingNewsVerp" // cámbialo si quieres
  }
];

function renderNews() {
  const container = document.getElementById('newsList');
  if (!container) return;

  container.innerHTML = news.map(n => `
    <div class="radar-item">
      <a href="${n.url}" target="_blank" rel="noopener">
        <span class="radar-dot"></span>
        <div class="radar-content">
          <div class="radar-date">${n.date}</div>
          <div class="radar-text">${n.text}</div>
        </div>
      </a>
    </div>
  `).join('');
}

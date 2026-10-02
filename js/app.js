/**
 * Main Application Orchestrator for Arjun Balaji S Portfolio
 */
document.addEventListener('DOMContentLoaded', () => {

  // 1. Initialize Engines
  if (window.threeScene) window.threeScene.init();
  if (window.scrollEngine) window.scrollEngine.init();

  // 2. Render Distinct Columns: Projects, Hackathons, Achievements
  renderPortfolioColumns();

  // 3. Bind UI Controls
  bindUIControls();

  // 4. Interactive Hero Deck Card Handlers
  initDeckCardInteractions();

  // 5. Keyboard Navigation Shortcuts & Back to Top Button
  initKeyboardNav();

});

/**
 * Render Projects, Hackathons, and Achievements in separate grid columns
 */
function renderPortfolioColumns() {
  // 1. PROJECTS COLUMN
  const projectsGrid = document.getElementById('projects-grid');
  if (projectsGrid && typeof PROJECTS_DATA !== 'undefined') {
    projectsGrid.innerHTML = PROJECTS_DATA.map(item => `
      <div class="gallery-card group relative p-6 rounded-2xl bg-[#18191d] border border-white/10 hover:border-[#ea3829]/60 cursor-pointer overflow-hidden transition-all duration-300" data-id="${item.id}">
        <div class="flex justify-between items-center mb-6">
          <div class="w-10 h-10 rounded-xl bg-[#ea3829] flex items-center justify-center text-white">
            <i data-lucide="${item.icon}" class="w-5 h-5"></i>
          </div>
          <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400">
            Z: ${item.depth}
          </span>
        </div>
        <span class="text-[10px] font-mono uppercase tracking-widest text-[#ea3829] mb-1 block">${item.categoryLabel}</span>
        <h3 class="font-title text-xl text-white mb-2 group-hover:text-[#ea3829] transition-colors">${item.title}</h3>
        <p class="text-gray-400 text-xs leading-relaxed mb-6">${item.desc}</p>
        <div class="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-400">
          <span class="font-mono text-gray-400">${item.stats}</span>
          <span class="flex items-center gap-1 font-bold text-white group-hover:text-[#ea3829] transition-colors">
            Inspect Project
            <i data-lucide="arrow-up-right" class="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></i>
          </span>
        </div>
      </div>
    `).join('');

    projectsGrid.querySelectorAll('.gallery-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const item = PROJECTS_DATA.find(i => i.id === id);
        if (item) openModal(item);
      });
    });
  }

  // 2. HACKATHONS COLUMN
  const hackathonsGrid = document.getElementById('hackathons-grid');
  if (hackathonsGrid && typeof HACKATHONS_DATA !== 'undefined') {
    hackathonsGrid.innerHTML = HACKATHONS_DATA.map(item => `
      <div class="group relative p-6 rounded-2xl bg-[#141519] border border-white/10 hover:border-purple-500/60 cursor-pointer transition-all duration-300">
        <div class="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6">
          <i data-lucide="${item.icon}" class="w-5 h-5"></i>
        </div>
        <span class="text-[10px] font-mono uppercase tracking-widest text-purple-400 mb-1 block">${item.subtitle}</span>
        <h3 class="font-title text-xl text-white mb-3 group-hover:text-purple-300 transition-colors">${item.title}</h3>
        <p class="text-gray-400 text-xs leading-relaxed">${item.desc}</p>
      </div>
    `).join('');
  }

  // 3. ACHIEVEMENTS COLUMN
  const achievementsGrid = document.getElementById('achievements-grid');
  if (achievementsGrid && typeof ACHIEVEMENTS_DATA !== 'undefined') {
    achievementsGrid.innerHTML = ACHIEVEMENTS_DATA.map(item => `
      <div class="group relative p-6 rounded-2xl bg-[#18191d] border border-white/10 hover:border-amber-500/60 cursor-pointer transition-all duration-300">
        <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6">
          <i data-lucide="${item.icon}" class="w-5 h-5"></i>
        </div>
        <span class="text-[10px] font-mono uppercase tracking-widest text-amber-400 mb-1 block">${item.subtitle}</span>
        <h3 class="font-title text-xl text-white mb-3 group-hover:text-amber-300 transition-colors">${item.title}</h3>
        <p class="text-gray-400 text-xs leading-relaxed">${item.desc}</p>
      </div>
    `).join('');
  }

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Interactive Controls Setup
 */
function bindUIControls() {
  const btnAudio = document.getElementById('btn-audio');
  if (btnAudio) {
    btnAudio.addEventListener('click', () => {
      if (window.spatialAudio) {
        const isMuted = !window.spatialAudio.toggle();
        const icon = document.getElementById('audio-icon');
        if (icon) {
          icon.setAttribute('data-lucide', isMuted ? 'volume-x' : 'volume-2');
        }
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  const modalClose = document.getElementById('modal-close');
  const modalContainer = document.getElementById('modal-container');
  if (modalClose && modalContainer) {
    modalClose.addEventListener('click', closeModal);
    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer) closeModal();
    });
  }
}

/**
 * 3D Fan Deck Mouse Tilt & Click Modal Handlers
 */
function initDeckCardInteractions() {
  const deck = document.getElementById('portfolio-deck');
  if (!deck) return;

  deck.querySelectorAll('.fan-card').forEach(card => {
    card.addEventListener('click', () => {
      if (window.spatialAudio) window.spatialAudio.playClick();
      const cardTitle = card.querySelector('h3') ? card.querySelector('h3').innerText : 'PROJECT';
      openModal({
        title: cardTitle,
        categoryLabel: 'FEATURED PROJECT / ACHIEVEMENT',
        icon: 'box',
        details: 'Full-stack software engineering project & achievement by Arjun Balaji S (M.Sc. Software Systems, CIT Coimbatore).',
        tags: ['React', 'Angular', 'Node.js', 'PostgreSQL', 'TypeScript'],
        stats: 'Full-Stack SDE',
        depth: '+50px'
      });
    });
  });
}

/**
 * Keyboard Navigation Shortcuts & Back to Top Button
 */
function initKeyboardNav() {
  window.addEventListener('keydown', (e) => {
    if (e.key === '1') {
      document.querySelector('#hero').scrollIntoView({ behavior: 'smooth' });
    } else if (e.key === '2') {
      document.querySelector('#projects-section').scrollIntoView({ behavior: 'smooth' });
    } else if (e.key === '3') {
      document.querySelector('#hackathons-section').scrollIntoView({ behavior: 'smooth' });
    } else if (e.key === '4') {
      document.querySelector('#achievements-section').scrollIntoView({ behavior: 'smooth' });
    }
  });

  const btnTop = document.getElementById('btn-back-top');
  if (btnTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btnTop.classList.remove('opacity-0', 'pointer-events-none');
        btnTop.classList.add('opacity-100');
      } else {
        btnTop.classList.add('opacity-0', 'pointer-events-none');
        btnTop.classList.remove('opacity-100');
      }
    });

    btnTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/**
 * Open Glass Inspector Modal
 */
function openModal(item) {
  const container = document.getElementById('modal-container');
  const content = document.getElementById('modal-content');
  const card = document.getElementById('modal-card');
  if (!container || !content || !card) return;

  content.innerHTML = `
    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 rounded-xl bg-[#ea3829] flex items-center justify-center text-white">
        <i data-lucide="${item.icon || 'box'}" class="w-5 h-5"></i>
      </div>
      <div>
        <span class="text-xs font-mono text-[#ea3829] uppercase tracking-widest block">${item.categoryLabel || 'PROJECT'}</span>
        <h2 class="font-title font-extrabold text-2xl text-white">${item.title}</h2>
      </div>
    </div>
    <p class="text-gray-300 text-sm leading-relaxed mb-6">${item.details}</p>
    <div class="flex flex-wrap gap-2 mb-6">
      ${(item.tags || ['Full-Stack', 'Software Systems']).map(t => `<span class="px-3 py-1 rounded-lg bg-white/10 text-xs font-mono text-gray-300">${t}</span>`).join('')}
    </div>
    <div class="p-4 rounded-xl bg-black/40 border border-white/10 flex justify-between items-center text-xs font-mono text-gray-400">
      <span>STATS: ${item.stats || 'Full-Stack'}</span>
      <span>Z-AXIS: ${item.depth || '0px'}</span>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  container.classList.remove('opacity-0', 'pointer-events-none');
  card.classList.remove('scale-95');
  card.classList.add('scale-100');

  if (window.spatialAudio) window.spatialAudio.playChime([523.25, 659.25]);
}

function closeModal() {
  const container = document.getElementById('modal-container');
  const card = document.getElementById('modal-card');
  if (!container || !card) return;

  container.classList.add('opacity-0', 'pointer-events-none');
  card.classList.add('scale-95');
  card.classList.remove('scale-100');
}

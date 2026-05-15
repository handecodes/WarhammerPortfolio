const GITHUB_USER = 'handecodes';

const PINNED = [
  'UnstuckApp',
  'TaskBreakdownAPI',
  'OrbitalTransferCalculator',
  'PortfolioPage',
  'Calculator',
  'TaskManager',
  'LibraryDB',
  'BankProjekt',
  'ContactCatalog',
  'Photo_Gallery',
];

const GRIMOIRE_DESC = {
  UnstuckApp:                'AI-powered task breakdown app for ADHD - React + ASP.NET Core microservices + HuggingFace LLM',
  TaskBreakdownAPI:          'AI microservices backend breaking goals into ADHD-friendly microsteps - ASP.NET Core + HuggingFace',
  OrbitalTransferCalculator: 'Navigation rites of the void - calculates delta-V for orbital transfers in C# / .NET 8',
  PortfolioPage:             'This very grimoire you now read - GitHub API + vanilla JS',
  Calculator:                'Arithmetic instruments with Jest tests, ESLint, and full CI/CD via GitHub Actions',
  TaskManager:               'Keeper of oaths and duties',
  LibraryDB:                 'Grand archive of knowledge - C# / .NET 8, Entity Framework Core, SQL Server',
  BankProjekt:               'Treasury of the Administratum - team-built banking system in C# / .NET 8',
  ContactCatalog:            'Registry of known souls - C# with xUnit/Moq tests and layered architecture',
  Photo_Gallery:             'Responsive image gallery - Animals, Nature, Mushrooms and Space collections',
};

const CHAPTER_PAGES = [0, 2, 4, 6];

let pageFlip = null;

function initBook() {
  const container = document.getElementById('bookContainer');
  const book      = document.getElementById('book');

  if (!container || !book) return;

  book.style.display = 'block';

  const isMobile   = window.innerWidth < 700;
  const totalW     = Math.min(container.clientWidth, 1160);

  
  
  const pageW = isMobile
    ? Math.round(totalW * 0.94)
    : Math.round(totalW / 2);
  const pageH = Math.round(pageW * 1.45);

  if (pageFlip) {
    try { pageFlip.destroy(); } catch(e) {}
    pageFlip = null;
  }

  pageFlip = new St.PageFlip(container, {
    width:               pageW,
    height:              pageH,
    size:                'fixed',
    minWidth:            160,
    maxWidth:            580,
    minHeight:           240,
    maxHeight:           850,
    showCover:           false,
    drawShadow:          true,
    flippingTime:        800,
    
    usePortrait:         isMobile,
    startPage:           0,
    autoSize:            false,
    mobileScrollSupport: true,
    swipeDistance:       20,
    clickEventForward:   true,
  });

  pageFlip.loadFromHTML(document.querySelectorAll('.page'));

  
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (prevBtn) prevBtn.addEventListener('click', () => pageFlip.flipPrev('bottom'));
  if (nextBtn) nextBtn.addEventListener('click', () => pageFlip.flipNext('bottom'));

  
  pageFlip.on('flip', (e) => syncTabs(e.data));
  pageFlip.on('changeState', () => {
    const page = pageFlip.getCurrentPageIndex();
    updateButtons(page);
  });

  syncTabs(0);
  updateButtons(0);

  
  
  if (isMobile) {
    setTimeout(scaleMobilePages, 300);
  }
}

function scaleMobilePages() {
  const pages = document.querySelectorAll('.page-content');
  if (!pages.length) return;

  
  const stfParent = document.querySelector('.stf__parent');
  const pageH = stfParent ? stfParent.offsetHeight : window.innerHeight * 0.8;
  const pageW = stfParent ? stfParent.offsetWidth  : window.innerWidth  * 0.94;

  pages.forEach(pc => {
    
    pc.style.transform = 'none';
    pc.style.width     = '100%';

    const naturalH = pc.scrollHeight;
    const naturalW = pc.scrollWidth;

    
    const scaleH = (pageH - 20) / naturalH;
    const scaleW = (pageW - 20) / naturalW;
    const scale  = Math.min(scaleH, scaleW, 1); 

    if (scale < 1) {
      pc.style.transformOrigin = 'top left';
      pc.style.transform       = `scale(${scale})`;
      pc.style.width           = `${100 / scale}%`;
    }
  });
}

function syncTabs(pageIndex) {
  
  let chapterIdx = 0;
  for (let i = CHAPTER_PAGES.length - 1; i >= 0; i--) {
    if (pageIndex >= CHAPTER_PAGES[i]) { chapterIdx = i; break; }
  }

  document.querySelectorAll('.ctab').forEach((btn, i) => {
    btn.classList.toggle('active', i === chapterIdx);
  });
}

function updateButtons(pageIndex) {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (prevBtn) prevBtn.disabled = pageIndex <= 0;
  if (nextBtn) nextBtn.disabled = pageIndex >= 6;
}

function initTabs() {
  const tabs = document.getElementById('chapterTabs');
  if (!tabs) return;

  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-chapter]');
    if (!btn || !pageFlip) return;
    const targetPage = CHAPTER_PAGES[parseInt(btn.dataset.chapter)];
    pageFlip.flip(targetPage, 'bottom');
  });
}

async function loadRepos() {
  const leftEl  = document.getElementById('repoListLeft');
  const rightEl = document.getElementById('repoListRight');
  if (!leftEl || !rightEl) return;

  try {
    const res  = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`);
    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
    const all  = await res.json();

    const repos = all
      .filter(r => PINNED.includes(r.name))
      .sort((a, b) => PINNED.indexOf(a.name) - PINNED.indexOf(b.name));

    if (!repos.length) throw new Error('No matching repos');

    leftEl.innerHTML  = repos.slice(0, 3).map(repoCard).join('');
    rightEl.innerHTML = repos.slice(3).map(repoCard).join('');

  } catch (err) {
    const msg = `<p class="body-text small italic inquisitor-note">The archive is sealed - the machine spirit is unresponsive.</p>`;
    leftEl.innerHTML  = msg;
    rightEl.innerHTML = '';
    console.warn('GitHub API error:', err.message);
  }
}

function repoCard(repo) {
  const desc    = GRIMOIRE_DESC[repo.name] || repo.description || 'A work of the craft';
  const lang    = repo.language || 'Code';
  const stars   = repo.stargazers_count;
  const updated = new Date(repo.updated_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  return `
    <div class="repo-entry">
      <div class="repo-header">
        <a class="repo-name" href="${repo.html_url}" target="_blank" rel="noopener">${repo.name}</a>
        <span class="repo-lang">${lang}</span>
      </div>
      <p class="repo-desc">${desc}</p>
      <div class="repo-meta">
        ${stars ? `<span class="repo-stat">✦ ${stars}</span>` : ''}
        <span class="repo-stat">Updated ${updated}</span>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  
  loadRepos();

  
  initTabs();

  
  requestAnimationFrame(() => {
    setTimeout(initBook, 120);
  });

  
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      initBook();
      if (window.innerWidth < 700) setTimeout(scaleMobilePages, 400);
    }, 420);
  });
});

(function() {
  const btn = document.getElementById('musicBtn');
  if (!btn) return;

  const iconPlay = btn.querySelector('.music-icon-play');
  const iconStop = btn.querySelector('.music-icon-stop');
  const label    = btn.querySelector('.music-label');

  let ytPlayer  = null;
  let apiReady  = false;
  let playing   = false;
  let pendingPlay = false;

  
  window.onYouTubeIframeAPIReady = function() {
    apiReady = true;
    ytPlayer = new YT.Player('ytPlayer', {
      videoId: 'ztzq05IzYds',
      playerVars: {
        autoplay:    0,
        controls:    0,
        disablekb:   1,
        fs:          0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel:         0,
        loop:        1,
        playlist:    'ztzq05IzYds',
        start:       35, 
      },
      events: {
        onReady: function(e) {
          e.target.setVolume(35);
          if (pendingPlay) {
            e.target.playVideo();
            pendingPlay = false;
          }
        },
        onStateChange: function(e) {
          
          if (e.data === YT.PlayerState.PLAYING) {
            setPlaying(true);
          } else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) {
            setPlaying(false);
          }
        }
      }
    });
  };

  function loadYTApi() {
    if (document.getElementById('yt-api-script')) return;
    const s = document.createElement('script');
    s.id  = 'yt-api-script';
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }

  function setPlaying(state) {
    playing = state;
    btn.classList.toggle('playing', state);
    btn.setAttribute('aria-label', state ? 'Stop battle hymn' : 'Play battle hymn');
    btn.setAttribute('title',      state ? 'Stop battle hymn' : 'Play battle hymn');
    iconPlay.style.display = state ? 'none' : 'flex';
    iconStop.style.display = state ? 'flex' : 'none';
    if (label) label.textContent = state ? 'Stop' : 'Hymn';
  }

  btn.addEventListener('click', () => {
    if (!apiReady) {
      pendingPlay = true;
      loadYTApi();
      return;
    }
    if (playing) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  });

  
  
  
  pendingPlay = true;
  loadYTApi();
})();
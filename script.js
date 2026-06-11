const CARD_MIN_WIDTH = 320;
const COL_GAP = 28; // 1.75rem at 16px base

function getColumnCount() {
  const list = document.getElementById('project-list');
  if (!list) return 1;
  const available = list.clientWidth;
  return Math.max(1, Math.floor((available + COL_GAP) / (CARD_MIN_WIDTH + COL_GAP)));
}

function buildColumns(items) {
  const list = document.getElementById('project-list');
  if (!list) return;

  const colCount = getColumnCount();

  // Remove existing column wrappers
  list.querySelectorAll('.project-column').forEach(c => c.remove());

  // Create column divs
  const cols = Array.from({ length: colCount }, () => {
    const col = document.createElement('ul');
    col.className = 'project-column';
    list.appendChild(col);
    return col;
  });

  // Distribute cards left-to-right, top-to-bottom
  items.forEach((item, i) => {
    cols[i % colCount].appendChild(item);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const projectList = document.getElementById('project-list');
  if (!projectList) return;

  try {
    const res = await fetch('./projects.json');
    if (!res.ok) throw new Error('Failed to load projects.json');
    const projects = await res.json();

    if (projects.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.textContent = 'No public projects found.';
      projectList.appendChild(emptyItem);
      return;
    }

    for (const repo of projects) {
      const li = document.createElement('li');

      // Make the whole card clickable
      li.addEventListener('click', () => {
        window.open(repo.html_url, '_blank', 'noopener');
      });

      // 4:3 thumbnail
      if (repo.imageUrl) {
        const thumb = document.createElement('div');
        thumb.className = 'card-thumb';
        const img = document.createElement('img');
        img.src = repo.imageUrl;
        img.alt = `${repo.name} preview`;
        thumb.appendChild(img);
        li.appendChild(thumb);
      }

      // Card body: name only (always visible)
      const body = document.createElement('div');
      body.className = 'card-body';

      const link = document.createElement('a');
      link.href = repo.html_url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = repo.name;
      link.addEventListener('click', e => e.stopPropagation());
      body.appendChild(link);

      li.appendChild(body);

      // Peek drawer: description revealed on hover
      const peek = document.createElement('div');
      peek.className = 'card-peek';

      const desc = document.createElement('p');
      desc.className = 'card-peek-text';
      desc.textContent = repo.description || 'No description available.';
      peek.appendChild(desc);

      li.appendChild(peek);
      projectList.appendChild(li);
    }

    // Build columns after all cards are created
    const allCards = Array.from(projectList.querySelectorAll('li'));
    buildColumns(allCards);
  } catch (error) {
    console.error('Error loading projects:', error);
    const errorItem = document.createElement('li');
    errorItem.textContent = 'Unable to load projects. Please try again later.';
    projectList.appendChild(errorItem);
  }
});

// Rebuild columns on resize (debounced)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const list = document.getElementById('project-list');
    if (!list) return;
    const allCards = Array.from(list.querySelectorAll('li'));
    buildColumns(allCards);
  }, 100);
});

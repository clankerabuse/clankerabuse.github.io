// build.js — run this before deploying to regenerate projects.json
// Fetches public repos and README images at BUILD time, not page-load time.

const fs = require('fs');
const https = require('https');

function request(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'clankerabuse-site-builder' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return request(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(data);
        else reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      });
    }).on('error', reject);
  });
}

async function fetchRepos() {
  const text = await request('https://api.github.com/users/clankerabuse/repos?sort=updated&direction=desc');
  return JSON.parse(text);
}

async function fetchReadme(repo) {
  const branch = repo.default_branch || 'main';
  const variants = ['README.md', 'readme.md', 'Readme.md'];
  for (const file of variants) {
    try {
      const raw = await request(`https://raw.githubusercontent.com/clankerabuse/${repo.name}/${branch}/${file}`);
      return raw;
    } catch {
      // try next variant
    }
  }
  return null;
}

function extractFirstImageUrl(rawContent, repo) {
  if (!rawContent) return null;
  const htmlImgMatch = rawContent.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  const mdImgMatch = rawContent.match(/!\[.*?\]\((.*?)\)/);
  let imgUrl = htmlImgMatch ? htmlImgMatch[1].trim() : (mdImgMatch ? mdImgMatch[1].trim() : null);
  if (!imgUrl) return null;
  if (imgUrl.startsWith('http')) return imgUrl;

  // Resolve relative paths against raw.githubusercontent.com
  const branch = repo.default_branch || 'main';
  if (imgUrl.startsWith('./')) imgUrl = imgUrl.slice(2);
  return `https://raw.githubusercontent.com/clankerabuse/${repo.name}/${branch}/${imgUrl}`;
}

(async () => {
  try {
    const repos = await fetchRepos();
    const filteredRepos = repos.filter(repo => repo.name !== 'clankerabuse.github.io');
    const projects = [];

    for (const repo of filteredRepos) {
      const rawContent = await fetchReadme(repo);
      const imageUrl = extractFirstImageUrl(rawContent, repo);
      projects.push({
        name: repo.name,
        html_url: repo.html_url,
        description: repo.description || '',
        imageUrl,
        updated_at: repo.updated_at
      });
    }

    fs.writeFileSync('projects.json', JSON.stringify(projects, null, 2));
    console.log(`Wrote ${projects.length} projects to projects.json`);
  } catch (err) {
    console.error('Build failed:', err.message);
    process.exit(1);
  }
})();

// script.js
// Hooks & player logic

// DOM elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultsList = document.getElementById('results-list');

const coverEl = document.getElementById('cover');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');

const playBtn = document.getElementById('play');
const playIcon = document.getElementById('play-icon');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

const progressContainer = document.getElementById('progress-container');
const progressEl = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');

const volumeSlider = document.getElementById('volume');
const autoplayCheckbox = document.getElementById('autoplay');

// audio element
const audio = new Audio();
audio.crossOrigin = "anonymous";

let playlist = [];
let currentIndex = -1;
let isPlaying = false;

// Format time
function formatTime(msOrSec) {
  if (!msOrSec && msOrSec !== 0) return "00:00";
  let sec = msOrSec > 1000 ? Math.floor(msOrSec / 1000) : Math.floor(msOrSec);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? "0" + s : s}`;
}

// Render results
function renderResults(list) {
  resultsList.innerHTML = '';
  if (!list.length) {
    resultsList.innerHTML = '<p style="color:var(--muted);">No results found</p>';
    return;
  }
  list.forEach((t, idx) => {
    const li = document.createElement('li');
    li.className = 'result-item';
    li.dataset.index = idx;

    li.innerHTML = `
      <img class="result-thumb" src="${t.artwork}" alt="${escapeHtml(t.title)}">
      <div class="result-meta">
        <h4>${escapeHtml(t.title)}</h4>
        <p>${escapeHtml(t.artist)}</p>
      </div>
      <div class="result-action">
        <img src="assets/paly.svg" alt="play">
      </div>
    `;

    li.addEventListener('click', () => {
      loadPlaylist(list, idx);
      play();
    });

    resultsList.appendChild(li);
  });
}

// Escape text
function escapeHtml(text) {
  return String(text).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

// Load playlist
function loadPlaylist(list, startIndex = 0) {
  playlist = list.slice();
  currentIndex = startIndex;
  loadTrack(currentIndex);
}

// Load track
function loadTrack(index) {
  if (index < 0 || index >= playlist.length) return;
  const t = playlist[index];
  titleEl.textContent = t.title;
  artistEl.textContent = t.artist;
  coverEl.src = t.artwork || 'assets/default-cover.jpg';
  audio.src = t.previewUrl;
  durationEl.textContent = t.duration ? formatTime(t.duration) : '0:00';
  progressEl.style.width = '0%';
  currentTimeEl.textContent = '00:00';
  playIcon.src = 'assets/paly.svg';
  isPlaying = false;
}

// Play song
async function play() {
  try {
    await audio.play();
    isPlaying = true;
    playIcon.src = 'assets/pause.svg';
  } catch (err) {
    console.error('Play error', err);
  }
}

// Pause song
function pause() {
  audio.pause();
  isPlaying = false;
  playIcon.src = 'assets/paly.svg';
}

// Next
function next() {
  if (!playlist.length) return;
  currentIndex = (currentIndex + 1) % playlist.length;
  loadTrack(currentIndex);
  play();
}

// Prev
function prev() {
  if (!playlist.length) return;
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadTrack(currentIndex);
  play();
}

// Search handler (UPDATED)
searchBtn.addEventListener('click', async () => {
  const q = searchInput.value.trim();
  if (!q) return;

  searchBtn.disabled = true;
  searchBtn.textContent = "Searching...";

  const results = await searchiTunes(q, 25);

  // SHOW RESULTS
  renderResults(results);

  // 🔥 AUTOMATICALLY LOAD FULL PLAYLIST + AUTO-PLAY FIRST SONG
  if (results.length > 0) {
    loadPlaylist(results, 0); // load full playlist
    play(); // autoplay first
  }

  searchBtn.disabled = false;
  searchBtn.textContent = "Search";
});

// Enter key triggers search
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchBtn.click();
});

// play/pause
playBtn.addEventListener('click', () => {
  audio.paused ? play() : pause();
});

// Prev/Next buttons
prevBtn.addEventListener('click', prev);
nextBtn.addEventListener('click', next);

// Progress bar update
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;

  const percent = (audio.currentTime / audio.duration) * 100;
  progressEl.style.width = `${percent}%`;

  currentTimeEl.textContent = formatTime(Math.floor(audio.currentTime));
  durationEl.textContent = formatTime(Math.floor(audio.duration));
});

// Seek
progressContainer.addEventListener('click', (e) => {
  const width = progressContainer.clientWidth;
  const clickX = e.offsetX;
  if (audio.duration) audio.currentTime = (clickX / width) * audio.duration;
});

// Volume
volumeSlider.addEventListener('input', () => {
  audio.volume = parseFloat(volumeSlider.value);
});


// Autoplay next track
audio.addEventListener('ended', () => {
  next();
});

// js/app.js

const DATA_URL = 'data/exposants.json';
const ITEMS_PER_PAGE = 20;

let allExposants = [];
let filteredExposants = [];
let currentPage = 1;

/**
 * Debounce utility
 */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Enregistre le Service Worker (reste inchangé)
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => console.log('Service Worker OK'))
      .catch(err => console.error('Erreur SW :', err));
  }
}

/**
 * Charge les exposants depuis IndexedDB ou via fetch
 */
async function loadData() {
  try {
    const exists = await DB.checkDataExists();
    if (exists) {
      allExposants = await DB.getExposants();
    } else {
      const resp = await fetch(DATA_URL);
      const json = await resp.json();                 // on récupère tout l’objet
      allExposants = Array.isArray(json.exposants)
        ? json.exposants
        : [];                                          // on extrait le tableau
      await DB.saveExposants(allExposants);
    }
  } catch (err) {
    console.warn('IndexedDB KO, fallback fetch :', err);
    const resp = await fetch(DATA_URL);
    const json = await resp.json();
    allExposants = Array.isArray(json.exposants) ? json.exposants : [];
  }

  // Initialise le filtre
  filteredExposants = [...allExposants];
}

/**
 * Applique le filtre de recherche
 */
function handleSearch(event) {
  const q = event.target.value.trim().toLowerCase();
  filteredExposants = allExposants.filter(e =>
    e.name.toLowerCase().includes(q)
  );
  currentPage = 1;
  render();
}

/**
 * Change de page
 */
function goToPage(page) {
  currentPage = page;
  render();
}

/**
 * Affiche la grille et la pagination
 */
function render() {
  UI.renderExhibitors(filteredExposants, ITEMS_PER_PAGE, currentPage);
  UI.renderPagination(
    filteredExposants.length,
    ITEMS_PER_PAGE,
    currentPage,
    goToPage
  );
}

/**
 * Point d'entrée de l'application
 */
async function init() {
  registerServiceWorker();
  await loadData();

  // Recherche avec debounce
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', debounce(handleSearch, 300));

  // Init UI
  UI.initialize(allExposants);

  // Premier rendu
  render();
}

document.addEventListener('DOMContentLoaded', init);

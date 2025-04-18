// js/db.js

/**
 * Ouvre (ou crée) la base IndexedDB pour les exposants
 * @returns {Promise<IDBDatabase>}
 */
function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB non supporté'));
        return;
      }
      const request = indexedDB.open('IntersolarDB', 1);
  
      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('exposants')) {
          db.createObjectStore('exposants', { keyPath: 'id', autoIncrement: true });
        }
      };
  
      request.onsuccess = event => resolve(event.target.result);
      request.onerror = event => reject(event.target.error);
    });
  }
  
  /**
   * Vérifie si des données sont déjà stockées
   * @returns {Promise<boolean>}
   */
  async function checkDataExists() {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('exposants', 'readonly');
        const store = tx.objectStore('exposants');
        const countReq = store.count();
        countReq.onsuccess = () => resolve(countReq.result > 0);
        countReq.onerror = () => reject(countReq.error);
      });
    } catch {
      return false; // Fallback si IndexedDB indisponible
    }
  }
  
  /**
   * Récupère tous les exposants depuis IndexedDB
   * @returns {Promise<Array>}
   */
  async function getExposants() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('exposants', 'readonly');
      const store = tx.objectStore('exposants');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  
  /**
   * Sauvegarde la liste d'exposants dans IndexedDB
   * @param {Array} data
   * @returns {Promise<void>}
   */
  async function saveExposants(data) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('exposants', 'readwrite');
      const store = tx.objectStore('exposants');
      // Vider l'ancien cache avant d'ajouter
      store.clear();
      data.forEach(item => store.put(item));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
  
  // Exposer les fonctions sous l’objet global DB
  window.DB = {
    checkDataExists,
    getExposants,
    saveExposants
  };
  
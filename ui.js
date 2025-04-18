// js/ui.js

const UI = (function() {
    // Cache DOM elements
    const exhibitorsContainer = document.getElementById('exhibitors');
    const paginationList    = document.getElementById('pagination-list');
    const modal             = document.getElementById('exhibitor-modal');
    const modalBody         = document.getElementById('modal-body');
    const modalCloseBtn     = modal.querySelector('.modal-close');
    const navToggle         = document.querySelector('.nav-toggle');
    const siteNav           = document.querySelector('.site-nav');
  
    /**
     * Initialise l’UI : navigation mobile, modale…
     * @param {Array} allExposants
     */
    function initialize(allExposants) {
      // Toggle navigation mobile
      navToggle.addEventListener('click', () => {
        document.body.classList.toggle('is-nav-open');
      });
  
      // Modale : fermer
      modalCloseBtn.addEventListener('click', closeModal);
      modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
      });
    }
  
    /**
     * Création et injection des cartes d’exposants
     * @param {Array} data 
     * @param {number} itemsPerPage 
     * @param {number} currentPage 
     */
    function renderExhibitors(data, itemsPerPage, currentPage) {
      exhibitorsContainer.innerHTML = '';
      const start = (currentPage - 1) * itemsPerPage;
      const pageItems = data.slice(start, start + itemsPerPage);
      const fragment = document.createDocumentFragment();
  
      pageItems.forEach(item => {
        fragment.appendChild(createCard(item));
      });
  
      exhibitorsContainer.appendChild(fragment);
    }
  
    /**
     * Crée un élément DOM pour une carte exposant
     * @param {Object} item 
     * @returns {HTMLElement}
     */
    function createCard(item) {
      const tpl = document.createElement('template');
      tpl.innerHTML = `
        <article class="exhibitor-card" data-id="${item.id}">
          <header>${item.name}</header>
          <div class="card-body">
            <p>${item.description || ''}</p>
          </div>
          <div class="card-footer">
            <button 
              class="favorite-btn" 
              aria-label="Ajouter aux favoris" 
              aria-pressed="false">★
            </button>
            <button 
              class="details-btn" 
              aria-label="Voir détails">⋯
            </button>
          </div>
        </article>
      `.trim();
  
      const card = tpl.content.firstChild;
      const favBtn = card.querySelector('.favorite-btn');
      const detBtn = card.querySelector('.details-btn');
  
      favBtn.addEventListener('click', () => toggleFavorite(favBtn, item));
      detBtn.addEventListener('click', () => openModal(item));
  
      return card;
    }
  
    /**
     * Génère la pagination
     * @param {number} totalItems 
     * @param {number} itemsPerPage 
     * @param {number} currentPage 
     * @param {Function} onPageClick 
     */
    function renderPagination(totalItems, itemsPerPage, currentPage, onPageClick) {
      paginationList.innerHTML = '';
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const frag = document.createDocumentFragment();
  
      // Bouton Précédent
      frag.appendChild(createPageButton('Précédent', currentPage > 1, () => onPageClick(currentPage - 1)));
  
      // Numéros de page
      for (let i = 1; i <= totalPages; i++) {
        frag.appendChild(createPageButton(i, i !== currentPage, () => onPageClick(i), i === currentPage));
      }
  
      // Bouton Suivant
      frag.appendChild(createPageButton('Suivant', currentPage < totalPages, () => onPageClick(currentPage + 1)));
  
      paginationList.appendChild(frag);
    }
  
    function createPageButton(label, enabled, onClick, isActive = false) {
      const li = document.createElement('li');
      const a  = document.createElement('a');
      a.href = '#';
      a.textContent = label;
      if (!enabled)        a.classList.add('disabled');
      if (isActive)        a.classList.add('active');
      if (enabled) {
        a.addEventListener('click', e => { e.preventDefault(); onClick(); });
      }
      li.appendChild(a);
      return li;
    }
  
    /**
     * Affiche la modale avec les détails
     * @param {Object} item 
     */
    function openModal(item) {
      modalBody.innerHTML = `
        <h2>${item.name}</h2>
        <p>${item.description || ''}</p>
        ${item.category ? `<p><strong>Catégorie :</strong> ${item.category}</p>` : ''}
        ${item.website ? `<p><a href="${item.website}" target="_blank" rel="noopener">Site web</a></p>` : ''}
      `;
      modal.hidden = false;
    }
  
    function closeModal() {
      modal.hidden = true;
      modalBody.innerHTML = '';
    }
  
    /**
     * Bascule l'état favori (aria-pressed) 
     * @param {HTMLElement} button 
     * @param {Object} item 
     */
    function toggleFavorite(button, item) {
      const pressed = button.getAttribute('aria-pressed') === 'true';
      button.setAttribute('aria-pressed', String(!pressed));
      // TODO : persister dans IndexedDB ou localStorage
    }
  
    return {
      initialize,
      renderExhibitors,
      renderPagination
    };
  })();
  
  window.UI = UI;
  
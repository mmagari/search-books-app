// Keys used to persist data in localStorage.
const STORAGE_KEY = 'api-search-result';
const FAVORITES_KEY = 'favorite-books';

// Main UI elements.
const input = document.getElementById('searchInput');
const button = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const resultContainer = document.getElementById('resultSearch');
const favouriteContainer = document.getElementById('resultFavourite');
const authorFilter = document.getElementById('authorFilter');

// Application state.
// - favorites: saved favorite books
// - allBooks: all fetched books from the latest search
// - selectedAuthor: currently active author filter
let favorites = getSavedFavorites();
let allBooks = [];
let selectedAuthor = 'all';

/**
 * Save search results to localStorage.
 * @param {Array} data
 */
function saveResult(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Read saved search results from localStorage.
 * @returns {Array|null}
 */
function getSavedResult() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Remove saved search results from localStorage.
 */
function clearSavedResult() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Fetch books from Open Library API and map raw data
 * into a smaller structure used by the app.
 * @param {string} query
 * @returns {Promise<Array>}
 */
async function fetchData(query) {
  const response = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  const data = await response.json();

  const filteredData = data.docs.slice(0, 10).map((book) => ({
    key: book.key,
    title: book.title,
    author: book.author_name?.[0] || 'Unknown author',
    firstPublishYear: book.first_publish_year || 'No data',
    cover: book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : null,
  }));

  return filteredData;
}

/**
 * Render search results into the results container.
 * @param {HTMLElement} container
 * @param {Array} books
 */
function renderResult(container, books) {
  if (!books.length) {
    container.innerHTML = '<p>No results.</p>';
    return;
  }

  container.innerHTML = books.map((book) => {
    const favoriteClass = isFavorite(book.key) ? 'card__favorite-btn--active' : '';

    return `
      <article class="results__card">
        <button 
          class="card__favorite-btn ${favoriteClass}" 
          type="button"
          data-key="${book.key}"
          aria-label="Add to favorites"
        >
          <svg
            class="card__favorite-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
          <path
            class="card__favorite-path"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
          </svg>
        </button>

        ${
          book.cover
            ? `<img src="${book.cover}" alt="Book cover for ${book.title}">`
            : `<div class="results__no-cover">No cover</div>`
        }

        <div class="results__card-content">
          <h3 class="results__card-title">${book.title}</h3>
          <p class="results__card-text">${book.author}</p>
          <p class="results__card-text">${book.firstPublishYear}</p>
        </div>
      </article>
    `;
  }).join('');
}

/**
 * Render a generic error or message state.
 * @param {HTMLElement} container
 * @param {string} message
 */
function renderError(container, message) {
  container.innerHTML = `<p>${message}</p>`;
}

/**
 * Save favorites to localStorage.
 * @param {Array} data
 */
function saveFavorites(data) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(data));
}

/**
 * Read saved favorites from localStorage.
 * @returns {Array}
 */
function getSavedFavorites() {
  const raw = localStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Check whether a given book is already in favorites.
 * @param {string} bookKey
 * @returns {boolean}
 */
function isFavorite(bookKey) {
  return favorites.some((book) => book.key === bookKey);
}

/**
 * Add or remove a book from favorites.
 * Then re-render both favorites and the currently filtered results.
 * @param {Object} book
 */
function toggleFavorite(book) {
  const exists = isFavorite(book.key);

  if (exists) {
    favorites = favorites.filter((fav) => fav.key !== book.key);
  } else {
    favorites.push(book);
  }

  saveFavorites(favorites);
  renderFavorites(favouriteContainer, favorites);
  renderResult(resultContainer, getFilteredBooks());
}

/**
 * Render favorites sidebar.
 * @param {HTMLElement} container
 * @param {Array} books
 */
function renderFavorites(container, books) {
  const count = books.length;

  container.innerHTML = `
    <div class="favorites">
      <div class="favorites__header">
        <div class="favorites__header-inner">
          <span class="favorites__header-icon"></span>
          <div class="favorites__header-text">
            <h2 class="favorites__title">Favourites</h2>
            <p class="favorites__count">
              ${count} ${count === 1 ? 'book saved' : 'books saved'}
            </p>
          </div>
        </div>
      </div>

      ${
        count === 0
          ? `<p class="favorites__empty">No favorite books yet.</p>`
          : `
            <div class="favorites__list">
              ${books.map((book) => `
                <div class="favorites__item">
                  ${
                    book.cover
                      ? `
                        <div class="favorites__cover-box">
                          <img
                            class="favorites__cover"
                            src="${book.cover}"
                            alt="Book cover for ${book.title}"
                            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                          />
                          <div class="favorites__no-cover" style="display: none;">No cover</div>
                        </div>
                      `
                      : `
                        <div class="favorites__cover-box">
                          <div class="favorites__no-cover">No cover</div>
                        </div>
                      `
                  } 

                  <div class="favorites__content">
                    <p class="favorites__book-title">${book.title}</p>
                    <p class="favorites__book-author">${book.author}</p>
                    <p class="favorites__book-year">${book.firstPublishYear}</p>
                  </div>

                  <button
                    class="favorites__button"
                    type="button"
                    data-key="${book.key}"
                    aria-label="Remove from favorites"
                  >
                    <svg class="favorites__icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      />
                    </svg>
                  </button>
                </div>
              `).join('')}
            </div>
          `
      }
    </div>
  `;
}

/**
 * Render the author filter based on current search results.
 * Hidden when there are no valid authors to filter by.
 * @param {Array} books
 */
function renderAuthorFilter(books) {
  const authors = [...new Set(
    books
      .map((book) => book.author)
      .filter((author) => author && author !== 'Unknown author')
  )].sort();

  if (!books.length || authors.length === 0) {
    authorFilter.classList.add('is-hidden');
    authorFilter.innerHTML = '<option value="all">All authors</option>';
    return;
  }

  authorFilter.classList.remove('is-hidden');
  authorFilter.innerHTML = `
    <option value="all">All authors</option>
    ${authors.map((author) => `<option value="${author}">${author}</option>`).join('')}
  `;
}

/**
 * Return currently visible books based on active author filter.
 * @returns {Array}
 */
function getFilteredBooks() {
  if (selectedAuthor === 'all') {
    return allBooks;
  }

  return allBooks.filter((book) => book.author === selectedAuthor);
}

/* ---------- Initial render ---------- */

// Restore saved search results on page load.
const saved = getSavedResult();
if (saved) {
  allBooks = saved;
  renderAuthorFilter(allBooks);
  renderResult(resultContainer, getFilteredBooks());
}

// Always render favorites on page load.
renderFavorites(favouriteContainer, favorites);

/* ---------- Events ---------- */

// Search button click.
button.addEventListener('click', async () => {
  const query = input.value.trim();

  if (!query) {
    renderError(resultContainer, 'Type something first.');
    return;
  }

  resultContainer.textContent = 'Loading...';

  try {
    const data = await fetchData(query);

    allBooks = data;
    selectedAuthor = 'all';

    saveResult(data);
    renderAuthorFilter(allBooks);
    renderResult(resultContainer, getFilteredBooks());
  } catch (error) {
    console.error(error);
    allBooks = [];
    selectedAuthor = 'all';
    authorFilter.classList.add('is-hidden');
    renderError(resultContainer, 'Something went wrong.');
  }
});

// Allow Enter key to trigger search.
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    button.click();
  }
});

// Clear current search results and reset filter state.
clearBtn.addEventListener('click', () => {
  clearSavedResult();
  allBooks = [];
  selectedAuthor = 'all';
  authorFilter.classList.add('is-hidden');
  authorFilter.innerHTML = '<option value="all">All authors</option>';
  resultContainer.innerHTML = '<p>The results have been cleared.</p>';
});

// Toggle favorite state from result cards.
resultContainer.addEventListener('click', (event) => {
  const favoriteButton = event.target.closest('.card__favorite-btn');

  if (!favoriteButton) return;

  const bookKey = favoriteButton.dataset.key;
  const selectedBook = allBooks.find((book) => book.key === bookKey);

  if (!selectedBook) return;

  toggleFavorite(selectedBook);
});

// Remove a book from favorites sidebar.
favouriteContainer.addEventListener('click', (event) => {
  const favoriteButton = event.target.closest('.favorites__button');

  if (!favoriteButton) return;

  const bookKey = favoriteButton.dataset.key;
  favorites = favorites.filter((book) => book.key !== bookKey);

  saveFavorites(favorites);
  renderFavorites(favouriteContainer, favorites);
  renderResult(resultContainer, getFilteredBooks());
});

// Update results when author filter changes.
authorFilter.addEventListener('change', (event) => {
  selectedAuthor = event.target.value;
  renderResult(resultContainer, getFilteredBooks());
});
const STORAGE_KEY = 'api-search-result';
const FAVORITES_KEY = 'favorite-books';

const input = document.getElementById('searchInput');
const button = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const resultContainer = document.getElementById('resultSearch');
const favouriteContainer = document.getElementById('resultFavourite');

let favorites = getSavedFavorites();

function saveResult(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getSavedResult() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function clearSavedResult() {
  localStorage.removeItem(STORAGE_KEY);
}

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
              fill="currentColor"
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

function renderError(container, message) {
  container.innerHTML = `<p>${message}</p>`;
}

const saved = getSavedResult();
if (saved) {
  renderResult(resultContainer, saved);
}

renderFavorites(favouriteContainer, favorites);

button.addEventListener('click', async () => {
  const query = input.value.trim();

  if (!query) {
    renderError(resultContainer, 'Type something first.');
    return;
  }

  resultContainer.textContent = 'Loading...';

  try {
    const data = await fetchData(query);
    saveResult(data);
    renderResult(resultContainer, data);
  } catch (error) {
    console.error(error);
    renderError(resultContainer, 'Something went wrong.');
  }
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    button.click();
  }
});

clearBtn.addEventListener('click', () => {
  clearSavedResult();
  resultContainer.innerHTML = '<p>The results have been cleared.</p>';
});

function saveFavorites(data) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(data));
}

function getSavedFavorites() {
  const raw = localStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
}

function isFavorite(bookKey) {
  return favorites.some((book) => book.key === bookKey);
}

function toggleFavorite(book) {
  const exists = isFavorite(book.key);

  if (exists) {
    favorites = favorites.filter((fav) => fav.key !== book.key);
  } else {
    favorites.push(book);
  }

  saveFavorites(favorites);
  renderFavorites(favouriteContainer, favorites);

  const savedResults = getSavedResult();
  if (savedResults) {
    renderResult(resultContainer, savedResults);
  }
}

function renderFavorites(container, books) {
  const count = books.length;

  if (!books.length) {
    container.innerHTML = `
      <div class="favorites">
        <div class="favorites__header">
          <h2 class="favorites__title">Favorites</h2>
          <span class="favorites__count">0</span>
        </div>
        <p class="favorites__empty">No favorite books yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="favorites">
      <div class="favorites__header">
        <h2 class="favorites__title">Favorites</h2>
        <span class="favorites__count">${count}</span>
      </div>

      <div class="favorites__list">
        ${books.map((book) => `
          <div class="favorites__item">
            <div class="favorites__cover-wrapper">
              ${
                book.cover
                  ? `<img class="favorites__cover" src="${book.cover}" alt="Book cover for ${book.title}">`
                  : `<div class="favorites__no-cover">No cover</div>`
              }
            </div>

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
              <svg
                class="favorites__icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

resultContainer.addEventListener('click', (event) => {
  const favoriteButton = event.target.closest('.card__favorite-btn');

  if (!favoriteButton) return;

  const bookKey = favoriteButton.dataset.key;
  const savedResults = getSavedResult();

  if (!savedResults) return;

  const selectedBook = savedResults.find((book) => book.key === bookKey);

  if (!selectedBook) return;

  toggleFavorite(selectedBook);
});

favouriteContainer.addEventListener('click', (event) => {
  const favoriteButton = event.target.closest('.favorites__button');

  if (!favoriteButton) return;

  const bookKey = favoriteButton.dataset.key;
  favorites = favorites.filter((book) => book.key !== bookKey);

  saveFavorites(favorites);
  renderFavorites(favouriteContainer, favorites);

  const savedResults = getSavedResult();
  if (savedResults) {
    renderResult(resultContainer, savedResults);
  }
});
const STORAGE_KEY = 'api-search-result';

const input = document.getElementById('searchInput');
const button = document.getElementById('searchBtn');
const resultContainer = document.getElementById('resultSearch');

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
  container.innerHTML = books.map((book) => `
    <div class="results__card">
      ${
        book.cover
          ? `<img src="${book.cover}" alt="Book cover for${book.title}">`
          : `<div class="results__no-cover">No cover</div>`
      }
      <h3 class="results__card-title">${book.title}</h3>
      <p class="results__card-text">${book.author}</p>
      <p class="results__card-text">${book.firstPublishYear}</p>
    </div>
  `).join('');
}

function renderError(container, message) {
  container.innerHTML = `<p>${message}</p>`;
}

const saved = getSavedResult();
if (saved) {
  renderResult(resultContainer, saved);
}

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
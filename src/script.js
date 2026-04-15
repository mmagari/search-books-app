const input = document.getElementById('searchInput');
const button = document.getElementById('searchBtn');
const resultContainer = document.getElementById('resultSearch');



async function fetchData(query) {
  const response = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

function displayBooks(books) {
  resultContainer.innerHTML = '';

  if (books.length === 0) {
    resultContainer.innerHTML = '<p>No books found.</p>';
    return;
  }

  books.forEach((book) => {
    const bookElement = document.createElement('div');
    bookElement.classList.add('book');

    bookElement.innerHTML = `
      <h3>${book.title || 'No title'}</h3>
      <p>Author: ${book.author_name ? book.author_name[0] : 'Unknown author'}</p>
      <p>First published: ${book.first_publish_year || 'No data'}</p>
    `;

    resultContainer.appendChild(bookElement);
  });
}

button.addEventListener('click', async () => {
  const query = input.value.trim();

  if (!query) {
    alert('Type something first');
    return;
  }

  try {
    resultContainer.innerHTML = '<p>Loading...</p>';

    const data = await fetchData(query);
    displayBooks(data.docs);
  } catch (error) {
    resultContainer.innerHTML = '<p>Something went wrong.</p>';
    console.error(error);
  }
});

input.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    button.click();
  }
});
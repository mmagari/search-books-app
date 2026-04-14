const input = document.getElementById('searchInput');
const button = document.getElementById('searchBtn');
const resultContainer = document.getElementById('resultSearch');

button.addEventListener('click', () => {
  const query = input.value.trim();

  if (!query) {
    alert("Wpisz coś najpierw!");
    return;
  }

  console.log(query);
});

input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    button.click();
  }
});

async function fetchData(query) {
  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Fetch error:", error);
  }
}
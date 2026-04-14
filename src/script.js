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
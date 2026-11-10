const search = document.querySelector('.search-toolbar');
const input = search.elements.q;
const cards = [...document.querySelectorAll('.card-grid .panel')];
const empty = document.querySelector('#empty');

function filterCards() {
  const keyword = input.value.trim().toLowerCase();
  for (const card of cards) {
    card.hidden = !card.querySelector('h2').textContent.toLowerCase().includes(keyword);
  }
  empty.hidden = cards.some(card => !card.hidden);
}

input.value = new URLSearchParams(location.search).get('q') ?? '';
filterCards();

let cards = [];
let index = 0;
let showUnknownOnly = false;
const category = new URLSearchParams(window.location.search).get('category') || 'restaurant';
const rememberedKey = `remembered-${category}`;

async function loadCards() {
  const res = await fetch(`data/${category}.json`);
  cards = await res.json();
  if (!Array.isArray(cards)) cards = [];
  updateCard();
}

function updateCard() {
  const currentCard = getVisibleCards()[index];
  if (!currentCard) {
    document.getElementById('card').innerText = 'Brak fiszek';
    document.getElementById('rememberBtn').style.display = 'none';
    document.getElementById('counter').innerText = `Zapamiętane: 0 / ${cards.length}`;
    return;
  }
  document.getElementById('card').innerText = currentCard.front;
  document.getElementById('rememberBtn').innerText = isRemembered(currentCard.id) ? '❌ Usuń' : '✅ Zapamiętaj';
  updateCounter();
}

function getVisibleCards() {
  if (!showUnknownOnly) return cards;
  return cards.filter(c => !isRemembered(c.id));
}

function nextCard() {
  const visible = getVisibleCards();
  if (index < visible.length - 1) index++;
  else index = 0;
  updateCard();
}

function prevCard() {
  const visible = getVisibleCards();
  if (index > 0) index--;
  else index = visible.length - 1;
  updateCard();
}

function randomCard() {
  const visible = getVisibleCards();
  index = Math.floor(Math.random() * visible.length);
  updateCard();
}

function toggleRemembered() {
  const visible = getVisibleCards();
  const currentId = visible[index].id;
  let remembered = JSON.parse(localStorage.getItem(rememberedKey)) || [];

  if (remembered.includes(currentId)) {
    remembered = remembered.filter(id => id !== currentId);
  } else {
    remembered.push(currentId);
  }

  localStorage.setItem(rememberedKey, JSON.stringify(remembered));
  updateCard();
}

function isRemembered(id) {
  const remembered = JSON.parse(localStorage.getItem(rememberedKey)) || [];
  return remembered.includes(id);
}

function toggleUnknownOnly() {
  showUnknownOnly = !showUnknownOnly;
  index = 0;
  updateCard();
}

function updateCounter() {
  const remembered = JSON.parse(localStorage.getItem(rememberedKey)) || [];
  document.getElementById('counter').innerText = `Zapamiętane: ${remembered.length} / ${cards.length}`;
}

loadCards();

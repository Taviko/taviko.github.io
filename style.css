
let cards = [];
let index = 0;
let showUnknownOnly = false;
let showingFront = true;
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
  const flashcard = document.getElementById('flashcard');

  if (!currentCard) {
    document.getElementById('card-front').innerText = 'Brak fiszek';
    document.getElementById('card-back').innerText = '';
    flashcard.classList.remove('flipped');
    return;
  }

  showingFront = true;
  flashcard.classList.remove('flipped');
  document.getElementById('card-front').innerText = currentCard.front;
  document.getElementById('card-back').innerText = currentCard.back;
  const rememberBtn = document.getElementById('rememberBtn');
  rememberBtn.classList.toggle('active', isRemembered(currentCard.id));
  updateCounter();
}

function flipCard() {
  const currentCard = getVisibleCards()[index];
  if (!currentCard) return;
  showingFront = !showingFront;
  document.getElementById('flashcard').classList.toggle('flipped');
}

function getVisibleCards() {
  return showUnknownOnly ? cards.filter(c => !isRemembered(c.id)) : cards;
}

function nextCard() {
  const visible = getVisibleCards();
  index = (index + 1) % visible.length;
  updateCard();
}

function prevCard() {
  const visible = getVisibleCards();
  index = (index - 1 + visible.length) % visible.length;
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
  const unknownBtn = document.querySelector('[title="Pokaż tylko nieznane"]');
  showUnknownOnly = !showUnknownOnly;
  unknownBtn.classList.toggle('active', showUnknownOnly);
  index = 0;
  updateCard();
}

function updateCounter() {
  const visible = getVisibleCards();
  document.getElementById('progress').innerText = `${index + 1} / ${visible.length}`;
}

loadCards();
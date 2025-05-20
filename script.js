let cards = [];
let index = 0;
let showUnknownOnly = false;
let showingFront = true;
let showingExample = false;
const category = new URLSearchParams(window.location.search).get('category') || 'restaurant';
const rememberedKey = `remembered-${category}`;
let speechVolume = 1;

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
    document.querySelector('#card-front .main-content').innerText = 'Brak fiszek';
    document.querySelector('#card-back .main-content').innerText = '';
    document.querySelector('#front-example').innerText = '';
    document.querySelector('#back-example').innerText = '';
    flashcard.classList.remove('flipped');
    return;
  }

  showingFront = true;
  flashcard.classList.remove('flipped');
  document.querySelector('#card-front .main-content').innerText = currentCard.front;
  document.querySelector('#card-back .main-content').innerText = currentCard.back;
  document.querySelector('#front-example').innerText = currentCard.frontExample || '';
  document.querySelector('#back-example').innerText = currentCard.backExample || '';

  // Only reset example visibility if the example button is not active
  if (!showingExample) {
    document.querySelectorAll('.example-sentence').forEach(el => el.classList.add('hidden'));
  } else {
    document.querySelectorAll('.example-sentence').forEach(el => el.classList.remove('hidden'));
  }

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

function toggleExample() {
  showingExample = !showingExample;
  const examples = document.querySelectorAll('.example-sentence');
  examples.forEach(el => {
    if (showingExample) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  // Update the button state
  const exampleBtn = document.querySelector('[title="Pokaż przykład"]');
  exampleBtn.classList.toggle('active', showingExample);
}

function speakText(event) {
  event.stopPropagation(); // Prevent card flip when clicking the speaker button

  const currentCard = getVisibleCards()[index];
  if (!currentCard) return;

  const text = currentCard.front;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = speechVolume;

  // Get available voices and set to English if available
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(voice => voice.lang.includes('en'));
  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  window.speechSynthesis.speak(utterance);
}

// Add event listener for volume control
document.addEventListener('DOMContentLoaded', function() {
  const volumeSlider = document.querySelector('.volume-slider');
  if (volumeSlider) {
    volumeSlider.addEventListener('input', function(e) {
      speechVolume = parseFloat(e.target.value);
    });
  }
});

loadCards();
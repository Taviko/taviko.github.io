let cards = [];
let index = 0;
let showUnknownOnly = false;
let showingFront = true;
let showingExample = false;
let showPhonetic = false;
let phoneticData = null;
const category = new URLSearchParams(window.location.search).get('category') || 'restaurant_vocabulary';
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
    document.querySelector('#front-phonetic').innerText = '';
    document.querySelector('#back-phonetic').innerText = '';
    flashcard.classList.remove('flipped');
    return;
  }

  showingFront = true;
  flashcard.classList.remove('flipped');
  document.querySelector('#card-front .main-content').innerText = currentCard.front;
  document.querySelector('#card-back .main-content').innerText = currentCard.back;
  document.querySelector('#front-example').innerText = currentCard.frontExample || '';
  document.querySelector('#back-example').innerText = currentCard.backExample || '';

  // Update phonetic transcription (only for front)
  document.querySelector('#front-phonetic').innerText = currentCard.phonetic || '';
  document.querySelector('#back-phonetic').innerText = ''; // Always empty for back

  // Only reset example visibility if the example button is not active
  if (!showingExample) {
    document.querySelectorAll('.example-sentence').forEach(el => el.classList.add('hidden'));
  } else {
    document.querySelectorAll('.example-sentence').forEach(el => el.classList.remove('hidden'));
  }

  // Show/hide phonetic transcription based on state (only for front)
  if (showPhonetic) {
    document.querySelector('#front-phonetic').classList.remove('hidden');
    document.querySelector('#back-phonetic').classList.add('hidden');
  } else {
    document.querySelector('#front-phonetic').classList.add('hidden');
    document.querySelector('#back-phonetic').classList.add('hidden');
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
  const rememberBtn = document.getElementById('rememberBtn');
  let remembered = JSON.parse(localStorage.getItem(rememberedKey)) || [];

  if (remembered.includes(currentId)) {
    remembered = remembered.filter(id => id !== currentId);
  } else {
    remembered.push(currentId);
  }

  localStorage.setItem(rememberedKey, JSON.stringify(remembered));
  rememberBtn.classList.toggle('active', !remembered.includes(currentId));
  updateCard();
}

function isRemembered(id) {
  const remembered = JSON.parse(localStorage.getItem(rememberedKey)) || [];
  return remembered.includes(id);
}

function toggleUnknownOnly() {
  showUnknownOnly = !showUnknownOnly;
  const unknownBtn = document.querySelector('[title="Pokaż tylko nieznane karty"]');
  unknownBtn.classList.toggle('active', showUnknownOnly);
  unknownBtn.offsetHeight; // Force repaint for mobile
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
  const exampleBtn = document.querySelector('[title="Pokaż/ukryj przykłady"]');

  examples.forEach(el => {
    if (showingExample) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  exampleBtn.classList.toggle('active', showingExample);
  exampleBtn.offsetHeight; // Force repaint for mobile
}

function speakText(event) {
  event.stopPropagation(); // Prevent card flip when clicking the speaker button

  const currentCard = getVisibleCards()[index];
  if (!currentCard) return;

  const text = currentCard.front;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = speechVolume;

  // Get available voices and set to American English if available, otherwise fallback to any English
  const voices = window.speechSynthesis.getVoices();
  let selectedVoice = voices.find(voice => voice.lang === 'en-US');
  if (!selectedVoice) {
    selectedVoice = voices.find(voice => voice.lang && voice.lang.startsWith('en'));
  }
  if (selectedVoice) {
    utterance.voice = selectedVoice;
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

// Load phonetic data
async function loadPhoneticData() {
  try {
    const response = await fetch('restaurant.json');
    phoneticData = await response.json();
  } catch (error) {
    console.error('Error loading phonetic data:', error);
  }
}

// Get phonetic transcription for a word
function getPhonetic(word, language) {
  if (!phoneticData || !phoneticData.phonetics[word]) {
    return '';
  }
  return phoneticData.phonetics[word][language] || '';
}

// Toggle phonetic display
function togglePhonetic() {
  showPhonetic = !showPhonetic;
  const phoneticElements = document.querySelectorAll('.phonetic-transcription');
  const phoneticBtn = document.querySelector('[title="Pokaż/ukryj transkrypcję fonetyczną"]');

  phoneticElements.forEach(el => {
    if (showPhonetic) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  phoneticBtn.classList.toggle('active', showPhonetic);
  phoneticBtn.offsetHeight; // Force repaint for mobile
}

// Call loadPhoneticData when the page loads
document.addEventListener('DOMContentLoaded', () => {
  loadPhoneticData();
  loadCards();
});

document.addEventListener('DOMContentLoaded', function() {
  const exampleBtn = document.querySelector('[title="Pokaż/ukryj przykłady"]');
  if (exampleBtn) {
    exampleBtn.addEventListener('touchend', function(e) {
      e.preventDefault();
      toggleExample();
    });
  }
  const phoneticBtn = document.querySelector('[title="Pokaż/ukryj transkrypcję fonetyczną"]');
  if (phoneticBtn) {
    phoneticBtn.addEventListener('touchend', function(e) {
      e.preventDefault();
      togglePhonetic();
    });
  }
  const unknownBtn = document.querySelector('[title="Pokaż tylko nieznane karty"]');
  if (unknownBtn) {
    unknownBtn.addEventListener('touchend', function(e) {
      e.preventDefault();
      toggleUnknownOnly();
    });
  }
  const randomBtn = document.querySelector('[title="Losowa karta"]');
  if (randomBtn) {
    randomBtn.addEventListener('touchend', function(e) {
      e.preventDefault();
      randomCard();
      randomBtn.classList.toggle('active');
      randomBtn.offsetHeight;
    });
  }
  const rememberBtn = document.getElementById('rememberBtn');
  if (rememberBtn) {
    rememberBtn.addEventListener('touchend', function(e) {
      e.preventDefault();
      toggleRemembered();
      rememberBtn.offsetHeight;
    });
  }

  // Mobile/touch toggle for volume bar
  const volumeBtn = document.querySelector('.volume-btn');
  const volumeControl = document.querySelector('.volume-control');
  const isTouchDevice = window.matchMedia('(hover: none)').matches;
  if (volumeBtn && volumeControl && isTouchDevice) {
    volumeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      volumeBtn.classList.toggle('show-volume');
    });
    // Hide when clicking outside
    document.addEventListener('click', function(e) {
      if (!volumeBtn.contains(e.target)) {
        volumeBtn.classList.remove('show-volume');
      }
    });
    // Prevent closing when interacting with slider
    volumeControl.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
});
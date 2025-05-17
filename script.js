const flashcards = [
  { front: "apple", back: "jabłko" },
  { front: "cat", back: "kot" },
  { front: "house", back: "dom" },
  { front: "car", back: "samochód" },
  { front: "book", back: "książka" }
];

let currentIndex = 0;
const flashcardEl = document.getElementById("flashcard");
const frontEl = flashcardEl.querySelector(".front");
const backEl = flashcardEl.querySelector(".back");

const prevBtn = document.getElementById("prevBtn");
const flipBtn = document.getElementById("flipBtn");
const nextBtn = document.getElementById("nextBtn");

function updateFlashcard() {
  frontEl.textContent = flashcards[currentIndex].front;
  backEl.textContent = flashcards[currentIndex].back;
  flashcardEl.classList.remove("flipped");
}

flipBtn.addEventListener("click", () => {
  flashcardEl.classList.toggle("flipped");
});

prevBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
  updateFlashcard();
});

nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % flashcards.length;
  updateFlashcard();
});

// Optional: allow clicking the flashcard to flip it
flashcardEl.addEventListener("click", () => {
  flashcardEl.classList.toggle("flipped");
});

// Initialize
updateFlashcard();

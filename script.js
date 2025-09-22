let currentCategory = null;
let currentContinent = null;
let currentDifficulty = null;
let countries = [];
let score = 0;
let totalQuestions = 10;
let current = 0;
let correctAnswer = "";

const categorySelectionEl = document.getElementById("category-selection");
const continentSelectionEl = document.getElementById("continent-selection");
const difficultySelectionEl = document.getElementById("difficulty-selection");
const quizEl = document.getElementById("quiz");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("next");
const resultEl = document.getElementById("result");

// Category selection
document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentCategory = btn.dataset.category;
    categorySelectionEl.classList.add("hidden");

    // If category is 'continents', skip continent selection
    if (currentCategory === "continents") {
      difficultySelectionEl.classList.remove("hidden");
    } else {
      continentSelectionEl.classList.remove("hidden");
    }
  });
});

// Continent selection
document.querySelectorAll('.continent-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentContinent = btn.dataset.continent;
    continentSelectionEl.classList.add("hidden");
    difficultySelectionEl.classList.remove("hidden");
  });
});

// Difficulty selection
document.querySelectorAll('.difficulty-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentDifficulty = btn.dataset.difficulty;
    difficultySelectionEl.classList.add("hidden");
    startQuiz();
  });
});

async function startQuiz() {
  quizEl.classList.remove("hidden");
  resultEl.classList.add("hidden");
  score = 0;
  current = 0;

  await fetchCountries();
  loadQuestion();
}

async function fetchCountries() {
  try {
    const fields = "name,capital,flags,region,population";
    const res = await fetch(`https://restcountries.com/v3.1/all?fields=${fields}`);
    const data = await res.json();

    countries = data.filter(c => {
      const hasCapital = c.capital && c.capital.length > 0;
      const inContinent = currentContinent ? c.region === currentContinent : true;

      let difficultyMatch = false;
      if (currentDifficulty === "easy") {
        difficultyMatch = c.population > 20000000;
      } else if (currentDifficulty === "medium") {
        difficultyMatch = c.population > 5000000 && c.population <= 20000000;
      } else if (currentDifficulty === "hard") {
        difficultyMatch = c.population <= 5000000;
      } else {
        difficultyMatch = true;
      }

      return hasCapital && inContinent && difficultyMatch;
    });

    if (countries.length < 4) {
      questionEl.textContent = "Not enough countries found for this selection.";
      quizEl.classList.add("hidden");
    }
  } catch (err) {
    questionEl.textContent = "Failed to load countries 😢";
    console.error("Error loading data:", err);
  }
}

function loadQuestion() {
  optionsEl.innerHTML = "";
  nextBtn.classList.add("hidden");

  const questionCountry = getRandomCountry();
  if (!questionCountry) {
    questionEl.textContent = "No countries available.";
    return;
  }

  if (currentCategory === "capitals") {
    correctAnswer = questionCountry.capital[0];
    questionEl.innerHTML = `<p>What is the capital of <strong>${questionCountry.name.common}</strong>?</p>`;
    generateOptions(correctAnswer, "capital");
  } else if (currentCategory === "flags") {
    correctAnswer = questionCountry.name.common;
    questionEl.innerHTML = `
      <img src="${questionCountry.flags.png}" alt="Flag of ${correctAnswer}" class="flag" />
      <p>Which country does this flag belong to?</p>
    `;
    generateOptions(correctAnswer, "country");
  } else if (currentCategory === "continents") {
    correctAnswer = questionCountry.region;
    questionEl.innerHTML = `<p>Which continent does <strong>${questionCountry.name.common}</strong> belong to?</p>`;
    generateOptions(correctAnswer, "continent");
  }
}

function generateOptions(correct, type) {
  let options = new Set();
  options.add(correct);

  const continentsList = ["Africa", "Americas", "Asia", "Europe", "Oceania", "Antarctic"];

  while (options.size < 4) {
    let option;
    if (type === "capital") {
      const country = getRandomCountry();
      if (country.capital && country.capital.length > 0) {
        option = country.capital[0];
      }
    } else if (type === "country") {
      option = getRandomCountry().name.common;
    } else if (type === "continent") {
      option = continentsList[Math.floor(Math.random() * continentsList.length)];
    }
    if (option) options.add(option);
  }

  Array.from(options)
    .sort(() => Math.random() - 0.5)
    .forEach(option => {
      const btn = document.createElement("div");
      btn.classList.add("option");
      btn.textContent = option;
      btn.addEventListener("click", () => selectOption(btn, correct));
      optionsEl.appendChild(btn);
    });
}

function selectOption(selected, correct) {
  const all = document.querySelectorAll(".option");
  all.forEach(opt => (opt.style.pointerEvents = "none"));

  if (selected.textContent === correct) {
    selected.style.background = "#2ecc71"; // green
    score++;
  } else {
    selected.style.background = "#e74c3c"; // red
    all.forEach(opt => {
      if (opt.textContent === correct) {
        opt.style.background = "#2ecc71";
      }
    });
  }

  nextBtn.classList.remove("hidden");
}

nextBtn.addEventListener("click", () => {
  current++;
  if (current < totalQuestions) {
    loadQuestion();
  } else {
    showResult();
  }
});

function showResult() {
  quizEl.classList.add("hidden");
  resultEl.classList.remove("hidden");
  resultEl.innerHTML = `
    <h2>🎉 Quiz Completed!</h2>
    <p>Your Score: <strong>${score} / ${totalQuestions}</strong></p>
    <button onclick="location.reload()">🔁 Restart</button>
  `;
}

function getRandomCountry() {
  return countries[Math.floor(Math.random() * countries.length)];
}

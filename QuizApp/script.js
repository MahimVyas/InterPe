const apiMap = {
  opentdb: "https://opentdb.com/api.php?amount=5&type=multiple",
  quizapi: "https://quizapi.io/api/v1/questions?apiKey=VNhaSnULrs5OZZUsh6MSOUe1DgQU5ybF3xMZg5LY", // Replace with your API key
  triviaapi: "https://the-trivia-api.com/api/questions?limit=5"
};

let questions = [];
let current = 0;
let score = 0;

// Track selected API
let selectedApi = "opentdb"; // Default

document.querySelectorAll('.api-btn').forEach(btn => {
  btn.onclick = function() {
    document.querySelectorAll('.api-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedApi = btn.value;
  };
});

// Set default selected button on page load
document.querySelector('.api-btn[value="opentdb"]').classList.add('selected');

async function loadQuestions() {
  const quizArea = document.getElementById("quizArea");
  quizArea.innerHTML = `<p class="alert-info">Loading questions...</p>`;
  current = 0;
  score = 0;
  questions = [];

  let api = selectedApi;
  if (!api || !apiMap[api]) {
    quizArea.innerHTML = `<p class="alert-info">Please select a valid quiz API.</p>`;
    return;
  }
  let url = apiMap[api];

  document.getElementById("apiName").textContent = api.toUpperCase();
  document.getElementById("qTotal").textContent = "-";
  document.getElementById("scoreDisplay").textContent = score;
  document.getElementById("qNumber").textContent = "-";
  if (document.getElementById("progressFill")) {
    document.getElementById("progressFill").style.width = "0%";
  }

  try {
    let res = await fetch(url);
    let data = await res.json();

    // Normalize questions for each API
    if (api === "opentdb") {
      questions = data.results.map(q => ({
        question: decodeHTML(q.question),
        options: shuffle([q.correct_answer, ...q.incorrect_answers].map(decodeHTML)),
        answer: decodeHTML(q.correct_answer)
      }));
    } else if (api === "quizapi") {
      questions = data.map(q => {
        const correctKey = Object.entries(q.correct_answers).find(([k, v]) => v === "true")?.[0]?.replace("_correct", "");
        const answer = q.answers[correctKey]; // text of correct answer
        return {
          question: q.question,
          options: shuffle(Object.values(q.answers).filter(Boolean)),
          answer: answer
        };
      });
    } else if (api === "triviaapi") {
      questions = data.map(q => ({
        question: q.question,
        options: shuffle([q.correctAnswer, ...q.incorrectAnswers]),
        answer: q.correctAnswer
      }));
    }

    document.getElementById("qTotal").textContent = questions.length;
    showQuestion();
  } catch (e) {
    quizArea.innerHTML = `<p class="alert-info">Failed to load questions. Try again.</p>`;
  }
}

function showQuestion() {
  const quizArea = document.getElementById("quizArea");
  const restartBtn = document.getElementById("restartQuizBtn");

  if (current >= questions.length) {
    showQuizCompleteModal();
    if (document.getElementById("progressFill")) {
      document.getElementById("progressFill").style.width = `100%`;
    }
    restartBtn.disabled = false;
    return;
  }

  // Update progress
  document.getElementById("qNumber").textContent = current + 1;
  document.getElementById("scoreDisplay").textContent = score;
  if (document.getElementById("progressFill")) {
    document.getElementById("progressFill").style.width = `${((current) / questions.length) * 100}%`;
  }

  const q = questions[current];
  const isLast = current === questions.length - 1;
  quizArea.innerHTML = `
    <div class="question">
      <h2>Q${current + 1}: ${q.question}</h2>
      <div class="options">
        ${q.options.map(opt => `
          <button class="option-btn" data-option="${encodeURIComponent(opt)}">${opt}</button>
        `).join("")}
      </div>
      <div id="feedback"></div>
      ${!isLast ? `<button id="nextBtn" onclick="nextQuestion()" disabled>Next</button>` : ''}
      ${isLast ? `<button id="finishBtn" onclick="finishQuiz()" disabled>Finish</button>` : ''}
    </div>
  `;
  restartBtn.disabled = false;

  // Attach event listeners to option buttons
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      selectOption(btn, decodeURIComponent(btn.getAttribute('data-option')));
    });
  });

  // After rendering the question HTML
  if (isLast) {
    setTimeout(() => {
      const finishBtn = document.getElementById('finishBtn');
      if (finishBtn) finishBtn.classList.add('center-animate');
    }, 10); // slight delay to ensure DOM is ready
  }
}

function selectOption(btn, selected) {
  const q = questions[current];
  const allBtns = document.querySelectorAll(".option-btn");
  allBtns.forEach(b => b.disabled = true);

  if (selected === q.answer) {
    btn.classList.add("correct");
    score++;
    document.getElementById("feedback").innerHTML = "<span style='color:green'>Correct!</span>";
  } else {
    btn.classList.add("wrong");
    const correctBtn = Array.from(allBtns).find(b => b.textContent === q.answer);
    if (correctBtn) correctBtn.classList.add("correct");
    document.getElementById("feedback").innerHTML = `<span style='color:red'>Wrong!</span> Correct answer: <b>${q.answer}</b>`;
  }

  const nextBtn = document.getElementById("nextBtn");
  const restartBtn = document.getElementById("restartQuizBtn");
  const finishBtn = document.getElementById("finishBtn");

  if (current < questions.length - 1) {
    if (nextBtn) nextBtn.disabled = false;
    restartBtn.disabled = false;
  } else {
    if (finishBtn) finishBtn.disabled = false;
    restartBtn.disabled = false;
  }
}

// Add this OUTSIDE of selectOption:
function nextQuestion() {
  current++;
  showQuestion();
}

// Add this function to trigger the end animation
function finishQuiz() {
  current = questions.length;
  showQuizCompleteModal();
}

// Theme toggle logic
function setTheme(mode) {
  if (mode === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.style.background = '#000';
    setHeadingColors('#fff');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.style.background = '#f8f8fb';
    setHeadingColors('#222');
  }
}

function setHeadingColors(color) {
  document.querySelectorAll('h1, h2').forEach(el => {
    el.style.color = color;
  });
}

// Theme toggle button logic
const themeToggleBtn = document.getElementById('themeToggle');
let dark = false;
themeToggleBtn.onclick = function () {
  dark = !dark;
  setTheme(dark ? 'dark' : 'light');
  // themeToggleBtn.textContent = dark ? 'Light' : 'Dark';
};
setTheme('light');

// --- Confetti and Modal Logic ---

function showQuizCompleteModal() {
  // Set stats
  document.getElementById('modalApiName').textContent = selectedApi.toUpperCase();
  document.getElementById('modalScore').textContent = score;
  document.getElementById('modalTotal').textContent = questions.length;

  // Show modal
  const modal = document.getElementById('quiz-complete-modal');
  modal.style.display = 'flex';

  // Animate circle: reset to initial state, then trigger animation
  const circle = modal.querySelector('.circle-reveal');
  circle.style.animation = 'none';
  circle.style.width = '0';
  circle.style.height = '0';
  circle.style.transform = 'translate(-50%, -50%) scale(0)';
  void circle.offsetWidth; // force reflow
  circle.style.animation = 'circleExpand 0.8s cubic-bezier(.68,-0.55,.27,1.55) forwards';

  // Start confetti
  startConfetti();

  // Button handlers
  document.getElementById('modalRestartBtn').onclick = () => {
    modal.style.display = 'none';
    stopConfetti();
    restartQuiz();
  };
  document.getElementById('modalCloseBtn').onclick = () => {
    modal.style.display = 'none';
    stopConfetti();
  };
}

// --- Simple Confetti Animation ---
let confettiInterval = null;
function startConfetti() {
  const container = document.querySelector('.confetti-container');
  container.innerHTML = '';
  let colors = ['#ff006f', '#008cff', '#ffe066', '#00e676', '#ffab00', '#7c4dff'];
  let confettiPieces = 80;

  for (let i = 0; i < confettiPieces; i++) {
    let conf = document.createElement('div');
    conf.className = 'confetti';
    conf.style.background = colors[Math.floor(Math.random() * colors.length)];
    conf.style.left = Math.random() * 100 + 'vw';
    conf.style.width = (8 + Math.random() * 8) + 'px';
    conf.style.height = (12 + Math.random() * 12) + 'px';
    conf.style.opacity = 0.8 + Math.random() * 0.2;
    conf.style.borderRadius = '3px';
    conf.style.animationDelay = (Math.random() * 1.2) + 's';
    conf.style.animationDuration = (1.8 + Math.random() * 0.8) + 's';
    conf.style.transform = `rotate(${Math.random()*360}deg)`;
    container.appendChild(conf);
  }
  // Remove the interval for random repositioning
  if (confettiInterval) clearInterval(confettiInterval);
}

function stopConfetti() {
  clearInterval(confettiInterval);
  const container = document.querySelector('.confetti-container');
  if (container) container.innerHTML = '';
}

// Add confetti CSS
const confettiStyle = document.createElement('style');
confettiStyle.innerHTML = `
.confetti {
  position: absolute;
  top: -10vh;
  border-radius: 3px;
  opacity: 0.8;
  pointer-events: none;
  animation: confetti-fall 1.8s linear forwards;
}
@keyframes confetti-fall {
  to {
    top: 110vh;
    opacity: 0.2;
    transform: rotate(360deg);
  }
}
`;
document.head.appendChild(confettiStyle);

// Utility functions
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function escapeQuotes(str) {
  return str.replace(/'/g, "\\'");
}

function restartQuiz() {
  loadQuestions();
}
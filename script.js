

    (function () {
    "use strict";

    const CHOICES = ["rock", "paper", "scissors"];

    const EMOJIS = {
        rock: "👊",
        paper: "✋",
        scissors: "✌️",
    };

    const WINNER_TEXT = {
        user: "You win!",
        computer: "Computer wins!",
        draw: "It's a draw!",
    };

    const STORAGE_KEY = "rps-game-state";

    const state = {
        scores: { user: 0, computer: 0, draw: 0 },
        totalGames: 0,
        winRate: 0,
        currentStreak: 0,
        bestStreak: 0,
        history: [],
        lastResult: null,
    };

    let elements = {};

    function init() {
        cacheElements();
        loadState();
        bindEvents();
        updateUI();
    }

    function cacheElements() {
        elements = {
        userScore: document.getElementById("user-score"),
        computerScore: document.getElementById("computer-score"),
        drawScore: document.getElementById("draw-score"),
        userChoice: document.getElementById("user-choice"),
        computerChoice: document.getElementById("computer-choice"),
        statusMessage: document.getElementById("status-message"),
        totalGames: document.getElementById("total-games"),
        winRate: document.getElementById("win-rate"),
        bestStreak: document.getElementById("best-streak"),
        historyList: document.getElementById("history-list"),
        choiceButtons: document.querySelectorAll(".choice-btn"),
        resetButton: document.getElementById("reset-btn"),
        };
    }

    function bindEvents() {
        elements.choiceButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const choice = button.dataset.choice;
            if (CHOICES.includes(choice)) {
            playRound(choice);
            }
        });
        });

        elements.resetButton.addEventListener("click", resetGame);
    }

    function getComputerChoice() {
        return CHOICES[Math.floor(Math.random() * CHOICES.length)];
    }

    function determineWinner(user, computer) {
        if (user === computer) return "draw";
        if (
        (user === "rock" && computer === "scissors") ||
        (user === "paper" && computer === "rock") ||
        (user === "scissors" && computer === "paper")
        ) {
        return "user";
        }
        return "computer";
    }

    function playRound(userChoice) {
        const computerChoice = getComputerChoice();
        const winner = determineWinner(userChoice, computerChoice);

        const result = {
        userChoice,
        computerChoice,
        winner,
        timestamp: new Date().toLocaleTimeString(),
        };

        state.scores[winner] += 1;
        state.totalGames += 1;

        if (winner === "user") {
        state.currentStreak += 1;
        state.bestStreak = Math.max(state.bestStreak, state.currentStreak);
        triggerConfetti();
        } else {
        state.currentStreak = 0;
        }

        state.winRate = Math.round((state.scores.user / state.totalGames) * 100);
        state.history.unshift(result);
        if (state.history.length > 10) {
        state.history.pop();
        }
        state.lastResult = result;

        saveState();
        updateUI();
    }

    function updateUI() {
        if (!elements.userScore) return;

        elements.userScore.textContent = state.scores.user;
        elements.computerScore.textContent = state.scores.computer;
        elements.drawScore.textContent = state.scores.draw;

        elements.totalGames.textContent = state.totalGames;
        elements.winRate.textContent = `${state.winRate}%`;
        elements.bestStreak.textContent = state.bestStreak;

        if (state.lastResult) {
        elements.userChoice.textContent = EMOJIS[state.lastResult.userChoice];
        elements.computerChoice.textContent = EMOJIS[state.lastResult.computerChoice];
        } else {
        elements.userChoice.textContent = "❓";
        elements.computerChoice.textContent = "❓";
        }

        renderStatus();
        renderHistory();
    }

    function renderStatus() {
        if (!elements.statusMessage) return;

        if (!state.lastResult) {
        elements.statusMessage.textContent = "Choose your move 🚀";
        return;
        }

        const { winner, userChoice, computerChoice } = state.lastResult;
        let message = WINNER_TEXT[winner];

        if (winner === "user") {
        message += ` ${EMOJIS[userChoice]} beats ${EMOJIS[computerChoice]}`;
        } else if (winner === "computer") {
        message += ` ${EMOJIS[computerChoice]} beats ${EMOJIS[userChoice]}`;
        } else {
        message += ` Both chose ${EMOJIS[userChoice]}`;
        }

        elements.statusMessage.textContent = message;
    }

    function renderHistory() {
        if (!elements.historyList) return;

        elements.historyList.innerHTML = "";

        if (state.history.length === 0) {
        elements.historyList.innerHTML = `<li class="history-empty">No games yet</li>`;
        return;
        }

        state.history.forEach((game) => {
        const item = document.createElement("li");
        item.className = `history-item ${game.winner}`;
        item.innerHTML = `
            <span class="history-result">${WINNER_TEXT[game.winner]}</span>
            <span class="history-moves">${EMOJIS[game.userChoice]} vs ${EMOJIS[game.computerChoice]}</span>
            <span class="history-time">${game.timestamp}</span>
        `;
        elements.historyList.appendChild(item);
        });
    }

    function resetGame() {
        state.scores = { user: 0, computer: 0, draw: 0 };
        state.totalGames = 0;
        state.winRate = 0;
        state.currentStreak = 0;
        state.bestStreak = 0;
        state.history = [];
        state.lastResult = null;

        saveState();
        updateUI();
    }

    function saveState() {
        try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
        // localStorage may be unavailable in private mode or blocked.
        }
    }

    function loadState() {
        try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            Object.assign(state, JSON.parse(saved));
        }
        } catch (e) {
        // Ignore corrupted or unavailable storage.
        }
    }

    function triggerConfetti() {
        if (typeof window !== "undefined" && typeof window.confetti === "function") {
        window.confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
        });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
    })();

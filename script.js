// ----------------------------
// AuraTrack Data + Logic
// ----------------------------

// Global data object
let appData = {
  stats: {
    auraScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastVisitDate: null
  },
  habits: []
};

// Save to localStorage
function saveData() {
  localStorage.setItem("auraTrackData", JSON.stringify(appData));
}

// Load from localStorage
function loadData() {
  const stored = localStorage.getItem("auraTrackData");
  if (stored) {
    appData = JSON.parse(stored);
  } else {
    saveData(); // initialize if no data
  }
  return appData;
}

// Add a new habit
function addHabit(name, points) {
  const newHabit = {
    id: Date.now(),
    name: name,
    points: points,
    completed: false
  };
  appData.habits.push(newHabit);
  saveData();
  return newHabit;
}

// Toggle habit completion and update Aura Score
function toggleHabit(habitId) {
  const habit = appData.habits.find(h => h.id === habitId);
  if (habit) {
    habit.completed = !habit.completed;

    if (habit.completed) {
      appData.stats.auraScore += habit.points;
    } else {
      appData.stats.auraScore -= habit.points;
      if (appData.stats.auraScore < 0) appData.stats.auraScore = 0;
    }

    saveData();
  }
  return habit;
}

// Update streaks and reset habits if it's a new day
function updateStreaksAndReset() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
  let lastVisit = appData.stats.lastVisitDate;

  // First visit
  if (!lastVisit) {
    appData.stats.lastVisitDate = todayStr;
    saveData();
    return;
  }

  const lastVisitDate = new Date(lastVisit);
  const diffTime = today - lastVisitDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    appData.stats.currentStreak += 1;
  } else if (diffDays > 1) {
    appData.stats.currentStreak = 0;
  }

  // Update longest streak
  if (appData.stats.currentStreak > appData.stats.longestStreak) {
    appData.stats.longestStreak = appData.stats.currentStreak;
  }

  // Reset habits if it's a new day
  if (diffDays >= 1) {
    appData.habits.forEach(habit => {
      habit.completed = false;
    });
  }

  appData.stats.lastVisitDate = todayStr;
  saveData();
}

// ----------------------------
// DOM Manipulation
// ----------------------------
const auraScoreEl = document.getElementById("aura-score");
const currentStreakEl = document.getElementById("current-streak");
const longestStreakEl = document.getElementById("longest-streak");
const habitListEl = document.getElementById("habit-list");
const newHabitInput = document.getElementById("new-habit");
const addBtn = document.getElementById("add-btn");

// Render stats
function renderStats() {
  auraScoreEl.textContent = appData.stats.auraScore;
  currentStreakEl.textContent = appData.stats.currentStreak;
  longestStreakEl.textContent = appData.stats.longestStreak;
}

// Render habits
function renderHabits() {
  habitListEl.innerHTML = "";

  appData.habits.forEach(habit => {
    const li = document.createElement("li");
    li.classList.add("habit-item");

    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = habit.completed;
    checkbox.addEventListener("change", () => {
      toggleHabit(habit.id);
      renderStats();
      renderHabits();
    });

    const nameSpan = document.createElement("span");
    nameSpan.classList.add("habit-name");
    nameSpan.textContent = habit.name;

    label.appendChild(checkbox);
    label.appendChild(nameSpan);

    const pointsSpan = document.createElement("span");
    pointsSpan.classList.add("habit-points");
    pointsSpan.textContent = `+${habit.points}`;

    li.appendChild(label);
    li.appendChild(pointsSpan);
    habitListEl.appendChild(li);
  });
}

// Event listener for adding habits
addBtn.addEventListener("click", () => {
  const name = newHabitInput.value.trim();
  if (name) {
    addHabit(name, 5); // default points
    newHabitInput.value = "";
    renderHabits();
  }
});

// ----------------------------
// Initialization
// ----------------------------
loadData();
updateStreaksAndReset();
renderStats();
renderHabits();

import { Storage } from './storage.js';

export const ThemeManager = {
  load() {
    const savedTheme = Storage.getTheme();
    const themeToggle = document.getElementById("themeToggle");
    
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
      themeToggle.textContent = "☀️";
    } else {
      document.body.classList.remove("dark-mode");
      themeToggle.textContent = "🌙";
    }
  },

  toggle() {
    const body = document.body;
    const themeToggle = document.getElementById("themeToggle");
    
    if (body.classList.contains("dark-mode")) {
      body.classList.remove("dark-mode");
      themeToggle.textContent = "🌙";
      Storage.setTheme("light");
    } else {
      body.classList.add("dark-mode");
      themeToggle.textContent = "☀️";
      Storage.setTheme("dark");
    }
  }
};

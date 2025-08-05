import { Storage } from './js/storage.js';
import { CodeforcesAPI } from './js/api.js';
import { UserCard } from './js/user-card.js';
import { ThemeManager } from './js/theme.js';
import { ProblemCache } from './js/problem-cache.js';
import { ProblemFilter } from './js/problem-filter.js';
import { UserSearch } from './js/user-search.js';

// ===== MAIN INITIALIZATION =====
window.addEventListener("load", () => {
  // Load saved data
  document.getElementById("user").value = Storage.getUser();
  document.getElementById("friends").value = Storage.getFriends();
  document.getElementById("minElo").value = Storage.getMinElo();

  // Load problems and user info from storage
  ProblemFilter.loadFromStorage();
  const userInfo = Storage.getUserInfo();
  if (userInfo) {
    UserCard.render(userInfo);
  } else {
    document.getElementById("userInfo").innerHTML = "No user info available.";
  }

  // Show cache info
  const cacheInfo = ProblemCache.getCacheInfo();
  console.log("Cache info:", cacheInfo.message);

  // Initialize theme
  ThemeManager.load();

  // Event listeners
  document.getElementById("themeToggle").addEventListener("click", () => ThemeManager.toggle());
  document.getElementById("Update").addEventListener("click", () => ProblemCache.updateProblems());
  document.getElementById("Search").addEventListener("click", () => ProblemFilter.filterProblems());
  
  // Pagination event listeners
  document.getElementById("prevPage").addEventListener("click", () => ProblemFilter.changePage('prev'));
  document.getElementById("nextPage").addEventListener("click", () => ProblemFilter.changePage('next'));
  
  document.getElementById("user").addEventListener("input", (e) => {
    Storage.setUser(e.target.value.trim());
    clearTimeout(UserSearch.typingTimeout);
    UserSearch.typingTimeout = setTimeout(() => {
      UserSearch.search(e.target.value.trim());
    }, 1000);
  });

  document.getElementById("friends").addEventListener("input", (e) => {
    Storage.setFriends(e.target.value);
  });

  document.getElementById("minElo").addEventListener("input", (e) => {
    Storage.setMinElo(e.target.value);
  });
});

export const Storage = {
  getUser: () => localStorage.getItem("cf_user") || "",
  setUser: (user) => localStorage.setItem("cf_user", user),
  getFriends: () => localStorage.getItem("cf_friends") || "",
  setFriends: (friends) => localStorage.setItem("cf_friends", friends),
  getMinElo: () => localStorage.getItem("cf_minElo") || "",
  setMinElo: (minElo) => localStorage.setItem("cf_minElo", minElo),
  getProblems: () => {
    const problemsStr = localStorage.getItem("cf_problems");
    return problemsStr ? JSON.parse(problemsStr) : [];
  },
  setProblems: (problems) => localStorage.setItem("cf_problems", JSON.stringify(problems)),
  getProblemCache: () => {
    const cacheStr = localStorage.getItem("cf_problemCache");
    return cacheStr ? JSON.parse(cacheStr) : null;
  },
  setProblemCache: (cache) => localStorage.setItem("cf_problemCache", JSON.stringify(cache)),
  getFilteredProblems: () => {
    const problemsStr = localStorage.getItem("cf_filteredProblems");
    return problemsStr ? JSON.parse(problemsStr) : [];
  },
  setFilteredProblems: (problems) => localStorage.setItem("cf_filteredProblems", JSON.stringify(problems)),
  getUserInfo: () => {
    const userInfoStr = localStorage.getItem("cf_userInfo");
    return userInfoStr ? JSON.parse(userInfoStr) : null;
  },
  setUserInfo: (userInfo) => localStorage.setItem("cf_userInfo", JSON.stringify(userInfo)),
  getTheme: () => localStorage.getItem("cf_theme") || "light",
  setTheme: (theme) => localStorage.setItem("cf_theme", theme)
};
import { CodeforcesAPI } from "./api.js";
import { Storage } from "./storage.js";
import { ProblemCache } from "./problem-cache.js";
import { TagManager } from "./tag-manager.js";

export const ProblemFilter = {
  currentPage: 1,
  problemsPerPage: 20,
  allProblems: [],

  async filterProblems() {
    const user = document.getElementById("user").value.trim();
    const friends = document
      .getElementById("friends")
      .value.trim()
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const minElo =
      parseInt(document.getElementById("minElo").value.trim()) || 0;
    const maxElo =
      parseInt(document.getElementById("maxElo").value.trim()) || Infinity;
    const tags = TagManager.getSelectedTags();
    const sortBy = document.getElementById("sortBy").value || "rating";

    if (!user) {
      alert("Please enter your username!");
      return;
    }

    // Check if we have cached problems
    const cachedProblems = ProblemCache.getCachedProblems();
    if (cachedProblems.length === 0) {
      alert("No problems cached! Please click 'Update Problems' first.");
      return;
    }

    try {
      // Get solved problems for all users
      const allUsers = [user, ...friends];
      const solvedByAnyUser = new Set();

      for (const username of allUsers) {
        try {
          const submissions = await CodeforcesAPI.getUserStatus(username);

          if (!submissions || !Array.isArray(submissions)) {
            console.warn(`No submissions found for user: ${username}`);
            continue;
          }

          submissions.forEach((sub) => {
            if (sub.verdict === "OK") {
              const key = `${sub.problem.contestId}-${sub.problem.index}`;
              solvedByAnyUser.add(key);
            }
          });
        } catch (error) {
          alert(`Error fetching data for ${username}: ${error.message}`);
          return;
        }
      }

      // Filter cached problems
      const filteredProblems = this.applyFilters(
        cachedProblems,
        solvedByAnyUser,
        {
          minElo,
          maxElo,
          tags,
          sortBy,
        }
      );

      this.displayProblems(filteredProblems, { minElo, maxElo, tags });

      // Save filtered results and reset pagination
      this.allProblems = filteredProblems;
      this.currentPage = 1;
      Storage.setFilteredProblems(filteredProblems);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  },

  applyFilters(problems, solvedByAnyUser, filters) {
    const { minElo, maxElo, tags, sortBy } = filters;

    let filteredProblems = problems.filter((prob) => {
      const key = `${prob.contestId}-${prob.index}`;
      const isUnsolved = !solvedByAnyUser.has(key);

      // Rating filter
      const meetsMinElo = !prob.rating || prob.rating >= minElo;
      const meetsMaxElo = !prob.rating || prob.rating <= maxElo;

      // Tags filter
      const filterMode = TagManager.getFilterMode();
      let meetsTagFilter;
      
      if (tags.length === 0) {
        meetsTagFilter = true;
      } else if (filterMode === 'OR') {
        // OR logic: problem must have at least one of the selected tags
        meetsTagFilter = prob.tags &&
          tags.some((tag) =>
            prob.tags.some((probTag) =>
              probTag.toLowerCase().includes(tag.toLowerCase())
            )
          );
      } else {
        // AND logic: problem must have all selected tags
        meetsTagFilter = prob.tags &&
          tags.every((tag) =>
            prob.tags.some((probTag) =>
              probTag.toLowerCase().includes(tag.toLowerCase())
            )
          );
      }

      return isUnsolved && meetsMinElo && meetsMaxElo && meetsTagFilter;
    });

    // Sort problems - ALWAYS by rating first, then by secondary criteria
    filteredProblems.sort((a, b) => {
      // Primary sort: Rating (ascending - easier problems first)
      if (!a.rating && !b.rating) {
        // Both unrated, use secondary sort
        if (sortBy === "solved") {
          return (b.solvedCount || 0) - (a.solvedCount || 0); // Most solved first
        } else {
          return b.contestId - a.contestId; // Most recent first
        }
      }
      if (!a.rating) return 1; // Unrated problems go to end
      if (!b.rating) return -1; // Unrated problems go to end
      
      if (a.rating !== b.rating) {
        return a.rating - b.rating; // Lower rating first (easier first)
      }
      
      // Secondary sort: Same rating, use dropdown choice
      if (sortBy === "solved") {
        return (b.solvedCount || 0) - (a.solvedCount || 0); // Most solved first
      } else {
        return b.contestId - a.contestId; // Most recent first
      }
    });

    return filteredProblems;
  },

  displayProblems(problems, filters) {
    this.allProblems = problems;
    this.currentPage = 1;
    this.renderProblemsList(problems, {
      emptyMessage: "No unsolved problems found with current filters.",
      showFilterInfo: true,
      usePagination: true
    });
  },

  loadFromStorage() {
    const problems = Storage.getFilteredProblems() || Storage.getProblems();
    this.allProblems = problems;
    this.currentPage = 1;
    this.renderProblemsList(problems, {
      emptyMessage: "No problems to display. Click 'Update Problems' and then 'Filter Problems'.",
      showFilterInfo: false,
      usePagination: true
    });
  },

  changePage(direction) {
    const totalPages = Math.ceil(this.allProblems.length / this.problemsPerPage);
    
    if (direction === 'next' && this.currentPage < totalPages) {
      this.currentPage++;
    } else if (direction === 'prev' && this.currentPage > 1) {
      this.currentPage--;
    }
    
    this.renderCurrentPage();
  },

  renderCurrentPage() {
    this.renderProblemsList(this.allProblems, {
      emptyMessage: "No problems to display.",
      showFilterInfo: true,
      usePagination: true
    });
  },

  renderProblemsList(problems, options = {}) {
    const { emptyMessage, showFilterInfo, usePagination } = options;
    const list = document.getElementById("Problems");
    const pagination = document.getElementById("pagination");
    list.innerHTML = "";

    if (problems.length === 0) {
      const li = document.createElement("li");
      li.textContent = emptyMessage;
      list.appendChild(li);
      pagination.style.display = "none";
      return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(problems.length / this.problemsPerPage);
    const startIndex = (this.currentPage - 1) * this.problemsPerPage;
    const endIndex = startIndex + this.problemsPerPage;
    const currentProblems = problems.slice(startIndex, endIndex);

    // Add filter info if requested
    if (showFilterInfo) {
      const info = document.createElement("li");
      info.className = "filter-info";
      info.textContent = `Found ${problems.length} problems (Page ${this.currentPage} of ${totalPages})`;
      list.appendChild(info);
    }

    // Render current page problems
    currentProblems.forEach((prob) => {
      const li = document.createElement("li");
      li.style.listStyle = "none";
      li.style.padding = "0";
      
      const card = document.createElement("a");
      card.className = "problem-card";
      card.href = `https://codeforces.com/problemset/problem/${prob.contestId}/${prob.index}`;
      card.target = "_blank";
      
      // First div - Problem name and rating
      const header = document.createElement("div");
      header.className = "problem-header";
      
      const nameDiv = document.createElement("div");
      nameDiv.className = "problem-name";
      nameDiv.textContent = prob.name;
      
      const ratingDiv = document.createElement("div");
      ratingDiv.className = "problem-rating";
      
      const eloIcon = document.createElement("img");
      eloIcon.src = "icons/elo.png";
      eloIcon.className = "elo-icon";
      eloIcon.alt = "Rating";
      
      const ratingText = document.createElement("span");
      ratingText.textContent = prob.rating || "Unrated";
      
      ratingDiv.appendChild(eloIcon);
      ratingDiv.appendChild(ratingText);
      
      header.appendChild(nameDiv);
      header.appendChild(ratingDiv);
      
      // Second div - Tags and solved count
      const footer = document.createElement("div");
      footer.className = "problem-footer";
      
      const tagsDiv = document.createElement("div");
      tagsDiv.className = "problem-tags";
      tagsDiv.textContent = prob.tags ? prob.tags.slice(0, 3).join(", ") : "No tags";
      
      const solvedDiv = document.createElement("div");
      solvedDiv.className = "problem-solved";
      
      // Always show solved count, even if 0
      const solvedIcon = document.createElement("img");
      solvedIcon.src = "icons/solved.png";
      solvedIcon.className = "solved-icon";
      solvedIcon.alt = "Solved";
      
      const solvedText = document.createElement("span");
      solvedText.textContent = (prob.solvedCount || 0).toLocaleString();
      
      solvedDiv.appendChild(solvedIcon);
      solvedDiv.appendChild(solvedText);
      
      footer.appendChild(tagsDiv);
      footer.appendChild(solvedDiv);
      
      // Assemble the card
      card.appendChild(header);
      card.appendChild(footer);
      li.appendChild(card);
      
      list.appendChild(li);
    });

    // Show/hide and update pagination
    if (usePagination && totalPages > 1) {
      pagination.style.display = "flex";
      
      const prevBtn = document.getElementById("prevPage");
      const nextBtn = document.getElementById("nextPage");
      const pageIndicator = document.getElementById("pageIndicator");
      
      prevBtn.disabled = this.currentPage === 1;
      nextBtn.disabled = this.currentPage === totalPages;
      pageIndicator.textContent = this.currentPage;
    } else {
      pagination.style.display = "none";
    }
  },
};

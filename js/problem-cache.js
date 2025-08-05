import { CodeforcesAPI } from './api.js';
import { Storage } from './storage.js';

export const ProblemCache = {
  async updateProblems() {
    try {
      console.log("Fetching all problems from Codeforces...");
      const allProblems = await CodeforcesAPI.getAllProblems();
      
      // Store with timestamp
      const cacheData = {
        problems: allProblems,
        lastUpdated: Date.now(),
        totalCount: allProblems.length
      };
      
      Storage.setProblemCache(cacheData);
      
      // Update UI to show success
      this.showUpdateStatus(`✅ Updated ${allProblems.length} problems`);
      
      return allProblems;
    } catch (error) {
      this.showUpdateStatus(`❌ Update failed: ${error.message}`);
      throw error;
    }
  },

  getCachedProblems() {
    const cache = Storage.getProblemCache();
    return cache?.problems || [];
  },

  getCacheInfo() {
    const cache = Storage.getProblemCache();
    if (!cache) {
      return { hasCache: false, message: "No problems cached" };
    }
    
    const lastUpdated = new Date(cache.lastUpdated).toLocaleString();
    return {
      hasCache: true,
      totalCount: cache.totalCount,
      lastUpdated,
      message: `${cache.totalCount} problems (updated: ${lastUpdated})`
    };
  },

  showUpdateStatus(message) {
    const statusEl = document.getElementById("updateStatus");
    if (statusEl) {
      statusEl.textContent = message;
      setTimeout(() => {
        statusEl.textContent = "";
      }, 3000);
    }
  },

  needsUpdate() {
    const cache = Storage.getProblemCache();
    if (!cache) return true;
    
    // Consider cache stale after 24 hours
    const dayInMs = 24 * 60 * 60 * 1000;
    return (Date.now() - cache.lastUpdated) > dayInMs;
  }
};

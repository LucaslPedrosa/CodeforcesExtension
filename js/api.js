export const CodeforcesAPI = {
  async getUserStatus(username) {
    const resp = await fetch(`https://codeforces.com/api/user.status?handle=${username}`);
    const text = await resp.text();
    
    try {
      const data = JSON.parse(text);
      if (data.status !== "OK") {
        throw new Error(data.comment || "User not found");
      }
      return data.result;
    } catch (e) {
      console.error("Response was not JSON:", text.slice(0, 300));
      throw new Error("Error fetching data. Codeforces may be blocking direct requests.");
    }
  },

  async getUserInfo(username) {
    const resp = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
    const text = await resp.text();
    const data = JSON.parse(text);

    if (data.status !== "OK") {
      throw new Error(data.comment || "User not found");
    }
    
    return data.result[0];
  },

  async getAllProblems() {
    const resp = await fetch("https://codeforces.com/api/problemset.problems");
    const text = await resp.text();
    
    try {
      const data = JSON.parse(text);
      if (data.status !== "OK") {
        throw new Error(data.comment || "Unable to fetch problems");
      }
      
      if (!data.result || !data.result.problems || !Array.isArray(data.result.problems)) {
        throw new Error("No problems found in the response");
      }
      
      const problems = data.result.problems;
      const statistics = data.result.problemStatistics || [];
      
      // Create a map for quick lookup of statistics
      const statsMap = new Map();
      statistics.forEach(stat => {
        const key = `${stat.contestId}-${stat.index}`;
        statsMap.set(key, stat.solvedCount);
      });
      
      // Merge problems with their solve counts
      const problemsWithStats = problems.map(problem => {
        const key = `${problem.contestId}-${problem.index}`;
        return {
          ...problem,
          solvedCount: statsMap.get(key) || 0
        };
      });
      
      return problemsWithStats;
    } catch (e) {
      console.error("Error parsing contests data:", e);
      throw new Error("Error fetching problems list from Codeforces.");
    }
  }
};
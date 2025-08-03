document.getElementById("Search").addEventListener("click", async () => {
  const user = document.getElementById("user").value.trim();
  const friends = document
    .getElementById("friends")
    .value.trim()
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  const minElo = parseInt(document.getElementById("minElo").value.trim()) || 0;

  if (!user) return alert("Please enter your username!");

  const allUsers = [user, ...friends];
  const solvedByAnyUser = new Set();

  for (const u of allUsers) {
    const resp = await fetch(
      `https://codeforces.com/api/user.status?handle=${u}`
    );
    const text = await resp.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Response was not JSON:", text.slice(0, 300));
      alert(
        "Error fetching data. Codeforces may be blocking direct requests."
      );
      return;
    }

    if (data.status !== "OK") {
      alert(`API error: ${data.comment || "User not found"}`);
      return;
    }

    if (!data.result || !Array.isArray(data.result)) {
      console.warn(`No submissions found for user: ${u}`);
      continue;
    }

    data.result.forEach((sub) => {
      if (sub.verdict === "OK") {
        const key = `${sub.problem.contestId}-${sub.problem.index}`;
        solvedByAnyUser.add(key);
      }
    });
  }

  const contestsResp = await fetch(
    "https://codeforces.com/api/problemset.problems"
  );
  
  let contestsData;
  try {
    const contestsText = await contestsResp.text();
    contestsData = JSON.parse(contestsText);
    } catch (e) {
    console.error("Error parsing contests data:", e);
    alert("Error fetching problems list from Codeforces.");
    return;
  }
  
  if (contestsData.status !== "OK") {
    alert(`API error: ${contestsData.comment || "Unable to fetch problems"}`);
    return;
  }

  if (!contestsData.result || !contestsData.result.problems || !Array.isArray(contestsData.result.problems)) {
    alert("No problems found in the response.");
    return;
  }

  // Filter unsolved problems and apply minimum elo filter
  const unsolvedProblems = contestsData.result.problems.filter((prob) => {
    const key = `${prob.contestId}-${prob.index}`;
    const isUnsolved = !solvedByAnyUser.has(key);
    const meetsMinElo = !prob.rating || prob.rating >= minElo;
    return isUnsolved && meetsMinElo;
  });

  // Sort problems by rating (ascending), problems without rating go to the end
  unsolvedProblems.sort((a, b) => {
    if (!a.rating && !b.rating) return 0;
    if(a.rating === b.rating) return b.contestId - a.contestId;
    if (!a.rating) return 1;
    if (!b.rating) return -1;
    return a.rating - b.rating;
  });

  const list = document.getElementById("Problems");
  list.innerHTML = "";

  if (unsolvedProblems.length === 0) {
    const li = document.createElement("li");
    li.textContent = minElo > 0 
      ? `No unsolved problems found with rating >= ${minElo} for this group.`
      : "No unsolved problems found for this group.";
    list.appendChild(li);
    return;
  }

  unsolvedProblems.forEach((prob) => {
    const li = document.createElement("li");
    const link = `https://codeforces.com/problemset/problem/${prob.contestId}/${prob.index}`;
    const rating = prob.rating ? ` (${prob.rating})` : " (Unrated)";
    li.innerHTML = `<a href="${link}" target="_blank">${prob.name}${rating}</a>`;
    list.appendChild(li);
  });
});

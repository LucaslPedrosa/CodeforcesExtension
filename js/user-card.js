export const UserCard = {
  getTitleAndColor(elo) {
    if (elo === "Unrated") return { title: "Unrated", color: "gray" };
    if (elo < 1200) return { title: "Newbie", color: "gray" };
    if (elo < 1400) return { title: "Pupil", color: "green" };
    if (elo < 1600) return { title: "Specialist", color: "cyan" };
    if (elo < 1900) return { title: "Expert", color: "blue" };
    if (elo < 2100) return { title: "Candidate Master", color: "violet" };
    if (elo < 2300) return { title: "Master", color: "orange" };
    if (elo < 2400) return { title: "International Master", color: "orange" };
    if (elo < 2600) return { title: "Grandmaster", color: "red" };
    if (elo < 3000) return { title: "International Grandmaster", color: "red" };
    return { title: "Legendary Grandmaster", color: "red" };
  },

  render(user) {
    const container = document.getElementById("userInfo");
    container.innerHTML = "";

    const card = document.createElement("div");
    card.className = "user-card";

    const avatar = document.createElement("img");
    avatar.src = user.avatar;
    avatar.alt = "Avatar";
    avatar.className = "avatar";

    const avatarWrapper = document.createElement("div");
    avatarWrapper.className = "avatar-border";
    avatarWrapper.appendChild(avatar);

    const info = document.createElement("div");
    info.className = "info";

    const title = document.createElement("strong");
    title.className = "title";
    const titleInfo = this.getTitleAndColor(user.rating);

    if (user.rating !== "Unrated") {
      title.textContent = titleInfo.title;
      title.style.color = titleInfo.color;
    } else {
      title.textContent = "Unrated";
      title.style.color = "gray";
    }

    const handle = document.createElement("strong");
    handle.className = "handle";
    handle.textContent = user.handle;
    handle.style.color = titleInfo.color;

    const rating = document.createElement("div");
    rating.className = "rating";
    rating.textContent = `Contest rating: ${user.rating} (max. ${titleInfo.title}, ${user.maxRating})`;

    const contrib = document.createElement("div");
    contrib.className = "contrib";
    contrib.textContent = `Contribution: ${user.contribution}`;

    const org = document.createElement("div");
    org.className = "org";
    org.textContent = `Organization: ${user.organization}`;

    info.append(title, handle, rating, contrib, org);
    card.append(avatarWrapper, info);
    container.appendChild(card);
  }
};
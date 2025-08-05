import { CodeforcesAPI } from './api.js';
import { UserCard } from './user-card.js';
import { Storage } from './storage.js';

export const UserSearch = {
  typingTimeout: null,

  async search(username) {
    if (!username) return;

    try {
      const userInfo = await CodeforcesAPI.getUserInfo(username);

      const cfUserInfo = {
        avatar: userInfo.avatar,
        handle: userInfo.handle,
        rating: userInfo.rating || "Unrated",
        maxRating: userInfo.maxRating || "Unrated",
        contribution: userInfo.contribution || 0,
        organization: userInfo.organization || "None",
        maxRank: userInfo.maxRank || "Unrated",
      };

      UserCard.render(cfUserInfo);
      Storage.setUserInfo(cfUserInfo);
    } catch (error) {
      console.warn(`User search failed: ${error.message}`);
      document.getElementById("userInfo").innerHTML = "User not found.";
    }
  }
};

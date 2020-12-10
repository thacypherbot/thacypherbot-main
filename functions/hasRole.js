const Discord = require("discord.js");
const hasRole = (message, roleString) => {
  const checkRole = message.member.roles.cache.find(
    (role) => role.name === roleString
  )
    ? true
    : false;
  return checkRole;
};

module.exports = hasRole;

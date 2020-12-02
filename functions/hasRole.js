const Discord = require('discord.js');
const hasRole = (message) => {
    const checkRole = (message.member.roles.cache.find(role => role.name === 'Admins')) ? true : false
    return checkRole
}

module.exports = hasRole
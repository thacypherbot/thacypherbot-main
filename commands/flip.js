const Discord = require("discord.js");

exports.run = async (client, message, args) => {
  const coins = {
    heads: "https://i.imgur.com/yiMx1SF.png",
    tails: "https://i.imgur.com/9D95zQz.png",
  };

  const choice = Math.floor(Math.random() + 0.5);

  const coin = Object.keys(coins)[choice];

  const flipEmbed = new Discord.MessageEmbed()
    .setTitle("Coin landed on: " + coin)
    .setColor("#ffff00")
    .setThumbnail(coins[coin]);

  message.channel.send(flipEmbed);
};

exports.help = {
  name: "flip",
};

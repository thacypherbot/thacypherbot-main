const Discord = require("discord.js");
const { Canvas, resolveImage } = require("canvas-constructor");
const schedule = require("node-schedule");
const ReactorProfile = require("../models/reactorprofile.js");
const PersonalProfile = require("../models/personalprofile.js");
exports.run = async (client, message, args) => {
  let theid = message.author.id;
  let profile = message.author.displayAvatarURL();
  if (args[0]) {
    theid = message.mentions.users.first().id;
    profile = message.mentions.users.first().displayAvatarURL();
    console.log(theid, `mentions`);
  }
  let usertag = message.author.tag;
  let theProfile = await PersonalProfile.findOne({ userid: theid }).catch(
    (err) => {
      message.channel.send(`profile not found.`);
    }
  );
  let emojiDataString = "";
  for (let item of theProfile.emojiData) {
    emojiDataString += `${item.emojiName} : ${item.count} \n`;
  }

  const profileEmbed = new Discord.MessageEmbed().setColor(`#FFC0CB`);
  profileEmbed.setTitle(`ThaCypher Reactor Profile`);
  profileEmbed.setDescription(`${usertag}'s profile`);
  profileEmbed.addField(`Emojis :`, emojiDataString);
  profileEmbed.addField(`ThaCypher Stars:`, `⭐ ⭐ ⭐`);
  profileEmbed.setThumbnail(profile);

  message.channel.send(profileEmbed);
};

exports.help = {
  name: "profile",
};

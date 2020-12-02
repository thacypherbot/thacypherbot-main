const Discord = require("discord.js");
const { Canvas, resolveImage } = require("canvas-constructor");
const schedule = require("node-schedule");
const ReactorProfile = require("../models/reactorprofile.js");
exports.run = async (client, message, args) => {
  const theProfile = await ReactorProfile.find();
  const filteredProfiles = theProfile.filter(
    (item) => item.userid === message.author.id
  );
  console.log(filteredProfiles);
  let username = message.author.username;
  const avatar = await resolveImage(
    `https://media.discordapp.net/attachments/723944388178477127/781843822069678100/Capture.PNG?width=577&height=577`
  );
  const emoji = await resolveImage(
    `https://media.discordapp.net/attachments/730608533112094781/783342177244938250/star_2b50.png`
  );
  let totalEmojis = "";
  let totalCount = 0;
  for (let theEmoji of filteredProfiles) {
    for (let item of theEmoji.emojiData) {
      if (totalEmojis.includes(item.emojiName)) continue;
      totalEmojis += item.emojiName;
    }
  }
  let starEmoji = [];
  let starEmojiNumber;
  // for (let item of theProfile.emojiData) {
  //   totalEmojis += `${item.emojiName} - ${item.count} |`;
  //   starEmojiNumber = Math.floor(item.count / 3);
  //   for (let i = 0; i < starEmojiNumber; i++) {
  //     starEmoji.push(`🌟`);
  //   }
  // }
  const createCanvas = async () => {
    const newCanvas = new Canvas(400, 180)
      .setColor("#7289DA")
      .printRectangle(84, 0, 316, 180)
      .setColor("#2C2F33")
      .printRectangle(0, 0, 84, 180)
      .printRectangle(169, 26, 231, 46)
      .printRectangle(224, 108, 176, 46)
      .setShadowColor("rgba(22, 22, 22, 1)")
      .setShadowOffsetY(5)
      .setShadowBlur(10)
      .printImage(avatar, 20, 20, 90, 90)
      .save()
      .setColor("#23272A")
      .fill()
      .restore()
      .setTextAlign("center")
      .setTextFont("9pt Klavika Regular")
      .setColor("#FFFFFF")
      .setTextFont("18pt Klavika Regular")
      .setColor("#FFFFFF")
      .printText(totalEmojis, 285, 54)
      .printText(username, 70, 159)
      .setTextAlign("left")
      .printText(`🌟 🌟 🌟`, 241, 136)
      .toBuffer();
    return newCanvas;
  };

  const attachment = new Discord.MessageAttachment(
    await createCanvas(),
    "welcome-image.png"
  );
  const newEmbed = new Discord.MessageEmbed().setTitle("canvas test");
  newEmbed.attachFiles([attachment]);
  newEmbed.setImage("attachment://welcome-image.png");
  message.channel.send(newEmbed);
};

exports.help = {
  name: "test",
};

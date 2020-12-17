const Discord = require("discord.js");

exports.run = async (client, message, args) => {
  const emojis = ["✊", "✋", "✌"],
    hands = ["rock", "paper", "scissors"],
    // 0: tie, 1: win, -1: lose
    //          | rock  | paper | scissors
    // rock     |   0   |  -1   |    1
    // paper    |   1   |   0   |   -1
    // scissors |  -1   |   1   |    0
    results = [
      [0, -1, 1],
      [1, 0, -1],
      [-1, 1, 0],
    ];

  const rpsEmbed = new Discord.MessageEmbed();
  const timeoutEmbed = new Discord.MessageEmbed()
    .setTitle("You took to long to reply!")
    .setColor("#ff0000");
  const wrongEmbed = new Discord.MessageEmbed()
    .setTitle("Invalid usage of rps")
    .setDescription("Use `rock/paper/scissors` or shorter `r/p/s`.")
    .setColor("#ff0000");

  let input = args[0],
    tie = false,
    botHand,
    userHand,
    result;

  while (!tie) {
    if (!hands.includes(input) && !hands.map((x) => x[0]).includes(input)) {
      return await message.channel.send(wrongEmbed);
    }

    botHand = Math.round(Math.random() * (emojis.length - 1));
    userHand = hands.map((x) => x[0]).indexOf(args[0][0]);
    result = results[userHand][botHand];

    if (result !== 0) {
      tie = true;
      break;
    }

    rpsEmbed
      .setTitle("__Tie!__ 👔")
      .setDescription(
        `**${message.author}: ${emojis[userHand]} - ${emojis[botHand]} :${message.client.user}**\n\nPlease type \`r/p/s\` or \`rock/paper/scissors\` to continue!`
      )
      .setColor("#ffff00");
    await message.channel.send(rpsEmbed);
    const response = await message.channel
      .awaitMessages((m) => m.author.id == message.author.id, {
        max: 1,
        time: 30000,
        errors: ["time"],
      })
      .catch((collected) => null);

    if (response == null) {
      await message.channel.send(timeoutEmbed);
      break;
    }
    input = response.first().content.toLowerCase();
  }

  if (!tie) return;
  rpsEmbed
    .setTitle("__You lose!__ ❌")
    .setColor("#ff0000")
    .setDescription(
      `**${message.author}: ${emojis[userHand]} - ${emojis[botHand]} :${message.client.user}**`
    );

  if (result === 1) {
    rpsEmbed.setTitle("__You win!__ ✅").setColor("#00ff00");
  }
  await message.channel.send(rpsEmbed);
};

exports.help = {
  name: "rps",
};

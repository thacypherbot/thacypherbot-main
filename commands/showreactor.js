const Discord = require("discord.js");
const Autor = require("../models/autoreactor.js");
const mongoose = require("mongoose");
const Pagination = require("discord-paginationembed");
let FieldsEmbed;
let reactorsArray = [];
let title;
let description;
let messageEmbed;
let collectThisMsg;
let collected;

let paginationEmbed = (title, description, reactorsArray, message) => {
  FieldsEmbed = new Pagination.FieldsEmbed()
    // A must: an array to paginate, can be an array of any type
    .setArray(reactorsArray)
    // Set users who can only interact with the instance. Default: `[]` (everyone can interact).
    // If there is only 1 user, you may omit the Array literal.
    .setAuthorizedUsers([message.author.id])
    // A must: sets the channel where to send the embed
    .setChannel(message.channel)
    // Elements to show per page. Default: 10 elements per page
    .setElementsPerPage(5)
    // Have a page indicator (shown on message content). Default: false
    .setPageIndicator(false)
    // Format based on the array, in this case we're formatting the page based on each object's `word` property
    .formatField("\u200b", (el) => el);

  FieldsEmbed.embed.setColor(0xff00ae);
  FieldsEmbed.embed.setTitle(title);
  FieldsEmbed.embed.setDescription(description);
  return FieldsEmbed.build();
};

exports.run = async (client, message, args) => {
  let createAndWait = async (
    messageEmbed,
    collectThisMsg,
    collected,
    messageEmbedObject
  ) => {
    const msgFilter = (m) => m.author.id === message.author.id;
    const reactfilter = (reaction, user) => {
      return user.id === message.author.id;
    };
    messageEmbed = new Discord.MessageEmbed().setTitle(
      messageEmbedObject.title
    );
    messageEmbed.addField(messageEmbedObject.topic, messageEmbedObject.text);
    messageEmbed.setColor(messageEmbedObject.color);
    messageEmbed.setThumbnail(messageEmbedObject.thumbnail);
    collectThisMsg = await message.channel.send(messageEmbed);
    if (messageEmbedObject.boolean) {
      collected = await collectThisMsg.channel
        .awaitMessages(msgFilter, {
          max: 1,
          time: 20000,
        })
        .catch((err) => {
          console.log(err);
          return message.channel.send("``No input recieved.``");
        });
      if (messageEmbedObject.image) {
        if (collected.first().attachment === undefined) {
          return undefined;
        }
        return collected.first().attachment.url;
      }
      return collected.first().content;
    } else {
      for (let emoji of messageEmbedObject.emojiArray) {
        await collectThisMsg.react(emoji);
      }
      collected = await collectThisMsg.awaitReactions(reactfilter, {
        max: 1,
        time: 20000,
        errors: ["time"],
      });
      return collected.first().emoji.name;
    }
  };
  reactorsArray = [];
  if (!args[0]) {
    let foundDocs;
    foundDocs = await Autor.find().catch((err) => {
      return message.channel.send(
        "No saved reactors found. Please create a reactor using ``$reactor``"
      );
    });
    let reactorType;
    let status;
    for (let doc of foundDocs) {
      reactorType = doc.isPoll ? "📊 Poll" : "💈 Auto reactor";
      if (doc.isRunning) {
        status = `🟢 [running](${doc.reactorSettings.url})`;
      } else {
        status = `🟣 idle`;
      }
      reactorsArray.push(
        `🪧 \`\`id - ${doc.id}\`\` - Reactor type - \`\`${reactorType}\`\` - \`\`${status}\`\` \n`
        // `📌 \`\`pollTopic\`\` - ${doc.pollTopic} \n♑ \`\`pollColor\`\` - ${doc.pollColor} \n🖼️ \`\`pollImage\`\` - ${doc.pollimage} \n🤡 \`\`emojis\`\` - ${doc.emojis} \n📈 \`\`statsReactionNumber\`\` - ${doc.statsReactionNumber}  \n🧭 \`\`endReactionEmoji\`\` - ${doc.endReactionEmoji} \n🗳️ \`\`endReactionNumber\`\`  - ${doc.endReactionNumber}  \n⏳ \`\`endReactionTime\`\` - ${doc.endReactionTime} \n👨‍👦 \`\`role\`\` - ${doc.role} \n📩 \`\`notify\`\` - ${doc.notify} \n🧷 \`\`pin\`\` - ${doc.pin} \n🔁 \`\`rep\`\` - ${doc.rep} \n🎚️ \`\`repNum\`\` - ${doc.repNum}`
      );
    }
    title = "List of reactors";
    description =
      "To view or edit any reactor, use showreactor ``InsertIdHere``";
    paginationEmbed(title, description, reactorsArray, message);
  }

  if (args[0]) {
    let id = args[0];
    let doc;
    doc = await Autor.findOne({ id: id }).catch((err) => {
      return message.channel.send(
        `No reactor found with id ${id}. Please check available reactors with \`\`$showreactor\`\` and try again !`
      );
    });
    title = `id - \`\`${doc.id}\`\``;
    description = "";
    let i = 1;
    let arrayString = ``;
    arrayString =
      doc.pollTopic === undefined
        ? ``
        : arrayString + `📌 \`\`pollTopic\`\` - ${doc.pollTopic}`;
    arrayString =
      doc.pollColor === undefined
        ? arrayString
        : arrayString + `\n♑ \`\`pollColor\`\` - ${doc.pollColor}`;
    arrayString =
      doc.pollImage === undefined
        ? arrayString
        : arrayString + `\n🖼️ \`\`pollImage\`\` - ${doc.pollImage}`;
    for (let item of doc.optionsText) {
      arrayString =
        arrayString +
        `\n ➿ \`\`option${doc.optionsText.indexOf(item) + 1} - \`\` - ${
          item.text
        } `;
    }
    arrayString =
      doc.emojis === undefined
        ? arrayString
        : arrayString + `\n🤡 \`\`emojis\`\` - ${doc.emojis}`;
    arrayString =
      doc.statsReactionNumber === undefined
        ? arrayString
        : arrayString +
          `\n🖼 \`\`statsReactionNumber\`\` - ${doc.statsReactionNumber}`;
    arrayString =
      doc.endReactionEmoji === undefined
        ? arrayString
        : arrayString +
          `\n🧭 \`\`endReactionEmoji\`\` - ${doc.endReactionEmoji}`;
    arrayString =
      doc.endReactionNumber === undefined
        ? arrayString
        : arrayString +
          `\n🗳️ \`\`endReactionNumber\`\` - ${doc.endReactionNumber}`;
    arrayString =
      doc.endReactionTime === undefined
        ? arrayString
        : arrayString + `\n⏳ \`\`endReactionTime\`\` - ${doc.endReactionTime}`;
    arrayString =
      doc.role === undefined
        ? arrayString
        : arrayString + `\n👨‍👦 \`\`role\`\` - ${doc.role}`;
    arrayString =
      doc.notify === undefined
        ? arrayString
        : arrayString + `\n📩 \`\`notify\`\` - ${doc.notify}`;
    arrayString =
      doc.pin === undefined
        ? arrayString
        : arrayString + `\n🔁 \`\`pin\`\` - ${doc.pin}`;
    arrayString =
      doc.rep === undefined
        ? arrayString
        : arrayString + `\n🔁 \`\`rep\`\` - ${doc.rep}`;
    arrayString =
      doc.repNum === undefined
        ? arrayString
        : arrayString + `\n🎚️ \`\`repNum\`\` - ${doc.repNum}`;
    reactorsArray.push(
      arrayString
      // `📌 \`\`pollTopic\`\` - ${doc.pollTopic} \n♑ \`\`pollColor\`\` - ${doc.pollColor} \n🖼 \`\`pollImage\`\` - ${doc.pollimage} \n🤡 \`\`emojis\`\` - ${doc.emojis} \n \`\`statsReactionNumber\`\` - ${doc.statsReactionNumber}  \n🧭 \`\`endReactionEmoji\`\` - ${doc.endReactionEmoji} \n🗳️ \`\`endReactionNumber\`\`  - ${doc.endReactionNumber}  \n⏳ \`\`endReactionTime\`\` - ${doc.endReactionTime} \n👨‍👦 \`\`role\`\` - ${doc.role} \n📩 \`\`notify\`\` - ${doc.notify} \n🧷 \`\`pin\`\` - ${doc.pin} \n🔁 \`\`rep\`\` - ${doc.rep} \n🎚️ \`\`repNum\`\` - ${doc.repNum}`
    );
    paginationEmbed(title, description, reactorsArray, message);
    const userInputEmbed = new Discord.MessageEmbed().setTitle(
      `Reply with that property name you would like to change. You have 20 seconds`
    );
    const msgFilter = (m) => m.author.id === message.author.id;
    const userInput = await message.channel.send(userInputEmbed);
    const collected = await userInput.channel
      .awaitMessages(msgFilter, {
        max: 1,
        time: 20000,
      })
      .catch((err) => {
        console.log(err);
        return message.channel.send("``No input recieved.``");
      });
    let userInputMessage = collected.first().content;
    let messageEmbedObject = {
      title: "Auto reactor and Polls",
      topic: "Poll",
      text: "Please reply with poll topic",
      color: "#9400D3",
      thumbnail:
        "https://cdn.discordapp.com/attachments/728671530459856896/728677723198980167/television.png",
      boolean: true,
      emojiArray: [],
    };

    if (doc[userInputMessage] || doc.optionsText) {
      if (userInputMessage.includes(`option`)) {
        let optionNumber = parseInt(userInputMessage);
        messageEmbedObject.topic = "Poll";
        messageEmbedObject.text = `Please enter option ${optionNumber}`;
        let returnedText = await createAndWait(
          messageEmbed,
          collectThisMsg,
          collected,
          messageEmbedObject
        );
        doc.optionsText[theNumber - 1].text = returnedText;
      }

      if (userInputMessage === "pollTopic") {
        let pollTopic = await createAndWait(
          messageEmbed,
          collectThisMsg,
          collected,
          messageEmbedObject,
          message
        );
        doc.pollTopic = pollTopic;
      }
      if (userInputMessage === "pollColor") {
        messageEmbedObject.topic = "Poll";
        messageEmbedObject.text =
          "Please reply with poll color \n [view applicable colors here](https://discord.js.org/#/docs/main/stable/typedef/ColorResolvable)";
        messageEmbedObject.color = "#9400D3";
        messageEmbedObject.thumbnail =
          "https://media.discordapp.net/attachments/763795278079721482/765232054228090880/unknown.png";
        let pollColor = await createAndWait(
          messageEmbed,
          collectThisMsg,
          collected,
          messageEmbedObject
        );
        doc.pollColor = pollColor.toUpperCase();
      }

      if (userInputMessage === "pollImage") {
        messageEmbedObject.topic = "Poll";
        messageEmbedObject.text =
          "Please reply with the custom poll image \n if you don't want to set poll image please reply with ``no``";
        messageEmbedObject.color = "#9400D3";
        messageEmbedObject.image = true;
        messageEmbedObject.thumbnail =
          "https://media.discordapp.net/attachments/763795278079721482/765232054228090880/unknown.png";
        let pollImageCheck = await createAndWait(
          messageEmbed,
          collectThisMsg,
          collected,
          messageEmbedObject
        );
        let pollImage = pollImageCheck === undefined ? false : pollImageCheck;
        if (pollImage) {
          doc.pollImage = pollImage;
        }
      }
      if (userInputMessage === "statsReactionNumber") {
        messageEmbedObject.topic = "Trigger options";
        messageEmbedObject.text =
          "Please enter the number of reactions after which the stats are to be stored.";
        messageEmbedObject.color = "#9400D3";
        messageEmbedObject.thumbnail =
          "https://cdn.discordapp.com/attachments/728671530459856896/728680050295046214/bible.png";
        messageEmbedObject.boolean = true;
        statsReactionNumber = await createAndWait(
          messageEmbed,
          collectThisMsg,
          collected,
          messageEmbedObject
        );
      }
      if (userInputMessage === "endReactionEmoji") {
        messageEmbedObject.topic = "Trigger options";
        messageEmbedObject.text =
          "Please react this message with the reaction you would want to trigger this action";
        messageEmbedObject.color = "#9400D3";
        messageEmbedObject.thumbnail =
          "https://cdn.discordapp.com/attachments/728671530459856896/728680480559595630/love.png";
        messageEmbedObject.boolean = false;
        messageEmbedObject.emojiArray = [];
        let triggerTwoEmoji = await createAndWait(
          messageEmbed,
          collectThisMsg,
          collected,
          messageEmbedObject
        );
        doc.endReactionEmoji = triggerTwoEmoji;
      }
      if (userInputMessage === "endReactionNumber") {
        messageEmbedObject.topic = "Trigger options";
        messageEmbedObject.text =
          "Please enter the number of reactions to trigger this action";
        messageEmbedObject.color = "#9400D3";
        messageEmbedObject.thumbnail =
          "https://media.discordapp.net/attachments/728671530459856896/728681225971171389/kindness.png";
        messageEmbedObject.boolean = true;
        triggerThreeStatsMsgCollector = await createAndWait(
          messageEmbed,
          collectThisMsg,
          collected,
          messageEmbedObject
        );
        doc.endReactionNumber = parseInt(triggerThreeStatsMsgCollector);
      }
      if (userInputMessage === "role") {
        messageEmbedObject.topic = "Trigger options";
        messageEmbedObject.text =
          "Please Select which role \n ***1 - Admin \n 2 - Owner***";
        messageEmbedObject.color = "#9400D3";
        messageEmbedObject.thumbnail =
          "https://media.discordapp.net/attachments/728671530459856896/728682672615850135/person.png";
        messageEmbedObject.boolean = false;
        messageEmbedObject.emojiArray = ["1️⃣", "2️⃣"];

        let triggerFiveStatsMsgCollector = await createAndWait(
          messageEmbed,
          collectThisMsg,
          collected,
          messageEmbedObject
        );
        console.log(triggerFiveStatsMsgCollector);
        if (triggerFiveStatsMsgCollector === `1️⃣`) {
          finalPush = "Admin";
        }
        if (triggerFiveStatsMsgCollector === `2️⃣`) {
          finalPush = "Owner";
        }
        console.log(finalPush);
        prop.push(`\n - 👥 Role to Dm : ${finalPush}`);

        doc.role = finalPush;
      }
      if (userInputMessage === "rep") {
        messageEmbedObject.topic = "Triggers";
        messageEmbedObject.text =
          "Do you want to add a +rep to the author of the message on every upvote";
        messageEmbedObject.color = "#9400D3";
        messageEmbedObject.thumbnail =
          "https://media.discordapp.net/attachments/728671530459856896/728683970371387512/thumbs-up.png";
        messageEmbedObject.boolean = false;
        messageEmbedObject.emojiArray = [`✅`, `❎`];
        const triggerSevenEmoji = await createAndWait(
          messageEmbed,
          collectThisMsg,
          collected,
          messageEmbedObject
        );
        if (triggerSevenEmoji === `✅`) {
          doc.rep === `yes`;
        }
      }

      doc
        .save()
        .then(() => message.channel.send(`\`\`Value saved\`\``))
        .catch((err) => console.log(err));
    } else {
      message.channel.send(`You cannot edit that value.`);
    }
  }
};

exports.help = {
  name: "ar",
};

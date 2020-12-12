const Discord = require("discord.js");
const Autor = require("../models/autoreactor.js");
const mongoose = require("mongoose");
let letters = [`🇦`, `🇧`, `🇨`, `🇩`, `🇪`, `🇫`, `🇬`, `🇭`, `🇮`];
exports.run = async (client, message, args) => {
  // GETTING LIST OF CHANNELS---------------------------------------------------------------------------
  const result = client.guilds.cache.flatMap((guild) => guild.channels.cache);
  const rfilter = (x) => x.type === "text";
  const filteredresult = result.filter(rfilter);
  const finalchannellist = filteredresult.map((channel) => channel.name);
  // ---------------------------------------------------------------------------------------------------

  // CREATING EMBED AND SENDING IT---------------------------------------------------------------------------

  let prop = [];
  let statsReactionNumber;
  const newReactor = new Autor();
  newReactor.userid = message.author.id;
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
      collected = await collectThisMsg.channel.awaitMessages(msgFilter, {
        max: 1,
        time: 200000,
      });
      if (messageEmbedObject.image) {
        if (collected.first().attachments.first() === undefined) {
          return undefined;
        }
        return collected.first().attachments.first().url;
      }
      return collected.first().content;
    } else {
      for (let emoji of messageEmbedObject.emojiArray) {
        await collectThisMsg.react(emoji);
      }
      collected = await collectThisMsg.awaitReactions(reactfilter, {
        max: 1,
        time: 200000,
        errors: ["time"],
      });
      return collected.first().emoji.name;
    }
  };
  let messageEmbed;
  let collectThisMsg;
  let collected;
  let messageEmbedObject = {
    title: "Auto reactor and Polls",
    topic: "Channel select",
    text:
      "Please enter the name of the channel you wish to initiate Auto Reactor/ Polls.",
    color: "#9400D3",
    thumbnail:
      "https://cdn.discordapp.com/attachments/728671530459856896/728677723198980167/television.png",
    boolean: true,
    emojiArray: [],
  };

  messageEmbedObject.topic = "Auto reactor or Poll ?";
  messageEmbedObject.text = "\n - ``1️`` - Auto Reactor \n - ``2`` - Poll";
  messageEmbedObject.color = "#9400D3";
  messageEmbedObject.thumbnail =
    "https://cdn.discordapp.com/attachments/728671530459856896/728677723198980167/television.png";
  messageEmbedObject.boolean = true;

  let AutoOrPoll = await createAndWait(
    messageEmbed,
    collectThisMsg,
    collected,
    messageEmbedObject
  );
  let isPoll = AutoOrPoll === `2️`;
  if (AutoOrPoll === "2") {
    messageEmbedObject.topic = "Poll";
    messageEmbedObject.text = "Please reply with poll topic";
    messageEmbedObject.color = "#9400D3";
    messageEmbedObject.thumbnail =
      "https://media.discordapp.net/attachments/763795278079721482/765232054228090880/unknown.png";
    messageEmbedObject.boolean = true;
    let pollTopic = await createAndWait(
      messageEmbed,
      collectThisMsg,
      collected,
      messageEmbedObject
    );
    newReactor.pollTopic = pollTopic;
    newReactor.isPoll = true;
    prop.push(`\n - 📄 Poll Topic : ${pollTopic}`);

    messageEmbedObject.topic = "Poll";
    messageEmbedObject.text = "How many poll options do you want to add.";
    messageEmbedObject.color = "#9400D3";
    messageEmbedObject.thumbnail =
      "https://media.discordapp.net/attachments/763795278079721482/765232054228090880/unknown.png";

    let pollOptions = await createAndWait(
      messageEmbed,
      collectThisMsg,
      collected,
      messageEmbedObject
    );
    newReactor.optionsText = [];
    newReactor.pollOptions = parseInt(pollOptions);
    console.log(newReactor.pollOptions, `poll options`);
    let optionText;
    for (i = 0; i < newReactor.pollOptions; i++) {
      messageEmbedObject.text = `Please enter option ${i + 1}`;
      optionText = await createAndWait(
        messageEmbed,
        collectThisMsg,
        collected,
        messageEmbedObject
      );
      newReactor.optionsText.push({
        text: optionText,
        weights: 0,
        votes: 0,
        voterid: [],
        voterNames: [],
        emoji: letters[i],
        percent: 0,
      });
    }

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
    newReactor.pollColor = pollColor.toUpperCase();
    prop.push(`\n - 📄 Poll Color : ${pollColor}`);

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
      newReactor.pollImage = pollImage;
      console.log(newReactor.pollImage);
      prop.push(`\n - 📄 Poll Image : [click to view image](${pollImage})`);
    }
    messageEmbedObject.image = false;
    messageEmbedObject.topic = "Poll";
    messageEmbedObject.text =
      "Reply with ``yes`` for anonymous voting and ``no`` for public voting.";
    messageEmbedObject.color = "#9400D3";
    messageEmbedObject.thumbnail =
      "https://media.discordapp.net/attachments/763795278079721482/765232054228090880/unknown.png";
    let isAnon = await createAndWait(
      messageEmbed,
      collectThisMsg,
      collected,
      messageEmbedObject
    );
    newReactor.anon = isAnon === "yes";
    if (newReactor.anon) {
      newReactor.hasEnded = false;
    }
    prop.push(`\n - 📄 Anonymous voting : ${isAnon}`);

    messageEmbedObject.topic = "What roles should have access to the poll";
    let roleObject = {
      Everyone: "1",
      "New Heads": "2",
      Heads: "3",
      "Old Heads": "4",
      Supporter: "5",
    };
    messageEmbedObject.text =
      "1️ - Everyone \n 2️ - New Heads - ``Crowd, prospect, fan`` \n 3️ - Heads - ``Enthusiast, challenger, regular`` \n 4 - Old Heads - ``active, pro, vet, titan, legend`` \n 5 - Supporter";
    messageEmbedObject.color = "#9400D3";
    messageEmbedObject.thumbnail =
      "https://media.discordapp.net/attachments/763795278079721482/765232054228090880/unknown.png";
    messageEmbedObject.boolean = true;
    let pollRole = await createAndWait(
      messageEmbed,
      collectThisMsg,
      collected,
      messageEmbedObject
    );
    if (pollRole === "1") {
      newReactor.pollRole = "oneRoleArray";
      prop.push(`\n - 📄 Poll Roles : Everyone`);
    } else if (pollRole === "2") {
      newReactor.pollRole = "twoRoleArray";
      prop.push(`\n - 📄 Poll Roles : New Heads`);
    } else if (pollRole === "3") {
      newReactor.pollRole = "threeRoleArray";
      prop.push(`\n - 📄 Poll Roles : Heads`);
    } else if (pollRole === "4") {
      newReactor.pollRole = "fourRoleArray";
      prop.push(`\n - 📄 Poll Roles : Old Heads`);
    } else if (pollRole === "5") {
      newReactor.pollRole = "fiveRoleArray";
      prop.push(`\n - 📄 Poll Roles : Supporter`);
    } else {
      newReactor.pollRole = "oneRoleArray";
      prop.push(`\n - 📄 Poll Roles : Everyone`);
    }
    newReactor.totalVotes = 0;
  }

  messageEmbedObject.topic = "Triggers";
  messageEmbedObject.text =
    "Do you want enable stat point condition \n ``1`` - Yes \n ``2`` - No";
  messageEmbedObject.color = "#9400D3";
  messageEmbedObject.thumbnail =
    "https://cdn.discordapp.com/attachments/728671530459856896/728680050295046214/bible.png";
  messageEmbedObject.boolean = true;
  const triggerOneEmoji = await createAndWait(
    messageEmbed,
    collectThisMsg,
    collected,
    messageEmbedObject
  );

  if (triggerOneEmoji === "1") {
    prop.push(`\n - 📄 Stat point : yes`);
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
    console.log(statsReactionNumber);
    prop.push(`\n - 📄 Store stats at : ${statsReactionNumber} reactions`);
    console.log(parseInt(statsReactionNumber), `statsReactionNumber AYEEE`);
    newReactor.statsReactionNumber = parseInt(statsReactionNumber);
    console.log(newReactor, `statsReacNumber`);
  }
  if (!newReactor.isPoll) {
    messageEmbedObject.topic = "Triggers";
    messageEmbedObject.text =
      "Do you want to end reaction collector on a post by reacting with a certain emoji \n ``1`` - Yes \n ``2`` - No";
    messageEmbedObject.color = "#9400D3";
    messageEmbedObject.thumbnail =
      "https://cdn.discordapp.com/attachments/728671530459856896/728680480559595630/love.png";
    messageEmbedObject.boolean = true;
    const triggerTwoEmoji = await createAndWait(
      messageEmbed,
      collectThisMsg,
      collected,
      messageEmbedObject
    );
    console.log(triggerTwoEmoji);
    prop.push(`\n - 📊 End reaction with Emoji : ${triggerTwoEmoji}`);

    if (triggerTwoEmoji === "1") {
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
      console.log(triggerTwoEmoji);
      prop.push(`\n - 📊 End reaction Emoji : ${triggerTwoEmoji}`);
      newReactor.endReactionEmoji = triggerTwoEmoji;
    }

    messageEmbedObject.topic = "Trigger";
    messageEmbedObject.text =
      "Do you want to end reaction collector on a post after a certain reactions are reached \n ``1`` - Yes \n ``2`` - No";
    messageEmbedObject.color = "#9400D3";
    messageEmbedObject.thumbnail =
      "https://cdn.discordapp.com/attachments/728671530459856896/728680480559595630/love.png";
    messageEmbedObject.boolean = true;
    const triggerThreeEmoji = await createAndWait(
      messageEmbed,
      collectThisMsg,
      collected,
      messageEmbedObject
    );
    console.log(triggerThreeEmoji);
    prop.push(`\n - 🎬 End reaction after some cap : ${triggerThreeEmoji}`);
    if (triggerThreeEmoji === "1") {
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
      console.log(triggerThreeStatsMsgCollector);
      prop.push(
        `\n - 🎬 End reaction after cap : ${triggerThreeStatsMsgCollector}`
      );
      console.log(
        parseInt(triggerThreeStatsMsgCollector),
        `endReactionNumber HERE`
      );
      newReactor.endReactionNumber = parseInt(triggerThreeStatsMsgCollector);
      console.log(newReactor, `endReacNumber`);
    }
    messageEmbedObject.topic = "Reaction options";
    messageEmbedObject.text =
      "Do you want to add custom emojis or select from the presets \n ``1`` - Custom \n ``2`` - Preset";
    messageEmbedObject.color = "#9400D3";
    messageEmbedObject.thumbnail =
      "https://cdn.discordapp.com/attachments/728671530459856896/728677723198980167/television.png";
    messageEmbedObject.boolean = true;

    let reactCusOrPreMsgEmoji = await createAndWait(
      messageEmbed,
      collectThisMsg,
      collected,
      messageEmbedObject
    );
    prop.push(`\n - 📄 Reaction options : ${reactCusOrPreMsgEmoji}`);

    if (reactCusOrPreMsgEmoji === "2") {
      messageEmbedObject.topic = "Please choose one of the preset options";
      messageEmbedObject.text =
        "1 - ``✅`` - ``❎`` \n 2 - ``👍`` - ``🤐`` - `` 👎 `` \n 3 - ``😍`` - ``👍`` - ``🤐`` - `` 👎 `` - ``🤢``";
      messageEmbedObject.color = "#9400D3";
      messageEmbedObject.thumbnail =
        "https://cdn.discordapp.com/attachments/728671530459856896/728679330095300628/donate.png";
      messageEmbedObject.boolean = true;
      const finalPreset = await createAndWait(
        messageEmbed,
        collectThisMsg,
        collected,
        messageEmbedObject
      );
      console.log(
        typeof finalPreset,
        finalPreset,
        "is finalPreset === to 1 ? :",
        finalPreset === "3"
      );
      if (finalPreset === "1") {
        console.log(`WE ENTERED!`);
        const presetEmojis1 = `✅ - ❎`;
        prop.push(`\n - 📄 Preset emojis : ${presetEmojis1}`);
        newReactor.emojis.push(`✅`);
        newReactor.emojis.push(`❎`);
      } else if (finalPreset === "2") {
        const presetEmojis2 = `👍 - 🤐 - 👎`;
        prop.push(`\n - 📄 Preset emojis : ${presetEmojis2}`);
        newReactor.emojis.push(`👍`);
        newReactor.emojis.push(`🤐`);
        newReactor.emojis.push(`👎`);
      } else if (finalPreset === "3") {
        console.log(`third one`);
        const presetEmojis3 = `😍 - 👍 - 👎 - 🤐 - 🤢`;
        prop.push(`\n - 📄 Preset emojis : ${presetEmojis3}`);

        newReactor.emojis.push(`😍`);
        newReactor.emojis.push(`👍`);
        newReactor.emojis.push(`👎`);
        newReactor.emojis.push(`🤐`);
        newReactor.emojis.push(`🤢`);
      }
      newReactor.markModified("emojis");
    }

    console.log(newReactor.emojis);

    if (reactCusOrPreMsgEmoji === "1") {
      messageEmbedObject.topic = "Reactions to be done";
      messageEmbedObject.text =
        "Please select the number of reactions you want to be reacted on the messages. \n ``MINIMUM : 2``";
      messageEmbedObject.color = "#9400D3";
      messageEmbedObject.thumbnail =
        "https://cdn.discordapp.com/attachments/728671530459856896/728679330095300628/donate.png";
      messageEmbedObject.boolean = true;

      finalNum = await createAndWait(
        messageEmbed,
        collectThisMsg,
        collected,
        messageEmbedObject
      );
      const finalNum1 = parseInt(finalNum);
      console.log(finalNum1, `final num 1 here`);
      const afilter = (reaction, user) => {
        return user.id === message.author.id;
      };
      if (finalNum1 === 2) {
        const reactionSelect = new Discord.MessageEmbed().setTitle(
          "Auto reactions creator"
        );

        reactionSelect.addField(
          `Reactions to be done`,
          `Please react with the reactions you would like to be done `
        );
        reactionSelect.setColor(`#9400D3`);
        reactionSelect.setThumbnail(
          `https://cdn.discordapp.com/attachments/728671530459856896/728679330095300628/donate.png`
        );
        const reactSelectmsg = await message.channel.send(reactionSelect);

        reactSelectmsg.react(`⬆️`);
        reactSelectmsg.react(`⬇️`);

        const [reactionOne, reactionTwo] = (
          await reactSelectmsg.awaitReactions(afilter, {
            max: finalNum,
            time: 200000,
            errors: ["time"],
          })
        ).first(2);
        console.log(reactionOne.emoji.name);
        console.log(reactionTwo.emoji.name);
        prop.push(
          `\n - 🛡️ Custom emojis : ${reactionOne.emoji.name} - ${reactionTwo.emoji.name}`
        );
        newReactor.emojis.push(reactionOne.emoji.name);
        newReactor.emojis.push(reactionTwo.emoji.name);
      }
      //----------------------------

      if (finalNum1 === 3) {
        const reactionSelect = new Discord.MessageEmbed().setTitle(
          "Auto reactions creator"
        );

        reactionSelect.addField(
          `Reactions to be done`,
          `Please react with the reactions you would like to be done `
        );
        reactionSelect.setColor(`#9400D3`);
        reactionSelect.setThumbnail(
          `https://cdn.discordapp.com/attachments/728671530459856896/728679330095300628/donate.png`
        );
        const reactSelectmsg = await message.channel.send(reactionSelect);

        const [reactionOne, reactionTwo, reactionThree] = (
          await reactSelectmsg.awaitReactions(afilter, {
            max: finalNum,
            time: 200000,
            errors: ["time"],
          })
        ).first(3);
        reactionFinalOne = reactionOne.emoji.name;
        reactionFinalTwo = reactionTwo.emoji.name;
        reactionFinalThree = reactionThree.emoji.name;
        prop.push(
          `\n - 🛡️ Custom emojis : ${reactionFinalOne} - ${reactionFinalTwo} - ${reactionFinalThree}`
        );
        newReactor.emojis.push(reactionFinalOne);
        newReactor.emojis.push(reactionFinalTwo);
        newReactor.emojis.push(reactionFinalThree);
      }
      if (finalNum1 === 4) {
        const reactionSelect = new Discord.MessageEmbed().setTitle(
          "Auto reactions creator"
        );

        reactionSelect.addField(
          `Reactions to be done`,
          `Please react with the reactions you would like to be done`
        );
        reactionSelect.setColor(`#9400D3`);
        reactionSelect.setThumbnail(
          `https://cdn.discordapp.com/attachments/728671530459856896/728679330095300628/donate.png`
        );
        const reactSelectmsg = await message.channel.send(reactionSelect);

        const [reactionOne, reactionTwo, reactionThree, reactionFour] = (
          await reactSelectmsg.awaitReactions(afilter, {
            max: finalNum,
            time: 200000,
            errors: ["time"],
          })
        ).first(4);
        reactionFinalOne = reactionOne.emoji.name;
        reactionFinalTwo = reactionTwo.emoji.name;
        reactionFinalThree = reactionThree.emoji.name;
        reactionFinalFour = reactionFour.emoji.name;
        prop.push(
          `\n - 🛡️ Custom emojis : ${reactionFinalOne} - ${reactionFinalTwo} - ${reactionFinalThree} - ${reactionFinalFour}`
        );
        newReactor.emojis.push(reactionFinalOne);
        newReactor.emojis.push(reactionFinalTwo);
        newReactor.emojis.push(reactionFinalThree);
        newReactor.emojis.push(reactionFinalFour);
      }
      if (finalNum1 === 5) {
        const reactionSelect = new Discord.MessageEmbed().setTitle(
          "Auto reactions creator"
        );

        reactionSelect.addField(
          `Reactions to be done`,
          `Please react with the reactions you would like to be donee `
        );
        reactionSelect.setColor(`#9400D3`);
        reactionSelect.setThumbnail(
          `https://cdn.discordapp.com/attachments/728671530459856896/728679330095300628/donate.png`
        );
        const reactSelectmsg = await message.channel.send(reactionSelect);

        const [reactionOne, reactionTwo, reactionThree, reactionFour] = (
          await reactSelectmsg.awaitReactions(afilter, {
            max: finalNum,
            time: 200000,
            errors: ["time"],
          })
        ).first(5);
        reactionFinalOne = reactionOne.emoji.name;
        reactionFinalTwo = reactionTwo.emoji.name;
        reactionFinalThree = reactionThree.emoji.name;
        reactionFinalFour = reactionFour.emoji.name;
        reactionFinalFive = reactionFive.emoji.name;
        prop.push(
          `\n - 🛡️ Custom emojis : ${reactionFinalOne} - ${reactionFinalTwo} - ${reactionFinalThree} - ${reactionFinalFour} - ${reactionFinalFive}`
        );
        newReactor.emojis.push(reactionFinalOne);
        newReactor.emojis.push(reactionFinalTwo);
        newReactor.emojis.push(reactionFinalThree);
        newReactor.emojis.push(reactionFinalFour);
        newReactor.emojis.push(reactionFinalFive);
      }
      newReactor.markModified(`emojis`);
    }
    // messageEmbedObject.topic = "Triggers";
    // messageEmbedObject.text =
    //   "Do you want to Dm Admin/Owner roles on a particular stats trigger ?";
    // messageEmbedObject.color = "#9400D3";
    // messageEmbedObject.thumbnail =
    //   "https://media.discordapp.net/attachments/728671530459856896/728682672615850135/person.png";
    // messageEmbedObject.boolean = false;
    // messageEmbedObject.emojiArray = [`✅`, `❎`];
    // const triggerFiveEmoji = await createAndWait(
    //   messageEmbed,
    //   collectThisMsg,
    //   collected,
    //   messageEmbedObject
    // );
    // console.log(triggerFiveEmoji);
    // prop.push(`\n - 👥 Dm Admin / Owner  : ${triggerFiveEmoji}`);
    // if (triggerFiveEmoji === `✅`) {
    //   messageEmbedObject.topic = "Trigger options";
    //   messageEmbedObject.text =
    //     "Please Select which role \n ***1 - Admin \n 2 - Owner***";
    //   messageEmbedObject.color = "#9400D3";
    //   messageEmbedObject.thumbnail =
    //     "https://media.discordapp.net/attachments/728671530459856896/728682672615850135/person.png";
    //   messageEmbedObject.boolean = false;
    //   messageEmbedObject.emojiArray = ["1️⃣", "2️⃣"];

    //   let triggerFiveStatsMsgCollector = await createAndWait(
    //     messageEmbed,
    //     collectThisMsg,
    //     collected,
    //     messageEmbedObject
    //   );
    //   console.log(triggerFiveStatsMsgCollector);
    //   if (triggerFiveStatsMsgCollector === `1️⃣`) {
    //     finalPush = "Admin";
    //   }
    //   if (triggerFiveStatsMsgCollector === `2️⃣`) {
    //     finalPush = "Owner";
    //   }
    //   console.log(finalPush);
    //   prop.push(`\n - 👥 Role to Dm : ${finalPush}`);

    //   newReactor.role = finalPush;
    // }
    // if (triggerFiveEmoji === `✅`) {
    //   messageEmbedObject.topic = "Trigger";
    //   messageEmbedObject.text =
    //     "Set the reaction number trigger for the same please.";
    //   messageEmbedObject.color = "#9400D3";
    //   messageEmbedObject.thumbnail =
    //     "https://media.discordapp.net/attachments/728671530459856896/728683187735101516/mail.png";
    //   messageEmbedObject.boolean = true;
    //   const triggerFiveOptB = await createAndWait(
    //     messageEmbed,
    //     collectThisMsg,
    //     collected,
    //     messageEmbedObject
    //   );

    //   console.log(triggerFiveOptB);
    //   prop.push(`\n - 🔔 Dm stats reaction number : ${triggerFiveOptB}`);
    //   newReactor.notify = triggerFiveOptB;
    // }

    // messageEmbedObject.topic = "Triggers";
    // messageEmbedObject.text =
    //   "Do you want to add a +rep to the author of the message on every upvote";
    // messageEmbedObject.color = "#9400D3";
    // messageEmbedObject.thumbnail =
    //   "https://media.discordapp.net/attachments/728671530459856896/728683970371387512/thumbs-up.png";
    // messageEmbedObject.boolean = false;
    // messageEmbedObject.emojiArray = [`✅`, `❎`];
    // const triggerSevenEmoji = await createAndWait(
    //   messageEmbed,
    //   collectThisMsg,
    //   collected,
    //   messageEmbedObject
    // );
    // console.log(triggerSevenEmoji);
    // prop.push(`\n - ⏫ Add + rep  : ${triggerSevenEmoji}`);
    // if (triggerSevenEmoji === `✅`) {
    //   newReactor.rep === `yes`;
    // }
  }

  // messageEmbedObject.topic = "Triggers";
  // messageEmbedObject.text =
  //   "Do you want to end reaction collector on a post after certain amount of time ";
  // messageEmbedObject.color = "#9400D3";
  // messageEmbedObject.thumbnail =
  //   "https://cdn.discordapp.com/attachments/728671530459856896/728681875991822366/time.png";
  // messageEmbedObject.boolean = false;
  // messageEmbedObject.emojiArray = [`✅`, `❎`];
  // const triggerFourEmoji = await createAndWait(
  //   messageEmbed,
  //   collectThisMsg,
  //   collected,
  //   messageEmbedObject
  // );
  // console.log(triggerFourEmoji);
  // prop.push(`\n - ⏲️ End reaction after some time : ${triggerFourEmoji}`);
  // if (triggerFourEmoji === `✅`) {
  //   messageEmbedObject.topic = "Trigger options";
  //   messageEmbedObject.text =
  //     "Please enter the time in ``HOURS`` to trigger this action";
  //   messageEmbedObject.color = "#9400D3";
  //   messageEmbedObject.thumbnail =
  //     "https://cdn.discordapp.com/attachments/728671530459856896/728681875991822366/time.png";
  //   messageEmbedObject.boolean = true;
  //   let triggerFourStatsMsgCollector = await createAndWait(
  //     messageEmbed,
  //     collectThisMsg,
  //     collected,
  //     messageEmbedObject
  //   );
  //   console.log(triggerFourStatsMsgCollector);
  //   prop.push(
  //     `\n - ⏲️ End reaction after time : ${triggerFourStatsMsgCollector}`
  //   );
  //   newReactor.endReactionTime =
  //     parseInt(triggerFourStatsMsgCollector) * 3600000;
  // }

  newReactor.id = Math.random().toString(20).substr(2, 6);

  const confirmationEmbed = new Discord.MessageEmbed()
    .setColor("#E0FFFF")
    .setTitle(
      `Here are you AutoReact/Poll Details \n 
    \`\`ID: ${newReactor.id} \`\``
    )
    .setThumbnail(
      "https://cdn.discordapp.com/attachments/728671530459856896/728686591526174760/rocket.png"
    )
    .addFields({
      name: "Properties ",
      value: prop,
    });

  console.log(newReactor);
  await newReactor.save();
  message.channel.send(confirmationEmbed);
};

exports.help = {
  name: "ar",
};

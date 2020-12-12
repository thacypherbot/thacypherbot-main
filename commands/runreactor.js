const Discord = require("discord.js");
const schedule = require("node-schedule");
const Autor = require("../models/autoreactor.js");
const progressBar = require("../functions/bar.js");

let letters = [`🇦`, `🇧`, `🇨`, `🇩`, `🇪`, `🇫`, `🇬`, `🇭`, `🇮`];

exports.run = async (client, message, args) => {
  const msgFilter = (m) => m.author.id === message.author.id;
  console.log(args[0]);
  let foundDoc = await Autor.findOne({ id: args[0] }).catch((err) => {
    return message.channel.send(
      "No saved reactors found. Please create a reactor using ``$reactor``"
    );
  });
  if (foundDoc.isRunning) {
    return message.channel.send(`\`\`This reactor is already running.\`\``);
  }

  let askSettings = new Discord.MessageEmbed().setTitle(`Reaction settings`);

  let reactorSettings = {};
  if (foundDoc.isPoll) {
    askSettings
      .setDescription(
        "When do you want to schedule this ? \n ``1`` - Start right now \n ``2`` - Schedule a time."
      )
      .setColor("#800080");

    let askTimeEmbed = await message.channel.send(askSettings);
    const reactfilter = (reaction, user) => {
      return user.id === message.author.id;
    };
    let collected = await askTimeEmbed.channel
      .awaitMessages(msgFilter, {
        max: 1,
        time: 200000,
        errors: ["time"],
      })
      .catch((err) => {
        console.log(err);
        return message.channel.send(`invalid input`);
      });

    if (collected.first().content === "1") {
      reactorSettings.startTime = 0;
    } else if (collected.first().content === "2") {
      reactorSettings.scheduled = true;
      askSettings.setDescription(
        "Enter the day of the month you would want to schedule the poll."
      );
      askStartDayEmbed = await message.channel.send(askSettings);
      collected = await askStartDayEmbed.channel
        .awaitMessages(msgFilter, {
          max: 1,
          time: 200000,
          errors: ["time"],
        })
        .catch((err) => {
          console.log(err);
          return message.channel.send(`invalid input`);
        });
      reactorSettings.startTimeDay = parseInt(collected.first().content);
      askSettings.setDescription(
        "Enter the hour of the day you would want to schedule the poll."
      );
      askStartHourEmbed = await message.channel.send(askSettings);
      collected = await askStartHourEmbed.channel
        .awaitMessages(msgFilter, {
          max: 1,
          time: 200000,
        })
        .catch((err) => {
          console.log(err);
          return message.channel.send(`invalid input`);
        });
      reactorSettings.startTimeHour = parseInt(collected.first().content);
      askSettings.setDescription(
        "Enter the minute of the hour you would want to schedule the poll."
      );
      askStartMinuteEmbed = await message.channel.send(askSettings);
      collected = await askStartMinuteEmbed.channel
        .awaitMessages(msgFilter, {
          max: 1,
          time: 200000,
        })
        .catch((err) => {
          console.log(err);
          return message.channel.send(`invalid input`);
        });
      reactorSettings.startTimeMinute = parseInt(collected.first().content);
    }

    askSettings.setDescription(
      `When do you want to terminate the process of the reactor ? \n \`\`1\`\` - Schedule a time \n \`\`2\`\` - Custom - \`\`$reactorstop <reactoridhere>\`\``
    );

    let askEndTimeEmbed = await message.channel.send(askSettings);
    collected = await askEndTimeEmbed.channel
      .awaitMessages(msgFilter, {
        max: 1,
        time: 200000,
        errors: ["time"],
      })
      .catch((err) => {
        console.log(err);
        return message.channel.send(`invalid input`);
      });

    if (collected.first().content === "1") {
      reactorSettings.endCustom = false;
      askSettings.setDescription(
        "Enter the day of the month you would want to terminate the poll."
      );
      askEndDayEmbed = await message.channel.send(askSettings);
      collected = await askEndDayEmbed.channel
        .awaitMessages(msgFilter, {
          max: 1,
          time: 200000,
        })
        .catch((err) => {
          console.log(err);
          return message.channel.send(`invalid input`);
        });
      reactorSettings.endTimeDay = parseInt(collected.first().content);
      askSettings.setDescription(
        "Enter the hour of the day you would want to terminate the poll."
      );
      askEndHourEmbed = await message.channel.send(askSettings);
      collected = await askEndHourEmbed.channel
        .awaitMessages(msgFilter, {
          max: 1,
          time: 200000,
        })
        .catch((err) => {
          console.log(err);
          return message.channel.send(`invalid input`);
        });
      reactorSettings.endTimeHour = parseInt(collected.first().content);
      askSettings.setDescription(
        "Enter the minute of the hour you would want to terminate the poll."
      );
      askEndMinuteEmbed = await message.channel.send(askSettings);
      collected = await askEndMinuteEmbed.channel
        .awaitMessages(msgFilter, {
          max: 1,
          time: 200000,
        })
        .catch((err) => {
          console.log(err);
          return message.channel.send(`invalid input`);
        });
      reactorSettings.endTimeMinute = parseInt(collected.first().content);
    }
    askSettings.setDescription(
      "If you want people to cast multiple votes, reply with a ``yes`` else reply with a ``no``"
    );
    let askMultipleEmbed = await message.channel.send(askSettings);
    collected = await askMultipleEmbed.channel
      .awaitMessages(msgFilter, {
        max: 1,
        time: 200000,
      })
      .catch((err) => {
        console.log(err);
        return message.channel.send(`invalid input`);
      });
    reactorSettings.multiple =
      collected.first().content === "yes" ? true : false;
    reactorSettings.isPoll = true;
  }
  askSettings.setDescription(
    "In which channel do you want to initiate the reactor ?"
  );
  let askChannelEmbed = await message.channel.send(askSettings);
  collected = await askChannelEmbed.channel
    .awaitMessages(msgFilter, {
      max: 1,
      time: 200000,
    })
    .catch((err) => {
      console.log(err);
      return message.channel.send(`invalid input`);
    });

  let allReactors = await Autor.find().catch((err) => {
    return message.channel.send(
      "No saved reactors found. Please create a reactor using ``$reactor``"
    );
  });
  let i = 0;
  const checkDups = allReactors.some((item) => {
    console.log(item, i++);
    if (item.reactorSettings) {
      console.log(
        item.reactorSettings.channel,
        collected.first().mentions.channels.first().id
      );
      item.reactorSettings.channel ===
        collected.first().mentions.channels.first().id;
    }
  });
  console.log(checkDups, `check dups`);
  if (checkDups) {
    return message.channel.send(
      `You already have a reactor set for that channel. Please try again and choose a different channel.`
    );
  }
  reactorSettings.channel = collected.first().mentions.channels.first();
  let confirmationEmbed = new Discord.MessageEmbed();
  confirmationEmbed.setColor(`#BFFF00`);
  confirmationEmbed.setDescription(`✅ Your reactor is scheduled !`);
  message.channel.send(confirmationEmbed);
  if (!foundDoc.isPoll) {
    reactorSettings.count = 0;
    foundDoc.isRunning = true;
    foundDoc.reactorSettings = reactorSettings;
    foundDoc.markModified("reactorSettings");
    foundDoc.markModified("isRunning");
    foundDoc.save().catch((err) => console.log(err));
    return;
  }
  if (foundDoc.isPoll) {
    // askSettings.setTitle(
    //   `Do you want to run this poll on intervals ? If \`\`yes\`\`, then please enter the hour of the day you would want the reactor to be else enter \`\`no\`\``
    // );
    // let askIntervalEmbed = await message.channel.send(askSettings);
    // collected = await askIntervalEmbed.channel.awaitMessages(msgFilter, {
    //   max: 1,
    //   time: 20000,
    // });
    // reactorSettings.interval = true;
    // reactorSettings.intervalTime = collected.first().content;
    // console.log(reactorSettings.intervalTime, `int time`);
    // reactorSettings.interval =
    //   reactorSettings.intervalTime === "no" ? false : true;
    let pollEmbed = new Discord.MessageEmbed()
      .setTitle(`📊 ${foundDoc.pollTopic}`)
      .setColor(foundDoc.pollColor)
      .setImage(foundDoc.pollImage);
    let i = 0;
    let optionString = ``;
    let progressBarHere = foundDoc.anon ? `` : progressBar(0, 100, 10);
    for (let field of foundDoc.optionsText) {
      optionString += `\n ${letters[i++]} **${
        field.text
      }** \n ${progressBarHere}`;
    }
    pollEmbed.setDescription(optionString + `\n 📩 Total Votes: 0`);
    const runPoll = async () => {
      const pollEmbedMessage = await reactorSettings.channel.send(pollEmbed);
      reactorSettings.messageId = pollEmbedMessage.id;
      for (let numberOfFlieds in foundDoc.optionsText) {
        await pollEmbedMessage.react(letters[numberOfFlieds]);
      }
      reactorSettings.url = pollEmbedMessage.url;
    };
    foundDoc.reactorSettings = reactorSettings;
    foundDoc.grandTotal = [];
    foundDoc.markModified("optionsText");
    foundDoc.markModified("reactorSettings");
    foundDoc.markModified("grandTotal");
    if (reactorSettings.startTime === 0) {
      console.log("set to false");
      foundDoc.isRunning = true;
      await runPoll();
    } else {
      console.log("set to true");
      foundDoc.isRunning = false;
    }
    foundDoc.markModified("isRunning");
    await foundDoc.save().catch((err) => console.log(err));
    schedule.scheduleJob(
      `${reactorSettings.startTimeMinute} ${reactorSettings.startTimeHour} ${reactorSettings.startTimeDay} * *`,
      async function () {
        foundDoc.isRunning = true;
        await runPoll();
        foundDoc.markModified("reactorSettings");
        foundDoc.markModified("isRunning");
        await foundDoc.save().catch((err) => console.log(err));
      }
    );

    schedule.scheduleJob(
      `${reactorSettings.endTimeMinute} ${reactorSettings.endTimeHour} ${reactorSettings.endTimeDay} * *`,
      async function () {
        console.log(args[0], `hiiii`);
        let updatedDoc = await Autor.findOne({ id: args[0] }).catch((err) => {
          return message.channel.send(
            "No saved reactors found. Please create a reactor using ``$reactor``"
          );
        });
        fetchedChannel = await client.channels
          .fetch(updatedDoc.reactorSettings.channel)
          .catch((err) => {
            console.log(err);
          });

        fetchedMessage = await fetchedChannel.messages
          .fetch(updatedDoc.reactorSettings.messageId)
          .catch((err) => {
            console.log(err);
          });
        let embedObject = fetchedMessage.embeds[0];
        updatedDoc.isRunning = false;
        for (i = 0; i < updatedDoc.optionsText.length; i++) {
          delete embedObject.fields[i];
        }
        let optionString = ``;
        let k = 0;
        for (let foo of updatedDoc.optionsText) {
          optionString += `\n ${letters[k++]} ***${
            foo.text
          }*** \n ${progressBar(foo.percent, 100, 10)}`;
        }

        embedObject.setDescription(
          optionString + `\n 📩 Total Votes : ${updatedDoc.grandTotal.length}`
        );
        embedObject.setFooter(`The poll has ended`);
        fetchedMessage.edit(embedObject);
        await updatedDoc.save().catch((err) => console.log(err));
      }
    );

    // let foundElementVotes;
    // let totalVotes;
    // let numberOfVotes = 0;

    // console.log(foundElementVotes, `voted here`);
    // foundElementVotes.votes += 1;
    // foundElementVotes.voterid.push(user.id);
    // totalVotes = () => {
    //   numberOfVotes = 0;
    //   for (elements of foundDoc.optionsText) {
    //     numberOfVotes += elements.votes;
    //   }
    //   return numberOfVotes;
    // };
    // console.log(totalVotes(foundDoc), `total votes here`);
    // foundElementVotes.percent =
    //   (foundElementVotes.votes * 100) / totalVotes(foundDoc);
    // console.log(foundElementVotes.percent);

    // for (i = 0; i < foundDoc.optionsText.length; i++) {
    //   delete pollEmbed.fields[i];
    // }
    // k = 0;
    // for (let foo of foundDoc.optionsText) {
    //   optionString += `\n ${letters[k++]} ***${foo.text}*** \n ${progressBar(
    //     foo.percent,
    //     100,
    //     10
    //   )}`;
    // }
    // pollEmbed.setDescription(optionString);
    // pollEmbedMessage.edit(pollEmbed);

    // console.log(`collected`, reaction.emoji.name);

    // if (totalVotes() === foundDoc.statsReactionNumber) {
    //   let statReactionData = [];
    //   let foundUser;
    //   foundDoc.optionsText.forEach((value, index) => {
    //     foundUser = client.users.cache.find((user) => user.id === value);
    //     foundDoc.voterNames.push(foundUser.username);
    //   });
    //   for (let data of founddoc.optionsText) {
    //     statReactionData.push(
    //       `😀 \`\`Emoji\`\` : ${data.emoji} \n 📮 \`\`Votes\`\` : ${data.votes} \n 👥 \`\`Voters\`\` : ${data.voterNames} \n 📊 \`\`Percent\`\` : ${data.percent}`
    //     );
    //   }
    //   const statsEmbed = new Discord.MessageEmbed().setTitle("Stats Report");
    //   let ref =
    //     "http://discordapp.com/channels/" +
    //     pollEmbedMessage.guild.id +
    //     "/" +
    //     pollEmbedMessage.channel.id +
    //     "/" +
    //     pollEmbedMessage.id;
    //   statsEmbed.addField(
    //     `Stats resport - Triggered at ${founddoc.statsReactionNumber} Reactions`,
    //     ` \n ${statReactionData} \n \`\`Original message\`\` ${ref}`
    //   );
    //   statsEmbed.setColor(`#9400D3`);
    //   statsEmbed.setThumbnail(
    //     `https://cdn.discordapp.com/attachments/728671530459856896/729851605104590878/chart.png`
    //   );
    //   client.channels.fetch("730608533112094781").then((channel) => {
    //     channel.send(statsEmbed);
    //   });
    // }

    // }, reactorSettings.startTime);
  }
};

exports.help = {
  name: "runreactor",
};

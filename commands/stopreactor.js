const Discord = require("discord.js");
const Autor = require("../models/autoreactor.js");
const mongoose = require("mongoose");
const progressBar = require("../functions/bar.js");
let letters = [`🇦`, `🇧`, `🇨`, `🇩`, `🇪`, `🇫`, `🇬`, `🇭`, `🇮`];

exports.run = async (client, message, args) => {
  let foundReactor = await Autor.findOne({ id: args[0] }).catch((err) => {
    console.log(err);
    return message.channel.send(`An error occured, please try again.`);
  });
  if (foundReactor.isRunning) {
    foundReactor.isRunning = false;
    foundReactor.markModified(`isRunning`);
    await foundReactor.save().catch((error) => console.log(error));
    if (foundReactor.anon) {
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
        optionString += `\n ${letters[k++]} ***${foo.text}*** \n ${progressBar(
          foo.percent,
          100,
          10
        )}`;
      }

      embedObject.setDescription(
        optionString + `\n 📩 Total Votes : ${updatedDoc.grandTotal.length}`
      );
      embedObject.setFooter(`The poll has ended`);
      fetchedMessage.edit(embedObject);
      await updatedDoc.save().catch((err) => console.log(err));
    }
    return message.channel.send(`\`\`Reactor successfully terminated !\`\``);
  }
};

exports.help = {
  name: "endreactor",
};

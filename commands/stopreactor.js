const Discord = require("discord.js");
const Autor = require("../models/autoreactor.js");
const mongoose = require("mongoose");

exports.run = async (client, message, args) => {
  let foundReactor = await Autor.findOne({ id: args[0] }).catch((err) => {
    console.log(err);
    return message.channel.send(`An error occured, please try again.`);
  });
  if (foundReactor.isRunning) {
    foundReactor.isRunning = false;
    foundReactor.markModified(`isRunning`);
    await foundReactor.save().catch((error) => console.log(error));
    return message.channel.send(`\`\`Reactor successfully terminated !\`\``);
  } else {
    return message.channel.send(
      `\`\` The reactor has already been terminated. \`\``
    );
  }
};

exports.help = {
  name: "endreactor",
};

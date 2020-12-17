const Discord = require("discord.js");
const Reps = require("../models/reps.js");
const GuildSettings = require("../models/guildSettings.js");
const Profile = require("../models/profile.js"); // when in main repo
const convertMS = require("../functions/convertMS");
const profanity = require("@2toad/profanity").profanity;
const Pagination = require("discord-paginationembed");

exports.run = async (client, message, args) => {
  if (args[0] === "set") {
    // Don't continue if author doesn't have ADMIN
    if (!message.member.hasPermission("ADMINISTRATOR")) {
      const permEmbed = new Discord.MessageEmbed()
        .setTitle(
          "You need to have the ADMINISTRATOR permission to use this command."
        )
        .setColor("#ff0000");
      return message.channel.send(permEmbed);
    }

    const repName = args[1].toLowerCase();

    // Don't allow usage of words that trigger other commands.
    const cmd = repName === "rep" ? false : repName;
    if (client.commands.get(cmd))
      return message.channel.send("Sorry, `" + repName + "` is reserved.");
    if (repName.length < 3)
      return message.channel.send(
        "Sorry, but `" + repName + "` must be at least 3 characters long."
      );
    if (repName.length > 10)
      return message.channel.send(
        "Sorry, but `" + repName + "` must not exceed 10 characters in length."
      );

    // Set the new rep command trigger
    const guildRes = await GuildSettings.findOne({
      guildID: message.guild.id,
    });

    if (!guildRes) {
      const tmpGuildRes = new GuildSettings({
        guildID: message.guild.id,
        repName: repName,
      });
      tmpGuildRes.save().catch((err) => console.log(err));
    } else {
      guildRes.repName = repName;
      guildRes.markModified("repName");
      guildRes.save().catch((err) => console.log(err));
    }

    const replyStr = `Done! You can now trigger rep using: ${repName}`;
    return await message.channel.send(replyStr);
  } else if (args[0] === "show") {
    // Get trigger word, if it exists
    // Else use rep
    const guildRes = await GuildSettings.findOne({
      guildID: message.guild.id,
    });
    const repName = guildRes ? guildRes.repName : "rep";
    // Get the provided user's reps
    // Else get author's
    const person =
      message.mentions.users.first() ||
      message.client.users.cache.get(args[1]) ||
      message.author;
    const personRepRes = await Reps.findOne({
      userid: person.id,
    });
    const replyEmbed = new Discord.MessageEmbed()
      .setColor("#ffff00")
      .setTitle(
        (person === message.author ? "You don't" : `${person.tag} doesn't`) +
          " have any " +
          (repName.endsWith("s") ? repName : repName + "s")
      );

    // If provided user doesn't have a db entry, reply with that
    if (!personRepRes) return await message.channel.send(replyEmbed);

    // The array that contains all user's reviews
    const reviews = personRepRes.reviews;

    replyEmbed.setTitle(
      (person === message.author ? "You have" : `${person.tag} has`) +
        ` ${personRepRes.reps} ` +
        (repName.endsWith("s") ? repName : repName + "s")
    );

    // If they have 0 reviews, reply with just their reps (or coins)
    if (reviews.length === 0) return await message.channel.send(replyEmbed);

    //pagination
    const FieldsEmbed = new Pagination.FieldsEmbed()
      .setArray(reviews)
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel)
      .setElementsPerPage(1)
      .setPage(1)
      .setPageIndicator(true)
      .formatField("Reviews", (i) => {
        // reviews include a "from" key
        // that holds the submitter's id
        // we can search in cache for their tag
        // if not found, just change it to a mention
        // (tags are prefered as mentions depend on client's cache and not on bot's)
        const userReview = message.client.users.cache.get(i.from);
        return (
          "From: " +
          (userReview ? userReview.tag : "<@" + i.from + ">") +
          "\n```" +
          i.review +
          "```"
        );
      })
      .setDisabledNavigationEmojis(["delete"])
      .setEmojisFunctionAfterNavigation(false);

    FieldsEmbed.embed
      .setColor("#ffff00")
      .setTitle(
        (person === message.author ? "You have" : `${person.username} has`) +
          ` ${personRepRes.reps} ` +
          (repName.endsWith("s") ? repName : repName + "s")
      );

    return await FieldsEmbed.build();
  }

  // Check if the provided user exists and is not a bot or author
  // (Author shouldn't be able to rep themselves)
  const person =
    message.mentions.users.first() || message.client.users.cache.get(args[0]);
  if (!person || person.bot || person === message.author) {
    const incorrectEmbed = new Discord.MessageEmbed()
      .setAuthor(
        "Incorrect Usage",
        message.author.displayAvatarURL({ format: "png", dynamic: true })
      )
      .setDescription(
        `:x: **${message.author.username}** please mention a valid user`
      )
      .setColor("#ffff00");
    return message.channel.send(incorrectEmbed);
  }

  // Get trigger word, if it exists
  // Else use rep
  const guildRes = await GuildSettings.findOne({
    guildID: message.guild.id,
  });
  const repName = guildRes ? guildRes.repName : "rep";

  // args minus the first item
  // which is the mention/id
  // Profanity#censor returns String with profanity censored
  const review = profanity.censor(args.slice(1).join(" "));

  if (review.length > 200)
    return message.channel.send("Review can't be over 200 characters");

  // Get author and provided user enties
  // If they exist, else create them
  const authorRepRes = await Reps.findOne({
    userid: message.author.id,
  });

  const personRepRes = await Reps.findOne({
    userid: person.id,
  });

  const personProfileRes = await Profile.findOne({
    userid: person.id,
  });

  // We will set the timer to 24 hours from now
  // So users can't spam it
  const repLimit = new Date().getTime() + 24 * 60 * 60 * 1000; // unixms now + 24 hours

  if (!authorRepRes) {
    const tmpAuthorRes = new Reps({
      userid: message.author.id,
      reps: 0,
      timeLeft: repLimit,
      reviews: [],
    });
    tmpAuthorRes.save().catch((err) => console.log(err));
    // If 24 hours havent passed
  } else if (new Date().getTime() < authorRepRes.timeLeft) {
    const waitEmbed = new Discord.MessageEmbed()
      .setTitle("You will be able to " + repName + " someone in:")
      .setColor("#ff0000")
      .setDescription(convertMS(authorRepRes.timeLeft - new Date().getTime())); // time left
    return await message.channel.send(waitEmbed);
  } else {
    authorRepRes.timeLeft = repLimit;
    authorRepRes.markModified("timeLeft");
    authorRepRes.save().catch((err) => console.log(err));
  }

  // let's generate the object
  // which will hold the review
  const reviewGen = {
    from: message.author.id,
    review: review,
  };

  if (!personRepRes) {
    const tmpPersonRes = new Reps({
      userid: person.id,
      reps: 1,
      timeLeft: 0,
      reviews: review.length > 0 ? [reviewGen] : [],
    });
    tmpPersonRes.save().catch((err) => console.log(err));
  } else {
    personRepRes.reps += 1;
    personRepRes.markModified("reps");
    if (review.length > 0) {
      personRepRes.reviews.push(reviewGen);
      personRepRes.markModified("reviews");
    }
    personRepRes.save().catch((err) => console.log(err));
  }

  // Lets deal with the profile model
  if (!personProfileRes) {
    const tmpProfileRes = new Profile({
      userid: person.id,
      coins: 1,
      bets: 0,
    });
    tmpProfileRes.save().catch((err) => console.log(err));
  } else {
    personProfileRes.coins += 1;
    personProfileRes.markModified("coins");
    personProfileRes.save().catch((err) => console.log(err));
  }

  // Not embed so person can get notified
  const replyStr = `${person}, you just received a ${repName} from ${message.author}`;
  return await message.channel.send(replyStr);
};

exports.help = {
  name: "rep",
};

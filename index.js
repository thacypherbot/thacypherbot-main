const Discord = require("discord.js");
const client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION", "USER"],
});
const schedule = require("node-schedule");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const fs = require("fs-extra");
const mergeStream = require("merge-stream");
const { getAudioDurationInSeconds } = require("get-audio-duration");
const Enmap = require("enmap");
const UserRecords = require("./models/userrecords.js");
const ServerRecords = require("./models/serverrecords.js");
const TextRecords = require("./models/textrecords.js");
const SetText = require("./models/settext.js");
const progressBar = require("./functions/bar.js");
const Autor = require("./models/autoreactor.js");
const ReactorProfile = require("./models/reactorprofile.js");
const PersonalProfile = require("./models/personalprofile.js");
const hasRole = require("./functions/hasRole.js");
const textRecordMessageAfterConfirmation = require("./functions/textRecordMessageAfterConfirmation.js");
let prefix = `$`;
class Readable extends require("stream").Readable {
  _read() {}
}
let recording = false;
let processing = false;
let progressTarget;
let progressPercent;
let currently_recording = {};
let mp3Paths = [];
let collectedTitle;
const silence_buffer = new Uint8Array(3840);
const express = require("express");
const app = express();
const port = 3333;
const publicIP = require("public-ip");
const { program } = require("commander");
const version = "0.0.1";
program.version(version);
let debug = false;
let runProd = true;
let fqdn = "";
let type = {};
const mongoose = require("mongoose");
const { time } = require("console");
const { title } = require("process");
mongoose.connect(
  "mongodb+srv://admin:admin@cluster0.3iec5.gcp.mongodb.net/AR?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
  },
  function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Database connection initiated");
    }
  }
);
require("dotenv").config();
function bufferToStream(buffer) {
  let stream = new Readable();
  stream.push(buffer);
  return stream;
}

client.commands = new Enmap();

let foundReactor;
let theReactor;

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  let host = "localhost";

  let ip = await publicIP.v4();

  let protocol = "http";
  if (!runProd) {
    host = "localhost";
  } else {
    host = `34.123.196.27`;
  }
  fqdn = `${protocol}://${host}:${port}`;
  app.listen(port, `0.0.0.0`, () => {
    console.log(`Listening on port ${port} for ${host} at fqdn ${fqdn}`);
  });
});
let randomArr = [];
let finalArrWithIds = [];
function getFileName() {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1;
  let yyyy = today.getFullYear();
  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;
  return yyyy + "-" + mm + "-" + dd;
}
function getTimeNow() {
  let today = new Date();
  let hours = today.getHours();
  let minutes = today.getMinutes();
  let seconds = today.getSeconds();
  let mili = today.getMilliseconds();
  let finalString = `${hours}${minutes}${seconds}${mili}`;
  return finalString.slice(8, 9);
}
async function textRecordConfirmation(message, date) {
  const msgFilter = (m) => {
    let title = m.content.replace(/\s/g, "");
    if (m.author.id !== message.author.id) return false;
    if (title.length > 25) {
      message.author.send(
        `The title is longer than 25 characters, please try again.`
      );
      return false;
    } else {
      return true;
    }
  };
  let textRecordTitle = new Discord.MessageEmbed().setTitle(
    `🎐 Lets give your masterpiece a title.`
  );
  textRecordTitle.setDescription(
    `Please reply to this message with a title no more than 25 characters. You have 30 seconds.`
  );
  textRecordTitle.setThumbnail(
    `https://media.discordapp.net/attachments/748005515992498297/756094502535692338/title.png?width=100&height=100`
  );
  textRecordTitle.setFooter(
    `🔺 If you fail to reply with a title, it will be set to ${date} by default`
  );
  textRecordTitle.setColor(`#00FFFF`);
  let textRecordTitleMessage = await message.author.send(textRecordTitle);
  let textRecordTitleMessageCollector = await textRecordTitleMessage.channel.awaitMessages(
    msgFilter,
    {
      max: 1,
      time: 30000,
    }
  );

  return textRecordTitleMessageCollector.first()
    ? textRecordTitleMessageCollector.first().content
    : date;
}

const generateSilentData = async (silentStream, memberID) => {
  console.log(`recordingnow`);
  while (recording) {
    if (!currently_recording[memberID]) {
      silentStream.push(silence_buffer);
    }
    await new Promise((r) => setTimeout(r, 20));
  }
  return "done";
};

if (!fs.existsSync("public")) {
  fs.mkdirSync("public");
}
app.use("/public", express.static("./public"));
let selectedProfile;
let personProfile;
let exists;
client.on("message", async (message) => {
  if (message.author.bot) return;
  let collectedEmojis = 0;
  let reactedArray = [];
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  // TEXT RECORDING START

  foundReactor = await Autor.find();
  for (theReactor of foundReactor) {
    if (!theReactor.isRunning || theReactor.isPoll) continue;
    if (message.channel.id === theReactor.reactorSettings.channel) {
      selectedProfile = new ReactorProfile();
      exists = await PersonalProfile.exists({ userid: message.author.id });
      console.log(exists);
      if (exists) {
        personProfile = await PersonalProfile.findOne({
          userid: message.author.id,
        });
      } else {
        console.log("person profile not found");
        personProfile = new PersonalProfile();
        personProfile.userid = message.author.id;
      }
      selectedProfile.userid = message.author.id;
      selectedProfile.messageid = message.id;
      selectedProfile.stillRunning = true;
      selectedProfile.totalVotes = 0;
      for (emojiToBeReacted of theReactor.emojis) {
        message.react(emojiToBeReacted);
        if (
          !personProfile.emojiData.some(
            (item) => item.emojiName === emojiToBeReacted
          )
        ) {
          personProfile.emojiData.push({
            emojiName: emojiToBeReacted,
            count: 0,
          });
        }
        selectedProfile.emojiData.push({
          emojiName: emojiToBeReacted,
          count: 0,
        });
      }
      selectedProfile.markModified(`emojiData`);
      selectedProfile.save().catch((err) => console.log(err));

      personProfile.markModified(`emojiData`);
      personProfile.save().catch((err) => console.log(err));
    }
  }
  const guildID = message.guild ? message.guild.id : console.log(`NO`);
  const foundGuild = await SetText.findOne({ guildid: guildID });
  if (
    message.content.split(/\r\n|\r|\n/).length > 4 &&
    foundGuild.channels.includes(message.channel.id)
  ) {
    console.log(`hello`);
    console.log(message.url);
    let textRecordObject = {};
    let date = getFileName();
    let messageUrl = message.url;
    let checkingTextRecord = await TextRecords.exists({
      userid: message.author.id,
    });
    if (checkingTextRecord) {
      existingTextRecord = await TextRecords.findOne({
        userid: message.author.id,
      });
      textRecordObject = {
        date: date,
        title: ``,
        channel: message.channel.name,
        text: message.content,
        link: messageUrl,
      };
      textRecordObject.title = await textRecordConfirmation(message, date);

      existingTextRecord.content.push(textRecordObject);
      existingTextRecord
        .save()
        .then(async () => {
          console.log(`saved existing`);
          await textRecordMessageAfterConfirmation(message, textRecordObject);
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (!checkingTextRecord) {
      let newTextRecord = new TextRecords();
      textRecordObject = {
        date: date,
        title: ``,
        channel: message.channel.name,
        text: message.content,
        link: messageUrl,
      };
      newTextRecord.userid = message.author.id;
      textRecordObject.title = await textRecordConfirmation(message, date);
      newTextRecord.content.push(textRecordObject);
      newTextRecord
        .save()
        .then(async () => {
          console.log(`saved`);
          await textRecordMessageAfterConfirmation(message, textRecordObject);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    // TEXT RECORDING STOP
  }
  let locked = false;
  if (!message.guild) return;
  console.log(message.content);

  if (message.content === `${prefix}record`) {
    console.log(hasRole(message), `checking role`);
    if (!hasRole(message)) return;
    if (processing)
      return await message.channel.send(
        `You cannot start a new recording while there is one processing.`
      );
    mp3Paths = [];
    console.log(message.content);
    finalArrWithIds = [];
    if (args[1] === "lock") {
      locked = true;
      await message.member.voice.channel.overwritePermissions([
        { id: message.member.guild.id, deny: `CONNECT` },
      ]);
    }
    let selectionEmbed = new Discord.MessageEmbed().setTitle(
      `Select audio type`
    );
    selectionEmbed.setDescription(
      `> 🇦 - *FLAC* \n > 🇧 - *AAC* \n > 🇨 - *OPUS* \n > 🇩 - *MP3*`
    );
    selectionEmbed.setColor(`#00FFFF`);
    selectionEmbed.setFooter(
      `If you fail to select any of the options within 30 seconds, MP3 will be used by default.`
    );
    selectionEmbed.setThumbnail(
      `https://media.discordapp.net/attachments/740001123041280050/757711840355680266/mouse-pointer.png?width=50&height=50`
    );
    const selectionMessage = await message.channel.send(selectionEmbed);
    selectionMessage.react(`🇦`);
    selectionMessage.react(`🇧`);
    selectionMessage.react(`🇨`);
    selectionMessage.react(`🇩`);
    let confirmEmbed = new Discord.MessageEmbed().setTitle(`Select audio type`);
    try {
      const collected = await selectionMessage.awaitReactions(
        (reaction, user) =>
          user.id == message.author.id &&
          (reaction.emoji.name === "🇦" ||
            reaction.emoji.name === "🇧" ||
            reaction.emoji.name === "🇩" ||
            reaction.emoji.name === "🇨"),
        { max: 1, time: 30000, errors: ["time"] }
      );
      if (collected.first().emoji.name === "🇦") {
        type = {
          codec: "flac",
          format: "flac",
          ext: "flac",
        };
        confirmEmbed.setDescription(`You selected \`\`FLAC\`\`.`);
        confirmEmbed.setColor(`#00FF00`);
      } else if (collected.first().emoji.name === "🇧") {
        type = {
          codec: "aac",
          format: "adts",
          ext: "aac",
        };

        confirmEmbed.setDescription(`You selected \`\`AAC\`\`.`);
        confirmEmbed.setColor(`#00FF00`);
      } else if (collected.first().emoji.name === "🇨") {
        type = {
          codec: "libopus",
          format: "opus",
          ext: "opus",
        };

        confirmEmbed.setDescription(`You selected \`\`OPUS\`\`.`);
        confirmEmbed.setColor(`#00FF00`);
      } else if (collected.first().emoji.name === "🇩") {
        type = {
          codec: "libmp3lame",
          format: "mp3",
          ext: "mp3",
        };
        confirmEmbed.setDescription(`You selected \`\`MP3\`\`.`);
        confirmEmbed.setColor(`#00FF00`);
      }
    } catch (err) {
      type = {
        codec: "libmp3lame",
        format: "mp3",
        ext: "mp3",
      };
      confirmEmbed.setDescription(`\`\`MP3\`\` was selected by default.`);
      confirmEmbed.setColor(`#00FF00`);
    }
    await selectionMessage.edit(confirmEmbed);
    function generateOutputFile(channelID, memberID) {
      const dir = `./recordings/${channelID}/${memberID}`;
      fs.ensureDirSync(dir);
      const fileName = `${dir}/${randomArr[0]}.${type.ext}`;
      return fs.createWriteStream(fileName);
    }
    let membersToScrape = Array.from(
      message.member.voice.channel.members.values()
    );
    membersToScrape.forEach((member) => {
      if (member.id !== message.client.user.id) {
        finalArrWithIds.push(member.id);
      }
    });
    console.log(finalArrWithIds, `FINAL ARRAY`);
    const randomNumber = Math.floor(Math.random() * 100);
    randomArr = [];
    randomArr.push(randomNumber);

    if (recording) {
      message.reply("bot is already recording");
      return;
    }
    if (message.member.voice.channel) {
      recording = true;
      const connection = await message.member.voice.channel.join();
      const dispatcher = connection.play("./fight.wav");
      connection.on("speaking", (user, speaking) => {
        if (speaking.has("SPEAKING")) {
          console.log(`listening`);
          currently_recording[user.id] = true;
        } else {
          currently_recording[user.id] = false;
        }
      });

      let members = Array.from(message.member.voice.channel.members.values());
      members.forEach((member) => {
        if (member.id != client.user.id) {
          let memberStream = connection.receiver.createStream(member, {
            mode: "pcm",
            end: "manual",
          });

          let outputFile = generateOutputFile(
            message.member.voice.channel.id,
            member.id
          );
          mp3Paths.push(outputFile.path);

          silence_stream = bufferToStream(new Uint8Array(0));
          generateSilentData(silence_stream, member.id).then((data) =>
            console.log(data)
          );
          let combinedStream = mergeStream(silence_stream, memberStream);

          ffmpeg(combinedStream)
            .inputOptions(["-f", "s16le", "-ar", "48k", "-ac", "2"])
            .on("error", (error) => {
              console.log(error);
            })
            .audioCodec(type.codec)
            .format(type.format)
            .pipe(outputFile);
        }
      });
    } else {
      message.reply("You need to join a voice channel first!");
    }
  }

  if (message.content === `${prefix}stop`) {
    if (!hasRole(message)) return;

    if (!locked)
      await message.member.voice.channel.overwritePermissions([
        { id: message.member.guild.id, allow: `CONNECT` },
      ]);

    let date = new Date();
    let dd = String(date.getDate()).padStart(2, "0");
    let mm = String(date.getMonth() + 1).padStart(2, "0");
    let yyyy = date.getFullYear();
    date = mm + "/" + dd + "/" + yyyy;

    let currentVoiceChannel = message.member.voice.channel;
    if (currentVoiceChannel) {
      recording = false;
      await currentVoiceChannel.leave();

      let mergedOutputFolder =
        "./recordings/" + message.member.voice.channel.id + `/${randomArr[0]}/`;
      fs.ensureDirSync(mergedOutputFolder);
      let file_name = `${randomArr[0]}` + `.${type.ext}`;
      let mergedOutputFile = mergedOutputFolder + file_name;

      let download_path =
        message.member.voice.channel.id + `/${randomArr[0]}/` + file_name;

      let mixedOutput = new ffmpeg();
      console.log(mp3Paths, `mp3pathshere`);
      mp3Paths.forEach((mp3Path) => {
        mixedOutput.addInput(mp3Path);
      });
      //mixedOutput.complexFilter('amix=inputs=2:duration=longest');
      mixedOutput.complexFilter(
        "amix=inputs=" + mp3Paths.length + ":duration=longest"
      );
      let processEmbed = new Discord.MessageEmbed().setTitle(
        `Audio Processing.`
      );
      processEmbed.addField(
        `Audio processing starting now..`,
        `Processing Audio`
      );
      processEmbed.setThumbnail(
        `https://media.discordapp.net/attachments/730811581046325348/748610998985818202/speaker.png`
      );
      processEmbed.setColor(`	#00FFFF`);
      const processEmbedMsg = await message.channel.send(processEmbed);
      async function saveMp3(mixedData, outputMixed) {
        return new Promise((resolve, reject) => {
          mixedData
            .on("error", reject)
            .on("progress", async (progress) => {
              processing = true;
              progressTarget = progress.targetSize;
              progressPercent = progress.percent;
              console.log(
                "Processing: " + progress.targetSize + " KB converted"
              );
            })
            .on("end", () => {
              console.log("Processing finished !");
              resolve();
            })
            .saveToFile(outputMixed);
        });
      }
      // mixedOutput.saveToFile(mergedOutputFile);
      await saveMp3(mixedOutput, mergedOutputFile);
      // We saved the recording, now copy the recording
      if (!fs.existsSync(`./public`)) {
        fs.mkdirSync(`./public`);
      }
      let sourceFile = `${__dirname}/recordings/${download_path}`;
      const guildName = message.guild.id;
      const serveExist = `/public/${guildName}`;
      if (!fs.existsSync(`.${serveExist}`)) {
        fs.mkdirSync(`.${serveExist}`);
      }
      let destionationFile = `${__dirname}${serveExist}/${file_name}`;

      let errorThrown = false;
      try {
        fs.copySync(sourceFile, destionationFile);
      } catch (err) {
        errorThrown = true;
        await message.channel.send(`Error: ${err.message}`);
      }
      const usersWithTag = finalArrWithIds.map((user) => `\n <@${user}>`);
      let timeSpent = await getAudioDurationInSeconds(
        `public/${guildName}/${file_name}`
      );
      let timesSpentRound = Math.floor(timeSpent);
      let finalTimeSpent = timesSpentRound / 60;
      let finalTimeForReal = Math.floor(finalTimeSpent);

      async function successSave(embed, channel) {
        embed = new Discord.MessageEmbed().setDescription(
          `Title successfully saved. Use \`\`$myrecordings\`\` to view your recordings.`
        );
        embed.setColor(`#32CD32`);
        await channel.send(embed);
      }

      async function sendMsgOnVoiceEnd(
        embed,
        user,
        message,
        date,
        finalTimeForReal,
        isPersonal,
        theDownloadLink,
        greenEmbed,
        channel
      ) {
        embed = new Discord.MessageEmbed().setTitle(
          `I will be honest, that recording session was sick !`
        );
        if (isPersonal) {
          embed.setDescription(
            `Please reply to this message with a title no more than 25 characters. You have 5 minutes. \n \`\`Date\`\`: ${date} \n \`\`Time\`\`: ${finalTimeForReal} \n \`\`Download link\`\`: [Click here](${theDownloadLink})`
          );
        }
        if (!isPersonal) {
          embed.setDescription(
            `Please reply to this message with a title no more than 25 characters. You have 5 minutes. \n \`\`Date\`\`: ${date} \n \`\`Time\`\`: ${finalTimeForReal} \n \`\`Voices\`\`: ${usersWithTag} \n \`\`Download link\`\`: [Click here](${theDownloadLink})`
          );
        }

        embed.setThumbnail(
          `https://media.discordapp.net/attachments/748005515992498297/756094502535692338/title.png?width=100&height=100`
        );
        embed.setFooter(
          `🔺 If you fail to reply with a title, it will be set to ${date} by default`
        );
        embed.setColor(`#00FFFF`);
        let embedMsg = await user.send(embed);
        const filter = (m) =>
          m.author.id === user.id || m.author.id === message.author.id;
        const embedCollector = embedMsg.channel.createMessageCollector(filter, {
          time: 300000,
        });
        embedCollector.on("collect", async (m) => {
          collectedTitle = m.content;
          await successSave(greenEmbed, channel);
          embedCollector.stop(`had to`);
        });
        return collectedTitle;
      }

      if (!errorThrown) {
        processing = false;
        //--------------------- server recording save START

        let generalEmbed;
        let generalEmbedTitle;
        const generalTitle = await sendMsgOnVoiceEnd(
          generalEmbed,
          message.channel,
          message,
          date,
          finalTimeForReal,
          false,
          `${fqdn}/public/${guildName}/${file_name}`,
          generalEmbedTitle,
          message.channel
        );
        const newGeneralRecordClassObject = {
          generalLink: `${fqdn}/public/${guildName}/${file_name}`,
          date: date,
          title: generalTitle,
          voice: usersWithTag,
          time: finalTimeForReal,
        };
        const serverRecord = (await ServerRecords.exists({ userid: `server` }))
          ? await ServerRecords.findOne({ userid: `server` })
          : new ServerRecords();
        serverRecord.userid = `server`;
        serverRecord.content.push(newGeneralRecordClassObject);
        serverRecord
          .save()
          .then(async () => {})
          .then(() => console.log(`its ok <3`))
          .catch((err) => console.log(err, `AYE`));

        //--------------------- server recording save STOP
      }

      //--------------------- personal recording section START

      for (let member of finalArrWithIds) {
        console.log(`WE ARE INSIDE`);
        let personal_download_path =
          message.member.voice.channel.id + `/${member}/` + file_name;
        let sourceFilePersonal = `${__dirname}/recordings/${personal_download_path}`;
        let destionationFilePersonal = `${__dirname}${serveExist}/${member}/${file_name}`;
        await fs.copySync(sourceFilePersonal, destionationFilePersonal);
        const user = client.users.cache.get(member);
        if (user.bot) continue;
        console.log(user, `USER IS HERE`);
        try {
          ffmpeg.setFfmpegPath(ffmpegInstaller.path);

          ffmpeg(`public/${guildName}/${member}/${file_name}`)
            .audioFilters(
              "silenceremove=stop_periods=-1:stop_duration=1:stop_threshold=-90dB"
            )
            .output(`public/${guildName}/${member}/personal-${file_name}`)
            .on(`end`, function () {
              console.log(`DONE`);
            })
            .on(`error`, function (error) {
              console.log(`An error occured` + error.message);
            })
            .run();
        } catch (error) {
          console.log(error);
        }

        // ----------------- SAVING PERSONAL RECORDING TO DATABASE START
        let personalEmbed;

        let timeSpentPersonal = await getAudioDurationInSeconds(
          `public/${guildName}/${file_name}`
        );
        let timesSpentRoundPersonal = Math.floor(timeSpentPersonal);
        let finalTimeSpentPersonal = timesSpentRoundPersonal / 60;
        let finalTimeForRealPersonal = Math.floor(finalTimeSpentPersonal);
        let personalTitleEmbed;
        const personalRecordTitle = await sendMsgOnVoiceEnd(
          personalEmbed,
          user,
          message,
          date,
          finalTimeForRealPersonal,
          true,
          `${fqdn}/public/${guildName}/${member}/personal-${file_name}`,
          personalTitleEmbed,
          user
        );
        const newPersonalRecordClassObject = {
          generalLink: `${fqdn}/public/${guildName}/${file_name}`,
          personalLink: `${fqdn}/public/${guildName}/${member}/personal-${file_name}`,
          date: date,
          title: personalRecordTitle,
          time: finalTimeForRealPersonal,
        };
        const userRecord = (await UserRecords.exists({ userid: member }))
          ? await UserRecords.findOne({ userid: member })
          : new UserRecords();
        userRecord.userid = member;
        userRecord.content.push(newPersonalRecordClassObject);
        userRecord
          .save()
          .then(() => console.log(`personal one`))
          .catch((err) => console.log(err));
      }
      //
    } else {
      message.reply("You need to join a voice channel first!");
    }
  }

  if (message.content === `${prefix}recordstatus`) {
    console.log(processing);
    if (!processing)
      return await message.channel.send(`There is no recording in process.`);
    const bar = progressBar(progressPercent, 100, 10);
    let processEmbedEdit = new Discord.MessageEmbed().setTitle(
      `Audio Processing.`
    );
    processEmbedEdit.addField(
      `Processing: ${progressTarget} KB converted`,
      bar
    );
    processEmbedEdit.setThumbnail(
      `https://media.discordapp.net/attachments/730811581046325348/748610998985818202/speaker.png`
    );
    processEmbedEdit.setColor(`#00FFFF`);
    await message.channel.send(processEmbedEdit);
  }

  if (message.content.indexOf(prefix) !== 0) return;

  const command = args.shift().toLowerCase();

  const cmd = client.commands.get(command);

  if (!cmd) return;

  cmd.run(client, message, args);
});

let autoReactorTotalCount = 0;
let userConfirmationEmbed = new Discord.MessageEmbed();

let roleObject = {
  oneRoleArray: ["@everyone"],
  twoRoleArray: ["Crowd", "Prospect", "Fan"],
  threeRoleArray: ["Enthusiast", "Challenge", "Regular"],
  fourRoleArray: ["Active", "Pro", "Vet", "Titan", "Legend"],
  fiveRoleArray: ["Supporter"],
};
let guildMember;
let roleName;
let fetchedGuild;

let votesToAdd = async (user) => {
  fetchedGuild = await client.guilds.fetch("723940968843444264");
  guildMember = await fetchedGuild.members.fetch(user);
  roleName = guildMember.roles.highest.name;

  if (roleObject.oneRoleArray.includes(roleName)) {
    return 1;
  } else if (roleObject.twoRoleArray.includes(roleName)) {
    return 2;
  } else if (roleObject.threeRoleArray.includes(roleName)) {
    return 3;
  } else if (roleObject.fourRoleArray.includes(roleName)) {
    return 4;
  } else if (roleObject.fiveRoleArray.includes(roleName)) {
    return 5;
  } else {
    return 1;
  }
};
let checkAccess = async (user, theReactor) => {
  if (theReactor.pollRole === "oneRoleArray") {
    return true;
  }
  fetchedGuild = await client.guilds.fetch("723940968843444264");
  guildMember = await fetchedGuild.members.fetch(user);
  roleName = guildMember.roles.highest.name;
  console.log(theReactor.pollRole, `poll role.`);
  if (roleObject[theReactor.pollRole].includes(roleName)) {
    return true;
  } else {
    return false;
  }
};

const autoReactorEndLog = (mainString, cypherStarsString) => {
  statReactionData = [];
  for (let data of selectedProfile.emojiData) {
    statReactionData.push(
      `\n \`\`Emoji\`\` : ${data.emojiName} \n \`\`Votes\`\` : ${data.count} \n`
    );
  }
  statReactionData.push(cypherStarsString);
  statsEmbed = new Discord.MessageEmbed().setTitle("Stats Report");
  ref =
    "http://discordapp.com/channels/" +
    `723940968843444264` +
    "/" +
    theReactor.reactorSettings.channel +
    "/" +
    selectedProfile.id;
  statReactionData.push(`\n [click here to view the message](${ref})`);
  mainString += statReactionData;
  statsEmbed.addField(`Report : `, mainString);
  // string example :  `Reactor id: \`\`${theReactor.id}\`\` \n Stats resport - Triggered at ${theReactor.statsReactionNumber} Reactions`,
  // ` \n ${statReactionData}`;
  statsEmbed.setColor(`#9400D3`);
  statsEmbed.setThumbnail(
    `https://cdn.discordapp.com/attachments/728671530459856896/729851605104590878/chart.png`
  );
  client.channels.fetch("730608533112094781").then((channel) => {
    return channel.send(statsEmbed);
  });
};
client.on("messageReactionAdd", async (reaction, user) => {
  let foundElementVotes;
  let totalVotes;
  let numberOfVotes = 0;
  let hasUserVoted;
  let fetchedChannel;
  let fetchedMessage;
  let foundUser;
  let statsEmbed;
  let statReactionData = [];
  let ref;
  let newPerson;
  let mainString = "";
  let cypherStarsString = "";
  let totalGems = "";
  foundReactor = await Autor.find();
  console.log(`captured`);
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  if (user.bot) return;

  for (theReactor of foundReactor) {
    if (!theReactor.isRunning) continue;
    if (!theReactor.isPoll) {
      console.log("fetchedMessage");
      if (reaction.message.channel.id === theReactor.reactorSettings.channel) {
        selectedProfile = await ReactorProfile.findOne({
          messageid: reaction.message.id,
        }).catch((err) => {
          console.log(err);
        });
        if (!selectedProfile.stillRunning) return;

        newPerson = await PersonalProfile.findOne({
          userid: reaction.message.author.id,
        }).catch((err) => {
          console.log(err);
        });

        console.log(selectedProfile, `selectedprofile here poooooo`);
        foundEmojiData = selectedProfile.emojiData.find(
          (item) => item.emojiName === reaction.emoji.name
        );
        personEmojiData = newPerson.emojiData.find(
          (item) => item.emojiName === reaction.emoji.name
        );
        console.log(personEmojiData, `person emoji data`);
        if (foundEmojiData) {
          foundEmojiData.count += await votesToAdd(user);
          personEmojiData.count += await votesToAdd(user);
          selectedProfile.totalVotes += 1;
          // 1 gem = 5 count
          newPerson.gems = "💎".repeat(Math.floor(personEmojiData.count / 5));
          totalGems = "💎".repeat(Math.floor(foundEmojiData.count / 5));
        }
        console.log(newPerson, `new person`);
        for (let dataItem of selectedProfile.emojiData) {
          autoReactorTotalCount += dataItem.count;
        }
        console.log(`hey man`);
        newPerson.markModified(`emojiData`);
        await newPerson.save().catch((err) => console.log(err));
        selectedProfile.markModified(`emojiData`);
        await selectedProfile.save().catch((err) => console.log(err));
        if (selectedProfile.totalVotes === theReactor.statsReactionNumber) {
          mainString = `Reactor id: \`\`${theReactor.id}\`\` \n Stats resport - Triggered at ${theReactor.statsReactionNumber} Reactions \n ${statReactionData} \n Gems : \n ${totalGems}`;
          cypherStarsString = "";
          autoReactorEndLog(mainString, cypherStarsString);
        }
        if (
          theReactor.endReactionEmoji === reaction.emoji.name ||
          theReactor.endReactionNumber === selectedProfile.totalVotes
        ) {
          console.log("triggered.");
          let dueToString = `reaction of ${theReactor.endReactionEmoji}`;
          if (theReactor.endReactionNumber === selectedProfile.totalVotes) {
            dueToString = `reaching the set threshold of ${theReactor.endReactionNumber} emojis.`;
          }
          mainString = `Reactor id: \`\`${theReactor.id}\`\` \n Stats resport - Triggered due to ${dueToString} \n \n \`\`Gems\`\` : ${totalGems} \n`;
          cypherStarsString = "";
          autoReactorEndLog(mainString, cypherStarsString);
          selectedProfile.stillRunning = false;
          await selectedProfile.save();
          return;
        }
      }
      continue;
    }
    fetchedChannel = await client.channels
      .fetch(theReactor.reactorSettings.channel)
      .catch((err) => {
        console.log(err);
      });

    fetchedMessage = await fetchedChannel.messages
      .fetch(theReactor.reactorSettings.messageId)
      .catch((err) => {
        console.log(err);
      });
    if (!(await checkAccess(user, theReactor))) {
      user.send(`🔒 You don't have access to vote on this poll.`);
      return fetchedMessage.reactions.cache
        .find((r) => r.emoji.name === reaction.emoji.name)
        .users.remove(user.id);
    }

    if (reaction.message.id === theReactor.reactorSettings.messageId) {
      console.log("we got the reaction");

      console.log(
        reaction.message.guild.members.cache
          .get(user.id)
          .roles.cache.has("729502305464090697"),
        "ROLE HERE"
      ); //checking role.

      if (theReactor.grandTotal.includes(user.id)) {
        console.log(`return check`);
        if (theReactor.anon && !theReactor.reactorSettings.multiple) {
          console.log(`is it in check`);
          let foundRemovedElement = theReactor.optionsText.find((item) =>
            item.voterid.includes(user.id)
          );
          foundRemovedElement.voterid = foundRemovedElement.voterid.filter(
            (item) => item !== user.id
          );

          foundUser = client.users.cache.find((item) => item.id === user.id);
          foundRemovedElement.voterNames = foundRemovedElement.voterNames.filter(
            (item) => item !== foundUser.username
          );
          foundRemovedElement.votes -= await votesToAdd(user);
          theReactor.totalVotes -= 1;
          theReactor.grandTotal = theReactor.grandTotal.filter(
            (item) => item !== user.id
          );
          if (
            theReactor.grandTotal.length === 0 ||
            foundRemovedElement.votes === 0
          ) {
            foundRemovedElement.percent = 0;
          } else {
            foundRemovedElement.percent =
              (foundRemovedElement.votes * 100) / theReactor.grandTotal.length;
          }
        } else if (!theReactor.reactorSettings.multiple) {
          return fetchedMessage.reactions.cache
            .find((r) => r.emoji.name === reaction.emoji.name)
            .users.remove(user.id);
        }
      }

      totalVotes = () => {
        numberOfVotes = 0;
        // weights = 0;
        if (theReactor.reactorSettings.isPoll)
          for (let elements of theReactor.optionsText) {
            numberOfVotes += elements.votes;
            // weights += elements.weights;
          }
        return numberOfVotes;
      };
      if (theReactor.reactorSettings.isPoll) {
        foundElementVotes = theReactor.optionsText.find(
          (item) => item.emoji === reaction.emoji.name
        );
        console.log(`got em`, foundElementVotes);

        // if (
        //   reaction.message.guild.members.cache
        //     .get(user.id)
        //     .roles.cache.has("729502305464090697")
        // ) {
        //   foundElementVotes.weights += 2;
        // } else {
        if (
          foundElementVotes.voterid.includes(user.id) &&
          theReactor.anon &&
          theReactor.reactorSettings.multiple
        ) {
          fetchedMessage.reactions.cache
            .find((r) => r.emoji.name === reaction.emoji.name)
            .users.remove(user.id);
          return client.users.cache
            .find((item) => item.id === user.id)
            .send(`\`\`You can only vote once on that option !\`\``);
        }
        foundElementVotes.votes += await votesToAdd(user);
        theReactor.totalVotes += 1;
        // }

        foundElementVotes.voterid.push(user.id);
        foundElementVotes.voterid.forEach((value, index) => {
          foundUser = client.users.cache.find((user) => user.id === value);
          foundElementVotes.voterNames.push(foundUser.username);
        });
        for (let eachElement of theReactor.optionsText) {
          eachElement.percent = (eachElement.votes * 100) / totalVotes();
          console.log(eachElement.weights, `weight here`);
          console.log(totalVotes(), `votes here`);
        }
        if (
          !theReactor.grandTotal.includes(user.id) ||
          theReactor.reactorSettings.multiple
        ) {
          theReactor.grandTotal.push(user.id);
        }
        console.log(theReactor.reactorSettings.channel, `channel id`);

        let embedObject = fetchedMessage.embeds[0];
        if (theReactor.anon) {
          fetchedMessage.reactions.cache
            .find((r) => r.emoji.name === reaction.emoji.name)
            .users.remove(user.id);
        }
        for (i = 0; i < theReactor.optionsText.length; i++) {
          delete embedObject.fields[i];
        }
        k = 0;
        let optionString = ``;
        let letters = [`🇦`, `🇧`, `🇨`, `🇩`, `🇪`, `🇫`, `🇬`, `🇭`, `🇮`];
        let editedProgressBar;
        for (let foo of theReactor.optionsText) {
          editedProgressBar = theReactor.anon
            ? ""
            : progressBar(foo.percent, 100, 10);
          optionString += `\n ${letters[k++]} **${
            foo.text
          }** \n ${editedProgressBar}`;
        }
        embedObject.setDescription(
          optionString + `\n 📩 Total Votes : ${theReactor.totalVotes}`
        );
        fetchedMessage.edit(embedObject);

        if (theReactor.grandTotal.length === theReactor.statsReactionNumber) {
          statReactionData = [];
          for (data of theReactor.optionsText) {
            statReactionData.push(`
            \n \`\`Emoji\`\` : ${data.emoji} \n \`\`Votes\`\` : ${data.votes} \n \`\`Voter Names\`\` : ${data.voterNames} \n \`\`Percent\`\` : ${data.percent} \n ----
            `);
            statsEmbed = new Discord.MessageEmbed().setTitle("Stats Report");
          }
          ref =
            "http://discordapp.com/channels/" +
            `723940968843444264` +
            "/" +
            theReactor.reactorSettings.channel +
            "/" +
            fetchedMessage.id;
          statReactionData.push(`\n [click here to view the message](${ref})`);
          statsEmbed.addField(
            `Reactor id: \`\`${theReactor.id}\`\` \n Stats resport - Triggered at ${theReactor.statsReactionNumber} Reactions`,
            ` \n ${statReactionData}`
          );
          statsEmbed.setColor(`#9400D3`);
          statsEmbed.setThumbnail(
            `https://cdn.discordapp.com/attachments/728671530459856896/729851605104590878/chart.png`
          );
          client.channels.fetch("730608533112094781").then((channel) => {
            channel.send(statsEmbed);
          });
        }
      }
      console.log(`hello man total votes`);
      console.log(autoReactorTotalCount, theReactor.statsReactionNumber);

      theReactor.markModified(`optionsText`);
      theReactor
        .save()
        .then(() => console.log(`save completed !`))
        .catch((err) => console.log(err));
    }
  }
});

client.on("messageReactionRemove", async (reaction, user) => {
  foundReactor = await Autor.find();
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  if (user.bot) return;
  for (theReactor of foundReactor) {
    if (!theReactor.isRunning) continue;
    if (!theReactor.isPoll) {
      if (reaction.message.channel.id === theReactor.reactorSettings.channel) {
        selectedProfile = await ReactorProfile.findOne({
          messageid: reaction.message.id,
        }).catch((err) => {
          console.log(err);
        });
        newPerson = await PersonalProfile.findOne({
          userid: reaction.message.author.id,
        }).catch((err) => {
          console.log(err);
        });

        if (!selectedProfile.stillRunning) return;
        console.log(selectedProfile, `selectedprofile here`);
        foundEmojiData = selectedProfile.emojiData.find(
          (item) => item.emojiName === reaction.emoji.name
        );
        personEmojiData = newPerson.emojiData.find(
          (item) => item.emojiName === reaction.emoji.name
        );
        if (foundEmojiData) {
          foundEmojiData.count -= await votesToAdd(user);
          personEmojiData.count -= await votesToAdd(user);
          selectedProfile.totalVotes -= 1;
        }

        selectedProfile.markModified(`emojiData`);
        selectedProfile
          .save()
          .then((doc) => console.log(`saved`, doc))
          .catch((err) => console.log(err));
      }
    }
    if (reaction.message.id === theReactor.reactorSettings.messageId) {
      fetchedChannel = await client.channels
        .fetch(theReactor.reactorSettings.channel)
        .catch((err) => {
          console.log(err);
        });

      fetchedMessage = await fetchedChannel.messages
        .fetch(theReactor.reactorSettings.messageId)
        .catch((err) => {
          console.log(err);
        });
      foundElementVotes = theReactor.optionsText.find(
        (item) => item.emoji === reaction.emoji.name
      );
      if (theReactor.anon) return;
      if (!foundElementVotes.voterid.includes(user.id)) return;
      // if (
      //   reaction.message.guild.members.cache
      //     .get(user.id)
      //     .roles.cache.has("729502305464090697")
      // ) {
      //   foundElementVotes.weights -= 2;
      // } else {
      foundElementVotes.votes -= await votesToAdd(user);
      theReactor.totalVotes -= 1;
      // }sole.log(foundElementVotes.voterid, `voter id here !`);
      foundElementVotes.voterid.forEach((value, index) => {
        foundUser = client.users.cache.find((user) => user.id === value);
        foundElementVotes.voterNames = foundElementVotes.voterNames.filter(
          (name) => name !== foundUser.username
        );
      });

      foundElementVotes.voterid = foundElementVotes.voterid.filter(
        (voter) => voter !== user.id
      );
      console.log(user.id);
      console.log(foundElementVotes.voterid);
      totalVotesTwo = () => {
        numberOfVotes = 0;
        // weights = 0;
        for (let elements of theReactor.optionsText) {
          numberOfVotes += elements.votes;
          // weights += elements.weights;
        }
        return numberOfVotes;
      };

      console.log(totalVotesTwo(), `total votes here`);

      for (let eachElement of theReactor.optionsText) {
        if (totalVotesTwo() === 0) {
          eachElement.percent = 0;
        } else {
          eachElement.percent = (eachElement.votes * 100) / totalVotesTwo();
        }
      }
      if (theReactor.reactorSettings.multiple) {
        let userToRemove = (element) => element === user.id;
        let userIndex = theReactor.grandTotal.findIndex(userToRemove);
        theReactor.grandTotal.splice(userIndex, 1);
      } else {
        theReactor.grandTotal = theReactor.grandTotal.filter(
          (total) => total !== user.id
        );
      }

      let embedObject = fetchedMessage.embeds[0];
      if (!theReactor.anon) {
        for (i = 0; i < theReactor.optionsText.length; i++) {
          delete embedObject.fields[i];
        }
        k = 0;
        let optionString = ``;
        let letters = [`🇦`, `🇧`, `🇨`, `🇩`, `🇪`, `🇫`, `🇬`, `🇭`, `🇮`];

        for (let foo of theReactor.optionsText) {
          optionString += `\n ${letters[k++]} **${foo.text}** \n ${progressBar(
            foo.percent,
            100,
            10
          )}`;
        }
        embedObject.setDescription(
          optionString + `\n 📩 Total Votes : ${theReactor.totalVotes}`
        );
        fetchedMessage.edit(embedObject);
      }
      theReactor.markModified(`optionsText`);
      theReactor.save().catch((err) => console.log(err));
    }
  }
});

fs.readdir("./commands/", async (err, files) => {
  if (err) return console.error;
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let cmdName = file.split(".")[0];

    // Register extra Listeners

    client.commands.set(cmdName, props);
  });
});

async function main() {
  program.option("-debug");
  program.option("-prod");

  program.parse(process.argv);

  console.log(program.opts());
  if (program.Debug != undefined) {
    debug = !debug;
  }
  if (program.Prod != undefined) {
    runProd = !runProd;
  }
  if (runProd) {
    client.login(process.env.PROD).catch((e) => {
      console.log("ERROR");
      console.log(e);
    });
  } else {
    client.login(process.env.TEST).catch((e) => {
      console.log("ERROR");
      console.log(e);
    });
  }
}
main();

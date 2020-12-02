const Discord = require("discord.js");
const UserRecords = require("../models/userrecords.js")
const mongoose = require("mongoose");
const MongoClient = require('mongodb').MongoClient;
const Pagination = require('discord-paginationembed');

const uri = "mongodb+srv://admin:admin@cluster0.3iec5.gcp.mongodb.net/AR?retryWrites=true&w=majority";



exports.run = async (client, message, args) => {
const foundUser = await UserRecords.findOne({userid: message.author.id});

let recordingsArray = []
foundUser.content.forEach((doc, i) => {
recordingsArray.push(`\`${i+1}\` 📌 ${doc.note} \n > \`\`Date\`\` : ${doc.date} \n > \`\`Peronal\`\` : [Click here to download it](${doc.personalLink}) \n > \`\`General\`\` : [Click here to download it](${doc.generalLink}) \n > \`\`Time\`\` : ${doc.time} \n - \n`)
})
let theMsgThatWasDmed = await message.author
const FieldsEmbed = new Pagination.FieldsEmbed()
// A must: an array to paginate, can be an array of any type
.setArray(recordingsArray)
// Set users who can only interact with the instance. Default: `[]` (everyone can interact).
// If there is only 1 user, you may omit the Array literal.
.setAuthorizedUsers([message.author.id])
 // A must: sets the channel where to send the embed
.setChannel(theMsgThatWasDmed)
// Elements to show per page. Default: 10 elements per page
.setElementsPerPage(3)
 // Have a page indicator (shown on message content). Default: false
.setPageIndicator(false)
 // Format based on the array, in this case we're formatting the page based on each object's `word` property
.formatField('\u200b', el => el);

FieldsEmbed.embed
  .setColor(0xFF00AE)

FieldsEmbed.build();


const recordsEmbed = new Discord.MessageEmbed().setTitle(`🗒️ Add notes`)
recordsEmbed.addField(`You can add notes to any of these recordings`, `Reply with the recording number to add a note. You have 30 seconds.`)
recordsEmbed.setThumbnail(`https://i.imgur.com/EvIGx9d.png`)
recordsEmbed.setColor(`#FFC0CB`)
const recordsMessage = await message.author.send(recordsEmbed)

    const msgFilter = m => m.author.id === message.author.id;
    const collected = await recordsMessage.channel.awaitMessages(msgFilter, {
        max: 1,
        time: 20000
      })
      let theNumber = collected.first().content
      // if(Number.isInteger(theNumber) === false){
      //   message.author.send(`**You can only reply with a recording number. Please try again later.**`)
      //   return
      // }
      console.log(theNumber); 
      let theInt = parseInt(theNumber)
      if(Number.isInteger(theInt) === false){
        message.channel.send(`**You can only reply with a recording number. Please try again later.**`)
        return
      } 
      if(foundUser.content[theInt-1].note === undefined){
        message.author.send(`❌ Opps something went wrong. Note not saved. please try again later !`)
        return
      }
      let selectedRecord = foundUser.content[theInt-1]
      console.log(selectedRecord, `doc`);
      const noteReader = new Discord.MessageEmbed().setTitle(`Reply with the note you would want to add or say \`cancel\` to exit out or \`delete\` to delete this recording.`)
      
      noteReader.addField(`Your recodings`, `**Title** : ${selectedRecord.note} \n **Date** : ${selectedRecord.date} \n **Personal** : [Click here to download it](${selectedRecord.personalLink}) \n **General** : [Click here to download it](${selectedRecord.generalLink}) \n **Time spent by you** : ${selectedRecord.time} `)
      noteReader.setThumbnail(`https://i.imgur.com/4xD6FOm.png`)
      noteReader.setColor(`#FFC0CB`)
      const noteCollection = await message.author.send(noteReader)
      const collectedNote = await noteCollection.channel.awaitMessages(msgFilter, {
        max: 1,
        time: 30000
      })
      let theNote = collectedNote.first().content
      
      if(theNote === `cancel`){
        message.author.send(`Session Cancelled.`)
        return
      }
      else if(theNote === `delete`){
        foundUser.content.splice(theInt-1, 1)
        foundUser.save().then( async () => {
          await message.author.send(`🇽 Recording deleted successfully.`)
        })
        return
      }
      console.log(theNote, `note here`);
      addNoteToThisUser = await UserRecords.findOne({userid: message.author.id})
      
      addNoteToThisUser.content[theNumber-1].note = theNote
      addNoteToThisUser.markModified(`content`)
      addNoteToThisUser.save().then(() => {
        let noteStatus = new Discord.MessageEmbed().setTitle(`Note`)
        noteStatus.addField(`Saved`, `Title succesfully saved !`)
        noteStatus.setColor(`#32CD32`)
        noteStatus.setThumbnail(`https://i.imgur.com/ACh4QGC.png`)
        message.author.send(noteStatus)
      }).catch(err => {
        message.author.send(`❌ Opps something went wrong. Note not saved. please try again later !`)
        console.log(err)})


//       console.log(addNoteToThisUser.content[theNumber], `here is the note`);


 



}

exports.help = {
    name: "myrecordings"
  };
  
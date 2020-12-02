const Discord = require("discord.js");
const TextRecords = require(`../models/textrecords.js`)
const textRecordMessageAfterConfirmation = require("../functions/textRecordMessageAfterConfirmation.js")
const Pagination = require('discord-paginationembed');
exports.run = async (client, message, args) => {

if(message.mentions.members.first()){
  searchId = message.mentions.members.first().id
  selector = 1
}
else {
  searchId = message.author.id
  selector = 0
}
console.log(selector, `selector`)
console.log(searchId, `search id`)
  const foundRecords = await TextRecords.findOne({userid: searchId})
  if(foundRecords === null) return message.channel.send(`An error occured, please try again later.`)
let foundRecordsArray = []
let finalContent
function setContent(selector, foundRecords){
  if(args[selector] === "title"){
    let args1
    let args2
    if(selector === 1){ 
      args.shift()
      args.shift()
      args2 = args.join(" ")
    }
    else {
      args1 = args.slice(1, 100)
      args2 = args1.join(" ")
    }
    finalContent = foundRecords.content.filter(element => element.title.includes(args2))
    console.log(finalContent, `final herre`)
  }
  else if(args[selector] === "day"){
    if(selector === 1){
      args.shift()
    }
    finalContent = foundRecords.content.filter(element => {
      
      let finalDay = element.date.slice(8, 10)
  
    
      if(finalDay.includes(args[1])) return true
    })
  }
  else if(args[selector] === "month"){
    if(selector === 1){
      args.shift()
      console.log(args, `month`)
    }
    finalContent = foundRecords.content.filter(element => {
      console.log(args[1], `args 1`)
      let month = element.date.slice(5, 10).slice(0,2)
      console.log(month)
      
      if(month.includes(args[1])) return true
    })
  }
  else{
    finalContent = foundRecords.content
  }
}
setContent(selector, foundRecords)
console.log(finalContent, `content`)
if(finalContent.length === 0){
  return message.channel.send(`Something went wrong, please try again later !`)
}
let i = 1
for(let record of finalContent){
    splicedRecordContent = record.text.slice(0, 20)
    console.log(splicedRecordContent)
    foundRecordsArray.push(`***${i++}***. 📌 ${record.title} \n > \`\`Date\`\` : ${record.date} \n > \`\`Channel\`\` : ${record.channel} \n > \`\`Content\`\` : ${splicedRecordContent}..[read more](${record.link}) \n - \n`)
}
const FieldsEmbedTagged = new Pagination.FieldsEmbed()
  // A must: an array to paginate, can be an array of any type
  .setArray(foundRecordsArray)
  // Set users who can only interact with the instance. Default: `[]` (everyone can interact).
  // If there is only 1 user, you may omit the Array literal.
  .setAuthorizedUsers([message.author.id])
   // A must: sets the channel where to send the embed
  .setChannel(message.author)
  // Elements to show per page. Default: 10 elements per page
  .setElementsPerPage(3)
   // Have a page indicator (shown on message content). Default: false
  .setPageIndicator(false)
   // Format based on the array, in this case we're formatting the page based on each object's `word` property
  .formatField('\u200b', el => el);
  
  FieldsEmbedTagged.embed
    .setTitle(`📒 - __Text records__`)
    .setColor(0xFF00AE)
    .setThumbnail(`https://media.discordapp.net/attachments/748005515992498297/756198492468281404/edit.png`)
    .setFooter(`Reply with the text record number to view the full verse.`)
    
    FieldsEmbedTagged.build();
    
    let textRecordMessage = new Discord.MessageEmbed().setTitle(`   `)
    textRecordMessage.setDescription(`Reply with the record number to view full verse.`)
    textRecordMessage.setColor(`#FF00AE`)
    const textRecordNumber = await message.author.send(textRecordMessage)
    msgFilter = (m) => m.author.id === message.author.id
    let textRecordNumberCollector = await textRecordNumber.channel.awaitMessages(msgFilter, {
      max: 1,
      time: 300000
    })
    let collectedNum = textRecordNumberCollector.first().content
    textRecordObject = foundRecords.content[collectedNum-1]
    textRecordMessageAfterConfirmation(message, textRecordObject)
}

exports.help = {
    name: "text-recording",
  };
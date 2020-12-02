// This function is used to send a message embed that contains the recorded text Object.
// It shows the whole message on reaction with the note.

const Discord = require("discord.js");
const textRecordMessageAfterConfirmation = async function(message, textRecordObject){
    let textRecordMessage = new Discord.MessageEmbed().setTitle(`Here is your recorded text.`)
    console.log(textRecordObject)
    let smallPart = textRecordObject.text.slice(0, 40)
    let contentString = `\`\`Channel\`\` : ${textRecordObject.channel} \n > \`\`Content\`\` : ${smallPart} [..read more](${textRecordObject.link})`
    function textRecordMsgFunction(textRecordMessage ,contentString){
        textRecordMessage.setColor(`#00FFFF`)
        textRecordMessage.setThumbnail(`https://cdn.discordapp.com/attachments/748005515992498297/756111184226418738/pen.jpg?width=50&height=50`)
        textRecordMessage.setFooter(`React with 🗒️ to read the whole verse.`)
        textRecordMessage.addField(`📌 ${textRecordObject.title}`, ` > \`\`Date\`\` : ${textRecordObject.date} \n > ${contentString}`)
        return textRecordMessage
    }
    const reviewText = await message.author.send(textRecordMsgFunction(textRecordMessage,contentString))

    await reviewText.react(`🗒️`)
    let filter = (reaction) => {
        return ['🗒️'].includes(reaction.emoji.name)
    };
    let reviewReacts = await reviewText.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
    
    if(reviewReacts.first().emoji.name === `🗒️`){
        let editedTextRecordMessage = new Discord.MessageEmbed().setTitle(`Here is your recorded text.`)
        contentString = `\`\`Channel\`\` : ${textRecordObject.channel} \n > \`\`Content\`\` : \n ${textRecordObject.text}`
        await reviewText.edit(textRecordMsgFunction(editedTextRecordMessage,contentString))
    }
 }

 module.exports = textRecordMessageAfterConfirmation
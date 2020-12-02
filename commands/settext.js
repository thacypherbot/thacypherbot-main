const Discord = require("discord.js");
const SetText = require("../models/settext.js")
exports.run = async (client, message, args) => {
let guildId = message.guild.id
let channel = (message.mentions.channels.first()) ? message.mentions.channels.first().id : ``
let check = await SetText.exists({guildid: guildId})
let foundGuild = (check) ? await SetText.findOne({guildid: guildId}) : new SetText()

async function setEmbed(embed ,description, foundGuild){
    embed.setDescription(description)
    const channelList = foundGuild.channels.map((channel) => {
        return `> <#${channel}> \n`
    })
    embed.setColor(`#800080`)
    embed.addField(`Channels :`, channelList) 
    await message.channel.send(embed)
}
if(args[0] === `add`){
    function setChannel(foundGuild){
        foundGuild.guildid = guildId
        foundGuild.channels.push(channel)
        foundGuild.save()
        .then(async () => {
            let confirmation = new Discord.MessageEmbed().setTitle(`📀 Channels recording texts.`)
            let description = `✅ <#${channel}> has been set to record texts.`
            await setEmbed(confirmation, description,foundGuild)
         })
        .catch((err) => {
            console.log(err.message)
            message.channel.send(`Something went wrong. Please try again.`)
        })
    }
    setChannel(foundGuild)
}
else if(args[0] === `remove`){
foundGuild.channels = foundGuild.channels.filter((theChannel) => (theChannel === channel) ? false : true )
foundGuild.save()
.then(() => {
    message.channel.send(`Channel successfully removed.`)
})
.catch((err) => console.log(err))
}
else if(args[0] === `view`){
    let viewEmbed = new Discord.MessageEmbed().setTitle(`📀 Channels recording texts.`)
    let viewDescription = ``
    await setEmbed(viewEmbed, viewDescription, foundGuild)
}

}

exports.help = {
    name: "settext",
  };
const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const axios = require('axios');

class RandomCommand extends Command {
	constructor() {
		super('random', {
			aliases: ['random'],
			category: 'general',
			description: {
				content: 'Generate a random word.',
				usage: '[No Arguments]'
			}
		});
	}

	/**
	 * @param {Message} message - The message object.
	 */

	async exec(message) {
		const randomWordEmbed = new MessageEmbed();
		randomWordEmbed.setTitle('ThaCypher random word generator');
		randomWordEmbed.setColor('#DC143C');
		randomWordEmbed.setThumbnail(
			'https://cdn.discordapp.com/attachments/723940968843444268/814920754948735006/dices.png'
		);
		let fieldString = 'Generating a random word...';
		randomWordEmbed.addField('word ', fieldString);
		const randomWordMsg = await message.channel.send(randomWordEmbed);
		const randomWord = await axios.get(
			'https://random-word-api.herokuapp.com/word'
		);
		fieldString = randomWord.data;
		const editedEmbed = randomWordEmbed.spliceFields(0, 1);
		editedEmbed.addField('word ', fieldString);
		randomWordMsg.edit(editedEmbed);
	}
}

module.exports = RandomCommand;

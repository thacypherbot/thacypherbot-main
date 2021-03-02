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
		let randomWord;
		randomWord = await axios.get(
			'https://random-word-api.herokuapp.com/word?number=5'
		);

		// eslint-disable-next-line max-len
		fieldString = `__***${randomWord.data[0]}***__ \n - \n __***${randomWord.data[1]}***__ \n - \n __***${randomWord.data[2]}***__ \n - \n __***${randomWord.data[3]}***__ \n - \n __***${randomWord.data[4]}***__`;
		const editedEmbed = randomWordEmbed.spliceFields(0, 1);
		editedEmbed.addField('word ', fieldString);
		randomWordMsg.edit(editedEmbed);
	}
}

module.exports = RandomCommand;

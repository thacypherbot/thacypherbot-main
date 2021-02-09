const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');

class ProfileCommand extends Command {
	constructor() {
		super('timer', {
			aliases: ['timer'],
			args: [
				{
					id: 'amount',
					type: 'number',
					default: 5
				},
				{
					id: 'unit',
					type: 'string',
					default: 'seconds'
				}
			],
			category: 'general',
			description: {
				content: 'set a timer',
				usage: 'timer [amount]'
			}
		});
	}

	/**
	 * @param {Message} message - The message object.
	 * @param {{ user: User }} args -  The args object.
	 */
	async exec(message, { user }) {
		const profile = await personalProfile
			.findOne({ userid: user.id })
			.catch(() => undefined);
		if (!profile) {
			return message.channel.send('Profile not found!');
		}
		const emojis = [];
		profile.emojiData.forEach(e => emojis.push(`${e.emojiName}: ${e.count}`));
		return message.channel.send({
			embed: {
				color: '#ffc0cb',
				title: 'TheCypher Reactor Profile',
				description: `${user.tag}'s Profile:`,
				fields: [
					{ name: 'Emojis:', value: `${emojis.join('\n') || 'Nothing here.'}` },
					{ name: 'Gems:', value: profile.gems }
				],
				thumbnail: {
					url: user.displayAvatarURL({ dynamic: true })
				}
			}
		});
	}
}

module.exports = ProfileCommand;

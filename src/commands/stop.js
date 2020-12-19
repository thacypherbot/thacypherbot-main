const { Command } = require('discord-akairo');
const { Message } = require('discord.js');
const fs = require('fs-extra');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

class StopCommand extends Command {
	constructor() {
		super('stop', {
			aliases: ['stop'],
			category: 'general',
			channel: 'guild',
			description: {
				content: 'Stops recording...',
				usage: '[No Arguments]'
			}
		});
	}

	/**
	 * @param {Message} message - The message object.
	 */
	async exec(message) {
		if (!this.client.isRecording) {
			return message.channel.send('Bot is not recording anything!');
		}
		if (!message.member.voice?.channel) {
			return message.channel.send('You need to be in a voice channel before that!');
		}
		const vc = message.member.voice.channel;
		vc.leave();
		const mergedDir = path.join(__dirname, `../public/recordings/${vc.id}/`);
		await fs.ensureDir(mergedDir);
		const mergedOutput = ffmpeg();
		this.client.recordings.forEach(recording => mergedOutput.addInput(recording));
		mergedOutput.complexFilter(`amix=inputs=${this.client.recordings.length}:duration=longest`);
		mergedOutput.saveToFile(`${mergedDir}/${Date.now()}.${this.client.recordingFormat.ext}`);
		return undefined;
	}
}

module.exports = StopCommand;

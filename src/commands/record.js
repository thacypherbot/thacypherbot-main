const { Command } = require('discord-akairo');
const { Message } = require('discord.js');
const fs = require('fs-extra');
const path = require('path');
const mergeStream = require('merge-stream');
const ffmpeg = require('fluent-ffmpeg');
const { Readable } = require('stream');

class RecordCommand extends Command {
	constructor() {
		super('start-recording', {
			aliases: ['start-recording', 'record'],
			args: [
				{
					id: 'lock',
					match: 'flag',
					flag: ['--lock', '-lock', '-l', '--l']
				},
				{
					id: 'format',
					type: (_, phrase) => {
						if (/^(f(?:l(?:a(?:c)?)?)?|1)/.test(phrase)) {
							return {
								codec: 'flac',
								format: 'flac',
								ext: 'flac'
							};
						}
						if (/^(a(?:a(?:c)?)?|2)/.test(phrase)) {
							return {
								codec: 'aac',
								format: 'adts',
								ext: 'aac'
							};
						}
						if (/^(o(?:p(?:u(?:s)?)?)?|3)/.test(phrase)) {
							return {
								codec: 'libopus',
								format: 'opus',
								ext: 'opus'
							};
						}
						if (/^(m(?:p(?:3)?)?|4|def(?:ault)?)/.test(phrase)) {
							return {
								codec: 'libmp3lame',
								format: 'mp3',
								ext: 'mp3'
							};
						}
						return undefined;
					},
					prompt: {
						start:
							'Please select a recording format:\n' +
							'> 1 - **FLAC** \n > 2 - **AAC** \n > 3 - **OPUS** \n > 4 - **MP3**',
						retry:
							'Invalid format specified!' +
							'Please select a recording format:\n' +
							'> 1 - **FLAC** \n > 2 - **AAC** \n > 3 - **OPUS** \n > 4 - **MP3**'
					}
				}
			],
			channel: 'guild',
			category: 'general',
			description: {
				content: 'Record audio from the voice channel.',
				usage: '[--lock/-l] <format>'
			}
		});
	}

	/**
	 * @param {Message} message - The message object.
	 * @param {Object} args - The args object.
	 * @param {boolean} args.lock - Whether to lock the channel to a particular user or not.
	 * @param {{ codec: string; ext: string; format: string }} args.format - The format to save the recording.
	 */
	async exec(message, { lock, format }) {
		if (!message.member.voice?.channel) {
			return message.channel.send('You need to join a voice channel first!');
		}
		if (this.client.isRecording) {
			return message.channel.send('The bot is already recording something!');
		}
		if (this.client.isProcessing) {
			return message.channel.send('Please wait for some time, the bot is processing something!');
		}
		this.client.recordingFormat = format;
		const vc = message.member.voice.channel;
		const connection = await vc.join();
		if (lock) {
			this.client.lockTo = message.author.id;
			vc.setUserLimit(vc.members.size);
		}
		connection.play(path.join(__dirname, '../audio/fight.wav'));
		connection.on('speaking', (user, speaking) => {
			if (user.id === this.client.user.id) return undefined;
			if (speaking.has('SPEAKING') || speaking.has('PRIORITY_SPEAKING')) {
				this.client.speaking.set(user.id, true);
			} else {
				this.client.speaking.delete(user.id);
			}
			return undefined;
		});
		const silenceBuffer = new Readable();
		silenceBuffer.push(new Uint8Array(0));
		for (const [_, member] of vc.members) {
			if (member.id === this.client.user.id) return undefined;
			const dir = path.join(__dirname, `../public/recordings/${vc.id}/${member.id}`);
			await fs.ensureDir(dir);
			const out = fs.createWriteStream(`${dir}/${Date.now()}.${format.ext}`);
			this.client.recordings.push(out.path);

			const memberStream = connection.receiver.createStream(member, {
				end: 'manual',
				mode: 'pcm'
			});

			const silentStream = [];
			while (this.client.isRecording) {
				if (!this.client.speaking.has(member.id)) {
					silentStream.push(silenceBuffer);
				}
				await new Promise(() => setTimeout(() => undefined, 20));
			}

			ffmpeg(mergeStream(silentStream, memberStream))
				.inputOptions(['-f', 's16le', '-ar', '48k', '-ac', '2'])
				.on('error', console.log)
				.audioCodec(format.codec)
				.format(format.format)
				.pipe(out);
		}
		return undefined;
	}
}

module.exports = RecordCommand;

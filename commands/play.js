const Discord = require("discord.js");
const ytdl = require("ytdl-core-discord");
const youtube = require("simple-youtube-api");
const fs = require("fs");
const request = require("request");
const queueName = './queue.json';
const functions = require("../modules/functions.js");


exports.run = async (client, message, args) => {
    const yt = new youtube(client.config.google);
    const musicChannel = client.channels.cache.get(client.config.music);
    const voiceChannel = message.member.voice.channel;
    const input = args.join(" ");
    const msg = await musicChannel.messages.fetch(client.config.menu);
    let connection;
    let song;



    try {
    	if (!voiceChannel){
    		throw new Error('Join a voice channel to play music');
    	}
		connection = await functions.voiceJoin(voiceChannel);
		song = functions.obtainSong(await functions.obtainVideo(yt, input));	
    } catch (e){
    	functions.updateFile(queueName, (queue) => {
    		functions.updateMenu(msg, new Discord.MessageEmbed(), queue, e);
    	});
    	return;

    }


    functions.updateFile(queueName, (queue) => {
	    queue.channel = voiceChannel.name;
        if (song != null) {
            queue.songs.push(song);
        }
        if (!queue.playing) {
            play(queue.songs[0]);
            queue.playing = true;
        }
        functions.updateMenu(msg, new Discord.MessageEmbed(), queue);

    });

    async function play(song) {
        if (!song || song == null) {
			functions.updateFile(queueName, (queue) => {
			    queue.channel = null;
                queue.playing = false;
                functions.updateMenu(msg, new Discord.MessageEmbed(), queue);
			});
            voiceChannel.leave();
            return;
        }
        client.dispatcher = connection.play( await ytdl(song.url), { type: 'opus' })
            .on('finish', () => {
            	functions.updateFile(queueName, (queue) => {
            		if (queue.songs.shift() != null) {
                        play(queue.songs[0]);
                    } else {
                        play(null);
                    }
                    console.log(queue);
                    functions.updateMenu(msg, new Discord.MessageEmbed(), queue);
				});
            })
            .on('error', e => console.error(e));

    }


    


};
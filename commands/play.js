const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const youtube = require("simple-youtube-api");
const fs = require("fs");
const request = require("request");
const queueName = './queue.json';
const functions = require("../modules/functions.js");


exports.run = async (client, message, args) => {
    const yt = new youtube(client.config.google);
    const musicChannel = client.channels.get(client.config.music);
    const voiceChannel = message.member.voiceChannel;
    const input = args.join(" ");
    const msg = await musicChannel.fetchMessage(client.config.menu);
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
    		functions.updateMenu(msg, new Discord.RichEmbed(), queue, e);
    	});
    	return;

    }


    functions.updateFile(queueName, (queue) => {
	    queue.channel = voiceChannel.name;
        if (song != null) {
          try{
            queue.songs.push(song);
          } catch (error){
            for(let i = 0; i < song.length; i++){
              queue.songs.push(song[0]);
            }
          }

        }
        if (!queue.playing) {
            play(queue.songs[0]);
            queue.playing = true;
        }
        functions.updateMenu(msg, new Discord.RichEmbed(), queue);

    });

    function play(song) {
        if (!song || song == null) {
			functions.updateFile(queueName, (queue) => {
			    queue.channel = null;
                queue.playing = false;
                functions.updateMenu(msg, new Discord.RichEmbed(), queue);
			});
            voiceChannel.leave();
            return;
        }
        client.dispatcher = connection.playStream(ytdl(song.url, {
                filter: "audioonly"
            }))
            .on('end', () => {
            	functions.updateFile(queueName, (queue) => {
            		if (queue.songs.shift() != null) {
                        play(queue.songs[0]);
                    } else {
                        play(null);
                    }
                    console.log(queue);
                    functions.updateMenu(msg, new Discord.RichEmbed(), queue);
				});
            })
            .on('error', e => console.error(e));

    }





};

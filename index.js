
const Discord = require("discord.js");
const fs = require("fs");
const dotenv = require('dotenv');

const client = new Discord.Client();
client.commands = new Map();
client.menu = new Discord.MessageEmbed();
client.dispatcher = null;

dotenv.config();
client.config = {
	menu: process.env.MENU_ID,
	music: process.env.MUSIC_CHANNEL,
	prefix: process.env.PREFIX,
	token: process.env.TOKEN,
	google: process.env.GOOGLE_API_KEY,
	echo: process.env.ECHO
}

fs.readdir("./commands/", (err, files) => {
	if (err) {
		return console.error(err);
	}
	files.forEach(file => {
		if (!file.endsWith(".js")) return;
		let cmd = require(`./commands/${file}`);
		client.commands.set(file.split(".")[0], cmd);
	});
});

fs.readdir("./events/", (err, files) => {
	if (err) {
		return console.error(err);
	}
	files.forEach(file => {
		let event = require(`./events/${file}`);
		let eventName = file.split(".")[0];
		client.on(eventName, event.bind(null, client));
	});
});

client.login(client.config.token);
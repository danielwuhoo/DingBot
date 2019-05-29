const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);


const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");

client.config = require("./config.json");
client.commands = new Map();
client.menu = new Discord.RichEmbed();
client.dispatcher = null;

fs.readdir("./commands/", (err, files) => {
	if (err){
		return console.error(err);
	}
	files.forEach(file => {
		if (!file.endsWith(".js")) return;
		let cmd = require(`./commands/${file}`);
		client.commands.set(file.split(".")[0], cmd);

	});
});

fs.readdir("./events/", (err, files) => {
	if (err){
		return console.error(err);
	}
	files.forEach(file => {
		let event = require(`./events/${file}`);
		let eventName = file.split(".")[0];
		client.on(eventName, event.bind(null, client));

	});

});

client.login(process.env.TOKEN);
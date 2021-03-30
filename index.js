
const Discord = require("discord.js");
const fs = require("fs");
const dotenv = require('dotenv');
const cron = require('node-cron');
const fetch = require("node-fetch");

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

const cities = [
	'ALEXANDRIA',
	'ANNANDALE',
	'ARLINGTON',
	'BAILEYS CROSSROADS',
	'BURKE',
	'CHANTILLY',
	'FAIRFAX',
	'FALLS CHURCH',
	'GAINESVILLE',
	'HERNDON',
	'MANASSAS',
	'OAKTON',
	'RESTON',
	'ROSSLYN',
	'SPRINGFIELD',
	'STERLING',
	'VIENNA',
	'WOODBRIDGE'
];

const grabData = async () => {
	const response = await fetch("https://www.cvs.com/immunizations/covid-19-vaccine.vaccine-status.VA.json?vaccineinfo", {
		"headers": {
		  "referer": "https://www.cvs.com/immunizations/covid-19-vaccine",
		},
		"method": "GET"
	  });
	const data = (await response.json()).responsePayloadData.data.VA;
	const available = data.filter(e => cities.includes(e.city) && e.status != 'Fully Booked');

	if (available.length) {
		const mainChannel = await client.channels.fetch('141703897659080704');
		mainChannel.send(`<@&209490258859917313> Vaccines available in ${available.map(e => e.city).join()} \n https://www.cvs.com/immunizations/covid-19-vaccine`);
	}
}

cron.schedule('* * * * *', () => {
	grabData();
});

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

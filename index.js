
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

const grabOtherData = async () => {
	const response = await fetch("https://www.cvs.com/Services/ICEAGPV1/immunization/1.0.0/getIMZStores", {
		"headers": {
		  "accept": "application/json",
		  "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
		  "content-type": "application/json",
		  "sec-ch-ua-mobile": "?1",
		  "sec-fetch-dest": "empty",
		  "sec-fetch-mode": "cors",
		  "sec-fetch-site": "same-origin",
		},
		"referrer": "https://www.cvs.com/vaccine/intake/store/cvd-store-select/first-dose-select",
		"referrerPolicy": "strict-origin-when-cross-origin",
		"body": "{\"requestMetaData\":{\"appName\":\"CVS_WEB\",\"lineOfBusiness\":\"RETAIL\",\"channelName\":\"MOBILE\",\"deviceType\":\"AND_MOBILE\",\"deviceToken\":\"7777\",\"apiKey\":\"a2ff75c6-2da7-4299-929d-d670d827ab4a\",\"source\":\"ICE_WEB\",\"securityType\":\"apiKey\",\"responseFormat\":\"JSON\",\"type\":\"cn-dep\"},\"requestPayloadData\":{\"selectedImmunization\":[\"CVD\"],\"distanceInMiles\":35,\"imzData\":[{\"imzType\":\"CVD\",\"ndc\":[\"59267100002\",\"59267100003\",\"59676058015\",\"80777027399\"],\"allocationType\":\"1\"}],\"searchCriteria\":{\"addressLine\":\"22032\"}}}",
		"method": "POST",
		"mode": "cors"
	  });

	const data = await response.json();
	if (data.responseMetaData.statusCode == '0000') {
		const mainChannel = await client.channels.fetch('141703897659080704');
		mainChannel.send(`<@&209490258859917313> Vaccines available in ${data.responsePayloadData.locations.map(e => e.addressLine).join()} \n https://www.cvs.com/immunizations/covid-19-vaccine`);
	}
}

cron.schedule('*/5 * * * *', () => {
	grabData();
	grabOtherData();
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

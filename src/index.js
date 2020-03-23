const dotenv = require('dotenv');
dotenv.config();
const env = process.env;

const groupId = parseInt(env.GROUPID);
const roverApiUrl = 'https://verify.eryn.io/api/user/';
const guildId = '663067666910806035';

const Discord = require('discord.js');
const noblox = require('noblox.js');
const axios = require('axios');
const express = require('express');
const server = express();

const client = new Discord.Client();
const clientLoginPromise = new Promise((resolve, reject) => {
	client.once('ready', () => {
		console.log('Discord logged in');
		resolve();
	});
});

const nobloxLoginPromise = noblox.cookieLogin(env.ROBLOX).then(() => {
	console.log('Noblox logged in');
});

const bots = [clientLoginPromise, nobloxLoginPromise];

var checkMember;
var checkMembers;

Promise.all(bots).then(() => {
	console.log('all logged in');
	var guild = client.guilds.cache.get(guildId);
	checkMember = (member) => {
		return new Promise((resolve, reject) => {
			axios.get(roverApiUrl + member.id).then((response) => {
				var playerId = response.data.robloxId;
				noblox.getRankNameInGroup(groupId, playerId).then(async (rank) => {
					var role = guild.roles.cache.find((role) => role.name == rank);
					if (typeof role == 'undefined') {
						role = await guild.roles.create({
							data: {
								name: rank,
								hoist: true,
								permissions: 0
							}
						});
					};
					if (!member.roles.cache.has(role)) {
						console.log(`Gave ${member.username} role ${role.name}`);
						member.roles.add(role);
					};
					resolve();
				});
			}).catch((error) => {
				if (error.response.status != 404) {
					console.log(error);
				};
				resolve();
			});
		});
	};
	checkMembers = async () => {
		const memberArray = guild.members.cache.array()
		for (var memberIndex = 0; memberIndex < memberArray.length; memberIndex++) {
			await checkMember(memberArray[memberIndex]);
		};
	};
}).catch(console.log);


setTimeout(() => {
	checkMembers();
}, 5 * 60 * 1000);

client.on('guildMemberAdd', (member) => {
	checkMember(member);
});

client.login(env.TOKEN);

server.get('/', (req, res) => {
	res.sendStatus(200);
});

server.listen(3000, () => {
	console.log('listening');
});
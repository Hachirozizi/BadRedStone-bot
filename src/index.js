const dotenv = require('dotenv');
dotenv.config();
const env = process.env;

const Discord = require('discord.js');
const noblox = require('noblox.js');

const client = new Discord.Client();

client.login(env.TOKEN);
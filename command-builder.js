const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
	.setName('new')
	.setDescription('Make a new subdomain')
	.addStringOption(option =>
		option.setName('type')
			.setDescription('The type of record you want to make')
			.setRequired(true)
			.addChoices(
				{ name: 'CNAME', value: 'CNAME' },
				{ name: 'A', value: 'A' },
				{ name: 'TXT', value: 'TXT' },
			))
    .addStringOption(option =>
		option.setName('subdomain')
			.setDescription('The subdomain you want')
			// Ensure the text will fit in an embed description, if the user chooses that option
			.setMaxLength(20))
    .addStringOption(option =>
		option.setName('content')
			.setDescription('The record content')
			// Ensure the text will fit in an embed description, if the user chooses that option
			.setMaxLength(2000))

const rawData = data.toJSON();
console.log(rawData);
            
            

import { SlashCommandBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Controlla la latenza del bot'),

    async execute(interaction, config, client) {
        await interaction.reply({
            content: `🏓 Pong! Latenza: **${client.ws.ping}ms**.`,
            ephemeral: true
        });
    },
};

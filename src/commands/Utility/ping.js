import { SlashCommandBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Controlla se il bot è online e la sua velocità'),

    async execute(interaction, config, client) {
        await interaction.reply({
            content: `🏓 Pong! La latenza del bot è di **${client.ws.ping}ms**.`,
            ephemeral: true
        });
    },
};

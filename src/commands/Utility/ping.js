import { SlashCommandBuilder } from 'discord.js';

export default {
    // 1. Definiamo i dati del comando (quello che vedi su Discord)
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Controlla se il bot è online e la sua velocità'),

    // 2. Definiamo cosa succede quando il comando viene eseguito
    async execute(interaction, config, client) {
        // interaction.reply è il modo in cui il bot risponde al comando /
        await interaction.reply({ 
            content: `🏓 Pong! La latenza del bot è di **${client.ws.ping}ms**.`,
            ephemeral: true // Solo tu potrai vedere questo messaggio (opzionale)
        });
    },
};

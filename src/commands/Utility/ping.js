import { SlashCommandBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('ping') 
        .setDescription('Mostra la velocità e la latenza del bot'),

    async execute(interaction, config, client) {
        // Calcoliamo la latenza del WebSocket (la velocità di risposta di Discord)
        const ping = client.ws.ping;
        
        // Rispondiamo all'utente con il dato reale
        await interaction.reply({ 
            content: `🏓 Pong! La mia velocità di risposta è di **${ping}ms**.`, 
            ephemeral: true 
        });
    },
};

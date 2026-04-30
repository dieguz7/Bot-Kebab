import { SlashCommandBuilder } from 'discord.js';

export default {
    category: "utility",
    // Questo blocco sostituisce @commands.hybrid_command
    data: new SlashCommandBuilder()
        .setName('ping') // Il "name" dello script Python
        .setDescription('Mostra la velocità e la latenza del bot'), // La "description"

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

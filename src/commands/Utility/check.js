import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
// ATTENZIONE: Per far sì che questo funzioni, la Mappa 'activeShifts' 
// deve essere condivisa. Per ora usiamo questa versione rapida.

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('personale attivo')
        .setDescription('Vedi chi sta lavorando in questo momento'),

    async execute(interaction, config, client) {
        // Nota: Questo comando funzionerà bene solo se uniamo 
        // la logica del tempo in un unico sistema di gestione.
        
        const embed = new EmbedBuilder()
            .setTitle("📋 Stato Personale")
            .setColor("#00ff00")
            .setDescription("Ecco chi ha il cartellino timbrato:")
            .setTimestamp();

        // Qui andrebbe la logica per leggere i dati salvati
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('personaleattivo')
        .setDescription('Mostra la lista del personale attualmente in servizio'),

    async execute(interaction, guildConfig, client) {
        // 1. Controlliamo se la mappa del cartellino esiste ed ha persone dentro
        if (!client.cartellino || client.cartellino.size === 0) {
            return await interaction.reply({ 
                content: "🔴 Al momento non c'è nessun kebabbaro in servizio.", 
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("🟢 PERSONALE ATTUALMENTE IN SERVIZIO")
            .setColor("#2ecc71")
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()
            .setFooter({ text: "Kebabbaro - Monitoraggio Turni", iconURL: client.user.displayAvatarURL() });

        let listaPersonale = "";

        // 2. Cicliamo tutte le persone dentro client.cartellino
        client.cartellino.forEach((dati, userId) => {
            const oraInizio = Math.floor(dati.inizio / 1000);
            // Generiamo la menzione dell'utente (<@ID>) e il timestamp discord dell'ora d'inizio
            listaPersonale += `• <@${userId}> — In servizio dalle <t:${oraInizio}:t> (<t:${oraInizio}:R>)\n`;
        });

        embed.setDescription(listaPersonale);

        // 3. Inviamo la lista aggiornata
        return await interaction.reply({ embeds: [embed] });
    }
};

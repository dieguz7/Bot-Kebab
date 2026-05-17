import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('info-cartellino')
        .setDescription('Visualizza le ore accumulate nella settimana corrente')
        .addUserOption(option => 
            option.setName('utente')
                .setDescription('Seleziona un dipendente per vedere le sue ore')
                .setRequired(false)),

    async execute(interaction, guildConfig, client) {
        // --- CONTROLLO RUOLO (Tutti i dipendenti possono usarlo per vedere le proprie ore) ---
        // Se vuoi limitarlo a un ruolo specifico, scommenta le righe sotto:
        /*
        const RUOLO_AUTORIZZATO = 'ID_RUOLO';
        if (!interaction.member.roles.cache.has(RUOLO_AUTORIZZATO)) {
            return await interaction.reply({ content: "❌ Non sei autorizzato.", ephemeral: true });
        }
        */

        const utenteTarget = interaction.options.getUser('utente') || interaction.user;
        
        // Se sta guardando le ore di un altro, controlliamo se ha i permessi da capo/staff
        if (utenteTarget.id !== interaction.user.id) {
            const RUOLO_STAFF = '1498386121124610208';
            if (!interaction.member.roles.cache.has(RUOLO_STAFF)) {
                return await interaction.reply({ content: "❌ Puoi vedere solo le tue ore personali. Non hai il ruolo Staff per guardare quelle altrui.", ephemeral: true });
            }
        }

        const minutiSalvati = global.oreTotali?.[utenteTarget.id] || 0;
        
        // Controlliamo se è attualmente in servizio per calcolare i minuti extra in tempo reale
        let minutiSessione = 0;
        const turnoAttuale = client.cartellino?.get(utenteTarget.id);
        if (turnoAttuale) {
            minutiSessione = Math.floor((Date.now() - turnoAttuale.inizio) / 60000);
        }

        const totaleMinuti = minutiSalvati + minutiSessione;
        const h = Math.floor(totaleMinuti / 60);
        const m = totaleMinuti % 60;

        const embed = new EmbedBuilder()
            .setTitle(`📅 REGISTRO SETTIMANALE: ${utenteTarget.username}`)
            .setColor("#3498db")
            .addFields(
                { name: "⏱️ Tempo totalizzato:", value: `\`${h}h ${m}m\``, inline: false },
                { name: "📢 Stato attuale:", value: turnoAttuale ? `🟢 In servizio da ${minutiSessione}m` : "🔴 Fuori servizio", inline: false }
            )
            .setFooter({ text: "Kebabbaro - Resoconto Orari", iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        return await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

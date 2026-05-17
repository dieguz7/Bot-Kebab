import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('reset-ore')
        .setDescription('Sposta le ore nella settimana precedente e azzera il contatore attuale')
        .addUserOption(option => 
            option.setName('utente')
                .setDescription('L\'utente di cui resettare le ore (lascia vuoto per resettare TUTTI)')
                .setRequired(false)),

    async execute(interaction, guildConfig, client) {
        // --- CONTROLLO RUOLO AUTORIZZATO ---
        const RUOLO_AUTORIZZATO = '1498387589709692958'; 
        if (!interaction.member.roles.cache.has(RUOLO_AUTORIZZATO)) {
            return await interaction.reply({ content: "❌ Non hai i permessi per usare questo comando.", ephemeral: true });
        }

        const utenteTarget = interaction.options.getUser('utente');

        // Inizializziamo le strutture se non esistono
        if (!global.oreTotali) global.oreTotali = {};
        if (!global.oreSettimanaPrecedente) global.oreSettimanaPrecedente = {};

        const embed = new EmbedBuilder().setColor("#e74c3c").setTimestamp();

        if (utenteTarget) {
            // 1. Sposta le ore correnti dello specifico utente nello storico precedente
            const oreCorrenti = global.oreTotali[utenteTarget.id] || 0;
            global.oreSettimanaPrecedente[utenteTarget.id] = oreCorrents;
            
            // 2. Azzera il contatore attuale
            global.oreTotali[utenteTarget.id] = 0;

            embed.setTitle("✅ ARCHIVIAZIONE E RESET EFFETTUATO")
                .setDescription(`Le ore di ${utenteTarget} sono state spostate nella **settimana precedente** e il contatore attuale è stato azzerato.`);
        } else {
            // 1. Sposta TUTTI i dati attuali nella settimana precedente
            global.oreSettimanaPrecedente = { ...global.oreTotali };
            
            // 2. Svuota completamente il registro attuale
            global.oreTotali = {};

            embed.setTitle("🚨 ARCHIVIAZIONE GENERALE EFFETTUATA")
                .setDescription("Le ore di **tutti i dipendenti** sono state trasferite nello storico della **settimana precedente**. Il contatore attuale è ora vuoto.");
        }

        return await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

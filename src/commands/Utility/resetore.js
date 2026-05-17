import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('reset-ore')
        .setDescription('Azzera le ore accumulate da un utente o da tutto il server')
        .addUserOption(option => 
            option.setName('utente')
                .setDescription('L\'utente a cui resettare le ore (lascia vuoto per resettare TUTTI)')
                .setRequired(false)),

    async execute(interaction, guildConfig, client) {
        // --- CONTROLLO RUOLO AUTORIZZATO ---
        const RUOLO_AUTORIZZATO = '1498387589709692958'; 
        if (!interaction.member.roles.cache.has(RUOLO_AUTORIZZATO)) {
            return await interaction.reply({ content: "❌ Non hai i permessi per usare questo comando.", ephemeral: true });
        }

        const utenteTarget = interaction.options.getUser('utente');

        if (!global.oreTotali) global.oreTotali = {};

        const embed = new EmbedBuilder().setColor("#e74c3c").setTimestamp();

        if (utenteTarget) {
            // Reset di un singolo utente
            global.oreTotali[utenteTarget.id] = 0;
            embed.setTitle("✅ RESET ORE EFFETTUATO")
                .setDescription(`Le ore totali accumulate da ${utenteTarget} sono state azzerate con successo.`);
        } else {
            // Reset globale di tutti i dati
            global.oreTotali = {};
            embed.setTitle("🚨 RESET TOTALE EFFETTUATO")
                .setDescription("Il registro storico di **tutti i dipendenti** è stato completamente svuotato.");
        }

        return await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

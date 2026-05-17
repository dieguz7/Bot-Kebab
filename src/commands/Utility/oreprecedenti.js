import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ore-precedenti')
        .setDescription('Visualizza le ore accumulate nella settimana precedente')
        .addUserOption(option => 
            option.setName('utente')
                .setDescription('Seleziona un dipendente per vedere il suo storico')
                .setRequired(false)),

    async execute(interaction, guildConfig, client) {
        const utenteTarget = interaction.options.getUser('utente') || interaction.user;
        
        // Se si guardano le ore di qualcun altro, serve il ruolo Staff
        if (utenteTarget.id !== interaction.user.id) {
            const RUOLO_STAFF = 'ID_DEL_RUOLO_DIREZIONE_STAFF';
            if (!interaction.member.roles.cache.has(RUOLO_STAFF)) {
                return await interaction.reply({ content: "❌ Non hai il ruolo Staff per guardare lo storico degli altri dipendenti.", ephemeral: true });
            }
        }

        // Recuperiamo i dati dalla variabile della settimana scorsa
        const totaleMinutiPassati = global.oreSettimanaPrecedente?.[utenteTarget.id] || 0;
        
        const h = Math.floor(totaleMinutiPassati / 60);
        const m = totaleMinutiPassati % 60;

        const embed = new EmbedBuilder()
            .setTitle(`⏮️ STORICO SETTIMANA PRECEDENTE: ${utenteTarget.username}`)
            .setColor("#95a5a6") // Grigio per indicare dati passati
            .addFields(
                { name: "⏱️ Tempo totalizzato nella scorsa settimana:", value: `\`${h}h ${m}m\``, inline: false }
            )
            .setFooter({ text: "Kebabbaro - Archivio Storico Orari", iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        return await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

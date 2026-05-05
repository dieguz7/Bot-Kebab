import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('gestione-ore')
        .setDescription('Gestione settimanale delle ore')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub.setName('reset').setDescription('Sposta le ore attuali nella settimana precedente e azzera'))
        .addSubcommand(sub => sub.setName('classifica').setDescription('Mostra le ore di tutti della settimana precedente')),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'reset') {
            // Qui dovresti eseguire una query SQL:
            // UPDATE lavoro SET last_week_minutes = total_minutes, total_minutes = 0;
            await interaction.reply("✅ Tutte le ore sono state resettate e spostate nello storico settimanale.");
        } 
        
        else if (sub === 'classifica') {
            // Qui dovresti recuperare i dati dal database:
            // SELECT user_id, last_week_minutes FROM lavoro ORDER BY last_week_minutes DESC;
            const embed = new EmbedBuilder()
                .setTitle("📊 Ore Settimana Precedente")
                .setDescription("Ecco il riepilogo dei turni svolti nella scorsa settimana:")
                .setColor("#3498db");

            // Esempio di riga (da ciclare con i dati del DB)
            embed.addFields({ name: "Utente Esempio", value: "10 ore e 30 minuti", inline: false });

            await interaction.reply({ embeds: [embed] });
        }
    }
};

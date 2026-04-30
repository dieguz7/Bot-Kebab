import { SlashCommandBuilder } from 'discord.js';

// Questa mappa memorizza chi ha timbrato: ID Utente -> Ora di inizio
const activeShifts = new Map();

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('lavoro')
        .setDescription('Gestisci il tuo cartellino')
        .addSubcommand(sub => 
            sub.setName('timbra').setDescription('Inizia il tuo turno di lavoro'))
        .addSubcommand(sub => 
            sub.setName('stimbra').setDescription('Termina il tuo turno e calcola il tempo')),

    async execute(interaction, config, client) {
        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        if (sub === 'timbra') {
            if (activeShifts.has(userId)) {
                return await interaction.reply({ content: "❌ Hai già timbrato! Devi prima stimbrare.", ephemeral: true });
            }

            const startTime = Date.now();
            activeShifts.set(userId, startTime);

            await interaction.reply({ 
                content: `✅ **Cartellino timbrato!** Buon lavoro, <@${userId}>.\nOra di inizio: <t:${Math.floor(startTime / 1000)}:T>`, 
                ephemeral: true 
            });

        } else if (sub === 'stimbra') {
            if (!activeShifts.has(userId)) {
                return await interaction.reply({ content: "❌ Non hai ancora timbrato!", ephemeral: true });
            }

            const startTime = activeShifts.get(userId);
            const endTime = Date.now();
            
            // Calcolo della durata
            const durationMs = endTime - startTime;
            const hours = Math.floor(durationMs / 3600000);
            const minutes = Math.floor((durationMs % 3600000) / 60000);
            const seconds = Math.floor((durationMs % 60000) / 1000);

            activeShifts.delete(userId);

            await interaction.reply({ 
                content: `🏁 **Turno terminato!**\n⏱️ Hai lavorato per: **${hours}h ${minutes}m ${seconds}s**.\n`, 
                ephemeral: true 
            });
        }
    },
};

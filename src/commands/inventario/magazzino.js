import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('magazzino')
        .setDescription('Gestione inventario: Aggiungi, Rimuovi o Visualizza la merce'),

    async execute(interaction, config, client) {
        // --- CONTROLLO RUOLO ---
        const RUOLO_AUTORIZZATO = '1498387589709692958'; // Sostituisci con il tuo ID
        if (!interaction.member.roles.cache.has(RUOLO_AUTORIZZATO)) {
            return await interaction.reply({ content: "❌ Non hai i permessi per gestire il magazzino.", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle("📦 GESTIONE MAGAZZINO AZIENDALE")
            .setDescription("Seleziona un'operazione dai bottoni sottostanti per gestire la merce in inventario.")
            .setColor("#2f3136")
            .setFooter({ text: "Official Bot 🤖", iconURL: client.user.displayAvatarURL() });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_aggiungi')
                .setLabel('Aggiungi')
                .setStyle(ButtonStyle.Success)
                .setEmoji('➕️'),
            new ButtonBuilder()
                .setCustomId('btn_rimuovi')
                .setLabel('Rimuovi')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('➖'),
            new ButtonBuilder()
                .setCustomId('view_inventory')
                .setLabel('Vedi Inventario')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📦')
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};

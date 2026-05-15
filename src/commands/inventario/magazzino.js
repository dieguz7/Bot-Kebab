import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('magazzino')
        .setDescription('Visualizza l’interfaccia di gestione inventario'),

    async execute(interaction, config, client) {
        // --- CONTROLLO RUOLO ---
        const RUOLO_AUTORIZZATO = '1498387589709692958'; // <--- Inserisci qui l'ID del ruolo
        
        if (!interaction.member.roles.cache.has(RUOLO_AUTORIZZATO)) {
            return await interaction.reply({ 
                content: "❌ Non hai i permessi necessari per gestire il magazzino.", 
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("📦 Inventario Città")
            .setDescription("Premi **Vedi inventario** per visualizzare i totali, oppure scegli una categoria per gestire gli oggetti.")
            .setColor("#2f3136")
            .setFooter({ text: "EMS - Inventario Città" });

        // Prima riga: Vedi Inventario
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('view_inventory')
                .setLabel('Vedi inventario')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📦')
        );

        // Seconda riga: Categorie
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('cat_medikit')
                .setLabel('Medikit')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('➕'),
            new ButtonBuilder()
                .setCustomId('cat_bende')
                .setLabel('Bende')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🩹')
        );

        await interaction.reply({ embeds: [embed], components: [row1, row2] });
    }
};

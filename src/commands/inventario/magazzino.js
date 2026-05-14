import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('magazzino')
        .setDescription('Visualizza l’inventario e gestisci la merce'),

    async execute(interaction, config, client) {
        // --- CONTROLLO RUOLO ---
        const RUOLO_AUTORIZZATO = 'ID_DEL_TUO_RUOLO'; 
        if (!interaction.member.roles.cache.has(RUOLO_AUTORIZZATO)) {
            return await interaction.reply({ content: "❌ Non hai accesso al magazzino.", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle("📦 GESTIONE MAGAZZINO")
            .setColor("#f1c40f")
            .setDescription(generaListaInventario())
            .setFooter({ text: "Official Bot 🤖", iconURL: client.user.displayAvatarURL() });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_aggiungi')
                .setLabel('Aggiungi Merce')
                .setStyle(ButtonStyle.Success)
                .setEmoji('➕'),
            new ButtonBuilder()
                .setCustomId('btn_rimuovi')
                .setLabel('Rimuovi Merce')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('➖')
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};

// Funzione utile per leggere l'inventario
function generaListaInventario() {
    if (!global.inventario || Object.keys(global.inventario).length === 0) return "Il magazzino è vuoto.";
    let lista = "";
    for (const [item, qty] of Object.entries(global.inventario)) {
        lista += `• **${item.toUpperCase()}**: ${qty} pezzi\n`;
    }
    return lista;
}

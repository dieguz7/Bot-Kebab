import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    async execute(interaction, config, client) {
        if (!global.inventario || Object.keys(global.inventario).length === 0) {
            return interaction.reply({ content: "📦 Il magazzino è attualmente vuoto.", ephemeral: true });
        }

        let magazzino = "";
        for (const [item, qty] of Object.entries(global.inventario)) {
            magazzino += `• **${item.toUpperCase()}**: ${qty} pezzi\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle("📦 MAGAZZINO AZIENDALE")
            .setColor("#f1c40f")
            .setDescription(magazzino)
            .setFooter({ text: "Official Bot 🤖", iconURL: client.user.displayAvatarURL() });

        await interaction.reply({ embeds: [embed] });
    },
    data: new SlashCommandBuilder()
        .setName('inventario')
        .setDescription('Mostra la merce disponibile'),
};

import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('setup-ticket')
        .setDescription('Invia il pannello per l’apertura dei ticket')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Solo admin

    async execute(interaction, config, client) {
        const embed = new EmbedBuilder()
            .setTitle("🎫 Centro Assistenza")
            .setDescription("Hai bisogno di aiuto? Clicca sul pulsante qui sotto per aprire un ticket.\n\nI nostri staffer ti risponderanno il prima possibile.")
            .setColor("#5865F2")
            .setFooter({ text: "Sistema Ticket Ufficiale" });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket')
                .setLabel('Apri Ticket')
                .setEmoji('📩')
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ content: "Pannello inviato!", ephemeral: true });
        await interaction.channel.send({ embeds: [embed], components: [row] });
    },
};

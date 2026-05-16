import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('setup-cartellino')
        .setDescription('Invia il pannello per il sistema cartellini')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("🆔 Sistema Cartellino del Kebabbaro🥙")
            .setDescription("Benvenuto nel **sistema cartellini del kebabbaro**!\nQui sotto troverai i pulsanti per gestire il tuo cartellino di servizio.")
            .addFields(
                { name: "🟢 Timbra", value: "Inizia il tuo turno di servizio registrando l'orario.", inline: false },
                { name: "🔴 Stimbra", value: "Termina il turno e registra le ore svolte.", inline: false },
                { name: "ℹ️ Info", value: "Controlla lo storico delle ore accumulate.", inline: false }
            )
            .setColor("#2f3136")
            .setFooter({ text: "Kebabbaro🥙 - Sistema Cartellini" });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('timbra').setLabel('Timbra').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('stimbra').setLabel('Stimbra').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('info_ore').setLabel('Info').setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};

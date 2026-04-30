import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('pannello-lavoro')
        .setDescription('Invia il pannello con i pulsanti per il lavoro'),

    async execute(interaction, config, client) {
        // Controllo Permessi (Solo Admin)
        if (!interaction.member.permissions.has('Administrator')) {
            return await interaction.reply({ content: "❌ Solo un Admin può settare il pannello!", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle("🏢 Gestione Turni Personale")
            .setDescription("Usa i pulsanti qui sotto per gestire il tuo cartellino.\n\n🟢 **Timbra**: Inizia il turno\n🔴 **Stimbra**: Finisci il turno\nℹ️ **Info**: Vedi le tue ore settimanali\n👥 **In Servizio**: Vedi chi sta lavorando")
            .setColor("#2b2d31");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('work_on').setLabel('Timbra').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('work_off').setLabel('Stimbra').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('work_info').setLabel('Info').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('work_list').setLabel('In Servizio').setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};

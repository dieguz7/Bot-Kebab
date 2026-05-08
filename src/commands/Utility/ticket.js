const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-ticket')
        .setDescription('Invia il messaggio per il sistema di ticket')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🎫 Centro Supporto')
            .setDescription('Premi qui sotto per creare un nuovo ticket di supporto')
            .addFields(
                { name: '📂 Generale', value: 'Chiedere info generali', inline: false },
                { name: '📝 Colloquio', value: 'Per richiedere una data e un giorno per il colloquio', inline: false },
                { name: '⚖️ Segnalazione', value: 'Per comunicare un comportamento scorretto di un dipendente', inline: false },
                { name: '👑 Proprietari', value: 'Per parlare con i proprietari per un eventuale convenzione/segnalazione', inline: false }
            )
            .setFooter({ text: 'Bot offerto da DIeguz' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('ticket_generale').setLabel('Generale').setEmoji('📂').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('ticket_colloquio').setLabel('Colloquio').setEmoji('📝').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('ticket_segnalazione').setLabel('Segnalazione').setEmoji('⚖️').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('ticket_proprietari').setLabel('Proprietari').setEmoji('👑').setStyle(ButtonStyle.Secondary),
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};

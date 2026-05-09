import { SlashCommandBuilder } from 'discord.js';

export default {
    async execute(interaction) {
        const oggetto = interaction.options.getString('oggetto').toLowerCase();
        const quantita = interaction.options.getInteger('quantita');

        if (!global.inventario) global.inventario = {};
        global.inventario[oggetto] = (global.inventario[oggetto] || 0) + quantita;

        await interaction.reply({ content: `✅ Aggiunti **x${quantita} ${oggetto}** al magazzino.`, ephemeral: true });
    },
    data: new SlashCommandBuilder()
        .setName('aggiungi')
        .setDescription('Aggiunge merce manualmente')
        .addStringOption(opt => opt.setName('oggetto').setRequired(true).setDescription('Nome oggetto'))
        .addIntegerOption(opt => opt.setName('quantita').setRequired(true).setDescription('Quantità')),
};

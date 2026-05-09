import { SlashCommandBuilder } from 'discord.js';

export default {
    async execute(interaction) {
        const oggetto = interaction.options.getString('oggetto').toLowerCase();
        const quantita = interaction.options.getInteger('quantita');

        if (!global.inventario || !global.inventario[oggetto] || global.inventario[oggetto] < quantita) {
            return interaction.reply({ content: `❌ Non ci sono abbastanza ${oggetto} in magazzino!`, ephemeral: true });
        }

        global.inventario[oggetto] -= quantita;
        if (global.inventario[oggetto] <= 0) delete global.inventario[oggetto];

        await interaction.reply({ content: `✅ Rimossi **x${quantita} ${oggetto}** dal magazzino.`, ephemeral: true });
    },
    data: new SlashCommandBuilder()
        .setName('rimuovi')
        .setDescription('Toglie merce dal magazzino')
        .addStringOption(opt => opt.setName('oggetto').setRequired(true).setDescription('Nome oggetto'))
        .addIntegerOption(opt => opt.setName('quantita').setRequired(true).setDescription('Quantità')),
};

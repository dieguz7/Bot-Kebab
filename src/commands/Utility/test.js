import { SlashCommandBuilder } from 'discord.js';

export default {
    category: "utility",
    // Questo blocco sostituisce @commands.hybrid_command
    data: new SlashCommandBuilder()
        .setName('test') // Il "name" dello script Python
        .setDescription('Prova ping pong'), // La "description"

    async execute(interaction, config, client) {
        // Qui scrivi cosa deve fare il bot quando ricevi il comando
        await interaction.reply({ content: "Comando eseguito!", ephemeral: true });
    },
};

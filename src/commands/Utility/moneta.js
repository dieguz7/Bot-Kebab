import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('moneta')
        .setDescription('Lancia una moneta per decidere tra testa o croce'),

    async execute(interaction) {
        const risultati = ['Testa', 'Croce'];
        const scelta = risultati[Math.floor(Math.random() * risultati.length)];
        
        // Scegliamo un'icona in base al risultato
        const icona = scelta === 'Testa' 
            ? '🪙' 
            : '📀';

        const embed = new EmbedBuilder()
            .setTitle(`${icona} Lancio della moneta`)
            .setDescription(`La moneta gira in aria e cade su... **${scelta}**!`)
            .setColor(scelta === 'Testa' ? '#f1c40f' : '#95a5a6')
            .setTimestamp()
            .setFooter({ text: `Lanciata da ${interaction.user.username}` });

        await interaction.reply({ embeds: [embed] });
    },
};

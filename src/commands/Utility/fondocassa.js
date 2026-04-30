import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

// In un mondo perfetto, questo valore verrebbe da un database
let fdc = 0; 

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('fondocassa')
        .setDescription('Visualizza il saldo attuale dell’azienda'),

    async execute(interaction) {
        // Recuperiamo il valore (per ora globale nel bot)
        const saldo = global.aziendaSaldo || 0;

        const embed = new EmbedBuilder()
            .setTitle("💰 Contabilità Aziendale")
            .setDescription(`Il saldo attuale del fondo cassa è:\n# 💶 ${saldo.toLocaleString()}€`)
            .setColor(saldo >= 0 ? "#2ecc71" : "#e74c3c")
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};

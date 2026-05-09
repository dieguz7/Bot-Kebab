import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    async execute(interaction, config, client) {
        const oggetto = interaction.options.getString('oggetto').toLowerCase();
        const quantita = interaction.options.getInteger('quantita');
        const prezzo = interaction.options.getInteger('prezzo_totale');

        if (global.aziendaSaldo === undefined) global.aziendaSaldo = 0;
        if (!global.inventario) global.inventario = {};

        if (global.aziendaSaldo < prezzo) {
            return interaction.reply({ content: `❌ Il fondo cassa (€${global.aziendaSaldo}) non è sufficiente per pagare €${prezzo}.`, ephemeral: true });
        }

        global.aziendaSaldo -= prezzo;
        global.inventario[oggetto] = (global.inventario[oggetto] || 0) + quantita;

        const embed = new EmbedBuilder()
            .setTitle("🛒 ACQUISTO EFFETTUATO")
            .setColor("#3498db")
            .addFields(
                { name: "📦 Prodotto", value: oggetto, inline: true },
                { name: "🔢 Quantità", value: `x${quantita}`, inline: true },
                { name: "💰 Prezzo Pagato", value: `€${prezzo}`, inline: true },
                { name: "📉 Nuovo Saldo Cassa", value: `€${global.aziendaSaldo}`, inline: false }
            )
            .setFooter({ text: "Official Bot 🤖", iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
    data: new SlashCommandBuilder()
        .setName('acquista')
        .setDescription('Compra merce scalando i soldi dal fondo cassa')
        .addStringOption(opt => opt.setName('oggetto').setDescription('Cosa compri?').setRequired(true))
        .addIntegerOption(opt => opt.setName('quantita').setDescription('Quanti pezzi?').setRequired(true))
        .addIntegerOption(opt => opt.setName('prezzo_totale').setDescription('Costo totale dell\'acquisto').setRequired(true)),
};

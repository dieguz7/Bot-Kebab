async execute(interaction, config, client) {
    // SOSTITUISCI '123456789012345678' con l'ID reale del tuo ruolo
    const roleId = '1498385283186429972'; 

    if (!interaction.member.roles.cache.has(roleId)) {
        return await interaction.reply({ 
            content: "❌ Non hai il permesso di emettere una fattura!", 
            ephemeral: true 
        });
    }
}
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('fattura')
        .setDescription('Crea una fattura commerciale')
        .addStringOption(option => 
            option.setName('oggetto')
                .setDescription('Cosa è stato venduto?')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('prezzo')
                .setDescription('Il costo totale (es. 500)')
                .setRequired(true)),

    async execute(interaction, config, client) {
        const oggetto = interaction.options.getString('oggetto');
        const prezzo = interaction.options.getInteger('prezzo');
        const venditore = interaction.user;

        const fatturaEmbed = new EmbedBuilder()
            .setTitle("📑 RICEVUTA DI VENDITA")
            .setColor("#f1c40f") // Giallo oro per differenziarla
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: "📦 Merce/Servizio", value: `${oggetto}`, inline: false },
                { name: "💰 Importo Totale", value: `€ ${prezzo.toLocaleString()}`, inline: true },
                { name: "✍️ Emessa da", value: `${venditore.username}`, inline: true }
            )
            .setFooter({ text: `Protocollo n. ${Math.floor(100000 + Math.random() * 900000)}` })
            .setTimestamp();

        await interaction.reply({ 
            embeds: [fatturaEmbed] 
        });
    },
};

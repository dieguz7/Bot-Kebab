import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

// In un mondo perfetto, questo valore verrebbe da un database
let fdc = 0; 

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('fondocassa')
        .setDescription('Visualizza il saldo attuale dell’azienda'),

    async execute(interaction) {
        // --- CONFIGURAZIONE RUOLI AUTORIZZATI ---
        // Inserisci i 3 ID dei ruoli tra le virgolette
        const ruoliAmmessi = [
            '1475490134467281070', 
            '1475489964664950905', 
            '1475490079819567256'
        ]; 

        // Controllo se l'utente ha almeno uno dei 3 ruoli autorizzati
        if (!interaction.member.roles.cache.some(role => ruoliAmmessi.includes(role.id))) {
            return await interaction.reply({ 
                content: "❌ Non hai i permessi necessari per visualizzare il fondo cassa aziendale.", 
                ephemeral: true 
            });
        }
        // --- FINE CONTROLLO ---

        // Recuperiamo il valore (per ora globale nel bot)
        const saldo = global.aziendaSaldo || 0;

        const embed = new EmbedBuilder()
            .setTitle("<a:soldi:1490701352148664360> Contabilità Aziendale")
            .setDescription(`Il saldo attuale del fondo cassa è:\n# <a:soldi:1490701352148664360> ${saldo.toLocaleString()}€`)
            .setColor(saldo >= 0 ? "#2ecc71" : "#e74c3c")
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};

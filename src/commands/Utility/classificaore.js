import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('classifica-ore')
        .setDescription('Mostra la classifica oraria settimanale dei dipendenti'),

    async execute(interaction, guildConfig, client) {
        // --- CONTROLLO RUOLO AUTORIZZATO ---
        const RUOLO_AUTORIZZATO = '1498387589709692958'; 
        if (!interaction.member.roles.cache.has(RUOLO_AUTORIZZATO)) {
            return await interaction.reply({ content: "❌ Non hai i permessi per vedere la classifica.", ephemeral: true });
        }

        const inv = global.oreTotali || {};
        
        // Convertiamo l'oggetto in un array e ordiniamolo dal più grande al più piccolo
        const listaOrdinata = Object.entries(inv)
            .filter(([_, minuti]) => minuti > 0) // Escludiamo chi ha 0 minuti
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Prendiamo solo la Top 10

        const embed = new EmbedBuilder()
            .setTitle("🏆 CLASSIFICA ORARIA SETTIMANALE")
            .setColor("#f1c40f")
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()
            .setFooter({ text: "Official Bot 🤖" });

        if (listaOrdinata.length === 0) {
            embed.setDescription("Non ci sono ancora dati memorizzati per questa settimana.");
        } else {
            let descrizioneClassifica = "";
            listaOrdinata.forEach(([userId, totaleMinuti], index) => {
                const h = Math.floor(totaleMinuti / 60);
                const m = totaleMinuti % 60;
                
                // Mettiamo i podi carini con le medaglie
                let medaglia = `**#${index + 1}**`;
                if (index === 0) medaglia = "🥇";
                if (index === 1) medaglia = "🥈";
                if (index === 2) medaglia = "🥉";

                descrizioneClassifica += `${medaglia} <@${userId}> — \`${h}h ${m}m\`\n`;
            });
            embed.setDescription(descrizioneClassifica);
        }

        return await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

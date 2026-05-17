import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('oreprecedenti')
        .setDescription('Mostra il resoconto completo delle ore fatte da tutti i dipendenti la settimana precedente'),

    async execute(interaction, guildConfig, client) {
        // --- 1. CONTROLLO RUOLO AUTORIZZATO ---
        // Sostituisci questo ID con l'ID del ruolo che può vedere lo storico (es. Direzione, Staff)
        const RUOLO_AUTORIZZATO = '1498387589709692958'; 

        if (!interaction.member.roles.cache.has(RUOLO_AUTORIZZATO)) {
            return await interaction.reply({ 
                content: "❌ Non hai i permessi necessari per consultare il registro della settimana precedente.", 
                ephemeral: true 
            });
        }

        const storico = global.oreSettimanaPrecedente || {};
        
        // Convertiamo l'oggetto dello storico in un array e filtriamo chi ha minuti > 0
        const listaDipendenti = Object.entries(storico)
            .filter(([_, minuti]) => minuti > 0)
            .sort((a, b) => b[1] - a[1]); // Opzionale: li ordina dal più attivo al meno attivo

        const embed = new EmbedBuilder()
            .setTitle("⏮️ RESOCONTO SETTIMANA PRECEDENTE")
            .setColor("#95a5a6") // Colore grigio per indicare dati storici
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()
            .setFooter({ text: "Official Bot 🤖", iconURL: client.user.displayAvatarURL() });

        if (listaDipendenti.length === 0) {
            embed.setDescription("Non ci sono dati archiviati o nessun dipendente ha lavorato nella settimana precedente.");
        } else {
            let resocontoTesto = "";
            
            listaDipendenti.forEach(([userId, totaleMinuti]) => {
                const h = Math.floor(totaleMinuti / 60);
                const m = totaleMinuti % 60;
                
                resocontoTesto += `• <@${userId}> — Ore svolte: \`${h}h ${m}m\`\n`;
            });

            embed.setDescription(resocontoTesto);
        }

        // --- 2. RISPOSTA PRIVATA ---
        // Visibile solo al membro dello staff che ha eseguito il comando
        return await interaction.reply({ 
            embeds: [embed], 
            ephemeral: true 
        });
    }
};

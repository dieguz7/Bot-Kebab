import { logger } from '../../utils/logger.js';
// Proviamo a importare il database se esiste
let db;
try {
    db = await import('../../utils/database.js');
} catch (e) {
    logger.error("Non è stato possibile caricare il database");
}

export default {
    name: 'cartellino',
    async execute(interaction, client) {
        const { customId, user, guildId } = interaction;
        const userId = user.id;
        const oraAttuale = Date.now();

        if (!client.cartellino) client.cartellino = new Map();

        if (customId === 'timbra') {
            if (client.cartellino.has(userId)) {
                return await interaction.reply({ content: "⚠️ Sei già in servizio!", ephemeral: true });
            }
            client.cartellino.set(userId, { inizio: oraAttuale });
            return await interaction.reply({ content: `🟢 **Turno iniziato** alle <t:${Math.floor(oraAttuale / 1000)}:t>!`, ephemeral: true });
        }

        if (customId === 'info_ore') {
            const turnoAttuale = client.cartellino.get(userId);
            
            // --- QUI RECUPERIAMO LE ORE REALI ---
            // Se non abbiamo ancora il database configurato, usiamo 0 invece di 12h 30m
            let totaleMinutiSettimana = 0; 
            
            // Se hai già una funzione nel DB per recuperare le ore, la useremo qui
            // Per ora lo impostiamo a 0 così non vedi più il dato finto
            
            let minutiSessione = 0;
            if (turnoAttuale) {
                minutiSessione = Math.floor((oraAttuale - turnoAttuale.inizio) / 60000);
            }

            const oreTotali = Math.floor((totaleMinutiSettimana + minutiSessione) / 60000); // Se hai i ms
            // Semplifichiamo la visualizzazione:
            const h = Math.floor(totaleMinutiSettimana / 60);
            const m = totaleMinutiSettimana % 60;

            let messaggio = `📊 **Statistiche Personali**\n`;
            messaggio += `━━━━━━━━━━━━━━━━━━\n`;
            messaggio += `📅 **Totale salvato:** \`${h}h ${m}m\`\n`;
            
            if (turnoAttuale) {
                messaggio += `⏱️ **In servizio da:** \`${minutiSessione} minuti\`\n`;
            } else {
                messaggio += `🔴 *Non sei in servizio.*`;
            }

            return await interaction.reply({ content: messaggio, ephemeral: true });
        }

        if (customId === 'stimbra') {
            const dati = client.cartellino.get(userId);
            if (!dati) return await interaction.reply({ content: "⚠️ Non sei in servizio!", ephemeral: true });

            const durataMs = oraAttuale - dati.inizio;
            const minutiFatti = Math.floor(durataMs / 60000);
            
            // TODO: Qui aggiungeremo la funzione db.saveWorkTime(userId, minutiFatti)
            
            client.cartellino.delete(userId);
            return await interaction.reply({ 
                content: `🔴 **Turno terminato!**\nHai lavorato per **${minutiFatti} minuti**.`, 
                ephemeral: true 
            });
        }
    }
};

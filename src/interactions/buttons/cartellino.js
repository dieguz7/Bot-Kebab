import { logger } from '../../utils/logger.js';
import { EmbedBuilder } from 'discord.js';

// Proviamo a importare il database se esiste
let db;
try {
    db = await import('../../utils/database.js');
} catch (e) {
    logger.error("Non è stato possibile caricare il database");
}

// Inizializziamo un registro globale per i totali se non esiste
if (!global.oreTotali) global.oreTotali = {}; 

export default {
    name: 'cartellino',
    async execute(interaction, client) {
        const { customId, user } = interaction;
        const userId = user.id;
        const oraAttuale = Date.now();

        // Mappa per chi è attualmente in servizio
        if (!client.cartellino) client.cartellino = new Map();

        // --- TASTO TIMBRA ---
        if (customId === 'timbra') {
            if (client.cartellino.has(userId)) {
                return await interaction.reply({ content: "⚠️ Sei già in servizio!", ephemeral: true });
            }
            client.cartellino.set(userId, { inizio: oraAttuale });
            return await interaction.reply({ 
                content: `🟢 **Turno iniziato** alle <t:${Math.floor(oraAttuale / 1000)}:t>! Buon lavoro.`, 
                ephemeral: true 
            });
        }

        // --- TASTO INFO ---
        if (customId === 'info_ore') {
            const turnoAttuale = client.cartellino.get(userId);
            
            // Recuperiamo i minuti salvati nel registro globale
            let minutiSalvati = global.oreTotali[userId] || 0;
            
            let minutiSessione = 0;
            if (turnoAttuale) {
                minutiSessione = Math.floor((oraAttuale - turnoAttuale.inizio) / 60000);
            }

            // Calcolo ore e minuti totali (Salvati + Sessione attuale)
            const totaleMinuti = minutiSalvati + minutiSessione;
            const h = Math.floor(totaleMinuti / 60);
            const m = totaleMinuti % 60;

            const embedInfo = new EmbedBuilder()
                .setTitle(`📊 Statistiche Personali: ${user.username}`)
                .setColor("#3498db")
                .addFields(
                    { name: "📅 Ore Totali Accumulate", value: `\`${h}h ${m}m\``, inline: false },
                    { name: "⏱️ Sessione in corso", value: turnoAttuale ? `\`${minutiSessione} minuti\`` : "🔴 *Non in servizio*", inline: true }
                )
                .setFooter({ text: "EMS - Registro Orari" })
                .setTimestamp();

            return await interaction.reply({ embeds: [embedInfo], ephemeral: true });
        }

        // --- TASTO STIMBRA ---
        if (customId === 'stimbra') {
            const dati = client.cartellino.get(userId);
            if (!dati) {
                return await interaction.reply({ content: "⚠️ Non sei in servizio! Timbra prima l'entrata.", ephemeral: true });
            }

            const durataMs = oraAttuale - dati.inizio;
            const minutiFatti = Math.floor(durataMs / 60000);
            
            // SALVATAGGIO: Sommiamo i minuti fatti al totale dell'utente
            if (!global.oreTotali[userId]) global.oreTotali[userId] = 0;
            global.oreTotali[userId] += minutiFatti;

            // Se il database è carico, salviamo anche lì (opzionale)
            if (db && db.saveWorkTime) {
                try {
                    await db.saveWorkTime(userId, minutiFatti);
                } catch (err) {
                    logger.error("Errore salvataggio DB:", err);
                }
            }
            
            client.cartellino.delete(userId);

            return await interaction.reply({ 
                content: `🔴 **Turno terminato!**\nHai lavorato per **${minutiFatti} minuti**.\nIl tuo totale aggiornato è di **${Math.floor(global.oreTotali[userId] / 60)}h ${global.oreTotali[userId] % 60}m**.`, 
                ephemeral: true 
            });
        }
    }
};

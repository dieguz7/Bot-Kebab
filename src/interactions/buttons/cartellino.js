export default {
    name: 'cartellino',
    async execute(interaction, client) {
        const { customId, user } = interaction;
        const userId = user.id;
        const oraAttuale = Date.now();

        // Inizializziamo la memoria locale per il turno in corso
        if (!client.cartellino) client.cartellino = new Map();

        if (customId === 'timbra') {
            if (client.cartellino.has(userId)) {
                return await interaction.reply({ content: "⚠️ Sei già in servizio!", ephemeral: true });
            }
            client.cartellino.set(userId, { inizio: oraAttuale });
            return await interaction.reply({ content: `🟢 **Turno iniziato** alle <t:${Math.floor(oraAttuale / 1000)}:t>. Buon lavoro!`, ephemeral: true });
        }

        if (customId === 'info_ore') {
            const turnoAttuale = client.cartellino.get(userId);
            let minutiOggi = 0;

            if (turnoAttuale) {
                const durataMs = oraAttuale - turnoAttuale.inizio;
                minutiOggi = Math.floor(durataMs / 60000);
            }

            // QUI ANDREBBE LA QUERY AL DATABASE POSTGRES
            // Per ora simuliamo un totale settimanale (es. 12 ore e 30 min)
            // In futuro qui leggeremo i dati salvati su Postgres
            const oreSettimanali = 12; 
            const minutiSettimanali = 30;

            let messaggio = `📊 **Statistiche Ore Settimanali**\n`;
            messaggio += `━━━━━━━━━━━━━━━━━━\n`;
            messaggio += `📅 **Totale settimana:** \`${oreSettimanali}h ${minutiSettimanali}m\`\n`;
            
            if (turnoAttuale) {
                messaggio += `⏱️ **Turno in corso:** \`${minutiOggi} minuti\`\n`;
            } else {
                messaggio += `🔴 *Al momento non sei in servizio.*`;
            }

            return await interaction.reply({ content: messaggio, ephemeral: true });
        }

        if (customId === 'stimbra') {
            const dati = client.cartellino.get(userId);
            if (!dati) return await interaction.reply({ content: "⚠️ Non sei in servizio!", ephemeral: true });

            const durataMs = oraAttuale - dati.inizio;
            const minutiFatti = Math.floor(durataMs / 60000);
            
            // TODO: Salvare i minutiFatti su Postgres qui!
            
            client.cartellino.delete(userId);
            return await interaction.reply({ 
                content: `🔴 **Turno terminato!**\nHai aggiunto **${minutiFatti} minuti** al tuo totale settimanale.`, 
                ephemeral: true 
            });
        }
    }
};

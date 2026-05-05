export default {
    name: 'cartellino',
    async execute(interaction, client) {
        const { customId, user } = interaction;
        
        // Memoria temporanea del bot
        if (!client.cartellino) client.cartellino = new Map();
        
        const userId = user.id;
        const oraAttuale = Date.now();

        if (customId === 'timbra') {
            if (client.cartellino.has(userId)) {
                return await interaction.reply({ content: "⚠️ Risulti già in servizio!", ephemeral: true });
            }
            client.cartellino.set(userId, { inizio: oraAttuale });
            return await interaction.reply({ content: `🟢 **Turno iniziato** alle <t:${Math.floor(oraAttuale / 1000)}:t>!`, ephemeral: true });
        }

        if (customId === 'stimbra') {
            const dati = client.cartellino.get(userId);
            if (!dati) {
                return await interaction.reply({ content: "⚠️ Non sei in servizio!", ephemeral: true });
            }
            
            const durataMs = oraAttuale - dati.inizio;
            const ore = Math.floor(durataMs / 3600000);
            const minuti = Math.floor((durataMs % 3600000) / 60000);
            
            client.cartellino.delete(userId);
            
            return await interaction.reply({ 
                content: `🔴 **Turno terminato!**\nHai lavorato per: **${ore} ore e ${minuti} minuti**.`, 
                ephemeral: true 
            });
        }

        if (customId === 'info_ore') {
            const dati = client.cartellino.get(userId);
            if (!dati) {
                return await interaction.reply({ content: "ℹ️ Non sei in servizio al momento.", ephemeral: true });
            }
            const durataMs = oraAttuale - dati.inizio;
            const minuti = Math.floor(durataMs / 60000);
            return await interaction.reply({ content: `ℹ️ Sei in servizio da **${minuti} minuti**.`, ephemeral: true });
        }
    }
};

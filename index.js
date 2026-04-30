import './src/app.js';

// Database temporaneo (Scomparirà al riavvio, per ora usiamo questo)
const dutyData = new Map(); // ID -> { startTime, weeklyMinutes }

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const userId = interaction.user.id;
    const now = Date.now();
    const data = dutyData.get(userId) || { startTime: null, weeklyMinutes: 0 };

    if (interaction.customId === 'work_on') {
        if (data.startTime) return interaction.reply({ content: "❌ Hai già timbrato!", ephemeral: true });
        
        data.startTime = now;
        dutyData.set(userId, data);
        await interaction.reply({ content: "✅ Turno iniziato! Buon lavoro.", ephemeral: true });

    } else if (interaction.customId === 'work_off') {
        if (!data.startTime) return interaction.reply({ content: "❌ Non hai ancora timbrato!", ephemeral: true });

        const diffMs = now - data.startTime;
        const minutesEarned = Math.floor(diffMs / 60000);
        
        data.weeklyMinutes += minutesEarned;
        data.startTime = null;
        dutyData.set(userId, data);

        await interaction.reply({ 
            content: `🏁 Turno finito! Hai lavorato per **${minutesEarned} minuti**.`, 
            ephemeral: true 
        });

    } else if (interaction.customId === 'work_info') {
        const ore = Math.floor(data.weeklyMinutes / 60);
        const min = data.weeklyMinutes % 60;
        await interaction.reply({ 
            content: `📊 Questa settimana hai accumulato: **${ore} ore e ${min} minuti**.`, 
            ephemeral: true 
        });

    } else if (interaction.customId === 'work_list') {
        const inServizio = [];
        dutyData.forEach((val, id) => {
            if (val.startTime) inServizio.push(`<@${id}>`);
        });

        const lista = inServizio.length > 0 ? inServizio.join('\n') : "Nessuno in servizio.";
        await interaction.reply({ 
            content: `👥 **Persone in servizio ora:**\n${lista}`, 
            ephemeral: true 
        });
    }
});

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



client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    // --- LOGICA APERTURA TICKET ---
    if (interaction.customId === 'open_ticket') {
        const guild = interaction.guild;
        const userId = interaction.user.id;

        // Controlla se esiste già un canale per questo utente
        const existingTicket = guild.channels.cache.find(c => c.name === `ticket-${interaction.user.username.toLowerCase()}`);
        if (existingTicket) {
            return interaction.reply({ content: "❌ Hai già un ticket aperto!", ephemeral: true });
        }

        // Crea il canale del ticket
        const ticketChannel = await guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: 0, // Canale testuale
            permissionOverwrites: [
                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] }, // Nascondi a tutti
                { id: userId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }, // Mostra all'utente
                // AGGIUNGI QUI L'ID DEL RUOLO STAFF SE VUOI CHE LO VEDANO
                // { id: 'ID_RUOLO_STAFF', allow: [PermissionFlagsBits.ViewChannel] }
            ],
        });

        const embedTicket = new EmbedBuilder()
            .setTitle("🎫 Ticket Aperto")
            .setDescription(`Ciao <@${userId}>, descrivi qui il tuo problema.\nLo staff ti aiuterà a breve.`)
            .setColor("#2ecc71");

        const closeRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('Chiudi Ticket')
                .setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ embeds: [embedTicket], components: [closeRow] });
        await interaction.reply({ content: `✅ Ticket creato! Vai qui: ${ticketChannel}`, ephemeral: true });
    }

    // --- LOGICA CHIUSURA TICKET ---
    if (interaction.customId === 'close_ticket') {
        await interaction.reply("🔒 Il ticket verrà chiuso tra 5 secondi...");
        setTimeout(() => {
            interaction.channel.delete().catch(() => {});
        }, 5000);
    }
});

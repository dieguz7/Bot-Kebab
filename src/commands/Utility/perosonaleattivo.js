import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('personaleattivo')
        .setDescription('Mostra privatamente la lista del personale attualmente in servizio'),

    async execute(interaction, guildConfig, client) {
        
        // --- 1. CONTROLLO RUOLO AUTORIZZATO ---
        // Sostituisci questo ID con l'ID del ruolo che può usare il comando (es. Direzione, Capo, Staff)
        const RUOLO_AUTORIZZATO = '1498385283186429972'; 

        if (!interaction.member.roles.cache.has(RUOLO_AUTORIZZATO)) {
            return await interaction.reply({ 
                content: "❌ Non hai i permessi necessari per utilizzare questo comando.", 
                ephemeral: true // Solo l'utente vede l'errore
            });
        }

        // --- 2. CONTROLLO SE C'È QUALCUNO IN TURN0 ---
        if (!client.cartellino || client.cartellino.size === 0) {
            return await interaction.reply({ 
                content: "🔴 Al momento non c'è nessun kebabbaro in servizio.", 
                ephemeral: true // Solo l'utente vede il messaggio vuoto
            });
        }

        // --- 3. COSTRUZIONE EMBED ---
        const embed = new EmbedBuilder()
            .setTitle("🟢 PERSONALE ATTUALMENTE IN SERVIZIO")
            .setColor("#2ecc71")
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()
            .setFooter({ text: "Kebabbaro - Monitoraggio Turni", iconURL: client.user.displayAvatarURL() });

        let listaPersonale = "";

        // Prendiamo i dati in tempo reale da chi ha timbrato
        client.cartellino.forEach((dati, userId) => {
            const oraInizio = Math.floor(dati.inizio / 1000);
            listaPersonale += `• <@${userId}> — In servizio dalle <t:${oraInizio}:t> (<t:${oraInizio}:R>)\n`;
        });

        embed.setDescription(listaPersonale);

        // --- 4. RISPOSTA PRIVATA (EPHEMERAL) ---
        // Grazie a 'ephemeral: true', l'embed spunterà solo a chi ha lanciato il comando
        return await interaction.reply({ 
            embeds: [embed], 
            ephemeral: true 
        });
    }
};

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { logger } from '../../utils/logger.js';

// Proviamo a importare il database se esiste
let db;
try {
    db = await import('../../utils/database.js');
} catch (e) {
    // Gestito silenziosamente
}

export default {
    data: new SlashCommandBuilder()
        .setName('stimbratura-forzata')
        .setDescription('Forza la chiusura del cartellino di un dipendente')
        .addUserOption(option =>
            option.setName('utente')
                .setDescription('Il dipendente da s-timbrare forzatamente')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('salva_turno')
                .setDescription('Scegli se salvare i minuti accumulati in questa sessione')
                .setRequired(true)
                .addChoices(
                    { name: 'Si', value: 'si' },
                    { name: 'No', value: 'no' }
                )
        ),

    async execute(interaction, guildConfig, client) {
        // --- CONTROLLO RUOLO AUTORIZZATO ---
        const RUOLO_AUTORIZZATO = '1475489565430251542'; 

        if (!interaction.member.roles.cache.has(RUOLO_AUTORIZZATO)) {
            return await interaction.reply({ 
                content: "❌ Non hai i permessi necessari per utilizzare la stimbratura forzata.", 
                ephemeral: true 
            });
        }

        const utenteTarget = interaction.options.getUser('utente');
        const sceltaSalva = interaction.options.getString('salva_turno');
        const salvaTurno = (sceltaSalva === 'si'); // Diventa true se seleziona 'si'
        const oraAttuale = Date.now();

        if (!client.cartellino) client.cartellino = new Map();

        // --- CONTROLLO SE L'UTENTE È IN SERVIZIO ---
        if (!client.cartellino.has(utenteTarget.id)) {
            return await interaction.reply({
                content: `❌ ${utenteTarget} non risulta attualmente in servizio nel sistema cartellini.`,
                ephemeral: true
            });
        }

        // Recuperiamo i dati della sessione
        const datiTurno = client.cartellino.get(utenteTarget.id);
        const durataMs = oraAttuale - datiTurno.inizio;
        const minutiFatti = Math.floor(durataMs / 60000);

        if (!global.oreTotali) global.oreTotali = {};

        if (salvaTurno) {
            if (!global.oreTotali[utenteTarget.id]) global.oreTotali[utenteTarget.id] = 0;
            global.oreTotali[utenteTarget.id] += minutiFatti;

            if (db && db.saveWorkTime) {
                try {
                    await db.saveWorkTime(utenteTarget.id, minutiFatti);
                } catch (err) {
                    logger.error("Errore salvataggio DB forzato:", err);
                }
            }
        }

        // Rimuoviamo il dipendente dalla mappa dei presenti
        client.cartellino.delete(utenteTarget.id);

        // --- RISPOSTA PRIVATA A CHI FA IL COMANDO ---
        const embedRisposta = new EmbedBuilder()
            .setTitle("⚠️ STIMBRATURA FORZATA ESEGUITA")
            .setColor(salvaTurno ? "#e67e22" : "#c0392b")
            .setDescription(`Il cartellino di ${utenteTarget} è stato chiuso forzatamente.`)
            .addFields(
                { name: "👷 Dipendente coinvolto:", value: `${utenteTarget}`, inline: true },
                { name: "💾 Turno Salvato?", value: salvaTurno ? `✅ **SÌ** (+${minutiFatti} min)` : "❌ **NO** (Minuti azzerati)", inline: true }
            )
            .setTimestamp()
            .setFooter({ text: "Official Bot 🤖" });

        await interaction.reply({ embeds: [embedRisposta], ephemeral: true });

        // --- INVIO LOG NEL CANALE CARTELLINI ---
        const ID_CANALE_LOG_CARTELLINO = '1489677648870379611'; 
        const logChannel = interaction.guild.channels.cache.get(ID_CANALE_LOG_CARTELLINO);

        if (logChannel) {
            const hTot = Math.floor((global.oreTotali[utenteTarget.id] || 0) / 60);
            const mTot = (global.oreTotali[utenteTarget.id] || 0) % 60;

            const embedLogChannel = new EmbedBuilder()
                .setTitle("🚨 STIMBRATURA FORZATA AMMINISTRATIVA")
                .setColor("#d35400")
                .setThumbnail(utenteTarget.displayAvatarURL())
                .setDescription(`È stata eseguita una chiusura forzata del turno per il dipendente ${utenteTarget}.`)
                .addFields(
                    { name: "👤 Chiuso da:", value: `${interaction.user}`, inline: true },
                    { name: "⏱️ Durata sessione:", value: `\`${minutiFatti} minuti\``, inline: true },
                    { name: "⚖️ Esito Salvataggio:", value: salvaTurno ? "✅ I minuti di questa sessione sono stati **inseriti** nel totale." : "❌ I minuti di questa sessione sono stati **scartati**.", inline: false },
                    { name: "📅 Nuovo Totale Settimanale:", value: `\`${hTot}h ${mTot}m\``, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: "Sistema Controllo Direzione EMS" });

            await logChannel.send({ embeds: [embedLogChannel] });
        }
    }
};

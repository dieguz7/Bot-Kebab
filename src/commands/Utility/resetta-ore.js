import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('resetta-ore')
        .setDescription('Programma il reset automatico delle ore per un giorno e orario specifici')
        .addIntegerOption(option =>
            option.setName('giorno')
                .setDescription('Seleziona il giorno in cui effettuare il reset')
                .setRequired(true)
                .addChoices(
                    { name: 'Lunedì', value: 1 },
                    { name: 'Martedì', value: 2 },
                    { name: 'Mercoledì', value: 3 },
                    { name: 'Giovedì', value: 4 },
                    { name: 'Venerdì', value: 5 },
                    { name: 'Sabato', value: 6 },
                    { name: 'Domenica', value: 7 }
                )
        )
        .addStringOption(option =>
            option.setName('orario')
                .setDescription('Inserisci l\'orario nel formato HH:MM (es. 23:59 o 06:00)')
                .setRequired(true)
        ),

    async execute(interaction, guildConfig, client) {
        // --- CONTROLLO RUOLO AUTORIZZATO ---
        const RUOLO_AUTORIZZATO = '1507825355073916960'; 
        if (!interaction.member.roles.cache.has(RUOLO_AUTORIZZATO)) {
            return await interaction.reply({ content: "❌ Non hai i permessi per usare questo comando.", ephemeral: true });
        }

        const giornoScelto = interaction.options.getInteger('giorno');
        const orarioScelto = interaction.options.getString('orario');

        // Validazione dell'orario tramite Regex (controlla che sia scritto come HH:MM)
        const regexOrario = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!regexOrario.test(orarioScelto)) {
            return await interaction.reply({ content: "❌ Formato orario non valido! Usa il formato `HH:MM` (es. `23:59` o `08:30`).", ephemeral: true });
        }

        const [ore, minuti] = orarioScelto.split(':').map(Number);

        // Calcoliamo il momento esatto del reset
        const oraAttuale = new Date();
        let dataTarget = new Date();
        
        dataTarget.setHours(ore, minuti, 0, 0);

        // Trova il prossimo giorno della settimana richiesto
        // In JS 0 è Domenica, 1 è Lunedì... 6 è Sabato. Convertiamo il nostro sistema (1-7) in quello di JS
        const targetDayJS = giornoScelto === 7 ? 0 : giornoScelto;
        let giorniDiDifferenza = targetDayJS - oraAttuale.getDay();

        if (giorniDiDifferenza < 0 || (giorniDiDifferenza === 0 && oraAttuale > dataTarget)) {
            giorniDiDifferenza += 7; // Se il momento è già passato per questa settimana, passa alla prossima
        }
        
        dataTarget.setDate(dataTarget.getDate() + giorniDiDifferenza);

        const tempoMancanteMs = dataTarget.getTime() - oraAttuale.getTime();
        const timestampDiscord = Math.floor(dataTarget.getTime() / 1000);

        // --- AVVIO DEL TIMER AUTOMATICO ---
        // Se c'era già un vecchio reset programmato in memoria, lo cancelliamo per evitare doppioni
        if (global.timerResetCorrente) clearTimeout(global.timerResetCorrente);

        global.timerResetCorrente = setTimeout(async () => {
            try {
                if (!global.oreTotali) global.oreTotali = {};
                
                // Spostiamo i dati
                global.oreSettimanaPrecedente = { ...global.oreTotali };
                global.oreTotali = {};

                // Invio log nel canale
                const ID_CANALE_LOG_CARTELLINO = '1467204625353543851'; 
                const logChannel = interaction.guild.channels.cache.get(ID_CANALE_LOG_CARTELLINO);

                if (logChannel) {
                    const embedReset = new EmbedBuilder()
                        .setTitle("🚨 ARCHIVIAZIONE E RESET AUTOMATICO ESEGUITO")
                        .setColor("#9b59b6")
                        .setDescription("Il sistema ha eseguito il reset automatico precedentemente pianificato tramite comando.")
                        .addFields(
                            { name: "📋 Esito:", value: "I dati sono stati spostati con successo nella **settimana precedente**.", inline: false },
                            { name: "🧹 Registro Attuale:", value: "Tutti i contatori sono stati azzerati.", inline: false }
                        )
                        .setTimestamp();

                    await logChannel.send({ embeds: [embedReset] });
                }
            } catch (err) {
                console.error("Errore durante l'esecuzione del timer di reset:", err);
            }
        }, tempoMancanteMs);

        // Risposta di conferma per te
        const giorniNomi = ['', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
        const embedConferma = new EmbedBuilder()
            .setTitle("⏳ RESET PROGRAMMATO")
            .setColor("#f1c40f")
            .setDescription(`Il reset automatico delle ore è stato programmato con successo.`)
            .addFields(
                { name: "📅 Giorno stabilito:", value: giorniNomi[giornoScelto], inline: true },
                { name: "⏰ Orario stabilito:", value: `\`${orarioScelto}\``, inline: true },
                { name: "🚀 Prossimo reset:", value: `Il sistema si resetterà in automatico il <t:${timestampDiscord}:F> (<t:${timestampDiscord}:R>).`, inline: false }
            )
            .setTimestamp();

        return await interaction.reply({ embeds: [embedConferma], ephemeral: true });
    }
};

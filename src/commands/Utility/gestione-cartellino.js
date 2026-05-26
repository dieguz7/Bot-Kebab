import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('gestione-cartellino')
        .setDescription('Aggiunge o rimuove manualmente ore/minuti dal cartellino di un dipendente')
        .addUserOption(option =>
            option.setName('utente')
                .setDescription('Il dipendente a cui modificare il cartellino')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('operazione')
                .setDescription('Scegli se aggiungere o rimuovere il tempo')
                .setRequired(true)
                .addChoices(
                    { name: '➕️ Aggiungi Tempo', value: 'aggiungi' },
                    { name: '➖️ Rimuovi Tempo', value: 'rimuovi' }
                )
        )
        .addStringOption(option =>
            option.setName('tempo')
                .setDescription('Inserisci il tempo (es. 1h 26m)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('motivazione')
                .setDescription('La motivazione di questa modifica manuale')
                .setRequired(true)
        ),

    async execute(interaction, guildConfig, client) {
        // --- 1. CONTROLLO RUOLO AUTORIZZATO ---
        const RUOLO_AUTORIZZATO = '1475489565430251542'; 

        if (!interaction.member.roles.cache.has(RUOLO_AUTORIZZATO)) {
            return await interaction.reply({ 
                content: "❌ Non hai i permessi necessari per utilizzare questo comando di gestione.", 
                ephemeral: true 
            });
        }

        const utenteTarget = interaction.options.getUser('utente');
        const operazione = interaction.options.getString('operazione');
        const tempoInput = interaction.options.getString('tempo').toLowerCase().trim();
        const motivazione = interaction.options.getString('motivazione');

        // --- 2. PARSING INTELLIGENTE DEL TEMPO (es. 1h 26m, 45m, 2h) ---
        let ore = 0;
        let minuti = 0;

        // Regex per estrarre ore e minuti
        const regexOre = /(\d+)\s*h/;
        const regexMinuti = /(\d+)\s*m/;

        const matchOre = tempoInput.match(regexOre);
        const matchMinuti = tempoInput.match(regexMinuti);

        if (matchOre) ore = parseInt(matchOre[1], 10);
        if (matchMinuti) minuti = parseInt(matchMinuti[1], 10);

        const minutiTotaliDaModificare = (ore * 60) + minuti;

        // Se l'input scritto non ha prodotto nessun minuto o è scritto male
        if (minutiTotaliDaModificare <= 0) {
            return await interaction.reply({
                content: "❌ Formato del tempo non valido. Scrivi ad esempio: `1h 26m`, `2h`, `45m` o `1h30m`.",
                ephemeral: true
            });
        }

        // Inizializziamo la struttura se vuota
        if (!global.oreTotali) global.oreTotali = {};
        if (!global.oreTotali[utenteTarget.id]) global.oreTotali[utenteTarget.id] = 0;

        const orePrecedentiUtente = global.oreTotali[utenteTarget.id];

        // --- 3. APPLICAZIONE DELLA MODIFICA ---
        if (operazione === 'aggiungi') {
            global.oreTotali[utenteTarget.id] += minutiTotaliDaModificare;
        } else if (operazione === 'rimuovi') {
            global.oreTotali[utenteTarget.id] -= minutiTotaliDaModificare;
            // Evitiamo che le ore vadano sotto zero
            if (global.oreTotali[utenteTarget.id] < 0) global.oreTotali[utenteTarget.id] = 0;
        }

        const nuovoTotaleMinuti = global.oreTotali[utenteTarget.id];
        const hNuove = Math.floor(nuovoTotaleMinuti / 60);
        const mNuove = nuovoTotaleMinuti % 60;

        // --- 4. EMBED DI RISPOSTA (EPHEMERAL) ---
        const embedRisposta = new EmbedBuilder()
            .setTitle("⚙️ MODIFICA MANUALMENTE EFFETTUATA")
            .setColor(operazione === 'aggiungi' ? "#2ecc71" : "#e74c3c")
            .setDescription(`Il registro ore di ${utenteTarget} è stato modificato con successo.`)
            .addFields(
                { name: "👷 Dipendente:", value: `${utenteTarget}`, inline: true },
                { name: "📊 Operazione:", value: operazione === 'aggiungi' ? "🟢 Aggiunta" : "🔴 Rimozione", inline: true },
                { name: "⏱️ Entità Modifica:", value: `\`${ore}h ${minuti}m\` (${minutiTotaliDaModificare} min)`, inline: true },
                { name: "📅 Nuovo Totale:", value: `\`${hNuove}h ${mNuove}m\``, inline: true },
                { name: "📝 Motivazione:", value: motivazione, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: "Official Bot ✅️" });

        await interaction.reply({ embeds: [embedRisposta], ephemeral: true });

        // --- 5. INVIA IL LOG NEL CANALE CARTELLINI ---
        const ID_CANALE_LOG_CARTELLINO = '1489677648870379611'; 
        const logChannel = interaction.guild.channels.cache.get(ID_CANALE_LOG_CARTELLINO);

        if (logChannel) {
            const hVecchie = Math.floor(orePrecedentiUtente / 60);
            const mVecchie = orePrecedentiUtente % 60;

            const embedLog = new EmbedBuilder()
                .setTitle("🛠️ MODIFICA AMMINISTRATIVA REQUISITI ORARI")
                .setColor("#f39c12")
                .setThumbnail(utenteTarget.displayAvatarURL())
                .setDescription(`L'amministratore ${interaction.user} ha alterato manualmente le ore di un dipendente.`)
                .addFields(
                    { name: "👤 Autore Modifica:", value: `${interaction.user}`, inline: true },
                    { name: "👷 Dipendente:", value: `${utenteTarget}`, inline: true },
                    { name: "📈 Tipo Modifica:", value: operazione === 'aggiungi' ? `🟢 Inserimento di **${ore}h ${minuti}m**` : `🔴 Detrazione di **${ore}h ${minuti}m**`, inline: false },
                    { name: "📉 Storico Precedente:", value: `\`${hVecchie}h ${mVecchie}m\``, inline: true },
                    { name: "📅 Registro Aggiornato:", value: `\`${hNuove}h ${mNuove}m\``, inline: true },
                    { name: "ℹ️ Giustificativo / Nota:", value: `*${motivazione}*`, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: "Sistema Controllo Direzione EMS" });

            await logChannel.send({ embeds: [embedLog] });
        }
    }
};

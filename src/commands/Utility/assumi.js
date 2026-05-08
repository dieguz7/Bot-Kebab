import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, AttachmentBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('assumi')
        .setDescription('Assume un utente e invia lo screen nel canale dedicato')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addUserOption(option => 
            option.setName('utente')
                .setDescription('L’utente da assumere')
                .setRequired(true)),

    async execute(interaction) {
        // --- CONFIGURAZIONE ---
        const ID_CANALE_DESTINAZIONE = '1475551627456020572'; 
        const ruoliDaAssegnare = [
            '1475492243883429920', 
            '1498385283186429972'
        ];

        // URL dell'immagine che vuoi mostrare (Sostituisci questo link con il tuo)
        const urlImmagineScreen = 'https://i.imgur.com/vostro-link-immagine.png';

        const target = interaction.options.getMember('utente');
        if (!target) return interaction.reply({ content: "❌ Utente non trovato.", ephemeral: true });

        try {
            // 1. Assegnazione ruoli
            await target.roles.add(ruoliDaAssegnare);

            // 2. Creazione dello Screen (Embed + Immagine)
            const embedAssunzione = new EmbedBuilder()
                .setTitle("📑 NUOVA ASSUNZIONE EFFETTUATA")
                .setColor("#2ecc71")
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: "👤 Utente Assunto", value: `${target}`, inline: true },
                    { name: "✍️ Responsabile", value: `${interaction.user}`, inline: true },
                    { name: "💼 Ruoli Assegnati", value: ruoliDaAssegnare.map(id => `<@&${id}>`).join(', '), inline: false },
                    { name: "📅 Data", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                )
                // Questa riga aggiunge l'immagine grande sotto il testo (lo "screen")
                .setImage(urlImmagineScreen) 
                .setFooter({ text: "Sistema Gestione HR", iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            const targetChannel = interaction.guild.channels.cache.get(ID_CANALE_DESTINAZIONE);
            
            if (!targetChannel) {
                return interaction.reply({ content: "❌ Canale non trovato.", ephemeral: true });
            }

            // Invio al canale specifico
            await targetChannel.send({ 
                content: `🎊 Benvenuto in squadra ${target}!`, 
                embeds: [embedAssunzione] 
            });

            // Conferma per te
            await interaction.reply({ content: `✅ Assunzione inviata in ${targetChannel}.`, ephemeral: true });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "❌ Errore durante l'esecuzione.", ephemeral: true });
        }
    },
};

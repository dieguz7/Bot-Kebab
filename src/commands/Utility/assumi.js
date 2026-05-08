import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('assumi')
        .setDescription('Assume un utente e invia lo screen nel canale dedicato')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addUserOption(option => 
            option.setName('utente')
                .setDescription('L’utente da assumere')
                .setRequired(true))
        .addAttachmentOption(option => 
            option.setName('screen')
                .setDescription('Allega lo screenshot dell’assunzione')
                .setRequired(true)),

    async execute(interaction, config, client) {
        // --- CONFIGURAZIONE ---
        const ID_CANALE_DESTINAZIONE = '1475551627456020572'; 
        const ruoliDaAssegnare = [
            '1475492243883429920', 
            '1498385283186429972'
        ];

        const target = interaction.options.getMember('utente');
        const screenshot = interaction.options.getAttachment('screen');
        
        if (!target) return interaction.reply({ content: "❌ Utente non trovato.", ephemeral: true });

        try {
            // 1. Assegna i ruoli standard
            await target.roles.add(ruoliDaAssegnare);

            // 2. Crea l'Embed con la struttura richiesta
            const embedAssunzione = new EmbedBuilder()
                .setTitle("📑 NUOVA ASSUNZIONE")
                .setColor("#2ecc71")
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: "👤 Assunto da:", value: `${interaction.user}`, inline: true },
                    { name: "🤝 Assunto:", value: `${target}`, inline: true },
                    { name: "💼 Tipo:", value: ruoliDaAssegnare.map(id => `<@&${id}>`).join(', '), inline: false },
                    { name: "📅 Data:", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
                    { name: "📸 Screen:", value: "Vedi immagine allegata qui sotto", inline: false }
                )
                .setImage(screenshot.url) // Mostra lo screenshot caricato
                .setFooter({ 
                    text: `Official Bot 🤖`, 
                    iconURL: client.user.displayAvatarURL() // Mette l'emoji/foto del bot nel footer
                })
                .setTimestamp();

            // 3. Cerca il canale e invia
            const targetChannel = interaction.guild.channels.cache.get(ID_CANALE_DESTINAZIONE);
            
            if (!targetChannel) {
                return interaction.reply({ content: "❌ Canale di destinazione non trovato.", ephemeral: true });
            }

            await targetChannel.send({ content: `🎊 Benvenuto in squadra ${target}!`, embeds: [embedAssunzione] });

            // 4. Conferma privata
            await interaction.reply({ content: `✅ Assunzione completata e inviata in ${targetChannel}.`, ephemeral: true });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "❌ Errore durante l'assunzione. Verifica i permessi.", ephemeral: true });
        }
    },
};

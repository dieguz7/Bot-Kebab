import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('assumi')
        .setDescription('Assume un utente, assegna ruoli e invia lo screen nel canale dedicato')
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

        const target = interaction.options.getMember('utente');
        if (!target) return interaction.reply({ content: "❌ Utente non trovato.", ephemeral: true });

        try {
            // 1. Assegna i ruoli standard
            await target.roles.add(ruoliDaAssegnare);

            // 2. CREA LO SCREEN (Embed dettagliato)
            const embedAssunzione = new EmbedBuilder()
                .setTitle("📑 NUOVA ASSUNZIONE EFFETTUATA")
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .setColor("#2ecc71")
                .setDescription(`È stata formalizzata l'assunzione di un nuovo membro.`)
                .addFields(
                    { name: "👤 Utente Assunto", value: `${target}`, inline: true },
                    { name: "✍️ Responsabile", value: `${interaction.user}`, inline: true },
                    { name: "💼 Ruoli Assegnati", value: ruoliDaAssegnare.map(id => `<@&${id}>`).join(', '), inline: false },
                    { name: "📅 Data", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                )
                .setFooter({ text: "Sistema Risorse Umane", iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            // 3. Cerca il canale specifico e invia il messaggio
            const targetChannel = interaction.guild.channels.cache.get(ID_CANALE_DESTINAZIONE);
            
            if (!targetChannel) {
                return interaction.reply({ 
                    content: "❌ Errore: Il canale di destinazione non è stato trovato. Verifica l'ID!", 
                    ephemeral: true 
                });
            }

            // Invia lo screen nel canale specifico
            await targetChannel.send({ content: `🎊 Benvenuto in squadra ${target}!`, embeds: [embedAssunzione] });

            // 4. Risposta di conferma a chi ha fatto il comando (visibile solo a lui)
            await interaction.reply({ 
                content: `✅ Assunzione di ${target} completata con successo! Lo screen è stato inviato in ${targetChannel}.`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error(error);
            return interaction.reply({ 
                content: "❌ Errore durante l'assunzione. Controlla la gerarchia dei ruoli del bot.", 
                ephemeral: true 
            });
        }
    },
};

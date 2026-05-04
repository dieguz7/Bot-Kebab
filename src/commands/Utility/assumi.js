import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('assumi')
        .setDescription('Assumi un utente con prova d’acquisto/contratto')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => 
            option.setName('utente').setDescription('L’utente da assumere').setRequired(true))
        .addRoleOption(option => 
            option.setName('ruolo').setDescription('Il ruolo da assegnare').setRequired(true))
        .addAttachmentOption(option => 
            option.setName('screenshot').setDescription('Allega lo screenshot').setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getMember('utente');
        const ruolo = interaction.options.getRole('ruolo');
        const screenshot = interaction.options.getAttachment('screenshot');

        // --- CONFIGURAZIONE LOG ---
        // Sostituisci questo numero con l'ID del tuo canale log
        const LOG_CHANNEL_ID = '1500732066046935061'; 
        // --------------------------

        if (!target) return interaction.reply({ content: "❌ Utente non trovato.", ephemeral: true });
        if (!screenshot.contentType?.startsWith('image/')) {
            return interaction.reply({ content: "❌ Allega un'immagine valida.", ephemeral: true });
        }

        try {
            await target.roles.add(ruolo);

            const embed = new EmbedBuilder()
                .setTitle("✅ Nuova Assunzione")
                .setColor("#2ecc71")
                .addFields(
                    { name: "👤 Dipendente", value: `${target}`, inline: true },
                    { name: "💼 Ruolo", value: `${ruolo.name}`, inline: true },
                    { name: "✍️ Responsabile", value: `${interaction.user}`, inline: true }
                )
                .setImage(screenshot.url)
                .setTimestamp();

            // 1. Risponde a te che hai usato il comando (visibile solo a te)
            await interaction.reply({ content: "✅ Operazione completata e log inviato!", ephemeral: true });

            // 2. Invia il log nel canale specifico
            const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Errore durante l'assunzione.", ephemeral: true });
        }
    },
};

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('assumi')
        .setDescription('Assumi un utente con prova d’acquisto/contratto')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => 
            option.setName('utente')
                .setDescription('L’utente da assumere')
                .setRequired(true))
        .addRoleOption(option => 
            option.setName('ruolo')
                .setDescription('Il ruolo da assegnare')
                .setRequired(true))
        .addAttachmentOption(option => 
            option.setName('screenshot')
                .setDescription('Allega lo screenshot del pagamento o del contratto')
                .setRequired(true)), // Lo screenshot è obbligatorio

    async execute(interaction) {
        const target = interaction.options.getMember('utente');
        const ruolo = interaction.options.getRole('ruolo');
        const screenshot = interaction.options.getAttachment('screenshot');

        if (!target) return interaction.reply({ content: "❌ Utente non trovato.", ephemeral: true });

        // Verifichiamo che l'allegato sia effettivamente un'immagine
        if (!screenshot.contentType?.startsWith('image/')) {
            return interaction.reply({ content: "❌ Per favore, allega un file immagine valido (PNG/JPG).", ephemeral: true });
        }

        try {
            await target.roles.add(ruolo);

            // Creiamo un Embed elegante che mostri anche lo screenshot
            const embed = new EmbedBuilder()
                .setTitle("✅ Nuova Assunzione Completata")
                .setColor("#2ecc71")
                .addFields(
                    { name: "👤 Dipendente", value: `${target}`, inline: true },
                    { name: "💼 Ruolo", value: `${ruolo.name}`, inline: true },
                    { name: "✍️ Responsabile", value: `${interaction.user}`, inline: true }
                )
                .setImage(screenshot.url) // Mostra lo screenshot allegato direttamente nell'embed
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ 
                content: "❌ Errore: Il mio ruolo deve essere **sopra** quello che stai assegnando!", 
                ephemeral: true 
            });
        }
    },
};

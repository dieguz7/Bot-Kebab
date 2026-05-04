import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('licenzia')
        .setDescription('Rimuovi un utente dal kebabbaro e togli il ruolo')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => 
            option.setName('utente')
                .setDescription('L’utente da licenziare')
                .setRequired(true))
        .addRoleOption(option => 
            option.setName('ruolo')
                .setDescription('Il ruolo da rimuovere')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getMember('utente');
        const ruolo = interaction.options.getRole('ruolo');

        if (!target) return interaction.reply({ content: "❌ Utente non trovato.", ephemeral: true });

        try {
            await target.roles.remove(ruolo);
            await interaction.reply({ 
                content: `👋 **Licenziamento eseguito.**\nIl ruolo **${ruolo.name}** è stato rimosso da ${target}.` 
            });
        } catch (error) {
            await interaction.reply({ 
                content: "❌ Errore: Non ho i permessi per gestire questo ruolo.", 
                ephemeral: true 
            });
        }
    },
};

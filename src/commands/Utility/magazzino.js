import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    // Definizione del comando
    data: new SlashCommandBuilder()
        .setName('magazzino')
        .setDescription('Interfaccia per la gestione del magazzino aziendale'),

    async execute(interaction, guildConfig, client) {
        try {
            // --- CONTROLLO RUOLO ---
            // Sostituisci 'ID_RUOLO' con l'ID del ruolo che può usare il comando
            const RUOLO_AUTORIZZATO = '1498387589709692958'; 
            
            if (!interaction.member.roles.cache.has(RUOLO_AUTORIZZATO)) {
                return await interaction.reply({ 
                    content: "❌ Non hai i permessi necessari per aprire il pannello magazzino.", 
                    ephemeral: true 
                });
            }

            // --- CREAZIONE EMBED ---
            const embed = new EmbedBuilder()
                .setTitle("📦 GESTIONE MAGAZZINO")
                .setDescription("Usa i bottoni qui sotto per gestire il carico/scarico merci o visualizzare lo stato attuale.")
                .setColor("#2f3136")
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: "Sistema Logistico v1.0", iconURL: client.user.displayAvatarURL() })
                .setTimestamp();

            // --- BOTTONI ---
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_aggiungi')
                    .setLabel('Aggiungi Merce')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('➕'),
                new ButtonBuilder()
                    .setCustomId('btn_rimuovi')
                    .setLabel('Rimuovi Merce')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('➖'),
                new ButtonBuilder()
                    .setCustomId('view_inventory')
                    .setLabel('Vedi Inventario')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📋')
            );

            // Invio della risposta
            await interaction.reply({ 
                embeds: [embed], 
                components: [row] 
            });

        } catch (error) {
            console.error("Errore nell'esecuzione del comando magazzino:", error);
            // Se c'è un errore, proviamo a rispondere all'utente
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Si è verificato un errore interno.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Si è verificato un errore durante l\'apertura del magazzino.', ephemeral: true });
            }
        }
    }
};

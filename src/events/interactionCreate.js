import { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js';
import { logger } from '../utils/logger.js';
import { getGuildConfig } from '../services/guildConfig.js';
import { handleInteractionError, createError, ErrorTypes } from '../utils/errorHandler.js';
import { InteractionHelper } from '../utils/interactionHelper.js';
import { createInteractionTraceContext, runWithTraceContext } from '../utils/traceContext.js';
import { validateChatInputPayloadOrThrow } from '../utils/commandInputValidation.js';
import { enforceAbuseProtection, formatCooldownDuration } from '../utils/abuseProtection.js';

function withTraceContext(context = {}, traceContext = {}) {
    return {
        traceId: traceContext.traceId,
        guildId: context.guildId || traceContext.guildId,
        userId: context.userId || traceContext.userId,
        command: context.commandName || traceContext.command,
        ...context
    };
}

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        const interactionTraceContext = createInteractionTraceContext(interaction);
        interaction.traceContext = interactionTraceContext;

        return runWithTraceContext(interactionTraceContext, async () => {
            try {
                InteractionHelper.patchInteractionResponses(interaction);

                // --- 1. COMANDI SLASH ---
                if (interaction.isChatInputCommand()) {
                    const command = client.commands.get(interaction.commandName);
                    if (!command) return;

                    let guildConfig = null;
                    if (interaction.guild) {
                        guildConfig = await getGuildConfig(client, interaction.guild.id, interactionTraceContext);
                    }

                    await command.execute(interaction, guildConfig, client);
                }

                // --- 2. GESTIONE BOTTONI ---
                else if (interaction.isButton()) {
                    
                    // A. Bottoni Cartellino (Timbra/Info)
                    const cartellinoButtons = ['timbra', 'stimbra', 'pausa', 'info_ore'];
                    if (cartellinoButtons.includes(interaction.customId)) {
                        try {
                            const { default: cartellino } = await import('../interactions/buttons/cartellino.js');
                            return await cartellino.execute(interaction, client);
                        } catch (err) {
                            logger.error('Errore nel caricamento del file cartellino.js', err);
                            return await interaction.reply({ content: "❌ Errore nel modulo cartellino.", ephemeral: true });
                        }
                    }

                    // B. Bottoni Magazzino (Aggiungi/Rimuovi)
                    if (interaction.customId === 'btn_aggiungi' || interaction.customId === 'btn_rimuovi') {
                        const isAggiungi = interaction.customId === 'btn_aggiungi';
                        
                        const modal = new ModalBuilder()
                            .setCustomId(isAggiungi ? 'modal_aggiungi' : 'modal_rimuovi')
                            .setTitle(isAggiungi ? '➕ Aggiungi Merce' : '➖ Rimuovi Merce');

                        const inputMerce = new TextInputBuilder()
                            .setCustomId('merce')
                            .setLabel("Quale prodotto?")
                            .setPlaceholder("Es: Pane, Acqua...")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true);

                        const inputQuantita = new TextInputBuilder()
                            .setCustomId('quantita')
                            .setLabel("Quantità")
                            .setPlaceholder("Inserisci un numero")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true);

                        const inputMotivo = new TextInputBuilder()
                            .setCustomId('motivo')
                            .setLabel("Motivo (Opzionale)")
                            .setPlaceholder("Perché fai questa operazione?")
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(false);

                        modal.addComponents(
                            new ActionRowBuilder().addComponents(inputMerce),
                            new ActionRowBuilder().addComponents(inputQuantita),
                            new ActionRowBuilder().addComponents(inputMotivo)
                        );

                        return await interaction.showModal(modal);
                    }
                }

                // --- 3. GESTIONE INVIO MODALI (MAGAZZINO) ---
                else if (interaction.isModalSubmit()) {
                    if (interaction.customId === 'modal_aggiungi' || interaction.customId === 'modal_rimuovi') {
                        const merce = interaction.fields.getTextInputValue('merce').toLowerCase();
                        const quantita = parseInt(interaction.fields.getTextInputValue('quantita'));
                        const motivo = interaction.fields.getTextInputValue('motivo') || "Nessun motivo specificato";

                        if (isNaN(quantita) || quantita <= 0) {
                            return interaction.reply({ content: "❌ Inserisci una quantità valida!", ephemeral: true });
                        }

                        if (!global.inventario) global.inventario = {};
                        const isAggiungi = interaction.customId === 'modal_aggiungi';

                        // Aggiornamento dati magazzino
                        if (isAggiungi) {
                            global.inventario[merce] = (global.inventario[merce] || 0) + quantita;
                        } else {
                            if (!global.inventario[merce] || global.inventario[merce] < quantita) {
                                return interaction.reply({ content: `❌ Merce insufficiente in magazzino!`, ephemeral: true });
                            }
                            global.inventario[merce] -= quantita;
                            if (global.inventario[merce] <= 0) delete global.inventario[merce];
                        }

                        // --- EMBED LOGISTICA (Diverso dal Timbra) ---
                        const logEmbed = new EmbedBuilder()
                            .setAuthor({ name: 'REGISTRO LOGISTICA AZIENDALE', iconURL: interaction.guild.iconURL() })
                            .setTitle(isAggiungi ? "📥 ENTRATA MERCE" : "📤 USCITA MERCE")
                            .setColor(isAggiungi ? "#00ff7f" : "#ff4500")
                            .setThumbnail(isAggiungi ? "https://cdn-icons-png.flaticon.com/512/407/407826.png" : "https://cdn-icons-png.flaticon.com/512/1554/1554401.png")
                            .addFields(
                                { name: "📦 Prodotto", value: `**${merce.toUpperCase()}**`, inline: true },
                                { name: "🔢 Quantità", value: `**x${quantita}**`, inline: true },
                                { name: "👷 Operatore", value: `${interaction.user}`, inline: false },
                                { name: "📝 Nota", value: `*${motivo}*`, inline: false }
                            )
                            .setFooter({ text: "Official Bot 🤖", iconURL: client.user.displayAvatarURL() })
                            .setTimestamp();

                        await interaction.reply({ content: `✅ Magazzino aggiornato con successo!`, ephemeral: true });
                        
                        // ID del canale dove vuoi i log del magazzino
                        const logChannel = interaction.guild.channels.cache.get('1475551627456020572'); 
                        if (logChannel) await logChannel.send({ embeds: [logEmbed] });
                    }
                }

            } catch (error) {
                logger.error('Interaction error:', error);
            }
        });
    },
};

import { Events, MessageFlags } from 'discord.js';
import { logger } from '../utils/logger.js';
import { getGuildConfig } from '../services/guildConfig.js';
import { handleApplicationModal } from '../commands/Community/apply.js';
import { handleApplicationReviewModal } from '../commands/Community/app-admin.js';
import { handleInteractionError, createError, ErrorTypes } from '../utils/errorHandler.js';
import { MessageTemplates } from '../utils/messageTemplates.js';
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
    interaction.traceId = interactionTraceContext.traceId;

    return runWithTraceContext(interactionTraceContext, async () => {
      try {
        InteractionHelper.patchInteractionResponses(interaction);

        if (interaction.isChatInputCommand()) {
          try {
            logger.info(`Command executed: /${interaction.commandName} by ${interaction.user.tag}`, {
              event: 'interaction.command.received',
              traceId: interactionTraceContext.traceId,
              guildId: interaction.guildId,
              userId: interaction.user?.id,
              command: interaction.commandName
            });

            validateChatInputPayloadOrThrow(interaction, withTraceContext({
              type: 'command_input_validation',
              commandName: interaction.commandName
            }, interactionTraceContext));

            const command = client.commands.get(interaction.commandName);

            if (!command) {
              throw createError(
                `No command matching ${interaction.commandName} was found.`,
                ErrorTypes.CONFIGURATION,
                'Sorry, that command does not exist.',
                withTraceContext({ commandName: interaction.commandName }, interactionTraceContext)
              );
            }

            const abuseProtection = await enforceAbuseProtection(interaction, command, interaction.commandName);
            if (!abuseProtection.allowed) {
              const formattedCooldown = formatCooldownDuration(abuseProtection.remainingMs);
              throw createError(
                `Risky command cooldown active for ${interaction.commandName}`,
                ErrorTypes.RATE_LIMIT,
                `This command is on cooldown. Please wait ${formattedCooldown} before trying again.`,
                withTraceContext({
                  commandName: interaction.commandName,
                  subtype: 'command_cooldown',
                  expected: true,
                  cooldownMs: abuseProtection.remainingMs,
                  cooldownWindowMs: abuseProtection.policy?.windowMs,
                  cooldownMaxAttempts: abuseProtection.policy?.maxAttempts
                }, interactionTraceContext)
              );
            }

            let guildConfig = null;
            if (interaction.guild) {
              guildConfig = await getGuildConfig(client, interaction.guild.id, interactionTraceContext);
              if (guildConfig?.disabledCommands?.[interaction.commandName]) {
                throw createError(
                  `Command ${interaction.commandName} is disabled in this guild`,
                  ErrorTypes.CONFIGURATION,
                  'This command has been disabled for this server.',
                  withTraceContext({ commandName: interaction.commandName, guildId: interaction.guild.id }, interactionTraceContext)
                );
              }
            }

            await command.execute(interaction, guildConfig, client);
          } catch (error) {
            await handleInteractionError(interaction, error, withTraceContext({
              type: 'command',
              commandName: interaction.commandName
            }, interactionTraceContext));
          }
        } else if (interaction.isAutocomplete()) {
          const focusedOption = interaction.options.getFocused(true);
          if (interaction.commandName === 'apply' && focusedOption.name === 'application') {
            try {
              const { getApplicationRoles } = await import('../utils/database.js');
              const roles = await getApplicationRoles(client, interaction.guildId);
              const roleName = interaction.options.getString('application', false);
              const filtered = roles.filter(role =>
                role.enabled !== false && 
                role.name.toLowerCase().startsWith(roleName?.toLowerCase() || '')
              );
              await interaction.respond(filtered.slice(0, 25).map(role => ({ name: role.name, value: role.name })));
            } catch (error) { await interaction.respond([]); }
          }
        } else if (interaction.isButton()) {
          
          // --- GESTIONE PROFESSIONALE CARTELLINO ---
          const cartellinoButtons = ['timbra', 'stimbra', 'pausa', 'info_ore'];
          if (cartellinoButtons.includes(interaction.customId)) {
              try {
                  const { default: cartellino } = await import('../interactions/buttons/cartellino.js');
                  return await cartellino.execute(interaction, client);
              } catch (err) {
                  logger.error('Errore nel caricamento del file cartellino.js', err);
                  return await interaction.reply({ content: "❌ Errore interno nel modulo cartellino.", ephemeral: true });
              }
          }

          // --- LOGICA BOTTONI ORIGINALE ---
          if (interaction.customId.startsWith('shared_todo_')) {
            const parts = interaction.customId.split('_');
            const buttonType = parts.slice(0, 3).join('_');
            const listId = parts[3];
            const button = client.buttons.get(buttonType);
            if (button) {
              await button.execute(interaction, client, [listId]);
            }
            return;
          }

          const [customId, ...args] = interaction.customId.split(':');
          const button = client.buttons.get(customId);
          if (button) {
            await button.execute(interaction, client, args);
          }
          
        } else if (interaction.isStringSelectMenu()) {
          const [customId, ...args] = interaction.customId.split(':');
          const selectMenu = client.selectMenus.get(customId);
          if (selectMenu) await selectMenu.execute(interaction, client, args);
        } else if (interaction.isModalSubmit()) {
          if (interaction.customId.startsWith('app_modal_')) return await handleApplicationModal(interaction);
          if (interaction.customId.startsWith('app_review_')) return await handleApplicationReviewModal(interaction);
          const [customId, ...args] = interaction.customId.split(':');
          const modal = client.modals.get(customId);
          if (modal) await modal.execute(interaction, client, args);
        }
      } catch (error) {
        logger.error('Unhandled error in interactionCreate:', { error, traceId: interactionTraceContext.traceId });
      const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

// CONFIGURAZIONE - Sostituisci questi ID
const STAFF_ROLE_ID = '1480815455269687358'; 
const CATEGORY_TICKETS_ID = '1502425998745145444';

client.on('interactionCreate', async interaction => {
    
    // --- 1. GESTIONE CLICK BOTTONI CATEGORIE ---
    if (interaction.isButton() && interaction.customId.startsWith('ticket_')) {
        await interaction.deferReply({ ephemeral: true });
        const categoria = interaction.customId.split('_')[1].toUpperCase();

        const channel = await interaction.guild.channels.create({
            name: `ticket-${categoria.toLowerCase()}-${interaction.user.username}`,
            type: 0,
            parent: CATEGORY_TICKETS_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                { id: STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
            ],
        });

        const ticketEmbed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🎫 Nuovo Ticket')
            .setDescription(`<@${interaction.user.id}> ha creato un nuovo ticket.\n**Categoria:** \`${categoria}\``)
            .setFooter({ text: 'Bot offerto da DIeguz' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('Chiudi Ticket').setEmoji('🔒').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('claim_ticket').setLabel('Reclama Ticket').setEmoji('🙋‍♂️').setStyle(ButtonStyle.Secondary)
        );

        await channel.send({ 
            content: `||<@${interaction.user.id}> | <@&${STAFF_ROLE_ID}>||`, 
            embeds: [ticketEmbed], 
            components: [row] 
        });

        return interaction.editReply({ content: `✅ Ticket aperto: ${channel}` });
    }

    // --- 2. GESTIONE BOTTONE CHIUDI (MODAL) ---
    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({ content: "Solo lo staff può chiudere i ticket!", ephemeral: true });
        }

        const modal = new ModalBuilder().setCustomId('modal_close_reason').setTitle('Chiusura Ticket');
        const reasonInput = new TextInputBuilder()
            .setCustomId('close_reason')
            .setLabel("Motivazione della chiusura")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
        await interaction.showModal(modal);
    }

    // --- 3. GESTIONE BOTTONE RECLAMA ---
    if (interaction.isButton() && interaction.customId === 'claim_ticket') {
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({ content: "Solo lo staff può reclamare i ticket!", ephemeral: true });
        }
        await interaction.reply({ content: `Il ticket è stato preso in carico da <@${interaction.user.id}>` });
    }

    // --- 4. GESTIONE INVIO MODAL (CHIUSURA DEFINITIVA) ---
    if (interaction.isModalSubmit() && interaction.customId === 'modal_close_reason') {
        const reason = interaction.fields.getTextInputValue('close_reason');
        await interaction.reply(`🔒 **Ticket in chiusura...**\n**Motivazione:** ${reason}\nIl canale verrà eliminato tra 5 secondi.`);
        
        setTimeout(() => {
            interaction.channel.delete().catch(() => {});
        }, 5000);
    }
});
      }
    });
  }
};

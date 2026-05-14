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
                            const { default: cartellino } = await import

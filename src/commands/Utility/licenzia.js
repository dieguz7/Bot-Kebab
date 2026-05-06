import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('licenzia')
        .setDescription('Rimuovi un utente dallo staff e invia il log')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => 
            option.setName('utente')
                .setDescription('L’utente da licenziare')
                .setRequired(true))
        .addRoleOption(option => 
            option.setName('ruolo')
                .setDescription('Il ruolo da rimuovere')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('motivo')
                .setDescription('Motivazione del licenziamento')
                .setRequired(false)), // Opzionale

    async execute(interaction) {
        // --- CONFIGURAZIONE RUOLO AUTORIZZATO ---
        const RUOLO_AUTORIZZATO = '1498386121124610208'; // <--- Incolla qui l'ID autorizzato

        // Controllo se chi esegue il comando ha il ruolo necessario
        if (!interaction.member.roles.cache.has(RUOLO_AUTORIZZATO)) {
            return await interaction.reply({ 
                content: "❌ Solo l'Alta Direzione può utilizzare questo comando per licenziare lo staff.", 
                ephemeral: true 
            });
        }
        // --- FINE CONTROLLO ---

        const target = interaction.options.getMember('utente');
        const ruolo = interaction.options.getRole('ruolo');
        const motivo = interaction.options.getString('motivo') || "Nessun motivo specificato";

        // --- CONFIGURAZIONE LOG ---
        const LOG_CHANNEL_ID = '1500731961608765500'; 
        // --------------------------

        if (!target) return interaction.reply({ content: "❌ Utente non trovato nel server.", ephemeral: true });

        try {
            // Rimuoviamo il ruolo
            await target.roles.remove(ruolo);

            // Creiamo l'Embed per il log (Rosso per i licenziamenti)
            const logEmbed = new EmbedBuilder()
                .setTitle("👋 Utente Licenziato / Rimosso")
                .setColor("#e74c3c") // Rosso
                .setThumbnail(target.user.displayAvatarURL())
                .addFields(
                    { name: "👤 Ex-Staffer", value: `${target}`, inline: true },
                    { name: "💼 Ruolo rimosso", value: `${ruolo.name}`, inline: true },
                    { name: "✍️ Responsabile", value: `${interaction.user}`, inline: true },
                    { name: "📝 Motivo", value: `${motivo}` }
                )
                .setTimestamp();

            // 1. Risposta privata all'admin
            await interaction.reply({ content: `✅ Log inviato e ruolo rimosso a ${target.user.username}.`, ephemeral: true });

            // 2. Invio del log nel canale dedicato
            const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                await logChannel.send({ embeds: [logEmbed] });
            }

        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: "❌ Errore: Controlla che il ruolo del bot sia più alto del ruolo da rimuovere!", 
                ephemeral: true 
            });
        }
    },
};

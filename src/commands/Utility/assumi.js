import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('assumi')
        .setDescription('Assume un utente e invia l’annuncio in un canale specifico')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addUserOption(option => 
            option.setName('utente')
                .setDescription('L’utente da assumere')
                .setRequired(true)),

    async execute(interaction) {
        // --- CONFIGURAZIONE ---
        const ID_CANALE_DESTINAZIONE = '1475551627456020572'; // <--- Incolla qui l'ID del canale annunci
        const ruoliDaAssegnare = [
            '1475492243883429920', 
            '1498385283186429972'
        ];

        const target = interaction.options.getMember('utente');
        if (!target) return interaction.reply({ content: "❌ Utente non trovato.", ephemeral: true });

        try {
            // 1. Assegna i ruoli standard
            await target.roles.add(ruoliDaAssegnare);

            // 2. Crea l'Embed dell'assunzione
            const embedAssunzione = new EmbedBuilder()
                .setTitle("✅ Nuova Assunzione")
                .setThumbnail(target.user.displayAvatarURL())
                .setColor("#2ecc71")
                .setDescription(
                    `🎉 **Benvenuto nello staff!**\n\n` +
                    `👤 **Utente:** ${target}\n` +
                    `✍️ **Assunto da:** ${interaction.user}\n` +
                    `📅 **Data:** <t:${Math.floor(Date.now() / 1000)}:D>`
                )
                .setFooter({ text: "Sistema Risorse Umane" })
                .setTimestamp();

            // 3. Cerca il canale specifico e invia il messaggio
            const targetChannel = interaction.guild.channels.cache.get(ID_CANALE_DESTINAZIONE);
            
            if (!targetChannel) {
                return interaction.reply({ 
                    content: "❌ Errore: Il canale di destinazione non è stato trovato. Verifica l'ID nello script!", 
                    ephemeral: true 
                });
            }

            await targetChannel.send({ content: `🔔 Nuova assunzione effettuata! ${target}`, embeds: [embedAssunzione] });

            // 4. Risposta di conferma a chi ha fatto il comando (visibile solo a lui)
            await interaction.reply({ 
                content: `✅ Assunzione di ${target} completata con successo! Il messaggio è stato inviato in ${targetChannel}.`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error(error);
            return interaction.reply({ 
                content: "❌ Errore critico durante l'assunzione. Controlla i permessi del bot.", 
                ephemeral: true 
            });
        }
    },
};

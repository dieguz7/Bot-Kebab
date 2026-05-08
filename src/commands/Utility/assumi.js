import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('assumi')
        .setDescription('Assume un utente e allega lo screenshot dell’assunzione')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addUserOption(option => 
            option.setName('utente')
                .setDescription('L’utente da assumere')
                .setRequired(true))
        // --- AGGIUNTA OPZIONE SCREENSHOT ---
        .addAttachmentOption(option => 
            option.setName('screen')
                .setDescription('Allega lo screenshot dell’assunzione')
                .setRequired(true)), // Messo true perché hai detto che serve lo screen

    async execute(interaction) {
        // --- CONFIGURAZIONE ---
        const ID_CANALE_DESTINAZIONE = '1475551627456020572'; 
        const ruoliDaAssegnare = [
            '1475492243883429920', 
            '1498385283186429972'
        ];

        const target = interaction.options.getMember('utente');
        const screenshot = interaction.options.getAttachment('screen'); // Recupera il file allegato
        
        if (!target) return interaction.reply({ content: "❌ Utente non trovato.", ephemeral: true });

        try {
            // 1. Assegna i ruoli standard
            await target.roles.add(ruoliDaAssegnare);

            // 2. Crea l'Embed dell'assunzione (lo "screen" estetico)
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
                // --- QUESTA RIGA MOSTRA LO SCREEN CHE HAI CARICATO ---
                .setImage(screenshot.url) 
                .setFooter({ text: "Sistema Risorse Umane" })
                .setTimestamp();

            // 3. Cerca il canale specifico e invia il messaggio
            const targetChannel = interaction.guild.channels.cache.get(ID_CANALE_DESTINAZIONE);
            
            if (!targetChannel) {
                return interaction.reply({ 
                    content: "❌ Errore: Canale di destinazione non trovato.", 
                    ephemeral: true 
                });
            }

            await targetChannel.send({ content: `🔔 Nuova assunzione effettuata! ${target}`, embeds: [embedAssunzione] });

            // 4. Risposta di conferma a chi ha fatto il comando
            await interaction.reply({ 
                content: `✅ Assunzione di ${target} completata! Lo screenshot è stato pubblicato in ${targetChannel}.`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error(error);
            return interaction.reply({ 
                content: "❌ Errore critico. Controlla i permessi del bot.", 
                ephemeral: true 
            });
        }
    },
};

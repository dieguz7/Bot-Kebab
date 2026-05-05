import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('testwarn')
        .setDescription('Assegna un richiamo progressivo e rimuove il precedente')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => 
            option.setName('utente')
                .setDescription('L’utente da richiamare')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('motivo')
                .setDescription('Motivazione del richiamo')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getMember('utente');
        const motivo = interaction.options.getString('motivo');

        if (!target) return interaction.reply({ content: "❌ Utente non trovato.", ephemeral: true });

        // --- CONFIGURAZIONE NOMI RUOLI (Incolla qui i nomi esatti con emoji) ---
        const rName1 = "​🟡​​| Warn Interno 1";
        const rName2 = "🟠​​| Warn Interno 2"; 
        const rName3 = "​🔴​| Warn Interno 3";

        const role1 = interaction.guild.roles.cache.find(r => r.name === rName1);
        const role2 = interaction.guild.roles.cache.find(r => r.name === rName2);
        const role3 = interaction.guild.roles.cache.find(r => r.name === rName3);

        if (!role1 || !role2 || !role3) {
            return interaction.reply({ 
                content: `❌ Errore: Assicurati che i nomi dei ruoli nel codice siano identici a quelli sul server.`, 
                ephemeral: true 
            });
        }

        let ruoloDaAggiungere;
        let coloreEmbed = "#ffcc00";

        try {
            // --- LOGICA DI SCAMBIO RUOLI ---

            // Se ha già il 3, blocca
            if (target.roles.cache.has(role3.id)) {
                return interaction.reply({ 
                    content: `⚠️ ${target} ha già raggiunto il massimo dei richiami (${role3}).`, 
                    ephemeral: true 
                });
            } 
            
            // Se ha il 2, togliamo il 2 e mettiamo il 3
            else if (target.roles.cache.has(role2.id)) {
                await target.roles.remove(role2); // Rimuove il precedente
                await target.roles.add(role3);    // Aggiunge il nuovo
                ruoloDaAggiungere = role3;
                coloreEmbed = "#ff0000";
            } 
            
            // Se ha il 1, togliamo l'1 e mettiamo il 2
            else if (target.roles.cache.has(role1.id)) {
                await target.roles.remove(role1); // Rimuove il precedente
                await target.roles.add(role2);    // Aggiunge il nuovo
                ruoloDaAggiungere = role2;
                coloreEmbed = "#ff9900";
            } 
            
            // Se non ha nulla, mettiamo l'1
            else {
                await target.roles.add(role1);
                ruoloDaAggiungere = role1;
                coloreEmbed = "#ffff00";
            }

            const embed = new EmbedBuilder()
                .setTitle("⚠️ Sistema Sanzioni Aggiornato")
                .setColor(coloreEmbed)
                .setThumbnail(target.user.displayAvatarURL())
                .addFields(
                    { name: "👤 Utente", value: `${target}`, inline: true },
                    { name: "📊 Nuovo Stato", value: `${ruoloDaAggiungere}`, inline: true },
                    { name: "📝 Motivo", value: motivo }
                )
                .setTimestamp()
                .setFooter({ text: `Staffer: ${interaction.user.tag}` });

            await interaction.reply({ embeds: [embed] });
            
            // Messaggio in DM
            await target.send(`Il tuo stato sanzioni su **${interaction.guild.name}** è stato aggiornato.\nNuovo ruolo: ${ruoloDaAggiungere.name}\nMotivo: ${motivo}`).catch(() => {});

        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: "❌ Errore: Controlla che il ruolo del Bot sia sopra i ruoli dei Warn nella gerarchia del server.", 
                ephemeral: true 
            });
        }
    },
};

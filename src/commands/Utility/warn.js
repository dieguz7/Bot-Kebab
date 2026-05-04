import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Assegna un richiamo progressivo tramite ruoli')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => 
            option.setName('utente')
                .setDescription('L’utente da richiamare')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('motivo')
                .setDescription('Motivazione del richiamo')
                .setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getMember('utente');
        const motivo = interaction.options.getString('motivo') || "Nessun motivo specificato";

        if (!target) return interaction.reply({ content: "❌ Utente non trovato nel server.", ephemeral: true });

        // Nomi esatti dei ruoli su Discord
        const rName1 = "Warn Interno 1";
        const rName2 = "Warn Interno 2";
        const rName3 = "Warn Interno 3";

        const role1 = interaction.guild.roles.cache.find(r => r.name === rName1);
        const role2 = interaction.guild.roles.cache.find(r => r.name === rName2);
        const role3 = interaction.guild.roles.cache.find(r => r.name === rName3);

        if (!role1 || !role2 || !role3) {
            return interaction.reply({ 
                content: `❌ Errore: Assicurati di aver creato i ruoli "${rName1}", "${rName2}" e "${rName3}" nelle impostazioni del server.`, 
                ephemeral: true 
            });
        }

        let statoWarn = "";
        let colore = "#ffcc00";

        try {
            if (target.roles.cache.has(role3.id)) {
                return interaction.reply({ content: `⚠️ ${target} ha già il numero massimo di richiami (3/3).`, ephemeral: true });
            } 
            
            else if (target.roles.cache.has(role2.id)) {
                await target.roles.add(role3);
                statoWarn = "3 / 3";
                colore = "#ff0000";
            } 
            
            else if (target.roles.cache.has(role1.id)) {
                await target.roles.add(role2);
                statoWarn = "2 / 3";
                colore = "#ff9900";
            } 
            
            else {
                await target.roles.add(role1);
                statoWarn = "1 / 3";
                colore = "#ffcc00";
            }

            const embed = new EmbedBuilder()
                .setTitle("⚠️ Nuovo Richiamo")
                .setColor(colore)
                .addFields(
                    { name: "👤 Utente", value: `${target}`, inline: true },
                    { name: "📊 Stato", value: `**${statoWarn}**`, inline: true },
                    { name: "📝 Motivo", value: motivo }
                )
                .setTimestamp()
                .setFooter({ text: `Staffer: ${interaction.user.tag}` });

            await interaction.reply({ embeds: [embed] });
            await target.send(`Sei stato richiamato su **${interaction.guild.name}**.\nStato attuale: **${statoWarn}**`).catch(() => {});

        } catch (error) {
            await interaction.reply({ 
                content: "❌ Errore permessi: controlla che il mio ruolo sia SOPRA i ruoli dei Warn nella lista ruoli del server.", 
                ephemeral: true 
            });
        }
    },
};

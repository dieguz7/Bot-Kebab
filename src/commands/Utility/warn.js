import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('testwarn')
        .setDescription('Assegna un richiamo progressivo tramite ruoli')
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
                content: `❌ Errore: Assicurati che i nomi dei ruoli nel codice corrispondano a quelli sul server.`, 
                ephemeral: true 
            });
        }

        let ruoloAssegnato;
        let coloreEmbed = "#ffcc00";

        try {
            // Controllo progressivo dei ruoli
            if (target.roles.cache.has(role3.id)) {
                return interaction.reply({ 
                    content: `⚠️ ${target} ha già raggiunto il massimo dei richiami (${role3}).`, 
                    ephemeral: true 
                });
            } 
            
            else if (target.roles.cache.has(role2.id)) {
                await target.roles.add(role3);
                ruoloAssegnato = role3;
                coloreEmbed = "#ff0000";
            } 
            
            else if (target.roles.cache.has(role1.id)) {
                await target.roles.add(role2);
                ruoloAssegnato = role2;
                coloreEmbed = "#ff9900";
            } 
            
            else {
                await target.roles.add(role1);
                ruoloAssegnato = role1;
                coloreEmbed = "#ffff00";
            }

            const embed = new EmbedBuilder()
                .setTitle("⚠️ Nuovo Richiamo")
                .setColor(coloreEmbed)
                .setThumbnail(target.user.displayAvatarURL())
                .addFields(
                    { name: "👤 Utente", value: `${target}`, inline: true },
                    { name: "📊 Livello Warn", value: `${ruoloAssegnato}`, inline: true }, // Qui tagga il ruolo
                    { name: "📝 Motivo", value: motivo }
                )
                .setTimestamp()
                .setFooter({ text: `Staffer: ${interaction.user.tag}` });

            await interaction.reply({ embeds: [embed] });
            
            // Messaggio privato all'utente
            await target.send(`Hai ricevuto un richiamo su **${interaction.guild.name}**.\nNuovo stato: ${ruoloAssegnato.name}\nMotivo: ${motivo}`).catch(() => {});

        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: "❌ Errore nei permessi: controlla che il ruolo del bot sia sopra i ruoli dei Warn.", 
                ephemeral: true 
            });
        }
    },
};

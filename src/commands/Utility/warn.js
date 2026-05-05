import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('testwarn')
        .setDescription('Gestione richiami progressivi')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => 
            option.setName('utente')
                .setDescription('L’utente da richiamare')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('motivo')
                .setDescription('Motivazione del richiamo')
                .setRequired(true)), // Obbligatorio come richiesto

    async execute(interaction) {
        const target = interaction.options.getMember('utente');
        const motivo = interaction.options.getString('motivo');

        if (!target) return interaction.reply({ content: "❌ Utente non trovato.", ephemeral: true });

        // Configurazione nomi o ID dei ruoli
        const NOME_RUOLO_WARN_1 = "​🟡​​| Warn Interno 1"; // Sostituisci con i nomi esatti del tuo server
        const NOME_RUOLO_WARN_2 = "🟠​​| Warn Interno 2"; 
        const NOME_RUOLO_WARN_3 = "​🔴​| Warn Interno 3";

        const role1 = interaction.guild.roles.cache.find(r => r.name === NOME_RUOLO_WARN_1);
        const role2 = interaction.guild.roles.cache.find(r => r.name === NOME_RUOLO_WARN_2);
        const role3 = interaction.guild.roles.cache.find(r => r.name === NOME_RUOLO_WARN_3);

        // Controllo esistenza ruoli nel server
        if (!role1 || !role2 || !role3) {
            return interaction.reply({ 
                content: "❌ Errore: Uno o più ruoli di warn non esistono nel server.", 
                ephemeral: true 
            });
        }

        let statoWarn = "";
        let colore = "#ffcc00";

        try {
            // LOGICA PROGRESSIVA
            
            // Se ha già il 3, blocca subito
            if (target.roles.cache.has(role3.id)) {
                return interaction.reply({ 
                    content: `🚫 ${target} ha già raggiunto il massimo dei warn (3/3).`, 
                    ephemeral: true 
                });
            } 
            
            // Se ha il 2, mettiamo il 3 (Massimo raggiunto)
            else if (target.roles.cache.has(role2.id)) {
                await target.roles.add(role3);
                statoWarn = "3 / 3 (Massimo Raggiunto)";
                colore = "#ff0000";
            } 
            
            // Se ha il 1, mettiamo il 2 (Ruolo speciale richiesto)
            else if (target.roles.cache.has(role1.id)) {
                await target.roles.add(role2);
                statoWarn = "2 / 3";
                colore = "#ff9900";
            } 
            
            // Se non ha nulla, iniziamo dal 1
            else {
                await target.roles.add(role1);
                statoWarn = "1 / 3";
                colore = "#ffff00";
            }

            const embed = new EmbedBuilder()
                .setTitle("⚠️ Sistema Sanzioni")
                .setColor(colore)
                .setThumbnail(target.user.displayAvatarURL())
                .addFields(
                    { name: "👤 Utente", value: `${target}`, inline: true },
                    { name: "📊 Livello Warn", value: `**${statoWarn}**`, inline: true },
                    { name: "📝 Motivo", value: motivo }
                )
                .setTimestamp()
                .setFooter({ text: `Eseguito da: ${interaction.user.tag}` });

            await interaction.reply({ embeds: [embed] });
            
            // Notifica in DM all'utente
            await target.send(`Hai ricevuto un richiamo su **${interaction.guild.name}**.\nStato: **${statoWarn}**\nMotivo: ${motivo}`).catch(() => {});

        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: "❌ Non ho i permessi per gestire i ruoli di questo utente. Verifica la gerarchia!", 
                ephemeral: true 
            });
        }
    },
};

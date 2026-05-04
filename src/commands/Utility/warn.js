import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Aggiungi un richiamo visivo tramite ruoli')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => 
            option.setName('utente').setDescription('L’utente da richiamare').setRequired(true))
        .addStringOption(option => 
            option.setName('motivo').setDescription('Perché stai mettendo il richiamo?').setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getMember('utente');
        const motivo = interaction.options.getString('motivo') || "Nessun motivo specificato";

        if (!target) return interaction.reply({ content: "❌ Utente non trovato.", ephemeral: true });

        // Nomi dei ruoli (devono essere identici a quelli su Discord)
        const role1 = "Warn Interno 1";
        const role2 = "Warn Interno 2";
        const role3 = "Warn Interno 3";

        let logConteggio = "";
        let coloreEmbed = "#ffcc00";

        // LOGICA DEI RUOLI
        if (target.roles.cache.some(r => r.name === role3)) {
            // Se ha già il 3
            return interaction.reply({ content: `⚠️ ${target} ha già raggiunto il numero massimo di richiami (3/3).`, ephemeral: true });
        } 
        
        else if (target.roles.cache.some(r => r.name === role2)) {
            // Se ha il 2, mettiamo il 3
            const r3 = interaction.guild.roles.cache.find(r => r.name === role3);
            if (!r3) return interaction.reply({ content: `❌ Ruolo '${role3}' non trovato nel server.`, ephemeral: true });
            
            await target.roles.add(r3);
            logConteggio = "3 / 3";
            coloreEmbed = "#ff0000"; // Rosso
        } 
        
        else if (target.roles.cache.some(r => r.name === role1)) {
            // Se ha l'1, mettiamo il 2
            const r2 = interaction.guild.roles.cache.find(r => r.name === role2);
            if (!r2) return interaction.reply({ content: `❌ Ruolo '${role2}' non trovato nel server.`, ephemeral: true });
            
            await target.roles.add(r2);
            logConteggio = "2 / 3";
            coloreEmbed = "#ff9900"; // Arancione
        } 
        
        else {
            // Se non ha nessun ruolo, mettiamo l'1
            const r1 = interaction.guild.roles.cache.find(r => r.name === role1);
            if (!r1) return interaction.reply({ content: `❌ Ruolo '${role1}' non trovato nel server.`, ephemeral: true });
            
            await target.roles.add(r1);
            logConteggio = "1 / 3";
            coloreEmbed = "#ffcc00"; // Giallo
        }

        // EMBED DI RISPOSTA
        const embed = new EmbedBuilder()
            .setTitle("⚠️ Nuovo Richiamo Assegnato")
            .setColor(coloreEmbed)
            .addFields(
                { name: "👤 Utente", value: `${target}`, inline: true },
                { name: "📊 Stato Richiami", value: `**${logConteggio}**`, inline: true },
                { name: "📝 Motivo", value: motivo }
            )
            .setTimestamp()
            .setFooter({ text: `Eseguito da: ${interaction.user.tag}` });

        await interaction.reply({ embeds: [embed] });

        // Messaggio privato all'utente
        await target.send(`Hai ricevuto un richiamo su **${interaction.guild.name}**.\nStato attuale: **${logConteggio}**\nMotivo: ${motivo}`).catch(() => {});
    },
};

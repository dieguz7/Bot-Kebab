import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('testwarn')
        .setDescription('Assegna un richiamo con scadenza automatica e rimozione precedente')
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

        // --- CONFIGURAZIONE NOMI RUOLI ---
        const rName1 = "​​🟡​​| Warn Interno 1";
        const rName2 = "🟠​​| Warn Interno 2"; 
        const rName3 = "​🔴​| Warn Interno 3";

        const role1 = interaction.guild.roles.cache.find(r => r.name === rName1);
        const role2 = interaction.guild.roles.cache.find(r => r.name === rName2);
        const role3 = interaction.guild.roles.cache.find(r => r.name === rName3);

        if (!role1 || !role2 || !role3) {
            return interaction.reply({ content: "❌ Errore: Ruoli non trovati. Verifica i nomi nel codice.", ephemeral: true });
        }

        let ruoloDaAggiungere;
        let livello = 0;
        let msScadenza = 0;
        let giorniTesto = "";

        // --- LOGICA PROGRESSIVA CON SCADENZE ---
        try {
            if (target.roles.cache.has(role3.id)) {
                return interaction.reply({ content: `⚠️ ${target} ha già il massimo dei warn (${role3}).`, ephemeral: true });
            } 
            
            else if (target.roles.cache.has(role2.id)) {
                await target.roles.remove(role2);
                await target.roles.add(role3);
                ruoloDaAggiungere = role3;
                livello = 3;
                msScadenza = 15 * 24 * 60 * 60 * 1000; // 15 giorni
                giorniTesto = "15 giorni";
            } 
            
            else if (target.roles.cache.has(role1.id)) {
                await target.roles.remove(role1);
                await target.roles.add(role2);
                ruoloDaAggiungere = role2;
                livello = 2;
                msScadenza = 10 * 24 * 60 * 60 * 1000; // 10 giorni
                giorniTesto = "10 giorni";
            } 
            
            else {
                await target.roles.add(role1);
                ruoloDaAggiungere = role1;
                livello = 1;
                msScadenza = 5 * 24 * 60 * 60 * 1000; // 5 giorni
                giorniTesto = "5 giorni";
            }

            // --- COSTRUZIONE EMBED (STILE SCREENSHOT) ---
            const embed = new EmbedBuilder()
                .setTitle("⚠️ Nuovo Warn")
                .setColor(ruoloDaAggiungere.color || "#ffcc00")
                .addFields(
                    { name: "Applicato da", value: `${interaction.user}`, inline: true },
                    { name: "Utente sanzionato", value: `${target}`, inline: true },
                    { name: "Tipo", value: `${ruoloDaAggiungere}`, inline: true },
                    { name: "✉️ Motivazione", value: motivo }
                )
                .setFooter({ text: `Warn Livello ${livello} | Scade tra ${giorniTesto}` })
                .setTimestamp();

            await interaction.reply({ content: `${target}`, embeds: [embed] });

            // --- LOGICA DI RIMOZIONE AUTOMATICA ---
            setTimeout(async () => {
                // Ricontrolliamo se l'utente è ancora nel server e ha quel ruolo
                const memberCheck = await interaction.guild.members.fetch(target.id).catch(() => null);
                if (memberCheck && memberCheck.roles.cache.has(ruoloDaAggiungere.id)) {
                    await memberCheck.roles.remove(ruoloDaAggiungere).catch(() => {});
                    
                    // Opzionale: invia un log nel canale quando il warn scade
                    await interaction.channel.send(`✅ Il warn di ${target} (${ruoloDaAggiungere.name}) è scaduto ed è stato rimosso.`);
                }
            }, msScadenza);

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Errore permessi: controlla la gerarchia dei ruoli.", ephemeral: true });
        }
    },
};

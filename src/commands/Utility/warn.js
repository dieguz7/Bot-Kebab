import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('warn')
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
        // --- CONFIGURAZIONE RUOLO AUTORIZZATO ---
        const RUOLO_AUTORIZZATO = '1475489565430251542'; 

        // Controllo se chi esegue il comando ha il ruolo autorizzato
        if (!interaction.member.roles.cache.has(RUOLO_AUTORIZZATO)) {
            return await interaction.reply({ 
                content: "❌ Non hai i permessi necessari per utilizzare questo comando.", 
                ephemeral: true 
            });
        }

        const target = interaction.options.getMember('utente');
        const motivo = interaction.options.getString('motivo');

        if (!target) return interaction.reply({ content: "❌ Utente non trovato nel server.", ephemeral: true });

        // --- CONFIGURAZIONE RUOLI TRAMITE ID ---
        const role1 = interaction.guild.roles.cache.get("1475491699164709038"); 
        const role2 = interaction.guild.roles.cache.get("1475491577160798382"); 
        const role3 = interaction.guild.roles.cache.get("1475491244980441128"); 

        if (!role1 || !role2 || !role3) {
            return interaction.reply({ 
                content: "❌ Errore: ID dei ruoli non trovati nel server. Verifica gli ID!", 
                ephemeral: true 
            });
        }

        let ruoloDaAggiungere;
        let livello = 0;
        let msScadenza = 0;
        let giorniTesto = "";

        try {
            // --- LOGICA PROGRESSIVA ---
            if (target.roles.cache.has(role3.id)) {
                return interaction.reply({ content: `⚠️ ${target} ha già il massimo dei richiami.`, ephemeral: true });
            } 
            else if (target.roles.cache.has(role2.id)) {
                await target.roles.remove(role2);
                await target.roles.add(role3);
                ruoloDaAggiungere = role3;
                livello = 3;
                msScadenza = 15 * 24 * 60 * 60 * 1000; 
                giorniTesto = "15 giorni";
            } 
            else if (target.roles.cache.has(role1.id)) {
                await target.roles.remove(role1);
                await target.roles.add(role2);
                ruoloDaAggiungere = role2;
                livello = 2;
                msScadenza = 10 * 24 * 60 * 60 * 1000; 
                giorniTesto = "10 giorni";
            } 
            else {
                await target.roles.add(role1);
                ruoloDaAggiungere = role1;
                livello = 1;
                msScadenza = 5 * 24 * 60 * 60 * 1000; 
                giorniTesto = "5 giorni";
            }

            // --- INVIO EMBED ---
            const embed = new EmbedBuilder()
                .setTitle("⚠️ Nuovo Richiamo Applicato")
                .setColor(ruoloDaAggiungere.color || "#ffcc00")
                .addFields(
                    { name: "👤 Utente", value: `${target}`, inline: true },
                    { name: "🛡️ Livello", value: `Richiamo ${livello}`, inline: true },
                    { name: "✍️ Responsabile", value: `${interaction.user}`, inline: true },
                    { name: "📝 Motivo", value: motivo },
                    { name: "⏳ Scadenza", value: `Tra ${giorniTesto}` }
                )
                .setTimestamp();

            await interaction.reply({ content: `Sanzione applicata a ${target}`, embeds: [embed] });

            // --- RIMOZIONE AUTOMATICA ---
            setTimeout(async () => {
                const memberCheck = await interaction.guild.members.fetch(target.id).catch(() => null);
                if (memberCheck && memberCheck.roles.cache.has(ruoloDaAggiungere.id)) {
                    await memberCheck.roles.remove(ruoloDaAggiungere).catch(() => {});
                    console.log(`Log: Scaduto richiamo livello ${livello} per ${target.user.tag}`);
                }
            }, msScadenza);

        } catch (error) {
            console.error(error);
            return interaction.reply({ 
                content: "❌ Errore: Assicurati che il ruolo del Bot sia **SOPRA** i ruoli dei Warn nella lista ruoli di Discord!", 
                ephemeral: true 
            });
        }
    },
};

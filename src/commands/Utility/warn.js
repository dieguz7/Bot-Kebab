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

        // --- CONFIGURAZIONE RUOLI TRAMITE ID ---
        // Sostituisci i numeri tra le virgolette con gli ID reali del tuo server
        const role1 = interaction.guild.roles.cache.get("1475491699164709038"); 
        const role2 = interaction.guild.roles.cache.get("1475491577160798382"); 
        const role3 = interaction.guild.roles.cache.get("1475491244980441128"); 

        // Controllo se gli ID inseriti sono corretti
        if (!role1 || !role2 || !role3) {
            return interaction.reply({ 
                content: "❌ Errore: Uno o più ID dei ruoli non sono stati trovati. Controlla di averli incollati correttamente nello script!", 
                ephemeral: true 
            });
        }

        let ruoloDaAggiungere;
        let livello = 0;
        let msScadenza = 0;
        let giorniTesto = "";

        try {
            // --- LOGICA PROGRESSIVA CON SCADENZE ---
            if (target.roles.cache.has(role3.id)) {
                return interaction.reply({ content: `⚠️ ${target} ha già raggiunto il massimo dei richiami (${role3}).`, ephemeral: true });
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
                // Ricarica il membro per essere sicuri che sia ancora nel server
                const memberCheck = await interaction.guild.members.fetch(target.id).catch(() => null);
                if (memberCheck && memberCheck.roles.cache.has(ruoloDaAggiungere.id)) {
                    await memberCheck.roles.remove(ruoloDaAggiungere).catch(() => {});
                    console.log(`Warn ${livello} rimosso a ${target.user.tag} per scadenza.`);
                }
            }, msScadenza);

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Errore nei permessi: il ruolo del bot deve essere sopra i ruoli dei Warn nella lista ruoli.", ephemeral: true });
        }
    },
};

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('testwarn')
        .setDescription('Assegna un richiamo con scadenza automatica')
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

        // --- CONFIGURAZIONE ---
        const rNames = {
            1: "​​🟡​​| Warn Interno 1",
            2: "🟠​​| Warn Interno 2",
            3: "​🔴​| Warn Interno 3"
        };

        const scadenze = {
            1: 5 * 24 * 60 * 60 * 1000,  // 5 Giorni in millisecondi
            2: 10 * 24 * 60 * 60 * 1000, // 10 Giorni
            3: 15 * 24 * 60 * 60 * 1000  // 15 Giorni
        };

        const role1 = interaction.guild.roles.cache.find(r => r.name === rNames[1]);
        const role2 = interaction.guild.roles.cache.find(r => r.name === rNames[2]);
        const role3 = interaction.guild.roles.cache.find(r => r.name === rNames[3]);

        if (!role1 || !role2 || !role3) {
            return interaction.reply({ content: "❌ Errore: Ruoli non trovati sul server.", ephemeral: true });
        }

        let ruoloDaAggiungere;
        let livello = 0;
        let giorniScadenza = 0;

        // --- LOGICA AVANZATA ---
        if (target.roles.cache.has(role3.id)) {
            return interaction.reply({ content: `⚠️ ${target} ha già il massimo dei warn.`, ephemeral: true });
        } 
        else if (target.roles.cache.has(role2.id)) {
            await target.roles.remove(role2);
            await target.roles.add(role3);
            ruoloDaAggiungere = role3;
            livello = 3;
            giorniScadenza = 15;
        } 
        else if (target.roles.cache.has(role1.id)) {
            await target.roles.remove(role1);
            await target.roles.add(role2);
            ruoloDaAggiungere = role2;
            livello = 2;
            giorniScadenza = 10;
        } 
        else {
            await target.roles.add(role1);
            ruoloDaAggiungere = role1;
            livello = 1;
            giorniScadenza = 5;
        }

        // --- EMBED STILE FOTO ---
        const embed = new EmbedBuilder()
            .setTitle("⚠️ Nuovo Warn")
            .setColor(ruoloDaAggiungere.color || "#ffcc00")
            .setDescription(`${target}`)
            .addFields(
                { name: "Applicato da", value: `${interaction.user}`, inline: true },
                { name: "Utente sanzionato", value: `${target}`, inline: true },
                { name: "Tipo", value: `${ruoloDaAggiungere}`, inline: true },
                { name: "✉️ Motivazione", value: motivo }
            )
            .setFooter({ text: `Warn Livello ${livello} | Scade tra ${giorniScadenza} giorni` })
            .setTimestamp();

        await interaction.reply({ content: `${target}`, embeds: [embed] });

        // --- LOGICA SCADENZA (AUTO-RIMOZIONE) ---
        setTimeout(async () => {
            // Controlliamo se l'utente ha ancora quel ruolo specifico prima di toglierlo
            if (target.roles.cache.has(ruoloDaAggiungere.id)) {
                await target.roles.remove(ruoloDaAggiungere).catch(() => {});
                console.log(`Ruolo ${ruoloDaAggiungere.name} rimosso a ${target.user.tag} per scadenza.`);
            }
        }, scadenze[livello]);
    },
};

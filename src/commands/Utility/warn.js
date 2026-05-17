import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Assegna un richiamo ad un utente')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => 
            option.setName('utente').setDescription('L’utente da richiamare').setRequired(true))
        .addStringOption(option => 
            option.setName('motivo').setDescription('Motivazione del richiamo').setRequired(true)),

    async execute(interaction) {
        const RUOLO_AUTORIZZATO = '1475489565430251542'; 

        if (!interaction.member.roles.cache.has(RUOLO_AUTORIZZATO)) {
            return await interaction.reply({ content: "❌ Non hai i permessi.", ephemeral: true });
        }

        const target = interaction.options.getMember('utente');
        const motivo = interaction.options.getString('motivo');

        const role1 = interaction.guild.roles.cache.get("1475491699164709038"); 
        const role2 = interaction.guild.roles.cache.get("1475491577160798382"); 
        const role3 = interaction.guild.roles.cache.get("1475491244980441128"); 

        let livello = 0;
        let giorniScadenza = 0;

        if (target.roles.cache.has(role2.id)) {
            await target.roles.remove(role2); await target.roles.add(role3);
            livello = 3; giorniScadenza = 15;
        } else if (target.roles.cache.has(role1.id)) {
            await target.roles.remove(role1); await target.roles.add(role2);
            livello = 2; giorniScadenza = 10;
        } else {
            await target.roles.add(role1);
            livello = 1; giorniScadenza = 5;
        }

        // --- LOGICA PER IL TESTO PICCOLO (FOOTER) ---
        // Prendiamo l'ora esatta di adesso
        const oraAttuale = new Date();
        const orarioFormattato = oraAttuale.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        // --------------------------------------------

        const embed = new EmbedBuilder()
            .setTitle("⚠️ Nuovo Warn")
            .setColor("#ffcc00")
            .addFields(
                { name: "Applicato da", value: `${interaction.user}`, inline: false },
                { name: "Utente sanzionato", value: `${target}`, inline: false },
                { name: "Tipo", value: `<@&${role1.id}>`, inline: false }, // Esempio
                { name: "📩 Motivazione", value: motivo, inline: false }
            )
            // Il Footer con il font piccolo e l'orario come in foto
            .setFooter({ 
                text: `Warn Livello ${livello} | Scade tra ${giorniScadenza} giorni | Oggi alle ${orarioFormattato}` 
            });

        await interaction.reply({ content: `${target}`, embeds: [embed] });
    },
};

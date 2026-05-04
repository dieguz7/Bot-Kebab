import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

// Memoria temporanea dei warn: ID_Utente -> Numero_Warn
const warnDatabase = new Map();

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Aggiungi un richiamo a un utente')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers) // Solo staffer
        .addUserOption(option => 
            option.setName('utente')
                .setDescription('L’utente da richiamare')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('motivo')
                .setDescription('Perché stai mettendo il richiamo?')
                .setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getUser('utente');
        const motivo = interaction.options.getString('motivo') || "Nessun motivo specificato";
        const userId = target.id;

        // Recupera i warn attuali o parti da 0
        let currentWarns = warnDatabase.get(userId) || 0;
        
        // Aumenta di 1
        currentWarns++;

        if (currentWarns > 3) {
            return await interaction.reply({ 
                content: `⚠️ L'utente ${target} ha già il numero massimo di richiami (3/3). Bisogna procedere con provvedimenti superiori!`, 
                ephemeral: false 
            });
        }

        // Salva il nuovo valore
        warnDatabase.set(userId, currentWarns);

        const embed = new EmbedBuilder()
            .setTitle("⚠️ Nuovo Richiamo Eseguito")
            .setColor(currentWarns === 1 ? "#ffcc00" : currentWarns === 2 ? "#ff9900" : "#ff0000")
            .addFields(
                { name: "👤 Utente", value: `${target}`, inline: true },
                { name: "📊 Conteggio", value: `**${currentWarns} / 3**`, inline: true },
                { name: "✍️ Staffer", value: `${interaction.user}`, inline: true },
                { name: "📝 Motivo", value: motivo }
            )
            .setFooter({ text: "Al 4° richiamo non sarà più possibile aggiungere warn." })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Messaggio privato all'utente
        try {
            await target.send(`Sei stato richiamato su **${interaction.guild.name}**.\nRichiamo attuale: **${currentWarns}/3**\nMotivo: ${motivo}`);
        } catch (err) {
            console.log("Impossibile inviare DM all'utente.");
        }
    },
};

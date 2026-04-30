import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('gestisci-fondi')
        .setDescription('Aggiungi o rimuovi soldi dal fondo cassa')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Solo admin
        .addStringOption(option =>
            option.setName('operazione')
                .setDescription('Scegli cosa fare')
                .setRequired(true)
                .addChoices(
                    { name: 'Aggiungi (Entrata)', value: 'add' },
                    { name: 'Rimuovi (Acquisto/Uscita)', value: 'remove' }
                ))
        .addIntegerOption(option =>
            option.setName('importo')
                .setDescription('Quantità di denaro')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivazione del movimento')
                .setRequired(false)),

    async execute(interaction) {
        const operazione = interaction.options.getString('operazione');
        const importo = interaction.options.getInteger('importo');
        const motivo = interaction.options.getString('motivo') || "Nessun motivo specificato";

        // Inizializza il saldo se non esiste
        if (global.aziendaSaldo === undefined) global.aziendaSaldo = 0;

        if (operazione === 'add') {
            global.aziendaSaldo += importo;
            await interaction.reply({ 
                content: `✅ Aggiunti **${importo}€** al fondo cassa.\n**Motivo:** ${motivo}\nNuovo saldo: **${global.aziendaSaldo}€**` 
            });
        } else {
            global.aziendaSaldo -= importo;
            await interaction.reply({ 
                content: `💸 Rimossi **${importo}€** per acquisti.\n**Motivo:** ${motivo}\nNuovo saldo: **${global.aziendaSaldo}€**` 
            });
        }
    },
};

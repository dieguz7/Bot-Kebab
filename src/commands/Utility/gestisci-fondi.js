import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
    category: "utility",
    data: new SlashCommandBuilder()
        .setName('gestisci-fondo')
        .setDescription('Aggiungi o rimuovi soldi dal fondo cassa')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Protezione base Discord
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
        // --- CONFIGURAZIONE RUOLI AUTORIZZATI ---
        const ruoliAmmessi = ['1475489964664950905', '1498386121124610208']; // <--- Inserisci qui i due ID

        // Controllo se l'utente ha almeno uno dei ruoli autorizzati
        if (!interaction.member.roles.cache.some(role => ruoliAmmessi.includes(role.id))) {
            return await interaction.reply({ 
                content: "❌ Non hai l'autorizzazione per gestire i movimenti del fondo cassa.", 
                ephemeral: true 
            });
        }
        // --- FINE CONTROLLO ---

        const operazione = interaction.options.getString('operazione');
        const importo = interaction.options.getInteger('importo');
        const motivo = interaction.options.getString('motivo') || "Nessun motivo specificato";
        const emojiSoldi = "<a:soldi:1490701352148664360>"; // La tua emoji animata

        // Inizializza il saldo se non esiste
        if (global.aziendaSaldo === undefined) global.aziendaSaldo = 0;

        if (operazione === 'add') {
            global.aziendaSaldo += importo;
            await interaction.reply({ 
                content: `✅ ${emojiSoldi} Aggiunti **${importo.toLocaleString()}€** al fondo cassa.\n**Motivo:** ${motivo}\nNuovo saldo: **${global.aziendaSaldo.toLocaleString()}€**` 
            });
        } else {
            global.aziendaSaldo -= importo;
            await interaction.reply({ 
                content: `💸 ${emojiSoldi} Rimossi **${importo.toLocaleString()}€** per acquisti.\n**Motivo:** ${motivo}\nNuovo saldo: **${global.aziendaSaldo.toLocaleString()}€**` 
            });
        }
    },
};

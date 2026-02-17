const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const SUPPORT_ROLE_ID = "1472692011055185970";
let ticketCounter = 1000;

client.once("ready", async () => {
  console.log(`Bot pornit ca ${client.user.tag}`);
});

// 🔥 COMANDA !ticket
client.on("messageCreate", async (message) => {
  if (message.content === "!ticket") {

    const embed = new EmbedBuilder()
      .setColor("#DB9D02")
      .setTitle("Reselleru' | Support")
      .setDescription(`
 **<a:437007ticket:1473422389025964254> Centru Tichete**

Bine ai venit în comunitatea Reselleru'!  
Alege categoria potrivită mai jos pentru a crea un ticket.  
Echipa noastră te va ajuta în cel mai scurt timp.

🕒 **Program de lucru standard:** \`17:00 - 00:00\`  
*Notă: Timpul de răspuns poate varia în afara programului.*

---

🛠️ **Suport**  
Selectează această opțiune pentru probleme tehnice, întrebări generale sau ajutor legat de cont.

🛒 **Cumpărare**  
Selectează această categorie pentru a cumpăra servicii sau produse de la noi.
`)
      .setImage("https://i.imgur.com/NevhDQj.gif")
      .setFooter({ text: "Reselleru | Sistem Tichete" });

    const menu = new StringSelectMenuBuilder()
      .setCustomId("select_ticket")
      .setPlaceholder("Select a ticket type")
      .addOptions([
        {
          label: "Suport",
          description: "Probleme tehnice sau ajutor",
          value: "support"
        },
        {
          label: "Cumpărare",
          description: "Cumpără servicii sau produse",
          value: "purchase"
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    message.channel.send({ embeds: [embed], components: [row] });
  }
});


// 🔥 INTERACTIONS
client.on("interactionCreate", async (interaction) => {

  // ===== CREATE TICKET =====
  if (interaction.isStringSelectMenu() && interaction.customId === "select_ticket") {

    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;

    // verificare ticket deja existent
    const existingTicket = guild.channels.cache.find(
      c => c.topic === interaction.user.id
    );

    if (existingTicket) {
      return interaction.editReply({
        content: "❌ Ai deja un tichet deschis!"
      });
    }

    ticketCounter++;

    const channel = await guild.channels.create({
      name: `ticket-${ticketCounter}`,
      type: ChannelType.GuildText,
      topic: interaction.user.id, // salvăm owner-ul
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages
          ]
        },
        {
          id: SUPPORT_ROLE_ID,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages
          ]
        }
      ]
    });

    const closeButton = new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("🔒 Închide Tichet")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(closeButton);

    const ticketEmbed = new EmbedBuilder()
      .setColor("#DB9D02")
      .setTitle("<a:437007ticket:1473422389025964254> Tichet creat")
      .setDescription(`
Salut ${interaction.user} 👋

Categoria selectată: **${interaction.values[0].toUpperCase()}**

Te rugăm să descrii problema ta și un membru Support te va ajuta cât mai rapid.
`)
      .setFooter({ text: "Reselleru Suport" });

    await channel.send({
      content: `<@${interaction.user.id}> <@&${SUPPORT_ROLE_ID}>`,
      embeds: [ticketEmbed],
      components: [row]
    });

    await interaction.editReply({
      content: `✅ Tichet creat: ${channel}`
    });
  }

  // ===== CLOSE TICKET =====
  if (interaction.isButton() && interaction.customId === "close_ticket") {

    await interaction.reply({
      content: "🔒 Tichetul se închide în 5 secunde..."
    });

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 5000);
  }
});


client.login(process.env.TOKEN);

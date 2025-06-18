const express = require("express");
const cors = require("cors");
const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;
const GUILD_ID = process.env.GUILD_ID;

app.use(cors());
app.use(express.static("public"));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

let cachedGuild;

client.on("ready", async () => {
  console.log(`🤖 Bot đã đăng nhập với tên ${client.user.tag}`);

  try {
    cachedGuild = await client.guilds.fetch(GUILD_ID);
    console.log(`✅ Đã fetch guild: ${cachedGuild.name}`);
  } catch (err) {
    console.error("❌ Không thể lấy guild:", err);
  }
});

client.login(process.env.DISCORD_TOKEN);

app.get("/discord-status", async (req, res) => {
  const userId = req.query.user;
  if (!userId) return res.status(400).json({ error: "Thiếu userId" });

  if (!cachedGuild) {
    return res.status(500).json({ error: "Guild chưa được tải hoặc chưa fetch xong" });
  }

  try {
    let member = cachedGuild.members.cache.get(userId);
    if (!member) {
      member = await cachedGuild.members.fetch(userId);
    }

    const presence = member.presence;

    res.json({
      username: member.user.username,
      avatar: member.user.displayAvatarURL({ dynamic: true, size: 128 }),
      status: presence?.status || "offline",
      activity: presence?.activities?.[0]?.name || "Không hoạt động",
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy trạng thái:", err);
    res.status(500).json({ error: "Lỗi xử lý" });
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Server chạy tại http://localhost:${PORT}`);
});

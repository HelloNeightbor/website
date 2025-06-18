const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID; // Thêm vào .env

app.use(cors());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});

let guild; // Biến để lưu guild

client.once("ready", async () => {
  console.log(`🤖 Bot đã đăng nhập với tên ${client.user.tag}`);

  try {
    guild = await client.guilds.fetch(GUILD_ID);
    await guild.members.fetch(); // Nạp thành viên vào cache
    console.log("✅ Đã lấy guild và cache members");
  } catch (err) {
    console.error("❌ Không thể lấy guild:", err);
  }
});

app.get("/discord-status", async (req, res) => {
  const userId = req.query.user;

  if (!userId || !guild) {
    return res.status(400).json({ error: "Thiếu user ID hoặc guild chưa sẵn sàng" });
  }

  try {
    const member = await guild.members.fetch(userId);
    const presence = member.presence;
    const status = presence?.status || "offline";
    const activity = presence?.activities?.[0]?.name || "Không hoạt động";

    res.json({
      username: member.user.username + "#" + member.user.discriminator,
      avatar: member.user.displayAvatarURL(),
      status,
      activity
    });
  } catch (err) {
    console.error("❌ Lỗi khi fetch member:", err);
    res.status(500).json({ error: "Không tìm thấy user hoặc bot thiếu quyền" });
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Server chạy tại http://localhost:${PORT}`);
});

client.login(process.env.BOT_TOKEN);

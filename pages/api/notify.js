// API route to notify via Telegram
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = '8180113860:AAEQ2FbWk-HUFy55PjUlJ_46jRWUa-_RjdM';
const TELEGRAM_CHAT_ID = '@wellpussy'; // Можно использовать username или chat_id

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { tree, round, username } = req.body || {};
    const date = new Date().toLocaleString('ru-RU');
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: `Пользователь завершил игру!\nДерево: ${tree}\nРаунд: ${round}\nВремя: ${date}${username ? `\nИмя: ${username}` : ''}`,
      parse_mode: 'HTML',
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

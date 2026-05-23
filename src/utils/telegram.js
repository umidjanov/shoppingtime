// ─────────────────────────────────────────────────────────────────────────────
// Telegram Order Sender
//
// HOW TO SET UP (one-time, takes 2 minutes):
//
// 1. Open Telegram, search for @BotFather
// 2. Send /newbot  →  give it any name  →  get your BOT_TOKEN
// 3. Open your new bot and press START (so it knows your chat_id)
// 4. Send /getid to @userinfobot to find YOUR personal chat_id
// 5. Paste both values below and you're done!
//
// ─────────────────────────────────────────────────────────────────────────────

// 👇 PASTE YOUR VALUES HERE
const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';   // e.g. "7123456789:AAFxyz..."
const CHAT_ID   = 'YOUR_CHAT_ID_HERE';     // e.g. "123456789"  (your personal id)

// Username that will appear in every order message
const STORE_USERNAME = '@MalikaMuhiddinovna';

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a nicely formatted order message in all 3 languages.
 */
function buildMessage({ orderInfo, items, subtotal, shipping, total }) {
  const line = '─────────────────────';

  // Product list
  const productLines = items.map((item, i) =>
    `${i + 1}. ${item.name}\n` +
    `   💰 $${item.price} × ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}\n` +
    (item.color ? `   🎨 Rang / Цвет / Color: ${item.color}\n` : '') +
    (item.size  ? `   📐 O'lcham / Размер / Size: ${item.size}\n`  : '')
  ).join('\n');

  const now = new Date();
  const dateStr = now.toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
`🛍️ YANGI BUYURTMA | НОВЫЙ ЗАКАЗ | NEW ORDER
${line}
🏪 ${STORE_USERNAME}
📅 ${dateStr}

👤 MIJOZ MA'LUMOTLARI / ДАННЫЕ КЛИЕНТА
${line}
📛 Ism / Имя / Name: ${orderInfo.fullName}
📞 Telefon / Телефон / Phone: ${orderInfo.phone}
📍 Manzil / Адрес / Address: ${orderInfo.address}
🏙️ Shahar / Город / City: ${orderInfo.city}
${orderInfo.comment ? `💬 Izoh / Комментарий / Note: ${orderInfo.comment}\n` : ''}
🛒 BUYURTMA / ЗАКАЗ / ORDER
${line}
${productLines}
${line}
📦 Yetkazib berish / Доставка / Shipping: ${shipping === 0 ? '✅ Bepul / Бесплатно / Free' : `$${shipping}`}
💵 Jami / Итого / Total: $${total.toFixed(2)}

🚚 Yetkazib berish usuli / Способ доставки:
${orderInfo.deliveryMethod === 'delivery' ? '🏠 Uyga yetkazish / Доставка на дом / Home delivery' : '🏪 Do\'kondan olish / Самовывоз / Pickup'}

💳 To'lov usuli / Способ оплаты / Payment:
${orderInfo.paymentMethod === 'cash' ? '💵 Naqd pul / Наличные / Cash' : '💳 Karta / Карта / Card'}
`
  );
}

/**
 * Send order to Telegram.
 * Returns { success: boolean, error?: string }
 */
export async function sendOrderToTelegram({ orderInfo, items, subtotal, shipping, total }) {
  if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    console.warn('[Telegram] Bot token not configured. Set BOT_TOKEN in src/utils/telegram.js');
    // In demo mode, simulate success so the UI still works
    return { success: true, demo: true };
  }

  const text = buildMessage({ orderInfo, items, subtotal, shipping, total });

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: 'HTML',
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      console.error('[Telegram] API error:', data);
      return { success: false, error: data.description ?? 'Telegram API error' };
    }

    return { success: true };
  } catch (err) {
    console.error('[Telegram] Network error:', err);
    return { success: false, error: 'Network error. Check your connection.' };
  }
}

/**
 * Generate a simple readable order number.
 */
export function generateOrderNumber() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `LT-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Math.floor(Math.random() * 9000) + 1000}`;
}

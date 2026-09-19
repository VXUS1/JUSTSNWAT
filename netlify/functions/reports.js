exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // رابط الويب هوك تبع ديسكورد
  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1550894622069497908/cuRgeoQ8vN_Ftq6rvZ7bDCqGiV-KRFL7p6xPRhvnP6FpSm4pzanrzLJ2JCDV0KADDmSw/slack";

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: event.body
    });
    return { statusCode: 200, body: JSON.stringify({ message: "Sent!" }) };
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};
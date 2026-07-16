import { ok, serverError, badRequest } from 'wix-http-functions';
import wixData from 'wix-data';

// Endpoint accessible at: https://alt-vibe.net/_functions/updateTapPredictions
export async function post_updateTapPredictions(request) {
  const response = {
    "headers": {
      "Content-Type": "application/json"
    }
  };

  try {
    const body = await request.body.json();
    
    // Security check: Verify API Secret Token
    const authHeader = request.headers["authorization"];
    const API_SECRET = "TAP_MODEL_SECURE_RESONANCE_KEY"; // Change to a secure key if needed
    if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
      response.body = { "error": "Unauthorized Access" };
      return badRequest(response);
    }

    const dateStr = body.timestamp ? body.timestamp.split('T')[0] : new Date().toISOString().split('T')[0];

    const toInsert = {
      "date": dateStr,
      "payload": JSON.stringify(body)
    };

    // Query if record for today already exists to update it, or insert fresh
    const results = await wixData.query("TapPredictions")
      .eq("date", dateStr)
      .find();

    if (results.items.length > 0) {
      toInsert._id = results.items[0]._id; // Map existing ID to overwrite
      await wixData.update("TapPredictions", toInsert);
    } else {
      await wixData.insert("TapPredictions", toInsert);
    }

    response.body = { "status": "success", "date": dateStr };
    return ok(response);

  } catch (error) {
    response.body = { "error": error.message };
    return serverError(response);
  }
}

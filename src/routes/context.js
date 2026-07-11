const express = require("express");
const router = express.Router();

const contextStore = require("../services/contextStore");

router.post("/", (req, res) => {
  const { scope, context_id, version, payload } = req.body;

  // Basic validation
  if (!scope || !context_id || version === undefined || !payload) {
    return res.status(400).json({
      accepted: false,
      reason: "invalid_request",
    });
  }

  // Decide which store to use
  let store;

  switch (scope) {
    case "category":
      store = contextStore.categories;
      break;

    case "merchant":
      store = contextStore.merchants;
      break;

    case "customer":
      store = contextStore.customers;
      break;

    case "trigger":
      store = contextStore.triggers;
      break;

    default:
      return res.status(400).json({
        accepted: false,
        reason: "invalid_scope",
      });
  }

  // Version Check
  const existing = store.get(context_id);

  if (existing && version <= existing.version) {
    return res.status(409).json({
      accepted: false,
      reason: "stale_version",
      current_version: existing.version,
    });
  }

  // Store Context
  store.set(context_id, {
    version,
    payload,
  });

  return res.status(200).json({
    accepted: true,
    ack_id: `ack_${context_id}_v${version}`,
    stored_at: new Date().toISOString(),
  });
});

module.exports = router;
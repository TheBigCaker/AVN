function roundMoney(value) {
  return Number(Number(value).toFixed(2));
}

function buildPartQuantities(parts) {
  const quantityBySku = new Map();
  const partsArray = Array.isArray(parts) ? parts : [];

  for (const part of partsArray) {
    if (typeof part === 'string' && part.trim()) {
      quantityBySku.set(part, (quantityBySku.get(part) || 0) + 1);
      continue;
    }

    if (part && typeof part === 'object' && typeof part.sku === 'string' && part.sku.trim()) {
      const quantity = Math.max(1, Number(part.quantity) || 1);
      quantityBySku.set(part.sku, (quantityBySku.get(part.sku) || 0) + quantity);
    }
  }

  return quantityBySku;
}

function calculateInvoiceTotals({ hours, laborRate, partRows, quantityBySku }) {
  const totalLabor = roundMoney(Math.max(0, Number(hours) || 0) * Math.max(0, Number(laborRate) || 0));

  let totalParts = 0;
  for (const row of partRows) {
    totalParts += Number(row.retail_price) * (quantityBySku.get(row.sku) || 0);
  }

  totalParts = roundMoney(totalParts);
  const grandTotal = roundMoney(totalLabor + totalParts);

  return { totalLabor, totalParts, grandTotal };
}

module.exports = {
  roundMoney,
  buildPartQuantities,
  calculateInvoiceTotals,
};

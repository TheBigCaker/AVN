const { buildPartQuantities, calculateInvoiceTotals } = require('../src/invoice');

describe('invoice helpers', () => {
  test('buildPartQuantities handles string and object part formats', () => {
    const quantities = buildPartQuantities([
      'SKU-1',
      { sku: 'SKU-2', quantity: 3 },
      { sku: 'SKU-2', quantity: 0 },
      { sku: 'SKU-3' },
      null,
    ]);

    expect(quantities.get('SKU-1')).toBe(1);
    expect(quantities.get('SKU-2')).toBe(4);
    expect(quantities.get('SKU-3')).toBe(1);
  });

  test('calculateInvoiceTotals returns exact rounded totals', () => {
    const quantityBySku = new Map([
      ['SKU-1', 2],
      ['SKU-2', 1],
    ]);

    const totals = calculateInvoiceTotals({
      hours: 1.25,
      laborRate: 89.99,
      partRows: [
        { sku: 'SKU-1', retail_price: '10.50' },
        { sku: 'SKU-2', retail_price: '4.20' },
      ],
      quantityBySku,
    });

    expect(totals).toEqual({
      totalLabor: 112.49,
      totalParts: 25.2,
      grandTotal: 137.69,
    });
  });
});

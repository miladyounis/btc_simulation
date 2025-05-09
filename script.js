document.getElementById("btcForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  // Fetch USD to BGN rate automatically
  let usdToBgn;
  try {
    const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=BGN');
    const data = await response.json();
    usdToBgn = data.rates.BGN;
  } catch (error) {
    console.error("Failed to fetch exchange rate:", error);
    alert("Error fetching exchange rate. Using fallback rate: 1.80 BGN/USD.");
    usdToBgn = 1.80; // Fallback rate
  }

  const currentBtc = parseFloat(document.getElementById("currentBtc").value);
  const minBtc = parseFloat(document.getElementById("minBtc").value);
  const sellPrice = parseFloat(document.getElementById("sellPrice").value);
  const buyPrice = parseFloat(document.getElementById("buyPrice").value);
  const debt = parseFloat(document.getElementById("debt").value);
  const targetProfit = parseFloat(document.getElementById("targetProfit").value);
  const targetBtc = parseFloat(document.getElementById("targetBtc").value);
  const feePercent = parseFloat(document.getElementById("feePercent").value);

  const btcSold = +(currentBtc - minBtc).toFixed(8);
  if (btcSold <= 0) return (document.getElementById("output").innerText = "❌ Error: Not enough BTC to sell.");

  const usdFromSale = +(btcSold * sellPrice * (1 - feePercent / 100)).toFixed(2);
  const bgnFromSale = +(usdFromSale * usdToBgn).toFixed(2);
  const btcAfterSale = +(currentBtc - btcSold).toFixed(8);

  const btcToBuy = +(targetBtc - btcAfterSale).toFixed(8);
  const usdCost = +(btcToBuy * buyPrice * (1 + feePercent / 100)).toFixed(2);
  const bgnCost = +(usdCost * usdToBgn).toFixed(2);

  const profitUsd = +(usdFromSale - usdCost).toFixed(2);
  const profitBgn = +(bgnFromSale - bgnCost).toFixed(2);

  const valueBuyBgn = +(targetBtc * buyPrice * usdToBgn).toFixed(2);
  const crashPrice = +(buyPrice * 0.8).toFixed(2);
  const crashBgn = +(targetBtc * crashPrice * usdToBgn).toFixed(2);

  const collateral = +(currentBtc * buyPrice * usdToBgn).toFixed(2);
  const ltv = collateral > 0 ? +(debt / collateral * 100).toFixed(1) : 0;

  const targetProfitUsd = +(targetProfit / usdToBgn).toFixed(2);
  const requiredSell = +((targetProfitUsd + btcSold * buyPrice * (1 + feePercent / 100)) / (btcSold * (1 - feePercent / 100))).toFixed(2);
  const requiredBuy = +((btcSold * sellPrice * (1 - feePercent / 100) - targetProfitUsd) / (btcSold * (1 + feePercent / 100))).toFixed(2);

  // 🔢 Calculate max BTC buyback to still meet profit goal
  const maxUsdCost = +(usdFromSale - targetProfitUsd).toFixed(2);
  const maxBtcBuy = +((maxUsdCost / buyPrice) / (1 + feePercent / 100)).toFixed(8);
  const finalBtcAfterMaxBuyback = +(btcAfterSale + maxBtcBuy).toFixed(8);

  const out = `
==================================================
**BTC TRADING SIMULATION**
==================================================
📊 Current Holdings
- Current BTC: ${currentBtc.toFixed(8)}
- Debt: ${debt.toLocaleString()} BGN
- Exchange Rate: 1 USD = ${usdToBgn.toFixed(4)} BGN (auto-fetched)

💸 Trade Execution
- Sold ${btcSold.toFixed(8)} BTC @ $${sellPrice} → $${usdFromSale} | ${bgnFromSale} BGN (after ${feePercent}% fee)
- Buyback ${btcToBuy.toFixed(8)} BTC @ $${buyPrice} → $${usdCost} | ${bgnCost} BGN

✅ Profit: $${profitUsd} USD | ${profitBgn} BGN
🔮 Final BTC: ${targetBtc.toFixed(8)}

📈 Max Buyback for Target Profit
- Max BTC you can buy back and still hit ${targetProfit} BGN profit: ${maxBtcBuy.toFixed(8)} BTC
- Final BTC after max buyback: ${finalBtcAfterMaxBuyback.toFixed(8)} BTC

⚡ Risk Analysis
- 0.5 BTC at buyback price = ${valueBuyBgn} BGN
- If BTC drops 20%: ${crashBgn} BGN ($${crashPrice})
- LTV: ${ltv}% ${ltv > 60 ? "🚨 WARNING: Over 60%!" : ""}

🎯 Profit Target
- Required SELL price for ${targetProfit} BGN profit: $${requiredSell}
- Required BUYBACK price for ${targetProfit} BGN profit: $${requiredBuy}
==================================================
`;

  document.getElementById("output").innerText = out;
});

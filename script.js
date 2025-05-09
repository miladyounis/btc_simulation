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

  // Retrieve and validate inputs
  const currentBtc = parseFloat(document.getElementById("currentBtc").value);
  const minBtc = parseFloat(document.getElementById("minBtc").value);
  const sellPrice = parseFloat(document.getElementById("sellPrice").value);
  const buyPrice = parseFloat(document.getElementById("buyPrice").value);
  const debt = parseFloat(document.getElementById("debt").value);
  const targetProfit = parseFloat(document.getElementById("targetProfit").value);
  const targetBtc = parseFloat(document.getElementById("targetBtc").value);
  const feePercent = parseFloat(document.getElementById("feePercent").value);

  // Input validation
  if (isNaN(currentBtc) || currentBtc < 0) {
    return (document.getElementById("output").innerText = "❌ Error: Current BTC must be a non-negative number.");
  }
  if (isNaN(minBtc) || minBtc < 0) {
    return (document.getElementById("output").innerText = "❌ Error: Minimum BTC must be a non-negative number.");
  }
  if (isNaN(sellPrice) || sellPrice <= 0) {
    return (document.getElementById("output").innerText = "❌ Error: Sell price must be a positive number.");
  }
  if (isNaN(buyPrice) || buyPrice <= 0) {
    return (document.getElementById("output").innerText = "❌ Error: Buy price must be a positive number.");
  }
  if (isNaN(debt) || debt < 0) {
    return (document.getElementById("output").innerText = "❌ Error: Debt must be a non-negative number.");
  }
  if (isNaN(targetProfit) || targetProfit < 0) {
    return (document.getElementById("output").innerText = "❌ Error: Target profit must be a non-negative number.");
  }
  if (isNaN(targetBtc) || targetBtc < 0) {
    return (document.getElementById("output").innerText = "❌ Error: Target BTC must be a non-negative number.");
  }
  if (isNaN(feePercent) || feePercent < 0 || feePercent > 100) {
    return (document.getElementById("output").innerText = "❌ Error: Fee percentage must be between 0 and 100.");
  }

  // Calculate BTC to sell
  const btcSold = +(currentBtc - minBtc).toFixed(8);
  if (btcSold <= 0) {
    return (document.getElementById("output").innerText = "❌ Error: Not enough BTC to sell (current BTC must be greater than minimum BTC).");
  }

  // Calculate sale proceeds
  const usdFromSale = +(btcSold * sellPrice * (1 - feePercent / 100)).toFixed(2);
  const bgnFromSale = +(usdFromSale * usdToBgn).toFixed(2);
  const btcAfterSale = +(currentBtc - btcSold).toFixed(8);

  // Calculate buyback costs
  const btcToBuy = +(targetBtc - btcAfterSale).toFixed(8);
  if (btcToBuy < 0) {
    return (document.getElementById("output").innerText = "❌ Error: Target BTC is less than BTC after sale. No buyback needed.");
  }
  const usdCost = +(btcToBuy * buyPrice * (1 + feePercent / 100)).toFixed(2);
  const bgnCost = +(usdCost * usdToBgn).toFixed(2);

  // Calculate profit
  const profitUsd = +(usdFromSale - usdCost).toFixed(2);
  const profitBgn = +(bgnFromSale - bgnCost).toFixed(2);

  // Risk analysis
  const crashPrice = +(buyPrice * 0.8).toFixed(2);
  const crashBgn = +(targetBtc * crashPrice * usdToBgn).toFixed(2);
  const collateral = +(currentBtc * buyPrice * usdToBgn).toFixed(2);
  const ltv = collateral > 0 ? +(debt / collateral * 100).toFixed(1) : 0;

  // Profit target calculations
  const targetProfitUsd = +(targetProfit / usdToBgn).toFixed(2);
  const requiredSell = +((targetProfitUsd + (btcToBuy * buyPrice * (1 + feePercent / 100))) / (btcSold * (1 - feePercent / 100))).toFixed(2);
  const requiredBuy = +((btcSold * sellPrice * (1 - feePercent / 100) - targetProfitUsd) / (btcToBuy * (1 + feePercent / 100))).toFixed(2);

  // Calculate max BTC buyback to meet profit goal
  const maxUsdCost = +(usdFromSale - targetProfitUsd).toFixed(2);
  const maxBtcBuy = maxUsdCost >= 0 ? +((maxUsdCost / buyPrice) / (1 + feePercent / 100)).toFixed(8) : 0;
  const finalBtcAfterMaxBuyback = +(btcAfterSale + maxBtcBuy).toFixed(8);

  // Generate output
  const out = `
==================================================
**BTC TRADING SIMULATION**
==================================================
📊 Current Holdings
- Current BTC: ${currentBtc.toFixed(8)}
- Debt: ${debt.toLocaleString()} BGN
- Exchange Rate: 1 USD = ${usdToBgn.toFixed(4)} BGN (auto-fetched)

💸 Trade Execution
- Sold ${btcSold.toFixed(8)} BTC @ $${sellPrice.toLocaleString()} → $${usdFromSale.toLocaleString()} | ${bgnFromSale.toLocaleString()} BGN (after ${feePercent}% fee)
- Buyback ${btcToBuy.toFixed(8)} BTC @ $${buyPrice.toLocaleString()} → $${usdCost.toLocaleString()} | ${bgnCost.toLocaleString()} BGN

✅ Profit: $${profitUsd.toLocaleString()} USD | ${profitBgn.toLocaleString()} BGN
🔮 Final BTC: ${targetBtc.toFixed(8)}

⚡ Risk Analysis
- If BTC drops 20%: ${crashBgn.toLocaleString()} BGN ($${crashPrice.toLocaleString()})
- LTV: ${ltv}% ${ltv > 60 ? "🚨 WARNING: Over 60%!" : ""}

📈 Max Buyback for Target Profit
- Max BTC you can buy back and still hit ${targetProfit.toLocaleString()} BGN profit: ${maxBtcBuy.toFixed(8)} BTC${maxUsdCost < 0 ? " (Target profit unattainable with current sale proceeds)" : ""}
- Final BTC after max buyback: ${finalBtcAfterMaxBuyback.toFixed(8)} BTC

🎯 Profit Target
- Required SELL price for ${targetProfit.toLocaleString()} BGN profit: $${requiredSell.toLocaleString()}
- Required BUYBACK price for ${targetProfit.toLocaleString()} BGN profit: $${requiredBuy.toLocaleString()}
==================================================
`;

  document.getElementById("output").innerText = out;
});

document.getElementById('dcaForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Fetch latest USD to BGN rate
  let usdToBgn;
  try {
    const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=BGN');
    const data = await response.json();
    usdToBgn = data.rates.BGN;
    document.getElementById('usdToBgn').value = usdToBgn.toFixed(4); // Optional: Display fetched rate in input
  } catch (error) {
    console.error("Failed to fetch exchange rate:", error);
    alert("Error fetching exchange rate. Using default 1.80 BGN/USD.");
    usdToBgn = 1.80; // Fallback rate
  }

  const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestment').value);
  const duration = parseInt(document.getElementById('duration').value);
  const btcPrice = parseFloat(document.getElementById('btcPrice').value);

  const monthlyUSD = monthlyInvestment / usdToBgn;
  const monthlyBTC = monthlyUSD / btcPrice;
  const totalBTC = monthlyBTC * duration;
  const totalInvestedBGN = monthlyInvestment * duration;

  const output = `
    <p><strong>Exchange Rate:</strong> 1 USD = ${usdToBgn.toFixed(4)} BGN</p>
    <p><strong>Total Invested:</strong> ${totalInvestedBGN.toFixed(2)} BGN</p>
    <p><strong>Estimated BTC Accumulated:</strong> ${totalBTC.toFixed(8)} BTC</p>
    <p><strong>Average Monthly BTC:</strong> ${monthlyBTC.toFixed(8)} BTC</p>
  `;

  document.getElementById('dcaOutput').innerHTML = output;
});

document.getElementById('dcaForm').addEventListener('submit', async function (e) {
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
    usdToBgn = 1.73; // Fallback rate
  }

  // Proceed with calculations
  try {
    const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestment').value);
    const duration = parseInt(document.getElementById('duration').value);
    const btcPrice = parseFloat(document.getElementById('btcPrice').value);

    if (isNaN(monthlyInvestment) || isNaN(duration) || isNaN(btcPrice)) {
      throw new Error('Please fill all fields with valid numbers');
    }

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

    outputElement.innerHTML = output;
  } catch (error) {
    outputElement.innerHTML = `<p class="error">❌ Error: ${error.message}</p>`;
  }
});

document.getElementById('dcaForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Show loading state
  const outputElement = document.getElementById('dcaOutput');
  outputElement.innerHTML = '<p>Fetching exchange rates...</p>';

  // Fetch latest USD to BGN rate with multiple fallback options
  let usdToBgn = 1.80; // Default fallback rate
  try {
    // First try Frankfurter API
    const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=BGN', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    if (data.rates && data.rates.BGN) {
      usdToBgn = data.rates.BGN;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.warn("Primary API failed, trying fallback...", error);
    
    try {
      // Fallback to ExchangeRate-API
      const fallbackResponse = await fetch('https://open.er-api.com/v6/latest/USD');
      const fallbackData = await fallbackResponse.json();
      if (fallbackData.rates && fallbackData.rates.BGN) {
        usdToBgn = fallbackData.rates.BGN;
      }
    } catch (fallbackError) {
      console.error("All exchange rate APIs failed:", fallbackError);
      outputElement.innerHTML += `<p class="warning">⚠️ Using default rate: 1 USD = 1.80 BGN</p>`;
    }
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

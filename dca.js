document.getElementById('dcaForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Get output element reference first
  const outputElement = document.getElementById('dcaOutput');
  outputElement.innerHTML = '<p>Calculating... Please wait.</p>';

  // Fetch USD to BGN rate automatically with timeout
  let usdToBgn = 1.73; // Default fallback rate (updated to your preferred value)
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=BGN', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`API responded with status ${response.status}`);
    
    const data = await response.json();
    if (!data.rates || !data.rates.BGN) throw new Error('Invalid API response format');
    
    usdToBgn = data.rates.BGN;
  } catch (error) {
    console.warn("Exchange rate fetch failed, using fallback:", error);
    outputElement.innerHTML += `<p class="warning">⚠️ Using fallback rate: 1 USD = 1.73 BGN</p>`;
  }

  // Proceed with calculations
  try {
    const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestment').value);
    const duration = parseInt(document.getElementById('duration').value);
    const btcPrice = parseFloat(document.getElementById('btcPrice').value);

    // Validate inputs more thoroughly
    if (isNaN(monthlyInvestment) || monthlyInvestment <= 0) {
      throw new Error('Please enter a valid monthly investment amount');
    }
    if (isNaN(duration) || duration <= 0 || !Number.isInteger(duration)) {
      throw new Error('Please enter a valid whole number of months');
    }
    if (isNaN(btcPrice) || btcPrice <= 0) {
      throw new Error('Please enter a valid BTC price');
    }

    const monthlyUSD = monthlyInvestment / usdToBgn;
    const monthlyBTC = monthlyUSD / btcPrice;
    const totalBTC = monthlyBTC * duration;
    const totalInvestedBGN = monthlyInvestment * duration;

    const output = `
      <div class="result">
        <p><strong>Exchange Rate:</strong> 1 USD = ${usdToBgn.toFixed(4)} BGN</p>
        <p><strong>Total Invested:</strong> ${totalInvestedBGN.toFixed(2)} BGN</p>
        <p><strong>Estimated BTC Accumulated:</strong> ${totalBTC.toFixed(8)} BTC</p>
        <p><strong>Average Monthly BTC:</strong> ${monthlyBTC.toFixed(8)} BTC</p>
      </div>
    `;

    outputElement.innerHTML = output;
  } catch (error) {
    outputElement.innerHTML = `<div class="error">❌ ${error.message}</div>`;
  }
});

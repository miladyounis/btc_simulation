document.getElementById('dcaForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  console.log('Form submitted'); // Debugging line

  try {
    // Debug: Verify element exists
    const outputElement = document.getElementById('dcaOutput');
    if (!outputElement) throw new Error('Could not find output element');
    outputElement.innerHTML = '<p>Calculating...</p>';

    // Fetch exchange rate
    let usdToBgn = 1.73;
    try {
      const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=BGN');
      console.log('API response:', response); // Debugging line
      const data = await response.json();
      usdToBgn = data.rates.BGN;
    } catch (error) {
      console.warn("Using fallback rate due to:", error);
    }

    // Get form values
    const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestment').value);
    const duration = parseInt(document.getElementById('duration').value);
    const btcPrice = parseFloat(document.getElementById('btcPrice').value);
    console.log('Input values:', {monthlyInvestment, duration, btcPrice}); // Debugging line

    // Calculate results
    const monthlyUSD = monthlyInvestment / usdToBgn;
    const monthlyBTC = monthlyUSD / btcPrice;
    const totalBTC = monthlyBTC * duration;
    const totalInvestedBGN = monthlyInvestment * duration;

    outputElement.innerHTML = `
      <p>1 USD = ${usdToBgn.toFixed(4)} BGN</p>
      <p>Total Invested: ${totalInvestedBGN.toFixed(2)} BGN</p>
      <p>Estimated BTC: ${totalBTC.toFixed(8)}</p>
    `;
    
  } catch (error) {
    console.error('Calculation failed:', error);
    alert(`Error: ${error.message}`);
  }
});

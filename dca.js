document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded'); // Debugging
  
  const form = document.getElementById('dcaForm');
  if (!form) {
    console.error('Could not find dcaForm element');
    return;
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('Form submission started'); // Debugging
    
    const outputElement = document.getElementById('dcaOutput');
    if (!outputElement) {
      console.error('Could not find output element');
      return;
    }

    outputElement.innerHTML = '<p>Calculating...</p>';

    try {
      // 1. Get exchange rate
      let usdToBgn;
      try {
        const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=BGN');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        usdToBgn = data.rates.BGN || 1.73; // Fallback to 1.73 if rate missing
        console.log('Fetched exchange rate:', usdToBgn); // Debugging
      } catch (error) {
        console.warn('Failed to fetch exchange rate, using fallback:', error);
        usdToBgn = 1.73;
      }

      // 2. Get form values
      const getValue = (id) => {
        const el = document.getElementById(id);
        if (!el) throw new Error(`Element ${id} not found`);
        const value = parseFloat(el.value);
        if (isNaN(value)) throw new Error(`Invalid value for ${id}`);
        return value;
      };

      const monthlyInvestment = getValue('monthlyInvestment');
      const duration = getValue('duration');
      const btcPrice = getValue('btcPrice');

      // 3. Perform calculations
      const monthlyUSD = monthlyInvestment / usdToBgn;
      const monthlyBTC = monthlyUSD / btcPrice;
      const totalBTC = monthlyBTC * duration;
      const totalInvestedBGN = monthlyInvestment * duration;

      // 4. Display results
      outputElement.innerHTML = `
        <p><strong>Exchange Rate:</strong> 1 USD = ${usdToBgn.toFixed(4)} BGN</p>
        <p><strong>Total Invested:</strong> ${totalInvestedBGN.toFixed(2)} BGN</p>
        <p><strong>Estimated BTC Accumulated:</strong> ${totalBTC.toFixed(8)} BTC</p>
        <p><strong>Average Monthly BTC:</strong> ${monthlyBTC.toFixed(8)} BTC</p>
      `;

    } catch (error) {
      console.error('Calculation error:', error);
      outputElement.innerHTML = `
        <p class="error">❌ Error: ${error.message}</p>
        <p>Please check your inputs and try again.</p>
      `;
    }
  });

  console.log('Event listener attached'); // Debugging
});

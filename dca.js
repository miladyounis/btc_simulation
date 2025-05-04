document.getElementById('dcaForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestment').value);
  const duration = parseInt(document.getElementById('duration').value);
  const btcPrice = parseFloat(document.getElementById('btcPrice').value);
  const usdToBgn = parseFloat(document.getElementById('usdToBgn').value);

  const monthlyUSD = monthlyInvestment / usdToBgn;
  const monthlyBTC = monthlyUSD / btcPrice;
  const totalBTC = monthlyBTC * duration;
  const totalInvestedBGN = monthlyInvestment * duration;

  const output = `
    <p><strong>Total Invested:</strong> ${totalInvestedBGN.toFixed(2)} BGN</p>
    <p><strong>Estimated BTC Accumulated:</strong> ${totalBTC.toFixed(8)} BTC</p>
    <p><strong>Average Monthly BTC:</strong> ${monthlyBTC.toFixed(8)} BTC</p>
  `;

  document.getElementById('dcaOutput').innerHTML = output;
});

document.getElementById("loanSimForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const monthlyPayment = parseFloat(document.getElementById("monthlyPayment").value);
  const monthsLeft = parseInt(document.getElementById("monthsLeft").value);
  const loanPrincipal = parseFloat(document.getElementById("loanPrincipal").value);
  const btcOwned = parseFloat(document.getElementById("btcOwned").value);
  const annualRate = parseFloat(document.getElementById("interestRate").value) || 0;
  const btcPricesUSD = document.getElementById("btcPrices").value.split(",").map(p => parseFloat(p.trim()));
  const usdToBgn = parseFloat(document.getElementById("usdToBgn").value);

  const outputEl = document.getElementById("loanSimOutput");
  const chartContainer = document.getElementById("btcChart");

  if (btcPricesUSD.some(p => isNaN(p) || p <= 0) || isNaN(usdToBgn) || isNaN(monthlyPayment) || isNaN(loanPrincipal) || isNaN(btcOwned)) {
    return outputEl.innerText = "❌ Invalid input values.";
  }

  const totalBGN = monthlyPayment * monthsLeft;
  const totalInterestBGN = annualRate > 0 ? totalBGN * (annualRate / 100) * (monthsLeft / 12) : 0;
  const futureCost = totalBGN + totalInterestBGN;

  let output = `📊 BTC Loan Opportunity Simulation\n\n`;
  output += `Total redirected over ${monthsLeft} months: ${totalBGN.toFixed(2)} BGN\n`;
  if (annualRate > 0) {
    output += `Estimated Interest Paid: ${totalInterestBGN.toFixed(2)} BGN\n`;
    output += `Effective Total Loan Cost: ${futureCost.toFixed(2)} BGN\n`;
  }

  output += `\nBTC Owned: ${btcOwned.toFixed(8)} BTC\nLoan Principal: ${loanPrincipal.toFixed(2)} BGN\n\n`;
  output += `Scenario Results:\n`;
  output += "BTC Price (USD) | BTC to Sell to Repay Loan | BTC After Sell | BTC if DCA Instead | Value in BGN (DCA) | BTC Difference\n";
  output += "----------------|-----------------------------|----------------|--------------------|--------------------|----------------\n";

  const labels = [];
  const btcDiffData = [];

  btcPricesUSD.forEach(usd => {
    const btcPriceBGN = usd * usdToBgn;
    const btcToSell = loanPrincipal / btcPriceBGN;
    const btcAfterSell = btcOwned - btcToSell;
    const btcFromDCA = totalBGN / btcPriceBGN;
    const valueBGN = btcFromDCA * btcPriceBGN;
    const btcDiff = btcFromDCA - btcAfterSell;

    output += `$${usd.toLocaleString().padEnd(12)} | ${btcToSell.toFixed(8).padEnd(27)} | ${btcAfterSell.toFixed(8).padEnd(14)} | ${btcFromDCA.toFixed(8).padEnd(18)} | ${valueBGN.toFixed(2).padEnd(18)} | ${btcDiff.toFixed(8)}\n`;

    // Prepare chart data
    labels.push(usd);
    btcDiffData.push(btcDiff);
  });

  outputEl.innerText = output;

  // Render Chart if Chart.js is available
  if (typeof Chart !== 'undefined' && chartContainer) {
    const ctx = chartContainer.getContext('2d');
    if (window.btcChart) window.btcChart.destroy();
    window.btcChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: "BTC Difference (DCA - Sell to Repay)",
          data: btcDiffData,
          borderColor: "orange",
          backgroundColor: "rgba(255, 165, 0, 0.2)",
          fill: true,
          tension: 0.25
        }]
      },
      options: {
        scales: {
          x: {
            title: { display: true, text: "BTC Price (USD)" }
          },
          y: {
            title: { display: true, text: "BTC Difference" },
            beginAtZero: true
          }
        },
        plugins: {
          tooltip: { callbacks: {
            label: ctx => `Δ BTC: ${ctx.raw.toFixed(8)}`
          }},
          legend: { display: false }
        }
      }
    });
  }
});

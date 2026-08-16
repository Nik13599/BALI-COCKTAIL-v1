(() => {
  if (document.getElementById('bartenderPrintReadabilityV3')) return;
  const style = document.createElement('style');
  style.id = 'bartenderPrintReadabilityV3';
  style.textContent = `
    .tech-print-footer{display:none!important}
    .tech-print-inner{padding:5.5mm!important;gap:2.15mm!important}
    .tech-print-brand{font-size:9pt!important}
    .tech-print-category{font-size:7.4pt!important}
    .tech-print-title{font-size:19pt!important}
    .tech-print-spec span{font-size:7pt!important}
    .tech-print-spec b{font-size:9.2pt!important}
    .tech-print-taste{font-size:8pt!important;line-height:1.22!important}
    .tech-print-section{font-size:8.8pt!important}
    .tech-print-ing{font-size:7.9pt!important;gap:1.6mm!important}
    .tech-print-ing .ing-img,.tech-print-ing .ing-sprite{width:9.5mm!important;height:9.5mm!important}
    .tech-print-steps{font-size:7.3pt!important;line-height:1.2!important}
    .tech-print-step-num{font-size:6.6pt!important}
    .tech-print-card.dense .tech-print-title{font-size:16pt!important}
    .tech-print-card.dense .tech-print-top{min-height:28mm!important}
    .tech-print-card.dense .tech-print-photo,.tech-print-card.dense .tech-print-no-photo{height:28mm!important}
    .tech-print-card.dense .tech-print-ing{font-size:7.1pt!important}
    .tech-print-card.dense .tech-print-ing .ing-img,.tech-print-card.dense .tech-print-ing .ing-sprite{width:8.7mm!important;height:8.7mm!important}
    .tech-print-card.dense .tech-print-steps{font-size:6.6pt!important}
  `;
  document.head.appendChild(style);
})();

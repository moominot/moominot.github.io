(function () {
  function selText(id) { var el = document.getElementById(id); return el ? el.options[el.selectedIndex].text : ''; }
  function escH(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function fmt(n) { var f = parseFloat(String(n).replace(/[^\d.]/g,'')); return isNaN(f) ? (n||'—') : f.toLocaleString('ca-ES',{minimumFractionDigits:2,maximumFractionDigits:2}); }

  function buildOverlay() {
    var existing = document.getElementById('pem-print-overlay');
    if (existing) existing.parentNode.removeChild(existing);

    var any      = document.getElementById('years').value;
    var mes      = selText('months');
    var modul    = document.getElementById('module').textContent.trim();
    var qualText = selText('qualityCoef');
    var areaText = selText('areaCoef');
    var pemTotal = document.getElementById('totalCell').textContent.trim();

    var areaRows = [];
    document.getElementById('areaTable').querySelectorAll('tr').forEach(function(tr) {
      if (isNaN(parseInt(tr.id))) return;
      var useEl    = tr.querySelector('select[name="use"]');
      var descEl   = tr.querySelector('input[name="description"]');
      var porchEl  = tr.querySelector('select[name="porchCoef"]');
      var reformEl = tr.querySelector('input[name="reformCoef"]');
      var areaEl   = tr.querySelector('input[name="area"]');
      var priceEl  = tr.querySelector('td[name="price"]');
      var totalEl  = tr.querySelector('td[name="total"]');
      if (!useEl) return;
      var useText = useEl.options[useEl.selectedIndex] ? useEl.options[useEl.selectedIndex].text : '';
      areaRows.push({
        useText: useText, useVal: useEl.value,
        desc:      descEl   ? descEl.value   : '',
        porch:     porchEl  ? porchEl.options[porchEl.selectedIndex].text : '',
        reform:    reformEl ? reformEl.value  : '',
        unitPrice: priceEl  ? priceEl.textContent.trim() : '',
        area:      areaEl   ? areaEl.value    : '',
        total:     totalEl  ? totalEl.textContent.trim() : ''
      });
    });

    var rowsHTML = areaRows.map(function(row) {
      var tipMatch = row.useText.match(/^(.*),\s*C=([\d.]+)$/);
      var tipText  = tipMatch ? tipMatch[1].trim() : row.useText;
      var cVal     = tipMatch ? 'C='+tipMatch[2]  : row.useVal;
      return '<tr>' +
       /* '<td><span class="tm">'+escH(tipText)+'</span><span class="tc">'+escH(cVal)+'</span></td>' + */
        '<td>'+escH(cVal)+'</td>' +
        '<td>'+escH(row.desc)+'</td>' +
        '<td>'+escH(row.porch)+'</td>' +
        '<td class="num">'+escH(row.reform||'—')+'</td>' +
        '<td class="num">'+escH(row.unitPrice)+'</td>' +
        '<td class="num">'+escH(row.area)+'</td>' +
        '<td class="num">'+fmt(row.total)+'</td>' +
      '</tr>';
    }).join('');

    var colgroup = '<colgroup><col style="width:6%"><col style="width:35%"><col style="width:11%"><col style="width:6%"><col style="width:8%"><col style="width:5%"><col style="width:13%"></colgroup>';

    var overlay = document.createElement('div');
    overlay.id = 'pem-print-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:99999;overflow-y:auto;';

    overlay.innerHTML =
      '<style>' +
      '#pem-print-overlay *{box-sizing:border-box;margin:0;padding:0}' +
      '#pem-print-overlay .wrap{font-family:Arial,sans-serif;font-size:10pt;color:#111;padding:12mm;max-width:210mm;margin:0 auto;line-height:1.3}' +
      '#pem-print-overlay .btn-bar{margin-bottom:14px;display:flex;gap:10px}' +
      '#pem-print-overlay button{padding:7px 16px;border:none;border-radius:4px;cursor:pointer;font-size:11pt}' +
      '#pem-print-overlay #btn-print{background:#333;color:#fff}' +
      '#pem-print-overlay #btn-back{background:#eee;color:#333}' +

      /* Capçalera: només logo + subtítol, una sola línia fina */
      '#pem-print-overlay #hdr{display:flex;align-items:center;gap:14px;padding-bottom:10px;margin-bottom:18px;}' +
      '#pem-print-overlay #hdr img{height:42px;width:auto}' +
      '#pem-print-overlay #hdr p{font-size:9.5pt;color:#444}' +

      /* Seccions: títol sense línia, només espaiat */
      '#pem-print-overlay .section{margin-bottom:18px}' +
      '#pem-print-overlay .stitle{font-size:9pt;font-weight:bold;color:#111;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px}' +

      '#pem-print-overlay .mgrid{display:flex;gap:28px;flex-wrap:wrap}' +
      '#pem-print-overlay .mitem .lbl{font-size:7.5pt;color:#888;text-transform:uppercase;letter-spacing:.04em;display:block}' +
      '#pem-print-overlay .mitem .val{font-size:11pt;font-weight:bold;line-height:1.2}' +
      '#pem-print-overlay .mitem.modul .val{font-size:13pt}' +

      '#pem-print-overlay .cgrid{display:flex;gap:32px;flex-wrap:wrap}' +
      '#pem-print-overlay .citem .lbl{font-size:7.5pt;color:#888;text-transform:uppercase;display:block}' +
      '#pem-print-overlay .citem .val{font-size:9.5pt;font-weight:bold;line-height:1.2}' +

      /* Taula: línia només sota capçalera i sobre total */
      '#pem-print-overlay table{border-collapse:collapse;width:100%;table-layout:fixed}' +
      '#pem-print-overlay table th{padding:2px 4px 4px;font-size:7.5pt;font-weight:bold;color:#666;vertical-align:bottom;border-bottom:1px solid #999;text-align:left;line-height:1.15;text-transform:uppercase;letter-spacing:.03em}' +
      '#pem-print-overlay table th.num{text-align:right}' +
      '#pem-print-overlay table td{padding:5px 4px;vertical-align:top;font-size:9pt;line-height:1.2;word-break:break-word}' +
      '#pem-print-overlay tbody tr:not(:last-child) td{border-bottom:1px solid #eee}' +

      '#pem-print-overlay .tm{font-weight:600;display:block;line-height:1.15}' +
      '#pem-print-overlay .tc{font-size:7.5pt;color:#666;line-height:1.1}' +
      '#pem-print-overlay .num{text-align:right;font-variant-numeric:tabular-nums}' +

      '#pem-print-overlay #pem-total{margin-top:8px;text-align:right;padding-top:6px;border-top:1px solid #999}' +
      '#pem-print-overlay #pem-total .lbl{font-size:9pt;color:#666}' +
      '#pem-print-overlay #pem-total .val{font-size:14pt;font-weight:bold}' +

      '@media print{' +
      '#pem-print-overlay{position:absolute!important}' +
      '#pem-print-overlay .btn-bar{display:none!important}' +
      'body>*:not(#pem-print-overlay){display:none!important}' +
      '@page{size:A4 portrait;margin:12mm}}' +
      '</style>' +
      '<div class="wrap">' +
      '<div class="btn-bar">' +
      '<button id="btn-print" onclick="window.print()">🖨 Imprimeix / Desa PDF</button>' +
      '<button id="btn-back">← Torna a editar</button>' +
      '</div>' +
      '<div id="hdr">' +
      '<img src="https://coaib.org/images/logoFondoBlanco.png" alt="COAIB">' +
      '<h2>Pressupost d\'Execució Material — Mètode Simplificat</h2>' +
      '</div>' +
      '<div class="section"><div class="stitle">1. Mòdul del mes</div><div class="mgrid">' +
      '<div class="mitem"><span class="lbl">Any</span><span class="val">'+escH(any)+'</span></div>' +
      '<div class="mitem"><span class="lbl">Mes</span><span class="val">'+escH(mes)+'</span></div>' +
      '<div class="mitem modul"><span class="lbl">Mòdul</span><span class="val">'+escH(modul)+'</span></div>' +
      '</div></div>' +
      '<div class="section"><div class="stitle">Coeficients globals</div><div class="cgrid">' +
      '<div class="citem"><span class="lbl">Coef. qualitat (Q)</span><span class="val">'+escH(qualText)+'</span></div>' +
      '<div class="citem"><span class="lbl">Coef. moderador (M)</span><span class="val">'+escH(areaText)+'</span></div>' +
      '</div></div>' +
      '<div class="section"><div class="stitle">2. Càlcul del PEM</div>' +
      '<table>'+colgroup+'<thead><tr>' +
      '<th>Ús / Tipologia</th><th>Descripció</th><th>Porxo/Pèrg.</th>' +
      '<th class="num">Ref.</th><th class="num">Preu (€/m²)</th><th class="num">Sup. (m²)</th><th class="num">Total (€)</th>' +
      '</tr></thead><tbody>'+rowsHTML+'</tbody></table>' +
      '<div id="pem-total"><span class="lbl">PEM total &nbsp;</span><span class="val">'+fmt(pemTotal)+' €</span></div>' +
      '</div></div>';

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    document.getElementById('btn-back').onclick = function() {
      overlay.parentNode.removeChild(overlay);
      document.body.style.overflow = '';
      if (!document.getElementById('pem-reprint-btn')) {
        var btn = document.createElement('button');
        btn.id = 'pem-reprint-btn';
        btn.textContent = '🖨 Previsualitza impressió';
        btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99998;padding:10px 18px;background:#333;color:#fff;border:none;border-radius:6px;font-size:12pt;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.3)';
        btn.onclick = buildOverlay;
        document.body.appendChild(btn);
      }
    };
  }

  var reprintBtn = document.getElementById('pem-reprint-btn');
  if (reprintBtn) reprintBtn.style.display = 'none';
  buildOverlay();
})();

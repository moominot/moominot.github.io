(function () {

  // ════════════════════════════════════════════
  // PART 1: CSS RESPONSIVE PER EDITAR AL MÒBIL
  // ════════════════════════════════════════════
  if (!document.getElementById('mobile_print_bookmarklet_css')) {
    var css = 'body{margin:10px;font-size:14px;line-height:1.5}.no-print{position:static!important;flex-direction:column;width:100%;padding:0;margin-top:0}#menu-container{flex-direction:column!important;width:100%}#language-buttons{flex-direction:row;justify-content:flex-end;margin:5px 0;padding:0;width:100%}.version{margin-top:10px}h2{font-size:20px;line-height:1.2}h3{font-size:16px;line-height:1.2}select,input,.btn{font-size:14px;height:30px;line-height:30px;padding:0 5px;box-sizing:border-box}#moduleTable,#pemTable,#promotionCoefficientsTable,#areaTable{width:100%;display:block;overflow-x:auto;white-space:nowrap}#areaTable{display:table;table-layout:fixed;width:100%;overflow-x:auto}td,th{padding:5px;white-space:normal}.pr30{padding-right:10px}.pl10{padding-left:5px}#promotionCoefficientsTable{display:inline-block;width:100%;margin-bottom:10px}#totalLabel{display:none}@media only screen and (min-width:768px){body{margin-left:30px;font-size:16px;line-height:32px}.no-print{position:fixed!important;flex-direction:row!important}.version{margin-top:70px}#menu-container{flex-direction:row!important}.pr30{padding-right:30px}.pl10{padding-left:15px}#promotionCoefficientsTable{display:table;width:auto}#areaTable{overflow-x:visible;table-layout:auto}#totalLabel{display:table-cell}}@media only screen and (max-width:767px){#areaTable *{box-sizing:border-box!important}#areaTable thead,#areaTable .budgetTable th, #headerRow{display:none!important}#areaTable,#areaTable tbody,#areaTable tr, #areaTable td{display:block}#areaTable td{padding:5px 10px;border:none;border-bottom:1px solid #eee;position:relative;text-align:right}#areaTable input, #areaTable select{width:100%!important;margin-top:2px}#areaTable input[name="use"], #areaTable input[name*="description"], #areaTable input[type="text"]{text-align:left!important}#areaTable tr{margin-bottom:15px;border:1px solid #ddd;border-radius:5px;padding:5px 0;box-shadow:2px 2px 5px rgba(0,0,0,0.05);white-space:normal}#areaTable tr:last-child{font-weight:normal}#areaTable td::before{content:attr(data-label);font-weight:bold;text-align:left;display:block;padding-bottom:2px}#areaTable td:last-child{text-align:center;padding:10px;border-bottom:none;display:flex;justify-content:space-between;align-items:center}#areaTable td:last-child::before{display:inline!important;padding:0!important}#areaTable td:nth-last-child(2){border-bottom:none}#promotionCoefficientsTable{display:block!important;padding:0}#promotionCoefficientsTable tr{display:block}#promotionCoefficientsTable tr th{display:block;text-align:left}#promotionCoefficientsTable td{display:block!important;padding:5px 10px;border:none;border-bottom:1px solid #eee}#promotionCoefficientsTable td:first-child{display:none!important}#promotionCoefficientsTable td:nth-child(2)::before{content:attr(data-label);font-weight:bold;text-align:left;display:block;padding-bottom:2px}#promotionCoefficientsTable select{width:100%!important;margin-top:2px}#moduleTable{table-layout:auto!important;width:100%}#moduleTable tr:nth-child(2){display:block!important;padding:10px 0;border:1px solid #ddd;border-radius:5px;margin-bottom:15px}#moduleTable tr:nth-child(2) td{display:block!important;padding:5px 10px;border-bottom:1px solid #eee}#moduleTable tr:nth-child(2) td:nth-child(odd){display:none!important}#moduleTable tr:nth-child(2) td:nth-child(even)::before{content:attr(data-label);font-weight:bold;text-align:left;display:block;padding-bottom:2px}#moduleTable select, #moduleTable input{width:100%!important;margin-top:2px}#areaTable, #pemTable, #promotionCoefficientsTable {table-layout:auto!important; width:100%!important}}#moduleTable{display:table;table-layout:fixed;width:100%;overflow-x:auto;white-space:normal}#tdIsland{padding-right:10px!important}';
    var style = document.createElement('style');
    style.id = 'mobile_print_bookmarklet_css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    var viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) { viewport = document.createElement('meta'); viewport.name = 'viewport'; document.head.appendChild(viewport); }
    viewport.content = 'width=device-width, initial-scale=1.0';
  }

  function applyDataLabels() {
    var table = document.getElementById('areaTable');
    if (table) {
      var headerRow = document.getElementById('headerRow');
      if (headerRow) {
        var headers = Array.from(headerRow.querySelectorAll('th'));
        var labels = headers.map(function(th){ return th.textContent.trim(); });
        labels[labels.length-2] = '';
        labels[labels.length-1] = 'Accions';
        var dataRows = Array.from(table.querySelectorAll('tr')).filter(function(r){ return r.id !== 'headerRow'; });
        if (dataRows.length > 0) dataRows.pop();
        dataRows.forEach(function(row) {
          Array.from(row.querySelectorAll('td, th')).forEach(function(cell, i) {
            if (i < labels.length && !cell.hasAttribute('data-label')) cell.setAttribute('data-label', labels[i]);
          });
        });
      }
    }
    var coefTable = document.getElementById('promotionCoefficientsTable');
    if (coefTable) {
      coefTable.querySelectorAll('tr').forEach(function(row) {
        var cells = row.querySelectorAll('td');
        if (cells.length === 2) {
          cells[1].setAttribute('data-label', cells[0].textContent.trim());
          cells[0].setAttribute('data-label', '');
        }
      });
    }
    var moduleTable = document.getElementById('moduleTable');
    if (moduleTable) {
      var dataRow = moduleTable.querySelector('tr:nth-child(2)');
      if (dataRow) {
        var cells = Array.from(dataRow.querySelectorAll('td'));
        for (var i = 0; i < cells.length; i += 2) {
          if (cells[i] && cells[i+1] && !cells[i+1].hasAttribute('data-label'))
            cells[i+1].setAttribute('data-label', cells[i].textContent.trim());
        }
      }
    }
  }
  applyDataLabels();
  if (typeof insertLine === 'function' && !window._pemInsertPatched) {
    window._pemInsertPatched = true;
    var originalInsertLine = insertLine;
    insertLine = function() { originalInsertLine.apply(this, arguments); setTimeout(applyDataLabels, 50); };
  }

  // ════════════════════════════════════════════
  // PART 2: PREVISUALITZACIÓ D'IMPRESSIÓ
  // ════════════════════════════════════════════
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
      var cVal     = tipMatch ? 'C='+tipMatch[2] : row.useVal;
      var obraPct  = (parseFloat(row.reform||'0')*100).toFixed(0)+'%';
      return '<tr>' +
        '<td>'+escH(row.desc)+'</td>' +
       
        '<td class="num">'+escH(cVal)+'</td>' +
        
        '<td class="num">'+escH(row.porch)+'</td>' +
        '<td class="num">'+obraPct+'</td>' +
        
        '<td class="num">'+escH(row.unitPrice)+'</td>' +
         '<td class="num">'+escH(row.area)+'</td>' +
        '<td class="num">'+fmt(row.total)+'</td>' +
      '</tr>';
    }).join('');

    var colgroup = '<colgroup><col style="width:25%"><col style="width:10%"><col style="width:14%"><col style="width:10%"><col style="width:14%"><col style="width:12%"><col style="width:15%"></colgroup>';

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
      '#pem-print-overlay #hdr{display:flex;align-items:center;gap:14px;padding-bottom:10px;margin-bottom:18px}' +
      '#pem-print-overlay #hdr img{height:42px;width:auto}' +
      '#pem-print-overlay h2{font-size:9.5pt;color:#444;text-transform:uppercase;letter-spacing:.03em;margin-bottom:14px}' +
      '#pem-print-overlay .section{margin-bottom:18px}' +
      '#pem-print-overlay .stitle{font-size:9pt;font-weight:bold;color:#111;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px}' +
      '#pem-print-overlay .mgrid{display:flex;gap:28px;flex-wrap:wrap}' +
      '#pem-print-overlay .mitem .lbl{font-size:7.5pt;color:#888;text-transform:uppercase;letter-spacing:.04em;display:block}' +
      '#pem-print-overlay .mitem .val{font-size:11pt;font-weight:bold;line-height:1.2}' +
      '#pem-print-overlay .mitem.modul .val{font-size:13pt}' +
      '#pem-print-overlay .cgrid{display:flex;gap:32px;flex-wrap:wrap}' +
      '#pem-print-overlay .citem .lbl{font-size:7.5pt;color:#888;text-transform:uppercase;display:block}' +
      '#pem-print-overlay .citem .val{font-size:9.5pt;font-weight:bold;line-height:1.2}' +
      '#pem-print-overlay table{border-collapse:collapse;width:100%;table-layout:fixed}' +
      '#pem-print-overlay table th{padding:2px 4px 4px;font-size:7.5pt;font-weight:bold;color:#666;vertical-align:bottom;border:1px solid #999;text-align:left;line-height:1.15;text-transform:uppercase;letter-spacing:.03em}' +
      '#pem-print-overlay table th.num{text-align:right}' +
      '#pem-print-overlay table th.center{text-align:center}' +
      '#pem-print-overlay table td{padding:5px 4px;vertical-align:top;font-size:9pt;line-height:1.5;word-break:break-word}' +
      '#pem-print-overlay tbody tr:not(:last-child) td{border-bottom:1px solid #eee}' +
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
      '<div id="hdr"><img src="https://coaib.org/images/logoFondoBlanco.png" alt="COAIB"></div>' +
      '<h2>Pressupost d\'Execució Material — Mètode Simplificat</h2>' +
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
      '<table>'+colgroup +
      '<thead><tr>' +
      '<td></tdh><th colspan=3 class="center">Coeficients particulars</th>' +
      '<td></td><td></td><td></td>' +
      '</tr></thead>' +
      '<thead><tr>' +
      '<th>Descripció</th><th class="num">Coef. C</th>' +
      '<th class="num">Porxo/Pèrg.</th><th class="num">Obra %</th><th class="num">Preu (€/m²)</th><th class="num">Sup. (m²)</th><th class="num">Total (€)</th>' +
      '</tr></thead><tbody>'+rowsHTML+'</tbody></table>' +
      '<div id="pem-total"><span class="lbl">PEM total &nbsp;</span><span class="val">'+fmt(pemTotal)+' €</span></div>' +
      '</div></div>';

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    document.getElementById('btn-back').onclick = function() {
      overlay.parentNode.removeChild(overlay);
      document.body.style.overflow = '';
      showReprintBtn();
    };
  }

  // ════════════════════════════════════════════
  // PART 3: BOTÓ FLOTANT PERMANENT
  // ════════════════════════════════════════════
  function showReprintBtn() {
    var btn = document.getElementById('pem-reprint-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'pem-reprint-btn';
      btn.textContent = '🖨';
      btn.title = 'Previsualitza impressió';
      btn.className = 'no-print';
      btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99998;width:52px;height:52px;background:#333;color:#fff;border:none;border-radius:50%;font-size:20px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.3)';
      btn.onclick = buildOverlay;
      document.body.appendChild(btn);
    }
    btn.style.display = 'block';
  }

  // En executar el bookmarklet: aplicar CSS mòbil + mostrar botó flotant
  showReprintBtn();
})();

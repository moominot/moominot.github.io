// --- CONFIGURACIÓ I ESTAT ---
const appState = {
    pdfDoc: null,
    pdfBytes: null,
    fileName: "document.pdf",
    currentPage: 0,
    zoom: 1.0,
    isSigned: false,
    viewMode: 'single', // 'single' o 'continuous'
    
    // Multi-selecció
    selectedPages: new Set(), // Set d'índexs
    lastClickedIndex: null,   // Per al Shift+Click

    // Edició
    selectionMode: null, // 'text' o 'signature'
    selectionRect: null,
    tempTextRect: null,
    signatureConfig: { isDefined: false, pageIndex: -1, rect: null },
    uploadedSigFile: null,
    
    // Signatures
    detectedSignatures: [],
    autoFirmaReady: false
};

// Imports
const { PDFDocument, StandardFonts, rgb, PDFName, PDFDict, PDFHexString, PDFRef } = PDFLib; 
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// --- INICIALITZACIÓ ---
window.app = {}; 

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    setupEventListeners();
    
    if ('launchQueue' in window) {
        launchQueue.setConsumer(async (params) => {
            if (params.files.length) loadPdfFile(await params.files[0].getFile());
        });
    }
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
    if (!/Android|iPhone/i.test(navigator.userAgent)) checkAndInitAutoFirma();
});

function setupEventListeners() {
    document.getElementById('mainPdfInput').onchange = (e) => { if(e.target.files[0]) loadPdfFile(e.target.files[0]); e.target.value=''; };
    document.getElementById('mergePdfInput').onchange = (e) => { if(e.target.files[0]) processMerge(e.target.files[0]); e.target.value=''; };
    document.getElementById('signatureFileInput').onchange = (e) => {
        if(e.target.files[0]) {
            appState.uploadedSigFile = e.target.files[0];
            document.getElementById('sigFileName').innerText = e.target.files[0].name;
            document.getElementById('sigFileName').classList.add('text-indigo-600', 'font-medium');
        }
    };

    document.getElementById('toggleSidebarBtn').onclick = () => {
        document.getElementById('sidebar').classList.toggle('closed');
        setTimeout(() => { if(appState.viewMode === 'continuous') renderMainView(); }, 300);
    };

    document.getElementById('mainScroll').addEventListener('scroll', handleScroll);

    const selCanvas = document.getElementById('selectionCanvas');
    selCanvas.addEventListener('mousedown', startSelection);
    selCanvas.addEventListener('mousemove', drawSelection);
    selCanvas.addEventListener('mouseup', endSelection);
    selCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); startSelection(e.touches[0]); }, {passive: false});
    selCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); drawSelection(e.touches[0]); }, {passive: false});
    selCanvas.addEventListener('touchend', endSelection);
    
    // Exposar funcions públiques
    Object.assign(window.app, {
        openInsertModal: () => document.getElementById('insertModal').classList.remove('hidden'),
        openSignatureModal: openSignatureModal,
        activateSelectionMode: activateSelectionMode,
        changeZoom: changeZoom,
        toggleViewMode: toggleViewMode,
        analyzeSignatures: showSignaturesModal,
        signWithAutoFirma: signWithAutoFirma,
        downloadPdf: downloadPdf,
        changePage: changePage,
        triggerMerge: triggerMerge,
        applyTextToPdf: applyTextToPdf,
        applyImageSignatureVisualOnly: applyImageSignatureVisualOnly,
        confirmSelection: confirmSelection,
        closeSelectionMode: closeSelectionMode,
        // Noves funcions multi-selecció
        deleteSelected: deleteSelected,
        moveSelected: moveSelected,
        clearSelection: clearSelection
    });
}

// --- CORE LOGIC ---

async function loadPdfFile(file) {
    showLoader("Obrint...");
    try {
        appState.fileName = file.name;
        document.getElementById('docTitle').innerText = file.name;
        appState.pdfBytes = await file.arrayBuffer();
        appState.pdfDoc = await PDFDocument.load(appState.pdfBytes);
        
        appState.currentPage = 0;
        appState.selectedPages.clear();
        await detectSignatures();
        
        updateUI();
        await renderSidebar();
        await renderMainView();
    } catch (e) { showAlert("Error: " + e.message); }
    finally { hideLoader(); }
}

async function renderMainView() {
    if (!appState.pdfDoc) return;
    const wrapper = document.getElementById('pagesWrapper');
    wrapper.innerHTML = ''; 
    
    const pdfjsDoc = await pdfjsLib.getDocument({data: await appState.pdfDoc.save()}).promise;
    const numPages = pdfjsDoc.numPages;
    document.getElementById('totalPageNum').innerText = numPages;

    if (appState.viewMode === 'single') {
        renderSinglePage(pdfjsDoc, wrapper);
        document.getElementById('pageNavControls').style.pointerEvents = 'auto';
        document.getElementById('pageNavControls').classList.remove('opacity-0');
        wrapper.className = "flex flex-col items-center justify-center min-h-full";
    } else {
        document.getElementById('pageNavControls').style.pointerEvents = 'none';
        document.getElementById('pageNavControls').classList.add('opacity-0');
        wrapper.className = "flex flex-col items-center gap-6 py-8";

        for (let i = 1; i <= numPages; i++) {
            const canvas = document.createElement('canvas');
            canvas.className = "bg-white shadow-lg";
            wrapper.appendChild(canvas);
            pdfjsDoc.getPage(i).then(page => {
                const viewport = page.getViewport({ scale: appState.zoom * 1.5 });
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                canvas.style.width = `${viewport.width / 1.5}px`; 
                canvas.style.height = `${viewport.height / 1.5}px`;
                page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport });
            });
        }
    }
}

async function renderSinglePage(pdfjsDoc, wrapper) {
    const i = appState.currentPage;
    const canvas = document.createElement('canvas');
    canvas.className = "bg-white shadow-2xl my-auto";
    wrapper.appendChild(canvas);

    const page = await pdfjsDoc.getPage(i + 1);
    const containerW = document.getElementById('mainArea').offsetWidth;
    const unscaledVp = page.getViewport({ scale: 1 });
    const fitScale = Math.min((containerW - 60) / unscaledVp.width, 2.0);
    const finalScale = fitScale * appState.zoom;
    
    const viewport = page.getViewport({ scale: finalScale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
    
    document.getElementById('currentPageNum').innerText = i + 1;
    updateSidebarHighlights();
}

async function renderSidebar() {
    const container = document.getElementById('thumbnailsContainer');
    container.innerHTML = '';
    const pdfjsDoc = await pdfjsLib.getDocument({data: await appState.pdfDoc.save()}).promise;
    document.getElementById('pageCount').innerText = pdfjsDoc.numPages;

    updateSidebarHeader(); // Mostrar/Ocultar eines de selecció

    for (let i = 0; i < pdfjsDoc.numPages; i++) {
        const div = document.createElement('div');
        div.className = `thumbnail-card relative mb-4 rounded cursor-pointer group p-1`;
        
        // Classes dinàmiques
        if (i === appState.currentPage) div.classList.add('active-page');
        if (appState.selectedPages.has(i)) div.classList.add('selected');

        // GESTIÓ DE CLICS (Selecció)
        div.onclick = (e) => handleThumbnailClick(e, i);

        const canvas = document.createElement('canvas');
        canvas.className = "w-full h-auto bg-white border pointer-events-none"; // pointer-events-none per evitar problemes amb el click
        div.appendChild(canvas);
        
        const label = document.createElement('div');
        label.className = "text-xs text-gray-500 mt-1 pointer-events-none";
        label.innerText = `Pàg ${i+1}`;
        div.appendChild(label);

        container.appendChild(div);
        
        // Render Thumb Async
        pdfjsDoc.getPage(i + 1).then(page => {
            const vp = page.getViewport({ scale: 0.3 });
            canvas.height = vp.height;
            canvas.width = vp.width;
            page.render({ canvasContext: canvas.getContext('2d'), viewport: vp });
        });
    }
    
    const thumb = document.querySelectorAll('.thumbnail-card')[appState.currentPage];
    if(thumb) thumb.scrollIntoView({behavior: "auto", block: "center"});
    lucide.createIcons();
}

// --- LÒGICA DE SELECCIÓ ---

function handleThumbnailClick(e, index) {
    if (appState.isSigned) { // Si està firmat, només navegació simple
        appState.currentPage = index;
        renderMainView();
        updateSidebarHighlights();
        return;
    }

    if (e.ctrlKey || e.metaKey) {
        // Toggle Selection
        if (appState.selectedPages.has(index)) appState.selectedPages.delete(index);
        else appState.selectedPages.add(index);
        appState.lastClickedIndex = index;
    } else if (e.shiftKey && appState.lastClickedIndex !== null) {
        // Range Selection
        const start = Math.min(appState.lastClickedIndex, index);
        const end = Math.max(appState.lastClickedIndex, index);
        // Netejar prèvia si es vol comportament estàndard, o afegir? Estàndard sol netejar excepte el rang.
        // Farem additiu per simplicitat o reset? Fem reset per ser com l'explorador de fitxers.
        appState.selectedPages.clear(); 
        for(let i=start; i<=end; i++) appState.selectedPages.add(i);
    } else {
        // Normal Click: Select ONLY this one IF not already selecting.
        // Però també volem navegar.
        // Comportament híbrid: Clic simple = Navegar + Seleccionar NOMÉS aquesta.
        appState.currentPage = index;
        renderMainView();
        appState.selectedPages.clear();
        appState.selectedPages.add(index);
        appState.lastClickedIndex = index;
    }

    renderSidebar(); // Re-renderitzar per veure els estils
}

function updateSidebarHeader() {
    const count = appState.selectedPages.size;
    const defaultHeader = document.getElementById('sidebarHeaderDefault');
    const selHeader = document.getElementById('sidebarHeaderSelection');
    
    if (count > 0 && !appState.isSigned) {
        defaultHeader.classList.add('hidden');
        selHeader.classList.remove('hidden');
        document.getElementById('selectedCount').innerText = count;
    } else {
        defaultHeader.classList.remove('hidden');
        selHeader.classList.add('hidden');
    }
}

function updateSidebarHighlights() {
    // Només actualitza la classe 'active-page' sense re-renderitzar tot el canvas
    const cards = document.querySelectorAll('.thumbnail-card');
    cards.forEach((card, i) => {
        if(i === appState.currentPage) card.classList.add('active-page');
        else card.classList.remove('active-page');
    });
}

function clearSelection() {
    appState.selectedPages.clear();
    renderSidebar();
}

// --- EDICIÓ EN BLOC (MULTI) ---

async function deleteSelected() {
    if (appState.selectedPages.size === 0) return;
    if (!confirm(`Esborrar ${appState.selectedPages.size} pàgines?`)) return;
    
    showLoader("Esborrant...");
    
    // Convertir a array i ordenar descendentment (molt important per no alterar índexs mentre esborrem)
    const indices = Array.from(appState.selectedPages).sort((a,b) => b - a);
    
    indices.forEach(idx => {
        appState.pdfDoc.removePage(idx);
    });
    
    // Reset state
    appState.selectedPages.clear();
    appState.currentPage = 0;
    
    await refreshAll();
    hideLoader();
}

async function moveSelected(direction) {
    // direction: -1 (Up), 1 (Down)
    const sel = Array.from(appState.selectedPages).sort((a,b) => a - b);
    if (sel.length === 0) return;

    // Validacions de límits
    const total = appState.pdfDoc.getPageCount();
    if (direction === -1 && sel[0] === 0) return; // Top
    if (direction === 1 && sel[sel.length - 1] === total - 1) return; // Bottom

    showLoader("Movent...");
    
    // Per moure un bloc, el més segur en PDF-Lib sense corrompre referències és:
    // 1. Copiar les pàgines seleccionades
    // 2. Inserir-les a la nova posició
    // 3. Esborrar les velles.
    
    // Identificar el punt d'inserció.
    // Si movem AMUNT, el punt d'inserció és l'índex de la primera pàgina seleccionada - 1.
    // Si movem AVALL, el punt d'inserció és l'índex de la última pàgina + 2 (per compensar).
    // Aquest mètode complex pot ser lent.
    
    // MÈTODE SWAP ITERATIU (Més segur per mantenir selecció i menys conflictes)
    // Si movem amunt: Iterem de dalt a baix (0..N). Movem cada pàgina i-1.
    // Si movem avall: Iterem de baix a dalt (N..0). Movem cada pàgina i+1.
    
    const newSelection = new Set();
    
    if (direction === -1) { // UP
        // Processar en ordre ascendent (0, 1, 2...)
        for (let i of sel) {
            // Movem la pàgina 'i' a 'i-1'
            const [page] = await appState.pdfDoc.copyPages(appState.pdfDoc, [i]);
            appState.pdfDoc.insertPage(i - 1, page);
            appState.pdfDoc.removePage(i + 1); // L'original s'ha desplaçat un lloc
            newSelection.add(i - 1);
        }
    } else { // DOWN
        // Processar en ordre descendent per no alterar els indexs que falten per moure
        for (let i = sel.reverse(); i < sel.length; i++) { /*...*/ } 
        // JavaScript forEach no va en reverse fàcil. Usem for of reversed.
        for (let i of sel) { // sel ja està invertit perquè hem fet reverse() adalt? No, sort retorna array.
             // Tornem a ordenar descendent
        }
        const selDesc = sel.sort((a,b) => b - a);
        for (let i of selDesc) {
            // Moure pàgina 'i' a 'i+1'.
            // Inserim a i+2 (perquè volem que quedi després de la següent)
            const [page] = await appState.pdfDoc.copyPages(appState.pdfDoc, [i]);
            appState.pdfDoc.insertPage(i + 2, page);
            appState.pdfDoc.removePage(i); // L'original és a 'i'
            newSelection.add(i + 1);
        }
    }
    
    appState.selectedPages = newSelection;
    await refreshAll();
    hideLoader();
}

// --- ALTRES FUNCIONS (Insert, Refresh...) ---

function triggerMerge() {
    document.getElementById('insertModal').classList.add('hidden');
    document.getElementById('mergePdfInput').click();
}

async function processMerge(file) {
    showLoader("Fusionant...");
    try {
        const mergeBytes = await file.arrayBuffer();
        const mergeDoc = await PDFDocument.load(mergeBytes);
        const copiedPages = await appState.pdfDoc.copyPages(mergeDoc, mergeDoc.getPageIndices());
        
        const pos = document.querySelector('input[name="insertPos"]:checked').value;
        let insertIdx = (pos === 'before') ? appState.currentPage : appState.currentPage + 1;

        for (const page of copiedPages) {
            appState.pdfDoc.insertPage(insertIdx, page);
            insertIdx++;
        }
        await refreshAll();
    } catch(e) { showAlert(e.message); }
    finally { hideLoader(); }
}

async function refreshAll() {
    await renderSidebar();
    await renderMainView();
}

// --- UTILITATS INTERFICIE ---

function changeZoom(delta) {
    appState.zoom = Math.max(0.5, Math.min(3.0, appState.zoom + delta));
    document.getElementById('zoomDisplay').innerText = Math.round(appState.zoom * 100) + "%";
    renderMainView();
}

function toggleViewMode() {
    appState.viewMode = appState.viewMode === 'single' ? 'continuous' : 'single';
    const btn = document.getElementById('viewModeBtn');
    if (appState.viewMode === 'continuous') btn.classList.add('text-blue-400');
    else btn.classList.remove('text-blue-400');
    renderMainView();
}

function changePage(delta) {
    const newIdx = appState.currentPage + delta;
    if (newIdx >= 0 && newIdx < appState.pdfDoc.getPageCount()) {
        appState.currentPage = newIdx;
        appState.selectedPages.clear();
        appState.selectedPages.add(newIdx);
        renderMainView();
        renderSidebar();
    }
}

function handleScroll() {
    if (appState.viewMode !== 'continuous') return;
    const container = document.getElementById('mainScroll');
    const scrollCenter = container.scrollTop + (container.clientHeight / 2);
    
    const canvases = document.querySelectorAll('#pagesWrapper canvas');
    canvases.forEach((cv, idx) => {
        if (cv.offsetTop <= scrollCenter && (cv.offsetTop + cv.offsetHeight) >= scrollCenter) {
            if (appState.currentPage !== idx) {
                appState.currentPage = idx;
                updateSidebarHighlights();
            }
        }
    });
}

// --- SELECCIÓ VISUAL ---

async function activateSelectionMode(mode) {
    appState.selectionMode = mode;
    document.getElementById('selectionOverlay').classList.remove('hidden');
    document.getElementById('signatureModal').classList.add('hidden');
    document.getElementById('textToolsModal').classList.add('hidden');
    
    const bgCanvas = document.getElementById('selectionBgCanvas');
    const ovCanvas = document.getElementById('selectionCanvas');
    
    const pdfjsDoc = await pdfjsLib.getDocument({data: await appState.pdfDoc.save()}).promise;
    const page = await pdfjsDoc.getPage(appState.currentPage + 1);
    const viewport = page.getViewport({ scale: 1.5 });
    
    bgCanvas.width = viewport.width;
    bgCanvas.height = viewport.height;
    ovCanvas.width = viewport.width;
    ovCanvas.height = viewport.height;
    ovCanvas.dataset.origW = page.getViewport({scale: 1}).width;
    ovCanvas.dataset.origH = page.getViewport({scale: 1}).height;
    
    await page.render({ canvasContext: bgCanvas.getContext('2d'), viewport: viewport }).promise;
    ovCanvas.getContext('2d').clearRect(0, 0, ovCanvas.width, ovCanvas.height);
}

let isSelecting = false, startX, startY;

function startSelection(e) {
    const canvas = document.getElementById('selectionCanvas');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    startX = (clientX - rect.left) * scaleX;
    startY = (clientY - rect.top) * scaleY;
    isSelecting = true;
    appState.selectionRect = { x: startX, y: startY, w: 0, h: 0 };
}

function drawSelection(e) {
    if (!isSelecting) return;
    const canvas = document.getElementById('selectionCanvas');
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    const currX = (clientX - rect.left) * scaleX;
    const currY = (clientY - rect.top) * scaleY;
    appState.selectionRect.w = currX - startX;
    appState.selectionRect.h = currY - startY;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = appState.selectionMode === 'text' ? 'blue' : 'red';
    ctx.lineWidth = 4;
    ctx.strokeRect(startX, startY, appState.selectionRect.w, appState.selectionRect.h);
    ctx.fillStyle = appState.selectionMode === 'text' ? 'rgba(0,0,255,0.2)' : 'rgba(255,0,0,0.2)';
    ctx.fillRect(startX, startY, appState.selectionRect.w, appState.selectionRect.h);
}

function endSelection() {
    isSelecting = false;
    let r = appState.selectionRect;
    if (r.w < 0) { r.x += r.w; r.w = Math.abs(r.w); }
    if (r.h < 0) { r.y += r.h; r.h = Math.abs(r.h); }
}

function confirmSelection() {
    const r = appState.selectionRect;
    if (!r || r.w < 5) return showAlert("Selecció no vàlida");
    const cv = document.getElementById('selectionCanvas');
    const scaleX = cv.dataset.origW / cv.width;
    const scaleY = cv.dataset.origH / cv.height;
    const pdfH = parseFloat(cv.dataset.origH);
    const finalRect = { x: r.x * scaleX, y: pdfH - ((r.y + r.h) * scaleY), w: r.w * scaleX, h: r.h * scaleY };
    
    document.getElementById('selectionOverlay').classList.add('hidden');
    if (appState.selectionMode === 'text') {
        appState.tempTextRect = finalRect;
        document.getElementById('textToolsModal').classList.remove('hidden');
        document.getElementById('pdfTextInput').value = ''; 
        document.getElementById('pdfTextInput').focus();
    } else {
        appState.signatureConfig = { isDefined: true, pageIndex: appState.currentPage, rect: finalRect };
        document.getElementById('signatureModal').classList.remove('hidden');
        document.getElementById('posSummary').innerHTML = `<span class="text-green-600 font-bold">Àrea Ok!</span> (Pàg ${appState.currentPage+1})`;
        document.getElementById('configDot').classList.remove('hidden');
    }
    appState.selectionRect = null;
    appState.selectionMode = null;
}

function closeSelectionMode() {
    document.getElementById('selectionOverlay').classList.add('hidden');
    if (appState.selectionMode === 'signature') document.getElementById('signatureModal').classList.remove('hidden');
    appState.selectionMode = null;
}

// --- APPLY TOOLS ---

async function applyTextToPdf() {
    const text = document.getElementById('pdfTextInput').value;
    if (!text) return;
    const size = parseInt(document.getElementById('pdfTextSize').value);
    const colorHex = document.getElementById('pdfTextColor').value;
    const r = parseInt(colorHex.substr(1,2), 16) / 255;
    const g = parseInt(colorHex.substr(3,2), 16) / 255;
    const b = parseInt(colorHex.substr(5,2), 16) / 255;

    showLoader("Afegint...");
    try {
        const font = await appState.pdfDoc.embedFont(StandardFonts.Helvetica);
        const page = appState.pdfDoc.getPage(appState.currentPage);
        page.drawText(text, {
            x: appState.tempTextRect.x, y: appState.tempTextRect.y + appState.tempTextRect.h - size, 
            size: size, font: font, color: rgb(r, g, b), maxWidth: appState.tempTextRect.w
        });
        document.getElementById('textToolsModal').classList.add('hidden');
        await refreshAll();
    } catch(e) { showAlert(e.message); } finally { hideLoader(); }
}

async function applyImageSignatureVisualOnly() {
    if (!appState.uploadedSigFile) return showAlert("Falta imatge");
    showLoader("Estampant...");
    document.getElementById('signatureModal').classList.add('hidden');
    try {
        const b = await appState.uploadedSigFile.arrayBuffer();
        let img;
        if (appState.uploadedSigFile.type.includes('png')) img = await appState.pdfDoc.embedPng(b);
        else img = await appState.pdfDoc.embedJpg(b);
        
        let pIdx = appState.currentPage;
        let dims = { x: 50, y: 50, w: 200, h: 100 };
        if (appState.signatureConfig.isDefined) {
            pIdx = appState.signatureConfig.pageIndex;
            dims = appState.signatureConfig.rect;
        } else {
            const p = appState.pdfDoc.getPage(pIdx);
            const s = img.scaleToFit(200, 100);
            dims.w = s.width; dims.h = s.height;
            dims.x = (p.getWidth()/2) - (s.width/2);
            dims.y = p.getHeight()/2;
        }
        appState.pdfDoc.getPage(pIdx).drawImage(img, { x: dims.x, y: dims.y, width: dims.w, height: dims.h });
        await refreshAll();
    } catch(e) { showAlert(e.message); } finally { hideLoader(); }
}

// --- SIGNATURES & AUTOFIRMA ---

async function detectSignatures() {
    appState.detectedSignatures = [];
    appState.isSigned = false;
    try {
        appState.pdfDoc.context.enumerateIndirectObjects().forEach(([ref, obj]) => {
             if (obj instanceof PDFDict && obj.lookup(PDFName.of('Type')) === PDFName.of('Sig')) {
                 const contents = obj.lookup(PDFName.of('Contents'));
                 if (contents && !/^0+$/.test(contents.value)) {
                     appState.isSigned = true;
                     appState.detectedSignatures.push({name: "Signatura Detectada"});
                 }
             }
        });
    } catch(e) {}
}

function openSignatureModal() {
    if (appState.isSigned) return showAlert("Document protegit (Signat)");
    document.getElementById('signatureModal').classList.remove('hidden');
}

function showSignaturesModal() {
    const list = document.getElementById('signaturesList');
    list.innerHTML = '';
    if(!appState.isSigned) list.innerHTML = '<div class="text-gray-500 text-center">No hi ha signatures</div>';
    else appState.detectedSignatures.forEach(s => {
        const d = document.createElement('div');
        d.className = "bg-green-50 p-2 border border-green-200 rounded text-sm";
        d.innerText = s.name;
        list.appendChild(d);
    });
    document.getElementById('verificationModal').classList.remove('hidden');
}

function checkAndInitAutoFirma() {
    if (typeof window.AutoScript !== 'undefined') initAF();
    else document.getElementById('manualScriptLoader')?.classList.remove('hidden');
}
function initAF() {
    try {
        if (typeof window.AutoScript.cargarAppAfirma==='function') window.AutoScript.cargarAppAfirma();
        else window.AutoScript.cargarApplet("appletContainer");
        setTimeout(() => { appState.autoFirmaReady = true; }, 1000);
    } catch(e) { console.error(e); }
}

async function signWithAutoFirma() {
    if (!appState.autoFirmaReady) return showAlert("AutoFirma no connectat");
    showLoader("Signant...");
    try {
        const pdfBytes = await appState.pdfDoc.save();
        const b64 = uint8ToBase64(pdfBytes);
        let params = `layer2Text=Signat per $$SUBJECTCN$$ el $$SIGNDATE=dd/MM/yyyy$$\n`;
        let p = appState.currentPage + 1;
        let rect = { x: 100, y: 100, w: 200, h: 100 };
        if (appState.signatureConfig.isDefined) {
            p = appState.signatureConfig.pageIndex + 1;
            rect = appState.signatureConfig.rect;
        }
        params += `signaturePages=${p}\n`;
        params += `signaturePositionOnPageLowerLeftX=${Math.round(rect.x)}\n`;
        params += `signaturePositionOnPageLowerLeftY=${Math.round(rect.y)}\n`;
        params += `signaturePositionOnPageUpperRightX=${Math.round(rect.x+rect.w)}\n`;
        params += `signaturePositionOnPageUpperRightY=${Math.round(rect.y+rect.h)}\n`;
        if (appState.uploadedSigFile) params += "signatureRubricImage=" + await blobToBase64(appState.uploadedSigFile);
        
        window.AutoScript.sign(b64, "SHA512withRSA", "AUTO", params, 
            (res) => loadSignedPdf(base64ToUint8(res)),
            (type, msg) => { hideLoader(); showAlert("Error: "+msg); }
        );
    } catch(e) { hideLoader(); showAlert(e.message); }
}

async function loadSignedPdf(bytes) {
    appState.pdfBytes = bytes;
    appState.pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    appState.fileName = "SIGNAT_" + appState.fileName;
    document.getElementById('docTitle').innerText = appState.fileName;
    await detectSignatures();
    updateUI();
    await refreshAll();
    showAlert("Signat correctament!");
    hideLoader();
}

// --- UTILS ---
function updateUI() {
    const hasFile = !!appState.pdfDoc;
    document.getElementById('signBtn').disabled = !hasFile || appState.isSigned;
    document.getElementById('saveBtn').disabled = !hasFile;
    document.getElementById('signBtn').classList.toggle('opacity-50', !hasFile || appState.isSigned);
    document.getElementById('saveBtn').classList.toggle('opacity-50', !hasFile);
    
    if (appState.isSigned) {
        document.getElementById('quickTools').classList.add('disabled-ui');
        document.getElementById('verifyBtn').classList.add('text-green-400');
    } else {
        document.getElementById('quickTools').classList.remove('disabled-ui');
        document.getElementById('verifyBtn').classList.remove('text-green-400');
    }
}

async function downloadPdf() {
    const data = await appState.pdfDoc.save();
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = appState.fileName; a.click();
}

function showLoader(t) { document.getElementById('loaderText').innerText = t; document.getElementById('loader').classList.remove('hidden'); }
function hideLoader() { document.getElementById('loader').classList.add('hidden'); }
function showAlert(m) { document.getElementById('alertMsg').innerText = m; document.getElementById('customAlertModal').classList.remove('hidden'); }

function uint8ToBase64(u){let r='';for(let i=0;i<u.length;i+=0x8000)r+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(r)}
function base64ToUint8(b){const s=window.atob(b),l=s.length,y=new Uint8Array(l);for(let i=0;i<l;i++)y[i]=s.charCodeAt(i);return y}
function blobToBase64(b){return new Promise((r,j)=>{const fr=new FileReader();fr.onloadend=()=>r(fr.result.split(',')[1]);fr.onerror=j;fr.readAsDataURL(b)})}
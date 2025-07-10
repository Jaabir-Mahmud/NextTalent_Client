import React, { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import html2pdf from 'html2pdf.js';
import { PDFDocument, degrees } from 'pdf-lib';

const SAMPLE_PDF = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

// Set worker source using CDN (more reliable for Vite)
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const PDFWysiwygEditor = ({ pdfUrl: propPdfUrl, onClose }) => {
  const containerRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [pageSizes, setPageSizes] = useState([]);
  const [textBoxes, setTextBoxes] = useState([]);
  const [dragged, setDragged] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(propPdfUrl || '');
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [draggingImgIdx, setDraggingImgIdx] = useState(null);
  const [resizingImgIdx, setResizingImgIdx] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pdfBytes, setPdfBytes] = useState(null);
  const fileInputRef = useRef();
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [totalPages, setTotalPages] = useState(1);
  // Font controls state
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontColor, setFontColor] = useState('#222222');
  const [opacity, setOpacity] = useState(1);
  // Track which textBox is being edited
  const [editingIdx, setEditingIdx] = useState(null);
  // Store extracted text overlays for current page
  const [extractedText, setExtractedText] = useState([]);
  // Zoom state
  const [zoom, setZoom] = useState(1.25);
  // Add a ref for the font controls
  const fontControlsRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setError('');
    }
  };

  useEffect(() => {
    if (!pdfUrl) return;

    const renderPDF = async () => {
      try {
        const loadingTask = getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        setTotalPages(pdf.numPages);
        const canvasContainer = canvasContainerRef.current;
        if (canvasContainer) canvasContainer.innerHTML = '';
        const sizes = [];
        // Only render the current page
        const pageNum = currentPage + 1;
        const page = await pdf.getPage(pageNum);
        const scale = zoom;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        await page.render({ canvasContext: context, viewport }).promise;
        canvas.style.display = 'block';
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '100%';
        canvas.style.margin = '0 auto';
        canvas.style.border = '1px solid #ddd';
        canvas.style.borderRadius = '4px';
        if (canvasContainer) {
          canvasContainer.appendChild(canvas);
          const rect = canvas.getBoundingClientRect();
          const containerRect = canvasContainer.getBoundingClientRect();
          setCanvasOffset({
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top
          });
        }
        sizes.push({ width: viewport.width, height: viewport.height });
        // Extract text layer for the current page
        const textContent = await page.getTextContent();
        const allTextItems = textContent.items.map((item) => {
          const [a, b, , , e, f] = item.transform;
          const fontSize = Math.sqrt(a * a + b * b) * zoom / scale; // scale already includes zoom
          const x = e;
          const y = viewport.height - f;
          const width = item.width * zoom;
          const height = fontSize;
          return {
            page: currentPage,
            str: item.str,
            x,
            y,
            width,
            height,
            fontSize,
            fontFamily: 'Arial',
            fontColor: '#222222',
            opacity: 1,
          };
        });
        setExtractedText(allTextItems);
        setPageSizes(sizes);
        setError('');
      } catch (err) {
        console.error('PDF.js load error:', err);
        setError('Failed to load PDF: ' + (err?.message || 'Unknown error. Please try another file.'));
        setPageSizes([]);
      }
    };

    renderPDF();
  }, [pdfUrl, currentPage, zoom]);

  // Load PDF from bytes if available
  useEffect(() => {
    if (pdfBytes) {
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [pdfBytes]);

  const handleMouseDown = (e, idx) => {
    e.stopPropagation();
    const box = textBoxes[idx];
    setDragged({
      index: idx,
      offsetX: e.clientX - box.x,
      offsetY: e.clientY - box.y,
    });
  };

  useEffect(() => {
    if (dragged === null) return;

    const handleMove = (e) => {
      setTextBoxes((prev) =>
        prev.map((box, i) =>
          i === dragged.index
            ? { ...box, x: e.clientX - dragged.offsetX, y: e.clientY - dragged.offsetY }
            : box
        )
      );
    };

    const handleUp = () => setDragged(null);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragged]);

  const handleTextChange = (idx, newText) => {
    setTextBoxes((prev) =>
      prev.map((box, i) => (i === idx ? { ...box, text: newText } : box))
    );
  };

  useEffect(() => {
    if (!pdfUrl) setPdfUrl(SAMPLE_PDF);
  }, [pdfUrl]);

  // Used by floating Save as PDF button
  const handleSave = () => {
    if (!containerRef.current) return;
    html2pdf()
      .from(containerRef.current)
      .set({
        margin: 0,
        filename: 'edited.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
      })
      .save();
  };

  const handleImageInput = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageObj = new window.Image();
        imageObj.onload = () => {
          const width = 120;
          const height = (imageObj.height / imageObj.width) * width;
          setImages((prev) => [
            ...prev,
            {
              src: event.target.result,
              x: 40,
              y: 40,
              width,
              height,
              page: currentPage,
              dragging: false,
              offsetX: 0,
              offsetY: 0,
            },
          ]);
        };
        imageObj.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDragStart = (e, idx) => {
    e.stopPropagation();
    const img = images[idx];
    const offsetX = e.clientX - img.x;
    const offsetY = e.clientY - img.y;
    setImages((prev) =>
      prev.map((im, i) =>
        i === idx ? { ...im, offsetX, offsetY, dragging: true } : im
      )
    );
    setDraggingImgIdx(idx);
    setResizingImgIdx(null);
  };

  useEffect(() => {
    if (draggingImgIdx === null) return;
    const handleMove = (e) => {
      setImages((prev) =>
        prev.map((im, i) => {
          if (i !== draggingImgIdx) return im;
          return {
            ...im,
            x: e.clientX - (im.offsetX || 0),
            y: e.clientY - (im.offsetY || 0),
          };
        })
      );
    };
    const handleUp = () => {
      setImages((prev) =>
        prev.map((im, i) =>
          i === draggingImgIdx ? { ...im, dragging: false } : im
        )
      );
      setDraggingImgIdx(null);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [draggingImgIdx]);

  const handleImageResizeStart = (e, idx) => {
    e.stopPropagation();
    setResizingImgIdx(idx);
    setDraggingImgIdx(null);
  };

  useEffect(() => {
    if (resizingImgIdx === null) return;
    const handleMove = (e) => {
      setImages((prev) =>
        prev.map((im, i) => {
          if (i !== resizingImgIdx) return im;
          const newWidth = Math.max(30, e.clientX - im.x);
          const aspect = im.height / im.width;
          return {
            ...im,
            width: newWidth,
            height: newWidth * aspect,
          };
        })
      );
    };
    const handleUp = () => setResizingImgIdx(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [resizingImgIdx]);

  const handleMergePDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const existingBytes = pdfBytes || (await fetch(pdfUrl).then(r => r.arrayBuffer()));
    const existingPdf = await PDFDocument.load(existingBytes);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const newPdf = await PDFDocument.load(ev.target.result);
      const copiedPages = await existingPdf.copyPages(newPdf, newPdf.getPageIndices());
      copiedPages.forEach((page) => existingPdf.addPage(page));
      const mergedBytes = await existingPdf.save();
      setPdfBytes(mergedBytes);
      setCurrentPage(0);
      setTimeout(() => setPdfUrl(URL.createObjectURL(new Blob([mergedBytes], { type: 'application/pdf' }))), 100);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleDeletePage = async () => {
    const bytes = pdfBytes || (await fetch(pdfUrl).then(r => r.arrayBuffer()));
    const pdfDoc = await PDFDocument.load(bytes);
    if (pdfDoc.getPageCount() <= 1) {
      alert('Cannot delete the last page.');
      return;
    }
    pdfDoc.removePage(currentPage);
    const newBytes = await pdfDoc.save();
    setPdfBytes(newBytes);
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleRotatePage = async () => {
    const bytes = pdfBytes || (await fetch(pdfUrl).then(r => r.arrayBuffer()));
    const pdfDoc = await PDFDocument.load(bytes);
    const page = pdfDoc.getPage(currentPage);
    const currentAngle = page.getRotation().angle;
    page.setRotation(degrees((currentAngle + 90) % 360));
    const newBytes = await pdfDoc.save();
    setPdfBytes(newBytes);
  };

  const handleSplitPDF = async () => {
    const bytes = pdfBytes || (await fetch(pdfUrl).then(r => r.arrayBuffer()));
    const pdfDoc = await PDFDocument.load(bytes);
    const newDoc = await PDFDocument.create();
    const [copiedPage] = await newDoc.copyPages(pdfDoc, [currentPage]);
    newDoc.addPage(copiedPage);
    const splitBytes = await newDoc.save();
    const blob = new Blob([splitBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `split_page_${currentPage + 1}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const goToPage = (idx) => setCurrentPage(Math.max(0, Math.min(idx, totalPages - 1)));

  // Add a new text box at click position
  const handleOverlayClick = (e) => {
    // Only add if not clicking on an existing overlay or image
    if (e.target.className !== 'pdf-text-overlay') return;
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newTextBox = {
      page: currentPage,
      x,
      y,
      text: 'Edit me',
      fontSize,
      fontFamily,
      fontColor,
      opacity,
    };
    setTextBoxes((prev) => {
      const newBoxes = [...prev, newTextBox];
      setEditingIdx(newBoxes.length - 1);
      return newBoxes;
    });
  };
  // Add a text box from extracted text overlay
  const handleExtractedTextClick = (item) => {
    const newTextBox = {
      page: currentPage,
      x: item.x,
      y: item.y,
      text: item.str,
      fontSize: item.fontSize,
      fontFamily: item.fontFamily,
      fontColor: item.fontColor,
      opacity: 1,
    };
    setTextBoxes((prev) => {
      const newBoxes = [...prev, newTextBox];
      setEditingIdx(newBoxes.length - 1);
      return newBoxes;
    });
  };
  // Font controls for editing a text box
  const handleFontControlChange = (idx, key, value) => {
    setTextBoxes((prev) => prev.map((box, i) => i === idx ? { ...box, [key]: value } : box));
  };

  // Delete a text box
  const handleDeleteTextBox = (idx) => {
    setTextBoxes((prev) => prev.filter((_, i) => i !== idx));
    setEditingIdx(null);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        position: 'relative',
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '1200px',
        height: '90%',
        maxHeight: '800px',
        display: 'flex',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}>
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10000,
            background: 'transparent',
            border: 'none',
            fontSize: 32,
            fontWeight: 700,
            color: '#333',
            cursor: 'pointer',
            lineHeight: 1,
            padding: 0,
          }}
          aria-label="Close PDF Editor"
        >
          ×
        </button>
        {/* Left Sidebar */}
        <div style={{
          width: 220,
          background: '#f3f4f6',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          boxSizing: 'border-box',
          overflowY: 'auto',
          height: '100%',
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Tools</div>
          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Upload PDF</label>
            <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Upload Image</label>
            <input type="file" accept="image/*" onChange={handleImageInput} style={{ width: '100%' }} />
          </div>
          <hr style={{ margin: '16px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => handleSave()} style={{ padding: '8px 0', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: 'pointer', width: '100%' }}>Merge PDF</button>
            <input type="file" accept="application/pdf" ref={fileInputRef} style={{ display: 'none' }} onChange={handleMergePDF} />
            <button onClick={handleDeletePage} style={{ padding: '8px 0', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: 'pointer', width: '100%' }}>Delete Page</button>
            <button onClick={handleRotatePage} style={{ padding: '8px 0', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: 'pointer', width: '100%' }}>Rotate Page</button>
            <button onClick={handleSplitPDF} style={{ padding: '8px 0', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: 'pointer', width: '100%' }}>Split (Export Current Page)</button>
          </div>
          <hr style={{ margin: '16px 0' }} />
          {error && (
            <div style={{ color: 'red', marginTop: 8, whiteSpace: 'pre-wrap', fontSize: 12 }}>{error}</div>
          )}
        </div>

        {/* Main PDF Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          height: '100%',
        }}>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Zoom controls */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', zIndex: 100 }}>
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} style={{ fontSize: 18, padding: '2px 10px' }}>-</button>
              <span style={{ fontWeight: 600 }}>Zoom: {(zoom * 100).toFixed(0)}%</span>
              <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} style={{ fontSize: 18, padding: '2px 10px' }}>+</button>
              <button onClick={() => setZoom(1.5)} style={{ fontSize: 14, padding: '2px 10px', marginLeft: 8 }}>Reset</button>
            </div>
            <div
              ref={containerRef}
              style={{
                flex: 1,
                overflow: 'auto',
                background: '#f8f8f8',
                padding: 20,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              {/* Font controls */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center', zIndex: 100 }}>
                <label>Font Size:
                  <input type="number" min={8} max={72} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={{ width: 50, marginLeft: 4 }} />
                </label>
                <label>Font Family:
                  <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} style={{ marginLeft: 4 }}>
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                </label>
                <label>Color:
                  <input type="color" value={fontColor} onChange={e => setFontColor(e.target.value)} style={{ marginLeft: 4 }} />
                </label>
                <label>Opacity:
                  <input type="range" min={0.1} max={1} step={0.05} value={opacity} onChange={e => setOpacity(Number(e.target.value))} style={{ marginLeft: 4 }} />
                  <span style={{ marginLeft: 4 }}>{opacity}</span>
                </label>
              </div>
              {/* PDF Canvas Container */}
              <div 
                ref={canvasContainerRef} 
                style={{ 
                  position: 'relative', 
                  zIndex: 1,
                  maxWidth: '100%',
                  maxHeight: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }} 
              />
              
              {/* Overlays for current page */}
              {pageSizes.length > 0 && totalPages > 0 && (
                <div
                  key={currentPage}
                  className="pdf-text-overlay"
                  style={{
                    position: 'absolute',
                    left: canvasOffset.x * zoom + 20,
                    top: canvasOffset.y * zoom + 20,
                    width: pageSizes[0]?.width * zoom || 0,
                    height: pageSizes[0]?.height * zoom || 0,
                    pointerEvents: 'none', // overlays don't block modal
                    zIndex: 10,
                  }}
                >
                  {/* Render images for this page */}
                  {images.filter((im) => im.page === currentPage).map((im, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'absolute',
                        left: im.x * zoom,
                        top: im.y * zoom,
                        width: im.width * zoom,
                        height: im.height * zoom,
                        zIndex: 20,
                        userSelect: 'none',
                        pointerEvents: 'auto',
                      }}
                    >
                      <img
                        src={im.src}
                        alt="dropped"
                        style={{
                          width: '100%',
                          height: '100%',
                          cursor: im.dragging ? 'grabbing' : 'grab',
                          display: 'block',
                          pointerEvents: 'auto',
                          userSelect: 'none',
                        }}
                        draggable={false}
                        onMouseDown={(e) => handleImageDragStart(e, images.findIndex((img) => img === im))}
                      />
                      {/* Resize handle (bottom-right corner) */}
                      <div
                        onMouseDown={(e) => handleImageResizeStart(e, images.findIndex((img) => img === im))}
                        style={{
                          position: 'absolute',
                          right: 0,
                          bottom: 0,
                          width: 16 * zoom,
                          height: 16 * zoom,
                          background: '#2563eb',
                          borderRadius: 3,
                          cursor: 'nwse-resize',
                          zIndex: 21,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          pointerEvents: 'auto',
                        }}
                        title="Resize"
                      >
                        <span style={{ color: '#fff', fontSize: 12 * zoom, fontWeight: 700, userSelect: 'none' }}>↔</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Render extracted text overlays for this page */}
                  {extractedText.filter((item) => item.page === currentPage).map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'absolute',
                        left: item.x * zoom,
                        top: item.y * zoom,
                        width: item.width * zoom,
                        height: item.height * zoom,
                        background: 'rgba(255,255,0,0.1)',
                        opacity: item.opacity,
                        cursor: 'pointer',
                        zIndex: 2,
                        pointerEvents: 'auto',
                      }}
                      title={item.str}
                      onClick={e => { e.stopPropagation(); handleExtractedTextClick(item); }}
                    />
                  ))}
                  {/* Render text overlays for this page */}
                  {textBoxes.filter((box) => box.page === currentPage).map((box, idx) => (
                    <div key={idx} style={{ position: 'absolute', left: box.x * zoom, top: box.y * zoom, zIndex: 25, minWidth: 60 * zoom, pointerEvents: 'auto' }}>
                      {editingIdx === idx ? (
                        <textarea
                          value={box.text}
                          autoFocus
                          onChange={e => handleTextChange(idx, e.target.value)}
                          style={{
                            fontSize: `${box.fontSize * zoom}px`,
                            fontFamily: box.fontFamily,
                            color: box.fontColor,
                            background: '#ffffff',
                            border: '2px solid #2563eb',
                            borderRadius: 4,
                            padding: '2px 6px',
                            opacity: 1,
                            resize: 'both',
                            minWidth: 60 * zoom,
                            maxWidth: 300 * zoom,
                            zIndex: 30,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          }}
                          onBlur={e => {
                            // Only close if focus is not moving to font controls
                            if (!fontControlsRef.current || !fontControlsRef.current.contains(e.relatedTarget)) {
                              setEditingIdx(null);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              setEditingIdx(null);
                            } else if (e.key === 'Escape') {
                              setEditingIdx(null);
                            }
                          }}
                          rows={1}
                        />
                      ) : (
                        <span
                          style={{
                            fontSize: `${box.fontSize * zoom}px`,
                            fontFamily: box.fontFamily,
                            color: box.fontColor,
                            background: editingIdx === idx ? 'rgba(255,255,0,0.9)' : 'rgba(255,255,255,1)',
                            borderRadius: 4,
                            padding: '2px 6px',
                            opacity: box.opacity,
                            cursor: 'pointer',
                            userSelect: 'text',
                            minWidth: 60 * zoom,
                            maxWidth: 300 * zoom,
                            display: 'inline-block',
                            border: editingIdx === idx ? '2px solid #2563eb' : 'none',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          }}
                          onClick={() => setEditingIdx(idx)}
                          onDoubleClick={() => setEditingIdx(idx)}
                          onMouseDown={e => handleMouseDown(e, idx)}
                          title="Click to edit"
                        >
                          {box.text}
                        </span>
                      )}
                      {/* Font controls for this text box if editing */}
                      {editingIdx === idx && (
                        <div ref={fontControlsRef} style={{ display: 'flex', gap: 6, marginTop: 2, alignItems: 'center' }}>
                          <input type="number" min={8} max={72} value={box.fontSize} onChange={e => handleFontControlChange(idx, 'fontSize', Number(e.target.value))} style={{ width: 40 }} />
                          <select value={box.fontFamily} onChange={e => handleFontControlChange(idx, 'fontFamily', e.target.value)}>
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Verdana">Verdana</option>
                          </select>
                          <input type="color" value={box.fontColor} onChange={e => handleFontControlChange(idx, 'fontColor', e.target.value)} />
                          <input type="range" min={0.1} max={1} step={0.05} value={box.opacity} onChange={e => handleFontControlChange(idx, 'opacity', Number(e.target.value))} />
                          <span>{box.opacity}</span>
                          <button 
                            onClick={() => handleDeleteTextBox(idx)}
                            style={{ 
                              background: '#ef4444', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: 4, 
                              padding: '2px 8px', 
                              cursor: 'pointer',
                              fontSize: 12
                            }}
                            title="Delete text box"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                 {/* Overlay click handler for adding text box */}
                 <div
                   className="pdf-text-overlay"
                   style={{
                     position: 'absolute',
                     left: 0,
                     top: 0,
                     width: '100%',
                     height: '100%',
                     zIndex: 1,
                     pointerEvents: 'auto',
                     background: 'transparent',
                   }}
                   onClick={handleOverlayClick}
                 />
               </div>
              )}
            </div>
            
            {/* Page navigation at bottom of modal, always visible */}
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              justifyContent: 'center',
              padding: '16px 0 0 0',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: 'white',
              position: 'absolute',
              left: 0,
              bottom: 0,
              zIndex: 200,
            }}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0 || totalPages === 0}
                style={{
                  padding: '6px 18px',
                  borderRadius: 4,
                  border: '1px solid #ccc',
                  background: (currentPage === 0 || totalPages === 0) ? '#eee' : '#fff',
                  cursor: (currentPage === 0 || totalPages === 0) ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
              >
                Prev
              </button>
              <span style={{ fontWeight: 600 }}>{currentPage + 1} / {totalPages}</span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages - 1 || totalPages === 0}
                style={{
                  padding: '6px 18px',
                  borderRadius: 4,
                  border: '1px solid #ccc',
                  background: (currentPage === totalPages - 1 || totalPages === 0) ? '#eee' : '#fff',
                  cursor: (currentPage === totalPages - 1 || totalPages === 0) ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFWysiwygEditor;
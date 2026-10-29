import React, { useState, useRef, useLayoutEffect } from 'react';
import BillForm from './components/BillForm';
import BillPreview from './components/BillPreview';
import './index.css';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// A4 proportions and the base (largest) font the bill is designed at.
const A4_RATIO = 297 / 210;
const BASE_FONT = 16;

// Shrink the bill's single font-size knob just enough that the whole sheet
// fits one A4 page at FULL width. Because every size in the template is in
// `em`, this scales the bill uniformly (no distortion) while block elements
// keep the full 210mm width. Short bills stay at BASE_FONT and the flex
// min-height anchors the footer to the bottom like a traditional invoice.
function fitBillToPage(wrapper) {
  if (!wrapper) return;
  const container = wrapper.querySelector('.bill-preview-container');
  if (!container) return;
  container.style.fontSize = `${BASE_FONT}px`;
  // Guard: if the sheet isn't laid out yet (width ~0), don't shrink to tiny.
  // A 210mm element is always ~794 CSS px, so anything tiny is a bad measure.
  if (wrapper.offsetWidth < 200) return;
  const targetHeight = wrapper.offsetWidth * A4_RATIO; // what 297mm is at this width
  let font = BASE_FONT;
  for (let i = 0; i < 10; i++) {
    const h = wrapper.scrollHeight;
    if (h <= targetHeight + 0.5) break; // fits (or min-height floor reached)
    font = Math.max(5, font * (targetHeight / h) * 0.995);
    container.style.fontSize = `${font}px`;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef();

  const [billData, setBillData] = useState({
    proprietorName: 'A. QADIR PAWASKAR',
    address: 'Mohd Umar Palace, A-Wing, 2nd Floor, R. No. 202, Kismat Colony, Kausa, Mumbra.',
    mobile: '9867426477',
    date: '20/10/2026',
    to: 'BOMBAY BUILDING COMPANY',
    site: 'Marine lines parsi dairy - Mumbai',
    billTitle: 'BILL FOR MATERIAL AND LABOUR CHARGE',
    items: [
      {
        description: '8 Nos 2x10 Mtr\n8 Nos 3x10 Mtr\n2 Nos 5x10 Mtr\nInstallation vertical net on 1st floor to 22th floor front side duct area',
        qty: '5380 sq ft',
        rate: '14',
        amount: '75320'
      }
    ],
    accountHolder: 'Pawaskar Abdul Qadir A G',
    bankName: 'Kokan Mercantile Co-op. Bank Ltd.',
    accountNo: '750101001016450',
    ifscCode: 'KKBK0KMCB02',
    themeColor: '#FF0000'
  });

  // Keep the live preview auto-fitted to one page whenever the data changes,
  // the preview tab opens, or the window resizes.
  useLayoutEffect(() => {
    if (activeTab !== 'preview') return;
    fitBillToPage(printRef.current);
    const onResize = () => fitBillToPage(printRef.current);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeTab, billData]);

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    // Capture the full A4 sheet (it already includes its own margins + box outline)
    const element = printRef.current;
    if (!element) {
      setIsGenerating(false);
      return;
    }

    try {
      // Make sure the bill is scaled to fit exactly one page before capture.
      fitBillToPage(element);
      // 1. Take a high-quality picture of the whole sheet. PNG keeps the thin
      //    black borders of the box/table crisp (JPEG blurs them).
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');

      // 2. Create a strict A4 PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();   // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

      // 3. Always map the sheet to the FULL A4 page (edge to edge). This keeps
      //    the bill broad and full-width every time instead of shrinking the
      //    width (and leaving ugly side gaps) whenever the content is tall.
      //    Short bills are already exactly A4-proportioned thanks to the
      //    min-height:297mm sheet, so there's no visible distortion; taller
      //    bills get only a slight, imperceptible vertical compression to fit
      //    a single page.
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
      pdf.save(`Bill_${billData.to.split('\n')[0]}_${billData.date}.pdf`);

    } catch (error) {
      console.error("Error generating PDF", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Bill Generator</h1>
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            Edit Bill
          </button>
          <button 
            className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview & Download
          </button>
        </div>
      </header>

      <main className="app-content">
        {activeTab === 'edit' && (
          <BillForm billData={billData} setBillData={setBillData} />
        )}
        
        {activeTab === 'preview' && (
          <div className="preview-section">
            <div className="download-bar">
              <button 
                className="primary-btn download-btn" 
                onClick={handleDownloadPdf}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating PDF...' : 'Download PDF'}
              </button>
            </div>
            {/* We wrap it in a scrollable container for mobile */}
            <div className="pdf-scroll-container">
              <BillPreview ref={printRef} billData={billData} />
            </div>
          </div>
        )}
      </main>
      
      {/* Hidden preview always rendered for PDF generation if we are on edit tab, but we actually only generate when on preview tab right now */}
    </div>
  );
}

export default App;

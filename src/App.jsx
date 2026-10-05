import React, { useState, useRef } from 'react';
import BillForm from './components/BillForm';
import BillPreview from './components/BillPreview';
import './index.css';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function App() {
  const [activeTab, setActiveTab] = useState('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef();

  const [billData, setBillData] = useState({
    proprietorName: 'A. QADIR PAWASKAR',
    address: 'Mohd Umar Palace, A-Wing, 2nd Floor, R. No. 202, Kismat Colony, Kausa, Mumbra.',
    mobile: '9867426477',
    date: new Date().toLocaleDateString('en-GB'),
    to: 'Taqwa Estates LLP',
    site: 'Mariana Height, Antop Hill, Wadala, Mumbai.',
    billTitle: 'BILL FOR MAINTENANCE AND LABOUR CHARGE',
    items: [
      {
        description: '8 Nos. 5 x 10 mtr. Net\nCleaning, Repairing and\nInstallation on 3rd Floor',
        qty: 'L.S.',
        rate: 'L.S.',
        amount: '15000'
      }
    ],
    accountHolder: 'Pawaskar Abdul Qadir A G',
    bankName: 'Kokan Mercantile Co-op. Bank Ltd.',
    accountNo: '750101001016450',
    ifscCode: 'KKBK0KMCB02',
    themeColor: '#FF0000'
  });

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    // Capture the full A4 sheet (it already includes its own margins + box outline)
    const element = printRef.current;
    if (!element) {
      setIsGenerating(false);
      return;
    }

    try {
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

      // 3. The sheet is already A4-proportioned, so map it to the full page.
      //    Preserve aspect ratio; if content overflowed (many items) fit to height.
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;

      let finalWidth = pageWidth;
      let finalHeight = finalWidth / ratio;

      if (finalHeight > pageHeight) {
        finalHeight = pageHeight;
        finalWidth = finalHeight * ratio;
      }

      // Center on the page (handles the overflow fallback gracefully)
      const xOffset = (pageWidth - finalWidth) / 2;
      const yOffset = (pageHeight - finalHeight) / 2;

      // 4. Add it to the PDF and save
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
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

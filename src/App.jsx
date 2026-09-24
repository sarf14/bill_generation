import React, { useState, useRef } from 'react';
import BillForm from './components/BillForm';
import BillPreview from './components/BillPreview';
import './index.css';

import html2pdf from 'html2pdf.js';

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
    ifscCode: 'KKBK0KMCB02'
  });

  const handleDownloadPdf = () => {
    setIsGenerating(true);
    const wrapper = printRef.current;
    if (!wrapper) return;

    const element = wrapper.querySelector('.bill-preview-container') || wrapper;

    const pxWidth = element.offsetWidth;
    const pxHeight = element.offsetHeight;
    
    // Calculate the required PDF height in mm to fit everything on one page.
    // A4 width is 210mm. Margin is 20mm on each side (40mm total).
    // So content width in PDF is 170mm.
    const pdfHeight = (pxHeight * 170 / pxWidth) + 40;

    const opt = {
      margin:       20, // 20mm standard margin
      filename:     `Bill_${billData.to.split('\n')[0]}_${billData.date}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      // Set width to 210mm (A4 width) and height dynamically to fit all content on exactly 1 page
      jsPDF:        { unit: 'mm', format: [210, Math.max(297, pdfHeight)], orientation: 'portrait' },
      pagebreak:    { mode: 'css', before: '.page-break' } 
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setIsGenerating(false);
    }).catch(error => {
      console.error("Error generating PDF", error);
      alert("Failed to generate PDF. Please try again.");
      setIsGenerating(false);
    });
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

import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import BillForm from './components/BillForm';
import BillPreview from './components/BillPreview';
import './index.css';

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

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    const element = printRef.current;
    if (!element) return;

    try {
      const clone = element.cloneNode(true);
      
      // Use absolute instead of fixed to prevent viewport height clipping on mobile
      Object.assign(clone.style, {
        position: 'absolute', 
        top: '0',
        left: '-9999px',
        width: '210mm', 
        height: 'max-content',
        transform: 'none',
        margin: '0',
        boxShadow: 'none', // Remove the shadow for a clean PDF
        backgroundColor: 'white'
      });
      
      // Also apply this to any children if text-size-adjust is messing them up
      clone.style.webkitTextSizeAdjust = '100%';
      clone.style.textSizeAdjust = '100%';
      
      document.body.appendChild(clone);
      
      // Small delay to ensure the browser has fully calculated the clone's height
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(clone, {
        scale: 2, 
        useCORS: true,
        logging: false,
        width: 794,
        height: clone.scrollHeight, // Force canvas height to the full content height
        windowWidth: 794, 
        windowHeight: clone.scrollHeight // Trick html2canvas into thinking the screen is infinitely tall
      });
      
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = 210;
      const pageHeight = 297;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages if the bill is very long
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
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

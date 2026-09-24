import React, { forwardRef } from 'react';
import { numberToWords } from '../utils/numberToWords';

const BillPreview = forwardRef(({ billData }, ref) => {
  // Calculate total
  const total = billData.items.reduce((acc, item) => {
    const amt = parseFloat(item.amount.replace(/,/g, ''));
    if (!isNaN(amt)) {
      return acc + amt;
    }
    return acc;
  }, 0);

  const totalInWords = numberToWords(total);

  return (
    <div className="preview-wrapper" ref={ref}>
      <div className="bill-preview-container">
        {/* Header */}
        <div className="bill-header">
          <div className="mobile-no">Mobile : {billData.mobile}</div>
          <h1 className="proprietor-name">{billData.proprietorName}</h1>
          <div className="address">{billData.address}</div>
        </div>

        <div className="bill-divider"></div>

        {/* Date and To */}
        <div className="bill-meta">
          <div className="date-row">
            <span>Date : {billData.date}</span>
          </div>
          <div className="to-section">
            To,<br />
            <span className="client-name">{billData.to.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}</span>
          </div>
        </div>

        {/* Site and Title */}
        <div className="bill-title-section">
          <div className="site-row">
            <span className="bold">Site : </span>
            <span className="underline bold">{billData.site}</span>
          </div>
          <h2 className="underline bill-title">{billData.billTitle}</h2>
        </div>

        {/* Items Table */}
        <table className="items-table">
          <thead>
            <tr>
              <th className="col-sr">Sr.<br/>No.</th>
              <th className="col-desc">Description</th>
              <th className="col-qty">Qty.</th>
              <th className="col-rate">Rate</th>
              <th className="col-amt">Amount</th>
            </tr>
          </thead>
          <tbody>
            {billData.items.map((item, index) => (
              <tr key={index}>
                <td className="col-sr">{index + 1}.</td>
                <td className="col-desc">
                  {item.description.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                </td>
                <td className="col-qty">{item.qty}</td>
                <td className="col-rate">{item.rate}</td>
                <td className="col-amt">{item.amount}</td>
              </tr>
            ))}
            {/* Empty space filler if needed could go here, but for auto-height it's fine */}
            <tr className="total-row">
              <td colSpan="4" className="text-right bold">TOTAL</td>
              <td className="col-amt bold">{total.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        {/* Amount in words */}
        <div className="amount-words">
          (Rupees {totalInWords} Only)
        </div>

        {/* Footer Details */}
        <div className="bill-footer">
          <div className="bank-details">
            <div className="bold">Bank Details :</div>
            <table>
              <tbody>
                <tr>
                  <td>Account Holder Name</td>
                  <td>: {billData.accountHolder}</td>
                </tr>
                <tr>
                  <td>Bank Name</td>
                  <td>: {billData.bankName}</td>
                </tr>
                <tr>
                  <td>Account No.</td>
                  <td>: {billData.accountNo}</td>
                </tr>
                <tr>
                  <td>IFSC Code</td>
                  <td>: {billData.ifscCode}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="signature-section">
            <div>Thanking you,</div>
            <div className="signature-block">
              Yours faithfully,<br />
              <span className="bold">{billData.proprietorName}</span>
              <br /><br /><br />
              (Proprietor)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default BillPreview;

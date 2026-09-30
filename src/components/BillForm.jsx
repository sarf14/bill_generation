import React from 'react';

const BillForm = ({ billData, setBillData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBillData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...billData.items];
    newItems[index][field] = value;
    
    // Auto calculate amount if qty and rate are numbers
    if (field === 'qty' || field === 'rate') {
      const qty = parseFloat(newItems[index].qty);
      const rate = parseFloat(newItems[index].rate);
      if (!isNaN(qty) && !isNaN(rate)) {
        newItems[index].amount = (qty * rate).toString();
      }
    }
    
    setBillData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setBillData((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', qty: '', rate: '', amount: '' }]
    }));
  };

  const removeItem = (index) => {
    const newItems = billData.items.filter((_, i) => i !== index);
    setBillData((prev) => ({ ...prev, items: newItems }));
  };

  return (
    <div className="bill-form-container">
      <h2>Edit Bill Details</h2>
      
      <div className="form-section">
        <h3>Theme Color</h3>
        <div className="color-options" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            type="button"
            className={`color-btn ${billData.themeColor === '#FF0000' ? 'active' : ''}`}
            style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FF0000', border: billData.themeColor === '#FF0000' ? '3px solid #111' : '1px solid #ccc', cursor: 'pointer' }}
            onClick={() => setBillData(prev => ({ ...prev, themeColor: '#FF0000' }))}
            title="Red"
          />
          <button 
            type="button"
            className={`color-btn ${billData.themeColor === '#008080' ? 'active' : ''}`}
            style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#008080', border: billData.themeColor === '#008080' ? '3px solid #111' : '1px solid #ccc', cursor: 'pointer' }}
            onClick={() => setBillData(prev => ({ ...prev, themeColor: '#008080' }))}
            title="Teal"
          />
          <div className="color-picker-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>More Colors:</span>
            <input 
              type="color" 
              name="themeColor" 
              value={billData.themeColor} 
              onChange={handleChange}
              style={{ width: '40px', height: '40px', padding: '0', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
              title="Custom Color"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Header Details</h3>
        <label>
          Proprietor Name:
          <input type="text" name="proprietorName" value={billData.proprietorName} onChange={handleChange} />
        </label>
        <label>
          Address:
          <textarea name="address" value={billData.address} onChange={handleChange} />
        </label>
        <label>
          Mobile:
          <input type="text" name="mobile" value={billData.mobile} onChange={handleChange} />
        </label>
      </div>

      <div className="form-section">
        <h3>Bill Details</h3>
        <label>
          Date:
          <input type="text" name="date" value={billData.date} onChange={handleChange} />
        </label>
        <label>
          To (Client):
          <textarea name="to" value={billData.to} onChange={handleChange} />
        </label>
        <label>
          Site:
          <textarea name="site" value={billData.site} onChange={handleChange} />
        </label>
        <label>
          Bill Title:
          <input type="text" name="billTitle" value={billData.billTitle} onChange={handleChange} />
        </label>
      </div>

      <div className="form-section">
        <h3>Items</h3>
        {billData.items.map((item, index) => (
          <div key={index} className="item-row">
            <span className="item-number">{index + 1}.</span>
            <div className="item-inputs">
              <label>Description:
                <textarea 
                  value={item.description} 
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)} 
                />
              </label>
              <div className="item-numbers">
                <label>Qty:
                  <input type="text" value={item.qty} onChange={(e) => handleItemChange(index, 'qty', e.target.value)} />
                </label>
                <label>Rate:
                  <input type="text" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', e.target.value)} />
                </label>
                <label>Amount:
                  <input type="text" value={item.amount} onChange={(e) => handleItemChange(index, 'amount', e.target.value)} />
                </label>
              </div>
            </div>
            <button className="danger-btn" onClick={() => removeItem(index)}>Remove</button>
          </div>
        ))}
        <button className="primary-btn add-btn" onClick={addItem}>+ Add Item</button>
      </div>

      <div className="form-section">
        <h3>Bank Details</h3>
        <label>Account Holder Name:
          <input type="text" name="accountHolder" value={billData.accountHolder} onChange={handleChange} />
        </label>
        <label>Bank Name:
          <input type="text" name="bankName" value={billData.bankName} onChange={handleChange} />
        </label>
        <label>Account No.:
          <input type="text" name="accountNo" value={billData.accountNo} onChange={handleChange} />
        </label>
        <label>IFSC Code:
          <input type="text" name="ifscCode" value={billData.ifscCode} onChange={handleChange} />
        </label>
      </div>
    </div>
  );
};

export default BillForm;

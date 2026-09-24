import React from 'react';
import { render, screen } from '@testing-library/react';
import BillPreview from './BillPreview';

describe('BillPreview Component', () => {
  const defaultBillData = {
    proprietorName: 'TEST PROPRIETOR',
    address: 'Test Address 123',
    mobile: '1234567890',
    date: '25/09/2026',
    to: 'Test Client LLP',
    site: 'Test Site Location',
    billTitle: 'TEST BILL TITLE',
    items: [
      {
        description: 'Test Item 1',
        qty: '1',
        rate: '100',
        amount: '100'
      }
    ],
    accountHolder: 'Test Account Holder',
    bankName: 'Test Bank',
    accountNo: '123456',
    ifscCode: 'TEST001'
  };

  it('renders bill data correctly', () => {
    render(<BillPreview billData={defaultBillData} />);
    
    expect(screen.getAllByText('TEST PROPRIETOR')[0]).toBeInTheDocument();
    expect(screen.getByText('Test Address 123')).toBeInTheDocument();
    expect(screen.getByText(/1234567890/)).toBeInTheDocument();
    expect(screen.getByText(/25\/09\/2026/)).toBeInTheDocument();
    expect(screen.getByText('Test Client LLP')).toBeInTheDocument();
    expect(screen.getByText('Test Site Location')).toBeInTheDocument();
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
  });

  it('calculates total correctly for multiple items', () => {
    const dataWithMultipleItems = {
      ...defaultBillData,
      items: [
        { description: 'Item 1', qty: '1', rate: '1000', amount: '1000' },
        { description: 'Item 2', qty: '2', rate: '2000', amount: '4000' },
      ]
    };
    render(<BillPreview billData={dataWithMultipleItems} />);
    
    // Total should be 5000 (1000 + 4000)
    // The number is formatted as 5,000
    expect(screen.getByText('5,000')).toBeInTheDocument();
    expect(screen.getByText(/\(Rupees Five Thousand Only\)/)).toBeInTheDocument();
  });

  it('stress test: renders flawlessly with 50 synthetic items', () => {
    // Generate synthetic data
    const syntheticItems = Array.from({ length: 50 }, (_, i) => ({
      description: `Synthetic Item ${i + 1}`,
      qty: '1',
      rate: '100',
      amount: '100'
    }));

    const stressTestData = {
      ...defaultBillData,
      items: syntheticItems
    };

    const { container } = render(<BillPreview billData={stressTestData} />);
    
    // Check if the first and last synthetic items are rendered
    expect(screen.getByText('Synthetic Item 1')).toBeInTheDocument();
    expect(screen.getByText('Synthetic Item 50')).toBeInTheDocument();
    
    // 50 items * 100 = 5000
    expect(screen.getByText('5,000')).toBeInTheDocument();
    
    // The total rows count should be exactly 50 item rows + 1 total row + 1 header row
    const rows = container.querySelectorAll('table.items-table tr');
    expect(rows.length).toBe(52); // 1 header + 50 items + 1 total
  });
  
  it('handles empty item array safely', () => {
    const emptyData = { ...defaultBillData, items: [] };
    render(<BillPreview billData={emptyData} />);
    
    // Total should be 0
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});

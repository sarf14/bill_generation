import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BillForm from './BillForm';

describe('BillForm Component', () => {
  let mockBillData;
  let mockSetBillData;

  beforeEach(() => {
    mockBillData = {
      proprietorName: 'Test Name',
      address: 'Test Address',
      mobile: '12345',
      date: '01/01/2026',
      to: 'Test To',
      site: 'Test Site',
      billTitle: 'Test Title',
      items: [
        { description: 'Item 1', qty: '1', rate: '100', amount: '100' }
      ],
      accountHolder: 'Test Acc',
      bankName: 'Test Bank',
      accountNo: '123',
      ifscCode: 'IFSC123'
    };
    mockSetBillData = vi.fn();
  });

  it('renders all form inputs correctly', () => {
    render(<BillForm billData={mockBillData} setBillData={mockSetBillData} />);
    
    expect(screen.getByDisplayValue('Test Name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Item 1')).toBeInTheDocument();
  });

  it('calls setBillData when input changes', async () => {
    render(<BillForm billData={mockBillData} setBillData={mockSetBillData} />);
    
    const proprietorInput = screen.getByDisplayValue('Test Name');
    
    // Simulate typing a new name
    await userEvent.clear(proprietorInput);
    await userEvent.type(proprietorInput, 'New Name');
    
    // Check if the mock function was called
    expect(mockSetBillData).toHaveBeenCalled();
  });

  it('adds a new item row when Add Item is clicked', async () => {
    render(<BillForm billData={mockBillData} setBillData={mockSetBillData} />);
    
    const addButton = screen.getByText('+ Add Item');
    await userEvent.click(addButton);
    
    // Should call setBillData with a new item appended
    expect(mockSetBillData).toHaveBeenCalled();
    const updaterFunction = mockSetBillData.mock.calls[0][0];
    
    // Test the state updater function
    const nextState = updaterFunction(mockBillData);
    expect(nextState.items.length).toBe(2);
    expect(nextState.items[1]).toEqual({ description: '', qty: '', rate: '', amount: '' });
  });

  it('removes an item row when Remove is clicked', async () => {
    mockBillData.items.push({ description: 'Item 2', qty: '2', rate: '200', amount: '400' });
    render(<BillForm billData={mockBillData} setBillData={mockSetBillData} />);
    
    const removeButtons = screen.getAllByText('Remove');
    expect(removeButtons.length).toBe(2);
    
    await userEvent.click(removeButtons[1]); // Remove second item
    
    expect(mockSetBillData).toHaveBeenCalled();
    const updaterFunction = mockSetBillData.mock.calls[0][0];
    
    // Test the state updater function
    const nextState = updaterFunction(mockBillData);
    expect(nextState.items.length).toBe(1);
    expect(nextState.items[0].description).toBe('Item 1');
  });
});

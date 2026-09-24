import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App Component', () => {
  it('renders the header and tabs', () => {
    render(<App />);
    expect(screen.getByText('Bill Generator')).toBeInTheDocument();
    expect(screen.getByText('Edit Bill')).toBeInTheDocument();
    expect(screen.getByText('Preview & Download')).toBeInTheDocument();
  });

  it('switches between Edit and Preview tabs', async () => {
    render(<App />);
    
    // Initially should show the form (Edit tab active)
    expect(screen.getByText('Proprietor Name:')).toBeInTheDocument();
    
    // Switch to Preview tab
    const previewTab = screen.getByText('Preview & Download');
    await userEvent.click(previewTab);
    
    // Form should not be visible
    expect(screen.queryByText('Proprietor Name:')).not.toBeInTheDocument();
    
    // Download button should be visible
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
    
    // Switch back to Edit tab
    const editTab = screen.getByText('Edit Bill');
    await userEvent.click(editTab);
    
    expect(screen.getByText('Proprietor Name:')).toBeInTheDocument();
    expect(screen.queryByText('Download PDF')).not.toBeInTheDocument();
  });
});

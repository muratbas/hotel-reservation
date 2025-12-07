// Helper function to fix corrupted Turkish character encoding
// Fixes common encoding issues like Y??netici -> Yönetici

export const fixTurkishEncoding = (text: string): string => {
  if (!text) return text;
  
  // Common corrupted encodings and their fixes
  const fixes: Record<string, string> = {
    'Y??netici': 'Yönetici',
    'Administrator': 'Yönetici', // Old name
    // Add more fixes if needed
  };
  
  return fixes[text] || text;
};


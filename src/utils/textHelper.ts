export const fixTurkishEncoding = (text: string): string => {
  if (!text) return text;
  
  
  const fixes: Record<string, string> = {
    'Y??netici': 'Yönetici',
    'Administrator': 'Yönetici', 
    
  };
  
  return fixes[text] || text;
};

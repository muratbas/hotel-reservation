// Helper function to check if a manager has admin/manager role
// This handles encoding issues with Turkish characters

export const isManagerRole = (role: string): boolean => {
  if (!role) return false;
  
  // Check for various possible encodings of "Yönetici"
  const roleUpper = role.toUpperCase();
  
  return (
    role === 'Yönetici' ||           // Correct Turkish
    role === 'Manager' ||             // English
    roleUpper.includes('Y') && roleUpper.includes('NETICI') || // Encoding issue: Y??netici
    roleUpper === 'YÖNETICI' ||      // Uppercase Turkish
    roleUpper === 'MANAGER'           // Uppercase English
  );
};

export const isStaffRole = (role: string): boolean => {
  return !isManagerRole(role);
};


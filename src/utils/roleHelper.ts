export const isManagerRole = (role: string): boolean => {
  if (!role) return false;
  
  
  const roleUpper = role.toUpperCase();
  
  return (
    role === 'Yönetici' ||           
    role === 'Manager' ||             
    roleUpper.includes('Y') && roleUpper.includes('NETICI') || 
    roleUpper === 'YÖNETICI' ||      
    roleUpper === 'MANAGER'           
  );
};

export const isStaffRole = (role: string): boolean => {
  return !isManagerRole(role);
};


import { useState, useEffect } from 'react';

const ADMIN_WHATSAPP = '95984266336';
const ADMIN_CODE = '8744';
const ADMIN_SESSION_KEY = 'admin_session';

export const useAdminSession = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se já existe uma sessão admin
    const adminSession = localStorage.getItem(ADMIN_SESSION_KEY);
    if (adminSession) {
      setIsAdminLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const loginAdmin = (whatsapp: string, code: string) => {
    if (whatsapp === ADMIN_WHATSAPP && code === ADMIN_CODE) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdminLoggedIn(false);
  };

  return {
    isAdminLoggedIn,
    loading,
    loginAdmin,
    logoutAdmin
  };
};


import { useState, useEffect } from 'react';

const ADMIN_WHATSAPP = '95984266336';
const ADMIN_CODE = '8744';
const ADMIN_SESSION_KEY = 'admin_session';

export const useAdminSession = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAdminSession: Verificando sessão admin...');
    // Verificar se já existe uma sessão admin
    const adminSession = localStorage.getItem(ADMIN_SESSION_KEY);
    console.log('useAdminSession: Sessão encontrada:', adminSession);
    if (adminSession === 'true') {
      setIsAdminLoggedIn(true);
      console.log('useAdminSession: Admin logado automaticamente');
    }
    setLoading(false);
  }, []);

  const loginAdmin = (whatsapp: string, code: string) => {
    console.log('loginAdmin: Tentando login com:', { whatsapp, code });
    console.log('loginAdmin: Valores esperados:', { expected_whatsapp: ADMIN_WHATSAPP, expected_code: ADMIN_CODE });
    
    if (whatsapp === ADMIN_WHATSAPP && code === ADMIN_CODE) {
      console.log('loginAdmin: Credenciais corretas, fazendo login...');
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      setIsAdminLoggedIn(true);
      return true;
    }
    console.log('loginAdmin: Credenciais incorretas');
    return false;
  };

  const logoutAdmin = () => {
    console.log('logoutAdmin: Fazendo logout do admin...');
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

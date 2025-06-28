
export const useInputMasks = () => {
  const formatCPF = (value: string) => {
    // Remove todos os caracteres não numéricos
    const onlyNumbers = value.replace(/\D/g, '');
    
    // Aplica a máscara XXX.XXX.XXX-XX
    if (onlyNumbers.length <= 3) {
      return onlyNumbers;
    } else if (onlyNumbers.length <= 6) {
      return `${onlyNumbers.slice(0, 3)}.${onlyNumbers.slice(3)}`;
    } else if (onlyNumbers.length <= 9) {
      return `${onlyNumbers.slice(0, 3)}.${onlyNumbers.slice(3, 6)}.${onlyNumbers.slice(6)}`;
    } else {
      return `${onlyNumbers.slice(0, 3)}.${onlyNumbers.slice(3, 6)}.${onlyNumbers.slice(6, 9)}-${onlyNumbers.slice(9, 11)}`;
    }
  };

  const formatCNPJ = (value: string) => {
    // Remove todos os caracteres não numéricos
    const onlyNumbers = value.replace(/\D/g, '');
    
    // Aplica a máscara XX.XXX.XXX/XXXX-XX
    if (onlyNumbers.length <= 2) {
      return onlyNumbers;
    } else if (onlyNumbers.length <= 5) {
      return `${onlyNumbers.slice(0, 2)}.${onlyNumbers.slice(2)}`;
    } else if (onlyNumbers.length <= 8) {
      return `${onlyNumbers.slice(0, 2)}.${onlyNumbers.slice(2, 5)}.${onlyNumbers.slice(5)}`;
    } else if (onlyNumbers.length <= 12) {
      return `${onlyNumbers.slice(0, 2)}.${onlyNumbers.slice(2, 5)}.${onlyNumbers.slice(5, 8)}/${onlyNumbers.slice(8)}`;
    } else {
      return `${onlyNumbers.slice(0, 2)}.${onlyNumbers.slice(2, 5)}.${onlyNumbers.slice(5, 8)}/${onlyNumbers.slice(8, 12)}-${onlyNumbers.slice(12, 14)}`;
    }
  };

  const formatCPFCNPJ = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, '');
    
    // Se tiver 11 dígitos ou menos, trata como CPF
    if (onlyNumbers.length <= 11) {
      return formatCPF(value);
    } else {
      // Se tiver mais de 11 dígitos, trata como CNPJ
      return formatCNPJ(value);
    }
  };

  const formatCEP = (value: string) => {
    // Remove todos os caracteres não numéricos
    const onlyNumbers = value.replace(/\D/g, '');
    
    // Aplica a máscara XXXXX-XXX
    if (onlyNumbers.length <= 5) {
      return onlyNumbers;
    } else {
      return `${onlyNumbers.slice(0, 5)}-${onlyNumbers.slice(5, 8)}`;
    }
  };

  return {
    formatCPF,
    formatCNPJ,
    formatCPFCNPJ,
    formatCEP
  };
};

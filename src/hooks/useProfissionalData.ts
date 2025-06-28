
import { useState, useEffect } from 'react';
import { Profissional, loadCidades, loadProfissionalCategorias } from '@/services/supabaseService';

export const useProfissionalData = (profissional: Profissional | null, whatsapp: string) => {
  const [cidades, setCidades] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [formData, setFormData] = useState<Profissional>({
    cpf_cnpj: '',
    nome: '',
    whatsapp: whatsapp,
    email: '',
    estado: '',
    cidade: '',
    bairro: '',
    rua: '',
    numero: '',
    cep: '',
    aceita_diaria: false,
    valor_diaria: 0,
    crea: '',
    creci: '',
    nacionalidade: 'Brasileira',
    receber_msm: true
  });

  // Carregar dados do profissional existente
  useEffect(() => {
    if (profissional) {
      setFormData({
        cpf_cnpj: profissional.cpf_cnpj || '',
        nome: profissional.nome || '',
        whatsapp: profissional.whatsapp || whatsapp,
        email: profissional.email || '',
        estado: profissional.estado || '',
        cidade: profissional.cidade || '',
        bairro: profissional.bairro || '',
        rua: profissional.rua || '',
        numero: profissional.numero || '',
        cep: profissional.cep || '',
        aceita_diaria: profissional.aceita_diaria || false,
        valor_diaria: profissional.valor_diaria || 0,
        crea: profissional.crea || '',
        creci: profissional.creci || '',
        nacionalidade: profissional.nacionalidade || 'Brasileira',
        receber_msm: profissional.receber_msm ?? true
      });
    }
  }, [profissional, whatsapp]);

  // Carregar cidades quando estado muda
  useEffect(() => {
    if (formData.estado) {
      loadCidades(formData.estado)
        .then(cidadesData => {
          setCidades(cidadesData);
        })
        .catch(error => {
          console.error('Erro ao carregar cidades:', error);
          setCidades([]);
        });
    } else {
      setCidades([]);
    }
  }, [formData.estado]);

  // Carregar categorias
  useEffect(() => {
    if (!categoriesLoaded) {
      if (profissional?.id) {
        loadProfissionalCategorias(profissional.id).then(categorias => {
          const categoryIds = categorias.map(cat => cat.categoria_id);
          setSelectedCategories(categoryIds);
          setCategoriesLoaded(true);
        }).catch(error => {
          console.error('Erro ao carregar categorias:', error);
          setCategoriesLoaded(true);
        });
      } else {
        setCategoriesLoaded(true);
      }
    }
  }, [profissional, categoriesLoaded]);

  return {
    formData,
    setFormData,
    cidades,
    selectedCategories,
    setSelectedCategories,
    categoriesLoaded
  };
};

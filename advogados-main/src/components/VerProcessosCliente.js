import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { supabase } from '../supabaseClient';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

const VerProcessosCliente = ({ handleLogout }) => {
  const [processos, setProcessos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [advogado, setAdvogado] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Recuperar o advogado do localStorage
    const storedAdvogado = localStorage.getItem('advogadoLogado');
    if (storedAdvogado) {
      const advogadoData = JSON.parse(storedAdvogado);
      setAdvogado(advogadoData);
      fetchProcessos(advogadoData.id);
    } else {
      console.error('Nenhum advogado encontrado. Redirecionando para login.');
      navigate('/login');
    }
  }, [navigate]);

  const fetchProcessos = async (advogadoId) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('processos')
        .select(`
          id, 
          numero, 
          descricao, 
          valor_causa,
          cliente_id (nome_completo)
        `)
        .eq('advogado_id', advogadoId);

      if (error) {
        throw error;
      }
      setProcessos(data);
    } catch (error) {
      console.error('Erro ao buscar processos:', error.message);
      setErrorMessage('Erro ao carregar os processos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (processo) => {
    navigate(`/processo/${processo.id}`, { state: { processo } });
  };

  const renderContent = () => {
    if (errorMessage) {
      return <Typography color="error">{errorMessage}</Typography>;
    }

    if (isLoading) {
      return <Typography variant="body1">Carregando...</Typography>;
    }

    if (processos.length === 0) {
      return <Typography variant="body1">Nenhum processo encontrado para este advogado.</Typography>;
    }

    return (
      <Grid container spacing={3}>
        {processos.map((processo) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={processo.id}>
            <Card
              sx={{
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                '&:hover': { transform: 'scale(1.05)', transition: '0.3s' },
              }}
              onClick={() => handleNavigate(processo)}
            >
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Processo {processo.numero}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  💰 <strong>Valor da Causa:</strong> R$ {processo.valor_causa}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  👤 <strong>Cliente:</strong> {processo.cliente_id?.nome_completo || 'Não disponível'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box display="flex">
      {/* Sidebar fixa na lateral */}
      <Sidebar handleLogout={handleLogout} />

      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { xs: 0, md: '280px' }, // Ajuste para a largura da Sidebar
          width: '100%',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Processos do Cliente
        </Typography>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default VerProcessosCliente;

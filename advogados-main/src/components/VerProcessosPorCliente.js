import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { supabase } from '../supabaseClient';

const VerProcessosPorCliente = () => {
  const { clienteId } = useParams(); // Obtém o clienteId da URL
  const [processos, setProcessos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [advogado, setAdvogado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Recuperar o advogado do localStorage
    const storedAdvogado = localStorage.getItem('advogadoLogado');
    if (storedAdvogado) {
      const advogadoData = JSON.parse(storedAdvogado);
      setAdvogado(advogadoData);
    } else {
      console.error('Nenhum advogado encontrado. Redirecionando para login.');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchProcessos = async () => {
      if (!clienteId || !advogado) {
        console.error('Cliente ID ou advogado não fornecido.');
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('processos')
          .select(`
            id, 
            numero, 
            descricao, 
            valor_causa,
            advogado_id (nome_completo)
          `)
          .eq('cliente_id', clienteId);

        if (error) {
          throw error;
        }
        setProcessos(data);
      } catch (error) {
        console.error('Erro ao buscar processos do cliente:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (advogado) {
      fetchProcessos();
    }
  }, [clienteId, advogado]);

  const handleNavigate = (processo) => {
    navigate(`/processo/${processo.id}`, { state: { processo } });
  };

  const handleBack = () => {
    navigate(-1); // Volta para a tela anterior
  };

  return (
    <Box display="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { xs: 0, md: '250px' }, // Espaço para a Sidebar em telas maiores
          width: '100%', // Mantém o conteúdo dentro da largura disponível
        }}
      >
        <Button
          variant="contained"
          onClick={handleBack}
          sx={{
            mb: { xs: 2, md: 3 }, // Margem inferior maior em dispositivos móveis
            mt: { xs: 2, md: 0 }, // Margem superior para afastar do topo em mobile
            color: 'white', // Cor do texto no botão
            backgroundColor: '#1976d2', // Cor de fundo do botão
            '&:hover': {
              backgroundColor: '#1565c0', // Cor de fundo ao passar o mouse
            },
          }}
        >
          ⬅️ Voltar
        </Button>

        <Typography variant="h4" gutterBottom>
          Processos do Cliente
        </Typography>
        
        {isLoading ? (
          <Typography variant="body1">Carregando...</Typography>
        ) : processos.length > 0 ? (
          <Grid container spacing={3}>
            {processos.map((processo) => (
              <Grid item xs={12} sm={6} md={4} key={processo.id}>
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
                      👩‍⚖️ <strong>Advogado:</strong> {processo.advogado_id?.nome_completo || 'Não disponível'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1">Nenhum processo encontrado para este cliente.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default VerProcessosPorCliente;

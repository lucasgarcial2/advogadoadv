import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import VerProcessosCliente from './VerProcessosCliente';
import EditarCadastro from './EditarCadastro';
import ListaClientes from './ListaClientes'; // Novo componente
import { supabase } from '../supabaseClient';

const Dashboard = ({ handleLogout }) => {
  const [activePage, setActivePage] = useState('home');
  const navigate = useNavigate();
  const [advogado, setAdvogado] = useState(null);
  const [processoCount, setProcessoCount] = useState(0);
  const [clienteCount, setClienteCount] = useState(0);

  useEffect(() => {
    // Recuperar dados do advogado do localStorage
    const storedAdvogado = localStorage.getItem('advogadoLogado');
    if (storedAdvogado) {
      setAdvogado(JSON.parse(storedAdvogado));
    } else {
      console.error('Nenhum advogado encontrado. Redirecionando para login.');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (!advogado) return;

    const fetchProcessoData = async () => {
      try {
        const { data: processos, error: processoError } = await supabase
          .from('processos')
          .select('id, cliente_id')
          .eq('advogado_id', advogado.id);

        if (processoError) {
          console.error('Erro ao buscar processos:', processoError);
        } else {
          setProcessoCount(processos.length); // Total de processos

          // Calcula clientes únicos associados aos processos
          const uniqueClientes = new Set(processos.map((processo) => processo.cliente_id));
          setClienteCount(uniqueClientes.size);
        }
      } catch (error) {
        console.error('Erro ao carregar dados dos processos:', error);
      }
    };

    fetchProcessoData();
  }, [advogado]);

  const handleNavigateToProcessos = () => {
    setActivePage('verProcessosCliente');
  };

  const handleNavigateToClientes = () => {
    setActivePage('verClientes');
  };

  const renderContent = () => {
    if (!advogado) {
      return (
        <Box textAlign="center" mt={5}>
          <Typography variant="h6" color="error">
            Não foi possível carregar os dados do advogado.
          </Typography>
        </Box>
      );
    }

    switch (activePage) {
      case 'verProcessosCliente':
        return <VerProcessosCliente advogadoId={advogado.id} />;
      case 'verClientes':
        return <ListaClientes advogadoId={advogado.id} />;
      case 'editarCadastro':
        return <EditarCadastro />;
      default:
        return (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            minHeight="80vh"
            sx={{
              mt: { xs: 2, md: 8 },
              mx: { xs: 2, md: 4 },
              p: { xs: 2, md: 5 },
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontSize: { xs: '1.5rem', md: '2.5rem' }, mb: { xs: 2, md: 3 } }}
            >
              👩‍⚖️ Bem-vindo ao Dashboard 👨‍⚖️
            </Typography>
            <Box mt={2} sx={{ textAlign: 'center', width: { xs: '100%', md: '80%' } }}>
              <Typography
                variant="h6"
                sx={{ fontSize: { xs: '1.2rem', md: '1.8rem' }, mb: 1 }}
              >
                Advogado: {advogado.nome_completo}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontSize: { xs: '1.2rem', md: '1.8rem' }, mb: 1 }}
              >
                OAB: {advogado.oab}
              </Typography>
              <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    onClick={handleNavigateToProcessos}
                    sx={{
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                      textAlign: 'center',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.05)', transition: '0.3s' },
                    }}
                  >
                    <CardContent>
                      <Typography variant="h5">📄 Processos</Typography>
                      <Typography variant="h3" color="primary" sx={{ my: 1 }}>{processoCount}</Typography>
                      <Typography>Processos em andamento</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    onClick={handleNavigateToClientes}
                    sx={{
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                      textAlign: 'center',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.05)', transition: '0.3s' },
                    }}
                  >
                    <CardContent>
                      <Typography variant="h5">👥 Clientes</Typography>
                      <Typography variant="h3" color="primary" sx={{ my: 1 }}>{clienteCount}</Typography>
                      <Typography>Clientes atendidos</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                      textAlign: 'center',
                      padding: '1.5rem',
                      minHeight: '150px',
                    }}
                  >
                    <CardContent>
                      <Typography variant="h5">📢 Avisos</Typography>
                      <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                        Nenhum aviso pendente no momento.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );
    }
  };

  return (
    <Box display="flex" sx={{ minHeight: '100vh' }}>
      <Sidebar setActivePage={setActivePage} handleLogout={handleLogout} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: '280px' }, // Ajusta margem para compensar a Sidebar
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
};

export default Dashboard;

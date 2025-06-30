import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ListaClientes = ({ advogadoId }) => {
  const [clientes, setClientes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const { data, error } = await supabase
          .from('processos')
          .select(`
            cliente_id (
              id,
              nome_completo
            )
          `)
          .eq('advogado_id', advogadoId);

        if (error) {
          console.error('Erro ao buscar clientes:', error);
          return;
        }

        const uniqueClientes = [];
        const clienteIds = new Set();

        data.forEach(processo => {
          const cliente = processo.cliente_id;
          if (cliente && !clienteIds.has(cliente.id)) {
            clienteIds.add(cliente.id);
            uniqueClientes.push(cliente);
          }
        });

        setClientes(uniqueClientes);
      } catch (error) {
        console.error('Erro ao carregar dados dos clientes:', error);
      }
    };

    fetchClientes();
  }, [advogadoId]);

  const handleClientClick = (clienteId) => {
    navigate(`/cliente/${clienteId}/processos`);
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>Clientes</Typography>
      <Grid container spacing={3}>
        {clientes.map((cliente) => (
          <Grid item xs={12} sm={6} md={4} key={cliente.id}>
            <Card
              onClick={() => handleClientClick(cliente.id)}
              sx={{
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                '&:hover': { transform: 'scale(1.05)', transition: '0.3s' },
              }}
            >
              <CardContent>
                <Typography variant="h5" gutterBottom>{cliente.nome_completo}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ListaClientes;

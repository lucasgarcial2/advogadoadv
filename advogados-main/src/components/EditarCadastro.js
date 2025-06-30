import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Grid, TextField, Box } from '@mui/material';
import bcrypt from 'bcryptjs';
import { supabase } from '../supabaseClient';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

const EditarAdvogado = ({ handleLogout }) => {
  const [advogado, setAdvogado] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Recuperar o advogado do localStorage
    const storedAdvogado = localStorage.getItem('advogadoLogado');
    if (storedAdvogado) {
      const advogadoData = JSON.parse(storedAdvogado);
      fetchAdvogado(advogadoData.id);
    } else {
      console.error('Nenhum advogado encontrado. Redirecionando para login.');
      navigate('/login');
    }
  }, [navigate]);

  const fetchAdvogado = async (advogadoId) => {
    try {
      const { data, error } = await supabase
        .from('login_advogados')
        .select('id, advogado_id, nome, email, oab, cpf')
        .eq('advogado_id', advogadoId)
        .single();

      if (error || !data) {
        setErrorMessage('Erro ao buscar dados do advogado.');
      } else {
        setAdvogado(data);
      }
    } catch (error) {
      console.error('Erro ao buscar advogado:', error.message);
      setErrorMessage('Erro interno ao carregar os dados.');
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setSenha('');
  };

  const handleUpdateAdvogado = async (e) => {
    e.preventDefault();

    if (!senha) {
      alert('Por favor, insira a nova senha.');
      return;
    }

    const hashedPassword = bcrypt.hashSync(senha, 10);

    setLoading(true);
    try {
      const { error } = await supabase
        .from('login_advogados')
        .update({
          senha: hashedPassword,
        })
        .eq('id', advogado.id);

      if (error) {
        console.error('Erro ao atualizar senha do advogado:', error.message);
        alert('Erro ao atualizar senha do advogado.');
      } else {
        alert('Senha atualizada com sucesso!');
        setIsEditing(false);
        setSenha('');
      }
    } catch (error) {
      console.error('Erro interno ao atualizar:', error.message);
      alert('Erro interno ao atualizar senha.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (errorMessage) {
      return <Typography color="error">{errorMessage}</Typography>;
    }

    if (!advogado) {
      return <Typography>Carregando advogado...</Typography>;
    }

    return (
      <Box sx={{ padding: '20px' }}>
        <Typography variant="h4" gutterBottom>
          📝 Editar Advogado
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  Nome: {advogado.nome}
                </Typography>
                <Typography color="textSecondary">CPF: {advogado.cpf}</Typography>
                <Typography color="textSecondary">E-Mail: {advogado.email}</Typography>
                <Typography color="textSecondary">OAB: {advogado.oab}</Typography>

                {isEditing ? (
                  <form onSubmit={handleUpdateAdvogado}>
                    <TextField
                      label="Nova Senha"
                      type="password"
                      variant="outlined"
                      fullWidth
                      required
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      style={{ marginTop: '10px' }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      style={{ marginTop: '10px' }}
                      disabled={loading}
                    >
                      {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      onClick={() => setIsEditing(false)}
                      style={{ marginTop: '10px' }}
                    >
                      Cancelar
                    </Button>
                  </form>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleEditClick}
                    style={{ marginTop: '10px' }}
                  >
                    Alterar Senha
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box display="flex">
      {/* Sidebar fixa na lateral */}
      <Sidebar handleLogout={handleLogout} />

      {/* Conteúdo principal */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: { xs: 0, md: '280px' } }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default EditarAdvogado;

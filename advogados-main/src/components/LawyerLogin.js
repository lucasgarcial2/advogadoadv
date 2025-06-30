import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/system';
import { supabase } from '../supabaseClient';
import bcrypt from 'bcryptjs';
import { Link, useNavigate } from 'react-router-dom';

const Background = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  width: '100vw',
  overflow: 'hidden',
  background: '#f5f5f5',
});

const LoginContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  maxWidth: '900px',
  borderRadius: '10px',
  overflow: 'hidden',
  padding: '40px',
  opacity: 0,
  animation: 'fadeIn 1s forwards',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
    },
    '100%': {
      opacity: 1,
    },
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: '1000px',
    padding: '60px',
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

const LeftSection = styled(Box)({
  flex: 1,
  color: '#013142',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px 40px',
  backgroundColor: 'transparent',
});

const LogoImage = styled('img')({
  marginTop: '20px',
  width: '300px',
  height: 'auto',
  display: 'block',
});

const FormSection = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  [theme.breakpoints.up('lg')]: {
    padding: '40px',
  },
}));

const LoginForm = ({
  oab,
  setOAB,
  password,
  setPassword,
  handleLogin,
  message,
  loading,
}) => (
  <form onSubmit={handleLogin}>
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          label="OAB"
          variant="outlined"
          fullWidth
          required
          value={oab}
          onChange={(e) => setOAB(e.target.value)}
          autoComplete="username"
          InputProps={{
            style: { fontSize: '1.2rem' },
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Senha"
          type="password"
          variant="outlined"
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          InputProps={{
            style: { fontSize: '1.2rem' },
          }}
          error={message.includes('Senha incorreta')}
          helperText={
            message.includes('Senha incorreta')
              ? 'Senha incorreta. Tente novamente.'
              : ''
          }
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          style={{
            padding: '12px 0',
            fontSize: '1.2rem',
            transition: 'all 0.3s ease',
          }}
          sx={{
            '&:hover': {
              backgroundColor: '#005f73',
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="secondary" /> : 'Entrar'}
        </Button>
      </Grid>
      <Grid item xs={12} style={{ textAlign: 'center', marginTop: '10px' }}>
        <Typography variant="body2" sx={{ fontSize: '1rem' }}>
          <Link
            to="/forgot-password"
            style={{ textDecoration: 'none', color: '#1976d2' }}
          >
            Esqueci minha senha
          </Link>
        </Typography>
      </Grid>
      {message && (
        <Grid item xs={12}>
          <Typography variant="body1" color="error" align="center">
            {message}
          </Typography>
        </Grid>
      )}
    </Grid>
  </form>
);

const LawyerLogin = ({ setAuthenticated }) => {
  const [oab, setOAB] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!oab || !password) {
      setMessage('Preencha todos os campos.');
      setLoading(false);
      return;
    }

    try {
      const { data: lawyer, error } = await supabase
        .from('login_advogados')
        .select('id, advogado_id, senha, nome, oab')
        .eq('oab', oab)
        .single();

      if (error || !lawyer) {
        setMessage('Usuário não encontrado.');
        setLoading(false);
        return;
      }

      const passwordMatch = bcrypt.compareSync(password, lawyer.senha);

      if (passwordMatch) {
        const loggedAdvogado = {
          id: lawyer.advogado_id,
          nome_completo: lawyer.nome,
          oab: lawyer.oab,
        };

        // Salvar no localStorage
        localStorage.setItem('advogadoLogado', JSON.stringify(loggedAdvogado));

        setMessage('Login bem-sucedido!');
        setAuthenticated(true);
        navigate('/dashboard');
      } else {
        setMessage('Senha incorreta.');
      }
    } catch (error) {
      console.error('Erro durante o login:', error);
      setMessage('Erro ao realizar o login.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      setMessage('A nova senha não pode estar vazia.');
      return;
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    const { error } = await supabase
      .from('login_advogados')
      .update({ senha: hashedPassword })
      .eq('oab', oab);

    if (error) {
      setMessage('Erro ao atualizar a senha. Tente novamente.');
    } else {
      setMessage('Senha alterada com sucesso. Faça login novamente.');
      setShowChangePasswordDialog(false);
    }
  };

  return (
    <Background>
      <LoginContainer elevation={6}>
        <LeftSection>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontSize: { xs: '1.5rem', lg: '1.8rem' }, marginBottom: '10px' }}
          >
            Bem-vindo, Advogado!
          </Typography>
          <LogoImage
            src="https://i.ibb.co/XDWT64v/logo-procede.jpg"
            alt="Logo Defesa do Consumidor"
          />
        </LeftSection>
        <FormSection>
          <Typography
            variant="h4"
            color="primary"
            align="center"
            gutterBottom
            sx={{ fontSize: { xs: '1.5rem', lg: '2rem' } }}
          >
            Login de Advogado
          </Typography>
          <LoginForm
            oab={oab}
            setOAB={setOAB}
            password={password}
            setPassword={setPassword}
            handleLogin={handleLogin}
            message={message}
            loading={loading}
          />
        </FormSection>
      </LoginContainer>

      <Dialog open={showChangePasswordDialog} onClose={() => setShowChangePasswordDialog(false)}>
        <DialogTitle>Definir Nova Senha</DialogTitle>
        <DialogContent>
          <TextField
            label="Nova Senha"
            type="password"
            variant="outlined"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              style: { fontSize: '1.2rem' },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowChangePasswordDialog(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleChangePassword} color="primary">
            Salvar Nova Senha
          </Button>
        </DialogActions>
      </Dialog>
    </Background>
  );
};

export default LawyerLogin;

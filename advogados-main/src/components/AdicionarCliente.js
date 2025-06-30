import React, { useEffect, useState } from 'react';
import { TextField, Button, Grid, MenuItem, Box, Typography } from '@mui/material';
import InputMask from 'react-input-mask';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import Sidebar from './Sidebar';

const AdicionarCliente = ({ cliente, setEditingCliente }) => {
  // Estados para os campos do formulário
  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('cpf');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [telefoneExtra, setTelefoneExtra] = useState('');
  const [mostrarTelefoneExtra, setMostrarTelefoneExtra] = useState(false);
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState({
    logradouro: '',
    bairro: '',
    cidade: '',
    estado: ''
  });
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [cnh, setCnh] = useState('');
  const [rg, setRg] = useState('');
  const [advogadoId, setAdvogadoId] = useState(null); // Estado para armazenar o advogado_id

  // Recupera o advogado_id do localStorage ao carregar o componente
  useEffect(() => {
    const advogadoLogado = JSON.parse(localStorage.getItem('advogadoLogado'));
    if (advogadoLogado) {
      setAdvogadoId(advogadoLogado.id); // Define o advogado_id
    }
  }, []);

  // Preenche os campos do formulário se estiver editando um cliente
  useEffect(() => {
    if (cliente) {
      setNome(cliente.nome_completo);
      setDocumento(cliente.documento);
      setTipoDocumento(cliente.tipo_documento);
      setEmail(cliente.email);
      setTelefone(cliente.telefone);
      setTelefoneExtra(cliente.telefone_extra || '');
      setMostrarTelefoneExtra(!!cliente.telefone_extra);
      setCep(cliente.cep);
      setEndereco({
        logradouro: cliente.logradouro || '',
        bairro: cliente.bairro || '',
        cidade: cliente.cidade || '',
        estado: cliente.estado || ''
      });
      setNumero(cliente.numero);
      setComplemento(cliente.complemento || '');
      setCnh(cliente.cnh || '');
      setRg(cliente.rg || '');
    } else {
      setNome('');
      setDocumento('');
      setTipoDocumento('cpf');
      setEmail('');
      setTelefone('');
      setTelefoneExtra('');
      setMostrarTelefoneExtra(false);
      setCep('');
      setEndereco({ logradouro: '', bairro: '', cidade: '', estado: '' });
      setNumero('');
      setComplemento('');
      setCnh('');
      setRg('');
    }
  }, [cliente]);

  // Função para buscar o endereço pelo CEP
  const handleCepChange = async (e) => {
    const cepInput = e.target.value.replace(/\D/g, '');
    setCep(cepInput);

    if (cepInput.length === 8) {
      try {
        const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${cepInput}`);
        
        if (response.data) {
          const data = response.data;
          setEndereco({
            logradouro: data.street || '',
            bairro: data.neighborhood || '',
            cidade: data.city || '',
            estado: data.state || ''
          });
        } else {
          alert('Nenhum endereço encontrado para este CEP.');
          setEndereco({
            logradouro: '',
            bairro: '',
            cidade: '',
            estado: ''
          });
        }
      } catch (error) {
        console.error('Erro ao buscar o CEP:', error);
        alert('Erro ao buscar o CEP. Verifique se o CEP está correto.');
        setEndereco({
          logradouro: '',
          bairro: '',
          cidade: '',
          estado: ''
        });
      }
    }
  };

  // Função para enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Monta o objeto payload com os dados do cliente
    const payload = {
      nome_completo: nome,
      tipo_documento: tipoDocumento,
      documento: documento,
      rg: rg || null,
      cnh: cnh || null,
      telefone: telefone,
      telefone_extra: telefoneExtra || null,
      email: email,
      cep: cep,
      logradouro: endereco.logradouro || null,
      bairro: endereco.bairro || null,
      cidade: endereco.cidade || null,
      estado: endereco.estado || null,
      numero: numero,
      complemento: complemento || null,
      advogado_id: advogadoId, // Inclui o advogado_id no payload
      created_by: 'Usuário Atual',
      updated_by: 'Usuário Atual',
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      tipo_cadastro: 'ADVOGADO',
    };

    try {
      // Verifica se está editando ou adicionando um novo cliente
      let { error } = cliente
        ? await supabase.from('clientes').update(payload).eq('id', cliente.id)
        : await supabase.from('clientes').insert([payload]);

      if (error) {
        // Verifica se o erro é de duplicidade de documento
        if (error.code === '23505') {
          alert(`Erro: O ${tipoDocumento.toUpperCase()} informado já está cadastrado.`);
        } else {
          console.error('Erro ao salvar cliente:', error);
          alert('Erro ao salvar cliente: ' + error.message);
        }
      } else {
        alert(`Cliente ${cliente ? 'atualizado' : 'adicionado'} com sucesso!`);
        // Limpa os campos do formulário após o sucesso
        setNome('');
        setDocumento('');
        setEmail('');
        setTelefone('');
        setTelefoneExtra('');
        setCep('');
        setEndereco({ logradouro: '', bairro: '', cidade: '', estado: '' });
        setNumero('');
        setComplemento('');
        setCnh('');
        setRg('');
        if (cliente) setEditingCliente(null);
      }
    } catch (err) {
      console.error('Erro de conexão com o banco de dados:', err);
      alert('Erro ao conectar com o banco de dados. Tente novamente.');
    }
  };

  return (
    <Box display="flex">
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { xs: 0, md: '280px' },
          maxWidth: { md: 'calc(100% - 280px)' },
        }}
      >
        <Typography variant="h4" gutterBottom>
          {cliente ? '✏️ Editar Cliente' : '➕ Adicionar Cliente'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Campo Nome Completo */}
            <Grid item xs={12}>
              <TextField
                label="🧑 Nome Completo"
                variant="outlined"
                fullWidth
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </Grid>

            {/* Campo Tipo de Documento */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="🆔 Tipo de Documento"
                variant="outlined"
                fullWidth
                required
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
              >
                <MenuItem value="cpf">CPF</MenuItem>
                <MenuItem value="cnpj">CNPJ</MenuItem>
              </TextField>
            </Grid>

            {/* Campo Documento (CPF/CNPJ) */}
            <Grid item xs={12} sm={6}>
              <InputMask
                mask={tipoDocumento === 'cpf' ? '999.999.999-99' : '99.999.999/9999-99'}
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
              >
                {() => (
                  <TextField
                    label={tipoDocumento === 'cpf' ? '🆔 CPF' : '🆔 CNPJ'}
                    variant="outlined"
                    fullWidth
                    required
                  />
                )}
              </InputMask>
            </Grid>

            {/* Campo RG */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="📝 RG"
                variant="outlined"
                fullWidth
                value={rg}
                onChange={(e) => setRg(e.target.value)}
              />
            </Grid>

            {/* Campo CNH */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="🚗 CNH"
                variant="outlined"
                fullWidth
                value={cnh}
                onChange={(e) => setCnh(e.target.value)}
              />
            </Grid>

            {/* Campo Telefone */}
            <Grid item xs={12} sm={6}>
              <InputMask
                mask="(99) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              >
                {() => (
                  <TextField
                    label="📞 Telefone"
                    variant="outlined"
                    fullWidth
                    required
                  />
                )}
              </InputMask>
            </Grid>

            {/* Campo Telefone Extra (opcional) */}
            {mostrarTelefoneExtra && (
              <Grid item xs={12} sm={6}>
                <InputMask
                  mask="(99) 99999-9999"
                  value={telefoneExtra}
                  onChange={(e) => setTelefoneExtra(e.target.value)}
                >
                  {() => (
                    <TextField
                      label="📞 Telefone Extra"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                </InputMask>
              </Grid>
            )}

            {/* Botão para adicionar/remover Telefone Extra */}
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                onClick={() => setMostrarTelefoneExtra(!mostrarTelefoneExtra)}
              >
                {mostrarTelefoneExtra ? "Remover Telefone Extra" : "Adicionar Telefone Extra"}
              </Button>
            </Grid>

            {/* Campo Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="📧 Email"
                variant="outlined"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>

            {/* Campo CEP */}
            <Grid item xs={12} sm={6}>
              <InputMask
                mask="99999-999"
                value={cep}
                onChange={handleCepChange}
              >
                {() => (
                  <TextField
                    label="📬 CEP"
                    variant="outlined"
                    fullWidth
                    required
                  />
                )}
              </InputMask>
            </Grid>

            {/* Campos de Endereço (preenchidos automaticamente pelo CEP) */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="🏠 Logradouro"
                variant="outlined"
                fullWidth
                value={endereco.logradouro}
                disabled
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="🏠 Bairro"
                variant="outlined"
                fullWidth
                value={endereco.bairro}
                disabled
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="🏠 Cidade"
                variant="outlined"
                fullWidth
                value={endereco.cidade}
                disabled
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="🏠 Estado"
                variant="outlined"
                fullWidth
                value={endereco.estado}
                disabled
              />
            </Grid>

            {/* Campo Número */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="🔢 Número"
                variant="outlined"
                fullWidth
                required
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
            </Grid>

            {/* Campo Complemento */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="🏢 Complemento"
                variant="outlined"
                fullWidth
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
              />
            </Grid>

            {/* Botão de Envio */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                type="submit"
              >
                {cliente ? '✏️ Atualizar Cliente' : '➕ Adicionar Cliente'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default AdicionarCliente;
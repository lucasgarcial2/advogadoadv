import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, TextField, Button, MenuItem } from '@mui/material';
import { supabase } from '../supabaseClient';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

const AdicionarProcesso = ({ handleLogout }) => {
  const [activePage, setActivePage] = useState('adicionarProcesso');
  const [advogado, setAdvogado] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]); // Clientes filtrados por associação
  const [numero, setNumero] = useState('');
  const [descricao, setDescricao] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [poloAtivo, setPoloAtivo] = useState('');
  const [poloPassivo, setPoloPassivo] = useState('');
  const [valorCausa, setValorCausa] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const navigate = useNavigate();

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
    const fetchClientes = async () => {
      try {
        // Busca todos os clientes
        const { data: clientesData, error: clientesError } = await supabase
          .from('clientes')
          .select('id, nome_completo, advogado_id');

        if (clientesError) {
          console.error('Erro ao buscar clientes:', clientesError);
          return;
        }

        // Busca as associações na tabela clientes_advogados
        const { data: associadosData, error: associadosError } = await supabase
          .from('clientes_advogados')
          .select('cliente_id')
          .eq('advogado_id', advogado?.id);

        if (associadosError) {
          console.error('Erro ao buscar associações:', associadosError);
          return;
        }

        // Filtra os clientes que estão associados ao advogado logado
        const idsAssociados = associadosData.map((item) => item.cliente_id);
        const clientesAssociados = clientesData.filter(
          (cliente) =>
            idsAssociados.includes(cliente.id) || cliente.advogado_id === advogado?.id
        );

        setClientes(clientesData);
        setClientesFiltrados(clientesAssociados); // Exibe apenas os clientes associados
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      }
    };

    if (advogado) {
      fetchClientes();
    }
  }, [advogado]);

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_').replace(/\s+/g, '_');
      const uniqueName = `${Date.now()}-${sanitizedFileName}`;
      setPdfFile({ file, uniqueName });
    } else {
      alert('Por favor, selecione um arquivo PDF.');
    }
  };

  const handleValorCausaChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    value = (Number(value) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    setValorCausa(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!numero || !clienteSelecionado) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    let pdfUrl = null;

    if (pdfFile) {
      if (pdfFile.file.size > 10 * 1024 * 1024) {
        alert('O arquivo PDF excede o tamanho máximo permitido de 10 MB.');
        return;
      }

      const pdfPath = `processos/${numero}/${pdfFile.uniqueName}`;
      const { error: uploadError } = await supabase.storage.from('processos').upload(pdfPath, pdfFile.file);

      if (uploadError) {
        console.error('Erro ao fazer upload do PDF:', uploadError);
        alert(`Erro ao carregar o PDF: ${uploadError.message}`);
        return;
      }

      pdfUrl = pdfPath;
    }

    const { error } = await supabase.from('processos').insert([
      {
        numero,
        descricao,
        cliente_id: clienteSelecionado,
        advogado_id: advogado?.id,
        polo_ativo: poloAtivo,
        polo_passivo: poloPassivo,
        valor_causa: parseFloat(valorCausa.replace(/[^\d,-]/g, '').replace(',', '.')),
        pdf_path: pdfUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Erro ao adicionar processo:', error);
      alert(`Erro ao adicionar processo: ${error.message}`);
    } else {
      alert('Processo adicionado com sucesso!');
      setNumero('');
      setDescricao('');
      setClienteSelecionado('');
      setPoloAtivo('');
      setPoloPassivo('');
      setValorCausa('');
      setPdfFile(null);
    }
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

    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          ➕ Adicionar Processo
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                label="🧑 Selecionar Cliente"
                variant="outlined"
                fullWidth
                required
                value={clienteSelecionado}
                onChange={(e) => setClienteSelecionado(e.target.value)}
              >
                {clientesFiltrados.map((cliente) => (
                  <MenuItem key={cliente.id} value={cliente.id}>
                    {cliente.nome_completo}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="🔹 Polo Ativo"
                variant="outlined"
                fullWidth
                required
                value={poloAtivo}
                onChange={(e) => setPoloAtivo(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="🔸 Polo Passivo"
                variant="outlined"
                fullWidth
                required
                value={poloPassivo}
                onChange={(e) => setPoloPassivo(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="📄 Número do Processo"
                variant="outlined"
                fullWidth
                required
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="💵 Valor do Honorário"
                variant="outlined"
                fullWidth
                required
                value={valorCausa}
                onChange={handleValorCausaChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="📝 Descrição"
                variant="outlined"
                multiline
                rows={4}
                fullWidth
                required
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" component="label" fullWidth>
                📎 Anexar PDF do Processo
                <input type="file" accept="application/pdf" hidden onChange={handlePdfUpload} />
              </Button>
              {pdfFile && <Typography>{pdfFile.file.name}</Typography>}
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                ➕ Adicionar Processo
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    );
  };

  return (
    <Box display="flex">
      <Sidebar setActivePage={setActivePage} handleLogout={handleLogout} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: { xs: 0, md: '280px' } }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default AdicionarProcesso;
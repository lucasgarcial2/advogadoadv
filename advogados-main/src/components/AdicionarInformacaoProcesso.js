import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, MenuItem, Typography, LinearProgress, Box } from '@mui/material';
import Sidebar from './Sidebar';
import { supabase } from '../supabaseClient';

const AdicionarInformacaoProcesso = () => {
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [processoSelecionado, setProcessoSelecionado] = useState('');
  const [resumo, setResumo] = useState('');
  const [data, setData] = useState('');
  const [documentos, setDocumentos] = useState([{ arquivo: null, tipo: '' }]);
  const [clientes, setClientes] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [advogado, setAdvogado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const storedAdvogado = localStorage.getItem('advogadoLogado');
    if (storedAdvogado) {
      const advogadoData = JSON.parse(storedAdvogado);
      setAdvogado(advogadoData);
    } else {
      console.error('Nenhum advogado encontrado. Redirecionando para login.');
    }
  }, []);

  useEffect(() => {
    const fetchClientesFromProcessos = async () => {
      if (!advogado) return;

      try {
        const { data: processos, error } = await supabase
          .from('processos')
          .select('cliente_id, cliente:clientes(id, nome_completo)')
          .eq('advogado_id', advogado.id);

        if (error) throw error;

        const uniqueClientes = Array.from(
          new Map(
            processos.map((item) => [item.cliente.id, { id: item.cliente.id, nome_completo: item.cliente.nome_completo }])
          ).values()
        );

        setClientes(uniqueClientes);
      } catch (error) {
        console.error('Erro ao buscar clientes dos processos:', error.message);
      }
    };

    fetchClientesFromProcessos();
  }, [advogado]);

  const handleClienteChange = async (e) => {
    const clienteId = parseInt(e.target.value, 10);
    setClienteSelecionado(clienteId);

    try {
      const { data: processosDoCliente, error } = await supabase
        .from('processos')
        .select('id, numero, descricao')
        .eq('cliente_id', clienteId)
        .eq('advogado_id', advogado.id);

      if (error) {
        console.error('Erro ao buscar processos:', error.message);
        return;
      }

      setProcessos(processosDoCliente || []);
    } catch (error) {
      console.error('Erro ao buscar processos:', error.message);
    }
  };

  const handleUpload = (e, index) => {
    const updatedDocs = [...documentos];
    updatedDocs[index].arquivo = e.target.files[0];
    setDocumentos(updatedDocs);
  };

  const handleTipoChange = (e, index) => {
    const updatedDocs = [...documentos];
    updatedDocs[index].tipo = e.target.value;
    setDocumentos(updatedDocs);
  };

  const handleAddAnexo = () => {
    setDocumentos([...documentos, { arquivo: null, tipo: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (!data) {
        alert('Selecione uma data de movimentação.');
        setLoading(false);
        return;
      }

      const processoId = parseInt(processoSelecionado, 10);
      if (!processoId || !clienteSelecionado) {
        alert('Selecione um cliente e um processo válido.');
        setLoading(false);
        return;
      }

      const processoData = processos.find((proc) => proc.id === processoId);
      if (!processoData) {
        alert('Processo não encontrado.');
        setLoading(false);
        return;
      }

      for (const doc of documentos) {
        if (doc.arquivo) {
          const sanitizedFileName = doc.arquivo.name
            .replace(/[^a-zA-Z0-9.]/g, '_')
            .replace(/\s+/g, '_');
          const path = `processos/${processoData.numero}/${sanitizedFileName}`;

          const { error: uploadError } = await supabase.storage
            .from('processos')
            .upload(path, doc.arquivo);

          if (uploadError) {
            setErrorMessage(`Erro ao fazer upload do arquivo: ${uploadError.message}`);
            setLoading(false);
            return;
          }

          doc.arquivo_url = path;
        }
      }

      const validDocuments = documentos.filter((doc) => doc.arquivo_url);
      if (validDocuments.length > 0) {
        const { error: insertError } = await supabase
          .from('informacao_adicional_processo')
          .insert({
            processo_id: processoId,
            cliente_id: clienteSelecionado,
            data_movimentacao: data,
            resumo,
            tipo_documento: validDocuments[0]?.tipo || null,
            arquivo_url: validDocuments[0]?.arquivo_url || null,
          });

        if (insertError) throw insertError;

        alert('Informação adicionada ao processo com sucesso!');
        setResumo('');
        setData('');
        setDocumentos([{ arquivo: null, tipo: '' }]);
      } else {
        setErrorMessage('Nenhum arquivo válido foi adicionado.');
      }
    } catch (error) {
      console.error('Erro:', error.message);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const tiposDeDocumento = [
    { value: 'documento pessoal', label: 'Documento Pessoal' },
    { value: 'evidencia', label: 'Evidência' },
    { value: 'movimentacao', label: 'Movimentação' },
    { value: 'processo', label: 'Processo' },
  ];

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
          Adicionar Informação ao Processo
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                label="Selecionar Cliente"
                variant="outlined"
                fullWidth
                required
                value={clienteSelecionado}
                onChange={handleClienteChange}
              >
                {clientes.map((cliente) => (
                  <MenuItem key={cliente.id} value={cliente.id}>
                    {cliente.nome_completo}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                label="Selecionar Processo"
                variant="outlined"
                fullWidth
                required
                value={processoSelecionado}
                onChange={(e) => setProcessoSelecionado(e.target.value)}
                disabled={!clienteSelecionado}
              >
                {processos.map((processo) => (
                  <MenuItem key={processo.id} value={processo.id}>
                    {processo.numero} - {processo.descricao}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Data da Movimentação"
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Resumo da Movimentação"
                variant="outlined"
                multiline
                rows={4}
                fullWidth
                value={resumo}
                onChange={(e) => setResumo(e.target.value)}
              />
            </Grid>

            {documentos.map((doc, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12} sm={6}>
                  <Button variant="contained" component="label" fullWidth>
                    Anexar Arquivo
                    <input
                      type="file"
                      hidden
                      onChange={(e) => handleUpload(e, index)}
                    />
                  </Button>
                  {doc.arquivo && <p>{doc.arquivo.name}</p>}
                </Grid>

                {doc.arquivo && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Tipo de Documento"
                      variant="outlined"
                      fullWidth
                      required
                      value={doc.tipo}
                      onChange={(e) => handleTipoChange(e, index)}
                    >
                      {tiposDeDocumento.map((tipo) => (
                        <MenuItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                )}
              </React.Fragment>
            ))}

            <Grid item xs={12}>
              <Button variant="outlined" fullWidth onClick={handleAddAnexo}>
                Adicionar Mais Anexo
              </Button>
            </Grid>

            <Grid item xs={12}>
              {loading && <LinearProgress variant="determinate" value={uploadProgress} />}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading || !processoSelecionado}
              >
                {loading ? 'Enviando...' : 'Adicionar Informação'}
              </Button>
            </Grid>

            {errorMessage && (
              <Grid item xs={12}>
                <Typography color="error">{errorMessage}</Typography>
              </Grid>
            )}
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default AdicionarInformacaoProcesso;

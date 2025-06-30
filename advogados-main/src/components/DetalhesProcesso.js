import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, List, ListItem, ListItemText, Divider, Button, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const DetalhesProcesso = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { processo } = location.state || {};

  const [detalhesProcesso, setDetalhesProcesso] = useState([]);
  const [anexos, setAnexos] = useState([]);
  const [carregandoAnexos, setCarregandoAnexos] = useState(true);
  const [ultimaMovimentacao, setUltimaMovimentacao] = useState(null);
  const [clienteInfo, setClienteInfo] = useState(null);
  const [advogadoInfo, setAdvogadoInfo] = useState(null);

  useEffect(() => {
    if (!processo) return;

    const fetchDetalhesProcesso = async () => {
      const { data, error } = await supabase
        .from('informacao_adicional_processo')
        .select('*')
        .eq('processo_id', processo.id);

      if (error) {
        console.error('Erro ao buscar detalhes do processo:', error);
      } else {
        setDetalhesProcesso(data);
      }
    };

    const fetchProcessoComJoin = async () => {
      const { data, error } = await supabase
        .from('processos')
        .select(`
          id,
          numero,
          valor_causa,
          created_at,
          cliente:cliente_id (nome_completo),
          advogado:advogado_id (nome_completo),
          ultima_movimentacao:informacao_adicional_processo (
            data_movimentacao,
            resumo
          )
        `)
        .eq('id', processo.id)
        .single();

      if (error) {
        console.error('Erro ao buscar informações do processo com join:', error);
      } else {
        setClienteInfo(data.cliente);
        setAdvogadoInfo(data.advogado);
        if (data.ultima_movimentacao && data.ultima_movimentacao.length > 0) {
          const sortedMovements = data.ultima_movimentacao.sort(
            (a, b) => new Date(b.data_movimentacao) - new Date(a.data_movimentacao)
          );
          setUltimaMovimentacao({
            data: new Date(sortedMovements[0].data_movimentacao).toLocaleDateString(),
            resumo: sortedMovements[0].resumo,
          });
        }
      }
    };

    fetchDetalhesProcesso();
    fetchProcessoComJoin();
    listAllFilesInDirectory(processo.numero);
  }, [processo]);

  // Função para listar anexos no Supabase Storage
  const listAllFilesInDirectory = async (directory) => {
    setCarregandoAnexos(true); // Indica que os anexos estão sendo carregados
    try {
      const { data, error } = await supabase.storage
        .from('processos')
        .list(`processos/${directory}`, { limit: 100 });

      if (error) {
        console.error('Erro ao listar anexos:', error.message);
        setAnexos([]);
      } else {
        const files = await Promise.all(
          data.map(async (file) => {
            const filePath = `processos/${directory}/${file.name}`;
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from('processos')
              .createSignedUrl(filePath, 300);

            if (signedUrlError) {
              console.error('Erro ao gerar URL assinada:', signedUrlError.message);
              return null;
            }

            return {
              nome: file.name,
              url: signedUrlData.signedUrl,
            };
          })
        );

        setAnexos(files.filter(file => file !== null));
      }
    } catch (error) {
      console.error('Erro ao listar arquivos no diretório:', error);
      setAnexos([]);
    } finally {
      setCarregandoAnexos(false); // Indica que o carregamento terminou
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!processo) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography variant="h6" color="error">
          Não foi possível carregar os detalhes do processo.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleBack}>
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: '20px', maxWidth: '80%', margin: '0 auto' }}>
      <IconButton onClick={handleBack} color="primary">
        <ArrowBackIcon /> Voltar
      </IconButton>
      <Typography variant="h4" gutterBottom>
        Detalhes do Processo {processo.numero || 'N/A'}
      </Typography>

      <Typography variant="h6">Informações Gerais</Typography>
      <Divider />
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1">
          <strong>Cliente:</strong> {clienteInfo?.nome_completo || 'Informação não disponível'}
        </Typography>
        <Typography variant="body1">
          <strong>Advogado:</strong> {advogadoInfo?.nome_completo || 'Informação não disponível'}
        </Typography>
        <Typography variant="body1">
        <strong>Valor da Honorário:</strong> R$ {processo.valor_causa ? processo.valor_causa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
        </Typography>
        <Typography variant="body1">
          <strong>Data de Criação:</strong> {processo.created_at ? new Date(processo.created_at).toLocaleDateString() : 'N/A'}
        </Typography>
        <Typography variant="body1">
          <strong>Última Movimentação:</strong> {ultimaMovimentacao ? `${ultimaMovimentacao.data} - ${ultimaMovimentacao.resumo}` : 'N/A'}
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ mt: 4 }}>Movimentações</Typography>
      <Divider />
      {detalhesProcesso.length > 0 ? (
        detalhesProcesso.map((detalhe, index) => (
          <Box key={index} sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Data da Movimentação:</strong> {detalhe.data_movimentacao ? new Date(detalhe.data_movimentacao).toLocaleDateString() : 'N/A'}
            </Typography>
            <Typography variant="body2">
              <strong>Resumo:</strong> {detalhe.resumo || 'Sem resumo'}
            </Typography>
            <Divider sx={{ my: 1 }} />
          </Box>
        ))
      ) : (
        <Typography variant="body2" sx={{ mt: 2 }}>
          Nenhuma movimentação encontrada.
        </Typography>
      )}

      <Typography variant="h6" sx={{ mt: 4 }}>Anexos</Typography>
      <Divider />
      {carregandoAnexos ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Carregando anexos...</Typography>
        </Box>
      ) : anexos.length > 0 ? (
        <List>
          {anexos.map((anexo, index) => (
            <ListItem key={index} component="a" href={anexo.url} target="_blank" rel="noopener noreferrer">
              <ListItemText primary={anexo.nome} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" sx={{ mt: 2 }}>
          Nenhum anexo disponível.
        </Typography>
      )}
    </Box>
  );
};

export default DetalhesProcesso;

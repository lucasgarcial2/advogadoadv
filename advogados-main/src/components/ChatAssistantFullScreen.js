import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  useMediaQuery,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const ChatAssistantFullScreen = () => {
  const [messages, setMessages] = useState([]); // Histórico de mensagens
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const isMobile = useMediaQuery('(max-width:600px)');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('advogadoLogado'); // Remove dados do usuário
    navigate('/'); // Redireciona para a página de login
  };

  const formatText = (text) => {
    if (typeof text !== 'string') {
      console.warn('O texto fornecido para formatText não é uma string:', text);
      return ''; // Retorna uma string vazia em caso de entrada inválida
    }

    return text
      .replace(/###/g, '\n\n') // Dupla quebra de linha para títulos
      .replace(/1\.|\d\./g, '\n$&') // Quebra antes de itens de lista
      .replace(/\*\*(.*?)\*\*/g, (_, boldText) => `**${boldText}**`) // Mantém negrito
      .replace(/\n/g, '\n\n'); // Garante espaçamento entre parágrafos
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    const url = 'https://gpt-4o.p.rapidapi.com/chat/completions';
    const options = {
      method: 'POST',
      headers: {
        'x-rapidapi-key': '72c4b8bc51msh2ddf4bf045e4a4cp1f93afjsne2b2e3cfffb1',
        'x-rapidapi-host': 'gpt-4o.p.rapidapi.com',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: input.trim() }],
      }),
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: result.choices[0].message.content,
      };

      const newMessages = [...updatedMessages, assistantMessage];
      setMessages(newMessages);
    } catch (error) {
      console.error('Error sending message:', error.message);
    } finally {
      setIsTyping(false);
    }
  };

  const clearMessages = () => {
    setMessages([]); // Limpa o estado das mensagens
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    setAlertOpen(true); // Exibe o alerta informando que anexos não são suportados
  };

  useEffect(() => {
    const container = document.getElementById('chat-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar handleLogout={handleLogout} />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          padding: isMobile ? '10px' : '20px',
          backgroundColor: '#f5f5f5',
          marginLeft: isMobile ? 0 : '280px', // Ajusta para mobile
        }}
      >
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          sx={{ fontWeight: 'bold', marginBottom: '16px', textAlign: isMobile ? 'center' : 'left' }}
        >
          Assistente Jurídico
        </Typography>

        <Box
          id="chat-container"
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            backgroundColor: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          {messages.map((msg, idx) => (
            <Typography
              key={idx}
              sx={{
                backgroundColor: msg.role === 'user' ? '#1976d2' : '#f1f1f1',
                color: msg.role === 'user' ? '#fff' : '#000',
                padding: '8px 12px',
                borderRadius: '12px',
                marginBottom: '10px',
                whiteSpace: 'pre-wrap',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
              }}
            >
              {msg.role === 'assistant' ? formatText(msg.content || '') : msg.content || ''}
            </Typography>
          ))}
          {isTyping && (
            <Box display="flex" alignItems="center">
              <CircularProgress size={15} sx={{ marginRight: '8px' }} />
              <Typography>Assistente está digitando...</Typography>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            marginTop: '16px',
            display: 'flex',
            gap: '10px',
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Digite sua mensagem"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            onClick={sendMessage}
            variant="contained"
            disabled={isTyping}
          >
            Enviar
          </Button>
          <Button
            component="label"
            variant="outlined"
          >
            Anexar Arquivo
            <input type="file" hidden onChange={handleFileUpload} />
          </Button>
          <Button
            onClick={clearMessages}
            variant="outlined"
            color="error"
          >
            Limpar Conversas
          </Button>
        </Box>

        <Snackbar
          open={alertOpen}
          autoHideDuration={3000}
          onClose={() => setAlertOpen(false)}
        >
          <Alert severity="info" onClose={() => setAlertOpen(false)}>
            O modelo atual não suporta anexos de arquivos.
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default ChatAssistantFullScreen;

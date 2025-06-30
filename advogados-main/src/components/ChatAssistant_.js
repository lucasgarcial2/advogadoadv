import React, { useState, useEffect } from 'react';
import {
  Drawer,
  IconButton,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  useMediaQuery,
} from '@mui/material';
import { Chat, Close } from '@mui/icons-material';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]); // Inicia sem histórico
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  // Responsividade
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  const toggleDrawer = () => setIsOpen(!isOpen);

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
    <>
      {!isOpen && (
        <IconButton
          onClick={toggleDrawer}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1301,
            backgroundColor: '#1976d2',
            color: 'white',
            '&:hover': { backgroundColor: '#1565c0' },
          }}
        >
          <Chat />
        </IconButton>
      )}

      <Drawer
        anchor={isSmallScreen ? 'bottom' : 'right'}
        open={isOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            width: isSmallScreen ? '100%' : '400px',
            height: isSmallScreen ? '70%' : '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '10px',
          },
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Assistente Jurídico
          </Typography>
          <IconButton onClick={toggleDrawer}>
            <Close />
          </IconButton>
        </Box>

        <Box
          id="chat-container"
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: '10px',
            maxHeight: isSmallScreen ? '60vh' : '70vh',
          }}
        >
          {messages.map((msg, idx) => (
            <Typography
              key={idx}
              sx={{
                backgroundColor: msg.role === 'user' ? '#1976d2' : '#f1f1f1',
                color: msg.role === 'user' ? '#fff' : '#000',
                padding: '6px 12px',
                borderRadius: '12px',
                marginBottom: '10px',
                whiteSpace: 'pre-wrap',
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
            display: 'flex',
            gap: '10px',
            flexDirection: 'column',
            marginBottom: isSmallScreen ? '16px' : '24px', // Ajusta o botão "Limpar Conversas" para subir
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
            sx={{
              marginTop: '-8px', // Sobe um pouco o botão para evitar cortes
            }}
          >
            Limpar Conversas
          </Button>
        </Box>
      </Drawer>

      {/* Snackbar para exibir mensagem de alerta */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert severity="info" onClose={() => setAlertOpen(false)}>
          O modelo atual não suporta anexos de arquivos.
        </Alert>
      </Snackbar>
    </>
  );
};

export default ChatAssistant;

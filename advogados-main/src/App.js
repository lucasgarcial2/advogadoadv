import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LawyerLogin from './components/LawyerLogin';
import Dashboard from './components/Dashboard';
import VerProcessosCliente from './components/VerProcessosCliente';
import VerProcessosPorCliente from './components/VerProcessosPorCliente';
import DetalhesProcesso from './components/DetalhesProcesso';
import AdicionarProcesso from './components/AdicionarProcesso';
import EditarAdvogado from './components/EditarCadastro';
import AdicionarInformacaoProcesso from './components/AdicionarInformacaoProcesso';
import ChatAssistantFullScreen from './components/ChatAssistantFullScreen';
import AdicionarCliente from './components/AdicionarCliente'; // Importe o componente AdicionarCliente

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  // Função para tratar o logout
  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem('advogadoLogado'); // Limpa os dados do advogado do localStorage
  };

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ flex: 1 }}>
          <Routes>
            {/* Rota para login */}
            <Route
              path="/"
              element={<LawyerLogin setAuthenticated={setAuthenticated} />}
            />

            {/* Rota para o dashboard */}
            <Route
              path="/dashboard"
              element={
                authenticated ? (
                  <Dashboard handleLogout={handleLogout} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/* Rota para visualização de processos */}
            <Route
              path="/processos"
              element={
                authenticated ? (
                  <VerProcessosCliente handleLogout={handleLogout} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/* Rota para visualização de processos por cliente */}
            <Route
              path="/cliente/:clienteId/processos"
              element={
                authenticated ? (
                  <VerProcessosPorCliente />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/* Rota para detalhes de um processo */}
            <Route
              path="/processo/:id"
              element={
                authenticated ? (
                  <DetalhesProcesso />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/* Rota para adicionar processo */}
            <Route
              path="/adicionar-processo"
              element={
                authenticated ? (
                  <AdicionarProcesso handleLogout={handleLogout} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/* Rota para adicionar informações ao processo */}
            <Route
              path="/adicionar-informacao"
              element={
                authenticated ? (
                  <AdicionarInformacaoProcesso handleLogout={handleLogout} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/* Rota para editar cadastro do advogado */}
            <Route
              path="/editar-cadastro"
              element={
                authenticated ? (
                  <EditarAdvogado handleLogout={handleLogout} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/* Rota para o assistente jurídico em tela cheia */}
            <Route
              path="/chat-assistant"
              element={
                authenticated ? (
                  <ChatAssistantFullScreen />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/* Nova rota para adicionar cliente */}
            <Route
              path="/adicionar-cliente"
              element={
                authenticated ? (
                  <AdicionarCliente handleLogout={handleLogout} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
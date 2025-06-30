import React, { useState } from 'react';
import { List, ListItemButton, ListItemIcon, ListItemText, Collapse, Drawer, IconButton, useMediaQuery } from '@mui/material';
import { AccountCircle, Folder, Person, Menu, ExpandLess, ExpandMore, Logout, AddBox, Description, Chat } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ handleLogout }) => {
  const [openClientes, setOpenClientes] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const navigate = useNavigate();

  const handleClientesClick = () => setOpenClientes(!openClientes);
  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const closeDrawer = () => {
    if (isSmallScreen) setDrawerOpen(false);
  };

  const sidebarContent = (
    <div style={{ width: '280px', backgroundColor: '#2d3e50', height: '100%', color: 'white', padding: '20px' }}>
      <h3 style={{ color: 'white', textAlign: 'center' }}>PROCEDE</h3>
      <List>
        <ListItemButton onClick={handleClientesClick}>
          <ListItemIcon><AccountCircle style={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Clientes" />
          {openClientes ? <ExpandLess style={{ color: 'white' }} /> : <ExpandMore style={{ color: 'white' }} />}
        </ListItemButton>
        <Collapse in={openClientes} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton onClick={() => { navigate('/processos'); closeDrawer(); }} sx={{ pl: 4 }}>
              <ListItemIcon><Folder style={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Ver Processos do Cliente" />
            </ListItemButton>
            {/* Nova opção para adicionar cliente */}
            <ListItemButton onClick={() => { navigate('/adicionar-cliente'); closeDrawer(); }} sx={{ pl: 4 }}>
              <ListItemIcon><AddBox style={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Adicionar Cliente" />
            </ListItemButton>
          </List>
        </Collapse>

        <ListItemButton onClick={() => { navigate('/adicionar-processo'); closeDrawer(); }}>
          <ListItemIcon><AddBox style={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Adicionar Processo" />
        </ListItemButton>

        <ListItemButton onClick={() => { navigate('/adicionar-informacao'); closeDrawer(); }}>
          <ListItemIcon><Description style={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Informações Extras Processo" />
        </ListItemButton>

        <ListItemButton onClick={() => { navigate('/editar-cadastro'); closeDrawer(); }}>
          <ListItemIcon><Person style={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Editar Cadastro" />
        </ListItemButton>

        <ListItemButton onClick={() => { navigate('/chat-assistant'); closeDrawer(); }}>
          <ListItemIcon><Chat style={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Assistente Jurídico" />
        </ListItemButton>

        <ListItemButton onClick={() => { handleLogout(); closeDrawer(); }}>
          <ListItemIcon><Logout style={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Sair" />
        </ListItemButton>
      </List>
    </div>
  );

  return (
    <>
      {isSmallScreen ? (
        <>
          <IconButton
            onClick={handleDrawerToggle}
            style={{ position: 'fixed', top: 10, left: 10, zIndex: 1300, color: '#000' }}
          >
            <Menu />
          </IconButton>
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ display: isSmallScreen ? 'block' : 'none' }}
          >
            {sidebarContent}
          </Drawer>
        </>
      ) : (
        <div
          style={{
            width: '280px',
            backgroundColor: '#2d3e50',
            height: '100vh',
            position: 'fixed',
            overflowY: 'auto',
            display: isSmallScreen ? 'none' : 'block',
          }}
        >
          {sidebarContent}
        </div>
      )}
    </>
  );
};

export default Sidebar;
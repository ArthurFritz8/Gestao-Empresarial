import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  CssBaseline,
  Divider,
  Box,
  Container,
  Menu,
  MenuItem,
  Hidden
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalMall as LocalMallIcon,
  Assessment as AssessmentIcon,
  AccountCircle as AccountCircleIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const useStyles = styled((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  title: {
    flexGrow: 1,
  },
  logo: {
    height: '40px',
    marginRight: theme.spacing(2),
  },
  toolbar: theme.mixins.toolbar,
  active: {
    backgroundColor: theme.palette.action.selected,
  },
  listItemIcon: {
    minWidth: '40px',
  },
}));

function MainLayout() {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
    },
    {
      text: 'Produtos',
      icon: <LocalMallIcon />,
      path: '/products',
    },
    {
      text: 'Vendas (PDV)',
      icon: <ShoppingCartIcon />,
      path: '/pos',
    },
    {
      text: 'Relatórios',
      icon: <AssessmentIcon />,
      path: '/reports',
    },
  ];

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
            size="large"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap className={classes.title}>
            SGEP - Sistema de Gestão de Vendas e Estoque
          </Typography>
          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleUserMenuOpen}
            color="inherit"
            size="large"
          >
            <AccountCircleIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
          >
            <MenuItem disabled>
              {currentUser?.name || 'Usuário'}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">Sair</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Hidden xsDown>
        <Drawer
          className={classes.drawer}
          variant="persistent"
          open={open}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <div className={classes.drawerHeader}>
            <IconButton onClick={handleDrawerToggle} size="large">
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                className={location.pathname === item.path ? classes.active : ''}
              >
                <ListItemIcon className={classes.listItemIcon}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Drawer>
      </Hidden>
      
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Container maxWidth="lg">
          <Box my={4}>
            <Outlet />
          </Box>
        </Container>
      </main>
    </div>
  );
}

export default MainLayout;
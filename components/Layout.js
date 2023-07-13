import React, { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';

import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Link,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Switch,
  Grid,
  Badge,
  Button,
  Menu,
  MenuItem,
} from '@material-ui/core';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import useStyles from '../utils/styles';
import { Store } from '../utils/Store';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

export default function Layout({ title, description, children }) {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { darkMode } = state;
  const [layoutCart, setCart] = useState(null);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const { cart } = state;
    setCart(cart);
    const { userInfo } = state;
    setUser(userInfo);
  }, [state]);

  const theme = createTheme({
    typography: {
      h1: {
        fontSize: '1.6rem',
        fontWeight: 400,
        margin: '1rem 0',
      },
      h2: {
        fontSize: '1.4rem',
        fontWeight: 400,
        margin: '1rem 0',
      },
      body1: {
        fontWeight: 'normal',
      },
    },
    palette: {
      type: darkMode ? 'dark' : 'light',
      primary: {
        main: '#f0c000',
      },
      secondary: {
        main: '#208080',
      },
    },
  });
  const classes = useStyles();
  const darkModeChangeHandler = () => {
    dispatch({ type: darkMode ? 'DARK_MODE_OFF' : 'DARK_MODE_ON' });
    const newDarkMode = !darkMode;
    Cookies.set('darkMode', newDarkMode ? 'ON' : 'OFF');
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const loginClickHandler = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const loginMenuCloseHandler = (e, redirect) => {
    setAnchorEl(null);
    if (redirect) {
      router.push(redirect);
    }
  };
  const logoutClickHandler = () => {
    setAnchorEl(null);
    dispatch({ type: 'USER_LOGOUT' });
    Cookies.remove('userInfo');
    Cookies.remove('cartItems');
    Cookies.remove('paymentMethod');
    Cookies.remove('shippingAddress');
    router.push('/');
  };

  return (
    <div>
      <Head>
        <title>
          {title ? `${title} - Next Amazon App` : 'Next Amazon App'}
        </title>
        {description && <meta name="description" content={description}></meta>}
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="static" className={classes.navbar}>
          <Toolbar>
            <NextLink href="/" passHref>
              <Link>
                <Typography className={classes.brand}>Amazon App</Typography>
              </Link>
            </NextLink>
            <div className={classes.grow}></div>
            <div>
              <Grid
                container
                spacing={1}
                alignItems="center"
                justifyContent="center"
              >
                <Grid item>
                  <LightModeOutlinedIcon sx={{ color: 'white' }} />
                </Grid>
                <Grid item>
                  <Switch
                    checked={darkMode}
                    onChange={darkModeChangeHandler}
                    defaultChecked={darkMode}
                  ></Switch>
                </Grid>
                <Grid item style={{ marginRight: 30 }}>
                  <DarkModeOutlinedIcon sx={{ color: 'white' }} />
                </Grid>
                <Grid item style={{ marginRight: 15 }}>
                  <NextLink href="/cart" passHref>
                    <Link>
                      {layoutCart !== null &&
                      layoutCart.cartItems.length > 0 ? (
                        <Badge
                          color="secondary"
                          badgeContent={layoutCart.cartItems.length}
                          overlap="rectangular"
                        >
                          Cart
                        </Badge>
                      ) : (
                        'Cart'
                      )}
                    </Link>
                  </NextLink>
                </Grid>

                <Grid item>
                  {user !== null ? (
                    <>
                      <Button
                        className={classes.navbarButton}
                        id="basic-button"
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={loginClickHandler}
                      >
                        {user.name}
                      </Button>
                      <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={loginMenuCloseHandler}
                        MenuListProps={{
                          'aria-labelledby': 'basic-button',
                        }}
                      >
                        <MenuItem
                          onClick={(e) => loginMenuCloseHandler(e, '/profile')}
                        >
                          Profile
                        </MenuItem>
                        <MenuItem
                          onClick={(e) =>
                            loginMenuCloseHandler(e, '/order-history')
                          }
                        >
                          Order History
                        </MenuItem>
                        <MenuItem onClick={logoutClickHandler}>Logout</MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <NextLink href="/login" passHref>
                      <Link>Login</Link>
                    </NextLink>
                  )}
                </Grid>
              </Grid>
            </div>
          </Toolbar>
        </AppBar>
        <Container className={classes.main}>{children}</Container>
        <footer className={classes.footer}>
          <Typography>All rights reserved. Next Amazon App.</Typography>
        </footer>
      </ThemeProvider>
    </div>
  );
}

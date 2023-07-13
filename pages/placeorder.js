import {
  Grid,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Typography,
  Link,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import NextLink from 'next/link';
import Image from 'next/image';
import { Card, List, ListItem } from '@mui/material';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { useRouter } from 'next/router';
import useStyles from '../utils/styles';
import CheckoutWizard from '../components/CheckoutWizard';
import { useSnackbar } from 'notistack';
import { getError } from '../utils/error';
import Cookies from 'js-cookie';

function PlaceOrder() {
  const classes = useStyles();
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const [cartScreenItems, setCartScreenItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const { userInfo, cart } = state;

  useEffect(() => {
    if (!cart.paymentMethod || cart.paymentMethod === '') {
      router.push('/payment');
    }
    if (cart.cartItems.length === 0) {
      router.push('/cart');
    }
    setCartScreenItems(cart.cartItems);
    setShippingAddress(cart.shippingAddress);
    setPaymentMethod(cart.paymentMethod);
  }, []);

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;

  const itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.price * c.quantity, 0)
  );
  const shippingPrice = itemsPrice > 200 ? 0 : 15;
  const taxPrice = round2(itemsPrice * 0.15);
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

  const { closeSnackbar, enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const placeOrderHandler = async () => {
    closeSnackbar();
    try {
      setLoading(true);
      const { data } = await axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          shippingAddress,
          paymentMethod,
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      dispatch({ type: 'CART_CLEAR' });
      Cookies.remove('cartItems');
      setLoading(false);
      router.push(`/order/${data._id}`);
    } catch (err) {
      setLoading(false);
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  };

  return (
    <Layout title="Place Order">
      <div style={{ marginTop: '4%' }}></div>
      <CheckoutWizard activeStep={3}></CheckoutWizard>
      <Typography component="h1" variant="h1" style={{ marginTop: '6%' }}>
        Place Order
      </Typography>
      <Grid container spacing={1}>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h2" variant="h2">
                  Shipping Address
                </Typography>
              </ListItem>
              {shippingAddress !== '' && (
                <ListItem>
                  {shippingAddress.fullName}, {shippingAddress.address},{' '}
                  {shippingAddress.city}, {shippingAddress.country},{' '}
                  {shippingAddress.postalCode}
                </ListItem>
              )}
            </List>
          </Card>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h2" variant="h2">
                  Payment Method
                </Typography>
              </ListItem>
              {paymentMethod !== '' && <ListItem>{paymentMethod}</ListItem>}
            </List>
          </Card>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h2" variant="h2">
                  Order Items
                </Typography>
              </ListItem>
              <ListItem>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Image</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cartScreenItems.length &&
                        cartScreenItems.map((item) => {
                          return (
                            <TableRow key={item._id}>
                              <TableCell>
                                <NextLink href={`/product/${item.slug}`}>
                                  <Link>
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      width={50}
                                      height={50}
                                    ></Image>
                                  </Link>
                                </NextLink>
                              </TableCell>

                              <TableCell>
                                <NextLink href={`/product/${item.slug}`}>
                                  <Link>
                                    <Typography>{item.name}</Typography>
                                  </Link>
                                </NextLink>
                              </TableCell>

                              <TableCell align="right">
                                <Typography>{item.quantity}</Typography>
                              </TableCell>

                              <TableCell align="right">
                                <Typography>${item.price}</Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </ListItem>
            </List>
          </Card>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography variant="h1" component="h1">
                  Order Summary
                </Typography>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={7}>
                    <Typography>Items:</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography align="right">${itemsPrice}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={7}>
                    <Typography>Tax:</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography align="right">${taxPrice}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={7}>
                    <Typography>Shipping:</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography align="right">${shippingPrice}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={7}>
                    <Typography>
                      <strong>Total:</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography align="right">
                      <strong>${totalPrice}</strong>
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>

              <ListItem>
                <Button
                  onClick={placeOrderHandler}
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Place Order
                </Button>
              </ListItem>
              {loading && (
                <ListItem>
                  <CircularProgress />
                </ListItem>
              )}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}

// to make sure this renders in the frontend
export default dynamic(() => Promise.resolve(PlaceOrder), { ssr: false });

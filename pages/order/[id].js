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
import React, { useContext, useEffect, useReducer, useState } from 'react';
import Layout from '../../components/Layout';
import { Store } from '../../utils/Store';
import NextLink from 'next/link';
import Image from 'next/image';
import { Card, List, ListItem } from '@mui/material';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { useRouter } from 'next/router';
import useStyles from '../../utils/styles';
import { useSnackbar } from 'notistack';
import { getError } from '../../utils/error';
import Cookies from 'js-cookie';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

function Order({ params }) {
  const orderId = params.id;
  const classes = useStyles();
  const router = useRouter();
  const { state } = useContext(Store);
  //   const [cartScreenItems, setCartScreenItems] = useState([]);
  //   const [shippingAddress, setShippingAddress] = useState('');
  //   const [paymentMethod, setPaymentMethod] = useState('');
  const { userInfo } = state;

  const [{ loading, error, order }, dispatch] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
  });
  const {
    shippingAddress,
    paymentMethod,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
  } = order;

  useEffect(() => {
    if (!userInfo) {
      return router.push('/login');
    }

    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (!order._id || (order._id && order._id !== orderId)) {
      fetchOrder();
    }
  }, []);

  const { closeSnackbar, enqueueSnackbar } = useSnackbar();

  return (
    <Layout title={`Order No. ${orderId}`}>
      <Typography component="h1" variant="h1" style={{ marginTop: '4%' }}>
        Order No. <strong>{orderId}</strong>
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography className={classes.error}>{error}</Typography>
      ) : (
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
                <ListItem>
                  <Typography>
                    <strong>Status: </strong>
                  </Typography>
                  &nbsp;
                  {isDelivered ? (
                    <Typography
                      style={{ color: '#35b330' }}
                    >{`Delivered at ${deliveredAt}`}</Typography>
                  ) : (
                    <Typography style={{ color: '#d93f3f' }}>
                      {'Not delivered'}
                    </Typography>
                  )}
                </ListItem>
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
                <ListItem>
                  <Typography>
                    <strong>Status:</strong>
                  </Typography>{' '}
                  &nbsp;
                  {isPaid ? (
                    <Typography
                      style={{ color: '#35b330' }}
                    >{`Paid at ${paidAt}`}</Typography>
                  ) : (
                    <Typography style={{ color: '#d93f3f' }}>
                      {'Not paid'}
                    </Typography>
                  )}
                </ListItem>
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
                        {orderItems.length &&
                          orderItems.map((item) => {
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
              </List>
            </Card>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  return { props: { params } };
}

export default dynamic(() => Promise.resolve(Order), { ssr: false });

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

function CartScreen() {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const [cartScreenItems, setCartScreenItems] = useState([]);
  useEffect(() => {
    const { cart } = state;
    setCartScreenItems(cart.cartItems);
  }, [state]);

  const updateCartHandler = async (item, quantity) => {
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    dispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };

  const removeItemHandler = (item) => {
    dispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };

  const checkoutHandler = () => {
    router.push('/shipping');
  };

  return (
    <Layout title="Shopping Cart">
      <Typography component="h1" variant="h1">
        Shopping Cart
      </Typography>
      {cartScreenItems.length === 0 ? (
        <div>
          Cart is empty.{' '}
          <NextLink href="/" passHref>
            <Link>Shop now!</Link>
          </NextLink>
        </div>
      ) : (
        <Grid container spacing={1}>
          <Grid item md={9} xs={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Image</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Action</TableCell>
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
                            <Select
                              value={item.quantity}
                              onChange={(e) =>
                                updateCartHandler(item, e.target.value)
                              }
                            >
                              {[
                                ...Array(parseInt(item.countInStock)).keys(),
                              ].map((x) => (
                                <MenuItem key={x + 1} value={x + 1}>
                                  {x + 1}
                                </MenuItem>
                              ))}
                            </Select>
                          </TableCell>

                          <TableCell align="right">${item.price}</TableCell>

                          <TableCell align="right">
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={() => removeItemHandler(item)}
                            >
                              x
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item md={3} xs={12}>
            <Card>
              <List>
                <ListItem>
                  <Typography variant="h1" component="h1">
                    Subtotal
                  </Typography>
                </ListItem>

                <ListItem>
                  <Grid container>
                    <Grid item xs={7}>
                      <Typography>Amount</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography>
                        $
                        {cartScreenItems.length &&
                          cartScreenItems.reduce(
                            (a, c) => a + c.quantity * c.price,
                            0
                          )}
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>

                <ListItem>
                  <Grid container>
                    <Grid item xs={7}>
                      <Typography>Total items</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography>
                        {cartScreenItems.length &&
                          cartScreenItems.reduce((a, c) => a + c.quantity, 0)}
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>

                <ListItem>
                  <Button
                    onClick={checkoutHandler}
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Check Out
                  </Button>
                </ListItem>
              </List>
            </Card>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
}

export default dynamic(() => Promise.resolve(CartScreen), { ssr: false });

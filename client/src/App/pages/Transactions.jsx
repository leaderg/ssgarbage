import React, { Component } from 'react';
import axios from 'axios';
import moment from 'moment';
import MomentUtils from "@date-io/moment";

import NavbarMain from '../Components/NavbarMain'

import {
  TextField,
  Box,
  Grid,
  Card,
  CardActions,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  IconButton
} from "@material-ui/core";
import {Search} from '@material-ui/icons';

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from "@material-ui/pickers";


class Transactions extends Component {
  constructor(props){
    super(props);
    this.state = {
      orders: [],
      rowsPerPage: 50,
      page: 0
    }
  }

  setRowsPerPage = (event) =>{
    this.setState({rowsPerPage: event.target.value})
  }

  setPage = (event, value) =>{
    this.setState({page: value})
  }

  componentDidMount() {
    this.getOrders();
  }

  getOrders = () => {
    axios
    .get('/api/orders')
    .then( res => {
      let orders = res.data
      this.setState({ orders })
    })
  }

  toDollars = (input) => {
    input = Number(input);
    input  /= 100
    return(input.toFixed(2))
  }

                // value={startDate}
                // onChange={handleDateChange}

                // onClick={handleClickShowPassword}
                //   onMouseDown={handleMouseDownPassword}

  render() {
    let { admin, dashboard, user } = this.props;
    return (
      <MuiPickersUtilsProvider utils={MomentUtils}>
      <div className="App">
      <NavbarMain admin={admin} dashboard={dashboard}/>
        <h2>Transactions</h2>
        <Box m={2}>
        <Grid container spacing={2} >
          <Grid item xs={8}>
            <TextField
              fullWidth
              id="outlined-basic"
              label="Search"
              variant="outlined"
              InputProps={{
                endAdornment: <InputAdornment position="end">
                <IconButton>
                  <Search />
                </IconButton>
              </InputAdornment>,
              }}
              />
          </Grid>
          <Grid item xs={2} justify="space-around">
            <KeyboardDatePicker
              id="date-picker-dialog"
             label={<span style={{opacity: 0.6}}>Start Date</span>}
             format="MM/DD/yyyy"
              KeyboardButtonProps={{
                "aria-label": "change date"
              }}
            />
          </Grid>
          <Grid item xs={2} justify="space-around">
            <KeyboardDatePicker
              id="date-picker-dialog"
             label={<span style={{opacity: 0.6}}>End Date</span>}
             format="MM/DD/yyyy"
              KeyboardButtonProps={{
                "aria-label": "change date"
              }}
            />
          </Grid>
        </Grid>
        </Box>
        <Box m={2}>
        <Card mt={2}>
          <CardContent>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    Transaction ID
                  </TableCell>
                  <TableCell>
                    Scale Reference
                  </TableCell>
                  <TableCell>
                    Date
                  </TableCell>
                  <TableCell>
                    Customer
                  </TableCell>
                  <TableCell>
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              {this.state.orders.map((order, index) => {
                return (
                  <TableRow hover key={index}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>---Not Implimented---</TableCell>
                    <TableCell>{moment(order.last_visited).format('MM/DD/YYYY - hh:mm a')}</TableCell>
                    <TableCell>{order.customer_id}</TableCell>
                    <TableCell>${this.toDollars(order.total)}</TableCell>
                  </TableRow>
                  )
                })
              }
              <TableBody>
              </TableBody>
            </Table>
          </CardContent>
          <CardActions>
            <TablePagination
              component="div"
              count={this.state.orders.length}
              onChangePage={this.handlePageChange}
              onChangeRowsPerPage={this.handleRowsPerPageChange}
              page={this.state.page}
              rowsPerPage={this.state.rowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
            />
          </CardActions>
        </Card>
        </Box>
      </div>
          </MuiPickersUtilsProvider>
    );
  }
}

export default Transactions;


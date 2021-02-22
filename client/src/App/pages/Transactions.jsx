import React, { Component } from 'react';
import axios from 'axios';
import moment from 'moment';
import MomentUtils from "@date-io/moment";

import NavbarMain from '../Components/NavbarMain'
import TransactionModal from '../Components/TransactionModal'

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
      searchterm: "",
      pagination: {
        currentPage: 1,
        lastPage: 0,
        perPage: 25,
        total: 0
      },
      startDate: moment().startOf('day').format('YYYY-MM-DDTHH:mm:ssZ'),
      endDate: moment().endOf('day').format('YYYY-MM-DDTHH:mm:ssZ'),
    }
  }

  //Pagination Functions

  handlePageChange = (event, page) => {
    let pagination = this.state.pagination
    pagination.currentPage = page + 1;
    this.setState({ pagination }, function() {
      this.getOrders();
    })
  }

  handleRowsPerPageChange = event => {
    let pagination = this.state.pagination
    pagination.perPage = event.target.value
    pagination.currentPage = 1
    this.setState({ pagination }, function() {
      this.getOrders();
    })
  }

  //Date Picker Functions

  startDateChange = event => {
    let startDate = event.startOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
    if(moment(startDate).isBefore(this.state.endDate)) {
      this.setState({ startDate }, function(){
        this.getOrders();
      });
    } else {
      let endDate = event.endOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
      this.setState({ startDate, endDate }, function(){
        this.getOrders();
      });
    }
  }

  endDateChange = event => {
    let endDate = event.endOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
    if(moment(endDate).isAfter(this.state.startDate)) {
      this.setState({ endDate }, function(){
        this.getOrders();
      });
    } else {
      let startDate = event.startOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
      this.setState({ startDate, endDate }, function(){
        this.getOrders();
      });
    }
  }

  //Searchbar Function

  searchbarInput = event => {
    let searchterm = event.target.value;
    this.setState({ searchterm })
  }

  searchEnter = event => {
    if(event.key === 'Enter'){
      this.searchOrders();
    }
  }

  searchTrigger = () => {
    this.searchOrders();
  }

  //API Calls

  getOrders = () => {
    let dates = {
      startDate: this.state.startDate,
      endDate: this.state.endDate,
    }
    let pagination = this.state.pagination
    axios
    .post('/api/orders', { dates, pagination })
    .then( res => {
      let orders = res.data.data
      let pagination = res.data.pagination
      this.setState({ orders, pagination })
    })
  }

  searchOrders = () => {
    let searchterm = this.state.searchterm
    let pagination = this.state.pagination
    axios
    .post('/api/ordersearch', { searchterm, pagination })
    .then( res => {
      let orders = res.data.data
      let pagination = res.data.pagination
      this.setState({ orders, pagination })
    })
  }

  //Helper Function

  toDollars = (input) => {
    input = Number(input);
    input  /= 100
    return(input.toFixed(2))
  }

  componentDidMount() {
    this.getOrders();
  }

  render() {
    let { admin, dashboard, user } = this.props;
    return (
      <MuiPickersUtilsProvider utils={MomentUtils}>
      <div className="App">
      <NavbarMain admin={admin} dashboard={dashboard}/>
        <h2>Transactions</h2>
        <TransactionModal/>
        <Box m={2}>
        <Grid container spacing={2} >
          <Grid item xs={8}>
            <TextField
              onChange={(e) => this.searchbarInput(e)}
              onKeyPress={(e) => this.searchEnter(e)}
              fullWidth
              id="outlined-basic"
              label="Search"
              variant="outlined"
              InputProps={{
                endAdornment: <InputAdornment position="end">
                <IconButton>
                  <Search onClick={this.searchTrigger}/>
                </IconButton>
              </InputAdornment>,
              }}
              />
          </Grid>
          <Grid item xs={2} justify="space-around">
            <KeyboardDatePicker
              id="date-picker-dialog"
              label={<span style={{opacity: 0.6}}>Start Date</span>}
              value={this.state.startDate}
              onChange={this.startDateChange}
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
              value={this.state.endDate}
              onChange={this.endDateChange}
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
                    <TableCell>{order.scale_reference}</TableCell>
                    <TableCell>{moment(order.last_visited).format('MM/DD/YYYY - hh:mm a')}</TableCell>
                    <TableCell>{order.name}</TableCell>
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
              count={this.state.pagination.total}
              onChangePage={this.handlePageChange}
              onChangeRowsPerPage={this.handleRowsPerPageChange}
              page={this.state.pagination.currentPage-1}
              rowsPerPage={this.state.pagination.perPage}
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


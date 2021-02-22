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
  CardHeader,
  CardActions,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  IconButton,
  Divider,
  ListItem,
  MenuItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  FormControl,
  InputLabel,
  Select,
  DialogActions
} from "@material-ui/core";

import {
  Add,
  Search,
  ExpandMore,
  TableChart,
  Edit,
  List,
  Replay,
  Close,
  Ballot,
} from '@material-ui/icons';

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
      selectedOrder: {
        customer: [],
        employee: [],
        lineItems: [],
        order: [],
        payments: []
      },
      editSelectedOrder: {
        customer: [],
        employee: [],
        lineItems: [],
        order: [],
        payments: []
      },
      modalOpen: false,
      modalEdit: false,
      editCustomer: false,
      editScaleRef: false,
      editLineItem: false,
      addLineItem: false,
      editPayment: false,
      addPayment: false,

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

  selectOrder = (order) => {
    axios
    .get(`/api/orders/${order.id}`)
    .then( res => {
      this.setState({ selectedOrder: res.data, editSelectedOrder: res.data, transactionModalToggle: true}, this.handleOpen())
    })
  }

  //Helper Function

  toDollars = (input) => {
    input = Number(input);
    input  /= 100
    return(input.toFixed(2))
  }


  //Modal Controls
  handleOpen = () => {
    this.setState({modalOpen: true})
  };

  handleClose = () => {
    this.setState({modalOpen: false, modalEdit: false})
  };

  toggleEdit = () => {
    this.state.modalEdit ? (
    this.setState({modalEdit: false})
      ) : (
    this.setState({modalEdit: true}))
  }

  handleEditOpen = () => {
    this.setState({modalEdit: true})
  }

  handleEditCose = () => {
    this.setState({modalEdit: false})
  }

  //Edit Modal Toggles
  editCustomerToggle = () => {
    this.state.editCustomer ? (
    this.setState({editCustomer: false})
      ) : (
    this.setState({editCustomer: true}))
  }

  editScaleRefToggle = () => {
    this.state.editScaleRef ? (
    this.setState({editScaleRef: false})
      ) : (
    this.setState({editScaleRef: true}))
  }

  editLineItemToggle = () => {
    this.state.editLineItem ? (
    this.setState({editLineItem: false})
      ) : (
    this.setState({editLineItem: true}))
  }

  addLineItemToggle = () => {
    this.state.addLineItem ? (
    this.setState({addLineItem: false})
      ) : (
    this.setState({addLineItem: true}))
  }

  editPaymentToggle = () => {
    this.state.editPayment ? (
    this.setState({editPayment: false})
      ) : (
    this.setState({editPayment: true}))
  }

  addPaymentToggle = () => {
    this.state.addPayment ? (
    this.setState({addPayment: false})
      ) : (
    this.setState({addPayment: true}))
  }

  componentDidMount() {
    this.getOrders();
  }

  render() {
    let { admin, dashboard, user } = this.props;
    const sOrder = this.state.selectedOrder.order[0];
    const sLineItems = this.state.selectedOrder.lineItems;
    const sCustomer = this.state.selectedOrder.customer[0];
    const sPayments = this.state.selectedOrder.payments
    const editSelectedOrder = this.state.editSelectedOrder

    const classes = {
      button: {
        margin: 2,
      },
      dialog: {
        padding: 0,
        margin: 0
      },
      cardContent: {
        overflow: 'scroll'
      },
      footer: {
        position: 'sticky',
      bottom: 0
      },
      table: {
        width: "100%"
      }
    }

    let displayModal = (
      <Dialog
        open={this.state.modalOpen}
        onClose={this.handleClose}
        fullWidth={true}
        className={classes.dialog}
      >
      <DialogContent className={classes.dialog} >
      <Card>
            <CardHeader
              title={sOrder ? `Order #${sOrder.id}` : "Order #"}
              avatar={<List />}
              action={
                <>
                <IconButton onClick={this.toggleEdit} aria-label="Quotes">
                  <Edit />
                </IconButton>
                <IconButton onClick={this.handleClose} aria-label="Quotes">
                  <Close />
                </IconButton>
                </>
            }/>
             <Divider/>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                <ListItem>
                    <ListItemText primary={"Customer"} secondary={sCustomer ? sCustomer.name : ""}/>
                  </ListItem>
                </Grid>
                <Grid item xs={6}>
                  <ListItem>
                    <ListItemText primary={"Date"} secondary={sOrder ? moment(sOrder.last_visited).format('MM/DD/YYYY - hh:mm a') : ""}/>
                  </ListItem>
                </Grid>
                <Grid item xs={12}>
                  <Table className={classes.table} aria-label="spanning table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Desc</TableCell>
                        <TableCell align="right">Qty.</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                    {sLineItems.map((lineItem, index) => {
                        return(
                          <TableRow>
                            <TableCell>{lineItem.name}</TableCell>
                            <TableCell align="right">{lineItem.quantity}</TableCell>
                            <TableCell align="right">${this.toDollars(lineItem.price)}</TableCell>
                            <TableCell align="right">${this.toDollars(lineItem.price * lineItem.quantity)}</TableCell>
                          </TableRow>
                    )})}
                    </TableBody>
                    <TableBody>
                      <TableRow>
                        <TableCell rowSpan={100} />
                        <TableCell colSpan={2}>Subtotal</TableCell>
                        <TableCell align="right">${sOrder ? `${this.toDollars(sOrder.subtotal)}` : ""}</TableCell>
                      </TableRow>
                      { sOrder? (Number(sOrder.discount) > 0 ?
                        <TableRow>
                          <TableCell colSpan={2}>Discount</TableCell>
                          <TableCell align="right">${this.toDollars(sOrder.discount)}</TableCell>
                        </TableRow>
                        : null) : null}
                      <TableRow>
                        <TableCell colSpan={2}>Tax</TableCell>
                        <TableCell align="right">${sOrder ? `${this.toDollars(sOrder.tax)}` : ""}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell align="right">${sOrder ? `${this.toDollars(sOrder.total)}` : ""}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} align="center" style={{fontWeight: "bold"}}>Payments</TableCell>
                      </TableRow>
                      { sPayments.length > 0 ? sPayments.map(payment => {
                        return (
                      <TableRow>
                        <TableCell colSpan={2}>{payment.payment_method}</TableCell>
                        <TableCell align="right">${this.toDollars(payment.amount)}</TableCell>
                      </TableRow>
                        )
                      }) : null}
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>
            </CardContent>
        </Card>
        </DialogContent>
      </Dialog>)

    let editModal = (
      <Dialog
        open={this.state.modalOpen}
        onClose={this.handleClose}
        fullWidth={true}
      >
      <DialogContent className={classes.dialog}>
          <Card >
            <CardHeader
              title={sOrder ? `Order #${sOrder.id}` : "Order #"}
              avatar={<List />}
              action={
                <IconButton onClick={this.handleClose} aria-label="Quotes">
                  <Close />
                </IconButton>
            }/>
           <Divider/>
            <CardContent>
              <Grid container>
                <Grid item xs={12}>
                  <Table className={classes.table} aria-label="spanning table">
                    <TableBody>
                    <h3>Customer</h3>
                    <TableRow>
                      <TableCell colSpan={4}>{editSelectedOrder.customer[0] ? editSelectedOrder.customer[0].name : "No Customer Selected"}</TableCell>
                      <TableCell>
                        <IconButton aria-label="Quotes" onClick={this.editCustomerToggle}>
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    <h3>Scale Reference</h3>
                    <TableRow>
                      <TableCell colSpan={4}>{editSelectedOrder.order[0] ? (editSelectedOrder.order[0].scale_reference === "" ? "No Scale Reference" : editSelectedOrder.order[0].scale_reference) : "No Scale Reference"}</TableCell>
                      <TableCell>
                        <IconButton aria-label="Quotes" onClick={this.editScaleRefToggle}>
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    <h3>Products</h3>
                      <TableRow>
                        <TableCell>Desc</TableCell>
                        <TableCell align="right">Qty.</TableCell>
                        <TableCell align="right">Unit</TableCell>
                        <TableCell align="right">Sum</TableCell>
                        <TableCell align="right"></TableCell>
                      </TableRow>
                      {editSelectedOrder.lineItems.map((lineItem, index) => {
                        return(
                      <TableRow>
                        <TableCell>{lineItem.name}</TableCell>
                        <TableCell align="right">{lineItem.quantity}</TableCell>
                        <TableCell align="right">${this.toDollars(lineItem.price)}</TableCell>
                        <TableCell align="right">${this.toDollars(lineItem.price * lineItem.quantity)}</TableCell>
                        <TableCell>
                          <IconButton aria-label="Quotes" onClick={this.editLineItemToggle}>
                            <Edit />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      )})}
                      <TableRow onClick={this.addLineItemToggle}>
                        <TableCell colSpan={4}>Add Product</TableCell>
                        <TableCell>
                        <IconButton aria-label="Quotes">
                          <Add />
                        </IconButton>
                        </TableCell>
                      </TableRow>

                    <h3>Payments</h3>
                        <TableRow>
                          <TableCell>Method</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                        {editSelectedOrder.payments.map((payment, index) => {
                          return(
                        <TableRow>
                          <TableCell>{payment.payment_method}</TableCell>
                          <TableCell>${this.toDollars(payment.amount)}</TableCell>
                          <TableCell>
                            <IconButton aria-label="Quotes" onClick={this.editPaymentToggle}>
                              <Edit />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                          )})}
                        <TableRow onClick={this.addPaymentToggle}>
                          <TableCell colSpan={4}>Add Payment</TableCell>
                          <TableCell>
                          <IconButton aria-label="Quotes">
                            <Add />
                          </IconButton>
                          </TableCell>
                        </TableRow>
                    </TableBody>
                  </Table>

                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell rowSpan={6} />
                        <TableCell colSpan={2}>Subtotal</TableCell>
                        <TableCell align="right">3.14</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2}>Discount</TableCell>
                        <TableCell align="right">$1</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2}>Tax</TableCell>
                        <TableCell align="right">$4</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell align="right">$6.14</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2}>Paid</TableCell>
                        <TableCell align="right">$6.14</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" className={classes.button}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" className={classes.button}>
            Save
          </Button>
        </DialogActions>
      </Dialog>)

    let editCustomer = (
      <Dialog
        open={this.state.editCustomer}
        onClose={this.editCustomerToggle}
        fullWidth={true}
      >
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
          Please Choose A Customer
          <TextField margin="dense" fullWidth placeholder={editSelectedOrder.customer[0] ? editSelectedOrder.customer[0].name : 'No Customer Selected'}/>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" className={classes.button}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" className={classes.button}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      )

    let editScaleRef = (
      <Dialog
        open={this.state.editScaleRef}
        onClose={this.editScaleRefToggle}
        fullWidth={true}
      >
        <DialogTitle>Edit Scale Reference</DialogTitle>
        <DialogContent>
          <TextField margin="dense" fullWidth placeholder={editSelectedOrder.order[0] ? editSelectedOrder.order[0].scale_reference : null}/>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" className={classes.button}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" className={classes.button}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      )

    let editLineItem = (
      <Dialog
        open={this.state.editLineItem}
        onClose={this.editLineItemToggle}
        fullWidth={true}
      >
        <DialogTitle>Edit Line Item</DialogTitle>
        <DialogContent>
          ProductName
          <div><TextField
          label="New Quantity"
          defaultValue="Normal"
          variant="outlined"
          type='number'
          placeholder="5"
          /></div>
          <div style={{paddingTop: 10}}><Button variant="contained" color='secondary'>Delete</Button></div>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" className={classes.button}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" className={classes.button}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      )


    let categoriroos = ['video games', 'dance equipment', 'train sets']
    let productooos = ['product1', 'product2']
    let addLineItem = (
      <Dialog
        open={this.state.addLineItem}
        onClose={this.addLineItemToggle}
      >
        <DialogTitle>Add Line Item</DialogTitle>
        <DialogContent>
          <div>
          <TextField
            id="standard-select-currency"
            select
            label="Category"
            helperText="Please select your category"
          >
            {categoriroos.map((option) => (
              <MenuItem >
                {option}
              </MenuItem>
            ))}
          </TextField>
          </div>
          <div style={{margin: 5}}>
          <TextField
            id="standard-select-currency"
            select
            label="Product"
            helperText="Please select your category"
          >
            {productooos.map((option) => (
              <MenuItem >
                {option}
              </MenuItem>
            ))}
          </TextField>
          </div>
          <div style={{marginBottom: 5}}>
          <TextField
            label="Quantity"
            defaultValue="Normal"
            variant="outlined"
            type='number'
            placeholder="0"
          />
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" className={classes.button}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" className={classes.button}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
      )

    let paymentMethodList = ['Cash', 'Debit', 'Credit', 'Charge']
    let editPayment = (
      <Dialog
        open={this.state.editPayment}
        onClose={this.editPaymentToggle}
      >
        <DialogTitle>Add Payment</DialogTitle>
        <DialogContent>
          <div style={{margin: 5}}>
          <TextField
            id="standard-select-currency"
            select
            label="Payment Method"
            helperText="Please select your payment method"
          >
            {paymentMethodList.map((option, i) => (
              <MenuItem key={i} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          </div>
          <div style={{marginBottom: 5}}>
          <TextField
            label="Amount"
            defaultValue="Normal"
            variant="outlined"
            type='number'
            placeholder="0"
          />
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" className={classes.button}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" className={classes.button}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      )

    let addPayment = (
      <Dialog
        open={this.state.addPayment}
        onClose={this.addPaymentToggle}
      >
        <DialogTitle>Add Payment</DialogTitle>
        <DialogContent>
          <div style={{margin: 5}}>
          <TextField
            id="standard-select-currency"
            select
            label="Payment Method"
            helperText="Please select your payment method"
          >
            {paymentMethodList.map((option, i) => (
              <MenuItem key={i} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          </div>
          <div style={{marginBottom: 5}}>
          <TextField
            label="Amount"
            defaultValue="Normal"
            variant="outlined"
            type='number'
            placeholder="0"
          />
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" className={classes.button}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" className={classes.button}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
      )

    return (
      <MuiPickersUtilsProvider utils={MomentUtils}>
      <div className="App">
      <NavbarMain admin={admin} dashboard={dashboard}/>
        <h2>Transactions</h2>
        {this.state.modalEdit ? editModal : displayModal}
        {editCustomer}
        {editScaleRef}
        {editLineItem}
        {addLineItem}
        {editPayment}
        {addPayment}
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
                  <TableRow hover key={index} onClick={() => this.selectOrder(order)}>
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


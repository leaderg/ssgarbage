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
  Delete,
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
      categories: [],
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

      scaleRefInput: "",

      editPaymentIndex: 0,
      editPaymentInput: [],

      editAddPayment: {
        amount: "",
        payment_method: "",
        order_id: null
      },

      editLineItemIndex: 0,
      editLineItemInput: [],

      selectedCategory: {},
      productList: [],
      selectedProduct: {},
      selectQuantity: 0

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
      this.setState({
        selectedOrder: res.data,
        editSelectedOrder: res.data,
        transactionModalToggle: true
      },
        this.handleOpen()
      )
    })
  }

  getCategories() {
    axios
    .get(`/api/categories`)
    .then(res => {
      const categories = res.data;
      this.setState({ categories });
    })
  }

  getProducts() {
    axios
    .get(`/api/products/${this.state.selectedCategory.id}`)
    .then(res => {
      const productList = res.data;
      this.setState({
        productList
      });
    })
  }

  //Helper Function

  toDollars = (input) => {
    input = Number(input);
    input  /= 100
    return(input.toFixed(2))
  }

  toCents(input) {
    input *= 100
    return(input);
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

  editLineItemSelected = (index) => {
    this.setState({
      editLineItemInput: this.state.editSelectedOrder.lineItems[index],
      editLineItemIndex: index
    },
      this.editLineItemToggle()
    )
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

  editPaymentSelected = (index) => {
    this.setState({
      editPaymentInput: this.state.editSelectedOrder.payments[index],
      editPaymentIndex: index
    },
      this.editPaymentToggle()
    )
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

  //Edit Scale Ref Function
  editScaleRefInput = event => {
    let scaleRefInput = event.target.value;
    this.setState({ scaleRefInput })
  }

  commitScaleRefEdit = () => {
    let editSelectedOrder = this.state.editSelectedOrder;
    editSelectedOrder.order[0].scale_reference = this.state.scaleRefInput
    this.setState({
      editSelectedOrder,
      editScaleRef: false
    })
  }

  //Edit Line Item Method
  editLineItemInput = event => {
    let quantity = event.target.value
    let editLineItemInput = this.state.editLineItemInput
    editLineItemInput.quantity = quantity
    this.setState({ editLineItemInput })
  }

  //Add Line Item Methods

  chooseCategory = event => {
    this.setState({ selectedCategory: event.target.value}, () => {
      this.getProducts()
    })
  }

  chooseProduct = event => {
    this.setState({ selectedProduct: event.target.value})
  }

  addLineItemQuantity = event => {
    let selectQuantity = event.target.value
    this.setState({ selectQuantity })
  }

  addLineItemSubmit = () => {
    let newLineItem = {};
    newLineItem.order_id = this.state.editSelectedOrder.order[0].id
    newLineItem.product_id = this.state.selectedProduct.id
    newLineItem.tax_percent = this.state.selectedProduct.tax_percent
    newLineItem.taxed = this.state.selectedProduct.taxed
    newLineItem.name = this.state.selectedProduct.name
    newLineItem.price = this.state.selectedProduct.price
    newLineItem.quantity = Number(this.state.selectQuantity)
    let editSelectedOrder = this.state.editSelectedOrder
    editSelectedOrder.lineItems.push(newLineItem)
    this.setState({ editSelectedOrder }, this.addLineItemToggle)
  }

  // Remove Line Item
  removeLineItem = (index) => {
    let editSelectedOrder = this.state.editSelectedOrder
    editSelectedOrder.lineItems.splice(index, 1)
    this.setState({ editSelectedOrder })
  }

  //Remove Payment Method
  removePaymentMethod = (index) => {
    let editSelectedOrder = this.state.editSelectedOrder
    editSelectedOrder.payments.splice(index, 1)
    this.setState({ editSelectedOrder })
  }

  //Edit Payment Method
  editPaymentTypeInput = event => {
    let type = event.target.value
    let editPaymentInput = this.state.editPaymentInput
    editPaymentInput.payment_method = type
    this.setState({ editPaymentInput })
  }

  editPaymentAmountInput = event => {
    let amount = this.toCents(event.target.value)
    let editPaymentInput = this.state.editPaymentInput
    editPaymentInput.amount = amount
    this.setState({ editPaymentInput })
  }

  //Add Payment Method
  addNewPaymentType = event => {
    let editAddPayment = this.state.editAddPayment
    editAddPayment.payment_method = event.target.value
    this.setState({ editAddPayment})
  }

  addNewPaymentAmount = event => {
    let editAddPayment = this.state.editAddPayment
    editAddPayment.amount = this.toCents(event.target.value)
    this.setState({ editAddPayment})
  }

  addNewPaymentConfirm = () => {
    let editAddPayment = this.state.editAddPayment
    editAddPayment.order_id = this.state.editSelectedOrder.order[0].id
    let editSelectedOrder = this.state.editSelectedOrder
    editSelectedOrder.payments.push(editAddPayment)
    this.setState({ editSelectedOrder})
  }

  buildCharges = (payments) => {
    let charges = []
    payments.forEach( payment => {
      if (payment.payment_method == 'Charge') {
        charges.push(
         {customer_id: this.state.editSelectedOrder.order[0].customer_id,
          order_id: this.state.editSelectedOrder.order[0].id,
          last_visited: this.state.editSelectedOrder.order[0].last_visited,
          amount: payment.amount}
        )
      }
    })
    return charges
  }



  //Submit Edited Order
  submitEditedOrder = () => {
    let data = this.state.editSelectedOrder;
    data.order[0].subtotal = this.toCents(this.getSubtotal())
    data.order[0].tax = this.toCents(this.getTax())
    data.order[0].total = this.toCents(this.getTotal())

    data.charges = this.buildCharges(data.payments)

    axios
    .post(`/api/editorder`, { data })
    .then( res => {
      this.getOrders()
      this.handleClose()
    })
  }

  //Order Helper Functions//////////////////
  getSubtotal = () => {
    let output = 0;
    this.state.editSelectedOrder.lineItems.forEach(lineItem => {
      output += (lineItem.price * lineItem.quantity)
    })
    return this.toDollars(output)
  }

  getTax = () => {
    let output = 0;
    this.state.editSelectedOrder.lineItems.forEach(lineItem => {
      output += (lineItem.price * lineItem.quantity * (lineItem.tax_percent / 100))
    })
    return this.toDollars(output)
  }

  getTotal = () => {
    let subtotal = this.getSubtotal();
    let tax = this.getTax();
    let total = this.toCents(subtotal) + this.toCents(tax);
    return this.toDollars(total);
  }

  getPaid = () => {
    let output = 0;
    this.state.editSelectedOrder.payments.forEach(payment => {
      output += payment.amount
    })
    return this.toDollars(output);
  }

  componentDidMount() {
    this.getOrders();
    this.getCategories();
  }

  render() {
    let { admin, dashboard, user } = this.props;
    const sOrder = this.state.selectedOrder.order[0];
    const sLineItems = this.state.selectedOrder.lineItems;
    const sCustomer = this.state.selectedOrder.customer[0];
    const sPayments = this.state.selectedOrder.payments
    const editSelectedOrder = this.state.editSelectedOrder
    let paymentMethodList = ['Cash', 'Debit', 'Credit', 'Charge']

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
                          <IconButton aria-label="Quotes" onClick={() => this.editLineItemSelected(index)}>
                            <Edit />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <IconButton aria-label="Quotes" onClick={() => this.removeLineItem(index)}>
                            <Delete />
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
                            <IconButton aria-label="Quotes" onClick={() => this.editPaymentSelected(index)}>
                              <Edit />
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <IconButton aria-label="Quotes" onClick={() => this.removePaymentMethod(index)}>
                              <Delete />
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
                        <TableCell align="right">${this.getSubtotal()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2}>Discount</TableCell>
                        <TableCell align="right">$</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2}>Tax</TableCell>
                        <TableCell align="right">${this.getTax()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell align="right">${this.getTotal()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2}>Paid</TableCell>
                        <TableCell align="right">${this.getPaid()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" className={classes.button} onClick={this.handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" className={classes.button} onClick={this.submitEditedOrder}>
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
          <TextField
            margin="dense"
            fullWidth placeholder={editSelectedOrder.order[0] ? editSelectedOrder.order[0].scale_reference : null}
            onChange={(e) => this.editScaleRefInput(e)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" className={classes.button} onClick={this.editScaleRefToggle}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" className={classes.button} onClick={this.commitScaleRefEdit}>
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
          {this.state.editLineItemInput.name}
          <div><TextField
          label={this.state.editLineItemInput.quantity}
          onChange={(e) => this.editLineItemInput(e)}
          defaultValue="Normal"
          variant="outlined"
          type='number'
          placeholder="5"
          /></div>
          <div style={{paddingTop: 10}}><Button variant="contained" color='secondary'>Delete</Button></div>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" className={classes.button} onClick={this.editLineItemToggle}>
            Okay
          </Button>
        </DialogActions>
      </Dialog>
      )

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
            onChange={(e) => this.chooseCategory(e)}
          >
            {this.state.categories.map((option) => (
              <MenuItem value={option}>
                {option.name}
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
            onChange={(e) => this.chooseProduct(e)}
          >
            {this.state.productList.map((option) => (
              <MenuItem value={option}>
                {option.name}
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
            onChange={(e) => this.addLineItemQuantity(e)}
          />
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" className={classes.button}
          onClick={() => this.setState({
             selectedCategory: {},
              productList: [],
              selectedProduct: {},
              selectQuantity: 0
            },
              () => this.addLineItemToggle()
            )
          }>
            Cancel
          </Button>
          <Button variant="contained" color="primary" className={classes.button} onClick={this.addLineItemSubmit}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
      )

    let editPayment = (
      <Dialog
        open={this.state.editPayment}
        onClose={this.editPaymentToggle}
      >
        <DialogTitle>Edit Payment</DialogTitle>
        <DialogContent>
          <div style={{margin: 5}}>
          <TextField
            id="standard-select-currency"
            select
            label={this.state.editPaymentInput.payment_method}
            helperText="Please select your payment method"
            onChange={(e) => this.editPaymentTypeInput(e)}
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
            label={this.toDollars(this.state.editPaymentInput.amount)}
            onChange={(e) => this.editPaymentAmountInput(e)}
            defaultValue="Normal"
            variant="outlined"
            type='number'
            placeholder="0"
          />
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" className={classes.button} onClick={this.editPaymentToggle}>
            Okay
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
            onChange={(e) => this.addNewPaymentType(e)}
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
            onChange={(e) => this.addNewPaymentAmount(e)}
          />
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" className={classes.button} onClick={this.addPaymentToggle}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" className={classes.button} onClick={this.addNewPaymentConfirm}>
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


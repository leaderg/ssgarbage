import React, { useState, useEffect } from "react";
import axios from 'axios';
import moment from 'moment';
import MomentUtils from "@date-io/moment";

import NavbarMain from '../Components/NavbarMain'


import {
  Box,
  IconButton,
  Button,
  Grid,
  Typography,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  TextField
} from "@material-ui/core"

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from "@material-ui/pickers";

import { Add, List } from '@material-ui/icons';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    dashboardContainer: {
      width: '100%',
      marginTop: theme.spacing(2),
    },
    pageTitle: {
      display: "flex",
      fontWeight: "bold",
      flexDirection: "column",
      justifyContent: "center"
    },
  }));

function Discounts({ admin, dashboard, user }) {

  const [discountTriggers, updateDiscountTriggers] = useState([]);
  const [categories, updateCategories] = useState([]);
  const [products, updateProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("")
  const [type, updateType] = useState(false);
  const [amount, updateAmount] = useState("0");
  const [startDate, updateStartDate] = useState(moment().startOf('day'));
  const [endDate, updateEndDate] = useState(moment().endOf('day'));

  const classes = useStyles();

  useEffect(() => {
    axios
    .get(`/api/categories`)
    .then(res => updateCategories(res.data) )
  }, []);

  useEffect(() => {
    axios
    .get('/api/discountTriggers')
    .then(res => updateDiscountTriggers(res.data))
  }, [])

  const getProducts = (event) => {
    axios
    .get(`/api/products/${event.target.value}`)
    .then(res => updateProducts(res.data))
  }

  const chooseProduct = (event) => {
    setSelectedProduct(event.target.value);
  }

  const inputAmount = (event) => {
    updateAmount(event.target.value);
  }

  const typeChange = (event) => {
    updateType(event.target.value)
  }

  const submitDiscountTrigger = () => {
    let newDiscountTrigger = {
      product_id: selectedProduct.id,
      is_percent: type,
      amount: amount,
      value: valueHandler(),
      start_date: startDate,
      end_date: endDate
    };
    axios
    .post(`/api/discountTriggers`, { newDiscountTrigger })
    .then((res) => {
      axios
      .get('/api/discountTriggers')
      .then(res => updateDiscountTriggers(res.data))
    })
  }

  const startDateChange = event => {
    let date = event.startOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
    if(moment(date).isBefore(endDate)) {
      updateStartDate(date)
    } else {
      let date2 = event.endOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
      updateStartDate(date)
      updateEndDate(date2)
    }
  }

  const endDateChange = event => {
    let date2 = event.endOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
    if(moment(endDate).isAfter(startDate)) {
      updateEndDate(date2)
    } else {
      let date = event.startOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
      updateStartDate(date)
      updateEndDate(date2)
    }
  }

  const toDollars = (input) => {
    input = Number(input);
    input  /= 100
    return(input.toFixed(2))
  }

  const toCents = (input) => {
    input *= 100
    return(input);
  }

  const valueHandler = () => {
    return type ? (
       selectedProduct.price * (amount / 100)
      ) : (
       toCents(amount)
    )
  }

  return (
    <div className="App">
      <NavbarMain admin={admin} dashboard={dashboard}/>
    <Box className={classes.dashboardContainer} m={2}>
      <Grid container spacing={2} alignItems="stretch">
        <Grid className={classes.pageTitle} item xs={12}>
          <Typography variant="h3" align="center">
            Discounts
          </Typography>
        </Grid>
        <Grid item xs={8} component={Card}>
          <CardHeader
            title={"Discount Triggers"}
            avatar={<List />}
          />
          <CardContent>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    Product
                  </TableCell>
                  <TableCell>
                    Type
                  </TableCell>
                  <TableCell>
                    Amount
                  </TableCell>
                  <TableCell>
                    Value
                  </TableCell>
                  <TableCell>
                    Start Date
                  </TableCell>
                  <TableCell>
                    End Date
                  </TableCell>
                </TableRow>
              </TableHead>
              {discountTriggers.map((trigger, index) => {
                return (
                  <TableRow hover key={index}>
                    <TableCell>{trigger.name}</TableCell>
                    <TableCell>{trigger.is_percent ? "Percentage" : "Flat Rate"}</TableCell>
                    <TableCell>{trigger.is_percent ? `${Number(trigger.amount).toFixed(2)}%` : `$${Number(trigger.amount).toFixed(2)}`}</TableCell>
                    <TableCell>${toDollars(trigger.value)}</TableCell>
                    <TableCell>{moment(trigger.start_date).format('MM/DD/YYYY - hh:mm a')}</TableCell>
                    <TableCell>{moment(trigger.end_date).format('MM/DD/YYYY - hh:mm a')}</TableCell>
                  </TableRow>
                  )
                })
              }
              <TableBody>
              </TableBody>
            </Table>
          </CardContent>
        </Grid>
        <Grid item xs={4} component={Card}>
          <CardHeader
            title={"Add New Discount"}
            avatar={<List />}
          />
          <CardContent>
            <Grid container xs={12} spacing={2}>
            <Grid item xs={6}>
          <TextField
            fullWidth
            select
            label="Category"
            helperText="Please select your category"
            onChange={(e) => getProducts(e)}
          >
            {categories.map((option) => (
              <MenuItem value={option.id}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
          </Grid>
          <Grid item xs={6}>
          <TextField
            fullWidth
            select
            label="Product"
            helperText="Please select your category"
            onChange={(e) => chooseProduct(e)}
          >
            {products.map((option) => (
              <MenuItem value={option}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
          </Grid>
          <Grid item xs={6}>
          <TextField
            fullWidth
            select
            label="Discount Type"
            helperText="Please Select Discount Type"
            onChange={(e) => typeChange(e)}
          >
            <MenuItem value={true}>Percentage</MenuItem>
            <MenuItem value={false}>Flat Rate</MenuItem>
          </TextField>
          </Grid>
          <Grid item xs={6}>
          <TextField
            label="Amount"
            defaultValue="Normal"
            variant="outlined"
            type='number'
            placeholder="0"
            onChange={(e) => inputAmount(e)}
          />
          </Grid>
          <Grid item xs={6} justify="space-around">
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <KeyboardDatePicker
              id="date-picker-dialog"
              label={<span style={{opacity: 0.6}}>Start Date</span>}
              value={startDate}
              onChange={startDateChange}
              format="MM/DD/yyyy"
              KeyboardButtonProps={{
                "aria-label": "change date"
              }}
            />
          </MuiPickersUtilsProvider>
          </Grid>
          <Grid item xs={6} justify="space-around">
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <KeyboardDatePicker
              id="date-picker-dialog"
              label={<span style={{opacity: 0.6}}>End Date</span>}
              value={endDate}
              onChange={endDateChange}
              format="MM/DD/yyyy"
              KeyboardButtonProps={{
                "aria-label": "change date"
              }}
            />
             </MuiPickersUtilsProvider>
          </Grid>
          </Grid>
          </CardContent>
          <CardActions>
          <Button variant="contained" color="primary" onClick={submitDiscountTrigger}>
            Create Discount
          </Button>
          </CardActions>
        </Grid>
      </Grid>
    </Box>
    </div>
  );
}

export default Discounts;
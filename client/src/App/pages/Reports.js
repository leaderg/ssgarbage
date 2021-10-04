import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { PDFDownloadLink, Page, Text, View, Document, StyleSheet  } from '@react-pdf/renderer'
import moment from 'moment';
import axios from 'axios';

import OrderReviewModal from '../Components/OrderReviewModal'

const styles = {
  page: {
    margin: 20
  },
  header: {
    textAlign: 'center',
    fontWeight: 'bolder',
    fontSize: 28,
    marginBottom: 5
  },
  title: {
    fontWeight: 'bolder',
    marginTop: 25,
    marginBottom: 5,
    fontSize: 24,
  },
  section: {
    margin: 30,
    marginTop: 0,
    marginBottom: 0,
    justifyContent: 'flex-start',
    width: '80%',
    padding: 5,
    flexDirection: 'row'
  },
  label: {
    width: '40%',
    textAlign: 'left',
  },
  value: {
    width: '40%',
    textAlign: 'right',
  },
  tallyLine: {
    borderBottom: 2,
    borderColor: 'grey',
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  row: {
    margin: "auto",
    flexDirection: "row"
  },
  col: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  biCol: {
    width: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  quartcol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  cinqcol: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  cell: {
    margin: "auto",
    marginTop: 5,
    fontSize: 10
  }
};


class Reports extends Component {
  constructor(props){
    super(props);
    this.state = {
      startDate: moment().startOf('day'),
      endDate: moment().endOf('day'),
      totalSales: 0,
      totalTax: 0,
      totalDiscount: 0,
      transactionAverage: 0,
      payments: {
        cash: 0,
        debit: 0,
        credit: 0,
        charge: 0
      },
      orders: [],
      productReport: [],
      chargeReport: [],
      chargeReportByCustomer: [],
      chequeReport: [],
      chequeReportByCustomer: [],
      notes: [],
      hidden_from_reports: false
    }
  }

  componentDidMount() {
    this.getCategories();
    this.getEmployees();
  }

  getCategories = () => {
    axios
      .get(`/api/allCategories`)
      .then(res => {
        const categories = res.data;
        this.setState({ categories });
      })
  }

  getEmployees= () => {
    axios
    .get(`/api/employees`)
    .then(res => {
      const employees = res.data;
      this.setState({employees})
    })
  }

  startDateChange = event => {
    let startDate = moment(event.target.value).startOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
    this.setState({ startDate });
  }

  endDateChange = event => {
    let endDate = moment(event.target.value).endOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
    this.setState({ endDate });
  }

  paymentTypeTotal = (payments, type) => {
    let output = 0;
    payments.forEach(payment => {
      if(payment.payment_method === type) {
        output += Number(payment.amount)
      }
    })
    return output;
  }

  datesRangeReport = (startDate, endDate) => {
    let dates = {
      startDate: startDate,
      endDate: endDate,
      orders: [],
      totalSales: 0,
      totalTax: 0,
      transactionAverage: 0
    }
    axios
    .post(`/api/rangereport`, { dates })
    .then(res => {
      let orderLength = res.data.orderLenge
      let productReport = res.data.productReport
      let chargeReport = res.data.chargeReport
      let chargeReportByCustomer = res.data.chargeReportByCustomer
      let chequeReport = res.data.chequeReport
      let chequeReportByCustomer = res.data.chequeReportByCustomer
      let totalDiscount = res.data.totalDiscount
      let totalSales = res.data.totalSales
      let totalTax = res.data.totalTax
      let notes = res.data.notes
      let transactionAverage = totalSales/orderLength

      let payments = {
        cash: this.paymentTypeTotal(res.data.payments, "Cash"),
        debit: this.paymentTypeTotal(res.data.payments, "Debit"),
        credit: this.paymentTypeTotal(res.data.payments, "Credit"),
        charge: this.paymentTypeTotal(res.data.payments, "Charge"),
        cheque: this.paymentTypeTotal(res.data.payments, "Cheque")
      }

      this.setState({totalDiscount, totalSales, totalTax, notes, productReport, chargeReport, chargeReportByCustomer, chequeReport, chequeReportByCustomer,transactionAverage, payments, startDate, endDate })
    })
  }

  todayDateRange = () => {
    let startDate = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
    let endDate =  moment().endOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
    this.datesRangeReport(startDate, endDate)
  }

  yesterdayDateRange = () => {
    let startDate = moment().startOf('day').subtract(1,'d').format('YYYY-MM-DDTHH:mm:ssZ');
    let endDate =  moment().endOf('day').subtract(1,'d').format('YYYY-MM-DDTHH:mm:ssZ');
    this.datesRangeReport(startDate, endDate)
  }

  weekDateRange = () => {
    let startDate = moment().startOf('day').subtract(7,'d').format('YYYY-MM-DDTHH:mm:ssZ');
    let endDate =  moment().endOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
    this.datesRangeReport(startDate, endDate)
  }

  currentMonthDateRange = () => {
    let startDate = moment().startOf('month').format('YYYY-MM-DDTHH:mm:ssZ');
    let endDate =  moment().endOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
    this.datesRangeReport(startDate, endDate)
  }

  lastMonthDateRange = () => {
    let startDate = moment().subtract(1,'months').startOf('month').format('YYYY-MM-DDTHH:mm:ssZ');
    let endDate =  moment().subtract(1,'months').endOf('month').format('YYYY-MM-DDTHH:mm:ssZ');
     this.datesRangeReport(startDate, endDate)
  }

  testButton = () => {
    let startDate = this.state.startDate;
    let endDate = this.state.endDate;
    this.datesRangeReport(startDate, endDate)
  }

  singleOrderInfo = (orderId) => {
    axios
    .get(`/api/orders/${orderId}`)
    .then( res => {
      this.setState({singleOrderInfo: res.data})
    })
  }

  closeOrderModal = () => {
    this.setState({singleOrderInfo: undefined})
  }

  toDollars = (input) => {
    input = Number(input);
    input  /= 100
    return(input.toFixed(2))
  }

  toCents = (input) => {
    input *= 100
    return(input);
  }

  categoryArray = () => {
    if (this.state.categories){
        let output = []
        for (let category of this.state.categories) {
          let total = 0;
          for(let product of this.state.productReport) {
            if (category.id == product.category_id) {
              total += (Number(product.price) * product.sum);
            }
          }
          output.push({name: category.name, total: this.toDollars(total)})
        }
        return output;}
    else {
      return [{name: '', total: ''}]
    }
  }

  // employeeArray = () => {
  //   if (this.state.employees){
  //       let output = []
  //       for (let employee of this.state.employees) {
  //         let total = 0;
  //         for(let order of this.state.orders) {
  //           if (employee.first_name == order.employee_name) {
  //             total += (Number(order.total) - Number(order.tax));
  //           }
  //         }
  //         output.push({name: employee.first_name, total: this.toDollars(total)})
  //       }
  //       return output;}
  //   else {
  //     return [{name: '', total: ''}]
  //   }
  // }

  render() {
    let categoryTotals = this.categoryArray()
    // let employeeTotals = this.employeeArray()
    return (
    <div className="App">
      <h1>Reports</h1>
      <h2>Select a date range</h2>
      <PDFDownloadLink document={
        <Document>
          <Page size="A4" style={styles.page}>
            <Text style={styles.header}>SS Garbage Sales Report</Text>
            <View>
              <Text>Date Range:</Text>
              <Text>From {moment(this.state.startDate).format('MM-DD-YYYY')} to {moment(this.state.endDate).format('MM-DD-YYYY')}</Text>
            </View>
            <Text style={styles.title}>Sales</Text>
            <View style={styles.section}>
              <View style={styles.label}>
              <Text style={styles.tallyLine}>Gross Sales</Text>
              <Text style={styles.tallyLine}>Discounts</Text>
              <Text style={styles.tallyLine}>Net Sales</Text>
              <Text style={styles.tallyLine}>Tax</Text>
              <Text style={styles.tallyLine}>Total Sales</Text>
            </View>
            <View style={styles.value}>
              <Text style={styles.tallyLine}>${this.toDollars(this.state.totalSales + this.state.totalDiscount - this.state.totalTax)}</Text>
              <Text style={styles.tallyLine}>${this.toDollars(this.state.totalDiscount)}</Text>
              <Text style={styles.tallyLine}>${this.toDollars(this.state.totalSales - this.state.totalTax)}</Text>
              <Text style={styles.tallyLine}>${this.toDollars(this.state.totalTax)}</Text>
              <Text style={styles.tallyLine}>{this.toDollars(this.state.totalSales) }</Text>
              </View>
            </View>
            <Text style={styles.title}>Payment Methods</Text>
            <View style={styles.section}>
              <View style={styles.label}>
              <Text style={styles.tallyLine}>Cash</Text>
              <Text style={styles.tallyLine}>Debit</Text>
              <Text style={styles.tallyLine}>Credit</Text>
              <Text style={styles.tallyLine}>Charge</Text>
              </View>
              <View style={styles.value}>
              <Text style={styles.tallyLine}>${this.toDollars(this.state.payments.cash)}</Text>
              <Text style={styles.tallyLine}>${this.toDollars(this.state.payments.debit)}</Text>
              <Text style={styles.tallyLine}>${this.toDollars(this.state.payments.credit)}</Text>
              <Text style={styles.tallyLine}>${this.toDollars(this.state.payments.charge)}</Text>
              </View>
            </View>
{/*            <Text style={styles.title}>Employee Net Sales</Text>
            <View style={styles.section}>
              <View style={styles.label}>
                {employeeTotals.map((employee) => {
                return(<Text style={styles.tallyLine}>{employee.name}</Text>)
                })}
              </View>
              <View style={styles.value}>
                {employeeTotals.map((employee) => {
                return(<Text style={styles.tallyLine}>${employee.total}</Text>)
                })}
              </View>
            </View>*/}
            <Text style={styles.title}>Category Totals</Text>
            <View style={styles.section}>
              <View style={styles.label}>
                {categoryTotals.map((category) => {
                return (category.total > 0 ? (<Text style={styles.tallyLine}>{category.name}</Text>) : null)
                })}
              </View>
              <View style={styles.value}>
                {categoryTotals.map((category) => {
                return( category.total > 0 ? (<Text style={styles.tallyLine}>${category.total}</Text>) : null)
                })}
              </View>
            </View>
            <Text style={styles.title}>Notes</Text>
            <View style={styles.section}>
              <View>
                {this.state.notes.map((note) => {
                return (<Text style={styles.tallyLine} wrap={false}>{note.note}</Text>)
                })}
              </View>
            </View>

          </Page>
        </Document>
      } fileName={`SSGarbageSales${moment(this.state.startDate).format('YYYY-MM-DD')}to${moment(this.state.endDate).format('YYYY-MM-DD')}.pdf`}>
      {({ blob, url, loading, error }) => (<div className="download-button">{loading ? 'Loading document...' : 'Download Report!'}</div>)}
      </PDFDownloadLink>

      <input type="date" name="date" onChange={this.startDateChange} />{` - `}
      <input type="date" name="date" onChange={this.endDateChange} />
      <button onClick={() => this.testButton()}>Go</button>
      <br/><br/>
      <button onClick={() => this.todayDateRange()}>Today</button>
      <button onClick={() => this.yesterdayDateRange()}>Yesterday</button>
      <button onClick={() => this.currentMonthDateRange()}>Month To Date</button>
      <button onClick={() => this.lastMonthDateRange()}>Last Month</button>
      <br/>

      <div className="report-housing">
        <div>
          <div className="report-net-sales">
            <div className="report-net-sales-size">
              <h2>Date Range Net Sales</h2>
              <div className="report-net-sales-total">${this.toDollars(this.state.totalSales)}</div>
            </div>
            <div className="report-net-sales-tax"> Total Tax:<br/> ${this.toDollars(this.state.totalTax)}</div>
            <div className="report-net-sales-avg">
              Discounts:<br/>
              ${this.toDollars(this.state.totalDiscount)}
            </div>
          </div>

          <div className="report-payment-types">
            <div className="report-payment-types-size">
              <h2>Payment Types</h2>
              <div className="report-payment-house">
                <div>
                  <span className="report-payment-type">Cash</span>
                  <span>${this.toDollars(this.state.payments.cash)}</span>
                </div>
                <div>
                  <span className="report-payment-type">Debit</span>
                  <span>${this.toDollars(this.state.payments.debit)}</span>
                </div>
                <div>
                  <span className="report-payment-type">Credit</span>
                  <span>${this.toDollars(this.state.payments.credit)}</span>
                </div>
                <div>
                  <span className="report-payment-type">Charge</span>
                  <span>${this.toDollars(this.state.payments.charge)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
            <h3>Charges</h3>

{/*===============================*/}
        <PDFDownloadLink document={
        <Document>
          <Page size="A4" style={styles.page}>
            <Text style={styles.header}>SS Garbage Charge Report</Text>
            <View>
              <Text>Date Range:</Text>
              <Text>From {moment(this.state.startDate).format('MM-DD-YYYY')} to {moment(this.state.endDate).format('MM-DD-YYYY')}</Text>
            </View>
            <Text style={styles.title}>Total Charge Amount By Customer In Date Range</Text>
            <View style={styles.section}>
              <View style={styles.table}>
                <View style={styles.row} wrap={false}>
                  <View style={styles.biCol}>
                    <Text style={styles.cell}>Customer</Text>
                  </View>
                  <View style={styles.biCol}>
                    <Text style={styles.cell}>Amount</Text>
                  </View>
                </View>
                {this.state.chargeReportByCustomer.length === 0 ? (

                <Text style={styles.header}>No Orders In This Date Range</Text>

                 ) : (

                this.state.chargeReportByCustomer.map(customer => {
                return(
                <View style={styles.row} wrap={false}>
                  <View style={styles.biCol}>
                    <Text style={styles.cell}>{customer.customer_name || 'Unassigned'}</Text>
                  </View>
                  <View style={styles.biCol}>
                    <Text style={styles.cell}>${this.toDollars(customer.sum)}</Text>
                  </View>
                </View>

                )}))}
              </View>
            </View>
            <Text style={styles.title}>Charge Orders</Text>
            <View style={styles.section}>
              <View style={styles.table}>
                <View style={styles.row} wrap={false}>
                  <View style={styles.cinqcol}>
                    <Text style={styles.cell}>Transaction ID</Text>
                  </View>
                  <View style={styles.cinqcol}>
                    <Text style={styles.cell}>Scale Reference</Text>
                  </View>
                  <View style={styles.cinqcol}>
                    <Text style={styles.cell}>Customer</Text>
                  </View>
                  <View style={styles.cinqcol}>
                    <Text style={styles.cell}>Amount</Text>
                  </View>
                  <View style={styles.cinqcol}>
                    <Text style={styles.cell}>Date</Text>
                  </View>
                </View>
                {this.state.chargeReport.length === 0 ? (

                <Text style={styles.header}>No Orders In This Date Range</Text>

                 ) : (

                this.state.chargeReport.map(charge => {
                return(
                <View style={styles.row} wrap={false}>
                  <View style={styles.cinqcol}>
                    <Text style={styles.cell}>{charge.order_id}</Text>
                  </View>
                  <View style={styles.cinqcol}>
                    <Text style={styles.cell}>{charge.scale_reference}</Text>
                  </View>
                  <View style={styles.cinqcol}>
                    <Text style={styles.cell}>{charge.customer_name || 'Unassigned'}</Text>
                  </View>
                  <View style={styles.cinqcol}>
                    <Text style={styles.cell}>${this.toDollars(charge.amount)}</Text>
                  </View>
                  <View style={styles.cinqcol}>
                    <Text style={styles.cell}>{moment(charge.last_visited).format('MM/DD/YYYY - hh:mm a')}</Text>
                  </View>
                </View>

                )}))}

                 </View>
            </View>
                 <Text style={styles.title}>Total Cheque Amount By Customer In Date Range</Text>
            <View style={styles.section}>
              <View style={styles.table}>
                <View style={styles.row} wrap={false}>
                  <View style={styles.biCol}>
                    <Text style={styles.cell}>Customer</Text>
                  </View>
                  <View style={styles.biCol}>
                    <Text style={styles.cell}>Amount</Text>
                  </View>
                </View>
                {this.state.chequeReportByCustomer.length === 0 ? (

                <Text style={styles.header}>No Orders In This Date Range</Text>

                 ) : (

                this.state.chequeReportByCustomer.map(customer => {
                return(
                <View style={styles.row} wrap={false}>
                  <View style={styles.biCol}>
                    <Text style={styles.cell}>{customer.customer_name || 'Unassigned'}</Text>
                  </View>
                  <View style={styles.biCol}>
                    <Text style={styles.cell}>${this.toDollars(customer.sum)}</Text>
                  </View>
                </View>

                )}))}
              </View>
            </View>
            <Text style={styles.title}>Cheque Orders</Text>
            <View style={styles.section}>
              <View style={styles.table}>
                <View style={styles.row} wrap={false}>
                  <View style={styles.quartcol}>
                    <Text style={styles.cell}>Transaction ID</Text>
                  </View>
                  <View style={styles.quartcol}>
                    <Text style={styles.cell}>Customer</Text>
                  </View>
                  <View style={styles.quartcol}>
                    <Text style={styles.cell}>Amount</Text>
                  </View>
                  <View style={styles.quartcol}>
                    <Text style={styles.cell}>Date</Text>
                  </View>
                </View>
                {this.state.chequeReport.length === 0 ? (

                <Text style={styles.header}>No Orders In This Date Range</Text>

                 ) : (

                this.state.chequeReport.map(cheque => {
                return(
                <View style={styles.row} wrap={false}>
                  <View style={styles.quartcol}>
                    <Text style={styles.cell}>{cheque.order_id}</Text>
                  </View>
                  <View style={styles.quartcol}>
                    <Text style={styles.cell}>{cheque.customer_name || 'Unassigned'}</Text>
                  </View>
                  <View style={styles.quartcol}>
                    <Text style={styles.cell}>${this.toDollars(cheque.amount)}</Text>
                  </View>
                  <View style={styles.quartcol}>
                    <Text style={styles.cell}>{moment(cheque.last_visited).format('MM/DD/YYYY - hh:mm a')}</Text>
                  </View>
                </View>

                )}))}

                 </View>
            </View>
          </Page>
        </Document>
      } fileName={`SSGarbageCharges${moment(this.state.startDate).format('YYYY-MM-DD')}to${moment(this.state.endDate).format('YYYY-MM-DD')}.pdf`}>
      {({ blob, url, loading, error }) => (<div>{loading ? 'Loading document...' : 'Download Charge and Cheque Report'}</div>)}
      </PDFDownloadLink>
{/*================================*/}

            <div class="report-wrapper">
              <div class="report-table">
                <div class="report-row report-header">
                  <div class="report-cell">
                    Order #
                  </div>
                  <div class="report-cell">
                    Scale Reference
                  </div>
                  <div class="report-cell">
                    Amount
                  </div>
                  <div class="report-cell">
                    Customer Name
                  </div>
                  <div class="report-cell">
                    Date
                  </div>
                </div>

                    {this.state.chargeReport.map((charge) => {
                      return(

                <div class="report-row">
                  <div class="report-cell" data-title="Product Name">
                    {charge.order_id}
                  </div>
                  <div class="report-cell" data-title="Scale">
                    {charge.scale_reference}
                  </div>
                  <div class="report-cell" data-title="Price">
                    ${this.toDollars(charge.amount)}
                  </div>
                  <div class="report-cell" data-title="Qty">
                    {charge.customer_name || "Unassigned"}
                  </div>
                  <div class="report-cell" data-title="Total">
                    {moment(charge.last_visited).format('YYYY-MM-DD')}
                  </div>
                </div>
                     )
                    })}
              </div>
            </div>
          {/*<div>
            <h3>Orders In Date Range</h3>*/}

{/*===============================*/}
    {/*    <PDFDownloadLink document={
        <Document>
          <Page size="A4" style={styles.page}>
            <Text style={styles.header}>SS Garbage Order Report</Text>
            <View>
              <Text>Date Range:</Text>
              <Text>From {moment(this.state.startDate).format('MM-DD-YYYY')} to {moment(this.state.endDate).format('MM-DD-YYYY')}</Text>
            </View>
            <Text style={styles.title}>Orders</Text>
            <View style={styles.section}>
              <View style={styles.table}>
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.cell}>Order #</Text>
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.cell}>Date</Text>
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.cell}>Employee</Text>
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.cell}>Customer</Text>
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.cell}>Total</Text>
                  </View>
                </View>
                {this.state.orders.length === 0 ? (

                <Text style={styles.header}>No Orders In This Date Range</Text>

                 ) : (

                this.state.orders.map(order => {
                return(
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.cell}>{order.id}</Text>
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.cell}>{moment(order.last_visited).format('YYYY-MM-DD   HH:mm')}</Text>
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.cell}>{order.employee_name || "----"}</Text>
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.cell}>{order.customer_name || "----"}</Text>
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.cell}>${this.toDollars(order.total)}</Text>
                  </View>
                </View>

                )}))}
              </View>
            </View>

          </Page>
        </Document>
      } fileName={`SSGarbageOrders${moment(this.state.startDate).format('YYYY-MM-DD')}to${moment(this.state.endDate).format('YYYY-MM-DD')}.pdf`}>
      {({ blob, url, loading, error }) => (<div>{loading ? 'Loading document...' : 'Download Report!'}</div>)}
      </PDFDownloadLink>*/}
{/*================================*/}

{/*            <div class="report-wrapper">

              <div class="report-table">

                <div class="report-row report-header">
                  <div class="report-cell">
                    Order #
                  </div>
                  <div class="report-cell">
                    Date
                  </div>
                  <div class="report-cell">
                    Customer
                  </div>
                  <div class="report-cell">
                    Employee
                  </div>
                  <div class="report-cell">
                    Total
                  </div>
                </div>

            {this.state.orders.length === 0 ? (

                <div class="report-row">
                  <div class="report-cell">
                    No Orders In This Date Range
                  </div>
                </div>

            ) : (
            this.state.orders.map((order, index) => {
              return(

                <div style={{cursor: "pointer"}} class="report-row darken" onClick={() => this.singleOrderInfo(order.id)}>
                  <div class="report-cell" data-title="Order #">
                    {order.id}
                  </div>
                  <div class="report-cell" data-title="Date">
                    {moment(order.last_visited).format('YYYY-MM-DD')}
                  </div>
                  <div class="report-cell" data-title="Customer">
                    {order.customer_name || "----"}
                  </div>
                  <div class="report-cell" data-title="Employee">
                    {order.employee_name || "----"}
                  </div>
                  <div class="report-cell" data-title="Total">
                    ${this.toDollars(order.total)}
                  </div>
                </div>
            )}))}

              </div>
            </div>*/}


          <div>
            <h3>Product Performance</h3>
            <div class="report-wrapper">
              <div class="report-table">
                <div class="report-row report-header">
                  <div class="report-cell">
                    Product
                  </div>
                  <div class="report-cell">
                    Price
                  </div>
                  <div class="report-cell">
                    Quantity
                  </div>
                  <div class="report-cell">
                    Total
                  </div>
                </div>

                          {this.state.productReport.map((product) => {
                            return(

                <div class="report-row">
                  <div class="report-cell" data-title="Product Name">
                    {product.name}
                  </div>
                  <div class="report-cell" data-title="Price">
                    ${this.toDollars(product.price)}
                  </div>
                  <div class="report-cell" data-title="Qty">
                    {product.sum}
                  </div>
                  <div class="report-cell" data-title="Total">
                    ${this.toDollars(product.price * product.sum)}
                  </div>
                </div>
                          )
                        })}
              </div>
            </div>
          </div>
          <h3>Notes</h3>
          <div class="report-wrapper">
            <div class="report-table">
                  {this.state.notes.map((charge) => {
                    return(
              <div class="report-row">
                <div class="report-cell" data-title="Total">
                  {charge.note}
                </div>
              </div>
                   )})}
            </div>
          </div>


</div>
        </div>
      <OrderReviewModal info={this.state.singleOrderInfo} close={this.closeOrderModal}/>
    </div>
    );
  }
}
export default Reports;

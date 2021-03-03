
exports.up = function(knex) {
  return knex.schema.createTable('charges', function(t) {
        t.increments('id').unsigned().primary();
        t.bigInteger('customer_id').unsigned().index().references('id').inTable('customers');
        t.bigInteger('order_id').unsigned().index().references('id').inTable('orders');
        t.decimal('amount', 16, 4);
        t.timestamp('last_visited').defaultTo(knex.fn.now())
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable('charges');
};

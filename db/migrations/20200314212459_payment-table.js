
exports.up = function(knex) {
  return knex.schema.createTable('payments', function(t) {
    t.increments('id').unsigned().primary();
    t.bigInteger('order_id').unsigned().index().references('id').inTable('orders');
    t.decimal('amount', 16, 4);
    t.string('payment_method');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('payments');
};

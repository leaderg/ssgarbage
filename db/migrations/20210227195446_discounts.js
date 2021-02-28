
exports.up = function(knex) {
  return knex.schema.createTable('discounts', function(t) {
    t.increments('id').unsigned().primary();
    t.bigInteger('discount_trigger_id').unsigned().index().references('id').inTable('discount_triggers');
    t.bigInteger('order_id').unsigned().index().references('id').inTable('orders');
    t.integer('total').defaultTo(0);
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('discounts');
};

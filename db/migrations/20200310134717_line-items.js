
exports.up = function(knex) {
  return knex.schema.createTable('line_items', function(t) {
    t.increments('id').unsigned().primary();
    t.bigInteger('order_id').unsigned().index().references('id').inTable('orders');
    t.bigInteger('product_id').unsigned().index().references('id').inTable('products');
    t.integer('quantity').defaultTo(0);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('line_items');
};

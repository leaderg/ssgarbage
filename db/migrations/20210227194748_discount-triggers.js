
exports.up = function(knex) {
  return knex.schema.createTable('discount_triggers', function(t) {
    t.increments('id').unsigned().primary();
    t.bigInteger('product_id').unsigned().index().references('id').inTable('products');
    t.boolean('is_percent')
    t.decimal('amount', 16, 4).defaultTo(0);
    t.decimal('value', 16, 4).defaultTo(0);
    t.timestamp('start_date')
    t.timestamp('end_date')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('discount_triggers');
};

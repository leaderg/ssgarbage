
exports.up = function(knex) {
  return knex.schema.createTable('products', function(t) {
        t.increments('id').unsigned().primary();
        t.string('name').notNull();
        t.string('sku').nullable();
        t.decimal('price', 16, 4).notNull(); // In Cents
        t.boolean('taxed').defaultTo(false);
        t.decimal('tax_percent', 16, 4).nullable(); // 0 - 100
        t.boolean('loyalty_applied').defaultTo(false);
        t.bigInteger('category_id').unsigned().index().references('id').inTable('categories');
        t.boolean('hidden').defaultTo(false);
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable('products');
};
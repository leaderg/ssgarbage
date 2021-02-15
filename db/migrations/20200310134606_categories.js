
exports.up = function(knex) {
  return knex.schema.createTable('categories', function(t) {
        t.increments('id').unsigned().primary();
        t.string('name').notNull();
        t.boolean('hidden').defaultTo(false);
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable('categories');
};

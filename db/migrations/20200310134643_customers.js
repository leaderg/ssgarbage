
exports.up = function(knex) {
  return knex.schema.createTable('customers', function(t) {
    t.increments('id').unsigned().primary();
    t.string('name').notNull();
    t.string('email').nullable();
    t.string('phone_number').nullable();
    t.text('comments', 'text').nullable();
    t.integer('loyalty_count').defaultTo(0);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('customers');
};
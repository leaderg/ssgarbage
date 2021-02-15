
exports.up = function(knex) {
  return knex.schema.createTable('employees', function(t) {
        t.increments('id').unsigned().primary();
        t.string('first_name').notNull();
        t.string('last_name').nullable();
        t.string('phone_number').nullable();
        t.string('email').nullable();
        t.string('username').notNull();
        t.string('password').notNull();
        t.boolean('admin_access').defaultTo(false);
        t.boolean('dashboard_access').defaultTo(false);
        t.boolean('site_access').defaultTo(true);
        t.boolean('hidden').defaultTo(false);
        t.boolean('secret').defaultTo(false);
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable('employees');
};

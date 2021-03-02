
exports.up = function(knex) {
    return knex.schema.createTable('notes', function(t) {
    t.increments('id').unsigned().primary();
    t.text('note')
    t.timestamp('date')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('notes');
};

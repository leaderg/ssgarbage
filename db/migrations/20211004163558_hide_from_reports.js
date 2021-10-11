
exports.up = function(knex) {
    return knex.schema.table('products', function(table) {
    table.boolean('hide_tab').defaultTo(false);
  })
};

exports.down = function(knex) {
  return knex.schema.table('products', function(table) {
    table.dropColumn('hide_tab');
  })
};

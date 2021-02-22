
exports.up = function(knex) {
  return knex.schema.table('orders', function(table) {
    table.string('scale_reference');
  })
};

exports.down = function(knex) {
  return knex.schema.table('orders', function(table) {
    table.dropColumn('scale_reference');
  })
};

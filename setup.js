const config = require('./src/config');
const knex = require('knex')(config.get('db'));

const setup = () => {
  let tablesToCreate = [];
  const hasCrawls = await knex.schema.hasTable('crawls');
  const hasLocation = await knex.schema.hasTable('location');
 
  if(!hasCrawls) {
    tablesToCreate.push(
      knex.schema.createTable('crawls', t => {
        t.dateTime('start').primary();
        t.dateTime('end');
        t.json('nodes');
        t.json('connections');
        t.integer('nodes_count');
        t.integer('connections_count');
      })
    )
  }

  if(!hasLocation) {
    tablesToCreate.push(
      knex.schema.createTable('location', t => {
        t.string('pubkey').primary();
        t.string('ip');
        t.decimal('lat');
        t.decimal('long');
        t.string('continent');
        t.string('country');
        t.string('region');
        t.string('city');
        t.string('postal_code');
        t.string('region_code');
        t.string('country_code');
        t.string('timezone');
        t.string('isp');
        t.string('org');
        t.string('domain');
        t.string('location_source');
        t.dateTime('updated');
      })
    )
  }
  return Promise.all(tablesToCreate)
}

const teardown = () => {
  return knex.schema
  .dropTableIfExists('crawls')
  .dropTableIfExists('location')
};


if(config.get('reset_db')) {
  teardown()
  .then(setup)
  .then(() => {
    console.log('done');
    process.exit(0);
  })
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
} else {
  setup()
  .then(() => {
  console.log('done');
  process.exit(0);
  })
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
}


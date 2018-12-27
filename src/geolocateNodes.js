const config = require('./config');
const axios = require('axios');
const moment = require('moment');
const db = require('knex')(config.get('db'));
const log = require('./logger');

const getNodes = () => {
  return  db('crawls')
  .select('nodes')
  .orderBy('start', 'desc')
  .limit(1)
  .then(resp => resp[0] ? resp[0].nodes : [])
  .then(nodes => nodes.filter(n => (/\./).test(n.host)));
};

const upsert = async data => {
  const existing = await db('location').where({ pubkey: data.pubkey });

  return existing.length ?
    db('location').where({ pubkey: data.pubkey }).update(data) :
    db('location').insert(data);
};

const updateFromMaxmind = node => {
  const maxmind = config.get('maxmind');

  const url = `https://'${maxmind.user}:${maxmind.key}@geoip.maxmind.com/geoip/v2.1/city/`;

  return axios.get(`${url}${node.host}`)
  .then(resp => {

    const subdivision = resp.subdivisions ?
          resp.subdivisions[resp.subdivisions.length - 1] : undefined;
    const city = resp.city ?
          resp.city.names.en : undefined;
    const postal_code = resp.postal ?
          resp.postal.code : undefined;
    const region = subdivision ?
          subdivision.names.en : undefined;
    const region_code = subdivision ?
          subdivision.iso_code : undefined;
    const country = resp.country ?
          resp.country.names.en : undefined;
    const country_code = resp.country ?
          resp.country.iso_code : undefined;
    const continent = resp.continent ?
          resp.continent.names.en : undefined;

    log.info(node.pubkey_node.magenta,
             node.host.grey,
             (city || '').blue,
             (region || '').cyan,
             (country || '').cyan.dim);

    return upsert({
      pubkey: node.pubkey_node,
      ip: node.host,
      updated: moment.utc(),
      lat: resp.location.latitude,
      long: resp.location.longitude,
      continent: continent,
      country: country,
      region: region,
      city: city,
      postal_code: postal_code,
      country_code: country_code,
      region_code: region_code,
      timezone: resp.location.time_zone,
      isp: resp.traits.isp,
      org: resp.traits.organization,
      domain: resp.traits.domain,
      location_source: 'maxmind'
    });
  });
};

const updateGeolocation = node => {
  const url = `http://api.petabyet.com/geoip/${node.host}`;

  return axios.get(url)
  .then(resp => resp.data)
  .then(resp => {
    log.info(node.pubkey_node.magenta,
             node.host.grey,
             (resp.city || '').blue,
             (resp.region || '').cyan,
             (resp.country || '').cyan.dim);

    return upsert({
      pubkey: node.pubkey_node,
      ip: node.host,
      updated: moment.utc(),
      lat: resp.latitude,
      long: resp.longitude,
      country: resp.country,
      region: resp.region,
      city: resp.city,
      postal_code: resp.postal_code,
      country_code: resp.country_code,
      region_code: resp.region_code,
      timezone: resp.timezone,
      isp: resp.isp,
      location_source: 'petabyet'
    });
  });
};


module.exports = () => {
  log.info('starting geolocation...'.yellow);
  return getNodes()
  .then(nodes => {
    log.info('found', nodes.length.toString().underline,
            'nodes with IP');

    const index = 0;
    const next = () => {
      const node = nodes.pop();
      let query;

      if (node) {
        query = config.maxmind ? updateFromMaxmind(node) : updateGeolocation(node);
        return query.then(() => {
          return next();
        });
      }
    };

    return next();
  })
  .then(() => {
    log.info('geolocation complete');
  });
};

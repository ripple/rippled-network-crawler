const config = require('./config');
const axios = require('axios');
const Hbase = require('ripple-hbase-client');
const hbase = new Hbase(config.get('hbase'));
const log = require('./logger');

const getNodes = () => {
  return hbase.getScan({
    table: 'node_state',
    startRow: ' ',
    stopRow: '~~'
  })
  .then(resp => resp.rows.map(d => d.columns))
}

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

    const columns = {
      'f:lat': resp.location.latitude,
      'f:long': resp.location.longitude,
      'f:continent': continent,
      'f:country': country,
      'f:region': region,
      'f:city': city,
      'f:postal_code': postal_code,
      'f:country_code': country_code,
      'f:region_code': region_code,
      'f:timezone': resp.location.time_zone,
      'f:isp': resp.traits.isp,
      'f:org': resp.traits.organization,
      'f:domain': resp.traits.domain,
      'f:location_source': 'maxmind'
    };

    return hbase.putRow({
      table: 'node_state',
      rowkey: node.pubkey_node,
      columns,
      removeEmptyColumns: true
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

    const columns = {
      'f:lat': resp.latitude,
      'f:long': resp.longitude,
      'f:country': resp.country,
      'f:region': resp.region,
      'f:city': resp.city,
      'f:postal_code': resp.postal_code,
      'f:country_code': resp.country_code,
      'f:region_code': resp.region_code,
      'f:timezone': resp.timezone,
      'f:isp': resp.isp,
      'f:location_source': 'petabyet'
    }

    return hbase.putRow({
      table: 'node_state',
      rowkey: node.pubkey_node,
      columns,
      removeEmptyColumns: true
    });
  });
};


module.exports = (all = false) => {
  log.info('starting geolocation...'.yellow);
  return getNodes()
  .then(nodes => {
    const list = nodes
      .filter(n => (/\./).test(n.host))
      .filter(n => all || n.location_source === undefined)

    log.info('found', list.length.toString().underline,
            'nodes with IP');

    const index = 0;
    const next = () => {
      const node = list.pop();
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
    log.info('geolocation complete'.green);
  });
};
var _ = require('lodash');
var fs = require('fs');
var geoip = require('geoip-lite');
var crawler = require('../src/crawler.js');
var normalizeIpp = crawler.normalizeIpp;
var normalizePubKey = crawler.normalizePubKey;

var rawCrawl = require('../' + process.argv.slice(2)[0]);

function graphify(rawCrawl) {

  var out = {nodes: [], links: [], iplinks: []}

  // storage
  var nodes = []
  var links = {}
  var indices = {}

  // Collect all unique nodes and save their indices
  for (var ipp in rawCrawl.data) {
    indices[ipp] = nodes.length
    if (nodes.length == 0) {
      nodes.push({ipp: ipp, connections: 0, entry: 1})
    } else {
      nodes.push({ipp: ipp, connections: 0, entry: 0})
    }
  }

  // For each unique node
  for(i in nodes) {
    node = nodes[i];
    ipp = node.ipp;
    peers = rawCrawl.data[ipp].overlay.active;

    // For each (not necessarily unique) peer
    for (p_index in peers) {
      peer = peers[p_index];

      // Get ipp
      try {
        peer_ipp = normalizeIpp(peer.ip, peer.port);
      } catch (err) {
        peer_ipp = undefined;
      }
      peer_i = indices[peer_ipp];

      // If it has an ipp
      if (peer_ipp && peer_i !== undefined) {
        peer_pk = normalizePubKey(peer.public_key);
        peer_v = peer.version;
        peer_t = peer.type;

        // Add missing properties in node list
        peer_node = nodes[peer_i];

        //console.error(peer_ipp)
        if (!peer_node.pk) {
          peer_node.pk = peer_pk
        }
        if (!peer_node.v) {
          peer_node.v = peer_v
        }
        if (!peer_node.loc) {
          geoloc = geoip.lookup(peer_ipp.split(':')[0])
          peer_node.loc = geoloc.country + '_' + geoloc.city
        }

        // Make link
        var link = undefined
        if (peer_t) {
          // Get link
          if (peer_t == "in") {
            link = [i, peer_i]
          }
          else if (peer_t == "out") {
            link = [peer_i, i]
          }
          else if (peer_t == "peer") {
            if (peer.ip) {
              if (peer.ip.split(":").length == 2)
                link = [peer_i, i]
              else
                link = [i, peer_i]
            }
          }

          if (link) {
            links[link] = 1
          }
        }

        //

      } else {
        // No ip address, can't really do much
      }

    }

  }

  // Ready to write to out

  // links
  for (link in links) {
    var st = link.split(','),
        s = parseInt(st[0]),
        t = parseInt(st[1])

    out.links.push({source: s, target: t, value: links[link]});
    out.iplinks.push({source: nodes[s].ipp, target: nodes[t].ipp, value: links[link]});
    nodes[s].connections += 1;
    //nodes[t].connections += 1;
  }

  // nodes
  out.nodes = nodes

  return out
}

console.log(JSON.stringify(graphify(rawCrawl), null, 4))
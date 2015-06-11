DEFAULT_PORT = 51235

function get_ipp(ip, port) {
  if (ip) {
    var split = ip.split(':'),
        splitIp = split[0],
        splitPort = split[1];

    out_ip = splitIp
    out_port = port || splitPort || DEFAULT_PORT
    ipp = out_ip + ':' + out_port
  }

  return ipp
}

// Should all return true

// With ip:port
console.log(get_ipp('23.239.3.247:51235', undefined) == '23.239.3.247:51235')
// With ip
console.log(get_ipp('23.239.3.247', undefined) == '23.239.3.247:51235')
// With ip and port
console.log(get_ipp('23.239.3.247', '51235') == '23.239.3.247:51235')
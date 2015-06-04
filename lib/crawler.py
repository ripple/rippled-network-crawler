from abc import ABCMeta, abstractmethod
import ast
from datetime import datetime
import requests

# Disable HTTPS verification warnings. (NOTE: make option later)
requests.packages.urllib3.disable_warnings()

class Crawler():
  __metaclass__ = ABCMeta

  def __init__(self):
    self.ips = []
    self.public_keys = []

  @abstractmethod
  def process_node(self, node, hops):
    pass

  def crawl(self, ip_address, port, hops=0):
    r = requests.get('https://{0}:{1}/crawl'.format(ip_address, port), verify=False)
    if r.status_code == 200:
      data = ast.literal_eval(r.text)
      for peer in data['overlay']['active']:
        # Process new nodes
        if peer['public_key'] not in self.public_keys:
          self.public_keys.append(peer['public_key'])
          #Since we hit /crawl on outdated rippleds, 
          #we need to process a node everytime we see one
          #to guarantee we collect all relevant info.
          # self.process_node(peer, hops+1)
        self.process_node(peer, hops+1)

        # Get peers of nodes with ip address and port
        if 'ip' in peer and peer['ip'] not in self.ips
          # For some nodes the port is in the ip
          # address contains port also if it's in the ip
          address = peer['ip'].split(":")
          ip = address[0]
          # store unique ips
          self.ips.append(ip)

          if len(address) == 1: # ip doesn't have port
            if 'port' in peer:
              self.crawl(ip, peer['port'], hops+1)
            elif:
              # use starting nodes port as default
              self.crawl(ip, port, hops+1)
          elif len(address) == 2: # ip has port
            self.crawl(ip, address[1], hops+1)
          else 
            print "unexpected value in ip address"

          
    else:
      print r

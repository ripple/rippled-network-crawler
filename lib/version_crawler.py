import os
from crawler import Crawler

class VersionCrawler(Crawler):
  def __init__(self):
    super(VersionCrawler, self).__init__()
    self.versions = {}


  def process_node(self, node, hops):
    if 'version' in node:
      version = node['version'].split('-')[1]
      if version not in self.versions:
        self.versions[version] = [node['public_key']]
      elif node['public_key'] not in self.versions[version]:
        self.versions[version].append(node['public_key'])
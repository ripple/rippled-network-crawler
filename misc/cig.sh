node misc/crawl.js $1 --r > misc/crawls/tmp/$2_crawl.json
echo "Created misc/crawls/tmp/"$2"_crawl.json"
node misc/info.js misc/crawls/tmp/$2_crawl.json > misc/crawls/tmp/$2_info.json
echo "Created misc/crawls/tmp/"$2"_info.json"
node misc/graphify.js misc/crawls/tmp/$2_crawl.json --r > misc/crawls/tmp/graph.json
echo "Created misc/crawls/tmp/graph.json"
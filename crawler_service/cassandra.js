const cassandra = require('cassandra-driver');

ip = "127.0.0.1"
ks1 = "sites"

const client = new cassandra.Client({
  contactPoints: [ip],
  localDataCenter: 'datacenter1',
  keyspace: ks1
});

client.connect(function(err){
    if(err)
      console.log("\nUnable to connect to cassandra.\n" + err);
    else
    {
        console.log("successful connection");
        console.log('Connected to cluster with %d host(s): %j', client.hosts.length, client.hosts.keys());
    }
  });

  module.exports = client
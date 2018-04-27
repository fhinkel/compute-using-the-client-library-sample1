'use strict';

// [START compute_engine_quickstart]
// Imports the Google Cloud client library
const Compute = require('@google-cloud/compute');
const http = require('http');

// Creates a client
const compute = new Compute();

// Create a new VM using the latest OS image of your choice.
const zone = compute.zone('us-central1-a');
const name = 'ubuntu-http' + Math.floor(Math.random() * 100);

const config = {
  os: 'ubuntu',
  http: true,
  metadata: {
    items: [
      {
       key: "startup-script",
       value: "#! /bin/bash\n\n# Installs apache and a custom homepage\napt-get update\napt-get install -y apache2\ncat <<EOF > /var/www/html/index.html\n<html><body><h1>Hello World</h1>\n<p>This page was created from a simple start up script!</p>\n</body></html>"
      }
    ]
  }
}


zone
  .createVM(name, config)
  .then(data => {
    // `operation` lets you check the status of long-running tasks.
    const vm = data[0];
    const operation = data[1];
    const apiResponse = data[2];

    operation.on('complete', metadata => {
      vm.getMetadata().then(data => {
        const metadata = data[0];
        const ip = metadata['networkInterfaces'][0]['accessConfigs'][0]['natIP'];
        console.log(name + ' created, running at ' + ip);
        console.log('Waiting for startup...')

        const runPings = setInterval( (ip) => {
          http.get(ip, res => {
            const {statusCode} = res
            if (statusCode === 200) {
              clearTimeout(runPings);
              console.log("Ready!");
            }
       
          }).on('error', () => process.stdout.write("."))
        }, 500, 'http://' + ip) 
      })
      .catch(err => console.log(err))
    })
  })
  .catch(err => console.error('ERROR:', err))

 
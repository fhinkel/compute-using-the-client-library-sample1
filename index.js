'use strict';

// [START compute_engine_quickstart]
// Imports the Google Cloud client library
const Compute = require('@google-cloud/compute');

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
    return operation.promise();
  })
  .then(() => {
    // Virtual machine created!
  })
  .catch(err => {
    console.error('ERROR:', err);
  });
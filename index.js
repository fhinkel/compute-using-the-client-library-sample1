'use strict';

const Compute = require('@google-cloud/compute');
const http = require('http');

const compute = new Compute();

// Create a new VM using the latest OS ubuntu image.
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

// Create a new VM, using default ubuntu image. The startup script
// installs apache and a custom homepage.
zone
  .createVM(name, config)
  .then(data => {
    const vm = data[0];
    const operation = data[1];

    operation.on('complete', metadata => {
      vm.getMetadata().then(data => {
        const metadata = data[0];
        const ip = metadata['networkInterfaces'][0]['accessConfigs'][0]['natIP'];
        console.log(name + ' created, running at ' + ip);
        console.log('Waiting for startup...')

        const timer = setInterval(ip => {
          http.get(ip, res => {
            const { statusCode } = res
            if (statusCode === 200) {
              clearTimeout(timer);
              console.log("Ready!");
            }

          }).on('error', () => process.stdout.write("."))
        }, 2000, 'http://' + ip)
      })
        .catch(err => console.error(err))
    })
  })
  .catch(err => console.error(err))

// List all VMs in that zone. 
zone.getVMs()
  .then(data => {
    const vms = data[0];
    vms.forEach(vm => {
      vm.getMetadata().then(data => {
        const ip = data[0]['networkInterfaces'][0]['accessConfigs'][0]['natIP'];
        console.log(vm.name + ": " + ip)
      }).catch(err => console.error(err))
    })
  })
  .catch(err => console.error(err))
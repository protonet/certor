

import { assert } from 'chai';
//import { describe, it } from 'mocha';


import * as Uuid from 'node-uuid'

import DepotsIpRanges from '../src/depots_id_ipranges'

// import EtcdDaemon from './etcd_daemon'

import * as config from '../src/certor_config'


// grep.on('close', (code, signal) => {
//   console.log(
//     `child process terminated due to receipt of signal ${signal}`);
// });
// // Send SIGHUP to process
// grep.kill('SIGHUP');


function param(arr: string[], uuid: string) : string[] {
  return arr.concat(['--etcd-cluster-id', uuid, '--etcd-url', "http://localhost:2379"])
}

// function mochaAsync(fn : () => void ) : (done:any) => void {
//     return async (done: () => void) : Promise<any> => {
//         try {
//             await fn();
//             done();
//         } catch (err) {
//             done();
//         }
//         return Promise.resolve()
//     };
// };

describe("depots-ip-ranges", () => {
  // let etcd : EtcdDaemon
  before(() => {
    // etcd = EtcdDaemon.start()
  })
  after(async () => {
    // await etcd.kill() 
  })
  it("list", async () => {
    let uuid = Uuid.v4().toString();
    let df = new DepotsIpRanges();
    let wc = config.Certor.create(param([], uuid))
    let etcd = await wc.etcd();
    assert.deepEqual([], await df.start(param(['list'], uuid), etcd), "empty list")
    assert.deepEqual(['meno'], await df.start(param(['--depot-id', 'dmeno', 'add', 'meno'], uuid), etcd), "add 1 Error")
    assert.deepEqual(['murks'], await df.start(param(['--depot-id', 'dmurks', 'add', 'murks'], uuid), etcd), "add 2 Error")
    assert.deepEqual(['meno', 'murks'], (await df.start(param(['--depot-id', 'dmurks', 'add', 'meno'], uuid), etcd)).sort(), "add 3 Error")
    assert.deepEqual(['dmeno.ipranges', 'dmurks.ipranges'], (await df.start(param(['list'], uuid), etcd)).sort(), "long list")
  })
})

//node dist/server.js  domain-filter --etcd-url "https://etcd-1.adviser.com:2381"
//--client-ca cafile --client-cert ../../certs/cetcd.adviser.com/cert.pem
//--client-key ../../certs/cetcd.adviser.com/privkey.pem  --etcd-url
//"https://etcd-2.adviser.com:2381" --etcd-url "https://etcd-3.adviser.com:2381"
//add meno

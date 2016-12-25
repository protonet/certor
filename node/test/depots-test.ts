

import { assert } from 'chai';
//import { describe, it } from 'mocha';


import * as Uuid from 'node-uuid'

import Depots from '../src/depots'

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

describe("depots", () => {
  it("delete", async () => {
    let uuid = Uuid.v4().toString();
    let df = new Depots();
    let wc = config.Certor.create(param([], uuid))
    let etcd = await wc.etcd();
    assert.deepEqual([], await df.start(param(['list'], uuid), etcd), "empty list")
    assert.deepEqual(['meno'], await df.start(param(['iprange', 'dmeno', 'add', 'meno'], uuid), etcd), "add 1 Error")
    assert.deepEqual(['murks'], await df.start(param(['iprange', 'dmurks', 'add', 'murks'], uuid), etcd), "add 2 Error")
    assert.deepEqual(['dmeno', 'dmurks'], (await df.start(param(['list'], uuid), etcd)).sort(), "add 3 Error")
    assert.deepEqual(['dmurks'], await df.start(param(['delete', 'dmeno'], uuid), etcd), "long list")
    assert.deepEqual(['dmurks'], (await df.start(param(['list'], uuid), etcd)).sort(), "add 3 Error")
  })
  it("last_active", async () => {
      let uuid = Uuid.v4().toString();
      let df = new Depots();
      let wc = config.Certor.create(param([], uuid))
      let etcd = await wc.etcd();
      assert.equal(null, await df.start(param(['last_active', "matsch", "get"], uuid), etcd), "empty -1 list")
      let now = new Date()
      assert.equal(now.toString(), (await df.start(param(['last_active', "matsch", "update", "--date", 
        now.toString()], uuid), etcd)).toString(), "empty -2 list")
      now = await df.start(param(['last_active', "matsch", "update"], uuid), etcd)
      let get = await df.start(param(['last_active', "matsch", "get"], uuid), etcd)
      assert.equal(now.toString(), get.toString(), "really now")
  })

  it("list", async () => {
    let uuid = Uuid.v4().toString();
    let df = new Depots();
    let wc = config.Certor.create(param([], uuid))
    let etcd = await wc.etcd();
    assert.deepEqual([], await df.start(param(['list'], uuid), etcd), "empty list")
    await df.start(param(['last_active', "wurst", "update"], uuid), etcd)
    assert.deepEqual(['wurst'], await df.start(param(['list'], uuid), etcd), "wurst list")
  })

  it("iprange", async () => {
    let uuid = Uuid.v4().toString();
    let df = new Depots();
    let wc = config.Certor.create(param([], uuid))
    let etcd = await wc.etcd();
    assert.deepEqual([], await df.start(param(['iprange', 'jung', 'list'], uuid), etcd), "empty -1 list")
    assert.deepEqual(['meno'], await df.start(param(['iprange', 'jung', 'add', 'meno'], uuid), etcd), "empty -2 list")
    assert.deepEqual(['jung'], await df.start(param(['list'], uuid), etcd), "empty -3 list")
  })
})


//node dist/server.js  domain-filter --etcd-url "https://etcd-1.adviser.com:2381"
//--client-ca cafile --client-cert ../../certs/cetcd.adviser.com/cert.pem
//--client-key ../../certs/cetcd.adviser.com/privkey.pem  --etcd-url
//"https://etcd-2.adviser.com:2381" --etcd-url "https://etcd-3.adviser.com:2381"
//add meno

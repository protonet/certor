

import { assert } from 'chai';
//import { describe, it } from 'mocha';


import * as Uuid from 'node-uuid'

import DepotsIps from '../src/depots_ips'
import DepotsCreators from '../src/depots_creators'

// import EtcdDaemon from 'promise-etcd_daemon'

import * as config from '../src/certor_config'

import * as ipaddress from 'ipaddress'
import * as ipranges from '../src/ipranges'


// grep.on('close', (code, signal) => {
//   console.log(
//     `child process terminated due to receipt of signal ${signal}`);
// });
// // Send SIGHUP to process
// grep.kill('SIGHUP');


function param(arr: string[], uuid: string): string[] {
  return arr.concat(['--etcd-cluster-id', uuid, '--etcd-url', "http://localhost:2379"])
}

// function toS(ip: ipranges.IpRange[]) : string[] {
//   return ip.map((ipa) => ipa.toString())
// }

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

describe("depots-ips", () => {
  // it("list", async () => {
  //   let uuid = Uuid.v4().toString();
  //   let df = new DepotsIps();
  //   let wc = config.Certor.create(param([], uuid))
  //   let etcd = await wc.etcd();
  //   assert.deepEqual([], await df.start(param(['list'], uuid), etcd), "empty list")

  //   assert.deepEqual(['meno.top'], toS(await df.start(param(['iprange', 'dmeno', 'add', '192.168.0.1', 
  //     '--creator', 'CN=meno'], uuid), etcd)), "add 1 Error")
  //   assert.deepEqual(['192.168.0.2/32'], toS(await df.start(param(['iprange', 'dmurks', 'add', '192.168.0.2', 
  //     '--creator', 'CN=meno'], uuid), etcd)), "add 2 Error")
  //   assert.deepEqual(['dmeno', 'dmurks'], (await df.start(param(['list'], uuid), etcd)).sort(), "add 3 Error")
  //   assert.deepEqual(['dmurks'], await df.start(param(['delete', 'dmeno', '--creator', 'CN=meno'], uuid), etcd), "long list")
  //   assert.deepEqual(['dmurks'], (await df.start(param(['list'], uuid), etcd)).sort(), "add 3 Error")
  // })
  // it("add", async () => {
  //   let uuid = Uuid.v4().toString();
  //   let df = new Depots();
  //   let wc = config.Certor.create(param([], uuid))
  //   let etcd = await wc.etcd();
  //   assert.equal(null, await df.start(param(['last_active', "matsch", "get"], uuid), etcd), "empty -1 list")
  //   let dc = new DepotsCreators()
  //   await dc.start(param(['add', 'CN=meno'], uuid), etcd)
  //   let now = new Date()
  //   assert.equal(now.toString(), (await df.start(param(['last_active', "matsch", "update", "--date",
  //     now.toString(), '--creator', "CN=meno"], uuid), etcd)).toString(), "empty -2 list")
  //   now = await df.start(param(['last_active', "matsch", "update", '--creator', "CN=meno"], uuid), etcd)
  //   let get = await df.start(param(['last_active', "matsch", "get"], uuid), etcd)
  //   assert.equal(now.toString(), get.toString(), "really now")
  // })

  // it("del", async () => {
  //   let uuid = Uuid.v4().toString();
  //   let df = new Depots();
  //   let wc = config.Certor.create(param([], uuid))
  //   let etcd = await wc.etcd();
  //   assert.deepEqual([], await df.start(param(['list'], uuid), etcd), "empty list")
  //   let dc = new DepotsCreators()
  //   await dc.start(param(['add', 'CN=meno'], uuid), etcd)
  //   await df.start(param(['last_active', "wurst", "update", '--creator', "CN=meno"], uuid), etcd)
  //   assert.deepEqual(['wurst'], await df.start(param(['list'], uuid), etcd), "wurst list")
  // })

  // it("iprange", async () => {
  //   let uuid = Uuid.v4().toString();
  //   let df = new Depots();
  //   let wc = config.Certor.create(param([], uuid))
  //   let etcd = await wc.etcd();
  //   assert.deepEqual([], await df.start(param(['iprange', 'jung', 'list'], uuid), etcd), "empty -1 list")
  //   let dc = new DepotsCreators()
  //   await dc.start(param(['add', 'CN=meno'], uuid), etcd)
  //   assert.deepEqual(['192.168.2.1/32'], toS(await df.start(param(['iprange', 'jung', 'add', '192.168.2.1', 
  //     '--creator', "CN=meno"], uuid), etcd)), "empty -2 list")
  //   assert.deepEqual(['jung'], await df.start(param(['list'], uuid), etcd), "empty -3 list")
  // })
})




//node dist/server.js  domain-filter --etcd-url "https://etcd-1.adviser.com:2381"
//--client-ca cafile --client-cert ../../certs/cetcd.adviser.com/cert.pem
//--client-key ../../certs/cetcd.adviser.com/privkey.pem  --etcd-url
//"https://etcd-2.adviser.com:2381" --etcd-url "https://etcd-3.adviser.com:2381"
//add meno

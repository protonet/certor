
import { assert } from 'chai';
//import { describe, it } from 'mocha';

import * as cp from 'child_process'
import * as fs from 'fs'

import * as Uuid from 'node-uuid'

import DomainFilter from '../src/domain_filter'
import * as config from '../src/certor_config'

// grep.on('close', (code, signal) => {
//   console.log(
//     `child process terminated due to receipt of signal ${signal}`);
// });
// // Send SIGHUP to process
// grep.kill('SIGHUP');

class EtcdDaemon {
  etcd: cp.ChildProcess
  etcdir: string
  public kill() {
    this.etcd.kill('SIGTERM')
    console.log("KILL:", this.etcdir)
    cp.spawn("rm", ["-r", this.etcdir])
  }
  public static start() : EtcdDaemon {
    let ret = new EtcdDaemon();
    ret.etcdir = fs.mkdtempSync("certor-test-")
    console.log("CREATED:", ret.etcdir)
    ret.etcd = cp.spawn('etcd', ['--data-dir', ret.etcdir])
    ret.etcd.on('error', (err) => {
      assert.fail("can't spawn etcd")
    });
    ret.etcd.stdin.on('data', (res: string) => {
      // console.log(">>"+res+"<<")
    })
    ret.etcd.stderr.on('data', (res: string) => {
      // console.log(">>"+res+"<<")
    })
    // WAIT FOR started
    return ret;
  }
}

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

describe("domain-filter", () => {
  let etcd : EtcdDaemon
  before(() => {
    etcd = EtcdDaemon.start()
  })
  after(() => {
    etcd.kill() 
  })
  it("get", async () => {
    let uuid = Uuid.v4().toString();
    let df = new DomainFilter();
    let wc = config.Certor.create(param([], uuid))
    let etcd = await wc.etcd();
    assert.deepEqual([], await df.start(param(['get'], uuid), etcd))
    assert.deepEqual(['meno'], await df.start(param(['add', 'meno'], uuid), etcd), "add Error")
    assert.deepEqual(['meno'], await df.start(param(['get'], uuid), etcd), "get Error")
  })
  it("add", async () => {
    let uuid = Uuid.v4().toString();
    let df = new DomainFilter();
    let wc = config.Certor.create(param([], uuid))
    let etcd = await wc.etcd();
    assert.deepEqual(['meno'], await df.start(param(['add', 'meno'], uuid), etcd), "first add Error")
    assert.deepEqual(['meno'], await df.start(param(['add', 'meno'], uuid), etcd), "second add Error")
    assert.deepEqual(['meno', 'murk'], (await df.start(param(['add', 'murk'], uuid), etcd)).sort(), "murk add Error")
    assert.deepEqual(['meno', 'murk'], (await df.start(param(['get'], uuid), etcd)).sort(), "get-x Error")
  })

   it("del", async () => {
    let uuid = Uuid.v4().toString();
    let df = new DomainFilter();
    let wc = config.Certor.create(param([], uuid))
    let etcd = await wc.etcd();
    assert.deepEqual(['meno'], await df.start(param(['add', 'meno'], uuid), etcd), "first add Error")
    assert.deepEqual(['meno', 'murk'], (await df.start(param(['add', 'murk'], uuid), etcd)).sort(), "murk add Error")
    assert.deepEqual(['murk'], (await df.start(param(['del', 'meno'], uuid), etcd)).sort(), "get Error")
    assert.deepEqual([], (await df.start(param(['del', 'murk'], uuid), etcd)).sort(), "get Error")
    assert.deepEqual([], await df.start(param(['get'], uuid), etcd))
  })
})

//node dist/server.js  domain-filter --etcd-url "https://etcd-1.adviser.com:2381"
//--client-ca cafile --client-cert ../../certs/cetcd.adviser.com/cert.pem
//--client-key ../../certs/cetcd.adviser.com/privkey.pem  --etcd-url
//"https://etcd-2.adviser.com:2381" --etcd-url "https://etcd-3.adviser.com:2381"
//add meno

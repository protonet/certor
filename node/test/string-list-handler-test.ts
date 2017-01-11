
import { assert } from 'chai';
//import { describe, it } from 'mocha';

import * as Uuid from 'node-uuid'

import StringListHandler from '../src/string_list_handler'
import * as config from '../src/certor_config'

// import EtcdDaemon from 'promise-etcd_daemon'

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

describe("StringListHandler", () => {
  // let etcd : EtcdDaemon
  before(() => {
    // etcd = EtcdDaemon.start()
  })
  after(() => {
    // await etcd.kill() 
  })
  it("get", async () => {
    let uuid = Uuid.v4().toString();
    let df = new StringListHandler("slh");
    let wc = config.Certor.create(param([], uuid))
    let etcd = await wc.etcd();
    // console.log(uuid)
    assert.deepEqual([], (await df.start(param(['get'], uuid), etcd)).ok.asJson(), "get empty")
    assert.deepEqual(['meno'], (await df.start(param(['add', 'meno'], uuid), etcd)).ok.asJson(), "add Error")
    assert.deepEqual(['meno'], (await df.start(param(['get'], uuid), etcd)).ok.asJson(), "get Error")
  })
  it("add", async () => {
    let uuid = Uuid.v4().toString();
    let df = new StringListHandler("slh");
    let wc = config.Certor.create(param([], uuid))
    let etcd = await wc.etcd();
    assert.deepEqual(['meno'], (await df.start(param(['add', 'meno'], uuid), etcd)).ok.asJson(), "first add Error")
    assert.deepEqual(['meno'], (await df.start(param(['add', 'meno'], uuid), etcd)).ok.asJson(), "second add Error")
    assert.deepEqual(['meno', 'murk'], (await df.start(param(['add', 'murk'], uuid), etcd)).ok.asJson(), "murk add Error")
    assert.deepEqual(['meno', 'murk'], (await df.start(param(['get'], uuid), etcd)).ok.asJson(), "get-x Error")
  })

   it("del", async () => {
    let uuid = Uuid.v4().toString();
    let df = new StringListHandler("slh");
    let wc = config.Certor.create(param([], uuid))
    let etcd = await wc.etcd();
    assert.deepEqual(['meno'], (await df.start(param(['add', 'meno'], uuid), etcd)).ok.asJson(), "first add Error")
    assert.deepEqual(['meno', 'murk'], (await df.start(param(['add', 'murk'], uuid), etcd)).ok.asJson().sort(), "murk add Error")
    assert.deepEqual(['murk'], (await df.start(param(['del', 'meno'], uuid), etcd)).ok.asJson(), "get Error")
    assert.deepEqual([], (await df.start(param(['del', 'murk'], uuid), etcd)).ok.asJson().sort(), "get Error")
    assert.deepEqual([], (await df.start(param(['get'], uuid), etcd)).ok.asJson())
  })
})

//node dist/server.js  domain-filter --etcd-url "https://etcd-1.adviser.com:2381"
//--client-ca cafile --client-cert ../../certs/cetcd.adviser.com/cert.pem
//--client-key ../../certs/cetcd.adviser.com/privkey.pem  --etcd-url
//"https://etcd-2.adviser.com:2381" --etcd-url "https://etcd-3.adviser.com:2381"
//add meno

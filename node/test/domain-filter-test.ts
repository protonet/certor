

import { assert } from 'chai';
//import { describe, it } from 'mocha';

import * as Uuid from 'node-uuid'

import DomainFilterList from '../src/domains_filter'
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

describe("DomainFilterList", () => {
  // let etcd : EtcdDaemon
  before(() => {
    // etcd = EtcdDaemon.start()
  })
  after(() => {
    // await etcd.kill() 
  })
  it("get", async () => {
    let uuid = Uuid.v4().toString();
    let df = new DomainFilterList()
    let wc = config.Certor.create(param([], uuid))
    let etcd = await wc.etcd();
    // console.log(uuid)
    assert.deepEqual([], (await df.start(param(['get'], uuid), etcd)).ok.asJson(), "get empty")
    assert.deepEqual(['meno'], (await df.start(param(['add', 'meno'], uuid), etcd)).ok.asJson(), "add Error")
    assert.deepEqual(true, (await df.start(param(['add', ''], uuid), etcd)).isErr(), "empty Error")
    assert.deepEqual(true, (await df.start(param(['add', '!'], uuid), etcd)).isErr(), "!empty Error")
    assert.deepEqual(true, (await df.start(param(['add', 'a+c('], uuid), etcd)).isErr(), "regexp Error")
    assert.deepEqual(['^meno$','meno'], (await df.start(param(['add', '^meno$'], uuid), etcd)).ok.asJson().sort(), "regexp Ok")
    assert.deepEqual(['^meno$','meno'], (await df.start(param(['get'], uuid), etcd)).ok.asJson().sort(), "get Error")
  })
})

//node dist/server.js  domain-filter --etcd-url "https://etcd-1.adviser.com:2381"
//--client-ca cafile --client-cert ../../certs/cetcd.adviser.com/cert.pem
//--client-key ../../certs/cetcd.adviser.com/privkey.pem  --etcd-url
//"https://etcd-2.adviser.com:2381" --etcd-url "https://etcd-3.adviser.com:2381"
//add meno

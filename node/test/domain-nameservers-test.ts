
import { assert } from 'chai';

import * as Uuid from 'node-uuid'

import DomainNameServers from '../src/domain_name_servers'
import * as config from '../src/certor_config'

function param(arr: string[], uuid: string) : string[] {
  return arr.concat(['--etcd-cluster-id', uuid, '--etcd-url', "http://localhost:2379"])
}

describe("DomainNameServers", () => {
  it("check", async () => {
    let uuid = Uuid.v4().toString();
    let df = new DomainNameServers()
    let wc = config.Certor.create(param([], uuid))
    let etcd = await wc.etcd();
    // console.log(uuid)
    assert.deepEqual(true, (await df.start(param(['get'], uuid), etcd)).isErr(), "get without domain empty")
    assert.deepEqual([], (await df.start(param(['get', '--domain', "hello.world"], uuid), etcd)).ok.asJson(), "get empty")
    assert.deepEqual(true, (await df.start(param(['add', 'meno'], uuid), etcd)).isErr(), "add without domain()")
    assert.deepEqual([{ip:"ns1"}], (await df.start(param(['add', "--ip", 'ns1', '--domain', "hello.world"], uuid), etcd)).ok.asJson(), "add domain()")
    assert.deepEqual([{ip:"ns1"},{ip:"ns2",key:"key"}], (await df.start(param(['add', "--ip", 'ns2', '--key', 'key', '--domain', "hello.world"], uuid), etcd)).ok.asJson(), "add domain()")
    assert.deepEqual([{ip:"ns1"},{ip:"ns2",key:"key"}], (await df.start(param(['add', "--ip", 'ns2', '--key', 'key', '--domain', "hello.world"], uuid), etcd)).ok.asJson(), "add domain()")

    assert.deepEqual([{ip:'onem'}], (await df.start(param(['add', "--ip", 'onem', '--domain', "mello.dello"], uuid), etcd)).ok.asJson(), "add other domain()")
  })
})


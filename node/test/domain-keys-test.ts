
import { assert } from 'chai';
import * as fs from 'fs'
import * as Uuid from 'node-uuid'

import DomainKsk from '../src/domain-ksk'
import DomainZsk from '../src/domain-zsk'
import * as config from '../src/certor_config'

function param(arr: string[], uuid: string) : string[] {
  return arr.concat(['--etcd-cluster-id', uuid, '--etcd-url', "http://localhost:2379"])
}

describe("DomainKeys", () => {
  it("check", async () => {
    let uuid = Uuid.v4().toString();
    let wc = config.Certor.create(param([], uuid))
    let etcd = await wc.etcd();
    let domains = [new DomainKsk(), new DomainZsk()]
    for (let i in domains) {
      let df = domains[i] 
      assert.deepEqual(true, (await df.start(param(['get'], uuid), etcd)).isErr(), "get-zsk not set")

      assert.deepEqual(true, (await df.start(param(['get', '--domain', 'test'], uuid), etcd)).isErr(), "get-zsk not set")

      assert.deepEqual(true, (await df.start(param(['set', 'zsk'], uuid), etcd)).isErr(), "add without domain()")

      assert.deepEqual("zsk", (await df.start(param(['set', 'zsk', '--domain', 'test'], uuid), etcd)).ok.asJson(), "add without domain()")

      let zsk_fname = `.zsk.test.${uuid}`
      fs.writeFileSync(zsk_fname, "zsk-file")
      assert.deepEqual("zsk-file", (await df.start(param(['set', `@${zsk_fname}`, '--domain', 'test'], uuid), etcd)).ok.asJson(), "add without domain()")

      fs.unlinkSync(zsk_fname)

      assert.deepEqual("zsk-file", (await df.start(param(['get', '--domain', 'test'], uuid), etcd)).ok.asJson(), "add without domain()")

      assert.deepEqual("zsk-file", (await df.start(param(['del', '--domain', 'test'], uuid), etcd)).ok.asJson(), "add without domain()")

      assert.deepEqual(true, (await df.start(param(['get', '--domain', 'test'], uuid), etcd)).isErr(), "add without domain()")
    }
  })
})


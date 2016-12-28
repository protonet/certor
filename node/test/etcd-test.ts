



import { assert } from 'chai';

import * as Uuid from 'node-uuid'

import * as config from '../src/certor_config'

import * as etcd from '../src/etcd'


function param(arr: string[], uuid: string) : string[] {
  return arr.concat(['--etcd-cluster-id', uuid, '--etcd-url', "http://localhost:2379"])
}

describe("etcd", () => {
  it("mkdir", async () => {
    let uuid = Uuid.v4().toString();
    let wc = config.Certor.create(param([], uuid))
    let etc = await wc.etcd();
    let ret = await etc.mkdir("meno")
    // console.log(ret)
    try {
      ret = await etc.mkdir("meno")
    } catch (err) {
      if (err.statusCode != 403) {
        assert("mkdir failed")
      }
    }
    assert.equal((await etc.list("meno")).length, 0, "empty")  
    let list = await etc.list("")  
    for (let i of list) {
      if (i['key'].endsWith("meno")) {
        assert.equal(i['dir'], true, 'should be a directory')
      }
    }
  })

})



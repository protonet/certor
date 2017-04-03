

import { assert } from 'chai';

import * as Uuid from 'node-uuid'

import * as config from '../src/certor_config'

import DomainCsr from '../src/domain_csr'

import WebServerService from '../src/web_server_service/web_server_service'

function param(arr: string[], uuid: string) : string[] {
  return arr.concat(['--etcd-cluster-id', uuid, '--etcd-url', "http://localhost:2379"])
}

describe("DomainCsr", () => {
  before(() => {
    let ws = new WebServerService()
    ws.start(['server', '--background'])
  })
  it("check", async () => {
    let uuid = Uuid.v4().toString();
    let df = new DomainCsr();
    // console.log(uuid)
    assert.deepEqual(true, (await df.start(param(['sendcsr'], uuid))).isErr(), "get without domain empty")
    // create key and csr
    assert.deepEqual(true, (await df.start(param(['sendcsr'], uuid))).isErr(), "get without domain empty")
    // use key and create new csr
    // use key and given csr
  })
})


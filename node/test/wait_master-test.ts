

import { assert } from 'chai';
//import { describe, it } from 'mocha';


import * as Uuid from 'node-uuid'

import DepotsIps from '../src/depots_ips'
import DepotsCreators from '../src/depots_creators'

// import EtcdDaemon from './etcd_daemon'

import * as config from '../src/certor_config'

import * as ipaddress from 'ipaddress'
import * as ipranges from '../src/ipranges'
import * as etcd from '../src/etcd'


import WaitMaster from '../src/wait_master'

function param(arr: string[], uuid: string) : string[] {
  return arr.concat(['--etcd-cluster-id', uuid, '--etcd-url', "http://localhost:2379"])
}

function masterCount(wms: WaitMaster[]) {
    let masterCount = 0;
    for (let i = 0; i < wms.length; ++i) {
      if (wms[i].master) {
        ++masterCount
      }
    }
    return masterCount
}

function stopCount(wms: WaitMaster[]) {
    let stopCount = 0;
    for (let i = 0; i < wms.length; ++i) {
      if (wms[i].stopped) {
        ++stopCount
      }
    }
    return stopCount
}

function slaves(wms: WaitMaster[]) : WaitMaster[] {
  return wms.filter((wm) => !wm.master)
}

function master(wms: WaitMaster[]) : WaitMaster {
  return wms.find((wm) => wm.master)
}
function mastersSum(masters: number[]) : number {
  return masters.reduce((a,b) => a+b, 0)
}

describe("wait-master", function() {
  this.timeout(10000);
  it("elect-master", async () => {
    // this.timeout(10000)
    let uuid = Uuid.v4().toString();
    let wc = config.Certor.create(param([], uuid))
    let etc = await wc.etcd();
    let masters : number[] = []
    let waitMasters : WaitMaster[] = []
    let totalWaiters = 10
    for (let i = 0; i < totalWaiters; ++i) {
      masters[i] = 0;
      let wm = await WaitMaster.create(uuid, etc, 100, 100, 
        ((id) : () => void => { return () => { ++masters[id] } })(i), 
        ((id) : () => void => { return () => { --masters[id] } })(i),
      )
      waitMasters.push(wm)
    }
    await new Promise((res, rej) => { setTimeout(res, 400) });
    assert.equal(mastersSum(masters), 1, "master count 1 A")  
    assert.equal(masterCount(waitMasters), 1, "master count 1 B")  
    assert.equal(stopCount(waitMasters), 0, "stop count 0 C")  
    await slaves(waitMasters)[0].stop()
    await new Promise((res, rej) => { setTimeout(res, 150) });
    assert.equal(mastersSum(masters), 1, "master count 1 D")  
    assert.equal(masterCount(waitMasters), 1, "master count 1 E")  
    assert.equal(stopCount(waitMasters), 1, "stop count 1 F")  
    await master(waitMasters).stop()
    await new Promise((res, rej) => { setTimeout(res, 200) });
    assert.equal(mastersSum(masters), 1, "master count 1 G")  
    assert.equal(masterCount(waitMasters), 1, "master count 1 H")  
    assert.equal(stopCount(waitMasters), 2, "stop count 1 I")  

    let wm = await WaitMaster.create(uuid, etc, 100, 100, 
      () => assert("will not get the master"), () => assert("do not stop"))
    await new Promise((res, rej) => { setTimeout(res, 150) });
    await wm.stop()
    assert.equal(mastersSum(masters), 1, "master count 1 J")  
    assert.equal(masterCount(waitMasters), 1, "master count 1 K")  
    assert.equal(stopCount(waitMasters), 2, "stop count 1 L")  

    await new Promise((res, rej) => { setTimeout(res, 150) });
    let cnt = 0
    while (master(waitMasters)) {
      ++cnt
      // console.log(">>>>stop current master", cnt)
      await master(waitMasters).stop()
      await new Promise((res, rej) => { setTimeout(res, 250) });
      // console.log(">>>>waited current master", master(waitMasters))
      if (master(waitMasters)) {
        assert.equal(mastersSum(masters), 1, "master count 1 M")  
        assert.equal(masterCount(waitMasters), 1, "master count 1 N")  
        assert.equal(stopCount(waitMasters), 2+cnt, `stop count cnt O ${cnt}`)  
      } else {
        assert.equal(mastersSum(masters), 0, "master count 1 M")  
        assert.equal(masterCount(waitMasters), 0, "master count 1 N")  
        assert.equal(stopCount(waitMasters), 2+cnt, `stop count cnt O ${cnt}`)  
      }
    }
    assert.equal(totalWaiters, cnt+2)
    // console.log("DONE")
    return Promise.resolve("done")
  })

})


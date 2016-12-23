
import { assert } from 'chai';
//import { describe, it } from 'mocha';

import {spawn} from 'child_process'

import * as Uuid from 'node-uuid';

import DomainFilter from '../src/domain_filter'

// grep.on('close', (code, signal) => {
//   console.log(
//     `child process terminated due to receipt of signal ${signal}`);
// });
// // Send SIGHUP to process
// grep.kill('SIGHUP');

function Etcd() {
  let etcd = spawn('etcd')
  etcd.on('error', (err) => {
    assert.fail("can't spawn etcd")
  });
  etcd.stdin.on('data', (res: string) => {
    // console.log(">>"+res+"<<")
  })
  etcd.stderr.on('data', (res: string) => {
    // console.log(">>"+res+"<<")
  })
  return etcd;
}

function param(arr: string[], uuid: string) : string[] {
  return arr.concat(['--cluster-id', uuid, '--etcd-url', "http://localhost:2379"])
}

describe("domain-filter", () => {
  it("get", (done: any) => {
    let etcd = Etcd()
    let uuid = Uuid.v4().toString()
    let df = new DomainFilter();
    df.start(param(['get'], uuid), (err, res) => {
      assert.equal(err, null)
      assert.equal(res, null)
      df.start(param(['add', 'meno'], uuid), (err, res) => {
        assert.equal(err, null)
        assert.deepEqual(res, ['meno'])
        df.start(param(['get'], uuid), (err, res) => {
          assert.equal(err, null)
          assert.deepEqual(res, ['meno'])
          etcd.kill('SIGTERM')
          done()
        })
      })
    })
  })
  it("add", (done: any) => {
    let etcd = Etcd()
    let df = new DomainFilter();
    let uuid = Uuid.v4().toString()
    df.start(param(['add', 'meno'], uuid), (err, res) => {
      assert.equal(err, null)
      assert.deepEqual(res, ['meno'])
      df.start(param(['add', 'meno'], uuid), (err, res) => {
        assert.equal(err, null)
        assert.deepEqual(res, ['meno'])
        df.start(param(['add', 'murks'], uuid), (err, res) => {
          assert.equal(err, null)
          assert.deepEqual(res.sort(), ['murks','meno'].sort())
          df.start(param(['get'], uuid), (err, res) => {
            assert.equal(err, null)
            assert.deepEqual(res.sort(), ['murks','meno'].sort())
            etcd.kill('SIGTERM')
            done()
          })
        })
      })
    })
  })
  it("del", (done: any) => {
    let etcd = Etcd()
    let df = new DomainFilter();
    let uuid = Uuid.v4().toString()
    df.start(param(['del', 'meno'], uuid), (err, res) => {
      assert.equal(err, null)
      assert.deepEqual(res, [])
      df.start(param(['add', 'meno'], uuid), (err, res) => {
        assert.equal(err, null)
        assert.deepEqual(res, ['meno'])
        df.start(param(['del', 'meno'], uuid), (err, res) => {
          assert.equal(err, null)
          assert.deepEqual(res, [], "was")
          df.start(param(['get'], uuid), (err, res) => {
            assert.equal(err, null)
            assert.deepEqual(res, [], "wo")
            done()
          })
        })
      })
    })
  })
})

//node dist/server.js  domain-filter --etcd-url "https://etcd-1.adviser.com:2381"
//--client-ca cafile --client-cert ../../certs/cetcd.adviser.com/cert.pem
//--client-key ../../certs/cetcd.adviser.com/privkey.pem  --etcd-url
//"https://etcd-2.adviser.com:2381" --etcd-url "https://etcd-3.adviser.com:2381"
//add meno

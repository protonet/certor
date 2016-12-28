
import * as etcd from './etcd'
import * as path from 'path'

export default async function listAction(key: string, etc : etcd.Etcd) {
  try {
    let list = await etc.list(key)
    let keys = list.map((node:any) => path.basename(node['key']))
    return Promise.resolve(keys)
  } catch (e) {
    if (e.statusCode == 404) {
      return Promise.resolve([])
    }
    console.error("list failed:", e.statusCode)
    return Promise.reject(`list failed:${e.statusCode}`)
  }
}
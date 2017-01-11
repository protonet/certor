
import * as etcd from 'promise-etcd'
import * as path from 'path'
import * as cmd from './command'
import * as listResult from './list_result'

export default async function listAction(key: string, etc : etcd.Etcd) : Promise<cmd.Result> {
  let list = await etc.list(key)
  if (list.isErr()) {
    return Promise.resolve(listResult.EtcdListError(list))
  }
  let keys = list.value.map((node:any) => path.basename(node['key']))
  return Promise.resolve(new listResult.ListResult<string>(keys))
}
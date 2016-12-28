
import * as etcd from './etcd'
import DepotsCreators from './depots_creators'

export default async function valid_creator(argv: string[], etc: etcd.Etcd, 
  id: string, cb: (id:string)=>Promise<any>) {
    try {
      let creator_ofs = argv.indexOf("--creator")
      let creator = argv[creator_ofs+1]
      if (creator_ofs >= 0 && creator && creator.length > 0) {
        let creators = await (new DepotsCreators()).start(['get'], etc)
        if (creators.find((c:string)=>c==creator)) {
          return cb(id)
        }
      } 
      throw new Error(`no --creator:${creator}`)
    } catch(e) {
      return Promise.reject(e)
    }
  }
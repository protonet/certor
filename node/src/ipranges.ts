
import * as listHandler from './list_handler'
import Command from './command'
import * as etcd from 'promise-etcd'
import * as config from './certor_config'

import * as ipaddress from 'ipaddress'

// export class IpRange {
//   start: ipaddress.IPAddress 
//   end?: ipaddress.IPAddress = null
//   public static parse(str: string) : IpRange {
//     let ret = new IpRange()
//     let rangeSplit = str.split("-")
//     ret.start = ipaddress.IPAddress.parse(rangeSplit[0])
//     if (!ret.start) {
//       throw new Error(`Range not parseable:${str}`)
//     }
//     if (rangeSplit.length == 2) {
//       ret.end = ipaddress.IPAddress.parse(rangeSplit[1])
//       if (!ret.end) {
//         throw new Error(`Range not parseable:${str}`)
//       }
//       if (!ret.start.size().eq(ipaddress.Crunchy.one()) || 
//           !ret.end.size().eq(ipaddress.Crunchy.one())) {
//         throw new Error(`Range not parseable:${str}`)
//       }
//       if (!ret.start.lt(ret.end)) {
//         throw new Error(`Range range error:${str}`)
//       }
//     }
//     return ret
//   }
//   public toString() : string {
//     if (this.end) {
//       return `${this.start.to_s}-${this.end.to_s}`
//     }
//     return this.start.to_string()
//   }
//   public includes(ip: ipaddress.IPAddress) : boolean {
//     if (this.end) {
//       return this.start.lte(ip) && ip.lte(this.end)
//     }
//     return this.start.includes(ip)
//   }
// }

// export class IpRangesActor implements listHandler.Actor<IpRange> {
//   public adder(key: string) : (arr: string[]) => IpRange[] {
//     return (arr: string[]) :IpRange[] => {
//       if (!arr.find((l)=>l==key)) {
//         arr.push(key)
//         return this.geter(arr);
//       }
//       return null;
//     }
//   }
//   public deler(key: string) : (arr: string[]) => IpRange[] {
//     return (arr: string[]) : IpRange[] => {
//       let post = arr.filter((l) => l!=key)
//       if (post.length != arr.length) {
//         return this.geter(post);
//       }
//       return null;
//     }
//   }
//   public geter(arr: string[]) : IpRange[] {
//     return arr.map((str)=>IpRange.parse(str))
//   }

//   public toString(t: IpRange) : string {
//     return t.toString()
//   }

//   public validate(t: IpRange) : listHandler.Valid<IpRange> {
//     return null
//   }

// }

// export class IpRanges extends listHandler.ListHandler<IpRange> {
//   // key: string = "IpRanges"
//   constructor(key: string) {
//     super(key, new IpRangesActor())
//   }
//   public static includes(ip: ipaddress.IPAddress, ranges: IpRange[]) : boolean {
//     return !!ranges.find((ipr) => ipr.includes(ip))
//   }
// }

// // export default IpRanges


import * as cmd from './command'

import * as request from 'request-promise'

import * as petcd from 'promise-etcd'


export class EtcdErrValue<T> implements cmd.ResValue {
  eValue : petcd.EtcValue<T>
  constructor(e: petcd.EtcValue<T>) {
    this.eValue = e
  }
   public asText() : string {
    return `Error: ${this.eValue.err.err.reqErr} ${this.eValue.err.err.statusErr}` +
           ` ${this.eValue.err.err.transErr} ${this.eValue.err.err.unknown}`
  }
  public asJson() : any {
    return this.eValue.err
  }
}

export function EtcdListError<T>(v: petcd.EtcValue<T[]>) {
  return new cmd.Error(new EtcdErrValue(v))
}

export function EtcdError<T>(v: petcd.EtcValue<T>) {
  return new cmd.Error(new EtcdErrValue(v))
}

export class EtcdListResultValue<T> implements cmd.ResValue {
  result : T[]
  constructor(e: petcd.EtcValue<T[]>) {
    this.result = e.value
  }
  public asText() : string {
    // let ret = ""
    // for (let i in this.result) {
    //   ret += this.result[i].toString() + "\n"
    // }
    return this.result.join("\n");
  }
  public asJson() : any {
    return this.result
  }
}

export class EtcdResultValue<T> implements cmd.ResValue {
  result : T
  constructor(e: petcd.EtcValue<T>) {
    this.result = e.value
  }
  public asText() : string {
    // console.log("1>>>>>", this.result)
    return this.result.toString();
  }
  public asJson() : any {
    return this.result
  }
}


export function EtcdListResult<T>(v: petcd.EtcValue<T[]>) {
  let ret = new cmd.Ok(new EtcdListResultValue<T>(v))
  // console.log(`[${ret.ok.asText()}]`)
  return ret
}

export function EtcdResult<T>(v: petcd.EtcValue<T>) {
  return new cmd.Ok(new EtcdResultValue<T>(v))
}

export function ListResolve<T>(ret: T[]) : Promise<cmd.Result> {
  return Promise.resolve(new cmd.Ok(new ListResultValue(ret)))
}

export function Resolve<T>(ret: petcd.EtcValue<T>) : Promise<cmd.Result> {
  if (ret.isErr()) {
    return Promise.resolve(EtcdError(ret))
  }
  return Promise.resolve(EtcdResult(ret))
}


export class ListResultValue<T> implements cmd.ResValue {
  result : T[]
  constructor(e: T[]) {
    this.result = e
  }
  public asText() : string {
    // console.log("2>>>>>", this.result)
    let ret = ""
    for (let i in this.result) {
      ret += this.result[i].toString() + "\n"
    }
    return ret;
  }
  public asJson() : any {
    return this.result
  }
}


export class ListResult<T> implements cmd.Result {
  public isOk()  { return true }
  public isErr() { return false }
  constructor(rv: T[]) {
    this.ok = new ListResultValue<T>(rv)
  }
  ok : cmd.ResValue 
  err : cmd.ResValue = null 
}

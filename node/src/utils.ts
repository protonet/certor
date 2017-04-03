import * as fs from 'fs-promise'
import * as cmd from './command'

export class WithFname<T> {
  value: T
  fname: string
}

export interface Result<T> {
  ok: T
  err: string
  isOk() : boolean
  isErr() : boolean
}

export class OkResult<T> implements Result<T>  {
  ok: T
  isOk()  { return true } 
  isErr()  { return false } 
  err: string = null
  constructor(ok: T) {
    this.ok = ok
  }
  public static resolve<T>(t: T) : Promise<Result<T>> {
    return Promise.resolve(new OkResult(t))
  }
}

export class ErrorResult<T> implements Result<T>  {
  ok: T = null
  isOk()  { return false } 
  isErr()  { return true } 
  err: string
  constructor(err: string) {
    this.err = err
  }
  public static resolve<T>(t: string) : Promise<Result<T>> {
    return Promise.resolve(new ErrorResult<T>(t))
  }
}

export async function parseValueWithFname(value: string) : Promise<Result<WithFname<string>>> {
  if (!value || value.length == 0) {
    return ErrorResult.resolve<WithFname<string>>("you need to set the setvalue");
  }
  if (value[0] == "@") {
    let fname = value.slice(1)
    try { 
      if (!await fs.exists(fname)) {
        return ErrorResult.resolve<WithFname<string>>(null)
      }
    } catch (e) {
      return ErrorResult.resolve<WithFname<string>>(e.message)
    }
    try {
      value = (await fs.readFile(fname)).toString()
      return Promise.resolve(OkResult.resolve<WithFname<string>>({
        value: value,
        fname: fname
      }))
    } catch (e) {
      return ErrorResult.resolve<WithFname<string>>(e)
    }
  }
  return Promise.resolve(OkResult.resolve<WithFname<string>>({
    value: value,
    fname: null
  }))
}

export async function parseValue(value: string) : Promise<cmd.Result> {
  let ret = await parseValueWithFname(value)
  if (ret.isErr()) {
    return Promise.resolve(cmd.Error.text(ret.err))
  }
  return Promise.resolve(new cmd.Error({
    asJson : () => { return ret.ok.value },
    asText : () => { return ret.ok.value }
  }))
}

export function okValue(value: any) {
  return new cmd.Ok({
    asJson : () => { return value },
    asText : () => { return value }
  })
}

export function promiseOk(value:any) {
  return Promise.resolve(okValue(value))
}

export function errValue(value: any) {
  return new cmd.Error({
    asJson : () => { return value },
    asText : () => { return JSON.stringify(value) }
  })
}

export function promiseErr(value:any) {
  return Promise.resolve(errValue(value))
}


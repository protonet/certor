
export interface ResValue {
  asText() : string
  asJson() : any
}

export interface Result {
  isOk() : boolean
  isErr() : boolean
  ok : ResValue 
  err : ResValue 
}

export class Error implements Result {
  public isOk() { return false }
  public isErr() { return true }
  constructor(rv: ResValue) {
    this.err = rv
  }
  ok : ResValue = null 
  err: ResValue 
  public static text(txt: string) {
    return new Error({
      asText: () => { return txt },
      asJson: () => { return txt }
    })
  }
}

export class Ok implements Result {
  public isOk() { return true }
  public isErr() { return false }
  constructor(rv: ResValue) {
    this.ok = rv
  }
  ok : ResValue
  err: ResValue  = null  
}



export interface Command {
  key: string
  start(argv: string[]) : Promise<Result>
}
export default Command
import * as listHandler from './list_handler'

export class StringActor implements listHandler.Actor<string> {
  public adder(key: string) : (arr: string[]) => string[] {
    return (arr: string[]) : string[] => {
      if (!arr.find((l)=>l==key)) {
        arr.push(key)
        return arr;
      }
      return null;
    }
  }
  public fromArgs(argv: string[], ofs: number) : Promise<listHandler.Valid<string>> {
    return Promise.resolve({
      isValid : () => { return true },
      value : argv[ofs]
    })
  }
  public deler(key: string) : (arr: string[]) => string[] {
    return (arr: string[]) : string[] => {
      let post = arr.filter((l) => l!=key)
      if (post.length != arr.length) {
        return post;
      }
      return null;
    }
  }
  public geter(arr: string[]) : string[] {
    return arr 
  }
  public toString(t: string) : string {
    return t
  }

  public validate(t: string) : listHandler.Valid<string> {
    return {
      isValid : () => { return true },
      value : t,
      error : null
    }
  }

}

export class StringListHandler extends listHandler.ListHandler<string> {
  constructor(key: string) {
    super(key, new StringActor())
  }
  
}

export default StringListHandler
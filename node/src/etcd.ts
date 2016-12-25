import * as config from './certor_config'
import * as rq from 'request-promise'
import * as stream from 'stream'

class LeaderInfo {
  leader: string;
  uptime: string;
  startTime: Date;
  public static fill(js: any) : LeaderInfo {
    let ret = new LeaderInfo();
    ret.leader = js['leader']
    ret.uptime = js['uptime']
    ret.startTime = new Date(js['startTime'])
    return ret;
  }
}

class Dispatcher {
  resolv: any;
  reject: any;
  constructor() {
    this.await_reject = this.await_reject.bind(this)
    this.await_resolv = this.await_resolv.bind(this)
  }
  public release_resolv(data: any) {
    // console.log("release_resolv:", data)
    this.resolv(data)
  }
  public await_resolv(resolv: any) {
    this.resolv = resolv
  }
  public release_reject(data: any) {
    // console.log("reject_resolv:", data)
    this.reject(data)
  }
  public await_reject(reject: any) {
    this.reject = reject
  }
}
     

class SelfState {
  url: string;
  err: any = null

  name: string;
  id: string;
  state: string;

  startTime: Date;
  leaderInfo: LeaderInfo

  recvAppendRequestCnt: number
  sendAppendRequestCnt: number

  public isOk() : boolean {
    return this.err == null && this.id.length != 0;
  }
  public static error(url: string, err: any) : SelfState {
    let ret = new SelfState()
    ret.url = url;
    ret.err = err;
    return ret
  }
  public static ok(url: string, val: string) : SelfState {
    let ret = new SelfState()
    ret.url = url;
    let json = JSON.parse(val);
    ret.name = json['name'] 
    ret.id = json['id'] 
    ret.state = json['state'] 
    ret.startTime = new Date(json['startTime'])
    ret.leaderInfo = LeaderInfo.fill(json['leaderInfo'])
    ret.recvAppendRequestCnt = json['recvAppendRequestCnt'];
    ret.sendAppendRequestCnt = json['sendAppendRequestCnt']
    return ret
  }
}

export class Config { 
  urls: string[] = []
  reqTimeout: number = 500 // msec
  retries: number = 3
  waitTime: number = 250 // ms
  clusterId: string = null;
  appId: string = null
  public static start(argv: string[], app: string = null) {
    let ret = new Config()
    let ofs = argv.indexOf("--etcd-cluster-id")
    if (ofs >= 0) {
      ret.clusterId = argv[ofs + 1]
    } 

    ofs = argv.indexOf("--etcd-app-id")
    if (ofs >= 0) {
      ret.appId = argv[ofs + 1]
    } else {
      ret.appId = app
    } 

    for(ofs = argv.indexOf("--etcd-url"); ofs >= 0; ofs = argv.indexOf("--etcd-url", ofs+1)) {
      ret.urls.push(argv[ofs + 1])
    }

    ofs = argv.indexOf("--etcd-retries")
    if (ofs >= 0) {
      ret.retries = parseInt(argv[ofs + 1], 10)
    }

    ofs = argv.indexOf("--etcd-wait-time")
    if (ofs >= 0) {
      ret.waitTime = parseInt(argv[ofs + 1], 10)
    }
    
    ofs = argv.indexOf("--etcd-req-timeout")
    if (ofs >= 0) {
      ret.reqTimeout = parseInt(argv[ofs + 1], 10)
    } 

    return ret
  }
}

export class Etcd {
  cfg: Config
  currentEtcd: string = null;
  constructor(cfg: Config) {
    this.cfg = cfg
  }

  // public options() : void {
  //   //let connStr : string;
  //   // if (this.cfg.client.isSet()) {
  //   //   connStr = `etcd:TLS:${this.cfg.etcd_urls}`
  //   //   etcdh.etcd = new Etcd(cfg.etcd_urls, cfg.client)
  //   // } else {
  //   //   connStr = `etcd:${cfg.etcd_urls}`
  //   //   etcdh.etcd = new Etcd(cfg.etcd_urls)
  //   // }
  // }

  // public buildClusterUrls(uri: string) : string[] {
  //   return 
  // }

  // public requestsGet(uri: string) : rq.RequestPromise[] {
  //   return null // this.buildUrls(uri).map((url) => rq.get(url))
  // }

  // public requests(urls: string[], method: string, options: any = {}) : rq.RequestPromise[] {
  //   return urls.map((url) => {
  //     options.method = method;
  //     options.uri = url;
  //     return rq(options)
  //   })
  // }

  selfStateInActions: Dispatcher[] = [];

  public resolvSelfStateInActions(ret: Promise<SelfState>, s2: SelfState) : Promise<SelfState> {
    let local = this.selfStateInActions;
    this.selfStateInActions = [];
    local.forEach((ssia) => {
      ssia.release_resolv(s2)
    })
    return ret;
  }
  public rejectSelfStateInActions(ret: Promise<SelfState>, s2: SelfState) : Promise<SelfState> {
    let local = this.selfStateInActions;
    this.selfStateInActions = [];
    local.forEach((ssia) => {
      ssia.release_reject(s2)
    })
    return ret;
  }

  public async selfStat(): Promise<SelfState|void> {
    let dispatcher = new Dispatcher();
    this.selfStateInActions.push(dispatcher);
    let ret = new Promise<SelfState>((resolv, reject) => {
        // console.log("meno-1")
        dispatcher.await_resolv(resolv)
        dispatcher.await_reject(reject)
    })
    if (this.selfStateInActions.length > 1) {
      return ret;
    }
    let selfStates = this.cfg.urls.map(async (url) => {
      try {
        let req = await this.rawRequest("GET", `${url}/v2/stats/self`)
        return Promise.resolve(SelfState.ok(url, req)) 
      } catch (e) {
        return Promise.resolve(SelfState.error(url, e)) 
      }
    });
    this.currentEtcd = null;
    for (let i = 0; i < this.cfg.retries; ++i) {
      let sss = await Promise.all(selfStates);
      for (let j = 0; j < sss.length; ++j) {
        let s2 = sss[j];
        if (s2.isOk()) {
          console.log("Connected to:", s2.url)
          this.currentEtcd = s2.url 
          return this.resolvSelfStateInActions(ret, s2)
        }
      }
      await new Promise((resolve, reject) => {
          console.log("Retry:", i)
          setTimeout(resolve, this.cfg.waitTime);
      }); 
    }
    console.log("Reject: SelfState")
    return this.rejectSelfStateInActions(ret, SelfState.error(null, "no valid server found:"+this.cfg.urls));
  }


  public async get(key: string) : Promise<any> {
    let uri = this.buildKeyUri('/v2/keys', key)
    try {
      let ret = await this.request("GET", uri)
      // console.log("GET:", uri, ret)
      return Promise.resolve(JSON.parse(ret))
    } catch (err) {
      if (err.statusCode == 404) {
        return Promise.resolve({})
      } 
      console.log("ERROR", err);
      return Promise.reject(err)
    }
  }

  public async request(method: string, url: string, options : any = {}) {
    if (this.currentEtcd == null) {
      try { 
        let ret = await this.selfStat();
        // console.log("Request-OK", ret)
      } catch (e) {
        console.log("Request-REJECT")
        return Promise.reject(e)
      }
    }
    try {
       let ret = await this.rawRequest(method, `${this.currentEtcd}${url}`, options)
       return Promise.resolve(ret)
    } catch (e) {
      if (e.name == "StatusCodeError") {
        return Promise.reject(e)
      }
      this.currentEtcd = null // reconnect etcd
      this.request(method, url, options)
    }
  } 

  public async rawRequest(method: string, url: string, options : any = {}) {
      let my = {
         method: method,
         timeout: this.cfg.reqTimeout,
         uri: url
      }
      options = Object.assign(my, options) 
      return rq(url, options)
  }

  public async set(key: string, val: string) : Promise<any> {
    let uri = this.buildKeyUri('/v2/keys', key)
    try {
      let ret = await this.request("PUT", uri, {
         headers: {
           "Content-Type": "application/x-www-form-urlencoded"
         },
         body: `value=${val}`,
         json: false // Automatically stringifies the body to JSON 
      })
      return Promise.resolve(ret)
    } catch (err) {
      console.log("ERROR", err);
      return Promise.reject(err)
    }
  }


  public static async create(cfg: Config)  {
    return new Etcd(cfg)
  }

  public buildKeyUri(base: string, key :string) : string {
    let url : string
    let app : string = this.cfg.appId || ""
    if (app.length != 0) {
      app += "/"
    }
    if (this.cfg.clusterId) {
      url = `${base}/${app}${this.cfg.clusterId}/${key}`
    } else {
      url = `${base}/${app}${key}`
    }
    return url
  }

  // public async get(key :string) : string {
  //   this.etcd.get(this.build_url(key), cb);
  // }
  // public set(key :string, val: string, cb: (err: any, res:string)=>void) {
  //   this.etcd.set(this.build_url(key), val, cb)
  // }
}


export default Etcd;
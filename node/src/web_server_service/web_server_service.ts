

import * as fs from 'fs'
import * as http from 'http'
import * as https from 'https'

import * as config from '../certor_config'
import WebActor from './web_actor'

import * as cert from './cert'
import * as depot from './depot'
import * as ipDepot from './ip_depot'
import * as cmd from '../command'
import * as utils from '../utils'

class WebServiceServer implements cmd.Command {
  key: string = "server" ;
 
  webActors: {[id:string]: WebActor } = {}

  private redirectServer(cfg: config.Certor) {
    let srv = http.createServer((request, response) => {
      response.writeHead(302, {
        "Content-Type": "text/plain",
        "Location": cfg.redirectUrl,
      });
      response.end(`${cfg.redirectUrl}\n`);
    });
    srv.listen(cfg.redirectPort)
    console.log(`Started redirectPort on ${cfg.redirectPort} -> ${cfg.redirectUrl}`)
  }

  public start(argv: string[]) : Promise<cmd.Result> {
    let cfg = config.Certor.create(argv)
    if (cfg.redirectPort > 0) {
      this.redirectServer(cfg);
    }    
    this.serviceServer(cfg);
    if (argv.indexOf("--background") >= 0) {
      return Promise.resolve(utils.okValue("Server started pushed to background"))
    }
    return new Promise((res, rej) => {
      setTimeout(() => {}, 3600000)
    })
  }

  private register(wa: WebActor) {
    this.webActors[wa.url] = wa
  }

  private dispatch(req: http.IncomingMessage, res: http.ServerResponse) {
    let actor = this.webActors[req.url];
    if (actor) {
      actor.action(req, res)
    } else {
      res.writeHead(404, {
        "Content-Type": "text/plain",
      });
      res.end(`Action for ${req.url} not found\n`);
    }
  }

  private serviceServer(cfg: config.Certor) {
    let httpServer : https.Server | http.Server;
    if (cfg.privateKey) {
      httpServer = https.createServer(cfg.credentials());
      console.log(`Listen on: https ${cfg.applicationPort}`)
    } else {
      httpServer = http.createServer();
      console.log(`Listen on: http ${cfg.applicationPort}`)
    }
    this.register(new cert.Create());
    this.register(new cert.Delete());
    this.register(new depot.Create());
    this.register(new depot.Delete());
    this.register(new ipDepot.Create());
    this.register(new ipDepot.Delete());
    httpServer.on('request', this.dispatch.bind(this))
    httpServer.listen(cfg.applicationPort);
    console.log(`serviceServer is listen on: ${cfg.applicationPort}`)
  }
}

export  default WebServiceServer;
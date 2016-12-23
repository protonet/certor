
import WebServiceServer from './web_server_service/web_server_service'

import DnsZoneWriter from './dns_zone_writer'
import DnsZoneUpdater from './dns_zone_updater'
import CertReaper from './cert_reaper'
import DepotsReaper from './depots_reaper'
import DepotMonitor from './depot_monitor'
import Certor from './certor'
import DomainFilter from './domain_filter'

import Commander from './commander'

let cmd = new Commander()
cmd.register(new WebServiceServer())
cmd.register(new DnsZoneWriter())
cmd.register(new DnsZoneUpdater())
cmd.register(new CertReaper())
cmd.register(new DepotsReaper())
cmd.register(new DepotMonitor())
cmd.register(new Certor())
cmd.register(new DomainFilter())

cmd.dispatch(process.argv, null)


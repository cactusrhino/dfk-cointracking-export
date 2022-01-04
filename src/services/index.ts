import { Application } from '../declarations';
import contracts from './contracts/contracts.service';
import scan from './scan/scan.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(contracts);
  app.configure(scan);
}

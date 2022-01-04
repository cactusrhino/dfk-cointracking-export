// Initializes the `scan` service on path `/scan`
import { ServiceAddons } from "@feathersjs/feathers";
import { Application } from "../../declarations";
import { Scan } from "./scan.class";
import hooks from "./scan.hooks";

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    scan: Scan & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get("paginate"),
  };

  // Initialize our service with any options it requires
  app.use(
    "/scan",
    (req: any, res: any, next: any) => {
      req.address = req.body.address;
      next();
    },
    new Scan(options, app)
  );

  // Get our initialized service so that we can register hooks
  const service = app.service("scan");

  service.hooks(hooks);
}

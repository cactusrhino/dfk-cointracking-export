// Initializes the `contracts` service on path `/contracts`
import { ServiceAddons } from "@feathersjs/feathers";
import { Application } from "../../declarations";
import { Contracts } from "./contracts.class";
import createModel from "../../models/contracts.model";
import hooks from "./contracts.hooks";

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    contracts: Contracts & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
  };

  // Initialize our service with any options it requires
  app.use("/contracts", new Contracts(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("contracts");

  service.hooks(hooks);
}

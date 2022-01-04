import { HooksObject } from "@feathersjs/feathers";
import processHarmony from "../../hooks/process-harmony";
import scanHarmony from "../../hooks/scan-harmony";

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [scanHarmony(), processHarmony()],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};

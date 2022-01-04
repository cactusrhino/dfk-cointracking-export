import { HooksObject } from "@feathersjs/feathers";
import convertAddress from "../../hooks/convert-address";

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [convertAddress()],
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

// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from "@feathersjs/feathers";
import { toBech32 } from "@harmony-js/crypto";
import { HarmonyAddress } from "@harmony-js/crypto";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { address, network } = context.data;
    var bech32Address = "";

    if (network === "Harmony" && !HarmonyAddress.isValidBech32(address)) {
      var bech32Address = toBech32(address);
      context.data.address = bech32Address;
      console.log("fire");
    }

    return context;
  };
};

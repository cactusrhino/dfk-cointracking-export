// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from "@feathersjs/feathers";
import { loggers } from "winston";
const https = require("https");
const axios = require("axios").default;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { address } = context.data;
    const promises: any[] = [];
    var log: any;
    var txCount: Number = 0;

    var numtx = {
      jsonrpc: "2.0",
      id: 1,
      method: "hmyv2_getTransactionsCount",
      params: [`${address}`, "ALL"],
    };

    await axios
      .post("https://rpc.s0.t.hmny.io", numtx)
      .then((res: any) => {
        txCount = res.data.result;
      })
      .catch((e: any) => {
        console.log(e);
      });

    var postBody = {
      jsonrpc: "2.0",
      id: 1,
      method: "hmyv2_getTransactionsHistory",
      params: [
        {
          address: `${address}`,
          pageIndex: 0,
          pageSize: txCount,
          fullTx: true,
          txType: "ALL",
          order: "ASC",
        },
      ],
    };

    await axios
      .post("https://rpc.s0.t.hmny.io", postBody)
      .then((res: any) => {
        log = res.data.result.transactions;
      })
      .catch((e: any) => console.log(e));

    //figure out how to get reciepts async

    // async function getLogs(){
    //   return new Promise(resolve => {

    //   })
    // }

    // console.log(log);
    //context.data.log = log;

    var body = {
      jsonrpc: "2.0",
      id: 1,
      method: "hmyv2_getTransactionReceipt",
      params: [`${log[0].hash}`],
    };
    for (var i = 0; i < log.length; i++) {
      body.params = [`${log[i].hash}`];
      const result = axios.post("https://rpc.s0.t.hmny.io", body);
      promises.push(result);
    }
    const results = await Promise.all(promises);
    const data = results.map((result: any) => result.data.result);

    for (let l of log) {
      for (let d of data) {
        if (d.transactionHash == l.hash) {
          l.logs = d.logs;
        }
      }
    }
    context.data.log = log;
    return context;
  };
};

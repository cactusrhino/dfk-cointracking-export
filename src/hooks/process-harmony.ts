// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { response } from "@feathersjs/express";
import { Hook, HookContext } from "@feathersjs/feathers";
import { toBech32 } from "@harmony-js/crypto";
import { fromWei, Units } from "@harmony-js/utils";
const { addABI, decodeLogs, decodeMethod, removeABI } = require("abi-decoder");

import bank from "../data/abi/Bank.json";
import erc20 from "../data/abi/ERC20.json";
import erc721 from "../data/abi/ERC721.json";
import heroSale from "../data/abi/HeroSale.json";
import heroSummon from "../data/abi/HeroSummoningUpgradeable.json";
import masterGardener from "../data/abi/MasterGardener.json";
import meditationCircle from "../data/abi/MeditationCircle.json";
import questCore from "../data/abi/QuestCore.json";
import questCoreV2 from "../data/abi/QuestCoreV2.json";
import wishingWell from "../data/abi/WishingWell.json";
import saleAuction from "../data/abi/SaleAuction.json";
import uniswapV2Factory from "../data/abi/UniswapV2Factory.json";
import hero from "../data/abi/Hero.json";
import profile from "../data/abi/Profile.json";
import gene from "../data/abi/GeneScience.json";
import items from "../data/abi/Items.json";
import uniswaprouter from "../data/abi/UniswapV2Router02.json";
import { format } from "winston";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const address = toBech32(context.data.address);
    const log = context.data.log;

    const bankABI = JSON.parse(JSON.stringify(bank));
    const erc20ABI = JSON.parse(JSON.stringify(erc20));
    const erc721ABI = JSON.parse(JSON.stringify(erc721));
    const heroSaleABI = JSON.parse(JSON.stringify(heroSale));
    const heroSummonABI = JSON.parse(JSON.stringify(heroSummon));
    const masterGardenerABI = JSON.parse(JSON.stringify(masterGardener));
    const meditationCircleABI = JSON.parse(JSON.stringify(meditationCircle));
    const questCoreABI = JSON.parse(JSON.stringify(questCore));
    const questCoreV2ABI = JSON.parse(JSON.stringify(questCoreV2));
    const saleAuctionABI = JSON.parse(JSON.stringify(saleAuction));
    const uniswapV2FactoryABI = JSON.parse(JSON.stringify(uniswapV2Factory));
    const wishingWellABI = JSON.parse(JSON.stringify(wishingWell));
    const heroABI = JSON.parse(JSON.stringify(hero));
    const profileABI = JSON.parse(JSON.stringify(profile));
    const geneABI = JSON.parse(JSON.stringify(gene));
    const itemsABI = JSON.parse(JSON.stringify(items));
    const routerABI = JSON.parse(JSON.stringify(uniswaprouter));
    let contracts: any = [];
    let skipped: any = [];

    async function getContracts() {
      await context.app
        .service("contracts")
        .find()
        .then((res: any) => {
          contracts = res;
        });

      contracts.push({
        name: "User",
        address: address,
        network: "Harmony",
      });
    }

    async function replaceTxAddresses(contracts: any, tx: any) {
      for (let c of contracts) {
        if (c.address === tx.to) {
          tx.to = c;
        }
        if (c.address === tx.from) {
          tx.from = c;
        }

        // if (c.name == "Wishing Well") {
        //   wellAddress = c;
        // }
      }

      return tx;
    }

    // async function replaceLogAddresses(contracts: any, logs: any) {
    //   if (logs) {
    //     for (let l of logs) {
    //       if (!l.data) {
    //         var bech32Address = toBech32(l.address);
    //         for (let e of l.events) {
    //           let eventAddress = "";

    //           if (e.type != "bool") {
    //             let string = e.value;

    //             eventAddress = string.includes("0x") ? toBech32(e.value) : "";

    //             if (
    //               eventAddress === "" &&
    //               e.name != "auctionId" &&
    //               e.name != "heroId"
    //             ) {
    //               e.value = fromWei(e.value, Units.one);
    //             }
    //           }

    //           for (let c of contracts) {
    //             if (bech32Address === c.address) {
    //               l.address = c;
    //             }
    //             if (eventAddress === c.address) {
    //               e.value = c;
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    //   return logs;
    // }

    // async function replaceInputAddresses(contracts: any, input: any) {
    //   if (input && input.params) {
    //     for (let p of input.params) {
    //       for (let c of contracts) {
    //         if (p.name === "_questAddress") {
    //           let address = p.value.includes("0x") ? toBech32(p.value) : "";
    //           if (c.address === address) {
    //             console.log(c);
    //             p.value = c;
    //           }
    //         }
    //       }
    //     }
    //   }
    //   return input;
    // }

    let cointracking: any = [];

    async function processTransactions() {
      let loadedABIs = [];
      let formatted: any = {};
      for (var i = 0; i < log.length; i++) {
        let processedLog: any = await replaceTxAddresses(contracts, log[i]);
        let translatedLog;
        if (processedLog.to.name) {
          if (
            processedLog.to.name === "Profession Quest" ||
            processedLog.to.name === "Wishing Well"
          ) {
            //abi stuff
            addABI(questCoreABI);
            loadedABIs.push(questCoreABI);
            processedLog = await decodeAndReplace(loadedABIs, log[i]);

            //what happened in this tx?
            if (processedLog.input) {
              if (
                processedLog.input.name === "startQuest" ||
                processedLog.input.name === "startQuestWithData"
              ) {
                formatted = {
                  type: "Other Fee",
                  buy: 0,
                  bCurr: "",
                  sell: 0,
                  sCurr: "",
                  fee: processedLog.gas * processedLog.gasPrice,
                  fCurr: "ONE",
                  exchange: "DefiKingdoms: Serendale",
                  comments: `Started 
                    ${processedLog.input.params[1].value} `,
                  group: "DefiKingdoms: Profession Quests",
                  timestamp: processedLog.timestamp,
                };
                cointracking.push(formatted);
              } else if (processedLog.input.name === "completeQuest") {
                formatted = {
                  type: "Other Fee",
                  buy: 0,
                  bCurr: "",
                  sell: 0,
                  sCurr: "",
                  fee: processedLog.gas * processedLog.gasPrice,
                  fCurr: "ONE",
                  exchange: "DefiKingdoms: Serendale",
                  comments: `Completed Quest`,
                  group: "DefiKingdoms: Profession Quests",
                  timestamp: processedLog.timestamp,
                };

                cointracking.push(formatted);

                for (let l of processedLog.logs) {
                  let p: any = [];

                  if (l && l.events) {
                    if (l.name === "QuestReward") {
                      p.push({
                        curr: l.events[3].value,
                        qty: parseInt(l.events[4].value),
                      });

                      let q: any = [{}];

                      for (let e of p) {
                        if (e.curr && e.curr != "") {
                          let found = false;
                          for (let x of q) {
                            if (q.length) {
                              if (x.curr === e.curr) {
                                x.qty += e.qty;
                                found = true;
                              }
                            } else if (q.length == 0) {
                              q.push(e);
                              found = true;
                            }

                            if (!found) {
                              q.push(e);
                              found = true;
                            }
                          }
                        }
                        // console.log(q);
                        formatted = {
                          type: "Other Income",
                          buy: e.qty,
                          bCurr: e.curr,
                          sell: 0,
                          sCurr: "",
                          fee: 0,
                          fCurr: "",
                          exchange: "DefiKingdoms: Serendale",
                          comments: `Quest Reward `,
                          group: "DefiKingdoms: Profession Quests",
                          timestamp: processedLog.timestamp,
                        };
                        cointracking.push(formatted);
                        //  console.log(formatted);
                      }
                      // console.log(JSON.stringify(processedLog.logs));
                    }
                  }
                }
              } else {
                skipped.push(processedLog.hash);
              }
            }
          } else if (processedLog.to.name === "Meditation Circle") {
            //addABI(heroABI);
            addABI(meditationCircleABI);
            addABI(erc20ABI);
            loadedABIs.push(meditationCircleABI);
            loadedABIs.push(erc20ABI);
            processedLog = await decodeAndReplace(loadedABIs, log[i]);

            //  console.log(processedLog.input, JSON.stringify(processedLog.logs));
            if (processedLog.input) {
              if (processedLog.input.name === "startMeditation") {
                formatted = {
                  type: "Other Fee",
                  buy: 0,
                  bCurr: "",
                  sell: 0,
                  sCurr: "",
                  fee: processedLog.gas * processedLog.gasPrice,
                  fCurr: "ONE",
                  exchange: "DefiKingdoms: Serendale",
                  comments: `Start Meditation`,
                  group: "DefiKingdoms: Meditation Circle",
                  timestamp: processedLog.timestamp,
                };

                cointracking.push(formatted);

                let sells = {
                  spent: [
                    {
                      token: "JEWEL",
                      value: 0,
                    },
                    {
                      token: "Shvas Rune",
                      value: 0,
                    },
                  ],
                };

                for (let l of processedLog.logs) {
                  if (l.name === "Transfer") {
                    if (
                      l.address === "0x72cb10c6bfa5624dd07ef608027e366bd690048f"
                    ) {
                      sells.spent[0].value += l.value;
                    } else if (
                      l.address === "0x66f5bfd910cd83d3766c4b39d13730c911b2d286"
                    ) {
                      sells.spent[1].value += l.value;
                    }
                  }
                }

                formatted = {
                  type: "Other Expense",
                  buy: 0,
                  bCurr: "",
                  sell: "0x72cb10c6bfa5624dd07ef608027e366bd690048f",
                  sCurr: sells.spent[0].value,
                  fee: 0,
                  fCurr: "",
                  exchange: "DefiKingdoms: Serendale",
                  comments: `Start Meditation`,
                  group: "DefiKingdoms: Meditation Circle",
                  timestamp: processedLog.timestamp,
                };

                cointracking.push(formatted);
                formatted = {
                  type: "Other Expense",
                  buy: 0,
                  bCurr: "",
                  sell: "0x66f5bfd910cd83d3766c4b39d13730c911b2d286",
                  sCurr: sells.spent[1].value,
                  fee: 0,
                  fCurr: "ONE",
                  exchange: "DefiKingdoms: Serendale",
                  comments: `Start Meditation`,
                  group: "DefiKingdoms: Meditation Circle",
                  timestamp: processedLog.timestamp,
                };
                cointracking.push(formatted);
              } else if (processedLog.input.name === "completeMeditation") {
                formatted = {
                  type: "Other Fee",
                  buy: 0,
                  bCurr: "",
                  sell: 0,
                  sCurr: "",
                  fee: processedLog.gas * processedLog.gasPrice,
                  fCurr: "ONE",
                  exchange: "DefiKingdoms: Serendale",
                  comments: `Complete Meditation`,
                  group: "DefiKingdoms: Meditation Circle",
                  timestamp: processedLog.timestamp,
                };
                cointracking.push(formatted);
              } else {
                skipped.push(processedLog.hash);
              }
            }
          } else if (
            processedLog.to.name === "xJEWEL" ||
            processedLog.to.name === "JEWEL Token" ||
            processedLog.to.name === "Wrapped Matic" ||
            processedLog.to.name.includes("Jewel LP Token") ||
            processedLog.to.name === "Shvas Rune"
          ) {
            addABI(bankABI);

            loadedABIs.push(bankABI);
            processedLog = await decodeAndReplace(loadedABIs, log[i]);
            if (processedLog.input) {
              if (processedLog.input.name === "approve") {
                formatted = {
                  type: "Other Fee",
                  buy: 0,
                  bCurr: "",
                  sell: 0,
                  sCurr: "",
                  fee: processedLog.gas * processedLog.gasPrice,
                  fCurr: "ONE",
                  exchange: "DefiKingdoms: Serendale",
                  comments: `Approve ${processedLog.input.params[0].value}`,
                  group: "DefiKingdoms",
                  timestamp: processedLog.timestamp,
                };
                cointracking.push(formatted);
              } else if (processedLog.input.name === "enter") {
                formatted = {
                  type: "Other Fee",
                  buy: 0,
                  bCurr: "",
                  sell: 0,
                  sCurr: "",
                  fee: processedLog.gas * processedLog.gasPrice,
                  fCurr: "ONE",
                  exchange: "DefiKingdoms: Serendale",
                  comments: `Fee for Enter xJewel`,
                  group: "DefiKingdoms: Bank",
                  timestamp: processedLog.timestamp,
                };
                cointracking.push(formatted);
                // TODO: needs to be split into multiple txs as per cointracking staking recommends
                formatted = {
                  type: "Trade",
                  buy: processedLog.logs[0].events[2].value,
                  bCurr: processedLog.logs[0].address,
                  sell: processedLog.logs[1].events[2].value,
                  sCurr: processedLog.logs[1].address,
                  fee: 0,
                  fCurr: "",
                  exchange: "DefiKingdoms: Serendale",
                  comments: `Enter xJewel.`,
                  group: "DefiKingdoms: Bank",
                  timestamp: processedLog.timestamp,
                };
                cointracking.push(formatted);
              } else if (processedLog.input.name === "leave") {
                formatted = {
                  type: "Other Fee",
                  buy: 0,
                  bCurr: "",
                  sell: 0,
                  sCurr: "",
                  fee: processedLog.gas * processedLog.gasPrice,
                  fCurr: "ONE",
                  exchange: "DefiKingdoms: Serendale",
                  comments: `Fee for Leave xJewel`,
                  group: "DefiKingdoms: Bank",
                  timestamp: processedLog.timestamp,
                };
                cointracking.push(formatted);

                // TODO: needs to be split into multiple txs as per cointracking staking recommends
                formatted = {
                  type: "Trade",
                  buy: processedLog.logs[1].events[2].value,
                  bCurr: processedLog.logs[1].address,
                  sell: processedLog.logs[0].events[2].value,
                  sCurr: processedLog.logs[0].address,
                  fee: 0,
                  fCurr: "",
                  exchange: "DefiKingdoms: Serendale",
                  comments: `Leave xJewel.`,
                  group: "DefiKingdoms: Bank",
                  timestamp: processedLog.timestamp,
                };
                cointracking.push(formatted);
              } else {
                skipped.push(processedLog.hash);
              }
            }
          } else if (processedLog.to.name === "Hero Auction") {
            addABI(saleAuctionABI);
            loadedABIs.push(saleAuctionABI);
            processedLog = await decodeAndReplace(loadedABIs, log[i]);
            //TODO: only handles bids
            if (processedLog.input) {
              if (processedLog.input.name == "bid") {
                formatted = {
                  type: "Trade",
                  buy: 1,
                  bCurr: "DFKHERO",
                  sell: processedLog.input.params[1].value,
                  sCurr: "JEWEL",
                  fee: 0,
                  fCurr: "",
                  exchange: "DefiKingdoms: Serendale",
                  comments: `Buy Hero`,
                  group: "DefiKingdoms: Tavern",
                  timestamp: processedLog.timestamp,
                };
                cointracking.push(formatted);

                formatted = {
                  type: "Other Fee",
                  buy: 0,
                  bCurr: "",
                  sell: 0,
                  sCurr: "",
                  fee: processedLog.gas * processedLog.gasPrice,
                  fCurr: "ONE",
                  exchange: "DefiKingdoms: Serendale",
                  comments: `Fee for Hero Auction`,
                  group: "DefiKingdoms: Tavern",
                  timestamp: processedLog.timestamp,
                };

                cointracking.push(formatted);
              } else {
                skipped.push(processedLog.hash);
              }
            }
          } else if (processedLog.to.name === "UniswapV2Router02") {
            addABI(erc20ABI);
            addABI(routerABI);
            loadedABIs.push(erc20ABI);
            loadedABIs.push(routerABI);
            processedLog = await decodeAndReplace(loadedABIs, log[i]);

            // TODO: removeLiquidity methods
            if (processedLog.input.name === "swapETHForExactTokens") {
              formatted = {
                type: "Trade",
                buy: processedLog.logs[1].events[2].value,
                bCurr: processedLog.logs[1].address,
                sell: processedLog.logs[0].events[2].value,
                sCurr: "ONE",
                fee: processedLog.gas * processedLog.gasPrice,
                fCurr: "ONE",
                exchange: "DefiKingdoms: Serendale",
                comments: `Swap`,
                group: "DefiKingdoms: Swap",
                timestamp: processedLog.timestamp,
              };
              cointracking.push(formatted);
            } else if (processedLog.input.name === "swapExactTokensForTokens") {
              formatted = {
                type: "Trade",
                buy: processedLog.logs[1].events[2].value,
                bCurr: processedLog.logs[1].address,
                sell: processedLog.logs[0].events[2].value,
                sCurr: "ONE",
                fee: 0,
                fCurr: "",
                exchange: "DefiKingdoms: Serendale",
                comments: `Swap`,
                group: "DefiKingdoms: Swap",
                timestamp: processedLog.timestamp,
              };
              cointracking.push(formatted);
              formatted = {
                type: "Other Fee",
                buy: 0,
                bCurr: "",
                sell: 0,
                sCurr: "",
                fee: processedLog.gas * processedLog.gasPrice,
                fCurr: "ONE",
                exchange: "DefiKingdoms: Serendale",
                comments: `Fee for Swap`,
                group: "DefiKingdoms: Swap",
                timestamp: processedLog.timestamp,
              };
              cointracking.push(formatted);
            } else if (processedLog.input.name === "addLiquidity") {
              formatted = {
                type: "Deposit",
                buy: processedLog.logs[0].events[2].value,
                bCurr: processedLog.input.params[0].value,
                sell: 0,
                sCurr: "",
                fee: 0,
                fCurr: "",
                exchange: "DefiKingdoms: Serendale [Gardens]",
                comments: `Provide Liquidity`,
                group: "DefiKingdoms LP",
                timestamp: processedLog.timestamp,
              };
              cointracking.push(formatted);

              formatted = {
                type: "Withdrawal",
                buy: 0,
                bCurr: "",
                sell: processedLog.logs[0].events[2].value,
                sCurr: processedLog.input.params[0].value,
                fee: 0,
                fCurr: "",
                exchange: "DefiKingdoms: Serendale",
                comments: `Provide Liquidity`,
                group: "DefiKingdoms LP",
                timestamp: processedLog.timestamp,
              };
              cointracking.push(formatted);

              formatted = {
                type: "Deposit",
                buy: processedLog.logs[1].events[2].value,
                bCurr: processedLog.input.params[1].value,
                sell: 0,
                sCurr: "",
                fee: 0,
                fCurr: "",
                exchange: "DefiKingdoms: Serendale [Gardens]",
                comments: `Provide Liquidity`,
                group: "DefiKingdoms LP",
                timestamp: processedLog.timestamp,
              };
              cointracking.push(formatted);

              formatted = {
                type: "Withdrawal",
                buy: 0,
                bCurr: "",
                sell: processedLog.logs[1].events[2].value,
                sCurr: processedLog.input.params[1].vallue,
                fee: 0,
                fCurr: "",
                exchange: "DefiKingdoms: Serendale",
                comments: `Provide Liquidity`,
                group: "DefiKingdoms LP",
                timestamp: processedLog.timestamp,
              };

              cointracking.push(formatted);
              formatted = {
                type: "Income (Non Taxable)",
                buy: processedLog.logs[4].events[2].value,
                bCurr: processedLog.logs[4].address,
                sell: 0,
                sCurr: "",
                fee: 0,
                fCurr: "",
                exchange: "DefiKingdoms: Serendale [Gardens]",
                comments: `Provide Liquidity`,
                group: "DefiKingdoms LP",
                timestamp: processedLog.timestamp,
              };
              cointracking.push(formatted);

              formatted = {
                type: "Other Fee",
                buy: 0,
                bCurr: "",
                sell: 0,
                sCurr: "",
                fee: processedLog.gas * processedLog.gasPrice,
                fCurr: "ONE",
                exchange: "DefiKingdoms: Serendale",
                comments: `Fee for Hero Auction`,
                group: "DefiKingdoms: Tavern",
                timestamp: processedLog.timestamp,
              };

              cointracking.push(formatted);
            } else if (processedLog.input.name === "addLiquidityETH") {
              formatted = {
                type: "Trade",
                buy: processedLog.logs[1].events[2].value,
                bCurr: processedLog.logs[1].address,
                sell: processedLog.logs[0].events[2].value,
                sCurr: "ONE",
                fee: 0,
                fCurr: "",
                exchange: "DefiKingdoms: Serendale",
                comments: `Swap`,
                group: "DefiKingdoms: Swap",
                timestamp: processedLog.timestamp,
              };
              cointracking.push(formatted);
              formatted = {
                type: "Other Fee",
                buy: 0,
                bCurr: "",
                sell: 0,
                sCurr: "",
                fee: processedLog.gas * processedLog.gasPrice,
                fCurr: "ONE",
                exchange: "DefiKingdoms: Serendale",
                comments: `Fee for Swap`,
                group: "DefiKingdoms: Swap",
                timestamp: processedLog.timestamp,
              };
              cointracking.push(formatted);
            } else if (processedLog.input.name === "addLiquidity") {
              formatted = {
                type: "Deposit",
                buy: processedLog.logs[0].events[2].value,
                bCurr: processedLog.input.params[0].value,
                sell: 0,
                sCurr: "",
                fee: 0,
                fCurr: "",
                exchange: "DefiKingdoms: Serendale [Gardens]",
                comments: `Provide Liquidity`,
                group: "DefiKingdoms LP",
                timestamp: processedLog.timestamp,
              };
              cointracking.push(formatted);

              formatted = {
                type: "Withdrawal",
                buy: 0,
                bCurr: "",
                sell: processedLog.logs[0].events[2].value,
                sCurr: processedLog.input.params[0].value,
                fee: 0,
                fCurr: "",
                exchange: "DefiKingdoms: Serendale",
                comments: `Provide Liquidity`,
                group: "DefiKingdoms LP",
                timestamp: processedLog.timestamp,
              };
              cointracking.push(formatted);

              formatted = {
                type: "Deposit",
                buy: processedLog.logs[2].events[2].value,
                bCurr: processedLog.logs[2].address,
                sell: 0,
                sCurr: "",
                fee: 0,
                fCurr: "",
                exchange: "DefiKingdoms: Serendale [Gardens]",
                comments: `Provide Liquidity`,
                group: "DefiKingdoms LP",
                timestamp: processedLog.timestamp,
              };
              cointracking.push(formatted);

              formatted = {
                type: "Withdrawal",
                buy: 0,
                bCurr: "",
                sell: processedLog.logs[2].events[2].value,
                sCurr: processedLog.logs[2].address,
                fee: 0,
                fCurr: "",
                exchange: "DefiKingdoms: Serendale",
                comments: `Provide Liquidity`,
                group: "DefiKingdoms LP",
                timestamp: processedLog.timestamp,
              };

              cointracking.push(formatted);
              formatted = {
                type: "Deposit",
                buy: processedLog.logs[4].events[2].value,
                bCurr: processedLog.logs[4].address,
                sell: 0,
                sCurr: "",
                fee: 0,
                fCurr: "",
                exchange: "DefiKingdoms: Serendale [Gardens]",
                comments: `Provide Liquidity`,
                group: "DefiKingdoms LP",
                timestamp: processedLog.timestamp,
              };
              cointracking.push(formatted);
            } else {
              skipped.push(processedLog.hash);
            }
          } else if (processedLog.to.name === "Profiles") {
            addABI(profileABI);
            loadedABIs.push(profileABI);
            processedLog = await decodeAndReplace(loadedABIs, log[i]);
            if (processedLog.input) {
              if (processedLog.input.name === "createProfile") {
                formatted = {
                  type: "Other Fee",
                  buy: 0,
                  bCurr: "",
                  sell: 0,
                  sCurr: "",
                  fee: processedLog.gas * processedLog.gasPrice,
                  fCurr: "ONE",
                  exchange: "DefiKingdoms: Serendale",
                  comments: `Create Profile`,
                  group: "DefiKingdoms",
                  timestamp: processedLog.timestamp,
                };
              } else {
                skipped.push(processedLog.hash);
              }
            }
          } else if (processedLog.to.name === "Master Gardener") {
            addABI(masterGardenerABI);

            loadedABIs.push(masterGardenerABI);
            await decodeAndReplace(loadedABIs, log[i]);
            console.log(processedLog.input);
            //TODO :
            if (processedLog.input) {
              if (processedLog.input.name === "deposit") {
              } else if (processedLog.input.name === "claimRewards") {
              } else {
                skipped.push(processedLog.hash);
              }
            }
          } else if (processedLog.to.name === "Hero") {
            addABI(heroABI);
            loadedABIs.push(heroABI);
            await decodeAndReplace(loadedABIs, log[i]);
          } else {
            skipped.push(processedLog.hash);
          }
        } else {
          skipped.push(log[i]);
        }
      }
    }

    async function decodeAndReplace(loadedABIs: any[], tx: any) {
      let processedLog = tx;
      if (loadedABIs.length > 0) {
        await decodeABIs(tx).then((res) => {
          (processedLog.logs = res[0]), (processedLog.input = res[1]);
        });

        while (loadedABIs.length) {
          removeABI(loadedABIs.pop());
        }

        // let replacedLogAddresses = await replaceLogAddresses(
        //   contracts,
        //   processedLog.logs
        // );
        // let replacedInputAddresses = await replaceInputAddresses(
        //   contracts,
        //   processedLog.input
        // );
        // processedLog.logs = replacedLogAddresses;
      }

      return processedLog;
    }

    async function decodeABIs(tx: any) {
      let logs: [] = await decodeLogs(tx.logs);
      let input: [] = await decodeMethod(tx.input);
      return [logs, input];
    }

    await getContracts();
    await processTransactions();

    for (let l of cointracking) {
      //TODO quest addresses in comments
      for (let c of contracts) {
        if (l.bCurr == c.address) {
          l.bCurr = c.name;
        }
        if (l.sCurr == c.address) {
          l.sCurr = c.name;
        }
        if (l.fCurr == c.address) {
          l.fCurr = c.name;
        }
      }
    }

    context.data.log = cointracking;
    context.data.skipped = skipped;

    return context;
  };
};

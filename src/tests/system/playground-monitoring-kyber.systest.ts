// import { toBeTrueWith } from '../utils/toBeTrueWith';
// import { getSystemTestEnvironment } from '../utils/getSystemTestEnvironment';
// import { Tracks } from '~/utils/environment/Environment';
// import { getLogCurried } from '~/utils/environment/getLogCurried';
// import { getFundDetails } from '~/contracts/factory/calls/getFundDetails';
// import { isShutDown } from '~/contracts/fund/hub/calls/isShutDown';
// import { getRoutes } from '~/contracts/fund/hub/calls/getRoutes';
// // import { getFundHoldings } from '~/contracts/fund/accounting/calls/getFundHoldings';
// import { performCalculations } from '~/contracts/fund/accounting/calls/performCalculations';
// import { getAmguPrice } from '~/contracts/engine/calls/getAmguPrice';
// import axios from 'axios';

// import * as coinapi from './.coinapi.json';
// import { createPrice, valueIn, add, toFixed } from '@melonproject/token-math';
// import { getTokenBySymbol } from '~/utils/environment/getTokenBySymbol';
// import { createToken } from '@melonproject/token-math';
// import { createQuantity } from '@melonproject/token-math';
// import { getHistoricalInvestors } from '~/contracts/fund/participation/calls/getHistoricalInvestors';
// import { getTotalAmguConsumed } from '~/contracts/engine/calls/getTotalAmguConsumed';
// import { getTotalEtherConsumed } from '~/contracts/engine/calls/getTotalEtherConsumed';
// import { getTotalMlnBurned } from '~/contracts/engine/calls/getTotalMlnBurned';
// // import { balanceOf } from '~/contracts/dependencies/token/calls/balanceOf';
// import { getPremiumPercent } from '~/contracts/engine/calls/getPremiumPercent';
// // import { getToken } from '~/contracts/dependencies/token/calls/getToken';
// // import { getInfo } from '~/contracts/dependencies/token/calls/getInfo';
// // import { getFundComponents } from '~/utils/getFundComponents';
// import { getInfo } from '~/contracts/dependencies/token/calls/getInfo';

// expect.extend({ toBeTrueWith });

// const getLog = getLogCurried('melon:protocol:systemTest:monitoring');

// describe('playground', () => {
//   test('Happy path', async () => {
//     const master = await getSystemTestEnvironment(Tracks.KYBER_PRICE);
//     const log = getLog(master);
//     const { melonContracts } = master.deployment;

//     const { engine } = melonContracts;

//     let axinst = axios.create(coinapi);

//     const getRate = async (a, b) => {
//       log.debug('CoinAPI rate for: ' + a + '/' + b);
//       try {
//         const response = await axinst.get('/v1/exchangerate/' + a + '/' + b);
//         return response.data;
//       } catch (error) {
//         return { rate: 1 };
//         // log.debug('CoinAPI Error', error);
//       }
//     };

//     const tokens = {
//       USD: createToken('USD', null),
//       MLN: getTokenBySymbol(master, 'MLN'),
//       ETH: getTokenBySymbol(master, 'WETH'),
//     };

//     const rates = {
//       MLNETH: await getRate('MLN', 'ETH'),
//       MLNUSD: await getRate('MLN', 'USD'),
//       ETHUSD: await getRate('ETH', 'USD'),
//     };

//     const prices = {
//       MLNETH: createPrice(
//         createQuantity(tokens.MLN, 1),
//         createQuantity(tokens.ETH, rates.MLNETH.rate),
//       ),
//       MLNUSD: createPrice(
//         createQuantity(tokens.MLN, 1),
//         createQuantity(tokens.USD, rates.MLNUSD.rate),
//       ),
//       ETHUSD: createPrice(
//         createQuantity(tokens.ETH, 1),
//         createQuantity(tokens.USD, rates.ETHUSD.rate),
//       ),
//     };

//     log.debug('Prices: ', prices);

//     // high level data
//     const amguPrice = await getAmguPrice(master, engine);
//     log.debug('Amgu Price: ', amguPrice);

//     const amguConsumed = await getTotalAmguConsumed(master, engine);
//     log.debug('Amgu Consumed: ', amguConsumed);

//     const etherConsumed = await getTotalEtherConsumed(master, engine);
//     log.debug('Ether Consumed: ', etherConsumed);

//     const mlnBurned = await getTotalMlnBurned(master, engine);
//     log.debug('MLN burnt: ', mlnBurned);

//     const premiumPercent = await getPremiumPercent(master, engine);
//     log.debug('Premium percent: ', premiumPercent);

//     const mlnInfo = await getInfo(master, tokens.MLN.address);
//     log.debug('MLN Info', mlnInfo);

//     // fund list

//     const fundList = await getFundDetails(
//       master,
//       melonContracts.ranking,
//       melonContracts.version,
//     );

//     log.debug('original fund list: ', fundList);

//     let numberOfFunds = {
//       active: 0,
//       inActive: 0,
//       total: 0,
//     };

//     let totalAUM = {
//       ETH: createQuantity(tokens.ETH, 0),
//       USD: createQuantity(tokens.USD, 0),
//     };

//     let investorList = [];
//     // let components = [];

//     // loop through funds to get interesting quantities
//     for (let i in fundList) {
//       // fundList[i].components = await getFundComponents(master, fundList[i].address);
//       fundList[i].isShutDown = await isShutDown(master, fundList[i].address);
//       fundList[i].routes = await getRoutes(master, fundList[i].address);
//       // fundList[i].holdings = await getFundHoldings(
//       //   master,
//       //   fundList[i].routes.accountingAddress,
//       // );
//       fundList[i].calcs = await performCalculations(
//         master,
//         fundList[i].routes.accountingAddress,
//       );

//       fundList[i].investors = await getHistoricalInvestors(
//         master,
//         fundList[i].routes.participationAddress,
//       );

//       fundList[i].investors = await getHistoricalInvestors(
//         master,
//         fundList[i].routes.participationAddress,
//       );
//       investorList = investorList.concat(fundList[i].investors);

//       const targetCurrency = 'ETH';
//       let quoteCurrency = fundList[i].sharePrice.quote.token.symbol;

//       if (quoteCurrency == 'WETH') {
//         quoteCurrency = 'ETH';
//       }

//       // create price with ETH, get rate (if necessary)
//       let pair = quoteCurrency + targetCurrency;
//       if (!rates.hasOwnProperty(pair)) {
//         if (targetCurrency != quoteCurrency) {
//           rates[pair] = await getRate(quoteCurrency, targetCurrency);
//         } else {
//           rates[pair] = { rate: 1 };
//         }
//       }
//       if (!tokens.hasOwnProperty(quoteCurrency)) {
//         tokens[quoteCurrency] = getTokenBySymbol(master, quoteCurrency);
//       }
//       if (!prices.hasOwnProperty(pair)) {
//         prices[pair] = createPrice(
//           createQuantity(tokens[quoteCurrency], 1),
//           createQuantity(tokens[targetCurrency], rates[pair].rate),
//         );
//       }

//       // create price with USD, get rate (if necessary)
//       pair = quoteCurrency + 'USD';
//       if (!rates.hasOwnProperty(pair)) {
//         rates[pair] = await getRate(quoteCurrency, 'USD');
//       }
//       if (!tokens.hasOwnProperty(quoteCurrency)) {
//         tokens[quoteCurrency] = getTokenBySymbol(master, quoteCurrency);
//       }
//       if (!prices.hasOwnProperty(pair)) {
//         prices[pair] = createPrice(
//           createQuantity(tokens[quoteCurrency], 1),
//           createQuantity(tokens.USD, rates[pair].rate),
//         );
//       }

//       fundList[i].fundNAV = {
//         ETH: valueIn(prices[quoteCurrency + 'ETH'], fundList[i].calcs.nav),
//         USD: valueIn(prices[quoteCurrency + 'USD'], fundList[i].calcs.nav),
//       };

//       //
//       if (!fundList[i].isShutDown) {
//         totalAUM.ETH = add(totalAUM.ETH, fundList[i].fundNAV.ETH);
//         totalAUM.USD = add(totalAUM.USD, fundList[i].fundNAV.USD);
//       }
//       //   fundList[i].numberOfShares =
//       //     fundList[i].calcs.nav.quantity /
//       //     fundList[i].calcs.sharePrice.quote.quantity;
//       // }
//     }

//     log.debug('Modified fund list', fundList);

//     // Number of funds (active, inactive, total)
//     numberOfFunds.active = fundList.filter(f => {
//       return f.isShutDown === false;
//     }).length;
//     log.debug('Active funds: ', numberOfFunds.active);

//     numberOfFunds.inActive = fundList.filter(f => {
//       return f.isShutDown === true;
//     }).length;
//     log.debug('Inactive funds: ', numberOfFunds.inActive);

//     // AuM in ETH and USD
//     log.debug('AuM in ETH:', totalAUM.ETH);
//     log.debug('AuM in USD:', totalAUM.USD);

//     // Amgu Price in various currencies
//     log.debug('Amgu price (MLN): ', toFixed(amguPrice, 18));
//     log.debug(
//       'Amgu price (ETH): ',
//       toFixed(valueIn(prices.MLNETH, amguPrice), 18),
//     );
//     log.debug(
//       'Amgu price (USD): ',
//       toFixed(valueIn(prices.MLNUSD, amguPrice), 18),
//     );

//     // Fund Ranking AuM (ETH)
//     const top10Funds = fundList
//       .filter(f => {
//         return f.isShutDown === false;
//       })
//       .sort((a, b) => {
//         return a.fundNAV.ETH < b.fundNAV.ETH
//           ? 1
//           : a.fundNAV.ETH > b.fundNAV.ETH
//           ? -1
//           : 0;
//       });

//     log.debug('Top 10 Funds: ', top10Funds);

//     // loop through investors to get balance
//     investorList = investorList.map(x => {
//       return { address: x };
//     });

//     // for (let i in investorList) {
//     //   // investorList[i].balance = investorList[i].address;
//     //   investorList[i].balance = await fundList[i].components.shares.methods
//     //     .balanceOf(investorList[i].address)
//     //     .call();
//     // }
//     // console.log(investorList);

//     //  random stuff so that everything before runs and logs correctly
//     let fundList2 = await getFundDetails(
//       master,
//       melonContracts.ranking,
//       melonContracts.version,
//     );

//     log.debug('Random fund list at the end : ', fundList2);
//   });
// });

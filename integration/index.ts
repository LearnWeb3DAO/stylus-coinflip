import { formatEther, parseEther, parseEventLogs } from "viem";
import { coinflip, walletClient } from "./chain";
import { waitForTransactionReceipt } from "viem/actions";

async function main() {
  const tx = await walletClient.sendTransaction({
    to: coinflip.address,
    value: parseEther("0.001"),
  });
  const receipt = await walletClient.waitForTransactionReceipt({
    hash: tx,
  });
  console.log(receipt);

  const tx1 = await coinflip.write.newGame({
    value: parseEther("0.0001"),
  });
  const gameReceipt = await walletClient.waitForTransactionReceipt({
    hash: tx1,
  });

  const gameCreatedLogs = parseEventLogs({
    logs: gameReceipt.logs,
    abi: coinflip.abi,
  });
  console.log(gameCreatedLogs);
  const gameCreatedLog = gameCreatedLogs.find(
    (log) => log.eventName === "GameCreated"
  );

  const unwatch = walletClient.watchContractEvent({
    fromBlock: gameReceipt.blockNumber,
    address: coinflip.address,
    abi: coinflip.abi,
    eventName: "GameResolved",
    onLogs: async (logs) => {
      for (const log of logs) {
        if (log.args.nonce === gameCreatedLog?.args.nonce) {
          console.log(log);

          let coinflipBalance = await walletClient.getBalance({
            address: coinflip.address,
          });
          console.log(
            `Coinflip contract has ${formatEther(coinflipBalance)} ETH`
          );

          // const withdrawTx = await coinflip.write.withdraw([coinflipBalance]);
          // const withdrawReceipt = await walletClient.waitForTransactionReceipt({
          //   hash: withdrawTx,
          // });
          // const withdrawalLogs = parseEventLogs({
          //   logs: withdrawReceipt.logs,
          //   abi: coinflip.abi,
          // });
          // const withdrawalLog = withdrawalLogs.find(
          //   (log) => log.eventName === "Withdrawal"
          // );
          // console.log(withdrawalLog);
          coinflipBalance = await walletClient.getBalance({
            address: coinflip.address,
          });
          console.log(
            `Coinflip contract has ${formatEther(coinflipBalance)} ETH`
          );
          unwatch();
        }
      }
    },
  });
}

main();

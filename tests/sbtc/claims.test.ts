import { describe, expect, it } from "vitest";
import { Cl, principalCV, uintCV } from "@stacks/transactions";
import { alice, bob, constructDao, deployer, metadataHash, setupSimnet, sbtcToken } from "../helpers";

const simnet = await setupSimnet();

/*
  The test below is an example. Learn more in the clarinet-sdk readme:
  https://github.com/hirosystems/clarinet/blob/develop/components/clarinet-sdk/README.md
*/

describe("claiming errors", () => {
  it("err-market-not-found", async () => {
    constructDao(simnet);
    let response = await simnet.callPublicFn( 
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(0), Cl.none(),
        Cl.principal(sbtcToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    ); 
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    // not deployer
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "claim-winnings",
      [Cl.uint(1), Cl.principal(sbtcToken)],
      deployer
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10005)));
  });

  it("err-user-balance-unknown", async () => {
    constructDao(simnet);
    let response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(0), Cl.none(),
        Cl.principal(sbtcToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]), 
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "claim-winnings",
      [Cl.uint(0), Cl.principal(sbtcToken)],
      alice
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10008)));
  });

  it("err-market-not-concluded", async () => {
    constructDao(simnet);
    let response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(0), Cl.none(),
        Cl.principal(sbtcToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(2000000), Cl.principal(sbtcToken)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "claim-winnings",
      [Cl.uint(0), Cl.principal(sbtcToken)],
      alice
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10009)));
  });

  it("err-user-not-winner", async () => {
    constructDao(simnet);
    let response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(0), Cl.none(),
        Cl.principal(sbtcToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-no-stake",
      [Cl.uint(0), Cl.uint(2000000), Cl.principal(sbtcToken)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "resolve-market",
      [Cl.uint(0), Cl.bool(true)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "claim-winnings",
      [Cl.uint(0), Cl.principal(sbtcToken)],
      bob
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10009)));
  });

  it("err-winning-pool-is-zero", async () => {
    // unreachable
  });

  it("err-market-not-concluded", async () => {
    constructDao(simnet);
    let response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(0), Cl.none(),
        Cl.principal(sbtcToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-no-stake",
      [Cl.uint(0), Cl.uint(2000000), Cl.principal(sbtcToken)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    // response = await simnet.callPublicFn(
    //   "bde023-market-predicting",
    //   "resolve-market",
    //   [Cl.uint(0), Cl.bool(true)],
    //   developer
    // );
    // expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "claim-winnings",
      [Cl.uint(0), Cl.principal(sbtcToken)],
      bob
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10009)));
  });
});

describe("successful claim", () => {
  it("bob wins 50% of pool", async () => {
    constructDao(simnet);
    let response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "create-market",
      [
        Cl.uint(0), Cl.none(),
        Cl.principal(sbtcToken),
        Cl.bufferFromHex(metadataHash()),
        Cl.list([]),
      ],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(0)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(5000), Cl.principal(sbtcToken)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "predict-yes-stake",
      [Cl.uint(0), Cl.uint(5000), Cl.principal(sbtcToken)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

    let aliceStake = simnet.getMapEntry(
      "bde023-market-predicting",
      "stake-balances",
      Cl.tuple({
        "market-id": uintCV(0),
        user: principalCV(alice),
      })
    );
    expect(aliceStake).toEqual(
      Cl.some(
        Cl.tuple({
          "yes-amount": uintCV(4950n),
          "no-amount": uintCV(0),
        })
      )
    );

    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "resolve-market",
      [Cl.uint(0), Cl.bool(true)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

    simnet.mineEmptyBlocks(10);
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "resolve-market-undisputed",
      [Cl.uint(0)],
      deployer
    );
    expect(response.result).toEqual(Cl.error(Cl.uint(10019)));

    simnet.mineEmptyBlocks(145);
    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "resolve-market-undisputed",
      [Cl.uint(0)],
      deployer
    );
    expect(response.result).toEqual(Cl.ok(Cl.bool(true)));

    let data = await simnet.callReadOnlyFn(
      "bde023-market-predicting",
      "get-stake-balances",
      [Cl.uint(0), Cl.principal(alice)],
      alice
    );
    expect(data.result).toEqual(
      Cl.some(
        Cl.tuple({
          "yes-amount": uintCV(4950n),
          "no-amount": uintCV(0),
        })
      )
    );
    let stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
    console.log(
      "contractBalance 215: " +
        stxBalances?.get(deployer + ".bde023-market-predicting")
    );

    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "claim-winnings",
      [Cl.uint(0), Cl.principal(sbtcToken)],
      alice
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(4876n)));

    stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
    console.log(
      "contractBalance 228: " +
        stxBalances?.get(deployer + ".bde023-market-predicting")
    );

    response = await simnet.callPublicFn(
      "bde023-market-predicting",
      "claim-winnings",
      [Cl.uint(0), Cl.principal(sbtcToken)],
      bob
    );
    expect(response.result).toEqual(Cl.ok(Cl.uint(4876n)));
    stxBalances = simnet.getAssetsMap().get("STX"); // Replace if contract's principal
    console.log(
      "contractBalance 242: " +
        stxBalances?.get(deployer + ".bde023-market-predicting")
    );
  });
});

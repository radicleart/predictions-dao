;; Title: BDP000 account gating
;; Author: mijoco.btc
;; Description:
;; GENERATE TESTNET MERKLE ROOTS FOR MARKET CREATION

(impl-trait .proposal-trait.proposal-trait)

(define-public (execute (sender principal))
	(begin
		;; Enable merkle root.
		;; see account-gating.test.ts / GENERATE TESTNET MERKLE ROOTS FOR MARKET CREATION
		;; const allowedCreators = ["ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV", "ST2RPDWF6N939Y32C4ZEVC74SCRTGSJBFBPJP05H5", "ST167Z6WFHMV0FZKFCRNWZ33WTB0DFBCW9M1FW3AY"];
		(try! (contract-call? .bde022-market-gating set-merkle-root-by-principal .bde023-market-predicting 0x88bbe7a9506b98e89f83df1cd16fea8402a1fcdd56c7e021b109a053bbf01cf7))

		(print "Merkle root for account gating updated.")
		(ok true)
	)
)

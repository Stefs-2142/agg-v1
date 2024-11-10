import Buffer "mo:base/Buffer";
import Float "mo:base/Float";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Error "mo:base/Error";
import Debug "mo:base/Debug";
import Types "types";
import Map "mo:map/Map";
import { thash } "mo:map/Map";
import DPC "./IcpSwapDynamicPoolCreator";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Nat64 "mo:base/Nat64";
import K "./KongSwap";
import Blob "mo:base/Blob";
import Text "mo:base/Text";
import L "./Ledger";
import { principalIdFromTokenTicker }  "IcpSwapDynamicPoolCreator";

actor class DexAggregator() = this {
    // Type aliases for better readability
    type DexInfo = Types.DexInfo;
    type QuoteResponse = Types.QuoteResponse;
    type Error = Types.Error;
    type Result<A, B> = Types.Result<A, B>;
    type IcpSwapPoolProperties = Types.IcpSwapPoolProperties;
    type IcpSwapPoolActor = Types.IcpSwapPoolActor;
    type KongSwapPollActor = Types.KongSwapPoolActor;
    type SwapArgs = K.SwapArgs;
    type SwapResult = K.SwapResult;
    type SwapReply = K.SwapReply;
    type Ledger = Types.Ledger;
    
    // ICRC types
    type Account = { owner : Principal; subaccount : ?Blob };
    type TransferArg = {
        to : Account;
        fee : ?Nat;
        memo : ?Blob;
        from_subaccount : ?Blob;
        created_at_time : ?Nat64;
        amount : Nat;
    };
    type TransferFromArgs = {
        to : Account;
        fee : ?Nat;
        spender_subaccount : ?Blob;
        from : Account;
        memo : ?Blob;
        created_at_time : ?Nat64;
        amount : Nat;
    };
    type TransferError = {
        #BadFee : { expected_fee : Nat };
        #BadBurn : { min_burn_amount : Nat };
        #InsufficientFunds : { balance : Nat };
        #TooOld;
        #CreatedInFuture : { ledger_time : Nat64 };
        #Duplicate : { duplicate_of : Nat };
        #TemporarilyUnavailable;
        #GenericError : { error_code : Nat; message : Text };
    };
    type TokenLedger = actor {
        icrc1_transfer : shared TransferArg -> async { #Ok : Nat; #Err : TransferError };
        icrc2_transfer_from : shared TransferFromArgs -> async { #Ok : Nat; #Err : TransferError };
    };
    
    // Position type for swap execution
    type Position = {
        tokenToSell: Text;
        tokenToBuy: Text;
        amountToSell: Nat;
        beneficiary: Principal;
    };

    // Store registered DEXes
    private let dexMap = Map.new<Text, DexInfo>();
    
    // Store pool configurations
    private let icpSwapPoolMap = Map.new<Text, IcpSwapPoolProperties>();

    // Initialize pool configurations
    let icpCkBtcPool: IcpSwapPoolProperties = {
        poolPrincipalId = "xmiu5-jqaaa-aaaag-qbz7q-cai";
        tokenToSellLedgerFee = 10_000; // ICP fee
        tokenToBuyLedgerFee = 10; // ckBTC fee
    };
    ignore Map.put(icpSwapPoolMap, thash, DPC.makeKey("ICP", "ckBTC"), icpCkBtcPool);

    // ICP/ckETH pool
    let icpCkEthPool: IcpSwapPoolProperties = {
        poolPrincipalId = "angxa-baaaa-aaaag-qcvnq-cai";
        tokenToSellLedgerFee = 10_000; // ICP fee
        tokenToBuyLedgerFee = 2_000_000_000_000; // ckETH fee 140_000
    };
    ignore Map.put(icpSwapPoolMap, thash, DPC.makeKey("ICP", "ckETH"), icpCkEthPool);

    // ckUSDC/ICP pool
    let icpUsdcPool: IcpSwapPoolProperties = {
        poolPrincipalId = "mohjv-bqaaa-aaaag-qjyia-cai";
        tokenToBuyLedgerFee = 10_000; // ckUSDC fee
        tokenToSellLedgerFee = 10_000; // ICP fee
    };
    ignore Map.put(icpSwapPoolMap, thash, DPC.makeKey("ICP", "ckUSDC"), icpUsdcPool);

    // ckUSDT/ICP pool
    let icpUsdtPool: IcpSwapPoolProperties = {
        poolPrincipalId = "hkstf-6iaaa-aaaag-qkcoq-cai";
        tokenToSellLedgerFee = 10_000; // ckUSDT fee
        tokenToBuyLedgerFee = 10_000; // ICP fee
    };
    ignore Map.put(icpSwapPoolMap, thash, DPC.makeKey("ICP", "ckUSDT"), icpUsdtPool);

    // Add a new DEX to the aggregator
    public shared func addDex(name: Text, backendCanisterId: Principal) : async Result<(), Error> {
        let dexInfo : DexInfo = {
            name = name;
            backendCanisterId = backendCanisterId;
        };
        
        ignore Map.put(dexMap, thash, name, dexInfo);
        #ok(())
    };

    // Remove a DEX from the aggregator
    public shared func removeDex(name: Text) : async Result<(), Error> {
        switch (Map.get(dexMap, thash, name)) {
            case (null) {
                #err(#InvalidDex("DEX not found"));
            };
            case (?_) {
                ignore Map.remove(dexMap, thash, name);
                #ok(());
            };
        };
    };

    // Get quotes from all registered DEXes
    public shared func getQuotes(tokenToSell: Text, tokenToBuy: Text, amount: Nat, _slippage: Float) : async Result<[QuoteResponse], Error> {
        var quotes = Buffer.Buffer<QuoteResponse>(0);

        // Try to get ICP Swap quote
        switch (DPC.getIcpSwapDynamicSwapProperties(icpSwapPoolMap, tokenToSell, tokenToBuy)) {
            case (?icpSwapProperties) {
                Debug.print("ICPSwap:pool for pair created");
                try {
                    let icpSwapPoolActor = icpSwapProperties.dynamicPool;
                    let icpSwapQuoteResult = await icpSwapPoolActor.quote({
                        amountIn = Nat.toText(amount);
                        zeroForOne = false;
                        amountOutMinimum = "0";
                    });

                    switch (icpSwapQuoteResult) {
                        case (#ok(quoteValue)) {
                            Debug.print("ICPSwap: Quote value: " # debug_show(quoteValue));
                            quotes.add({
                                dexName = "ICPSwap";
                                inputAmount = amount;
                                outputAmount = quoteValue;
                            });
                        };
                        case (#err(error)) {
                            Debug.print("[ERROR] ICPSwap quote failed: " # debug_show(error));
                            // Continue to next DEX even if this one fails
                        };
                    };
                } catch (e) {
                    Debug.print("[ERROR] ICPSwap quote error: " # Error.message(e));
                    // Continue to next DEX even if this one fails
                };
            };
            case (null) {
                Debug.print("[INFO] No ICPSwap pool found for " # tokenToSell # " -> " # tokenToBuy);
                // Continue to next DEX if no pool found
            };
        };

        // Try to get KongSwap quote
        try {
            let kongSwapActor = actor("2ipq2-uqaaa-aaaar-qailq-cai") : KongSwapPollActor;
            let kongSwapQuoteResult = await kongSwapActor.swap_amounts(
                tokenToSell,
                amount,
                tokenToBuy
            );

            switch (kongSwapQuoteResult) {
                case (#Ok(quoteResult)) {
                    Debug.print("KongSwap: Quote value: " # debug_show(quoteResult));
                    quotes.add({
                        dexName = "KongSwap";
                        inputAmount = amount;
                        outputAmount = quoteResult.receive_amount;
                    });
                };
                case (#Err(error)) {
                    Debug.print("[ERROR] KongSwap quote failed: " # error);
                    // Continue even if this DEX fails
                };
            };
        } catch (e) {
            Debug.print("[ERROR] KongSwap quote error: " # Error.message(e));
            // Continue even if this DEX fails
        };

        // Return error if no quotes were obtained
        if (quotes.size() == 0) {
            #err(#QuoteFailed("No quotes available from any DEX"));
        }
        else {
            #ok(Buffer.toArray(quotes));
        };
    };

    // Get the best quote (maximum outputAmount) from all DEXes
    public shared func getBestQuote(tokenToSell: Text, tokenToBuy: Text, amount: Nat, slippage: Float) : async Result<QuoteResponse, Error> {
        let quotesResult = await getQuotes(tokenToSell, tokenToBuy, amount, slippage);
        
        switch (quotesResult) {
            case (#err(e)) { #err(e) };
            case (#ok(quotes)) {
                if (quotes.size() == 0) {
                    return #err(#QuoteFailed("No quotes available"));
                };

                var bestQuote = quotes[0];
                for (quote in quotes.vals()) {
                    if (quote.outputAmount > bestQuote.outputAmount) {
                        bestQuote := quote;
                    };
                };
                #ok(bestQuote)
            };
        };
    };

    // Execute swap with the best available DEX
    public shared func executeBestSwap(tokenToSell: Text, tokenToBuy: Text, amount: Nat, beneficiary: Principal, slippage: Float) : async Result<Text, Error> {
        // Get the best quote first
        let bestQuoteResult = await getBestQuote(tokenToSell, tokenToBuy, amount, slippage);
        
        switch (bestQuoteResult) {
            case (#err(e)) { #err(e) };
            case (#ok(bestQuote)) {
                let position : Position = {
                    tokenToSell = tokenToSell;
                    tokenToBuy = tokenToBuy;
                    amountToSell = amount;
                    beneficiary = beneficiary;
                };

                // Execute the swap with the best DEX
                switch (bestQuote.dexName) {
                    case ("ICPSwap") {
                        let result = await _performMultiStagePurchase(position);
                        switch (result) {
                            case (#ok(amount)) { #ok(amount) };
                            case (#err(e)) { #err(#Other(e)) };
                        };
                    };
                    case ("KongSwap") {
                        try {
                            await _performPurchase(position);
                            #ok("Swap executed successfully with KongSwap")
                        } catch (e) {
                            #err(#Other(Error.message(e)))
                        };
                    };
                    case (_) {
                        #err(#InvalidDex("Unknown DEX"))
                    };
                };
            };
        };
    };

    // Get all registered DEXes
    public query func getAllDexes() : async [DexInfo] {
        let dexes = Buffer.Buffer<DexInfo>(0);
        for ((_, dexInfo) in Map.entries(dexMap)) {
            dexes.add(dexInfo);
        };
        Buffer.toArray(dexes)
    };

    // System method to check if a DEX is registered
    public query func isDexRegistered(name: Text) : async Bool {
        switch (Map.get(dexMap, thash, name)) {
            case (null) { false };
            case (?_) { true };
        };
    };

    // Method to view all pool configurations
    public shared query func getAllPools() : async Result<[(Text, IcpSwapPoolProperties)], Text> {
        let entries = Map.entries(icpSwapPoolMap);
        let result = Buffer.Buffer<(Text, IcpSwapPoolProperties)>(0);

        for ((key, properties) in entries) {
            result.add((key, properties));
        };

        Debug.print("[INFO]: Admin requested pool configurations");
        #ok(Buffer.toArray(result));
    };

    // ICPSwap specific methods
    private func _performMultiStagePurchase(position : Position) : async Result<Text, Text> {
        let tokenToSell = position.tokenToSell;
        let tokenToBuy = position.tokenToBuy;
        
        // Get dynamic swap properties for the token pair
        let dynamicSwapProperties = DPC.getIcpSwapDynamicSwapProperties(icpSwapPoolMap, tokenToSell, tokenToBuy);

        let tokenToSellPrincipalId: Text = principalIdFromTokenTicker(tokenToSell);
        let tokenToBuyPrincipalId: Text = principalIdFromTokenTicker(tokenToBuy);
        
        switch (dynamicSwapProperties) {
            case (null) { return #err("[ERROR]: Failed to get swap properties for token pair") };
            case (?swapProps) {
                // Transfer tokens from user to AGG canister
                let tokenToSellLedger = actor(tokenToSellPrincipalId) : TokenLedger;
                let transferFromArgs : TransferFromArgs = {
                    spender_subaccount = null;
                    from = {
                        owner = position.beneficiary;
                        subaccount = null;
                    };
                    to = {
                        owner = Principal.fromActor(this);
                        subaccount = null;
                    };
                    amount = position.amountToSell - swapProps.tokenToSellLedgerFee;
                    fee = ?swapProps.tokenToSellLedgerFee;
                    memo = null;
                    created_at_time = null;
                };

                let transferResult = await tokenToSellLedger.icrc2_transfer_from(transferFromArgs);
                Debug.print("[INFO]: Trying to transfer tokens from Beneficiary to AGG");
                Debug.print("[INFO]: Token: " # debug_show(position.tokenToSell) # " Amount: " # debug_show(position.amountToSell - swapProps.tokenToSellLedgerFee));

                switch transferResult {
                    case (#Err(error)) {
                        return #err("[ERROR]: Error while transferring tokens to AGG " # debug_show(error));
                    };
                    case (#Ok(_)) {
                        // Deposit tokens to pool
                        let poolDepositResult = await swapProps.dynamicPool.depositFrom({
                            fee = swapProps.tokenToSellLedgerFee;
                            token = tokenToSellPrincipalId;
                            amount = position.amountToSell;
                        });
                        Debug.print("[INFO]: Deposit result: " # debug_show(poolDepositResult));
                        switch poolDepositResult {
                            case (#err(error)) {
                                return #err("[ERROR]: Error while depositing tokens to pool " # debug_show(error));
                            };
                            case (#ok(_)) {
                                let amountOutMinimum = 0; // TODO: Calculate minimum amount based on slippage
                                let swapPoolResult = await swapProps.dynamicPool.swap({
                                    amountIn = Nat.toText(position.amountToSell);
                                    zeroForOne = false;
                                    amountOutMinimum = Int.toText(amountOutMinimum);
                                });

                                switch swapPoolResult {
                                    case (#err(error)) {
                                        return #err("[ERROR]: Error while swapping tokens in ICPSwap " # debug_show(error));
                                    };
                                    case (#ok(value)) {
                                        Debug.print("[INFO]: DEX Swap result value: " # debug_show(value));
                                        let balanceResult = await swapProps.dynamicPool.getUserUnusedBalance(Principal.fromActor(this));
                                        
                                        switch (balanceResult) {
                                            case (#err(error)) {
                                                return #err("[ERROR]: Error while getting balance " # debug_show(error));
                                            };
                                            case (#ok { balance0; balance1 = _ }) {
                                                let withdrawResult = await swapProps.dynamicPool.withdraw({
                                                    amount = balance0;
                                                    fee = swapProps.tokenToBuyLedgerFee;
                                                    token = tokenToBuyPrincipalId;
                                                });
                                                Debug.print("[INFO]: Trying to withdraw tokens from pool");
                                                switch withdrawResult {
                                                    case (#err(error)) {
                                                        return #err("[ERROR]: Error while withdrawing tokens from pool " # debug_show(error));
                                                    };
                                                    case (#ok(value)) {
                                                        Debug.print("[INFO]: Withdraw result: " # debug_show(value));
                                                        let amountToSend = balance0 - swapProps.tokenToBuyLedgerFee;
                                                        let tokenToBuyLedger = actor(tokenToBuyPrincipalId) : TokenLedger;
                                                        let transferArg : TransferArg = {
                                                            to = { owner = position.beneficiary; subaccount = null };
                                                            fee = ?swapProps.tokenToBuyLedgerFee;
                                                            memo = null;
                                                            from_subaccount = null;
                                                            created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
                                                            amount = amountToSend - swapProps.tokenToBuyLedgerFee;
                                                        };
                                                        Debug.print("[INFO]: Trying to transfer tokens to beneficiary");
                                                        let sendResult = await tokenToBuyLedger.icrc1_transfer(transferArg);

                                                        switch sendResult {
                                                            case (#Err(error)) {
                                                                return #err("[ERROR]: Error while transferring tokens to beneficiary " # debug_show(error));
                                                            };
                                                            case (#Ok(value)) {
                                                                Debug.print("[INFO]: Swap successfully executed, amount: " # debug_show(amountToSend));
                                                                return #ok(Nat.toText(amountToSend));
                                                            };
                                                        };
                                                    };
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
    };

    // KongSwap specific methods //
    //                           //
    private func _performPurchase(position : Position) : async () {
        let kongSwapActor = actor("2ipq2-uqaaa-aaaar-qailq-cai") : KongSwapPollActor;
        
        // Construct proper SwapArgs
        let swapArgs : SwapArgs = {
            pay_token = position.tokenToSell;
            receive_token = position.tokenToBuy;
            pay_amount = position.amountToSell;
            max_slippage = ?0.01; // 1% slippage
            receive_amount = null;
            receive_address = ?Principal.toText(position.beneficiary);
            referred_by = null;
            pay_tx_id = null;
        };

        let swapResult = await kongSwapActor.swap(swapArgs);
        Debug.print("[INFO]: KongSwap swap result: " # debug_show(swapResult));
        
        switch (swapResult) {
            case (#Ok(value)) {
                Debug.print("[INFO]: KongSwap swap result value: " # debug_show(value));
                let tokenToBuyLedger = actor(position.tokenToBuy) : TokenLedger;
                
                let transferArg : TransferArg = {
                    to = { owner = position.beneficiary; subaccount = null };
                    fee = ?10;
                    memo = null;
                    from_subaccount = null;
                    created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
                    amount = value.receive_amount;
                };

                let sendResult = await tokenToBuyLedger.icrc1_transfer(transferArg);
                Debug.print("[INFO]: KongSwap transfer result: " # debug_show(sendResult));
            };
            case (#Err(error)) {
                Debug.print("[ERROR]: KongSwap swap failed: " # error);
                throw Error.reject("[ERROR]: KongSwap swap failed: " # error);
            };
        };
    };

    // Approve token transfer to KongSwap/ICPSwap
    public shared ({ caller }) func setPoolApprove(ledgetPrincipal: Principal, ammountToSell : Nat, to : Principal) : async Result<Nat, Text> {

        if (caller != Principal.fromText("4qflw-v6eu4-gy2he-esqdb-xaihv-bne5s-vublq-6xzj7-ffcpk-vzroe-nqe")) {
            return #err("Only admin can view pool configurations");
        };
        
        let ledgerActor = actor (Principal.toText(ledgetPrincipal)): Ledger;

        let approve = await ledgerActor.icrc2_approve({
            amount = ammountToSell;
            created_at_time = null;
            expected_allowance = null;
            expires_at = null;
            fee = null;
            from_subaccount = null;
            memo = null;
            spender = {
                owner = to;
                subaccount = null;
            };
        });
        switch approve {
            case (#Err(error)) {
                #err("Approve failed: " # debug_show(error));
            };
            case (#Ok(value)) {
                return #ok(value);
            };
        };
};
};
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import I "./ICPSwap";
import K "./KongSwap";
import KongSwap "KongSwap";
import L "Ledger";

module {
    public type Result<A, B> = {
        #ok : A;
        #err : B;
    };

    // DEX related types
    public type DexInfo = {
        name: Text;
        backendCanisterId: Principal;
    };

    public type TokenPair = {
        token0: Principal;
        token1: Principal;
    };

    public type QuoteResponse = {
        dexName: Text;
        inputAmount: Nat;
        outputAmount: Nat;
    };

    public type SwapDirection = {
        #exactIn;
        #exactOut;
    };

    public type SwapRequest = {
        tokenPair: TokenPair;
        amount: Nat;
        slippage: Float;
    };

    public type Error = {
        #InvalidDex: Text;
        #QuoteFailed: Text;
        #InsufficientLiquidity;
        #ExcessiveSlippage;
        #Other: Text;
    };

    public type IcpSwapPoolActor = actor {
        deposit : shared (I.DepositArgs) -> async I.Result;
        depositFrom : shared (I.DepositArgs) -> async I.Result;
        swap : shared (I.SwapArgs) -> async I.Result;
        getUserUnusedBalance : shared query (Principal) -> async I.Result_7;
        withdraw : shared (I.WithdrawArgs) -> async I.Result;
        applyDepositToDex : shared (I.DepositArgs) -> async I.Result;
        quote : shared query (I.SwapArgs) -> async I.Result_8;
    };

    public type KongSwapPoolActor = actor {
        swap : shared K.SwapArgs -> async K.SwapResult;
        swap_amounts : shared query (Text, Nat, Text) -> async K.SwapAmountsResult;
    };

    // Ledger actor interface
    public type Ledger = actor {
        icrc1_transfer : shared L.TransferArg -> async L.Result<>;
        icrc2_approve : shared L.ApproveArgs -> async L.Result_1<>;
        icrc2_transfer_from : shared L.TransferFromArgs -> async L.Result_2<>;
        icrc1_balance_of : shared query L.Account -> async Nat;
    };

    // Pool Properties type
    public type IcpSwapPoolProperties = {
        poolPrincipalId: Text;
        tokenToSellLedgerFee: Nat;
        tokenToBuyLedgerFee: Nat;
    };

    // Dynamic Swap Properties type
    public type IcpSwapDynamicSwapProperties = {
        dynamicPool: IcpSwapPoolActor;
        tokenToSellLedgerFee: Nat;
        tokenToBuyLedgerFee: Nat;
        tokenToSellLedger: Ledger;
        tokenToBuyLedger: Ledger;
    };
}

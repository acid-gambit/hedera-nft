console.clear();
require("dotenv").config();

const {
    AccountId,
    PrivateKey,
    Client,
    TokenCreateTransaction,
    TokenInfoQuery,
    TokenType,
    CustomRoyaltyFee,
    Hbar,
    TokenSupplyType,
    TokenMintTransaction,
    TokenBurnTransaction,
    TransferTransaction,
    AccountBalanceQuery,
    AccountUpdateTransaction,
    TokenAssociateTransaction,
    CustomFixedFee,
} = require("@hashgraph/sdk");

// Config account
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);

// Config client
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// Generate needed keys
const supplyKey = PrivateKey.generate();
const adminKey = PrivateKey.generate();

// IPFS Content Identifier for NFT
CID = [
    "Qmf6riTGREdh5pP3vGPJrGNMiSi5Cr5jJ4Q7fMW6ruLQqv"
];

async function main() {
    // DEFINE CUSTOM FEE SCHEDULE
    let nftCustomFee = await new CustomRoyaltyFee()
        .setNumerator(5)
        .setDenominator(10)
        .setFeeCollectorAccountId(operatorId)
        .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(200)));

    // CREATE NFT WITH CUSTOM FEE
    let nftCreate = await new TokenCreateTransaction()
        .setTokenName("Acid Gambit")
        .setTokenSymbol("ACID")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(operatorId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(CID.length)
        .setCustomFees([nftCustomFee])
        .setAdminKey(adminKey)
        .setSupplyKey(supplyKey)
        .freezeWith(client)
        .sign(operatorKey);

    let nftCreateSign = await nftCreate.sign(adminKey);
    let nftCreateSubmit = await nftCreateSign.execute(client);
    let nftCreateRx = await nftCreateSubmit.getReceipt(client);
    let tokenId = nftCreateRx.tokenId;
    console.log(`Created NFT with Token ID: ${tokenId} \n`);

    // TOKEN QUERY 
    var tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
    console.table(tokenInfo.customFees[0]);
}
main()
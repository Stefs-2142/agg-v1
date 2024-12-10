import React from 'react';
import { IdentityKitProvider } from '@nfid/identitykit/react';
import { IdentityKitAuthType } from '@nfid/identitykit';
import { canisterId as BACKEND_CANISTER_ID } from '../../declarations/agg-v1-backend';
import '@nfid/identitykit/react/styles.css';

// Token Ledger canister IDs
const TOKEN_CANISTERS = {
    ICP: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
    ckBTC: 'mxzaz-hqaaa-aaaar-qaada-cai',
    ckETH: 'ss2fx-dyaaa-aaaar-qacoq-cai',
    ckUSDC: 'xevnm-gaaaa-aaaar-qafnq-cai',
    ckUSDT: 'cngnf-vqaaa-aaaar-qag4q-cai'
};

export const NFIDProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!BACKEND_CANISTER_ID) {
        throw new Error('Backend canister ID not found');
    }

    // Собираем все canister IDs в один массив
    const allTargets = [
        BACKEND_CANISTER_ID,
        ...Object.values(TOKEN_CANISTERS)
    ];

    return (
        <IdentityKitProvider
            authType={IdentityKitAuthType.DELEGATION}
            signerClientOptions={{
                targets: allTargets
            }}
            providerConfig={{
                appName: "ICSpore",
                autoConnect: false,
                customDomain: "https://nfid.one",
                idleTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds
                theme: {
                    primaryColor: "#4F46E5",
                    secondaryColor: "#4338CA",
                    textColor: "#1F2937",
                    backgroundColor: "#FFFFFF"
                }
            }}
        >
            {children}
        </IdentityKitProvider>
    );
}; 
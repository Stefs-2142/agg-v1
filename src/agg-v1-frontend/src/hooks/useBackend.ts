import { useCallback } from 'react';
import { useIdentityKit } from '@nfid/identitykit/react';
import { HttpAgent } from '@dfinity/agent';
import { createActor, canisterId } from '../../declarations/agg-v1-backend';
import type { _SERVICE as BackendService } from '../../declarations/agg-v1-backend/agg-v1-backend.did.d';
import { TOKENS, toDecimalAmount, fromDecimalAmount } from '../constants/tokens';

export function useBackend() {
    const { user, identity } = useIdentityKit();

    const createBackendActor = useCallback(() => {
        if (!identity) throw new Error('No identity');
        if (!canisterId) throw new Error('Backend canister ID not found');

        // Create an agent with identity
        const agent = new HttpAgent({
            identity,
            host: "https://icp0.io"
        });

        // Create the actor using the generated createActor function
        return createActor(canisterId, {
            agent,
        }) as BackendService;
    }, [identity]);

    const getQuotes = useCallback(async (
        tokenToSell: string,
        tokenToBuy: string,
        amount: string,
        slippage: number = 0.01
    ) => {
        if (!user || !identity) {
            throw new Error('User not authenticated');
        }

        // Конвертируем сумму с учетом decimals токена
        const fromTokenDecimals = TOKENS[tokenToSell as keyof typeof TOKENS].decimals;
        const decimalAmount = toDecimalAmount(amount, fromTokenDecimals);

        console.log('Getting quotes with params:', {
            tokenToSell,
            tokenToBuy,
            amount,
            decimalAmount: decimalAmount.toString(),
            slippage,
            principal: user.principal.toString()
        });

        try {
            const actor = createBackendActor();
            const result = await actor.getQuotes(
                tokenToSell,
                tokenToBuy,
                decimalAmount,
                slippage
            );
            console.log('Raw result from getQuotes:', result);
            return result;
        } catch (error) {
            console.error('Error getting quotes:', error);
            throw error;
        }
    }, [user, identity, createBackendActor]);

    const executeSwap = useCallback(async (
        tokenToSell: string,
        tokenToBuy: string,
        amount: string,
        slippage: number = 0.01
    ) => {
        if (!user || !identity) {
            throw new Error('User not authenticated');
        }

        // Конвертируем сумму с учетом decimals токена
        const fromTokenDecimals = TOKENS[tokenToSell as keyof typeof TOKENS].decimals;
        const decimalAmount = toDecimalAmount(amount, fromTokenDecimals);

        console.log('Raw parameters for swap:', {
            tokenToSell,
            tokenToBuy,
            decimalAmount,
            decimalAmountType: typeof decimalAmount,
            decimalAmountString: decimalAmount.toString(),
            principal: user.principal,
            principalType: typeof user.principal,
            principalToString: user.principal.toString(),
            slippage,
            slippageType: typeof slippage
        });

        try {
            const actor = createBackendActor();

            // Убедимся, что все параметры имеют правильные типы
            const params = {
                tokenToSell: tokenToSell,
                tokenToBuy: tokenToBuy,
                amount: decimalAmount,
                principal: user.principal,
                slippage: slippage
            };

            console.log('Executing swap with params:', params);

            const result = await actor.executeBestSwap(
                params.tokenToSell,
                params.tokenToBuy,
                params.amount,
                params.principal,
                params.slippage
            );
            
            console.log('Raw result from executeBestSwap:', result);
            return result;
        } catch (error) {
            console.error('Error in executeSwap:', error);
            if (error instanceof Error) {
                console.error('Error details:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                });
            }
            throw error;
        }
    }, [user, identity, createBackendActor]);

    return {
        getQuotes,
        executeSwap,
        isAuthenticated: !!user && !!identity
    };
} 
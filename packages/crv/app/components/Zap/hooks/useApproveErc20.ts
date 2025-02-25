import { useAccount, useReadContract, useSimulateContract, UseSimulateContractParameters, UseSimulateContractReturnType, useWaitForTransactionReceipt } from 'wagmi'
import { useParameters } from '../Parameters'
import { erc20Abi, maxUint256, zeroAddress } from 'viem'
import { useMemo } from 'react'
import { useWriteContract } from './useWriteContract'
import env from '@/lib/env'

export function useApproveErc20() {
  const { isConnected, address } = useAccount()
  const { inputToken, inputIsYbs } = useParameters()

  const allowance = useReadContract({
    abi: erc20Abi, address: inputToken.address, functionName: 'allowance', 
    args: [address ?? zeroAddress, env.ZAP],
    query: {
      enabled: isConnected && !inputIsYbs
    }
  })

  const parameters = useMemo<UseSimulateContractParameters>(() => ({
    abi: erc20Abi, address: inputToken.address, functionName: 'approve',
    args: [env.ZAP, maxUint256],
    query: { enabled:
      isConnected
      && !inputIsYbs
      && allowance.isFetched
      && allowance.data! === 0n
    }
  }), [isConnected, inputToken, inputIsYbs, allowance])

  const simulation = useSimulateContract(parameters)
  const { write } = useWriteContract()
  const confirmation = useWaitForTransactionReceipt({ hash: write.data })

  return { allowance, simulation, write, confirmation }
}

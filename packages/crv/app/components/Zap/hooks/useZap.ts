import { useAccount, useSimulateContract, UseSimulateContractParameters, useWaitForTransactionReceipt } from 'wagmi'
import { useParameters } from '../Parameters'
import { useMemo } from 'react'
import { useWriteContract } from './useWriteContract'
import zapAbi from '../abis/zap'
import { parseUnits } from 'viem'
import { useMinOut } from './useMinOut'
import env from '@/lib/env'

export function useZap({ needsApproval }: { needsApproval: boolean }) {
  const { isConnected } = useAccount()
  const { inputAmount, inputToken, outputToken } = useParameters()
  const { minOut } = useMinOut()

  const amount = useMemo(() => parseUnits((inputAmount ?? '0'), 18), [inputAmount])

  const parameters = useMemo<UseSimulateContractParameters>(() => ({
    abi: zapAbi, address: env.ZAP, functionName: 'zap',
    args: [
      inputToken.address,
      outputToken.address,
      amount,
      minOut
    ],
    query: {
      enabled: isConnected && !needsApproval && amount > 0 && minOut !== undefined
    }
  }), [isConnected, inputAmount, inputToken, outputToken, minOut, needsApproval])

  const simulation = useSimulateContract(parameters)
  const { write } = useWriteContract()
  const confirmation = useWaitForTransactionReceipt({ hash: write.data })

  return { simulation, write, confirmation }
}

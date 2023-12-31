import {request, RequestDocument, Variables} from 'graphql-request'
import useSWR, {SWRConfiguration} from "swr";

const subgraphFetcher = <T>([query, variables]: [RequestDocument, Variables]) =>
  request<T>('https://api.thegraph.com/subgraphs/name/oxcodex/dreambyt3-staking', query, variables)

export type DREAMLPToken = {
  id: `0x${string}`
  name: string
  symbol: string
  totalSupply: bigint
  totalStaked: bigint
  numHolders: number
}

type StakingDepositorResult = {
  dreamlptoken: DREAMLPToken
}

const useStakingDepositor = (address?: `0x${string}`, options?: SWRConfiguration) => {
  const { mutate, data, isLoading } = useSWR<StakingDepositorResult>(
    address ? [
    `query GetStakingLP($address: String!) {
       dreamlptoken(id: $address) {
          id
          name
          symbol
          totalSupply
          totalStaked
          numHolders
        }
      }`,
      {
        address: address.toLowerCase()
      }
    ] : null,
    subgraphFetcher,
    {
      revalidateOnFocus: true,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      ...options
    }
  )

  return {
    data: data?.dreamlptoken as DREAMLPToken,
    mutate,
    isLoading
  };
}

export default useStakingDepositor;
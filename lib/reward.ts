import {paths} from "@reservoir0x/reservoir-sdk";
import fetcher from "utils/fetcher";
import supportedChains from "utils/chains";
import db from "lib/db";
import {getUSDAndNativePrices, USDAndNativePrices} from "../utils/price";
import {BigNumber} from "@ethersproject/bignumber";
import {formatEther} from "viem";
import dreamContracts from "../utils/dreamContracts";

let lastUpdate = (new Date()).getTime();
const EXTRA_REWARD_PER_PERIOD=0.00001
const aMonth = 60 * 24 * 30

const entry = db.collection('quest_entry')
type Collection = {
  floorAsk: number | undefined
  topBid: number | undefined
  reward: number
}
const collectionReward: Record<string, Collection> = {}

const fetchCollection =  async (chainId: number, continuation: string | undefined) => {
  const chain = supportedChains.find(c => c.id === chainId)
  const collectionQuery: paths["/collections/v5"]["get"]["parameters"]["query"] = {
    includeTopBid: true,
    sortBy: 'allTimeVolume',
    limit: 20,
    continuation
  }

  const { data } = await fetcher(`${chain?.reservoirBaseUrl}/collections/v5`, collectionQuery, {
    headers: {
      'x-api-key': chain?.apiKey || '',
    }
  })

  return data
}

const fetchDREAMToEthValue =  async (chainId: number): Promise<USDAndNativePrices> => {
  const DREAMAddress = dreamContracts[chainId]
  const date = new Date()

  return getUSDAndNativePrices(DREAMAddress,
    chainId,
    '1',
    Math.floor(date.valueOf() / 1000),
    {
      acceptStalePrice: true
    })
}

const getRewardForRank = (rank: number) => {
  if (rank <= 10) {
    return 100
  }

  if (rank <= 50) {
    return 75
  }

  if (rank <= 75) {
    return 50
  }

  if (rank <= 100) {
    return 25
  }

  return 0
}

const fetchCollectionRankReward = async (chainId: number, collectionId: string) => {
  const currentTime = (new Date()).getTime();
  // Fetch Rank Daily
  if ((lastUpdate + (1000 * 60 * 24)) > currentTime) {
    return collectionReward[collectionId.toLowerCase()] || {
      floorAsk: 0,
      topBid: 0,
      reward: 0
    }
  }

  let i = 0
  let continuation: string | undefined = undefined

  while (i < 100) {
    const result: any = await fetchCollection(chainId, continuation)

    result.collections.forEach((collection: any, j: number) => {
      collectionReward[collection.id.toLowerCase()] = {
        floorAsk: +collection.floorAsk?.price?.amount?.native,
        topBid: +collection.topBid?.price?.amount?.native,
        reward: getRewardForRank(i + j + 1)
      }
    })

    continuation = result.continuation
    i += 20
  }

  lastUpdate = currentTime

  return collectionReward[collectionId]
}

type CalculateReward = (
  chainId: number,
  account: string,
  collectionId: string,
  paymentToken: string,
  amount: string,
  period: number,
  isListing: boolean
) => Promise<number>

export const calculateReward: CalculateReward = async (chainId, account, collectionId, paymentToken, amount, period, isListing)  => {
  const isDREAM = paymentToken === dreamContracts[chainId]
  let value = +formatEther(BigInt(`${+amount || 0}`)).toString()

  if (!account) {
    return 0;
  }

  if (isDREAM) {
    const dreamToNative = await fetchDREAMToEthValue(chainId).catch(() => ({ nativePrice: 0 }))
    value = BigNumber.from(value).mul(BigNumber.from(dreamToNative?.nativePrice)).toNumber()
  }

  const questEntry = (await entry.findOne({
    wallet: {
      $regex: account,
      $options: 'i'
    }
  }).catch(() => null)) || []

  const collection = await fetchCollectionRankReward(chainId, collectionId)

  let reward = 0

  if (collection) {
    reward = collection.reward
    const topBidValue = +`${collection.topBid}`
    const floorValue = +`${collection.floorAsk}`
    const tokenValue = floorValue || topBidValue || 0
    const percentDiff = (tokenValue - value) / ((tokenValue + value) / 2)

    period = period > aMonth ? aMonth : period
    reward += reward * (period * EXTRA_REWARD_PER_PERIOD)

    if (isListing) {
      reward += (reward * percentDiff)
    } else {
      reward -= (reward * percentDiff)
    }

    if (reward < 0 || value <= 0 || questEntry.length < 7) {
      reward = 0
    }

    console.info(`New Reward`, {
      chainId,
      account,
      tokenValue,
      value,
      percentDiff,
      reward,
      isDREAM,
      isListing
    })
  }

  return reward * (isDREAM ? 2 : 1)
}
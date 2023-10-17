import { NextPage, GetServerSideProps } from 'next'
import Link from 'next/link'
import {
  Text,
  Flex,
  Box,
  Button,
  FormatCryptoCurrency,
} from 'components/primitives'
import Layout from 'components/Layout'
import { motion, useViewportScroll, useTransform } from 'framer-motion'
import { paths } from '@reservoir0x/reservoir-sdk'
import { useContext, useEffect, useState } from 'react'
import { Footer } from 'components/home/Footer'
import { useMarketplaceChain } from 'hooks'
import supportedChains, { DefaultChain } from 'utils/chains'
import { Head } from 'components/Head'
import { ChainContext } from 'context/ChainContextProvider'

import Img from 'components/primitives/Img'
import useTopSellingCollections from 'hooks/useTopSellingCollections'
import ReactMarkdown from 'react-markdown'
import { basicFetcher as fetcher } from 'utils/fetcher'
import { styled } from 'stitches.config'
import { useTheme } from 'next-themes'
import ChainToggle from 'components/common/ChainToggle'
import optimizeImage from 'utils/optimizeImage'
import { MarkdownLink } from 'components/primitives/MarkdownLink'
import { useRouter } from 'next/router'

const StyledImage = styled('img', {})

const Home: NextPage<any> = ({ ssr }) => {
  const router = useRouter()
  const marketplaceChain = useMarketplaceChain()

  // not sure if there is a better way to fix this
  const { theme: nextTheme } = useTheme()
  const [theme, setTheme] = useState<string | null>(null)
  useEffect(() => {
    if (nextTheme) {
      setTheme(nextTheme)
    }
  }, [nextTheme])

  const { chain } = useContext(ChainContext)

  const { data: topSellingCollectionsData } = useTopSellingCollections(
    {
      period: '24h',
      includeRecentSales: true,
      limit: 13,
      fillType: 'sale',
    },
    {
      revalidateOnMount: true,
      refreshInterval: 300000,
      fallbackData: ssr.topSellingCollections[marketplaceChain.id]?.collections
        ? ssr.topSellingCollections[marketplaceChain.id]
        : null,
    },
    chain?.id
  )

  const { data: topMintingCollectionsData } = useTopSellingCollections(
    {
      period: '24h',
      limit: 12,
      fillType: 'mint',
    },
    {
      revalidateOnMount: true,
      refreshInterval: 300000,
      fallbackData: ssr.topMintingCollections[marketplaceChain.id]?.collections
        ? ssr.topMintingCollections[marketplaceChain.id]
        : null,
    },
    chain?.id
  )

  const topCollection = topSellingCollectionsData?.collections?.[0]

  const { scrollY } = useViewportScroll();

  const scale = useTransform(scrollY, [0, 500], [1, 1.2]);

  return (
    <Layout>
      <Head />
      <Box
        css={{
          p: 24,
          mt: -80,
          pt: 104,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          '@bp800': {
            px: '$5',
          },
          '@xl': {
            px: '$6',
          },
        }}
      >
        <motion.div
          style={{
            scale: scale,
            position: 'absolute',
            top: 0,
            display: 'block',
            zIndex: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundSize: 'cover',
            backgroundImage: `url(${optimizeImage(topCollection?.banner, 1820)})`,
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        >

        </motion.div>
        <Box
          css={{
            position: 'absolute',
            top: 0,
            display: 'block',
            zIndex: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(rgba(8, 4, 4, 0) 50%, rgb(8, 4, 4) 90.22%), linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2))',
          }}
        />
        <Flex>
          <Flex
            css={{
              minHeight: 540,
              flex: 1,
              overflow: 'hidden',
              position: 'relative',
              gap: '$5',
              p: '$4',
              '@md': {
                p: '$5',
                gap: '$4',
                flexDirection: 'column',
                display: 'flex',
              },
              '@lg': {
                flexDirection: 'row',
                p: '$5',
                gap: '$5',
                mt: '$4',
              },
              '@xl': {
                p: '$6',
                gap: '$6',
              },

              mb: '$6',
              maxWidth: 1820,
              mx: 'auto',
            }}
          >
            {topSellingCollectionsData && (
              <Box css={{ flex: 2, zIndex: 4 }}>
                <Flex direction="column" css={{ height: '100%' }}>
                  <Box css={{ flex: 1 }}>
                    <Text style="h3" css={{ mt: '$3', mb: '$2' }} as="h3">
                      {topCollection?.name}
                    </Text>

                    <Box
                      css={{
                        maxWidth: 720,
                        lineHeight: 1.5,
                        fontSize: 16,
                        fontWeight: 400,
                        display: '-webkit-box',
                        color: '$gray12',
                        fontFamily: '$body',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <ReactMarkdown
                        children={topCollection?.description || ''}
                        components={{
                          a: MarkdownLink,
                          p: Text as any,
                        }}
                      />
                    </Box>

                    <Flex css={{ mt: '$4' }}>
                      <Box css={{ mr: '$5' }}>
                        <Text style="subtitle2" color="subtle">
                          FLOOR
                        </Text>
                        <Box css={{ mt: 2 }}>
                          <FormatCryptoCurrency
                            amount={
                              topCollection?.floorAsk?.price?.amount
                                ?.native ?? 0
                            }
                            textStyle={'h4'}
                            logoHeight={20}
                            address={
                              topCollection?.floorAsk?.price?.currency
                                ?.contract
                            }
                          />
                        </Box>
                      </Box>

                      <Box css={{ mr: '$4' }}>
                        <Text style="subtitle2" color="subtle">
                          24H SALES
                        </Text>
                        <Text style="h4" as="h4" css={{ mt: 2 }}>
                          {topCollection?.count?.toLocaleString()}
                        </Text>
                      </Box>
                    </Flex>
                  </Box>
                  <Flex
                    align="end"
                    justify="between"
                    css={{ gap: '$4', mt: '$5' }}
                  >
                    <Button as={Link} color="primary" size="large" href={`/${chain.routePrefix}/collection/${topCollection?.id}`}>
                      View Collection
                    </Button>
                    <Box
                      css={{
                        display: 'none',
                        '@lg': {
                          display: 'block',
                        },
                      }}
                    >
                      <Text
                        style="subtitle2"
                        color="subtle"
                        as="p"
                        css={{ mt: '$4' }}
                      >
                        RECENT SALES
                      </Text>
                      <Flex
                        css={{
                          mt: '$2',
                          gap: '$3',
                        }}
                      >
                        {topCollection?.recentSales
                          ?.slice(0, 4)
                          ?.map((sale: any, i) => (
                            <Box
                              css={{
                                aspectRatio: '1/1',
                                maxWidth: 80,
                              }}
                              key={sale.token.id + sale.contract + i}
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                router.push(
                                  `/${chain.routePrefix}/asset/${topCollection.primaryContract}:${sale.token.id}`
                                )
                              }}
                            >
                              <img
                                style={{ borderRadius: 4 }}
                                src={optimizeImage(
                                  sale?.token?.image ||
                                  topCollection?.image,
                                  250
                                )}
                              />
                              <Box css={{ mt: '$1' }}>
                                <FormatCryptoCurrency
                                  amount={sale.price.amount.decimal ?? 0}
                                  textStyle={'h6'}
                                  logoHeight={16}
                                  address={sale.price.currency?.contract}
                                />
                              </Box>
                            </Box>
                          ))}
                        <Box css={{ flex: 1 }} />
                        <Box css={{ flex: 1 }} />
                      </Flex>
                    </Box>
                  </Flex>
                </Flex>
              </Box>
            )}
          </Flex>
        </Flex>
      </Box>
      <Box
        css={{
          p: 24,
          height: '100%',
          '@bp800': {
            px: '$5',
            mt: 120,
          },
          '@xl': {
            px: '$6',
          },
        }}
      >
        <Flex
          justify="center"
          align="center"
          css={{ flexWrap: 'wrap', mb: '$4', gap: '$3' }}
        >
          <Text style="h4" as="h4">
            Trending Collections
          </Text>
          <ChainToggle />
        </Flex>
        <Box
          css={{
            pt: '$2',
            mb: '$4',
            display: 'grid',
            gap: '$4',
            maxWidth: 1400,
            mx: 'auto',
            gridTemplateColumns: 'repeat(1, 1fr)',
            '@sm': {
              gridTemplateColumns: 'repeat(2, 1fr)',
            },

            '@lg': {
              gridTemplateColumns: 'repeat(4, 1fr)',
            },
          }}
        >
          {topSellingCollectionsData?.collections &&
            topSellingCollectionsData.collections.length &&
            topSellingCollectionsData.collections
              .slice(1, 13)
              .map((collection) => {
                return (
                  <Link
                    key={collection.id}
                    href={`/${marketplaceChain.routePrefix}/collection/${collection.id}`}
                    style={{ display: 'grid' }}
                  >
                    <Flex
                      direction="column"
                      css={{
                        flex: 1,
                        width: '100%',
                        borderRadius: 12,
                        cursor: 'pointer',
                        height: '100%',
                        background: '$neutralBgSubtle',
                        border: '2px solid transparent',
                        transition: 'border 0.5s',

                        overflow: 'hidden',
                        position: 'relative',
                        p: '$3',
                        '&:hover': {
                          border: '2px solid $primary10',
                        },
                        '&:hover > div > div> img:nth-child(1)': {
                          transform: 'scale(1.075)',
                        },
                      }}
                    >
                      <Flex
                        direction="column"
                        css={{
                          zIndex: 2,
                          position: 'relative',
                          flex: 1,
                          width: '100%',
                        }}
                      >
                        <Box
                          css={{
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: 8,
                          }}
                        >
                          {collection?.banner?.length ||
                          collection.recentSales?.[0]?.token?.image?.length ? (
                            <img
                              loading="lazy"
                              src={optimizeImage(
                                collection?.banner ??
                                  collection.recentSales?.[0]?.token?.image,
                                800
                              )}
                              style={{
                                transition: 'transform 300ms ease-in-out',
                                width: '100%',
                                borderRadius: 8,
                                height: 200,
                                objectFit: 'cover',
                              }}
                            />
                          ) : (
                            <Box
                              css={{
                                width: '100%',
                                borderRadius: 8,
                                height: 200,
                                background: '$gray3',
                              }}
                            />
                          )}
                          <Img
                            src={
                              optimizeImage(collection?.image, 72 * 2) as string
                            }
                            alt={collection?.name as string}
                            width={72}
                            height={72}
                            css={{
                              width: 72,
                              height: 72,
                              border: '1px solid rgba(255,255,255,0.6)',
                              position: 'absolute',
                              bottom: '$3',
                              left: '$3',
                              borderRadius: 8,
                            }}
                          />
                        </Box>
                        <Flex
                          css={{ my: '$4', mb: '$2' }}
                          justify="between"
                          align="center"
                        >
                          <Text style="h5" as="h5" ellipsify css={{ flex: 1 }}>
                            {collection?.name}
                          </Text>
                        </Flex>

                        <Box
                          css={{
                            maxWidth: 720,
                            lineHeight: 1.5,
                            fontSize: 16,
                            flex: 1,
                            fontWeight: 400,
                            display: '-webkit-box',
                            color: '$gray12',
                            fontFamily: '$body',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            '& a': {
                              fontWeight: 500,
                              cursor: 'pointer',
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          <ReactMarkdown
                            children={collection?.description || ''}
                            components={{
                              a: MarkdownLink,
                              p: Text as any,
                            }}
                          />
                        </Box>

                        <Flex css={{ mt: '$4' }}>
                          <Box css={{ mr: '$5' }}>
                            <Text
                              style="subtitle2"
                              color="subtle"
                              as="p"
                              css={{ mb: 2 }}
                            >
                              FLOOR
                            </Text>
                            <FormatCryptoCurrency
                              amount={
                                collection?.floorAsk?.price?.amount?.native ?? 0
                              }
                              textStyle={'h6'}
                              logoHeight={12}
                              address={
                                collection?.floorAsk?.price?.currency?.contract
                              }
                            />
                          </Box>

                          <Box css={{ mr: '$4' }}>
                            <Text style="subtitle2" color="subtle" as="p">
                              24H SALES
                            </Text>
                            <Text style="h6" as="h4" css={{ mt: 2 }}>
                              {collection.count?.toLocaleString()}
                            </Text>
                          </Box>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Link>
                )
              })}
        </Box>
        <Flex justify="center" css={{ my: '$5' }}>
          <Link href={`/${marketplaceChain.routePrefix}/collections/trending`}>
            <Button>See More</Button>
          </Link>
        </Flex>
      </Box>

      <Flex
        direction="column"
        align="center"
        justify="center"
        css={{
          py: 80,
          gap: 40,
          '@md': {
            py: 120
          }
        }}
      >
        <Text style={{
          '@initial': 'h6',
          '@md': 'h4'
        }}>Sustainable NFT Marketplace</Text>
        <StyledImage src="/logo.png" height={95} width={450} css={{ maxWidth: '80%' }} />
      </Flex>
      <Footer />
    </Layout>
  )
}

type TopSellingCollectionsSchema =
  paths['/collections/top-selling/v1']['get']['responses']['200']['schema']

type ChainTopSellingCollections = Record<string, TopSellingCollectionsSchema>

export const getServerSideProps: GetServerSideProps<{
  ssr: {
    topSellingCollections: ChainTopSellingCollections,
    topMintingCollections: ChainTopSellingCollections
  }
}> = async ({ params, res }) => {
  const chainPrefix = params?.chain || ''
  const chain =
    supportedChains.find((chain) => chain.routePrefix === chainPrefix) ||
    DefaultChain

  const topSellingCollections: ChainTopSellingCollections = {}
  const topMintingCollections: ChainTopSellingCollections = {}
  try {
    const response = await fetcher(
      `${chain.reservoirBaseUrl}/collections/top-selling/v2?period=24h&includeRecentSales=true&limit=13&fillType=sale`,
      {
        headers: {
          'x-api-key': process.env.RESERVOIR_API_KEY || '',
        },
      }
    )

    const response2 = await fetcher(
      `${chain.reservoirBaseUrl}/collections/top-selling/v2?period=24h&limit=12&fillType=mint`,
      {
        headers: {
          'x-api-key': process.env.RESERVOIR_API_KEY || '',
        },
      }
    )

    topSellingCollections[chain.id] = response.data
    topMintingCollections[chain.id] = response2.data

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=120, stale-while-revalidate=180'
    )
  } catch (e) {}

  return {
    props: { ssr: { topSellingCollections, topMintingCollections } },
  }
}

export default Home

import { FC } from 'react'
import NextHead from 'next/head'

type Props = {
  ogImage?: string
  title?: string
  description?: string
}

/**
 * Renders the <head> section of the HTML page, including meta tags, title, and favicon.
 * @param ogImage - The URL of the Open Graph image to be displayed in social media shares.
 * @param title - The title of the page.
 * @param description - The description of the page.
 */
export const Head: FC<Props> = ({
  ogImage = 'https://i.ibb.co/T2W2pbC/40-40.png',
  title = 'DREAMBYT3',
  description = 'DREAMBYT3 is the Sustainable NFT Marketplace for Creators and Collectors',
}) => {
  return (
    <NextHead>
      {/* CONFIGURABLE: You'll probably want to configure this all to have custom meta tags and title to fit your application */}
      {/* CONFIGURABLE: There are also keywords in pages/_document.ts that you can also configure to fit your application */}

      {/* Title */}
      <title>{title}</title>

      {/* Meta tags */}
      <meta name="description" content={description} />

      {/* Twitter */}
      <meta name="twitter:card" content="NFT Marketplace" />
      <meta name="twitter:site" content="@DreamByt3" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Open Graph */}
      <meta property="og:type" content="https://dreambyt3.com" />
      <meta property="og:determiner" content="the" />
      <meta property="og:locale" content="en" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="DreamByt3" />
      <meta property="og:url" content="https://i.ibb.co/T2W2pbC/40-40.png"></meta>

      <meta name="debank-cloud-site-verification" content="f4645100371cf978a6231170961b5041" />
    </NextHead>
  )
}

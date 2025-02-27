import type { FC } from "react"
import { useContext } from "react"

import {
  json,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "remix"
import type { LinksFunction, MetaFunction, LoaderFunction } from "remix"

import comboboxStyles from "@reach/combobox/styles.css"

import { join } from "~/utils"

import { getUser } from "./session.server"
import StylesContext from "./styles-context"
import ourStyles from "./styles/index.css"
import tailwindStylesheetUrl from "./styles/tailwind.css"

export const links: LinksFunction = () => {
  return [
    { rel: `stylesheet`, href: comboboxStyles },
    { rel: `stylesheet`, href: tailwindStylesheetUrl },
    { rel: `stylesheet`, href: ourStyles },
  ]
}

export const meta: MetaFunction = () => ({
  charset: `utf-8`,
  title: `GoGoYonder`,
  viewport: `width=device-width,initial-scale=1`,
})

const App: FC = () => {
  const styles = useContext(StylesContext)
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
        {styles}
      </head>
      <body className={join(`h-full`, `bg-[#2F3E46DE]`)}>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default App

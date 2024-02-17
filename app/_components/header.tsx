import Link from "next/link"
import React from "react"
import ServerPermitWrapper from "./server-permit-wrap"
import UserPanel from "./user-panel"

const Header = () => {
  return (
    <div className="sticky top-0 z-40 w-full border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between">
          <nav className="py-4">
            <ul className="flex space-x-8">
              <ServerPermitWrapper admin>
                <li>
                  <BronyaLink href="/users">User-list</BronyaLink>
                </li>
              </ServerPermitWrapper>
              <ServerPermitWrapper admin>
                <li>
                  <BronyaLink href="/app-list">App-list</BronyaLink>
                </li>
              </ServerPermitWrapper>
              <li>
                <BronyaLink href="/licenses">Licenses</BronyaLink>
              </li>
              <li>
                <BronyaLink href="/activation-records">
                  Activation-Records
                </BronyaLink>
              </li>
              <ServerPermitWrapper admin>
                <li>
                  <BronyaLink href="/export">Data-Export</BronyaLink>
                </li>
              </ServerPermitWrapper>
            </ul>
          </nav>
          <UserPanel />
        </div>
      </div>
    </div>
  )
}

const BronyaLink = ({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) => {
  return (
    <Link
      className="hover:underline underline-offset-4 hover:text-sky-500 dark:hover:text-sky-400"
      href={href}
    >
      {children}
    </Link>
  )
}

export default Header

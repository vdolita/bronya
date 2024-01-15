import Link from "next/link"
import React from "react"

const Header = () => {
  return (
    <div className="sticky top-0 z-40 w-full border-b border-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="py-4">
          <ul className="flex space-x-8">
            <li>
              <BronyaLink href="/app-list">App-list</BronyaLink>
            </li>
            <li>
              <BronyaLink href="/licenses">Licenses</BronyaLink>
            </li>
            <li>
              <BronyaLink href="/activation-records">
                Activation-Records
              </BronyaLink>
            </li>
          </ul>
        </nav>
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

"use client"

import { licenseKey } from "@/lib/meta"
import { Button } from "@/sdui/ui/button"
import { Input } from "@/sdui/ui/input"
import { Label } from "@/sdui/ui/label"
import { useState } from "react"

interface KeySearchProps {
  onSearch: (key: string) => void
}

export default function KeySearch({ onSearch }: KeySearchProps) {
  const [searchKey, setSearchKey] = useState<string>("")
  const [isValid, setIsValid] = useState<boolean>(false)

  const handleSearchKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    setSearchKey(value)

    if (value === "") {
      setIsValid(true)
      return
    }
    const safeKey = licenseKey.safeParse(value)
    setIsValid(safeKey.success)
  }

  const handleClick = () => {
    if (!isValid) return
    onSearch(searchKey)
  }

  return (
    <div className="flex items-center space-x-2">
      <Label>Key:</Label>
      <Input
        className="w-80"
        placeholder="Fill in the completed license key here"
        value={searchKey}
        onChange={handleSearchKeyChange}
      />
      <Button size="sm" disabled={!isValid} onClick={handleClick}>
        Search
      </Button>
    </div>
  )
}

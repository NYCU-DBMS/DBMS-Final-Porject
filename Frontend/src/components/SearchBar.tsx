import { useState } from "react"

import { Input } from "@/components/ui/input"

// pass data as props
type SearchBarProps = {
  data: string[]
}

export default function SearchBar({ data }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState(data)

  const handleSearch = (e: any) => {
    const value = e.target.value
    setSearchTerm(value)
    setResults(data.filter((item) => item.toLowerCase().includes(value.toLowerCase())))
  }

  return (
    <div>
      <Input
        type="text"
        placeholder="Search anime..."
        value={searchTerm}
        onChange={handleSearch}
        className="w-full"
      />
      <div>
        {results.length === 0 && searchTerm.length > 0 && <div>No results found</div>}
        {results.map((item) => (
          <div key={item}>{item}</div>
        ))}
      </div>
    </div>
  )
}

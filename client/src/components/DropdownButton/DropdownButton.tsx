import { useState } from 'react'
import './DropdownButton.css'

interface Props {
  items: string[]
  onSelectItem: (item: string) => void
}

export default function DropdownButton({ items, onSelectItem }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [currentItem, setCurrentItem] = useState<string>(items[0])

  function toggleDropdown() {
    setIsOpen(!isOpen)
  }

  function handleItemClick(item: string) {
    onSelectItem(item)
    setCurrentItem(item)
    setIsOpen(false)
  }

  return (
    <div className='dropdown-button'>
      <button onClick={toggleDropdown}>Algorithm: {currentItem}</button>
      {isOpen && (
        <ul>
          {items.map((item) => (
            <li key={item} onClick={() => handleItemClick(item)}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

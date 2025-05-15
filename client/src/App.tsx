import { useState, type MouseEvent } from 'react'
import Cell from './components/Cell/Cell'
import { CellType } from './types/CellType'
import './App.css'

const GRID_WIDTH = 16
const GRID_HEIGHT = 10
const GRID_SIZE = GRID_WIDTH * GRID_HEIGHT

function App() {
  const [selectedType, setSelectedType] = useState<string>(CellType.Path)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [cells, setCells] = useState<Array<string>>(
    Array.from({ length: GRID_SIZE }, () => CellType.Wall)
  )

  function handleTypeChange(nextType: string) {
    setSelectedType(nextType)
  }

  function handleCellClick(e: MouseEvent, id: number) {
    e.preventDefault()

    const prev = cells.map((cell, i) => {
      if (id === i) return selectedType
      return cell
    })

    setCells(prev)
  }

  function handleMouseEnter(e: MouseEvent, cellId: number) {
    if (e.buttons === 1) handleCellClick(e, cellId)
  }

  function isMazeValid(): boolean {
    setErrorMessage('')

    let hasStart = false
    let hasGoal = false
    let hasMultipleStarts = false

    for (const i in cells) {
      if (cells[i] === CellType.Start) {
        if (hasStart) hasMultipleStarts = true

        hasStart = true
      } else if (cells[i] === CellType.Goal) hasGoal = true
    }

    if (!hasGoal || !hasStart) {
      setErrorMessage('The maze needs a start cell and a goal cell')
      return false
    }

    if (hasMultipleStarts) {
      setErrorMessage('The maze should have just one start cell')
      return false
    }

    return true
  }

  async function fetchSolve() {
    const maze = {
      width: GRID_WIDTH,
      height: GRID_HEIGHT,
      cells: cells
    }

    const response = await fetch('http://localhost:8000/maze/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maze)
    })

    if (!response.ok)
      throw new Error(`HTTP error. status: ${response.status}`)

    const json = await response.json()

    return json
  }

  async function solveMaze() {
    if (!isMazeValid())
      return

    const response = await fetchSolve();
    console.log('sending ', cells)
    console.log(response)
  }

  return (
    <main>
      <div className='buttons'>
        <button
          aria-activedescendant='true'
          className='change-type'
          onClick={() => handleTypeChange(CellType.Wall)}
        >
          Wall
        </button>
        <button
          className='change-type'
          onClick={() => handleTypeChange(CellType.Path)}
        >
          Path
        </button>
        <button
          className='change-type'
          onClick={() => handleTypeChange(CellType.Start)}
        >
          Start
        </button>
        <button
          className='change-type'
          onClick={() => handleTypeChange(CellType.Goal)}
        >
          Goal
        </button>

        <button className='change-type' onClick={solveMaze}>
          Solve
        </button>
      </div>

      {errorMessage != '' && <span>{errorMessage}</span>}

      <ul className='grid'>
        {cells.map((cell, i) => (
          <li
            key={i}
            onMouseDown={(e) => handleCellClick(e, i)}
            onMouseEnter={(e) => handleMouseEnter(e, i)}
          >
            <Cell type={cell} />
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App

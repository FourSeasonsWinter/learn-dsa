import { useState, type MouseEvent } from 'react'
import Cell from './Cell'
import { CellType } from '../../types/CellType'
import DropdownButton from '../DropdownButton/DropdownButton'
import { Actions } from '../../types/Actions'

const GRID_WIDTH = 16
const GRID_HEIGHT = 10
const GRID_SIZE = GRID_WIDTH * GRID_HEIGHT

export default function Maze() {
  const [selectedType, setSelectedType] = useState<string>(CellType.Path)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<string>('Depth First Search')
  const [cells, setCells] = useState<Array<string>>(
    Array.from({ length: GRID_SIZE }, () => CellType.Wall)
  )
  const [solvedCells, setSolvedCells] = useState<Array<string>>([])

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

  function reset() {
    if (solvedCells.length > 0) {
      setSolvedCells([])
      return
    }

    setCells(Array.from({ length: GRID_SIZE }, () => CellType.Wall))
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
    const requestBody = {
      width: GRID_WIDTH,
      height: GRID_HEIGHT,
      cells: cells,
      algorithm: selectedAlgorithm,
    }

    const response = await fetch('http://localhost:8000/maze/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) throw new Error(`HTTP error. status: ${response.status}`)

    const json = await response.json()

    return json
  }

  async function solveMaze() {
    if (!isMazeValid()) return

    const response = await fetchSolve()

    let startIndex = 0
    let agentIndex = 0
    for (let i = 0; i < cells.length; ++i) {
      if (cells[i] === CellType.Start) {
        agentIndex = i
        startIndex = i
        break
      }
    }

    const actions = response.solution
    const copy = [...cells]

    for (let i = 0; i < actions.length; ++i) {
      copy[agentIndex] = CellType.Solution

      switch (actions[i]) {
        case Actions.UP:
          agentIndex = agentIndex - GRID_WIDTH
          break
        case Actions.RIGHT:
          agentIndex = agentIndex + 1
          break
        case Actions.DOWN:
          agentIndex = agentIndex + GRID_WIDTH
          break
        case Actions.LEFT:
          agentIndex = agentIndex - 1
          break
      }

      copy[agentIndex] = CellType.Agent
      copy[startIndex] = CellType.Start
      setSolvedCells([...copy])
    }
  }

  function move() {}

  return (
    <main>
      <div className='buttons'>
        <button
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

        <button className='change-type' onClick={reset}>
          Reset
        </button>

        <button className='change-type' onClick={solveMaze}>
          Solve
        </button>

        <button className='change-type' onClick={move}>
          Move
        </button>
        <DropdownButton
          items={['Depth First Search', 'Breadth First Search']}
          onSelectItem={(selected) => setSelectedAlgorithm(selected)}
        />
      </div>

      {errorMessage != '' && <span>{errorMessage}</span>}

      <ul className='grid'>
        {solvedCells.length == 0
          ? cells.map((cell, i) => (
              <li
                key={i}
                onMouseDown={(e) => handleCellClick(e, i)}
                onMouseEnter={(e) => handleMouseEnter(e, i)}
              >
                <Cell type={cell} />
              </li>
            ))
          : solvedCells.map((cell, i) => (
              <li key={i}>
                <Cell type={cell} />
              </li>
            ))}
      </ul>
    </main>
  )
}
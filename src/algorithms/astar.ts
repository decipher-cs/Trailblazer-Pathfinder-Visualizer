import { Cell, Grid } from '../types'

// Define a priority queue data structure
type PriorityQueue<T> = {
    elements: T[]
    priorityFunction: (elements: T) => number
    push: (element: T) => void
    pop: () => T | undefined
    isEmpty: () => boolean
}

// Function to create a priority queue
function createPriorityQueue<T>(priorityFunction: (elements: T) => number): PriorityQueue<T> {
    return {
        elements: [],
        priorityFunction,
        // Push an element into the queue in priority order
        push(element) {
            this.elements.push(element)
            this.elements.sort((a, b) => this.priorityFunction(a) - this.priorityFunction(b))
        },
        // Remove and return the highest priority element from the queue
        pop() {
            return this.elements.shift()
        },
        // Check if the queue is empty
        isEmpty() {
            return this.elements.length === 0
        },
    }
}

// The main A* pathfinding function
export function astar(grid: Grid): number[] {
    // Find the start and finish cells in the grid
    const startCell = grid.find(cell => cell.type === 'start')
    const finishCell = grid.find(cell => cell.type === 'finish')
    if (!startCell || !finishCell) {
        throw new Error('Grid must have a start and a finish cell')
    }

    // Initialize the open set with the start cell
    const openSet = createPriorityQueue<Cell>(cell => heuristic(cell, finishCell))
    openSet.push(startCell)

    // Maps to keep track of the best path and scores
    const cameFrom = new Map<Cell, Cell>()
    const gScore = new Map<Cell, number>()
    gScore.set(startCell, 0)
    const fScore = new Map<Cell, number>()
    fScore.set(startCell, heuristic(startCell, finishCell))

    // Array to keep track of the visited cells
    const visitedCells = new Set<number>()

    // Main loop of the algorithm
    while (!openSet.isEmpty()) {
        const current = openSet.pop()
        if (!current) {
            throw new Error('Unexpected error: current cell is undefined')
        }

        // If the current cell is the finish cell, return the visited cells
        if (current.type === 'finish') {
            return Array.from(visitedCells)
        }

        // Add the current cell to the visited cells
        visitedCells.add(current.index)

        // Process all neighbors of the current cell
        for (const neighbor of getNeighbors(current, grid)) {
            const tentativeGScore = (gScore.get(current) || 0) + distBetween(current, neighbor)
            if (tentativeGScore < (gScore.get(neighbor) || Infinity)) {
                // This path to the neighbor is better than any previous one. Record it!
                cameFrom.set(neighbor, current)
                gScore.set(neighbor, tentativeGScore)
                fScore.set(neighbor, tentativeGScore + heuristic(neighbor, finishCell))
                if (!openSet.elements.includes(neighbor)) {
                    openSet.push(neighbor)
                }
            }
        }
    }

    // If the algorithm finished without finding a path, return the visited cells
    return Array.from(visitedCells)
}

// Heuristic function for A* (Manhattan distance)
function heuristic(cell1: Cell, cell2: Cell): number {
    const dx = Math.abs(cell1.coordinates[0] - cell2.coordinates[0])
    const dy = Math.abs(cell1.coordinates[1] - cell2.coordinates[1])
    return dx + dy
}

// Distance between two cells
function distBetween(cell1: Cell, cell2: Cell): number {
    const dx = Math.abs(cell1.coordinates[0] - cell2.coordinates[0])
    const dy = Math.abs(cell1.coordinates[1] - cell2.coordinates[1])
    return Math.sqrt(dx * dx + dy * dy)
}

// Get the neighbors of a cell in the grid
function getNeighbors(cell: Cell, grid: Grid): Cell[] {
    const { coordinates } = cell
    // Check the four cells adjacent to the current one
    const neighbors = [
        grid.find(({ coordinates: [x, y] }) => coordinates[0] === x && coordinates[1] === y - 1),
        grid.find(({ coordinates: [x, y] }) => coordinates[0] === x && coordinates[1] === y + 1),
        grid.find(({ coordinates: [x, y] }) => coordinates[0] === x - 1 && coordinates[1] === y),
        grid.find(({ coordinates: [x, y] }) => coordinates[0] === x + 1 && coordinates[1] === y),
    ]
    // Return only the neighbors that are not 'close' and are not undefined
    return neighbors.filter((neighbor): neighbor is Cell => neighbor !== undefined && neighbor.type !== 'close')
}
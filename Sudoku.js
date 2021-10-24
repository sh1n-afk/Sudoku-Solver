//sudoku test case 
const board = [ 
  new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 0]),
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 2]),
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 3]),
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 4]),
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 5]),
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 6]),
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 7]),
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 8]),
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1])
]

process.nextTick(() => {
  const sudoku = new Sudoku({ squareRegion: 3 })      
//schedule invoked the callback function 
  sudoku.play(board)
  console.log(sudoku.printable())
})

function Sudoku (opts = {}) {
  this.region = opts.squareRegion || 3 //default classic
}

Sudoku.prototype.play = function (board) {
  const allCells = buildCellStructure(board, this.region) //filter fuction
  this.valueSet = Array(board[0].length).fill(0).map((_, i) => (i + 1))
  const cells = allCells.filter(c => c.init === 0) //to reduce the calculations ignoring the default cells 
  let iter = 0    //out tries are invalid
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i]
    iter++    //incrementing iteration 
    if (!solveCell.call(this, cell)) { //checking if board empty 
      cell.history.clear()        
      let backTrack = i - 1 //helper function : backtracking
      for (; backTrack >= 0; backTrack--) {
        if (assignValue.call(this, cells[backTrack], 0)) {
        break
        }
      }
      i = backTrack - 1
    }
  }
  this.lastGame = board //takes board and shifts to store 
  this.lastResult = allCells.map(_ => _.value)      
  console.log(iter)
  return this.lastResult
}

function solveCell (cell) {
  const chooseNewValue = chooseValue.call(this, cell)
  if (chooseNewValue === 0) {   //checking if try path is false 
    return false
  }
  assignValue.call(this, cell, chooseNewValue)
  return true
}

function assignValue (cell, value) {
  cell.rows[cell.x] = value,cell.columns[cell.y] = value,cell.square[(cell.x % this.region) + ((cell.y % this.region) * this.region)] = value,cell.value = value
  if (value > 0) {
    cell.history.add(value)
  }
  return true
}

Sudoku.prototype.printable = function (result) {
  const print = result || this.lastResult
  if (!print) {
     return //nothing to print 
  }
  return print.flatMap((val, i) => {
    if ((i + 1) % this.region === 0) {
      if ((i + 1) % (this.region ** 2) === 0) {
        if ((i + 1) % (this.region ** 3) === 0) { 
        //printable board pattern
          return [val, '|', '\n', '-'.repeat(this.region ** 2), '--|\n']
        } else {
          return [val, '|', '\n']
        }
      } else {
        return [val, '|']
      }
    }
    return val
  }).join('')
}

function chooseValue (cell) {
  const values = this.valueSet.filter(_ => !cell.rows.includes(_)).filter(_ => !cell.columns.includes(_)).filter(_ => !cell.square.includes(_)).filter(_ => !cell.history.has(_))
  if (values.length === 0) {
    return 0
  }
  return values[Math.floor(Math.random() * values.length)]
}

//structure always pointing to the same array
function buildCellStructure (board, squareLength) {
  const cells = []
  const columnMap = new Map()
  const squareMap = new Map()  
//building square cell for board
  board.forEach((row, y) => {
    row.forEach((cellValue, x) => {
      if (!columnMap.has(x)) {
        columnMap.set(x, [])
      }
      columnMap.get(x).push(cellValue)
      const squareId = `${Math.floor(x / squareLength)}-${Math.floor(y / squareLength)}`
      //ceiling function to get max integer smaller than previous
      if (!squareMap.has(squareId)) {
        squareMap.set(squareId, [])
      }
      squareMap.get(squareId).push(cellValue)
      cells.push({
        x,y,value: cellValue,init: cellValue,rows: row,columns: columnMap.get(x),squareId,square:squareMap.get(squareId),history:new Set(),iter: 0
      })
    })
  })
  return cells
}

import { useBoard } from '../context/BoardContext'
import { useState } from 'react'

const Board = () => {
    const { board, setBoard } = useBoard()
    const [columnTitle, setColumnTitle] = useState('')

    const createBoard = async () => {
        const response = await fetch('http://localhost:3000/api/boards/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ title: "Board Title Here"})
        })

        const data = await response.json()
        if (response.ok) setBoard(data)
    };

    const addColumn = async () => {
        if (!columnTitle.trim()) return
        const response = await fetch('http://localhost:3000/api/columns/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ title: columnTitle, boardId: board?._id }),
        })

        const data = await response.json();
        if (response.ok) {
          if (!board) return <p>Loading board...</p>;
          setBoard({ ...board, columns: [...board.columns, data] })
          setColumnTitle('')
        }
    }

    if (!board) {
        return <button onClick={createBoard}>Create Board</button>
    }

    return (
        <div>
            <h1>{board.title}</h1>
            <div style={{ display: 'flex', gap: '20px' }}>
              {board.columns.map((col) => (
                    <div key={col._id} style={{ padding: '10px', border: '1px solid black' }}>
                        <h3>{col.title}</h3>
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
                placeholder="Column Name"
            />
            <button onClick={addColumn}>Add Column</button>
        </div>
    )
}

export default Board
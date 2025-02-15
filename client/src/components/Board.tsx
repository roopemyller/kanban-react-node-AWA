import { useBoard } from '../context/BoardContext'
import { useState } from 'react'
import Column from './Column'

const Board = () => {
    const { board, setBoard } = useBoard()
    const [boardName, setBoardName] = useState('')
    const [columnTitle, setColumnTitle] = useState('')
    const [isPopupOpen, setIsPopupOpen] = useState(false)

    const createBoard = async () => {
        const response = await fetch('http://localhost:3000/api/boards/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ title: boardName})
        })

        const data = await response.json()
        if (response.ok) setBoard(data)
    }

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
          setBoard({ ...board, columns: [...board.columns, { ...data, tasks: data.tasks || [] }] })
          setColumnTitle('')
          setIsPopupOpen(false)
        }
    }

    if (!board) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <input
                    type="text"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    placeholder="Board Name"
                    style={{ padding: '10px', marginRight: '10px', borderRadius: '5px' }}
                />
                <button onClick={createBoard} style={{ padding: '10px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none' }}>Create Board</button>
            </div>
        )
    }

    return (
        <div style={{ height: '75vh', display: 'flex', flexDirection: 'column', padding: '10px', border: '1px solid black', borderRadius: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{margin: 0}}>{board.title}</h2>
                
                <button onClick={() => setIsPopupOpen(true)}>Add Column</button>
            </div>
            <div style={{ flex: 1, display: 'flex', gap: '20px', overflowX: 'auto'}}>
                {board.columns.map((col) => (
                    <Column key={col._id} title={col.title} />
                ))}
            </div>
            {isPopupOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ background: 'rgb(37, 37, 37)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                    <h2>Add Column</h2>
                    <input
                        type="text"
                        value={columnTitle}
                        onChange={(e) => setColumnTitle(e.target.value)}
                        placeholder="Column Name"
                        style={{ padding: '10px', marginBottom: '10px', borderRadius: '5px' }}
                    />
                    <br />
                    <button onClick={addColumn} style={{ padding: '10px', marginRight: '10px', borderRadius: '5px', backgroundColor: 'green', color: 'white', border: 'none' }}>Add</button>
                    <button onClick={() => setIsPopupOpen(false)} style={{ padding: '10px', borderRadius: '5px', backgroundColor: 'red', color: 'white', border: 'none' }}>Cancel</button>
                </div>
            </div>
            )}
        </div>
    )
}

export default Board
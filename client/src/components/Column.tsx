import DeleteIcon from '@mui/icons-material/Delete';


interface ColumnProps {
    title: string;
}

const Column = ({ title }: ColumnProps) => {
    return (
        <div style={{ 
            padding: '10px', 
            border: '1px solid black', 
            minHeight: '400px', 
            flexGrow: 1,
            borderRadius: '5px'
        }}>
            <h3 style={{ textAlign: 'center' }}>{title}</h3>
            <DeleteIcon>
            </DeleteIcon>
            <div>
                Here is some tasks
            </div>
        </div>
    )
}

export default Column
import React from 'react'
import { Box, TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';

export const EnhancedTableHead = (props: any) => {
    const {
        onSelectAllClick, order, orderBy,
        numSelected, rowCount,
        numSelectedId, isSelectedId,
        onRequestSort,
        headCells
    } = props

    const createSortHandler =
        (property: any) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow sx={{ backgroundColor: '#1A3353' }}>
                {/* <TableCell padding='checkbox'>
                    <Checkbox
                        onChange={onSelectAllClick}
                        checked={numSelected === rowCount}
                        sx={{ color: 'inherit' }}
                    />
                </TableCell> */}
                {
                    headCells.map((headCell: any, index: number) => (
                        headCell.label === 'Actions' || headCell.label === 'Tags' ?
                            <TableCell
                                sx={{ 
                                    fontWeight: 'bold', 
                                    color: 'white',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                                    ...(index === 0 && { borderTopLeftRadius: '8px' }),
                                    ...(index === headCells.length - 1 && { borderTopRightRadius: '8px' }),
                                }}
                                key={headCell.id}
                                align={headCell.numeric ? 'left' : 'left'}
                                padding={headCell.disablePadding ? 'none' : 'normal'}>{headCell.label}</TableCell>
                            : <TableCell
                                sx={{ 
                                    fontWeight: 'bold', 
                                    color: 'white',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                                    ...(index === 0 && { borderTopLeftRadius: '8px' }),
                                    ...(index === headCells.length - 1 && { borderTopRightRadius: '8px' }),
                                }}
                                key={headCell.id}
                                align={headCell.numeric ? 'left' : 'left'}
                                padding={headCell.disablePadding ? 'none' : 'normal'}
                                sortDirection={orderBy === headCell.id ? order : false}
                            >
                                <TableSortLabel
                                    active={orderBy === headCell.id}
                                    direction={orderBy === headCell.id ? order : 'asc'}
                                    onClick={createSortHandler(headCell.id)}
                                    sx={{
                                        color: 'white !important',
                                        '&:hover': {
                                            color: 'white !important',
                                        },
                                        '&.Mui-active': {
                                            color: 'white !important',
                                            '& .MuiTableSortLabel-icon': {
                                                color: 'white !important',
                                            },
                                        },
                                        '& .MuiTableSortLabel-icon': {
                                            color: 'white !important',
                                        },
                                    }}
                                >
                                    {headCell.label}
                                    {
                                        orderBy === headCell.id
                                            ? (
                                                <Box component='span' sx={{ display: 'none' }}>
                                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                                </Box>
                                            )
                                            : null
                                    }
                                </TableSortLabel>
                            </TableCell>
                    ))
                }
            </TableRow>
        </TableHead>
    )
}
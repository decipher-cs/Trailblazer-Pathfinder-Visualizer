import { Box } from '@mui/material'
import { useGridConfig } from '../stateStore/gridConfigStore'
import Cell from './Cell'
import { forwardRef, memo, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { CellType } from '../types'
import { LazyMotion, domAnimation } from 'framer-motion'
import { FixedSizeGrid } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

const GAP = 4

const Grid = forwardRef((_, ref) => {
    const { columns, rows, cellSize } = useGridConfig(
        useShallow(state => ({ rows: state.rows, columns: state.columns, cellSize: state.cellSize })),
    )

    const cellTypeToPlaceOnClick = useRef<Extract<CellType, 'start' | 'finish'>>('start')

    return (
        <Box
            ref={ref}
            sx={{
                borderImage: 'linear-gradient(45deg, red, blue)',
                borderImageSlice: 1,
                borderStyle: 'solid',
                borderWidth: '8px',

                display: 'grid',
                placeContent: 'center',
                maxWidth: '100%',
                maxHeight: '100%',

                overflow: 'hidden',
                p: 3,
                width: '100%',
                height: '100%',
            }}
        >
            <LazyMotion features={domAnimation}>
                <AutoSizer>
                    {({ height, width }) => (
                        <FixedSizeGrid
                            style={{ overflow: 'auto', transform: 'translate(-50%, -50%)' }}
                            columnCount={columns}
                            rowCount={rows}
                            width={width}
                            height={height}
                            columnWidth={cellSize + GAP}
                            rowHeight={cellSize + GAP}
                        >
                            {props => (
                                <div style={{ ...props.style }}>
                                    <Cell
                                        index={props.rowIndex * columns + props.columnIndex}
                                        cellTypeToPlaceOnClick={cellTypeToPlaceOnClick}
                                    />
                                </div>
                            )}
                        </FixedSizeGrid>
                    )}
                </AutoSizer>
            </LazyMotion>
        </Box>
    )
})

export default memo(Grid)

import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  AccessorFn,
  ColumnHelper,
} from '@tanstack/react-table';

export const columnBuilder = <T extends Record<string, any>>(table: ColumnHelper<T>, id: string, label: string) => {
  return table.accessor((row) => row[id as keyof T], {
    id,
    cell: (info) => <div>{info.getValue()}</div>,
    header: () => <span className='text-black'>{label}</span>,
  });
}

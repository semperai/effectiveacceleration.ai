'use client'
import { Table, flexRender } from '@tanstack/react-table'
import React from 'react';
import { TOpenJobTable, TInProgressTable, TCompletedTable, TDisputedTable, TArchivedTable } from '@/service/JobsService';

const JobsTable = ({table, title}:{table:any, title:string}) => {
  return (
    <div className="[box-shadow:0px_0px_8px_lightgray] rounded-2xl bg-white">
        <div className='p-5'>
          <h1 className='text-xl font-semibold'>{title}</h1>
        </div>
        <table className='w-full'>
          <thead className=''>
            {table.getHeaderGroups().map(headerGroup => (
              <tr className='px-5 py-3 bg-gray-100 flex justify-between w-full' key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th className={`text-left flex-1 ${title === 'Opens Jobs' ? 'max-w-6' : '' }`} key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
                <tr className='flex justify-between w-full p-5 border-b border-gray-200 last:border-0' key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td className='flex-1' key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
            ))}
          </tbody>
        </table>
    </div>
  )
}

export default JobsTable
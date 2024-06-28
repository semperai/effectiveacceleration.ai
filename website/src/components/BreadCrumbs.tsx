// /components/BreadCrumbs.tsx
'use client'

import React, { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { PiHouseSimple } from "react-icons/pi";

type TBreadCrumbProps = {
    separator: ReactNode,
    containerClasses?: string,
    listClasses?: string,
    activeClasses?: string,
    capitalizeLinks?: boolean
}

const BreadCrumbs = ({separator, containerClasses, listClasses, activeClasses, capitalizeLinks}: TBreadCrumbProps) => {

    const paths = usePathname()
    const pathNames = paths.split('/').filter( path => path )

    return (
        <div>
            <ul className={containerClasses}>
            {
                pathNames.map( (link, index, row) => {
                    let href = `/${pathNames.slice(0, index + 1).join('/')}`
                    let itemClasses = paths === href ? `${listClasses} ${activeClasses}` : listClasses
                    let itemLink = capitalizeLinks ? link[0].toUpperCase() + link.slice(1, link.length) : link
                    return (
                        <React.Fragment key={index}>
                            <li className={index === row.length - 1 ? itemClasses : `ml-0 ${itemClasses}`} >
                                <Link href={href}>{itemLink}</Link>
                            </li>
                            {pathNames.length !== index + 1 && separator}
                        </React.Fragment>
                    )
                })
            }
            </ul>
        </div>
    )
}

export default BreadCrumbs
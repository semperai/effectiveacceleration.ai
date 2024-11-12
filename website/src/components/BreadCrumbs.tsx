// /components/BreadCrumbs.tsx
'use client';

import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { PiHouseSimple } from 'react-icons/pi';
import { useAccount } from 'wagmi';
import useJob from '@/hooks/useJob';
import { useJobUserRole } from '@/hooks/useJobUserRole';

type TBreadCrumbProps = {
  separator: ReactNode;
  containerClasses?: string;
  listClasses?: string;
  activeClasses?: string;
  capitalizeLinks?: boolean;
};

const BreadCrumbs = ({
  separator,
  containerClasses,
  listClasses,
  activeClasses,
  capitalizeLinks,
}: TBreadCrumbProps) => {
  const paths = usePathname();
  const pathNames = paths.split('/').filter((path) => path);
  const userRole = useJobUserRole();

  return (
    <div>
      <ul className={containerClasses}>
        {pathNames.map((link, index, row) => {
          let href = `/${pathNames.slice(0, index + 1).join('/')}`;
          if (userRole === 'owner' && href === '/dashboard/jobs') {
            href = '/dashboard/owner-job-list';
          } else if (userRole !== 'owner' && href === '/dashboard/jobs') {
            href = '/dashboard/worker-job-list';
          }
          let itemClasses =
            paths === href ? `${listClasses} ${activeClasses}` : listClasses;
          let itemLink = capitalizeLinks
            ? link[0].toUpperCase() + link.slice(1, link.length)
            : link;
          return (
            <React.Fragment key={index}>
              <li
                className={
                  index === row.length - 1 ? itemClasses : `ml-0 ${itemClasses}`
                }
              >
                <Link href={href}>{itemLink}</Link>
              </li>
              {pathNames.length !== index + 1 && separator}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
};

export default BreadCrumbs;

'use client';

import { useJobUserRole } from '@/hooks/useJobUserRole';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { type ReactNode } from 'react';

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
            href = '/owner-job-list';
          } else if (userRole !== 'owner' && href === '/dashboard/jobs') {
            href = '/dashboard/worker-job-list';
          }
          const itemClasses =
            paths === href ? `${listClasses} ${activeClasses}` : listClasses;
          const itemLink = capitalizeLinks
            ? link[0].toUpperCase() +
              link.slice(1, link.length).replace(/-/g, ' ')
            : link.replace(/-/g, ' ');
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

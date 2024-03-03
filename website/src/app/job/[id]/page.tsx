import { clsx } from 'clsx'
import { Fragment } from 'react'
import { Layout } from '@/components/Layout'
import { Link } from '@/components/Link'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Text } from '@/components/Text'
import {
  BriefcaseIcon,
  CalendarIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  LinkIcon,
  MapPinIcon,
  PencilIcon,
  TagIcon,
  UserCircleIcon,
} from '@heroicons/react/20/solid'
import { Menu, Transition } from '@headlessui/react'


type NotificationComment = {
  id: number
  type: 'comment'
  person: { name: string; href: string }
  imageUrl: string
  comment: string
  date: string
}

type NotificationAssignment = {
  id: number
  type: 'assignment'
  person: { name: string; href: string }
  assigned: { name: string; href: string }
  date: string
}

type NotificationTags = {
  id: number
  type: 'tags'
  person: { name: string; href: string }
  tags: { name: string; href: string; color: string }[]
  date: string
}

type Notification = NotificationComment | NotificationAssignment | NotificationTags

function CommentActivityItem(activityItem: NotificationComment) {
  return (
    <>
      <div className="relative">
        <img
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white"
          src={activityItem.imageUrl}
          alt=""
        />

        <span className="absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px">
          <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-gray-400 dark:text-gray-600" aria-hidden="true" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div>
          <div className="text-sm">
            <a href={activityItem.person.href} className="font-medium text-gray-900 dark:text-gray-100">
              {activityItem.person.name}
            </a>
          </div>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Commented {activityItem.date}</p>
        </div>
        <div className="mt-2 text-sm text-gray-700 dark:text-gray-500">
          <p>{activityItem.comment}</p>
        </div>
      </div>
    </>
  )
}

function AssignmentActivityItem(activityItem: NotificationAssignment) {
  return (
    <>
      <div>
        <div className="relative px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
            <UserCircleIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1 py-1.5">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <a href={activityItem.person.href} className="font-medium text-gray-900 dark:text-gray-100">
            {activityItem.person.name}
          </a>{' '}
          assigned{' '}
          <a href={activityItem.assigned.href} className="font-medium text-gray-900 dark:text-gray-100">
            {activityItem.assigned.name}
          </a>{' '}
          <span className="whitespace-nowrap">{activityItem.date}</span>
        </div>
      </div>
    </>
  );
}

function TagsActivityItem(activityItem: NotificationTags) {
  return (
    <>
      <div>
        <div className="relative px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
            <TagIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1 py-0">
        <div className="text-sm leading-8 text-gray-500 dark:text-gray-400">
          <span className="mr-0.5">
            <a href={activityItem.person.href} className="font-medium text-gray-900 dark:text-gray-100">
              {activityItem.person.name}
            </a>{' '}
            added tags
          </span>{' '}
          <span className="mr-0.5 flex gap-3">
            {activityItem.tags.map((tag) => (
              <Fragment key={tag.name}>
                <Badge color="lime">
                  {tag.name}
                </Badge>
              </Fragment>
            ))}
          </span>
          <span className="whitespace-nowrap">{activityItem.date}</span>
        </div>
      </div>
    </>
  )
}
  

export default function JobPage() {
  const jobId = '0x3f4...c3a'
  const activity: Notification[] = [
    {
      id: 1,
      type: 'comment',
      person: { name: 'Eduardo Benz', href: '#' },
      imageUrl:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
      comment:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. ',
      date: '6d ago',
    },
    {
      id: 2,
      type: 'assignment',
      person: { name: 'Hilary Mahy', href: '#' },
      assigned: { name: 'Kristin Watson', href: '#' },
      date: '2d ago',
    },
    {
      id: 3,
      type: 'tags',
      person: { name: 'Hilary Mahy', href: '#' },
      tags: [
        { name: 'Bug', href: '#', color: 'fill-red-500' },
        { name: 'Accessibility', href: '#', color: 'fill-indigo-500' },
      ],
      date: '6h ago',
    },
    {
      id: 4,
      type: 'comment',
      person: { name: 'Jason Meyers', href: '#' },
      imageUrl:
        'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
      comment:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
      date: '2h ago',
    },
  ]

  return (
    <Layout>
      <div className="">
        <div className="min-w-0 flex-1">
          <nav className="flex" aria-label="Breadcrumb">
            <ol role="list" className="flex items-center space-x-4">
              <li>
                <div className="flex">
                  <Link href="/open-jobs" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    Jobs
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-400" aria-hidden="true" />
                  <Link href={`/job/${jobId}`} className="ml-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    0x3f4...c3a
                  </Link>
                </div>
              </li>
            </ol>
          </nav>
          <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
            Create a story book about Bitcoin
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <CurrencyDollarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-300" aria-hidden="true" />
              0.003 ETH
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-300" aria-hidden="true" />
              1h
            </div>
          </div>
        </div>
        <div className="mt-5">
          <Text>
            I am looking for someone to write a story book about Bitcoin and the blockchain. The book should be at least 20 pages long and include a brief history of Bitcoin, the technology behind it, and the potential impact it could have on the world. I am looking for someone who can write in a way that is easy to understand and engaging for a general audience. It should have illustrations and be suitable for children.
          </Text>
        </div>
        <div className="mt-5 flex">
          <span>
            <Button>
              <PencilIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              Message
            </Button>
          </span>

          <span className="ml-3">
            <Button>
              <CheckIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Accept
            </Button>
          </span>

          <span className="ml-3">
            <Button>
              <LinkIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              Share
            </Button>
          </span>

        </div>
      </div>


      <div className="flow-root mt-20">
        <ul role="list" className="-mb-8">
          {activity.map((activityItem, activityItemIdx) => (
            <li key={activityItem.id}>
              <div className="relative pb-8">
                {activityItemIdx !== activity.length - 1 ? (
                  <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                ) : null}
                <div className="relative flex items-start space-x-3">
                  {activityItem.type === 'comment' ?
                      CommentActivityItem(activityItem)
                  : activityItem.type === 'assignment' ?
                      AssignmentActivityItem(activityItem)
                  : activityItem.type === 'tags' ?
                      TagsActivityItem(activityItem)
                  : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}

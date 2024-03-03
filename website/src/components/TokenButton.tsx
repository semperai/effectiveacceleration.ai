import { Avatar } from '@/components/Avatar'
import { Token } from '@/tokens'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const baseClass = "w-fit rounded-full font-medium text-xl flex gap-2 px-3 py-2 items-center"

export interface ISelect {
  onClick: () => void
  selectedToken: Token | undefined
}

export function TokenButton({ onClick, selectedToken }: ISelect) {
  if (selectedToken) {
    return (
      <button
        onClick={onClick}
        className={`${baseClass} bg-slate-200 hover:bg-slate-300 text-slate-900`}
      >
        <Avatar className="size-8" src={selectedToken.icon} />
        <div>{selectedToken.symbol}</div>
        <ChevronDownIcon className="h-6 w-6 text-white" aria-hidden="true" />
      </button>
    )
  } else {
    return (
      <button
        onClick={onClick}
        className={`${baseClass} bg-rose-500 hover:bg-rose-600 text-white`}
      >
        <div>Select token</div>
        <ChevronDownIcon className="h-6 w-6 text-white" aria-hidden="true" />
      </button>
    )
  }
}

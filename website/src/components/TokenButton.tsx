import { Avatar } from '@/components/Avatar'
import { Token } from '@/tokens'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const baseClass = "w-fit rounded-lg font-medium flex gap-2 items-center"


export function TokenButton({ onClick, selectedToken }: {
  onClick: () => void
  selectedToken: Token | undefined
}) {
  if (selectedToken) {
    return (
      <button
        onClick={onClick}
        className={`${baseClass} bg-slate-100 hover:bg-slate-200 text-slate-900`}
      >
        <Avatar className="size-8" src={selectedToken.icon} />
        <div>{selectedToken.symbol}</div>
        <ChevronDownIcon className="h-6 w-6 text-black" aria-hidden="true" />
      </button>
    )
  } else {
    return (
      <button
        onClick={onClick}
        className={`${baseClass} bg-blue-500 hover:bg-blue-600 text-white`}
      >
        <div>Select token</div>
        <ChevronDownIcon className="h-6 w-6 text-white" aria-hidden="true" />
      </button>
    )
  }
}

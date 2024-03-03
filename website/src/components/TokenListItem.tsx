import { Avatar } from '@/components/Avatar'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Token } from '@/tokens'

export function TokenListItem({ token, selected = false, onClick }: {
  token: Token;
  selected: boolean;
  onClick: (token: Token) => void;
}) {
  return (
    <>
      <button
        className={`flex justify-between px-2 items-center hover:bg-slate-50 ${selected ? 'opacity-40': ''}`}
        onClick={() => onClick(token)}
      >
        <div className="flex items-center gap-4">
          <Avatar className="size-8" src={token.icon} />
          <div className="flex flex-col items-start">
            <div className="text-lg text-slate-900">{token.name}</div>
            <div className="text-slate-400">{token.symbol}</div>
          </div>
        </div>
        <div>
          {selected && <ChevronDownIcon className="h-6 w-6 text-white" aria-hidden="true" />}
        </div>
      </button>
    </>
  )
}


import { Token, tokens } from "@/tokens";
import { TokenListItem } from "@/components/TokenListItem";

export function TokenList({ selectedToken, onClick }: {
  onClick: (token: Token) => void
  selectedToken: Token | undefined
}) {
  return (
    <div className="flex flex-col gap-4">
      {tokens.map((token, idx) =>
        <TokenListItem
          token={token}
          selected={token.id == selectedToken?.id}
          onClick={onClick}
          key={idx}
        />)
      }
    </div>
  )

}

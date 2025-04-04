import { PiArrowsClockwise } from 'react-icons/pi';
import clsx from 'clsx';

interface NetworkSwitcherProps {
  onSwitchNetwork: () => void;
  isSwitchingNetwork: boolean;
}

export const NetworkSwitcher = ({ onSwitchNetwork, isSwitchingNetwork }: NetworkSwitcherProps) => (
  <div className="max-w-2xl mx-auto w-full bg-white p-8 rounded-2xl shadow-xl text-center">
    <div className="mb-6">
      <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
        <PiArrowsClockwise className="h-8 w-8 text-orange-500" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Wrong Network</h2>
      <p className="text-gray-600 mb-6">
        EACC staking is only available on Ethereum Mainnet. Please switch your network to continue.
      </p>
    </div>

    <button
      onClick={onSwitchNetwork}
      disabled={isSwitchingNetwork}
      className={clsx(
        'group relative inline-flex items-center gap-2 bg-gradient-to-r px-6 py-2 w-full justify-center',
        'from-orange-500 to-amber-500 shadow-orange-500/25 hover:from-orange-400 hover:to-amber-400',
        'rounded-xl font-semibold text-white shadow-lg',
        'transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-xl',
        'active:translate-y-0 active:shadow-md',
        'disabled:opacity-70 disabled:hover:transform-none disabled:hover:shadow-lg'
      )}
    >
      {isSwitchingNetwork ? 'Switching...' : 'Switch to Ethereum Mainnet'}

      <div className='absolute inset-0 overflow-hidden rounded-xl'>
        <div className='absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]' />
      </div>
    </button>
  </div>
);
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import {
  Dialog,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Chip,
  Input,
  List,
  ClickAwayListener,
  Slide,
  ListItemButton,
} from '@mui/material';
import {
  ContainerListPreferredTokens,
  StyledDialogTitle,
  ContainerSearchInput,
  StyledDialogContent,
  DialogWrapper,
  AddTokenWrapper,
} from './styles';
import Link from 'next/link';
import { ethers } from 'ethers';
import lscacheModule from './Dependencies/lscache';
import { CloseOutlined, SearchOutlined } from '@mui/icons-material';

import { uniqueBy } from './Dependencies/uniqueBy';
import { Button } from '@/components/Button';
import { EthereumIcon } from './Dependencies/Icons/EthereumIcon';
import { ExternalLinkIcon } from './Dependencies/Icons/ExternalLinkIcon';
import { PinIcon } from './Dependencies/Icons/PinIcon';
import { toast } from './Dependencies/toast';
import Unicrow from '@unicrowio/sdk';
import { reduceAddress } from './Dependencies/addressFormatter';

interface IArbitrumToken {
  logoURI?: string;
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  extensions?: any;
  l1Address?: string;
  l2GatewayAddress?: string;
  l1GatewayAddress?: string;
}

const TokenDialog = ({
  initiallySelectedToken,
  tokensList,
  preferredTokenList,
  closeCallback,
}: {
  initiallySelectedToken: IArbitrumToken;
  tokensList: IArbitrumToken[];
  preferredTokenList: IArbitrumToken[];
  closeCallback: (arg0: IArbitrumToken) => void;
}) => {
  const [selectedToken, setSelectedToken] = React.useState<IArbitrumToken>(
    initiallySelectedToken
  );
  const [favoriteTokens, setFavoriteTokens] =
    React.useState<IArbitrumToken[]>(preferredTokenList);
  const [filteredTokens, setFilteredTokens] =
    React.useState<IArbitrumToken[]>();
  const [customTokens, setCustomTokens] = React.useState<IArbitrumToken[]>(
    lscacheModule.get('custom-tokens') || []
  );
  const [searchValue, setSearchValue] = React.useState<string>('');
  const [customTokenValue, setAddTokenValue] = React.useState<string>('');
  const [provider, setProvider] = React.useState<any>(null);
  const [sortedTokensList, setSortedTokensList] = React.useState([]);
  const [isAddCustomToken, setAddCustomToken] = React.useState(false);
  const noTokensFound = !filteredTokens || filteredTokens.length === 0;

  const getBalance = async (token: IArbitrumToken) => {
    const balance = await provider.getBalance(token.address);
    const balanceInEth = ethers.formatEther(balance);
    return balanceInEth;
  };

  const handleSelectToken = (token: IArbitrumToken, event: any) => {
    // DIV = preferred token (chip) or TokenItem, BUTTON = close button
    if (['DIV', 'BUTTON'].includes(event.target.nodeName)) {
      setSelectedToken(token);
      closeCallback(token);
    }
  };

  const addCustomToken = () => {
    if (!Unicrow.helpers.isValidAddress(customTokenValue)) {
      toast('Please provide a valid address', 'error');
      return;
    }

    const newToken = {
      symbol: 'UNK',
      name: `UNKNOWN (${reduceAddress(customTokenValue)})`,
      address: customTokenValue,
    } as IArbitrumToken;

    const newList = Array.from(new Set([...customTokens, newToken]));
    lscacheModule.set('custom-tokens', newList, Infinity);
    setCustomTokens(newList);
    setFilteredTokens([...filteredTokens!, newToken]);
    setAddCustomToken(false);
  };

  const addFavoriteTokens = (token: IArbitrumToken) => {
    const newList = uniqueBy('address', [...favoriteTokens, token], 'symbol');
    updateFavoriteTokens(newList);
  };

  const deleteTokenFromFavorites = (token: IArbitrumToken) => {
    const newList = uniqueBy(
      'address',
      [...favoriteTokens.filter((t) => t.address !== token.address)],
      'symbol'
    );

    updateFavoriteTokens(newList);
  };

  const updateFavoriteTokens = (newList: IArbitrumToken[]) => {
    setFavoriteTokens(newList);
    lscacheModule.remove('preferred-tokens');
    lscacheModule.set('preferred-tokens', newList, Infinity);
  };

  const handleTokenListScroll = (e: any) => {
    const t = e.target;
    const atTop = t.scrollTop === 0;
    const atBottom = t.scrollHeight - t.scrollTop === t.clientHeight;

    if (atTop) {
      t.classList.add('hidden-before');
      t.classList.remove('hidden-after');
    } else if (atBottom) {
      t.classList.add('hidden-after');
      t.classList.remove('hidden-before');
    } else {
      t.classList.remove('hidden-after');
      t.classList.remove('hidden-before');
    }
  };

  React.useEffect(() => {
    const getProvider = async () => {
      const provider = await Unicrow.wallet.getWeb3Provider();
      setProvider(provider);
    };

    getProvider();

    return () => setProvider(null);
  }, []);

  React.useEffect(() => {
    if (filteredTokens?.length === 0) {
      setFilteredTokens([...tokensList, ...customTokens]);
      setFavoriteTokens(preferredTokenList);
    }
  }, [tokensList]);

  // filters tokens by search input
  React.useEffect(() => {
    // const list = [
    //   ...(sortedTokensList?.length > 0 ? sortedTokensList : tokensList),
    //   ...customTokens,
    // ];
    const list = [
      ...(Array.isArray(sortedTokensList) && sortedTokensList.length > 0
        ? sortedTokensList
        : Array.isArray(tokensList)
          ? tokensList
          : []),
      ...(Array.isArray(customTokens) ? customTokens : []),
    ];
    console.log(sortedTokensList, 'sortedTokensList');
    console.log(tokensList, 'tokensList');
    const _value = `${searchValue}`.toLowerCase();

    if (_value !== '') {
      const newList = [];
      for (const token of list) {
        const _searchText =
          `${token.name} ${token.address} ${token.symbol}`.toLowerCase();

        if (_searchText.includes(_value)) {
          newList.push(token);
        }
      }
      setFilteredTokens(newList);
      console.log('Newlist');
    } else {
      console.log('default');
      // setFilteredTokens(list);
    }
  }, [searchValue, tokensList, sortedTokensList]);

  // gets all balances and converts them in USD, after that `sortedTokensList` is used to filter tokens
  // => to improve the user experience, the fetch is delayed - until then tokens are already displayed and searchable (tokensList)
  React.useEffect(() => {
    if (provider && sortedTokensList?.length === 0 && tokensList?.length > 0) {
      // TODO: make sure the balances are correct (for now they are probably not, hence following code is commented out to not execute costly requests)
      /*
      setTimeout(async () => {
        const promises = tokensList.map(getBalance);
        const listWithBalance = await Promise.all(promises).then((results) =>
          tokensList.map((t, idx) => ({ ...t, balance: results[idx] })),
        );
        const ethPrice = await Unicrow.helpers.getExchangeRates(["ETH"]);
        const listMerged = listWithBalance.map((t) => {
          const balance =
            t.balance === "0.0" ? "0.0" : (t.balance * ethPrice.ETH).toFixed(2);
          return { ...t, balance };
        });

        setSortedTokensList(listMerged.sort((a, b) => b.balance - a.balance));
      }, 200);
      */
    }
  }, [tokensList, sortedTokensList, provider]);

  const FavoriteTokens = React.useMemo(() => {
    const AvatarNonEth = (token: any) =>
      token.logoURI ? (
        <Avatar src={token.logoURI} />
      ) : (
        <Avatar>{token.symbol}</Avatar>
      );

    return favoriteTokens?.length ? (
      <ContainerListPreferredTokens>
        {(favoriteTokens || []).map((token) => (
          <Chip
            key={token.address}
            avatar={
              token.name === 'ETH' ? <EthereumIcon /> : AvatarNonEth(token)
            }
            label={token.symbol}
            clickable
            color={
              token.address === selectedToken?.address ? 'primary' : 'default'
            }
            onDelete={() => deleteTokenFromFavorites(token)}
            variant='outlined'
            onClick={(e) => handleSelectToken(token, e)}
          />
        ))}
      </ContainerListPreferredTokens>
    ) : null;
  }, [favoriteTokens, selectedToken]);

  const InputResetButton = (value: any) =>
    value.length > 0 && (
      <IconButton
        onClick={() => {
          setSearchValue('');
          setAddCustomToken(false);
        }}
        title='Clear'
        onMouseDown={(e) => e.preventDefault()}
        color='secondary'
        size='large'
      >
        <CloseOutlined />
      </IconButton>
    );

  return (
    <ClickAwayListener onClickAway={() => closeCallback(selectedToken)}>
      <Dialog
        open={true}
        onClose={() => closeCallback(selectedToken)}
        aria-labelledby='simple-dialog-title'
        maxWidth={false}
        scroll='paper'
      >
        <DialogWrapper>
          <StyledDialogTitle id='simple-dialog-title'>
            <div>
              <h2>Select a Token</h2>

              <IconButton
                aria-label='close'
                onClick={(e) => handleSelectToken(selectedToken, e)}
                size='large'
              >
                <CloseOutlined />
              </IconButton>
            </div>
          </StyledDialogTitle>

          {FavoriteTokens}

          <ContainerSearchInput>
            <Input
              type='text'
              placeholder='Search name or paste address'
              title='Search'
              fullWidth
              autoFocus
              value={searchValue}
              onChange={(e) => {
                setAddCustomToken(false);
                setSearchValue(e.target.value);
              }}
              endAdornment={
                <>
                  {InputResetButton(searchValue)}
                  <SearchOutlined color='secondary' />
                </>
              }
            />
          </ContainerSearchInput>

          <StyledDialogContent
            className='hidden-before'
            onScroll={handleTokenListScroll}
            $isAddCustomToken={isAddCustomToken}
            $noTokensFound={noTokensFound}
          >
            <List>
              {noTokensFound ? (
                <li className='text-black'>No results found.</li>
              ) : (
                filteredTokens.map((token) => (
                  <TokenItem
                    key={token.address}
                    token={token}
                    selectedToken={selectedToken}
                    handleSelectToken={handleSelectToken}
                    addFavoriteTokens={addFavoriteTokens}
                  />
                ))
              )}
            </List>
          </StyledDialogContent>
        </DialogWrapper>
        {noTokensFound && (
          <AddTokenWrapper isAddCustomToken={isAddCustomToken}>
            <p
              onClick={() => {
                setAddTokenValue(searchValue);
                setAddCustomToken(true);
              }}
            >
              Add Token {!isAddCustomToken && '+'}
            </p>
            {isAddCustomToken && (
              <>
                <Input
                  type='text'
                  placeholder='Search name or paste address'
                  title='Search'
                  fullWidth
                  autoFocus
                  value={customTokenValue}
                  onChange={(e) => setAddTokenValue(e.target.value)}
                  endAdornment={InputResetButton(customTokenValue)}
                />
                <Button onClick={addCustomToken}>Add</Button>
              </>
            )}
          </AddTokenWrapper>
        )}
      </Dialog>
    </ClickAwayListener>
  );
};

const TokenItem = ({
  token,
  selectedToken,
  handleSelectToken,
  addFavoriteTokens,
}: {
  token: any;
  selectedToken: any | null;
  handleSelectToken: (token: any, event: React.MouseEvent) => void;
  addFavoriteTokens: (token: any) => void;
}) => {
  return (
    <Slide
      key={token.address}
      direction='down'
      in={true}
      timeout={{ enter: 200 }}
    >
      <ListItemButton
        selected={selectedToken?.address === token.address}
        onClick={(e) => handleSelectToken(token, e)}
      >
        <ListItemIcon>
          {token.logoURI ? (
            <Avatar src={token.logoURI} />
          ) : (
            <Avatar>{token.symbol}</Avatar>
          )}
        </ListItemIcon>

        <ListItemText disableTypography>
          <span className='token'>
            <span>{token.name}</span>
            <span className='balance'>
              {token?.balance ? token.balance : ''}
            </span>
          </span>

          <span className='pin' onClick={() => addFavoriteTokens(token)}>
            <PinIcon />
          </span>
          <Link
            href={`https://arbiscan.io/token/${token.address}`}
            target='_blank'
            rel='noreferrer nofollow'
          >
            <ExternalLinkIcon />
          </Link>
        </ListItemText>
      </ListItemButton>
    </Slide>
  );
};

export default TokenDialog;

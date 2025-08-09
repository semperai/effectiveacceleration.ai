/* eslint-disable @next/next/no-img-element */
// src/components/TokenDialog/index.tsx

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
  CircularProgress,
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
import { reduceAddress } from './Dependencies/addressFormatter';
import { fetchTokenMetadata, isValidTokenContract, type IArbitrumToken } from './Dependencies/tokenHelpers';
import { usePublicClient } from 'wagmi';

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
  const [provider, setProvider] = React.useState<ethers.Provider | null>(null);
  const [sortedTokensList, setSortedTokensList] = React.useState([]);
  const [isAddCustomToken, setAddCustomToken] = React.useState(false);
  const [isLoadingToken, setIsLoadingToken] = React.useState(false);
  const [tokenLoadError, setTokenLoadError] = React.useState<string>('');
  const publicClient = usePublicClient();
  
  const noTokensFound = !filteredTokens || filteredTokens.length === 0;

  const getBalance = async (token: IArbitrumToken) => {
    const balance = await provider.getBalance(token.address);
    const balanceInEth = ethers.formatEther(balance);
    return balanceInEth;
  };

  const handleSelectToken = (token: IArbitrumToken, event: any) => {
    // Prevent event from bubbling up
    event.stopPropagation();
    
    // Don't select if clicking on pin or external link
    const target = event.target as HTMLElement;
    const isPin = target.closest('.pin');
    const isLink = target.closest('a');
    
    if (!isPin && !isLink) {
      setSelectedToken(token);
      closeCallback(token);
    }
  };

  const addCustomToken = async () => {
    setTokenLoadError('');
    
    // Basic address validation
    if (!ethers.isAddress(customTokenValue)) {
      setTokenLoadError('Please provide a valid address');
      toast('Please provide a valid address', 'error');
      return;
    }

    // Check if token already exists
    const existingToken = [...tokensList, ...customTokens].find(
      t => t.address.toLowerCase() === customTokenValue.toLowerCase()
    );
    
    if (existingToken) {
      toast('Token already in list', 'error');
      setSelectedToken(existingToken);
      closeCallback(existingToken);
      return;
    }

    setIsLoadingToken(true);

    try {
      // Get provider from publicClient
      if (!publicClient) {
        throw new Error('No public client available');
      }
      
      // Create ethers provider from viem publicClient
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      
      // Validate if it's a token contract
      const isValid = await isValidTokenContract(customTokenValue, provider);
      
      if (!isValid) {
        setTokenLoadError('Address is not a valid ERC20 token contract');
        toast('Address is not a valid ERC20 token contract', 'error');
        setIsLoadingToken(false);
        return;
      }

      // Fetch token metadata
      const tokenMetadata = await fetchTokenMetadata(customTokenValue, provider);
      
      if (!tokenMetadata) {
        setTokenLoadError('Failed to fetch token information');
        toast('Failed to fetch token information', 'error');
        setIsLoadingToken(false);
        return;
      }

      // Add to custom tokens list
      const newList = [...customTokens, tokenMetadata];
      lscacheModule.set('custom-tokens', newList, Infinity);
      setCustomTokens(newList);
      
      // Update filtered tokens if search is active
      if (filteredTokens) {
        setFilteredTokens([...filteredTokens, tokenMetadata]);
      }
      
      // Select the newly added token
      setSelectedToken(tokenMetadata);
      
      // Reset form
      setAddCustomToken(false);
      setAddTokenValue('');
      setSearchValue('');
      
      toast(`Added ${tokenMetadata.symbol} successfully`, 'success');
      
      // Optionally close the dialog after adding
      // closeCallback(tokenMetadata);
      
    } catch (error) {
      console.error('Error adding custom token:', error);
      setTokenLoadError('Failed to add token. Please check the address.');
      toast('Failed to add token', 'error');
    } finally {
      setIsLoadingToken(false);
    }
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
      try {
        if (window.ethereum) {
          const browserProvider = new ethers.BrowserProvider(window.ethereum as any);
          setProvider(browserProvider);
        }
      } catch (error) {
        console.error('Error getting provider:', error);
      }
    };

    getProvider();

    return () => setProvider(null);
  }, []);

  React.useEffect(() => {
    if (!favoriteTokens?.length && tokensList?.length > 0) {
      // Set default favorite tokens to priority tokens
      const prioritySymbols = ['USDC', 'USDT', 'WETH', 'AIUS', 'EACC'];
      const priorityTokens = tokensList.filter(token => 
        prioritySymbols.includes(token.symbol)
      ).slice(0, 5);
      
      if (priorityTokens.length > 0) {
        setFavoriteTokens(priorityTokens);
        lscacheModule.set('preferred-tokens', priorityTokens, Infinity);
      } else {
        setFavoriteTokens(preferredTokenList);
      }
    }
    
    if (filteredTokens?.length === 0) {
      setFilteredTokens([...tokensList, ...customTokens]);
    }
  }, [tokensList, preferredTokenList, customTokens]);

  // Enhanced search to detect contract addresses
  React.useEffect(() => {
    const checkIfAddressAndLoad = async () => {
      // Check if search value is a valid address
      if (ethers.isAddress(searchValue)) {
        // Check if this address is already in our lists
        const existingToken = [...tokensList, ...customTokens].find(
          t => t.address.toLowerCase() === searchValue.toLowerCase()
        );
        
        if (!existingToken) {
          // Automatically show add token UI for valid addresses
          setAddTokenValue(searchValue);
          setAddCustomToken(true);
        }
      }
    };

    checkIfAddressAndLoad();
  }, [searchValue]);

  // filters tokens by search input
  React.useEffect(() => {
    const list = [
      ...(Array.isArray(sortedTokensList) && sortedTokensList.length > 0
        ? sortedTokensList
        : Array.isArray(tokensList)
          ? tokensList
          : []),
      ...(Array.isArray(customTokens) ? customTokens : []),
    ];
    
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
    } else {
      setFilteredTokens(list);
    }
  }, [searchValue, tokensList, sortedTokensList, customTokens]);

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
        // Would need to implement getExchangeRates separately
        // const ethPrice = await getExchangeRates(["ETH"]);
        // const listMerged = listWithBalance.map((t) => {
        //   const balance =
        //     t.balance === "0.0" ? "0.0" : (t.balance * ethPrice.ETH).toFixed(2);
        //   return { ...t, balance };
        // });

        // setSortedTokensList(listMerged.sort((a, b) => b.balance - a.balance));
      }, 200);
      */
    }
  }, [tokensList, sortedTokensList, provider]);

  const FavoriteTokens = React.useMemo(() => {
    const AvatarNonEth = (token: any) =>
      token.logoURI ? (
        <Avatar src={token.logoURI} />
      ) : (
        <Avatar>{token.symbol?.substring(0, 3) || '?'}</Avatar>
      );

    return favoriteTokens?.length ? (
      <ContainerListPreferredTokens>
        {(favoriteTokens || []).map((token) => (
          <Chip
            key={token.address}
            avatar={
              token.name === 'ETH' || token.symbol === 'ETH' 
                ? <EthereumIcon /> 
                : AvatarNonEth(token)
            }
            label={token.symbol}
            clickable
            color={
              token.address === selectedToken?.address ? 'primary' : 'default'
            }
            onDelete={(e) => {
              e.stopPropagation();
              deleteTokenFromFavorites(token);
            }}
            variant='outlined'
            onClick={() => {
              setSelectedToken(token);
              closeCallback(token);
            }}
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
          setAddTokenValue('');
          setTokenLoadError('');
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
                setTokenLoadError('');
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
              {noTokensFound && !isAddCustomToken ? (
                <li className='text-black'>No results found.</li>
              ) : (
                filteredTokens?.map((token) => (
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
        {(noTokensFound || ethers.isAddress(searchValue)) && (
          <AddTokenWrapper isAddCustomToken={isAddCustomToken}>
            {!isAddCustomToken && (
              <p
                onClick={() => {
                  setAddTokenValue(searchValue);
                  setAddCustomToken(true);
                }}
                style={{ cursor: 'pointer' }}
              >
                Add Token +
              </p>
            )}
            {isAddCustomToken && (
              <>
                <Input
                  type='text'
                  placeholder='Enter token contract address'
                  title='Token Address'
                  fullWidth
                  autoFocus
                  value={customTokenValue}
                  onChange={(e) => {
                    setAddTokenValue(e.target.value);
                    setTokenLoadError('');
                  }}
                  error={!!tokenLoadError}
                  endAdornment={
                    <>
                      {isLoadingToken && <CircularProgress size={20} />}
                      {!isLoadingToken && InputResetButton(customTokenValue)}
                    </>
                  }
                />
                {tokenLoadError && (
                  <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                    {tokenLoadError}
                  </p>
                )}
                <Button 
                  onClick={addCustomToken} 
                  disabled={isLoadingToken || !customTokenValue}
                >
                  {isLoadingToken ? 'Loading...' : 'Add Token'}
                </Button>
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
  token: IArbitrumToken;
  selectedToken: IArbitrumToken | null;
  handleSelectToken: (token: IArbitrumToken, event: React.MouseEvent) => void;
  addFavoriteTokens: (token: IArbitrumToken) => void;
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
        sx={{ cursor: 'pointer' }}
      >
        <ListItemIcon>
          {token.logoURI ? (
            <Avatar src={token.logoURI} />
          ) : (
            <Avatar>
              {token.symbol ? token.symbol.substring(0, 3) : '?'}
            </Avatar>
          )}
        </ListItemIcon>

        <ListItemText disableTypography>
          <span className='token'>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {token.name}
              {token.isCustom && (
                <Chip 
                  label="Custom" 
                  size="small" 
                  style={{ height: '20px' }}
                  color="secondary"
                />
              )}
            </span>
            <span className='balance'>
              {token?.balance ? token.balance : ''}
            </span>
          </span>

          <span 
            className='pin' 
            onClick={(e) => {
              e.stopPropagation();
              addFavoriteTokens(token);
            }}
            style={{ cursor: 'pointer' }}
          >
            <PinIcon />
          </span>
          <Link
            href={`https://arbiscan.io/token/${token.address}`}
            target='_blank'
            rel='noreferrer nofollow'
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLinkIcon />
          </Link>
        </ListItemText>
      </ListItemButton>
    </Slide>
  );
};

export default TokenDialog;

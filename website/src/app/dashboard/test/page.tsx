'use client';
import React, { useCallback } from 'react';
import { useState } from 'react';
import TokenSelectModal from '@/components/TokenSelectModal';
import TokenDialog from '@/components/TokenDialog';
import { mockTokens } from '@/components/TokenDialog/Dependencies/mockTokens';
import arbitrumTokens from '@/components/TokenDialog/Dependencies/arbitrumTokens.json';
import { Layout } from '@/components/Dashboard/Layout';
import Unicrow from '@unicrowio/sdk';
import { Input } from '@/components/Input';
import {
  getMediaFromIpfs,
  publishMediaToIpfs,
} from '@effectiveacceleration/contracts';
import { Button } from '@/components/Button';
import Markdown from 'react-markdown';
import { Textarea } from '@/components/Textarea';

export interface IArbitrumToken {
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

const Test = () => {
  const [preferredTokens, setPreferredTokens] = useState<IArbitrumToken[]>([]);
  const [selectedToken, setSelectedToken] = useState<IArbitrumToken>();
  const [markdownContent, setMarkdownContent] =
    useState<string>('Markdown content');
  const [downloadHash, setDownloadHash] = useState<string>('');
  const [sessionKey, setSessionKey] = useState<string>();

  // arbitrumTokens?.tokens[0],
  const [tokenSelectionDialogOpen, setTokenSelectionDialogOpen] =
    useState(false);
  const [selectableTokens, setSelectableTokens] = useState<any>();

  const publish = useCallback(
    async (file: File) => {
      const data = await file.arrayBuffer();
      const mimeType = file.type;
      const { cid } = await publishMediaToIpfs(
        mimeType,
        new Uint8Array(data),
        sessionKey
      );
      const downloadHash =
        '#' +
        encodeURIComponent(
          `filename=${file.name}&cid=${cid}${sessionKey ? `&sessionKey=${sessionKey}` : ''}`
        );
      setDownloadHash(downloadHash);
      setMarkdownContent(
        (prev) => prev + `\n\n[${file.name}](${downloadHash}) download link`
      );
    },
    [markdownContent, setMarkdownContent]
  );

  return (
    <Layout>
      aa
      <div className='border-4 border-solid p-5'>
        <strong>File upload test</strong>
        <div>
          <Input
            type='file'
            id='file'
            name='file'
            onChange={(e) => publish(e.target.files?.[0]!)}
          />
        </div>

        {downloadHash && <a href={downloadHash}>download link</a>}

        <div className='my-5 grid h-52 grid-cols-2 gap-20'>
          <div>
            <Textarea
              value={markdownContent}
              className='h-full leading-6'
              onChange={(e) => setMarkdownContent(e.target.value)}
            >
              {markdownContent}
            </Textarea>
          </div>
          <div>
            <Markdown className='h-full bg-slate-200 p-2'>
              {markdownContent}
            </Markdown>
          </div>
        </div>
      </div>
      {/* <TokenDialog
          initiallySelectedToken={selectedToken}
          preferredTokenList={mockTokens(preferredTokens)}
          tokensList={selectableTokens?.tokens}
          closeCallback={(dialogSelectedToken: IArbitrumToken) => {
            if (dialogSelectedToken) {
              setSelectedToken(dialogSelectedToken);
            }
            setTokenSelectionDialogOpen(false);
          }}
        /> */}
    </Layout>
  );
};

export default Test;

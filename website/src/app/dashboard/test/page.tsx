'use client';
import React, { useCallback } from 'react';
import { useState } from 'react';
import { Layout } from '@/components/Dashboard/Layout';
import Unicrow from '@unicrowio/sdk';
import { Input } from '@/components/Input';
import {
  getMediaFromIpfs,
  type JobCreatedEvent,
  publishMediaToIpfs,
} from '@effectiveacceleration/contracts';
import { Button } from '@/components/Button';
import Markdown from 'react-markdown';
import { Textarea } from '@/components/Textarea';
import useJobEventsWithDiffs from '@/hooks/subsquid/useJobEventsWithDiffs';
import JSON5 from '@mainnet-pat/json5-bigint';
import '@mainnet-pat/json5-bigint/lib/presets/extended';
import {
  subscribeToWebPushNotifications,
  unsubscribeFromWebPushNotifications,
} from '@/hooks/useRegisterWebPushNotifications';
import { useSwResetMessage } from '@/hooks/useSwResetMessage';

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
  const { data: jobEvents } = useJobEventsWithDiffs('21');
  const [subscribeAddress, setSubscribeAddress] = useState<string>(
    '0x66c402694eEe2235E892B950c9b330e5603FEbe1'
  );
  useSwResetMessage("21");

  const publish = useCallback(
    async (file: File) => {
      const data = await file.arrayBuffer();
      const mimeType = file.type;
      const { cid } = await publishMediaToIpfs(
        file.name,
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

  const unsubscribeFromNotifications = useCallback(async () => {
    await unsubscribeFromWebPushNotifications();
  }, []);

  const subscribeToNotifications = useCallback(async (address: string) => {
    await subscribeToWebPushNotifications(address);
  }, []);

  const sendTestNotification = useCallback(async () => {
    if (!jobEvents?.length) {
      return;
    }

    const registration = (await navigator.serviceWorker.getRegistration())!;
    const subscription = await registration.pushManager.getSubscription();

    const delay = 2; // seconds
    const ttl = 60; // seconds

    const event = jobEvents[0];
    (event.details as JobCreatedEvent).arbitrator = subscribeAddress;

    await fetch(
      `${process.env.NEXT_PUBLIC_PUSH_SERVICE_URL}/sendNotification`,
      {
        method: 'post',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON5.stringify({
          subscription: subscription,
          payload: JSON5.stringify(event),
          delay: delay,
          ttl: ttl,
        }),
      }
    );
  }, [jobEvents, subscribeAddress]);

  return (
    <Layout>
      <div className='flex flex-row gap-3'>
        <Input
          value={subscribeAddress}
          onChange={(e) => setSubscribeAddress(e.target.value)}
        />
        <Button onClick={() => subscribeToNotifications(subscribeAddress)}>
          Subscribe address to notifications
        </Button>
        <Button onClick={unsubscribeFromNotifications}>Unsubscribe</Button>
        <Button onClick={sendTestNotification}>Send test notification</Button>
      </div>
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
    </Layout>
  );
};

export default Test;

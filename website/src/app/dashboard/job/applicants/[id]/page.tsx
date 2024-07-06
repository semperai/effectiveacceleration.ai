'use client'

import React from 'react';
import { useParams } from 'next/navigation.js';
import jobs from './dummyData'
import { Layout } from '@/components/Dashboard/Layout'
import Image from 'next/image.js';
import { Button } from '@/components/Button';

const JobInformationPage = () => {
  const { id } = useParams();
  const jobInfo = jobs.find(job => job.id === id);

  if (!jobInfo) return <Layout><div>No job information available.</div></Layout>;

  return (
    <Layout borderless> 
        <div className='flex flex-row min-h-customHeader'>
            <div className='flex flex-1 flex-col bg-white p-3 border border-gray-100'>
                <div>
                    <span className='font-bold'>Chats</span>    
                </div>
                <div>
                    <span className='text-darkBlueFont text-sm'>2/16 applicants reviewed</span>  
                </div>
                    {jobInfo.applicants.map(applicant => (
                        <div key={applicant.id} className='flex flex-row py-2'>
                            <div className='flex flex-1 items-center '>
                                <Image className='max-h-10 max-w-10 rounded-lg' src={applicant.profile} height={100} width={100} alt={'Profile picture'}></Image>
                            </div>
                            <div className='flex flex-col flex-[4] items-left'>
                                <div><span >{applicant.name}</span></div>
                                <div><p className='text-sm text-darkBlueFont truncate ... max-w-52 '>{applicant.lastMessage}</p></div>
                            </div>
                            <div className='flex flex-1'>
                                    {applicant.lastMessageHour}
                            </div>
                        </div>
                    ))}

            </div>


            <div className='flex flex-[3] flex-col bg-white '>
                <div className='h-fit'>
                    <div className='flex flex-1 border border-gray-100 p-4 justify-between align-center'>
                        <div className='flex  h-fit'>
                            <div className='flex flex-row'> 
                                <div className='flex self-center pr-4'>
                                    <Image className='max-h-10 max-w-10 rounded-lg' src={jobInfo.applicants[0].profile} height={100} width={100} alt={'Profile picture'}/> 
                                </div>

                                <div className='self-center'>
                                        <span className='font-extrabold block'>
                                            Rebecca Blake 
                                        </span>
                                        <span className='text-primary font-semibold text-sm block'>
                                            Fixed rate: $45
                                        </span>
                                </div>
                            </div>
                        </div>
                        <div className='flex'>
                            <Button color={'cancelBorder'} className={'w-full'}>Reject</Button>
                        </div>
                    </div>
                </div>
                <div className='flex flex-[2] border border-gray-100 flex-col text-center justify-evenly p-2'>
                    <p className='flex text-sm self-center text-darkBlueFont'>You can dismiss Rebecca Blake or select them for the job.</p>
                    <p className='flex text-sm self-center text-darkBlueFont'>- Dismissing a candidate worker will hide the worker from the list and you will no longer be notified about new messages from them.</p>
                    <p className='flex text-sm self-center text-darkBlueFont'>- Selecting the candidate will set only this worker in the whitelist, preventing other candidates from messaging you, so you can focus on hammering out the details with the selected worker Read Less...</p>

                </div>
                <div className='flex flex-[6] border border-gray-100 bg-softBlue'></div>
                <div className='flex flex-1 border border-gray-100'></div>
            </div>






            <div className='flex flex-1 bg-white flex-col'>
                <div className='py-5 px-8  text-center bg-[#FF7B02] bg-opacity-10'>
                    <span className='font-bold text-[#FF7A00]'>Awaiting Job Acceptance</span> 
                </div>
                <div className='p-4 border border-gray-100'>
                    <div>
                        <span className='font-bold'>I require a crypto token website.</span>    
                    </div>
                    <div className='my-2 mb-4'>
                        <span className='text-sm mb-2'>We are seeking a talented freelance web developer with a passion for blockchain technology to create an engaging, user-friendly website for our neo... Read more</span>
                    </div>
                    <div>  
                        <div className='flex-col justify-center'>
                            <div className='mb-1'>
                                <Button color={'borderlessGray'}  className='w-full'>Edit Details</Button>  
                            </div>
                            <div>
                                <Button color={'borderlessGrayCancel'}  className='w-full'>Cancel Job</Button>   
                            </div>
                        </div> 
                    </div>
                </div>
                <div className='p-4 border border-gray-100'>
                    <div>
                        <span className='font-bold'>Project Details</span>    
                    </div>
                    <div className='flex justify-between my-2'>
                        <span>Price</span>
                        <span>2.22 ETH</span>
                    </div>
                    <div className='flex justify-between my-2'>
                        <span>Multiple Applicants</span>
                        <span>Enabled</span>
                    </div>
                    <div className='flex justify-between my-2'>
                        <span>Delivery Method</span>
                        <span>UPS</span>
                    </div>
                </div>
                <div className='p-4 border border-gray-100'>
                    <div>
                        <span className='font-bold'>Delivery Time</span>    
                    </div>
                    <div className='flex justify-between my-2'>
                        <span>PROGRESS BAR</span>
                    </div>
                    <div className='flex my-2'>
                        <span>Your project has not started yet</span>
                    </div>
                </div>
                <div className='p-4 border border-gray-100'>
                    <div>
                        <span className='font-bold'>Addresses</span>    
                    </div>
                    <div className='flex justify-between my-2'>
                        <span>Arbitrator Address</span>
                        <span>Worker Whitelist</span>
                    </div>
                    <div className='flex justify-between my-2'>
                        <span>Delivery Method</span>
                        <span>UPS</span>
                    </div>
                </div>
                <div className='p-4 border border-gray-100'>
                    <div>
                        <span className='font-bold'>Tags</span>    
                    </div>
                    <div className='flex justify-between my-2'>
                        <span>TAGS</span>
                    </div>
                </div>

            </div>
        </div>
    </Layout>
  );
};

export default JobInformationPage;
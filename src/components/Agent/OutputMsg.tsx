import { useState, FC } from 'react';
import Head from 'next/head';
import { Message } from '@/types';

export interface props {
    message: String;
}

export const OutputMsg: FC<props> = ({ message }) => {
  
  return (
    <div className="relative m-auto flex gap-4 px-4 text-base md:max-w-2xl md:gap-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
      <h2 className='text-gray-800 '>{message}</h2>
    </div>
  );
};

export default OutputMsg;

import React from 'react';
import { cn } from '../utils/cn';


function Container(props: React.HTMLProps<HTMLDivElement>) {
  return (
    <div {...props} className={ cn ('w-full bg-[#9dc5e6] border-0 rounded-xl flex py-4 shadow-sm', props.className)}/>


  )
}

export default Container;
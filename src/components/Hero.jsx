import React from 'react'
import Button from './Button'

export default function Hero() {
  return (
    <div className='min-h-screen flex flex-col gap-10 items-center justify-center text-center max-w-[800px] w-full mx-auto p-4'>
        <div className='flex flex-col gap-4'>
            <p>IT'S TIME TO GET</p>
            <h1 className='uppercase font-semibold text-4xl sm:text-5xl md:text-6xl lg:text-7xl'>Shred<span className='text-blue-400'>ded</span></h1>
        </div>
      <p className='text-sm md:text-base font-light'> <span className='text-blue-400 font-medium'>My abs</span> aren't visible yet, but <span className='text-blue-400 font-medium'>neither</span> are my excuses.</p>
      <Button func={() => {
        window.location.href = '#generate'
      }} text={"Accept and Begin"}></Button>
    </div>
  )
}
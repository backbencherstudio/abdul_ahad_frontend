import React from 'react'
import lineBg from '@/public/Image/linebg.png'

export default function LineStyle() {
    return (
        <>
            <div className='w-full bg-cover bg-center bg-no-repeat h-10' style={{ backgroundImage: `url(${lineBg.src})` }}>

            </div>
            <div className='w-full bg-cover bg-center bg-no-repeat h-10 -mt-1' style={{ backgroundImage: `url(${lineBg.src})` }}>

            </div>
        </>
    )
}

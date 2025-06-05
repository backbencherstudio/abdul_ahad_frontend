import React from 'react'
import LineBgIcon from '../Icon/LineBgIcon'
import Image from 'next/image'
import lineBg from '@/public/Image/linebg.png'

export default function LineStyle() {
    return (
        <>
            <div className='w-full bg-cover bg-center bg-no-repeat h-10' style={{ backgroundImage: `url(${lineBg.src})` }}>

            </div>
            <div className='w-full bg-cover bg-center bg-no-repeat h-10' style={{ backgroundImage: `url(${lineBg.src})` }}>

            </div>
        </>
    )
}
